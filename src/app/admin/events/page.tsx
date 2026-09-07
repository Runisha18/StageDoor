"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import AdminGuard from "@/components/AdminGuard";

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

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [venuesLoading, setVenuesLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [venueId, setVenueId] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [price, setPrice] = useState("");
  const [posterUrl, setPosterUrl] = useState("");

  const [message, setMessage] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(
    null
  );

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editVenueId, setEditVenueId] = useState("");
  const [editDateTime, setEditDateTime] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPosterUrl, setEditPosterUrl] = useState("");

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/events");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch events"
        );
      }

      setEvents(data.events);
    } catch (error) {
      console.error("Fetch events failed:", error);
      setMessage("Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch venues
  const fetchVenues = async () => {
    try {
      setVenuesLoading(true);

      const response = await fetch("/api/venues");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch venues"
        );
      }

      setVenues(data.venues);
    } catch (error) {
      console.error("Fetch venues failed:", error);
      setMessage("Failed to load venues.");
    } finally {
      setVenuesLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchVenues();
  }, []);

  // Create event
  const handleCreateEvent = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setMessage("");

      const user = auth.currentUser;

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          venueId,
          dateTime,
          price: Number(price),
          posterUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to create event"
        );
        return;
      }

      setMessage("Event created successfully!");

      setTitle("");
      setDescription("");
      setCategory("");
      setVenueId("");
      setDateTime("");
      setPrice("");
      setPosterUrl("");

      await fetchEvents();
    } catch (error) {
      console.error("Create event failed:", error);
      setMessage("Something went wrong.");
    }
  };

  // Start editing
  const handleEditClick = (event: Event) => {
    setEditingEventId(event._id);

    setEditTitle(event.title);
    setEditDescription(event.description);
    setEditCategory(event.category);
    setEditVenueId(event.venueId?._id || "");
    setEditDateTime(
      new Date(event.dateTime)
        .toISOString()
        .slice(0, 16)
    );
    setEditPrice(String(event.price));
    setEditPosterUrl(event.posterUrl || "");

    setMessage("");
  };

  // Update event
  const handleUpdateEvent = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!editingEventId) {
      return;
    }

    try {
      setMessage("");

      const user = auth.currentUser;

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch(
        `/api/events/${editingEventId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            title: editTitle,
            description: editDescription,
            category: editCategory,
            venueId: editVenueId,
            dateTime: editDateTime,
            price: Number(editPrice),
            posterUrl: editPosterUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to update event"
        );
        return;
      }

      setMessage("Event updated successfully!");
      setEditingEventId(null);

      await fetchEvents();
    } catch (error) {
      console.error("Update event failed:", error);
      setMessage("Something went wrong.");
    }
  };

  // Delete event
  const handleDeleteEvent = async (
    eventId: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");

      const user = auth.currentUser;

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch(
        `/api/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to delete event"
        );
        return;
      }

      setMessage("Event deleted successfully!");

      await fetchEvents();
    } catch (error) {
      console.error("Delete event failed:", error);
      setMessage("Something went wrong.");
    }
  };

  return (
    <AdminGuard>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-6xl">
          <Link
  href="/admin"
  className="mb-6 inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium transition hover:bg-gray-50"
>
  ← Back to Admin Dashboard
</Link>

          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">
              StageDoor Admin
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Manage Events
            </h1>

            <p className="mt-2 text-gray-600">
              Create, update, and manage events available
              for ticket booking.
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 rounded-xl border p-4 font-medium ${
                message.toLowerCase().includes("success")
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Create Event */}
          <section className="rounded-2xl bg-white p-6 shadow-md md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                Create New Event
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add a new event to StageDoor.
              </p>
            </div>

            <form
              onSubmit={handleCreateEvent}
              className="grid gap-5 md:grid-cols-2"
            >
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Event Title
                </label>

                <input
                  type="text"
                  placeholder="e.g. Arijit Singh Live"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <input
                  type="text"
                  placeholder="e.g. Music"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  placeholder="Describe the event..."
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
                  rows={4}
                  required
                />
              </div>

              {/* Venue */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Venue
                </label>

                <select
                  value={venueId}
                  onChange={(e) =>
                    setVenueId(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-black"
                  required
                >
                  <option value="">
                    {venuesLoading
                      ? "Loading venues..."
                      : "Select a venue"}
                  </option>

                  {venues.map((venue) => (
                    <option
                      key={venue._id}
                      value={venue._id}
                    >
                      {venue.name} — {venue.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Date & Time
                </label>

                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) =>
                    setDateTime(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Ticket Price
                </label>

                <input
                  type="number"
                  placeholder="e.g. 999"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
                  min="0"
                  required
                />
              </div>

              {/* Poster */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Poster URL
                </label>

                <input
                  type="url"
                  placeholder="Optional poster URL"
                  value={posterUrl}
                  onChange={(e) =>
                    setPosterUrl(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="rounded-lg bg-black p-3 font-semibold text-white transition hover:bg-gray-800 md:col-span-2"
              >
                Create Event
              </button>
            </form>
          </section>

          {/* Event List */}
          <section className="mt-10">

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Existing Events
                </h2>

                <p className="mt-1 text-gray-600">
                  {events.length} event
                  {events.length !== 1 ? "s" : ""}
                </p>
              </div>

              <button
                onClick={fetchEvents}
                className="w-fit rounded-lg border bg-white px-4 py-2 font-medium transition hover:bg-gray-50"
              >
                ↻ Refresh
              </button>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow">
                <p className="text-gray-500">
                  Loading events...
                </p>
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow">
                <div className="text-4xl">🎫</div>

                <p className="mt-3 font-medium">
                  No events found.
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Create your first event above.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="rounded-2xl bg-white p-6 shadow-md"
                  >
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

                      {/* Event Information */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                            {event.category}
                          </span>
                        </div>

                        <h3 className="mt-3 text-2xl font-bold">
                          {event.title}
                        </h3>

                        <p className="mt-2 leading-6 text-gray-600">
                          {event.description}
                        </p>

                        <div className="mt-5 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">

                          <p>
                            📍{" "}
                            <span className="font-medium text-gray-800">
                              {event.venueId?.name ||
                                "Venue unavailable"}
                            </span>
                          </p>

                          <p>
                            🏙️{" "}
                            {event.venueId?.city ||
                              "City unavailable"}
                          </p>

                          <p>
                            📅{" "}
                            {new Date(
                              event.dateTime
                            ).toLocaleString()}
                          </p>

                          <p className="font-bold text-black">
                            💰 ₹{event.price}
                          </p>

                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            handleEditClick(event)
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteEvent(
                              event._id
                            )
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Edit Form */}
                    {editingEventId === event._id && (
                      <form
                        onSubmit={handleUpdateEvent}
                        className="mt-6 rounded-xl border-t bg-gray-50 p-5 pt-6"
                      >
                        <div className="mb-5">
                          <h4 className="text-xl font-bold">
                            Edit Event
                          </h4>

                          <p className="mt-1 text-sm text-gray-500">
                            Update the event information below.
                          </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">

                          {/* Edit Title */}
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Event Title
                            </label>

                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) =>
                                setEditTitle(
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                              required
                            />
                          </div>

                          {/* Edit Category */}
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Category
                            </label>

                            <input
                              type="text"
                              value={editCategory}
                              onChange={(e) =>
                                setEditCategory(
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                              required
                            />
                          </div>

                          {/* Edit Description */}
                          <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium">
                              Description
                            </label>

                            <textarea
                              value={editDescription}
                              onChange={(e) =>
                                setEditDescription(
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                              rows={4}
                              required
                            />
                          </div>

                          {/* Edit Venue */}
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Venue
                            </label>

                            <select
                              value={editVenueId}
                              onChange={(e) =>
                                setEditVenueId(
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                              required
                            >
                              <option value="">
                                Select a venue
                              </option>

                              {venues.map((venue) => (
                                <option
                                  key={venue._id}
                                  value={venue._id}
                                >
                                  {venue.name} —{" "}
                                  {venue.city}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Edit Date */}
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Date & Time
                            </label>

                            <input
                              type="datetime-local"
                              value={editDateTime}
                              onChange={(e) =>
                                setEditDateTime(
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                              required
                            />
                          </div>

                          {/* Edit Price */}
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Ticket Price
                            </label>

                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) =>
                                setEditPrice(
                                  e.target.value
                                )
                              }
                              min="0"
                              className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                              required
                            />
                          </div>

                          {/* Edit Poster */}
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Poster URL
                            </label>

                            <input
                              type="url"
                              value={editPosterUrl}
                              onChange={(e) =>
                                setEditPosterUrl(
                                  e.target.value
                                )
                              }
                              placeholder="Optional poster URL"
                              className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                            />
                          </div>

                          {/* Edit Buttons */}
                          <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
                            <button
                              type="submit"
                              className="rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
                            >
                              Save Changes
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setEditingEventId(null)
                              }
                              className="rounded-lg border bg-white px-5 py-3 font-semibold transition hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>

                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminGuard>
  );
}