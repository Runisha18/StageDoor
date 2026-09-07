"use client";

import { Suspense, useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { auth } from "@/lib/firebase";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const eventId = searchParams.get("eventId");
  const seats = searchParams.get("seats");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Firebase account
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      // 2. Save user's name in Firebase profile
      await updateProfile(user, {
        displayName: name,
      });

      // 3. Get Firebase ID token
      const idToken = await user.getIdToken();

      // 4. Synchronize user with MongoDB
      const response = await fetch("/api/users/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "User synchronization failed"
        );
      }

      // 5. Continue booking if registration
      // started from seat selection.
      if (eventId && seats) {
        router.push(
          `/checkout?eventId=${encodeURIComponent(
            eventId
          )}&seats=${encodeURIComponent(seats)}`
        );
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Registration failed:", error);

      setError(
        "Registration failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loginUrl =
    eventId && seats
      ? `/login?eventId=${encodeURIComponent(
          eventId
        )}&seats=${encodeURIComponent(seats)}`
      : "/login";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-4xl font-bold tracking-tight"
          >
            StageDoor
          </Link>

          <p className="mt-2 text-gray-500">
            Create your account and start booking.
          </p>
        </div>

        {/* Register Card */}
        <form
          onSubmit={handleRegister}
          className="rounded-2xl bg-white p-8 shadow-lg"
        >
          <h1 className="text-2xl font-bold">
            Create Account
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Join StageDoor today
          </p>

          {/* Name */}
          <div className="mt-6">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              required
            />
          </div>

          {/* Email */}
          <div className="mt-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              required
            />
          </div>

          {/* Password */}
          <div className="mt-4">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              required
              minLength={6}
            />

            <p className="mt-1 text-xs text-gray-500">
              Password must contain at least 6 characters.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href={loginUrl}
              className="font-semibold text-black hover:underline"
            >
              Login
            </Link>
          </p>
        </form>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to StageDoor
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
          <div className="rounded-xl bg-white p-8 shadow">
            <p className="text-gray-600">
              Loading registration...
            </p>
          </div>
        </main>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}