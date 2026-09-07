import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  category: string;
  venueId: Types.ObjectId; //This tells TypeScript:venueId will contain a MongoDB ObjectId.
  dateTime: Date;
  price: number;
  posterUrl?: string; //means the poster URL is optional.An event can exist without a poster.
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    venueId: {
      type: Schema.Types.ObjectId, //means this field stores a MongoDB ObjectId.
      ref: "Venue", //tells Mongoose: This ObjectId refers to a document in the Venue model.
      required: true,
    },

    dateTime: {
      type: Date,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    posterUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Event ||
  mongoose.model<IEvent>("Event", EventSchema);