/**4. Seat Model 💺

The assignment specifically requires:

Visual seat selection
Seat availability
Booking seats
Preventing double booking

So we need to model seats properly. */

import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISeat extends Document {
  eventId: Types.ObjectId;
  seatNumber: string;
  row: string;
  status: "available" | "booked";
}

const SeatSchema = new Schema<ISeat>(
  {
    eventId: {  /**This establishes:Seat ──────→ Event .So if we retrieve an event, we can find all seats belonging to it. */
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    seatNumber: {
      type: String, //We're storing it as a string because A1 isn't a number.
      required: true,
      trim: true,
    },

    row: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["available", "booked"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

SeatSchema.index(
  { eventId: 1, seatNumber: 1 },
  { unique: true }
);
//This creates a compound unique index.For a particular event, a seat number can exist only once.

export default mongoose.models.Seat ||
  mongoose.model<ISeat>("Seat", SeatSchema);