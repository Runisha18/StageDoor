"use client";

import { Suspense, useState } from "react";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { auth } from "@/lib/firebase";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const eventId = searchParams.get("eventId");
  const seats = searchParams.get("seats");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

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
  console.error("Login failed:", error);

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (
      error.code === "auth/user-not-found" ||
      error.code === "auth/invalid-credential"
    )
  ) {
    setError(
      "Account not found. Please create an account first."
    );
  } else {
    setError(
      "Invalid email or password. Please try again."
    );
  }
}finally {
      setLoading(false);
    }
  };

  const registerUrl =
    eventId && seats
      ? `/register?eventId=${encodeURIComponent(
          eventId
        )}&seats=${encodeURIComponent(seats)}`
      : "/register";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-4xl font-bold tracking-tight"
          >
            StageDoor
          </Link>

          <p className="mt-2 text-gray-500">
            Welcome back. Login to continue.
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="rounded-2xl bg-white p-8 shadow-lg"
        >
          <h1 className="text-2xl font-bold">
            Login
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Access your StageDoor account
          </p>

          {/* Email */}
          <div className="mt-6">
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              required
            />
          </div>

          {/* Error */}
          {error && (
  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
    <p>{error}</p>

    {error.includes("Account not found") && (
      <Link
        href={registerUrl}
        className="mt-2 inline-block font-semibold underline"
      >
        Create an account
      </Link>
    )}
  </div>
)}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href={registerUrl}
              className="font-semibold text-black hover:underline"
            >
              Create an account
            </Link>
          </p>
        </form>

        {/* Back to Home */}
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
          <div className="rounded-xl bg-white p-8 shadow">
            <p className="text-gray-600">
              Loading login...
            </p>
          </div>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}