import { Op, where } from "sequelize";
import {
  Restaurant,
  Reservation,
  Table,
  sequelize,
  Waitlist,
} from "../models/index.js";

const sendNotification = (
  type: "SMS" | "Email",
  to: string,
  message: string
) => {
  console.log(`\n--- MOCK ${type} SENT ---`);
  console.log(`To: ${to}`);
  console.log(`Message: ${message}`);
  console.log(`-------------------------\n`);
};

const isWithinOperatingHours = (
  dateTime: Date,
  durationMinutes: number,
  opening: string,
  closing: string
) => {
  // Convert current time of day to minutes
  const startMinutes = dateTime.getUTCHours() * 60 + dateTime.getUTCMinutes();
  const endMinutes = startMinutes + durationMinutes;

  const [openH, openM] = opening.split(":").map(Number);
  const [closeH, closeM] = closing.split(":").map(Number);

  const openingTimeInMinutes = openH * 60 + openM;
  const closingTimeInMinutes = closeH * 60 + closeM;

  return (
    startMinutes >= openingTimeInMinutes && endMinutes <= closingTimeInMinutes
  );
};

const generateUniqueReference = async () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "RES-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Ensures the generated reference is unique in the database
 */
const getUniqueReference = async (): Promise<string> => {
  let ref = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    ref = await generateUniqueReference();
    const existing = await Reservation.findOne({
      where: { uniqueReference: ref },
    });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  return ref;
};

const handlePeakHours = (dateTime: Date, requestedDuration: number): number => {
  const hour = dateTime.getUTCHours();
  // Peak hours: 6 PM to 9 PM (18:00 - 21:00)
  if (hour >= 18 && hour <= 21) {
    const maxPeakDuration = 90;
    if (requestedDuration > maxPeakDuration) {
      console.log(
        `Peak hour detected. Capping duration at ${maxPeakDuration} minutes.`
      );
      return maxPeakDuration;
    }
  }
  return requestedDuration;
};

export const createReservation = async (req: any, res: any) => {
  // #swagger.tags = ['Reservation']
  const t = await sequelize.transaction();
  try {
    const { slug, customerName, phone, partySize, startDateTime } = req.body;

    let { durationMinutes = 90 } = req.body;

    const restaurant = await Restaurant.findOne({
      where: { slug },
      include: [{ model: Table, as: "tables" }],
    });

    if (!restaurant) {
      await t.rollback();
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const start = new Date(startDateTime);

    if (start < new Date()) {
      await t.rollback();
      return res.status(400).json({
        error: "Cannot create a reservation for a past date or time.",
      });
    }

    durationMinutes = handlePeakHours(start, durationMinutes);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    const existingUserBookings = await Reservation.findAll({
      where: {
        phone,
        restaurantId: restaurant.id,
        status: "confirmed",
      },
    });

    const hasUserConflict = existingUserBookings.some((r: any) => {
      const rStart = new Date(r.startDateTime);
      const rEnd = new Date(rStart.getTime() + r.durationMinutes * 60000);
      return start < rEnd && end > rStart;
    });

    if (hasUserConflict) {
      await t.rollback();
      return res.status(400).json({
        error:
          "Double booking detected: You already have a confirmed reservation during this time slot.",
      });
    }

    if (
      !isWithinOperatingHours(
        start,
        durationMinutes,
        restaurant.openingTime,
        restaurant.closingTime
      )
    ) {
      await t.rollback();
      return res.status(400).json({
        error: `Reservation exceeds operating hours (${restaurant.openingTime} - ${restaurant.closingTime}). Please choose an earlier time or shorter duration.`,
      });
    }

    // Find suitable tables (Capacity >= Party Size)
    const suitableTables = (restaurant as any).tables
      .filter((t: any) => t.capacity >= partySize)
      .sort((a: any, b: any) => a.capacity - b.capacity);

    if (suitableTables.length === 0) {
      return res
        .status(400)
        .json({ error: "No tables can accommodate this party size" });
    }

    let assignedTableId = null;

    for (const table of suitableTables) {
      // (RequestStart < ExistingEnd) AND (RequestEnd > ExistingStart)
      const existingReservations = await Reservation.findAll({
        where: {
          tableId: table.id,
          status: { [Op.ne]: "cancelled" },
        },
      });
      const isOverlapping = existingReservations.some((r: Reservation) => {
        const rStart = new Date(r.startDateTime);
        const rEnd = new Date(rStart.getTime() + r.durationMinutes * 60000);
        return start < rEnd && end > rStart;
      });

      if (!isOverlapping) {
        assignedTableId = table.id;
        break;
      }
    }

    if (!assignedTableId) {
      await t.rollback();
      return res.status(409).json({
        error: "No tables available for the selected time slot",
        suggestion: "Would you like to join our waitlist?",
        canWaitlist: true,
      });
    }

    const uniqueReference = await getUniqueReference();

    const reservation = await Reservation.create(
      {
        restaurantId: restaurant.id,
        tableId: assignedTableId,
        uniqueReference,
        customerName,
        phone,
        partySize,
        startDateTime: start,
        durationMinutes,
        status: "confirmed",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        transaction: t,
      }
    );
    await t.commit();

    sendNotification(
      "SMS",
      phone,
      `Hi ${customerName}, your booking at ${restaurant.name} is CONFIRMED. Ref: ${uniqueReference}`
    );

    return res.status(201).json({ data: reservation });
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: error.message });
  }
};

