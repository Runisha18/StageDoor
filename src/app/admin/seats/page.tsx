"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import AdminGuard from "@/components/AdminGuard";

interface Seat {
  _id: string;
  seatNumber: string;
  row: string;
  status: "available" | "booked";
}

interface Event {
  _id: string;
  title: string;
  category: string;
  dateTime: string;
}

export default function AdminSeatsPage() {
  const [eventId, setEventId] = useState("");
  const [rows, setRows] = useState("");
  const [seatsPerRow, setSeatsPerRow] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);

      const response = await fetch("/api/events");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch events");
      }

      setEvents(data.events);
    } catch (error) {
      console.error("Fetch events failed:", error);
      setMessage("Failed to load events.");
      setMessageType("error");
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchSeats = async () => {
    if (!eventId) {
      setMessage("Please select an event first.");
      setMessageType("error");
      return;
    }

    try {
      setLoadingSeats(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `/api/events/${eventId}/seats`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to fetch seats");
        setMessageType("error");
        return;
      }

      setSeats(data.seats);
      setMessage(
        `${data.seats.length} seat${
          data.seats.length !== 1 ? "s" : ""
        } loaded successfully.`
      );
      setMessageType("success");
    } catch (error) {
      console.error("Fetch seats failed:", error);
      setMessage("Something went wrong while loading seats.");
      setMessageType("error");
    } finally {
      setLoadingSeats(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateSeats = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!eventId) {
      setMessage("Please select an event.");
      setMessageType("error");
      return;
    }

    const rowList = rows
      .split(",")
      .map((row) => row.trim().toUpperCase())
      .filter(Boolean);

    if (rowList.length === 0) {
      setMessage("Please enter at least one row.");
      setMessageType("error");
      return;
    }

    const seatCount = Number(seatsPerRow);

    if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > 50) {
      setMessage("Seats per row must be between 1 and 50.");
      setMessageType("error");
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        setMessage("Please login first.");
        setMessageType("error");
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch("/api/seats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          eventId,
          rows: rowList,
          seatsPerRow: seatCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create seats");
        setMessageType("error");
        return;
      }

      setMessage(
        `${data.seats.length} seats created successfully!`
      );
      setMessageType("success");

      setRows("");
      setSeatsPerRow("");

      // Automatically refresh the seat list
      await fetchSeats();
    } catch (error) {
      console.error("Create seats failed:", error);
      setMessage("Something went wrong while creating seats.");
      setMessageType("error");
    }
  };

  const availableSeats = seats.filter(
    (seat) => seat.status === "available"
  ).length;

  const bookedSeats = seats.filter(
    (seat) => seat.status === "booked"
  ).length;

  const selectedEvent = events.find(
    (event) => event._id === eventId
  );

  // Group seats by row for a proper seating layout
  const seatsByRow = seats.reduce<Record<string, Seat[]>>(
    (groups, seat) => {
      if (!groups[seat.row]) {
        groups[seat.row] = [];
      }

      groups[seat.row].push(seat);

      return groups;
    },
    {}
  );

  Object.values(seatsByRow).forEach((rowSeats) => {
    rowSeats.sort((a, b) => {
      const aNumber = parseInt(
        a.seatNumber.replace(/\D/g, ""),
        10
      );

      const bNumber = parseInt(
        b.seatNumber.replace(/\D/g, ""),
        10
      );

      return aNumber - bNumber;
    });
  });

  const sortedRows = Object.keys(seatsByRow).sort((a, b) =>
    a.localeCompare(b)
  );

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
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Admin Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Seat Management
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              Generate seats for an event and monitor their current
              availability.
            </p>
          </div>

          {/* Generate Seats Card */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                Generate Seats
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Create a seating arrangement for a selected event.
              </p>
            </div>

            <form
              onSubmit={handleCreateSeats}
              className="grid gap-5 md:grid-cols-2"
            >
              {/* Event */}
              <div className="md:col-span-2">
                <label
                  htmlFor="event"
                  className="mb-2 block text-sm font-medium"
                >
                  Event
                </label>

                <select
                  id="event"
                  value={eventId}
                  onChange={(e) => {
                    setEventId(e.target.value);
                    setSeats([]);
                    setMessage("");
                    setMessageType("");
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
                  required
                >
                  <option value="">
                    {loadingEvents
                      ? "Loading events..."
                      : "Select an event"}
                  </option>

                  {events.map((event) => (
                    <option
                      key={event._id}
                      value={event._id}
                    >
                      {event.title} — {event.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rows */}
              <div>
                <label
                  htmlFor="rows"
                  className="mb-2 block text-sm font-medium"
                >
                  Rows
                </label>

                <input
                  id="rows"
                  type="text"
                  placeholder="A, B, C, D, E"
                  value={rows}
                  onChange={(e) => setRows(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
                  required
                />

                <p className="mt-2 text-xs text-gray-500">
                  Separate row names with commas.
                </p>
              </div>

              {/* Seats per row */}
              <div>
                <label
                  htmlFor="seatsPerRow"
                  className="mb-2 block text-sm font-medium"
                >
                  Seats per Row
                </label>

                <input
                  id="seatsPerRow"
                  type="number"
                  placeholder="10"
                  value={seatsPerRow}
                  onChange={(e) =>
                    setSeatsPerRow(e.target.value)
                  }
                  min="1"
                  max="50"
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
                  required
                />

                <p className="mt-2 text-xs text-gray-500">
                  Maximum 50 seats per row.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
                <button
                  type="submit"
                  className="rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
                >
                  Generate Seats
                </button>

                <button
                  type="button"
                  onClick={fetchSeats}
                  disabled={loadingSeats || !eventId}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingSeats
                    ? "Loading..."
                    : "View Existing Seats"}
                </button>
              </div>
            </form>

            {/* Message */}
            {message && (
              <div
                className={`mt-5 rounded-xl border p-4 text-sm ${
                  messageType === "success"
                    ? "border-gray-200 bg-gray-100 text-gray-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}
          </section>

          {/* Existing Seats */}
          <section className="mt-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Existing Seats
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  {selectedEvent
                    ? selectedEvent.title
                    : "Select an event to view seats"}
                </p>
              </div>

              {seats.length > 0 && (
                <button
                  type="button"
                  onClick={fetchSeats}
                  disabled={loadingSeats}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Refresh
                </button>
              )}
            </div>

            {loadingSeats ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
                <p className="text-gray-600">
                  Loading seats...
                </p>
              </div>
            ) : seats.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
                <p className="font-medium">
                  No seats loaded
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Select an event and click &quot;View Existing
                  Seats&quot;.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-6">
                {/* Summary */}
                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-gray-100 p-5">
                    <p className="text-sm text-gray-500">
                      Total Seats
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {seats.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-100 p-5">
                    <p className="text-sm text-gray-500">
                      Available
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {availableSeats}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-100 p-5">
                    <p className="text-sm text-gray-500">
                      Booked
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {bookedSeats}
                    </p>
                  </div>
                </div>

                {/* Screen */}
                <div className="mb-8">
                  <div className="mx-auto max-w-2xl rounded-full border border-gray-300 bg-gray-100 py-3 text-center text-sm font-semibold">
                    SCREEN
                  </div>
                </div>

                {/* Seating Layout */}
                <div className="space-y-7 overflow-x-auto">
                  {sortedRows.map((row) => (
                    <div key={row} className="min-w-max">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                          {row}
                        </div>

                        <span className="text-sm font-semibold text-gray-600">
                          Row {row}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pl-11">
                        {seatsByRow[row].map((seat) => (
                          <div
                            key={seat._id}
                            title={`${seat.seatNumber} — ${seat.status}`}
                            className={`flex h-12 w-12 items-center justify-center rounded-lg border text-sm font-semibold ${
                              seat.status === "available"
                                ? "border-gray-300 bg-gray-100 text-gray-800"
                                : "border-red-200 bg-red-100 text-red-700"
                            }`}
                          >
                            {seat.seatNumber}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-8 flex flex-wrap gap-6 border-t pt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border border-gray-300 bg-gray-100" />
                    <span>Available</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border border-red-200 bg-red-100" />
                    <span>Booked</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminGuard>
  );
}