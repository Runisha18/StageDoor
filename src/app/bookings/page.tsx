"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";


interface Event {
  _id: string;
  title: string;
  category: string;
  dateTime: string;
  price: number;
}

interface Seat {
  _id: string;
  seatNumber: string;
  row: string;
}

interface Booking {
  _id: string;
  eventId: Event;
  seatIds: Seat[];
  totalAmount: number;
  status: "confirmed" | "cancelled";
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async (idToken: string) => {
    try {
      setError("");

      const response = await fetch("/api/bookings", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch bookings"
        );
      }

      setBookings(data.bookings);
    } catch (error) {
      console.error(error);
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setError("Please login to view your bookings.");
          setLoading(false);
          return;
        }

        try {
          const idToken = await user.getIdToken();

          await fetchBookings(idToken);
        } catch (error) {
          console.error(error);
          setError("Failed to authenticate user.");
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCancel = async (bookingId: string) => {
    try {
      setError("");

      const user = auth.currentUser;

      if (!user) {
        setError("Please login to cancel a booking.");
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch(
        `/api/bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to cancel booking"
        );
      }

      await fetchBookings(idToken);
    } catch (error) {
      console.error(error);
      setError("Failed to cancel booking.");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading bookings...</p>
      </main>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-4xl font-bold">
          My Bookings
        </h1>

        {bookings.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <p className="text-gray-600">
              You have no bookings yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-xl bg-white p-6 shadow-md"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">
                      {booking.eventId.category}
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      {booking.eventId.title}
                    </h2>

                    <p className="mt-2 text-gray-600">
                      📅{" "}
                      {new Date(
                        booking.eventId.dateTime
                      ).toLocaleString()}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 border-t pt-6 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Seats
                    </p>

                    <p className="mt-1 font-semibold">
                      {booking.seatIds
                        .map(
                          (seat) => seat.seatNumber
                        )
                        .join(", ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Total Amount
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      ₹{booking.totalAmount}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Booked On
                    </p>

                    <p className="mt-1 font-semibold">
                      {new Date(
                        booking.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {booking.status === "confirmed" && (
                  <button
                    onClick={() =>
                      handleCancel(booking._id)
                    }
                    className="mt-6 rounded-lg bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {error && bookings.length > 0 && (
          <p className="mt-4 text-center text-red-600">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}