"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        try {
          const idToken = await user.getIdToken();

          const response = await fetch(
            "/api/admin/bookings",
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

          setIsAdmin(response.ok);
        } catch (error) {
          console.error(
            "Admin verification failed:",
            error
          );

          setIsAdmin(false);
        } finally {
          setChecking(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Checking admin access...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="rounded-xl bg-white p-10 text-center shadow-md">
          <h1 className="text-2xl font-bold">
            Access Denied
          </h1>

          <p className="mt-3 text-gray-600">
            You must be an administrator to access this page.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}