import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Hero Section */}

      <section className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-purple-600">
            Welcome to StageDoor
          </p>

          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
            Your Next Experience
            <span className="block">
              Starts Here.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 md:text-xl">
            Discover amazing events, choose your favorite
            seats, and book your tickets with ease.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/events"
              className="rounded-lg bg-black px-8 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              Explore Events
            </Link>

            <Link
              href="/bookings"
              className="rounded-lg border border-gray-300 bg-white px-8 py-3 font-medium text-black transition hover:bg-gray-50"
            >
              My Bookings
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              Everything You Need
            </h2>

            <p className="mt-3 text-gray-600">
              A simple and convenient way to manage your
              event bookings.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">

            {/* Feature 1 */}

            <div className="rounded-xl border bg-gray-50 p-6 text-center">
              <div className="text-4xl">
                🎟️
              </div>

              <h3 className="mt-4 text-xl font-bold">
                Easy Booking
              </h3>

              <p className="mt-2 text-gray-600">
                Browse events and book your tickets in
                just a few clicks.
              </p>
            </div>

            {/* Feature 2 */}

            <div className="rounded-xl border bg-gray-50 p-6 text-center">
              <div className="text-4xl">
                💺
              </div>

              <h3 className="mt-4 text-xl font-bold">
                Choose Your Seats
              </h3>

              <p className="mt-2 text-gray-600">
                Select your preferred seats using our
                interactive seating layout.
              </p>
            </div>

            {/* Feature 3 */}

            <div className="rounded-xl border bg-gray-50 p-6 text-center">
              <div className="text-4xl">
                📋
              </div>

              <h3 className="mt-4 text-xl font-bold">
                Manage Bookings
              </h3>

              <p className="mt-2 text-gray-600">
                View your booking history and cancel
                bookings whenever needed.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Call To Action */}

      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-2xl bg-black px-6 py-12 text-center text-white">
          <h2 className="text-3xl font-bold">
            Ready for your next event?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-gray-300">
            Explore upcoming events and reserve your
            seats today.
          </p>

          <Link
            href="/events"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 font-medium text-black transition hover:bg-gray-200"
          >
            Browse Events
          </Link>
        </div>
      </section>
    </main>
  );
}