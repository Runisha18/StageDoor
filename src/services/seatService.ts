import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import Seat from "@/models/Seat";

export async function createSeats(seatData: {
  eventId: string;
  rows: string[];
  seatsPerRow: number;
}) {
  await connectToDatabase(); //connect to db

  // Check that the event exists
  const event = await Event.findById(seatData.eventId);//Make sure the event exists

  if (!event) {
    throw new Error("Event not found");//We stop instead of creating orphan seats.
  }

  const seats = [];//We'll build all the seat objects inside this array.

  for (const row of seatData.rows) {
    for (let number = 1; number <= seatData.seatsPerRow; number++) {
      seats.push({
        eventId: seatData.eventId,
        seatNumber: `${row}${number}`,
        row,
        status: "available", //That's important because nobody has booked these seats yet.
      });
    }
  }

  const createdSeats = await Seat.insertMany(seats); //Insert everything into MongoDB

  return createdSeats;
}

export async function getSeatsByEvent(eventId: string) {
  await connectToDatabase();

  const seats = await Seat.find({
    eventId,
  }).sort({
    row: 1,
    seatNumber: 1,
  });

  return seats;
}/**1. Connect to MongoDB
2. Find seats belonging to this event
3. Sort them by row and seat number */