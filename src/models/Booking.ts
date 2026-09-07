import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBooking extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  seatIds: Types.ObjectId[];//multiple booking together for one user
  totalAmount: number;
  status: "confirmed" | "cancelled";
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    seatIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Seat",
        required: true,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);