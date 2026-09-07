"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AdminGuard from "@/components/AdminGuard";

interface User {
  _id: string;
  name: string;
  email: string;
}

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
  userId: User;
  eventId: Event;
  seatIds: Seat[];
  totalAmount: number;
  status: "confirmed" | "cancelled";
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const user = auth.currentUser;

      if (!user) {
        setError("Please login as an admin.");
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch("/api/admin/bookings", {
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
      console.error("Fetch bookings failed:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to load bookings.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setError("Please login as an admin.");
        setLoading(false);
        return;
      }

      fetchBookings();
    });

    return () => unsubscribe();
  }, [fetchBookings]);

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length;

  const totalRevenue = bookings
    .filter((booking) => booking.status === "confirmed")
    .reduce(
      (total, booking) => total + booking.totalAmount,
      0
    );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-medium">
            Loading bookings...
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Please wait.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <h1 className="text-xl font-bold">
            Unable to load bookings
          </h1>

          <p className="mt-2 text-red-600">
            {error}
          </p>

          <button
            onClick={() => fetchBookings(true)}
            className="mt-6 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link
  href="/admin"
  className="mb-6 inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium transition hover:bg-gray-50"
>
  ← Back to Admin Dashboard
</Link>
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Admin Panel
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                All Bookings
              </h1>

              <p className="mt-2 text-gray-600">
                View and monitor all customer ticket bookings.
              </p>
            </div>

            <button
              onClick={() => fetchBookings(true)}
              disabled={refreshing}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Summary Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm text-gray-500">
                Total Bookings
              </p>

              <p className="mt-2 text-3xl font-bold">
                {bookings.length}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm text-gray-500">
                Confirmed
              </p>

              <p className="mt-2 text-3xl font-bold">
                {confirmedBookings}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm text-gray-500">
                Cancelled
              </p>

              <p className="mt-2 text-3xl font-bold">
                {cancelledBookings}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm text-gray-500">
                Confirmed Revenue
              </p>

              <p className="mt-2 text-3xl font-bold">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* No Bookings */}
          {bookings.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
              <h2 className="text-xl font-bold">
                No bookings found
              </h2>

              <p className="mt-2 text-gray-500">
                Customer bookings will appear here once tickets
                are purchased.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <article
                  key={booking._id}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-6"
                >
                  {/* Booking Header */}
                  <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Booking ID
                      </p>

                      <p className="mt-1 break-all font-mono text-sm text-gray-700">
                        {booking._id}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                        booking.status === "confirmed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Customer + Event */}
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Customer
                      </p>

                      <p className="mt-2 text-lg font-bold">
                        {booking.userId?.name || "Unknown User"}
                      </p>

                      <p className="mt-1 break-all text-sm text-gray-600">
                        {booking.userId?.email || "N/A"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Event
                      </p>

                      <p className="mt-2 text-lg font-bold">
                        {booking.eventId?.title || "Event unavailable"}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {booking.eventId?.category || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-6 grid gap-5 border-t pt-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Seats
                      </p>

                      <p className="mt-1 font-semibold">
                        {booking.seatIds?.length
                          ? booking.seatIds
                              .map((seat) => seat.seatNumber)
                              .join(", ")
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Event Date
                      </p>

                      <p className="mt-1 font-semibold">
                        {booking.eventId
                          ? new Date(
                              booking.eventId.dateTime
                            ).toLocaleString("en-IN")
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Total Amount
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        ₹
                        {booking.totalAmount.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Booked On
                      </p>

                      <p className="mt-1 font-semibold">
                        {new Date(
                          booking.createdAt
                        ).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}