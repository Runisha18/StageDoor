import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">
                StageDoor Admin
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                Dashboard
              </h1>

              <p className="mt-2 text-gray-600">
                Manage your ticket booking platform from one place.
              </p>
            </div>

            <Link
              href="/"
              className="w-fit rounded-lg border bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
            >
              ← Back to StageDoor
            </Link>
          </div>

          {/* Overview */}
          <section className="mb-8 rounded-2xl bg-black p-6 text-white shadow-lg">
            <p className="text-sm text-gray-300">
              Administration
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Platform Management
            </h2>

            <p className="mt-2 max-w-2xl text-gray-300">
              Create events, manage venues and seating, and monitor
              customer bookings.
            </p>
          </section>

          {/* Management Cards */}
          <section>
            <h2 className="mb-4 text-xl font-bold">
              Management
            </h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {/* Events */}
              <Link
                href="/admin/events"
                className="group rounded-2xl bg-white p-6 shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                  🎫
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  Events
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Create, update, and manage StageDoor events.
                </p>

                <p className="mt-5 text-sm font-semibold text-purple-600 group-hover:underline">
                  Manage Events →
                </p>
              </Link>

              {/* Venues */}
              <Link
                href="/admin/venues"
                className="group rounded-2xl bg-white p-6 shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                  📍
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  Venues
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Add and manage locations where events take place.
                </p>

                <p className="mt-5 text-sm font-semibold text-blue-600 group-hover:underline">
                  Manage Venues →
                </p>
              </Link>

              {/* Seats */}
              <Link
                href="/admin/seats"
                className="group rounded-2xl bg-white p-6 shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                  💺
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  Seats
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Generate and monitor seats for your events.
                </p>

                <p className="mt-5 text-sm font-semibold text-green-600 group-hover:underline">
                  Manage Seats →
                </p>
              </Link>

              {/* Bookings */}
              <Link
                href="/admin/bookings"
                className="group rounded-2xl bg-white p-6 shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                  📋
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  Bookings
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  View and monitor customer ticket bookings.
                </p>

                <p className="mt-5 text-sm font-semibold text-orange-600 group-hover:underline">
                  View Bookings →
                </p>
              </Link>

            </div>
          </section>

          {/* Quick Actions */}
          <section className="mt-10 rounded-2xl bg-white p-6 shadow-md md:p-8">
            <div>
              <h2 className="text-2xl font-bold">
                Quick Actions
              </h2>

              <p className="mt-1 text-gray-500">
                Jump directly to the most common administrative tasks.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <Link
                href="/admin/events"
                className="rounded-lg bg-black px-5 py-3 text-center font-medium text-white transition hover:bg-gray-800"
              >
                Manage Events
              </Link>

              <Link
                href="/admin/venues"
                className="rounded-lg border px-5 py-3 text-center font-medium transition hover:bg-gray-50"
              >
                Manage Venues
              </Link>

              <Link
                href="/admin/seats"
                className="rounded-lg border px-5 py-3 text-center font-medium transition hover:bg-gray-50"
              >
                Manage Seats
              </Link>

              <Link
                href="/admin/bookings"
                className="rounded-lg border px-5 py-3 text-center font-medium transition hover:bg-gray-50"
              >
                View Bookings
              </Link>

            </div>
          </section>

        </div>
      </main>
    </AdminGuard>
  );
}