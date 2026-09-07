"use client";

import {  Suspense,useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function CheckoutPageContent()  {
  const router = useRouter();
  const searchParams = useSearchParams();

  const eventId = searchParams.get("eventId");
  const seatsParam = searchParams.get("seats");

  const selectedSeatIds = seatsParam
    ? seatsParam.split(",")
    : [];

  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCheckoutData = async () => {
      if (!eventId || !seatsParam) {
  setMessage("Invalid checkout details.");
  setLoading(false);
  return;
}

      try {
        const [eventResponse, seatsResponse] =
          await Promise.all([
            fetch(`/api/events/${eventId}`),
            fetch(`/api/events/${eventId}/seats`),
          ]);

        const eventData = await eventResponse.json();
        const seatsData = await seatsResponse.json();

        if (!eventResponse.ok) {
          throw new Error(
            eventData.message || "Failed to load event."
          );
        }

        if (!seatsResponse.ok) {
          throw new Error(
            seatsData.message || "Failed to load seats."
          );
        }

        setEvent(eventData.event);
        setSeats(seatsData.seats);
      } catch (error) {
        console.error(error);
        setMessage("Failed to load checkout details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutData();
  }, [eventId, seatsParam]);

  const selectedSeats = seats.filter((seat) =>
    selectedSeatIds.includes(seat._id)
  );

  const totalAmount =
    selectedSeats.length * (event?.price || 0);

  const handleConfirmBooking = async () => {
    try {
      setBookingLoading(true);
      setMessage("");

      const user = auth.currentUser;

      if (!user) {
        router.push(
          `/login?eventId=${eventId}&seats=${encodeURIComponent(
            selectedSeatIds.join(",")
          )}`
        );
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          eventId,
          seatIds: selectedSeatIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Booking failed."
        );
        return;
      }

      setMessage(
        "Booking confirmed successfully!"
      );

      setTimeout(() => {
        router.push("/bookings");
      }, 2000);
    } catch (error) {
      console.error("Booking failed:", error);
      setMessage("Something went wrong.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="rounded-xl bg-white p-8 shadow">
          <p className="text-gray-600">
            Loading checkout...
          </p>
        </div>
      </main>
    );
  }

  if (!event || !eventId || selectedSeatIds.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <div className="text-5xl">🎫</div>

          <h1 className="mt-4 text-2xl font-bold">
            Checkout unavailable
          </h1>

          <p className="mt-2 text-red-600">
            {message || "Invalid checkout details."}
          </p>

          <button
            onClick={() => router.push("/events")}
            className="mt-6 rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
          >
            ← Browse Events
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">

        <button
          onClick={() => router.back()}
          className="mb-6 rounded-lg border bg-white px-4 py-2 font-medium hover:bg-gray-50"
        >
          ← Back
        </button>

        <section className="rounded-2xl bg-white p-6 shadow-lg md:p-8">

          <h1 className="text-3xl font-bold">
            Checkout
          </h1>

          <p className="mt-2 text-gray-600">
            Review your selected event and seats before confirming your booking.
          </p>

          <div className="mt-8 rounded-xl bg-gray-50 p-6">

            <h2 className="text-2xl font-bold">
              {event.title}
            </h2>

            <div className="mt-4 space-y-2 text-gray-600">
              <p>
                📍 {event.venueId?.name},{" "}
                {event.venueId?.city}
              </p>

              <p>
                📅{" "}
                {new Date(
                  event.dateTime
                ).toLocaleString()}
              </p>

              <p>
                🎟️ ₹{event.price} per ticket
              </p>
            </div>

          </div>

          <div className="mt-6 rounded-xl border p-6">

            <h2 className="text-xl font-bold">
              Selected Seats
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {selectedSeats.map((seat) => (
                <span
                  key={seat._id}
                  className="rounded-lg bg-blue-100 px-4 py-2 font-semibold text-blue-700"
                >
                  {seat.seatNumber}
                </span>
              ))}
            </div>

          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-gray-50 p-6">

            <div>
              <p className="text-sm text-gray-500">
                Total Amount
              </p>

              <p className="mt-1 text-3xl font-bold">
                ₹{totalAmount}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">
                Tickets
              </p>

              <p className="font-semibold">
                {selectedSeats.length}
              </p>
            </div>

          </div>

          <button
            type="button"
            disabled={
              bookingLoading ||
              selectedSeats.length === 0
            }
            onClick={handleConfirmBooking}
            className="mt-8 w-full rounded-xl bg-black px-6 py-4 text-lg font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {bookingLoading
              ? "Processing..."
              : "Confirm Booking"}
          </button>

          {message && (
            <div
              className={`mt-4 rounded-lg border p-4 text-center font-medium ${
                message.includes("confirmed")
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

        </section>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
          <div className="rounded-xl bg-white p-8 shadow">
            <p className="text-gray-600">
              Loading checkout...
            </p>
          </div>
        </main>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}