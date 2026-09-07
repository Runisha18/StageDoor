import { z } from "zod";

export const createSeatsSchema = z.object({
  eventId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid event ID"),

  rows: z
    .array(z.string().min(1))
    .min(1, "At least one row is required"),

  seatsPerRow: z
    .number()
    .int()
    .min(1, "At least one seat is required")
    .max(50, "Maximum 50 seats per row"),
});