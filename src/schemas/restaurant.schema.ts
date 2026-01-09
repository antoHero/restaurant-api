
import { z } from 'zod';

// Regex for HH:mm time format
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100),
    openingTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
    closingTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
    totalTables: z.number().int().min(1),
  })
});

export const getRestaurantSchema = z.object({
  params: z.object({
    slug: z.string(),
  }),
  query: z.object({
    includeTables: z.string().optional()
  }).optional()
});

export const getRestaurantsSchema = z.object({
    query: z.object({
        sort_dir: z.enum(['desc', 'asc']).optional(),
        limit: z.coerce.number().int().min(1).optional()
    })
})

export const addTableSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Restaurant ID must be a numeric string"),
  }),
  body: z.object({
    restaurantId: z.number().int(),
    tableNumber: z.number().int().min(1, "Table number must be at least 1"),
    capacity: z.number().int().min(1, "Capacity must be at least 1 person"),
  })
});

export const createReservationSchema = z.object({
  body: z.object({
    restaurantId: z.number().int(),
    tableId: z.number().int(),
    customerName: z.string().min(1, "Customer name is required"),
    phone: z.string().min(10, "Phone number is too short"),
    partySize: z.number().int().min(1),
    startDateTime: z.string().datetime(),
    durationMinutes: z.number().int().min(15).max(240).default(90),
  })
});
