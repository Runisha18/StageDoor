//This schema checks the data before it reaches MongoDB.

import { z } from "zod";

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),

  description: z
    .string()
    .min(1, "Description is required"),

  category: z
    .string()
    .min(1, "Category is required"),

  venueId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid venue ID"),

  dateTime: z.coerce.date(),

  price: z
    .number()
    .min(0, "Price cannot be negative"),

  posterUrl: z
    .union([z.string().url(), z.literal("")])
    .optional(),
});

/**title       → required
description → required
category    → required
venueId     → must look like a MongoDB ObjectId
dateTime    → must be a valid date
price       → cannot be negative
posterUrl   → optional, but if provided must be a URL */


export const updateEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters")
    .optional(),

  description: z
    .string()
    .min(1, "Description is required")
    .optional(),

  category: z
    .string()
    .min(1, "Category is required")
    .optional(),

  venueId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid venue ID")
    .optional(),

  dateTime: z
    .coerce
    .date()
    .optional(),

  price: z
    .number()
    .min(0, "Price cannot be negative")
    .optional(),

  posterUrl: z
    .union([
      z.string().url(),
      z.literal(""),
    ])
    .optional(),
});