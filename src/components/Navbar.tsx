"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      try {
        const idToken = await user.getIdToken();

        const response = await fetch("/api/admin/bookings", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        setIsAdmin(response.ok);
      } catch (error) {
        console.error("Admin verification failed:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
        >
          StageDoor
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-3 text-sm md:gap-6 md:text-base">

          <Link
            href="/"
            className="font-medium text-gray-700 transition hover:text-black"
          >
            Home
          </Link>

          <Link
            href="/events"
            className="font-medium text-gray-700 transition hover:text-black"
          >
            Events
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href="/bookings"
                className="font-medium text-gray-700 transition hover:text-black"
              >
                My Bookings
              </Link>

              {!loading && isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-lg bg-purple-100 px-3 py-2 font-semibold text-purple-700 transition hover:bg-purple-200"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="rounded-lg bg-black px-4 py-2 font-semibold text-white transition hover:bg-gray-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-medium text-gray-700 transition hover:text-black"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-black px-4 py-2 font-semibold text-white transition hover:bg-gray-800"
              >
                Register
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}