export const checkAvailability = async (req: any, res: any) => {
  // #swagger.tags = ['Reservation']
  try {
    const { slug, partySize, startDateTime, durationMinutes = 90 } = req.query;
    const restaurant = await Restaurant.findOne({
      where: { slug },
      include: [{ model: Table, as: "tables" }],
    });
    if (!restaurant)
      return res.status(404).json({ error: "Restaurant not found" });

    const start = new Date(startDateTime as string);
    const duration = Number(durationMinutes);
    const end = new Date(start.getTime() + duration * 60000);

    if (
      !isWithinOperatingHours(
        start,
        duration,
        restaurant.openingTime,
        restaurant.closingTime
      )
    ) {
      return res.json({ available: false, reason: "Outside operating hours" });
    }

    const suitableTables = (restaurant as any).tables.filter(
      (t: any) => t.capacity >= Number(partySize)
    );
    let availableTable = null;

    for (const table of suitableTables) {
      const allRes = await Reservation.findAll({
        where: {
          tableId: table.id,
          status: { [Op.ne]: "cancelled" },
        },
      });

      const conflict = allRes.some((r: any) => {
        const rStart = new Date(r.startDateTime);
        const rEnd = new Date(rStart.getTime() + r.durationMinutes * 60000);
        return start < rEnd && end > rStart;
      });

      if (!conflict) {
        availableTable = table;
        break;
      }
    }

    return res.json({
      available: !!availableTable,
      table: availableTable,
      message: availableTable
        ? "Table is free"
        : "No tables free for this party size",
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Internal helper to find if any table is available for a specific slot
 */
const findAvailableTable = async (
  restaurantId: number,
  start: Date,
  durationMinutes: number,
  partySize: number
) => {
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const suitableTables = await Table.findAll({
    where: {
      restaurantId,
      capacity: { [Op.gte]: partySize },
    },
    order: [["capacity", "ASC"]],
  });

  for (const table of suitableTables) {
    const overlapping = await Reservation.findOne({
      where: {
        tableId: table.id,
        [Op.or]: [
          {
            startDateTime: { [Op.lt]: end },
            [Op.and]: [
              sequelize.literal(
                `datetime(startDateTime, '+' || durationMinutes || ' minutes') > '${start.toISOString()}'`
              ),
            ],
          },
        ],
      },
    });

    // Fallback for overlapping check if literal is complex in certain sqlite versions
    // For simplicity in this demo, we'll fetch and filter
    const allTableReservations = await Reservation.findAll({
      where: { tableId: table.id },
    });
    const isActuallyOverlapping = allTableReservations.some(
      (r: Reservation) => {
        const rStart = new Date(r.startDateTime);
        const rEnd = new Date(rStart.getTime() + r.durationMinutes * 60000);
        return start < rEnd && end > rStart;
      }
    );

    if (!isActuallyOverlapping) return table;
  }
  return null;
};

export const getAvailableSlots = async (req: any, res: any) => {
  // #swagger.tags = ['Reservation']
  try {
    const { slug, partySize, date } = req.query;
    const restaurant = await Restaurant.findOne({
      where: { slug },
      include: [{ model: Table, as: "tables" }],
    });

    if (!restaurant)
      return res.status(404).json({ error: "Restaurant not found" });

    const durationMinutes = 90;
    const intervalMinutes = 30;

    const [openH, openM] = restaurant.openingTime.split(":").map(Number);
    const [closeH, closeM] = restaurant.closingTime.split(":").map(Number);

    const startOfDay = new Date(`${date}T00:00:00Z`);
    const openingTime = new Date(startOfDay);
    openingTime.setUTCHours(openH, openM, 0, 0);
    const closingTime = new Date(startOfDay);
    closingTime.setUTCHours(closeH, closeM, 0, 0);

    const now = new Date();
    let searchStart = new Date(openingTime);

    // Boundary check: If user checks for today, start from now
    const isToday =
      now.getUTCFullYear() === startOfDay.getUTCFullYear() &&
      now.getUTCMonth() === startOfDay.getUTCMonth() &&
      now.getUTCDate() === startOfDay.getUTCDate();

    if (isToday && now > searchStart) {
      searchStart = new Date(now);
      const roundedMins =
        Math.ceil(searchStart.getUTCMinutes() / intervalMinutes) *
        intervalMinutes;
      searchStart.setUTCMinutes(roundedMins, 0, 0);
    }

    if (searchStart >= closingTime)
      return res.json({
        date,
        slots: [],
        message: "Restaurant is closed for the day.",
      });

    const suitableTables = (restaurant as any).tables.filter(
      (t: any) => t.capacity >= Number(partySize)
    );
    if (suitableTables.length === 0)
      return res.json({
        date,
        slots: [],
        message: "No tables available for this party size.",
      });

    const dayReservations = await Reservation.findAll({
      where: {
        restaurantId: restaurant.id,
        status: "confirmed",
        startDateTime: {
          [Op.between]: [
            new Date(openingTime.getTime() - 240 * 60000),
            new Date(closingTime.getTime() + 240 * 60000),
          ],
        },
      },
    });

    const slots = [];
    let current = new Date(searchStart);

    while (
      current.getTime() + durationMinutes * 60000 <=
      closingTime.getTime()
    ) {
      const slotEnd = new Date(current.getTime() + durationMinutes * 60000);
      const isAvailable = suitableTables.some((table: any) => {
        const tableRes = dayReservations.filter((r) => r.tableId === table.id);
        return !tableRes.some((r: any) => {
          const rs = new Date(r.startDateTime);
          const re = new Date(rs.getTime() + r.durationMinutes * 60000);
          return current < re && slotEnd > rs;
        });
      });

      if (isAvailable) slots.push(current.toISOString());
      current = new Date(current.getTime() + intervalMinutes * 60000);
    }

    return res.json({ date, partySize, slots });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getReservationsByDate = async (req: any, res: any) => {
  // #swagger.tags = ['Reservation']
  try {
    const { date, slug } = req.params; // Expects YYYY-MM-DD

    const startDate = new Date(`${date}T00:00:00Z`);
    const endDate = new Date(`${date}T23:59:59Z`);

    const restaurant = await Restaurant.findOne({
      where: {
        slug,
      },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }

    const reservations = await Reservation.findAll({
      where: {
        restaurantId: restaurant.id,
        startDateTime: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [{ model: Table, as: "table" }],
    });

    return res.json(reservations);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getReservationsByUniqueReference = async (req: any, res: any) => {
  // #swagger.tags = ['Reservation']
  try {
    const { reference } = req.query;
    const { slug } = req.params;

    const restaurant = await Restaurant.findOne({
      where: {
        slug,
      },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }

    const reservation = await Reservation.findOne({
      where: {
        uniqueReference: reference,
        restaurantId: restaurant.id,
      },
      include: [{ model: Table, as: "table" }],
    });

    return res.json({ data: reservation });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const cancelReservation = async (req: any, res: any) => {
  // #swagger.tags = ['Reservation']
  const t = await sequelize.transaction();
  try {
    const { reference } = req.params;
    const reservation = await Reservation.findOne({
      where: { uniqueReference: reference },
    });
    if (!reservation) {
      await t.rollback();
      return res.status(404).json({ error: "Reservation not found" });
    }
    reservation.status = "cancelled";
    await reservation.save({ transaction: t });
    await t.commit();
    return res.json({ message: "Reservation cancelled" });
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: error.message });
  }
};

export const modifyReservation = async (req: any, res: any) => {
  // #swagger.tags = ['Reservation']
  const t = await sequelize.transaction();
  try {
    const { reference } = req.params;
    const { startDateTime, partySize, durationMinutes } = req.body;
    const reservation = await Reservation.findOne({
      where: { uniqueReference: reference },
      include: [{ model: Restaurant, as: "restaurant" }],
    });
    if (!reservation) {
      await t.rollback();
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (reservation.status === "cancelled") {
      await t.rollback();
      return res.status(400).json({
        error: "You cannot modify a cancelled reservation. Book another one!",
      });
    }
    const newStart = startDateTime
      ? new Date(startDateTime)
      : new Date(reservation.startDateTime);
    const newSize = partySize || reservation.partySize;
    const newDuration = durationMinutes || reservation.durationMinutes;
    const restaurant = await Restaurant.findByPk(reservation.restaurantId, {
      include: [{ model: Table, as: "tables" }],
    });
    const suitableTables = (restaurant as any).tables
      .filter((t: any) => t.capacity >= newSize)
      .sort((a: any, b: any) => a.capacity - b.capacity);
    let assignedTableId = null;
    const end = new Date(newStart.getTime() + newDuration * 60000);
    for (const table of suitableTables) {
      const existing = await Reservation.findAll({
        where: {
          tableId: table.id,
          status: { [Op.ne]: "cancelled" },
          id: { [Op.ne]: reservation.id },
        },
      });
      if (
        !existing.some((r: any) => {
          const rs = new Date(r.startDateTime);
          const re = new Date(rs.getTime() + r.durationMinutes * 60000);
          return newStart < re && end > rs;
        })
      ) {
        assignedTableId = table.id;
        break;
      }
    }
    if (!assignedTableId) {
      await t.rollback();
      return res.status(400).json({ error: "No tables available" });
    }
    await reservation.update(
      {
        startDateTime: newStart,
        partySize: newSize,
        durationMinutes: newDuration,
        tableId: assignedTableId,
      },
      { transaction: t }
    );
    await t.commit();
    return res.json({ data: reservation });
  } catch (error: any) {
    if (t) await t.rollback();
    return res.status(500).json({ error: error.message });
  }
};

export const joinWaitlist = async (req: any, res: any) => {
  // #swagger.tags = ['Reservation']
  const t = await sequelize.transaction();
  try {
    const { slug, customerName, phone, partySize, preferredDateTime } =
      req.body;
    const restaurant = await Restaurant.findOne({ where: { slug } });
    if (!restaurant) {
      await t.rollback();
      return res.status(404).json({ error: "Restaurant not found" });
    }
    const waitlist = await Waitlist.create(
      {
        restaurantId: restaurant.id,
        customerName,
        phone,
        partySize,
        preferredDateTime: new Date(preferredDateTime),
      },
      { transaction: t }
    );
    await t.commit();
    return res.status(201).json({ data: waitlist });
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ error: error.message });
  }
};
