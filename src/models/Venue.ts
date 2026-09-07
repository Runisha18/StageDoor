/**Venue model

Before we create it, think about why we need a separate Venue.

An event might be:

Avengers Movie Screening

and the venue might be:

INOX South City, Kolkata

We don't want to repeatedly store the entire venue information inside every event.*/

import mongoose, { Schema, Document } from "mongoose";

export interface IVenue extends Document {
  name: string;
  address: string;
  city: string; //We'll use city later for event filtering.
}

const VenueSchema = new Schema<IVenue>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Venue ||
  mongoose.model<IVenue>("Venue", VenueSchema);