"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

interface Venue {
  _id: string;
  name: string;
  address: string;
  city: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  venueId: Venue;
  dateTime: string;
  price: number;
  posterUrl?: string;
}

interface Seat {
  _id: string;
  eventId: string;
  seatNumber: string;
  row: string;
  status: "available" | "booked";
}

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const router = useRouter();
  

  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [seatsLoading, setSeatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch event"
          );
        }

        setEvent(data.event);
      } catch (error) {
        console.error(error);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    const fetchSeats = async () => {
      try {
        const response = await fetch(
          `/api/events/${eventId}/seats`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch seats"
          );
        }

        setSeats(data.seats);
      } catch (error) {
        console.error(error);
      } finally {
        setSeatsLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
      fetchSeats();
    }
  }, [eventId]);

  const toggleSeat = (seat: Seat) => {
    if (seat.status === "booked") {
      return;
    }

    setSelectedSeats((current) => {
      if (current.includes(seat._id)) {
        return current.filter((id) => id !== seat._id);
      }

      return [...current, seat._id];
    });
  };

  const handleBooking = () => {
  const user = auth.currentUser;

  if (selectedSeats.length === 0) {
    setBookingMessage("Please select at least one seat.");
    return;
  }

  if (!user) {
    setBookingMessage(
      "You are not logged in or registered. Please login or register to book your selected seats."
    );
    return;
  }

  router.push(
    `/checkout?eventId=${eventId}&seats=${encodeURIComponent(
      selectedSeats.join(",")
    )}`
  );
};

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white p-8 shadow">
          <p className="text-gray-600">
            Loading event...
          </p>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <div className="text-5xl">🎭</div>

          <h1 className="mt-4 text-2xl font-bold">
            Event unavailable
          </h1>

          <p className="mt-2 text-red-600">
            {error || "Event not found"}
          </p>

          <button
            onClick={() => window.history.back()}
            className="mt-6 rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
          >
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  const selectedCount = selectedSeats.length;
  const totalAmount = selectedCount * event.price;

  const rows = Array.from(
    new Set(seats.map((seat) => seat.row))
  ).sort();

  const availableCount = seats.filter(
    (seat) => seat.status === "available"
  ).length;

  const bookedCount = seats.filter(
    (seat) => seat.status === "booked"
  ).length;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <button
          onClick={() => window.history.back()}
          className="mb-6 rounded-lg border bg-white px-4 py-2 font-medium hover:bg-gray-50"
        >
          ← Back to Events
        </button>

        {/* Event Details */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-lg">

          {/* Poster */}
          {event.posterUrl ? (
            <div className="relative h-72 w-full md:h-96">
              <Image
                src={event.posterUrl}
                alt={event.title}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center bg-gray-200 md:h-96">
              <div className="text-center">
                <div className="text-5xl">🎟️</div>
                <p className="mt-3 text-gray-500">
                  No poster available
                </p>
              </div>
            </div>
          )}

          <div className="p-6 md:p-8">

            <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
              {event.category}
            </span>

            <h1 className="mt-4 text-4xl font-bold md:text-5xl">
              {event.title}
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
              {event.description}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">

              {/* Venue */}
              <div className="rounded-xl bg-gray-50 p-5">
                <p className="text-sm font-medium text-gray-500">
                  📍 Venue
                </p>

                <p className="mt-2 text-lg font-bold">
                  {event.venueId?.name}
                </p>

                <p className="mt-1 text-gray-600">
                  {event.venueId?.address},{" "}
                  {event.venueId?.city}
                </p>
              </div>

              {/* Date */}
              <div className="rounded-xl bg-gray-50 p-5">
                <p className="text-sm font-medium text-gray-500">
                  📅 Date & Time
                </p>

                <p className="mt-2 text-lg font-bold">
                  {new Date(
                    event.dateTime
                  ).toLocaleString()}
                </p>
              </div>

            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Ticket Price
              </p>

              <p className="mt-1 text-3xl font-bold">
                ₹{event.price}
              </p>
            </div>

          </div>
        </section>

        {/* Seat Selection */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-lg md:p-8">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-2xl font-bold">
                Select Your Seats
              </h2>

              <p className="mt-1 text-gray-500">
                Choose your preferred seats below.
              </p>
            </div>

            {!seatsLoading && seats.length > 0 && (
              <div className="text-sm text-gray-500">
                {availableCount} available · {bookedCount} booked
              </div>
            )}

          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-5 text-sm">

            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-gray-200 border" />
              Available
            </div>

            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-red-500" />
              Booked
            </div>

            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-blue-500" />
              Selected
            </div>

          </div>

          {/* Seats */}
          {seatsLoading ? (
            <div className="mt-10 rounded-xl bg-gray-50 p-10 text-center">
              <p className="text-gray-500">
                Loading seats...
              </p>
            </div>
          ) : seats.length === 0 ? (
            <div className="mt-10 rounded-xl bg-gray-50 p-10 text-center">
              <div className="text-4xl">💺</div>

              <p className="mt-3 text-gray-500">
                No seats are available for this event.
              </p>
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto rounded-xl bg-gray-50 p-5 md:p-8">

              <div className="mx-auto min-w-[600px] max-w-4xl">

                {/* Screen */}
                <div className="mx-auto mb-10 max-w-2xl rounded-b-3xl border-t-4 border-gray-700 bg-gray-200 py-3 text-center text-sm font-bold tracking-widest text-gray-700">
                  SCREEN
                </div>

                {/* Seats */}
                <div className="space-y-4">

                  {rows.map((row) => {
                    const rowSeats = seats
                      .filter((seat) => seat.row === row)
                      .sort((a, b) => {
                        const numberA = parseInt(
                          a.seatNumber.replace(/\D/g, ""),
                          10
                        );

                        const numberB = parseInt(
                          b.seatNumber.replace(/\D/g, ""),
                          10
                        );

                        return numberA - numberB;
                      });

                    return (
                      <div
                        key={row}
                        className="flex items-center gap-3"
                      >

                        {/* Row label */}
                        <span className="w-6 text-center font-bold text-gray-500">
                          {row}
                        </span>

                        <div className="flex flex-nowrap gap-2">

                          {rowSeats.map((seat) => {
                            const isSelected =
                              selectedSeats.includes(
                                seat._id
                              );

                            return (
                              <button
                                key={seat._id}
                                type="button"
                                disabled={
                                  seat.status === "booked"
                                }
                                onClick={() =>
                                  toggleSeat(seat)
                                }
                                aria-label={`Seat ${seat.seatNumber}`}
                                className={`h-11 w-11 shrink-0 rounded-lg text-xs font-semibold transition ${
                                  seat.status === "booked"
                                    ? "cursor-not-allowed bg-red-500 text-white"
                                    : isSelected
                                    ? "bg-blue-500 text-white shadow-md ring-2 ring-blue-200"
                                    : "bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-200"
                                }`}
                              >
                                {seat.seatNumber}
                              </button>
                            );
                          })}

                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>
            </div>
          )}

          {/* Booking Summary */}
          <div className="mt-8 border-t pt-6">

            <div className="grid gap-5 md:grid-cols-3">

              {/* Selected seats */}
              <div className="rounded-xl bg-gray-50 p-5 md:col-span-2">
                <p className="text-sm text-gray-500">
                  Selected Seats
                </p>

                <p className="mt-2 font-semibold">
                  {selectedCount === 0
                    ? "No seats selected"
                    : selectedSeats
                        .map((id) => {
                          const seat = seats.find(
                            (item) => item._id === id
                          );

                          return seat?.seatNumber;
                        })
                        .join(", ")}
                </p>
              </div>

              {/* Total */}
              <div className="rounded-xl bg-gray-50 p-5">
                <p className="text-sm text-gray-500">
                  Total Amount
                </p>

                <p className="mt-2 text-3xl font-bold">
                  ₹{totalAmount}
                </p>

                {selectedCount > 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedCount} ticket
                    {selectedCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

            </div>

            {/* Book button */}
            <button
  type="button"
  disabled={selectedCount === 0}
  onClick={handleBooking}
  className="mt-6 w-full rounded-xl bg-black px-6 py-4 text-lg font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
>
  {selectedCount === 0
    ? "Select Seats to Continue"
    : `Confirm ${selectedCount} Seat${
        selectedCount !== 1 ? "s" : ""
      }`}
</button>

            {/* Booking message */}
{bookingMessage && (
  <div
    className={`mt-4 rounded-xl border p-5 text-center ${
      bookingMessage.includes("successfully")
        ? "border-green-200 bg-green-50 text-green-700"
        : "border-yellow-200 bg-yellow-50 text-yellow-800"
    }`}
  >
    <p className="font-semibold">
      {bookingMessage}
    </p>

    {!auth.currentUser &&
      !bookingMessage.includes("successfully") && (
        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              router.push(
                `/login?eventId=${eventId}&seats=${encodeURIComponent(
                  selectedSeats.join(",")
                )}`
              );
            }}
            className="rounded-lg bg-black px-5 py-2.5 font-semibold text-white transition hover:bg-gray-800"
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              router.push(
                `/register?eventId=${eventId}&seats=${encodeURIComponent(
                  selectedSeats.join(",")
                )}`
              );
            }}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            Create Account
          </button>
        </div>
      )}
  </div>
)}

          </div>
        </section>
      </div>
    </main>
  );
}