import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import Seat from "@/models/Seat";
import Booking from "@/models/Booking";
import User from "@/models/User";

export async function createBooking(
  firebaseUid: string,
  bookingData: {
    eventId: string;
    seatIds: string[];
  }
) {
  await connectToDatabase();

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Find the user
    const user = await User.findOne({
      firebaseUid,
    }).session(session);

    if (!user) {
      throw new Error("User not found");
    }

    // 2. Find the event
    const event = await Event.findById(
      bookingData.eventId
    ).session(session);

    if (!event) {
      throw new Error("Event not found");
    }

    // 3. Make sure at least one seat was selected
    if (bookingData.seatIds.length === 0) {
      throw new Error("No seats selected");
    }

    // 4. Reserve each seat atomically
    const reservedSeats = [];

    for (const seatId of bookingData.seatIds) {
      const seat = await Seat.findOneAndUpdate(
        {
          _id: seatId,
          eventId: bookingData.eventId,
          status: "available",
        },
        {
          status: "booked",
        },
        {
          new: true,
          session,
        }
      );

      if (!seat) {
        throw new Error(`Seat ${seatId} is not available`);
      }

      reservedSeats.push(seat);
    }

    // 5. Calculate total amount on the server
    const totalAmount =
      event.price * reservedSeats.length;

    // 6. Create the booking
    const booking = await Booking.create(
      [
        {
          userId: user._id,
          eventId: event._id,
          seatIds: reservedSeats.map(
            (seat) => seat._id
          ),
          totalAmount,
          status: "confirmed",
        },
      ],
      { session }
    );

    // 7. Commit the transaction
    await session.commitTransaction();

    return booking[0];
  } catch (error) {
    // 8. Roll back everything if anything fails
    await session.abortTransaction();

    throw error;
  } finally {
    // 9. Close the session
    session.endSession();
  }
}
export async function getUserBookings(firebaseUid: string) {
  await connectToDatabase();

  const user = await User.findOne({
    firebaseUid, //We find the MongoDB user using the verified Firebase UID.
  });

  if (!user) {
    throw new Error("User not found");
  }

  const bookings = await Booking.find({
    userId: user._id,
  })//Give me bookings where userId matches this authenticated user.
    .populate("eventId")/**populate() tells Mongoose:

"Also fetch the actual Event and Seat documents referenced by these IDs */
    .populate("seatIds")
    .sort({ createdAt: -1 });//decending order

  return bookings;
}

export async function cancelBooking(
  firebaseUid: string,
  bookingId: string
) {
  await connectToDatabase();

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = await User.findOne({
      firebaseUid,
    }).session(session);//First we authenticate the user through the existing firebaseUid

    if (!user) {
      throw new Error("User not found");
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: user._id,
      status: "confirmed",
    }).session(session);/**We're checking three things:

Does this booking exist?
Does it belong to this user?
Is it still confirmed? */

    if (!booking) {
      throw new Error(
        "Booking not found or already cancelled"
      );
    }

    booking.status = "cancelled";//We don't delete the booking.
    await booking.save({ session });

    await Seat.updateMany( //release seats
      {
        _id: { $in: booking.seatIds },
        eventId: booking.eventId,
      },
      {
        $set: {
          status: "available",
        },
      },
      { session }
    );

    await session.commitTransaction();

    return booking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function getAllBookings() {
  await connectToDatabase();

  const bookings = await Booking.find()
    .populate("userId")
    .populate("eventId")
    .populate("seatIds")
    .sort({ createdAt: -1 });

  return bookings;
}