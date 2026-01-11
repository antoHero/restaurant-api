import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Regex for YYYY-MM-DD data format
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createReservationSchema = z.object({
  body: z.object({
    slug: z.string(),
    // tableId: z.number().int(),
    customerName: z.string().min(1, 'Customer name is required'),
    phone: z.string().min(10, 'Phone number is too short'),
    partySize: z.number().int().min(1),
    startDateTime: z.string().datetime(),
    durationMinutes: z.number().int().min(15).max(240).default(90),
  }),
});

export const checkAvailabilitySchema = z.object({
  query: z.object({
    slug: z.string().min(1, 'Restaurant slug is required'),
    partySize: z.string().regex(/^\d+$/).transform(Number),
    startDateTime: z.string().datetime(),
    durationMinutes: z
      .string()
      .regex(/^\d+$/)
      .optional()
      .transform((v) => (v ? Number(v) : 90)),
  }),
});

export const getAvailableSlotsSchema = z.object({
  query: z.object({
    slug: z.string().min(1, 'Restaurant slug is required'),
    partySize: z.string().regex(/^\d+$/).transform(Number),
    date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
  }),
});

export const getReservationsByDateSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Restaurant slug is required'),
    date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
  }),
});

export const getReservationsByReferenceSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Restaurant slug is required'),
  }),
  query: z.object({
    reference: z.string().min(1, 'The reservation reference is required'),
  }),
});

export const cancelReservationSchema = z.object({
  params: z.object({
    reference: z.string().min(1, "Reference is required"),
  })
});

export const modifyReservationSchema = z.object({
  params: z.object({
    reference: z.string().min(1, "Reference is required"),
  }),
  body: z.object({
    startDateTime: z.string().datetime().optional(),
    partySize: z.number().int().min(1).optional(),
    durationMinutes: z.number().int().min(15).max(240).optional(),
  })
});
