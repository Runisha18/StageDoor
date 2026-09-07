import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header
    const authorization = request.headers.get("Authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication token is missing",
        },
        { status: 401 }
      );
    }

    // Extract Firebase ID token
    const idToken = authorization.split("Bearer ")[1];

    // Verify the token using Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Connect to MongoDB
    await connectToDatabase();

    // Check if user already exists
    let user = await User.findOne({
      firebaseUid: decodedToken.uid,
    });

    // Create user if it doesn't exist
    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        name: decodedToken.name || "User",
        email: decodedToken.email,
        role: "user",
      });
    }

    return NextResponse.json({
      success: true,
      message: "User synchronized successfully",
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("User synchronization failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "User synchronization failed",
      },
      { status: 500 }
    );
  }
}