"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (category.trim()) {
        params.append("category", category.trim());
      }

      if (city.trim()) {
        params.append("city", city.trim());
      }

      const queryString = params.toString();

      const response = await fetch(
        queryString
          ? `/api/events?${queryString}`
          : "/api/events"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch events"
        );
      }

      setEvents(data.events);
    } catch (error) {
      console.error(error);
      setError("Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, [search, category, city]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setCity("");
  };

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Hero */}
      <section className="bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            StageDoor
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Discover Your Next Experience
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-300">
            Explore concerts, shows, and events. Find the
            perfect experience and reserve your seats.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Search and Filters */}
        <section className="rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              Find an Event
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Search by name, category, or city.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid gap-4 md:grid-cols-4"
          >
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="rounded-lg border p-3 outline-none transition focus:ring-2 focus:ring-black"
            />

            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="rounded-lg border p-3 outline-none transition focus:ring-2 focus:ring-black"
            />

            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) =>
                setCity(e.target.value)
              }
              className="rounded-lg border p-3 outline-none transition focus:ring-2 focus:ring-black"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800"
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-lg border px-4 py-3 font-medium transition hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        {/* Results heading */}
        <div className="mb-5 mt-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Upcoming Events
            </h2>

            {!loading && !error && (
              <p className="mt-1 text-sm text-gray-500">
                {events.length} event
                {events.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl bg-white p-12 text-center shadow">
            <p className="text-gray-600">
              Loading events...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl bg-white p-12 text-center shadow">
            <p className="text-red-600">{error}</p>

            <button
              onClick={fetchEvents}
              className="mt-4 rounded-lg bg-black px-5 py-2 text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Events */}
        {!loading && !error && (
          <>
            {events.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow">
                <div className="text-5xl">🎭</div>

                <h3 className="mt-4 text-xl font-bold">
                  No events found
                </h3>

                <p className="mt-2 text-gray-600">
                  Try changing your search or filters.
                </p>

                <button
                  onClick={handleClearFilters}
                  className="mt-5 rounded-lg bg-black px-5 py-3 font-medium text-white"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {events.map((event) => (
                  <article
                    key={event._id}
                    className="group overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* Poster */}
                    {event.posterUrl ? (
                      <div className="relative h-56 w-full">
                        <Image
                          src={event.posterUrl}
                          alt={event.title}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="flex h-56 items-center justify-center bg-gray-200">
                        <div className="text-center">
                          <div className="text-4xl">
                            🎟️
                          </div>

                          <p className="mt-2 text-sm text-gray-500">
                            No poster available
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Event details */}
                    <div className="p-6">

                      <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                        {event.category}
                      </span>

                      <h2 className="mt-3 line-clamp-2 text-2xl font-bold">
                        {event.title}
                      </h2>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
                        {event.description}
                      </p>

                      <div className="mt-5 space-y-3 border-t pt-5 text-sm">

                        <div className="flex gap-3">
                          <span>📍</span>

                          <div>
                            <p className="font-medium text-gray-800">
                              {event.venueId?.name ||
                                "Venue unavailable"}
                            </p>

                            <p className="text-gray-500">
                              {event.venueId?.city ||
                                "City unavailable"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <span>📅</span>

                          <p className="text-gray-600">
                            {new Date(
                              event.dateTime
                            ).toLocaleString()}
                          </p>
                        </div>

                      </div>

                      <div className="mt-5 flex items-center justify-between">

                        <div>
                          <p className="text-xs text-gray-500">
                            Starting from
                          </p>

                          <p className="text-2xl font-bold">
                            ₹{event.price}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            (window.location.href =
                              `/events/${event._id}`)
                          }
                          className="rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800"
                        >
                          View Details
                        </button>

                      </div>
                    </div>
                  </article>
                ))}

              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}