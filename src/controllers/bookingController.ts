import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, requireAdmin } from "@/lib/auth";
import {
  createBooking,
  getUserBookings,
  cancelBooking,
   getAllBookings,
} from "@/services/bookingService";
import { createBookingSchema } from "@/types/booking";

export async function createBookingController(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const user = await getAuthenticatedUser(request);

    // 2. Read request body
    const body = await request.json();

    // 3. Validate booking data
    const validationResult = createBookingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking data",
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // 4. Create the booking
    const booking = await createBooking(
      user.firebaseUid,
      validationResult.data
    );

    // 5. Return the booking
    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create booking:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create booking";

    if (
      message === "Authentication token is missing" ||
      message === "User not found"
    ) {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 401 }
      );
    }

    if (
      message === "Event not found" ||
      message.startsWith("Seat ")
    ) {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 409 }
      );//If a selected seat is already booked, we're returning:
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create booking",
      },
      { status: 500 }
    );
  }
}
export async function getUserBookingsController(
  request: NextRequest
) {
  try {
    const user = await getAuthenticatedUser(request);

    const bookings = await getUserBookings(
      user.firebaseUid
    );

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Failed to fetch booking history:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch booking history";

    if (
      message === "Authentication token is missing" ||
      message === "User not found"
    ) {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch booking history",
      },
      { status: 500 }
    );
  }
}

export async function cancelBookingController(
  request: NextRequest,
  bookingId: string
) {
  try {
    const user = await getAuthenticatedUser(request);

    const booking = await cancelBooking(
      user.firebaseUid,
      bookingId
    );

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Failed to cancel booking:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to cancel booking";

    if (
      message === "Authentication token is missing" ||
      message === "User not found"
    ) {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 401 }
      );
    }

    if (
      message === "Booking not found or already cancelled"
    ) {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to cancel booking",
      },
      { status: 500 }
    );
  }
}

export async function getAllBookingsController(
  request: NextRequest
) {
  try {
    await requireAdmin(request);

    const bookings = await getAllBookings();

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get all bookings failed:", error);

    if (
      error instanceof Error &&
      error.message === "Authentication token is missing"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication token is missing",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "Admin access required"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "User not found"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookings",
      },
      { status: 500 }
    );
  }
}