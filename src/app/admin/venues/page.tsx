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

export default function AdminVenuesPage() {
  // Create venue states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const [message, setMessage] = useState("");

  // Venue list states
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit venue states
  const [editingVenueId, setEditingVenueId] =
    useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");

  // Fetch venues
  const fetchVenues = async () => {
    try {
      setLoading(true);

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  // Start editing
  const handleEditClick = (venue: Venue) => {
    setEditingVenueId(venue._id);

    setEditName(venue.name);
    setEditAddress(venue.address);
    setEditCity(venue.city);

    setMessage("");
  };

  // Create venue
  const handleCreateVenue = async (
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

      const response = await fetch("/api/venues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name,
          address,
          city,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to create venue"
        );
        return;
      }

      setMessage("Venue created successfully!");

      setName("");
      setAddress("");
      setCity("");

      await fetchVenues();
    } catch (error) {
      console.error("Create venue failed:", error);
      setMessage("Something went wrong.");
    }
  };

  // Update venue
  const handleUpdateVenue = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!editingVenueId) {
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
        `/api/venues/${editingVenueId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            name: editName,
            address: editAddress,
            city: editCity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to update venue"
        );
        return;
      }

      setMessage("Venue updated successfully!");

      setEditingVenueId(null);

      await fetchVenues();
    } catch (error) {
      console.error("Update venue failed:", error);
      setMessage("Something went wrong.");
    }
  };

  // Delete venue
  const handleDeleteVenue = async (
    venueId: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this venue?"
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
        `/api/venues/${venueId}`,
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
          data.message || "Failed to delete venue"
        );
        return;
      }

      setMessage("Venue deleted successfully!");

      await fetchVenues();
    } catch (error) {
      console.error("Delete venue failed:", error);
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
              Manage Venues
            </h1>

            <p className="mt-2 text-gray-600">
              Create and manage locations for your events.
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

          {/* Create Venue */}
          <section className="rounded-2xl bg-white p-6 shadow-md md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                Create New Venue
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add a location where events can be hosted.
              </p>
            </div>

            <form
              onSubmit={handleCreateVenue}
              className="grid gap-5 md:grid-cols-3"
            >
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Venue Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Sikha Banquet"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Address
                </label>

                <input
                  type="text"
                  placeholder="e.g. Subha Pally"
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  City
                </label>

                <input
                  type="text"
                  placeholder="e.g. Kolkata"
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="rounded-lg bg-black p-3 font-semibold text-white transition hover:bg-gray-800 md:col-span-3"
              >
                Create Venue
              </button>
            </form>
          </section>

          {/* Existing Venues */}
          <section className="mt-10">

            {/* Section Header */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Existing Venues
                </h2>

                <p className="mt-1 text-gray-600">
                  {venues.length} venue
                  {venues.length !== 1 ? "s" : ""}
                </p>
              </div>

              <button
                onClick={fetchVenues}
                className="w-fit rounded-lg border bg-white px-4 py-2 font-medium transition hover:bg-gray-50"
              >
                ↻ Refresh
              </button>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow">
                <p className="text-gray-500">
                  Loading venues...
                </p>
              </div>
            ) : venues.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow">
                <div className="text-4xl">📍</div>

                <p className="mt-3 font-medium">
                  No venues found.
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Create your first venue above.
                </p>
              </div>
            ) : (
              <div className="space-y-5">

                {venues.map((venue) => (
                  <div
                    key={venue._id}
                    className="rounded-2xl bg-white p-6 shadow-md"
                  >

                    {/* Venue information */}
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                      <div className="flex-1">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                          📍
                        </div>

                        <h3 className="mt-4 text-2xl font-bold">
                          {venue.name}
                        </h3>

                        <div className="mt-3 space-y-1 text-gray-600">
                          <p>
                            <span className="font-medium text-gray-800">
                              Address:
                            </span>{" "}
                            {venue.address}
                          </p>

                          <p>
                            <span className="font-medium text-gray-800">
                              City:
                            </span>{" "}
                            {venue.city}
                          </p>
                        </div>

                        <p className="mt-3 break-all text-xs text-gray-400">
                          Venue ID: {venue._id}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            handleEditClick(venue)
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteVenue(venue._id)
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>

                    </div>

                    {/* Edit form */}
                    {editingVenueId === venue._id && (
                      <form
                        onSubmit={handleUpdateVenue}
                        className="mt-6 rounded-xl border-t bg-gray-50 p-5 pt-6"
                      >
                        <div className="mb-5">
                          <h4 className="text-xl font-bold">
                            Edit Venue
                          </h4>

                          <p className="mt-1 text-sm text-gray-500">
                            Update the venue information below.
                          </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">

                          {/* Name */}
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Venue Name
                            </label>

                            <input
                              type="text"
                              value={editName}
                              onChange={(e) =>
                                setEditName(
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                              required
                            />
                          </div>

                          {/* Address */}
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Address
                            </label>

                            <input
                              type="text"
                              value={editAddress}
                              onChange={(e) =>
                                setEditAddress(
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                              required
                            />
                          </div>

                          {/* City */}
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              City
                            </label>

                            <input
                              type="text"
                              value={editCity}
                              onChange={(e) =>
                                setEditCity(
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
                              required
                            />
                          </div>

                          {/* Buttons */}
                          <div className="flex flex-col gap-3 sm:flex-row md:col-span-3">
                            <button
                              type="submit"
                              className="rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
                            >
                              Save Changes
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setEditingVenueId(null)
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