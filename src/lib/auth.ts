import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function getAuthenticatedUser(request: NextRequest) { //"Give me the MongoDB user associated with this authenticated Firebase account
  const authorization = request.headers.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Error("Authentication token is missing");
  }

  const idToken = authorization.split("Bearer ")[1];

  const decodedToken = await adminAuth.verifyIdToken(idToken);//Is this ID token genuine and valid?

  await connectToDatabase();

  const user = await User.findOne({
    firebaseUid: decodedToken.uid,
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function requireAdmin(request: NextRequest) {
  const user = await getAuthenticatedUser(request); //for checking admin access

  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }

  return user;
}