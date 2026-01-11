import { Request, Response } from "express";
import slugify from "slugify";
import sequelize from "../config/database.js";
import { Restaurant, Table, Reservation } from '../models/index.js';
import { Op } from "sequelize";

export const createRestaurant = async (req: Request, res: Response) => {
  // #swagger.tags = ['Restaurant']
  const t = await sequelize.transaction();
  try {
    const { name, openingTime, closingTime, totalTables } = req.body;

    if (!name || !openingTime || !closingTime) {
      return res.status(400).json({
        error: "Missing required fields: name, openingTime, closingTime",
      });
    }

    const whereToEat = await Restaurant.findOne({ where: { name: name } });

    if (whereToEat) {
      return res
        .status(400)
        .json({ message: "This restaurant already exists" });
    }

    const slug = slugify.default(name, {
      lower: true,
    });

    const restaurant = await Restaurant.create(
      {
        name,
        slug,
        openingTime,
        closingTime,
        totalTables,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        transaction: t,
      }
    );

    if (totalTables && typeof totalTables === "number" && totalTables > 0) {
      const tablesData = Array.from({ length: totalTables }, (_, i) => ({
        restaurantId: restaurant.id,
        tableNumber: i + 1,
        capacity: i % 2 === 0 ? 2 : 4, // Simple alternating capacity logic
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await Table.bulkCreate(tablesData, { transaction: t });
    }

    const result = await Restaurant.findByPk(restaurant.id, {
      include: [{ model: Table, as: "tables" }],
    });

    await t.commit();

    return res
      .status(201)
      .json({ message: "The restaurant has been created", data: restaurant });
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: error.message });
  }
};

export const getRestaurants = async (req: Request, res: Response) => {
  // #swagger.tags = ['Restaurant']
  try {
    const { sort_dir, limit } = req.query;
    let sortDirection: "asc" | "desc" = "desc";
    if (
      typeof sort_dir === "string" &&
      (sort_dir.toLowerCase() === "asc" || sort_dir.toLowerCase() === "desc")
    ) {
      sortDirection = sort_dir.toLowerCase() as "asc" | "desc";
    }

    let fetchLimit: number | undefined = undefined;
    if (typeof limit === "string" && !isNaN(Number(limit))) {
      fetchLimit = Number(limit);
    }

    const restaurants = await Restaurant.findAll({
      order: [["createdAt", sortDirection]],
      ...(fetchLimit ? { limit: fetchLimit } : {}),
    });
    return res.status(200).json({ data: restaurants });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getRestaurant = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { includeTables } = req.query;

    const findOptions: any = {
      where: { slug },
    };

    if (includeTables === "true") {
      findOptions.include = [{ model: Table, as: "tables" }];
    }

    const restaurant = await Restaurant.findOne(findOptions);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    return res.status(200).json({ data: restaurant });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getRestaurantTables = async (req: Request, res: Response) => {
  // #swagger.tags = ['Restaurant']
  try {
    const { slug } = req.params;

    const restaurant = await Restaurant.findOne({ where: { slug } });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const tables = await Table.findAll({
      where: { restaurantId: restaurant.id },
      order: [["tableNumber", "ASC"]],
    });

    return res.status(200).json({ data: tables });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAvailableTables = async (req: any, res: any) => {
  // #swagger.tags = ['Restaurant']
  try {
    const { slug } = req.params;
    const { date, time, partySize } = req.query;

    const restaurant = await Restaurant.findOne({ where: { slug } });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Determine target check time
    let checkStart: Date;
    if (date && time) {
      checkStart = new Date(`${date}T${time}:00Z`);
    } else if (date) {
      // If only date is passed, check opening time or start of day
      checkStart = new Date(`${date}T${restaurant.openingTime}:00Z`);
    } else {
      // Default to now
      checkStart = new Date();
    }

    const durationMinutes = 90; // Standard booking window
    const checkEnd = new Date(checkStart.getTime() + durationMinutes * 60000);

    // 1. Get all tables that match party size
    const whereClause: any = { restaurantId: restaurant.id };
    if (partySize) {
      whereClause.capacity = { [Op.gte]: partySize };
    }

    const allTables = await Table.findAll({ where: whereClause });

    // 2. Find tables with overlapping reservations
    const overlappingReservations = await Reservation.findAll({
      where: {
        restaurantId: restaurant.id,
        [Op.or]: [
          {
            startDateTime: { [Op.lt]: checkEnd },
            // Logic: Reservation End > Check Start
            // For simplicity, we filter in JS to handle dynamic durations accurately
          },
        ],
      },
    });

    // 3. Filter tables
    const availableTables = allTables.filter((table) => {
      const isBooked = overlappingReservations.some((res) => {
        if (res.tableId !== table.id) return false;
        const resStart = new Date(res.startDateTime);
        const resEnd = new Date(
          resStart.getTime() + res.durationMinutes * 60000
        );
        return checkStart < resEnd && checkEnd > resStart;
      });
      return !isBooked;
    });

    return res.json({
      checkTime: checkStart.toISOString(),
      durationMinutes,
      tables: availableTables,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Add a table to a restaurant by SLUG
 */
export const addTable = async (req: any, res: any) => {
  // #swagger.tags = ['Restaurant']

  const t = await sequelize.transaction();
  try {
    const { slug } = req.params;
    const { tableNumber, capacity } = req.body;

    const restaurant = await Restaurant.findOne({ where: { slug } });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const tables = await Table.findAll({
      where: { restaurantId: restaurant.id },
    });

    // should not be able to add another table if tables contain up to number of totalTables the restaurant have
    if (
      tables.length === restaurant.totalTables ||
      tables.length > restaurant.totalTables
    ) {
      return res
        .status(400)
        .json({ error: "Restaurant already has total tables" });
    }

    const tableNo = tables.find((table) => table.tableNumber === tableNumber);

    if (tableNo) {
      return res
        .status(400)
        .json({ error: "You have already created this table" });
    }

    const table = await Table.create(
      {
        restaurantId: restaurant.id,
        tableNumber,
        capacity,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        transaction: t,
      }
    );
    await t.commit();
    return res.status(201).json({ data: table });
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: error.message });
  }
};
