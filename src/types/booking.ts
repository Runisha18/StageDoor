import { z } from "zod";

export const createBookingSchema = z.object({
  eventId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid event ID"),

  seatIds: z
    .array(
      z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid seat ID")
    )
    .min(1, "At least one seat must be selected"),
});