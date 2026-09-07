import { z } from "zod";

export const createVenueSchema = z.object({
  name: z
    .string()
    .min(1, "Venue name is required")
    .max(100, "Venue name must be at most 100 characters"),

  address: z
    .string()
    .min(1, "Address is required"),

  city: z
    .string()
    .min(1, "City is required")
    .max(50, "City must be at most 50 characters"),
});
/**This means a venue must have:

name
address
city */
/**Why validate venues too?

Because validation shouldn't exist only for events. Every API accepting user-provided data should validate its input. */

export const updateVenueSchema = z.object({
  name: z
    .string()
    .min(1, "Venue name is required")
    .max(100, "Venue name must be at most 100 characters")
    .optional(),

  address: z
    .string()
    .min(1, "Address is required")
    .optional(),

  city: z
    .string()
    .min(1, "City is required")
    .max(50, "City must be at most 50 characters")
    .optional(),
});