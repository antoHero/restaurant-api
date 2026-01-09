import { Request, Response } from "express";
import slugify from "slugify";
import sequelize from "../config/database";
import { Restaurant, Table } from "../models";

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

    const slug = slugify(name, {
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
  try {
    const { slug } = req.params;

    const restaurant = await Restaurant.findOne({ where: { slug: slug } });
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
