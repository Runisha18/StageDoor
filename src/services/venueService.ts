import { connectToDatabase } from "@/lib/mongodb";
import Venue from "@/models/Venue";
import Event from "@/models/Event";

export async function createVenue(venueData: {
  name: string;
  address: string;
  city: string;
}) {
  await connectToDatabase();

  const venue = await Venue.create({
    name: venueData.name,
    address: venueData.address,
    city: venueData.city,
  });/**Mongoose takes this object:

name
address
city
and creates a document in MongoDB's venues collection. */

  return venue;
}

export async function updateVenue(
  venueId: string,
  venueData: {
    name?: string;
    address?: string;
    city?: string;
  }
) {
  await connectToDatabase();

  const venue = await Venue.findByIdAndUpdate(
    venueId,
    venueData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!venue) {
    throw new Error("Venue not found");
  }

  return venue;
}

export async function deleteVenue(venueId: string) {
  await connectToDatabase();

  const venue = await Venue.findById(venueId);

  if (!venue) {
    throw new Error("Venue not found");
  }

  const eventUsingVenue = await Event.findOne({
    venueId,
  });

  if (eventUsingVenue) {
    throw new Error(
      "Cannot delete venue because it is being used by an event"
    );
  }

  await Venue.findByIdAndDelete(venueId);

  return venue;
}

export async function getVenues() {
  await connectToDatabase();

  const venues = await Venue.find().sort({ createdAt: -1 });

  return venues;
}