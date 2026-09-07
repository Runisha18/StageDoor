import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import Venue from "@/models/Venue";
import Seat from "@/models/Seat";
import Booking from "@/models/Booking";

export async function getAllEvents(filters?: {
  search?: string;
  category?: string;
  city?: string;
}) {
  await connectToDatabase();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      {
        title: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: filters.search,
          $options: "i",
        },
      },
    ];
  }

  if (filters?.category) {
    query.category = {
      $regex: `^${filters.category}$`,
      $options: "i",
    };
  }

  let events = await Event.find(query)
    .populate("venueId")
    .sort({ dateTime: 1 });

  if (filters?.city) {
    const city = filters.city.toLowerCase();

    events = events.filter(
      (event) =>
        event.venueId &&
        typeof event.venueId === "object" &&
        "city" in event.venueId &&
        typeof event.venueId.city === "string" &&
        event.venueId.city.toLowerCase() === city
    );
  }

  return events;
}

export async function createEvent(eventData: {
  title: string;
  description: string;
  category: string;
  venueId: string;
  dateTime: Date;
  price: number;
  posterUrl?: string;
}) {
  await connectToDatabase();

  const event = await Event.create({
    title: eventData.title,
    description: eventData.description,
    category: eventData.category,
    venueId: eventData.venueId,
    dateTime: eventData.dateTime,
    price: eventData.price,
    posterUrl: eventData.posterUrl,
  });

  return event;
}

export async function getEventById(eventId: string) {
  await connectToDatabase();

  const event = await Event.findById(eventId).populate({
    path: "venueId",
    model: Venue,
  });

  if (!event) {
    throw new Error("Event not found");
  }

  return event;
}

export async function updateEvent(
  eventId: string,
  eventData: {
    title?: string;
    description?: string;
    category?: string;
    venueId?: string;
    dateTime?: Date;
    price?: number;
    posterUrl?: string;
  }
) {
  await connectToDatabase();

  const event = await Event.findByIdAndUpdate(
    eventId,
    eventData,
    {
      new: true,
      runValidators: true,
    }
  ).populate("venueId");

  if (!event) {
    throw new Error("Event not found");
  }

  return event;
}

export async function deleteEvent(eventId: string) {
  await connectToDatabase();

  // First check whether the event exists.
  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  // Do not delete an event that already has bookings.
  // Otherwise, existing bookings would contain a reference
  // to an event that no longer exists.
  const existingBooking = await Booking.findOne({
    eventId,
  });

  if (existingBooking) {
    throw new Error(
      "Cannot delete event because it has bookings"
    );
  }

  // The event has no bookings, so its seats can safely be deleted.
  await Seat.deleteMany({
    eventId,
  });

  // Finally delete the event itself.
  await Event.findByIdAndDelete(eventId);

  return event;
}