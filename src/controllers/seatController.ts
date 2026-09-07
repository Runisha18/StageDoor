import { NextRequest, NextResponse } from "next/server";
import { createSeats , getSeatsByEvent,
} from "@/services/seatService";
import { createSeatsSchema } from "@/types/seat";
import { requireAdmin } from "@/lib/auth";

export async function createSeatsController(request: NextRequest) {
  try {
    // 1. Check whether the user is an admin
    await requireAdmin(request);

    // 2. Read request body
    const body = await request.json();

    // 3. Validate the request data
    const validationResult = createSeatsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid seat data",
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // 4. Generate and create seats
    const seats = await createSeats(validationResult.data);

    // 5. Return the created seats
    return NextResponse.json(
      {
        success: true,
        message: "Seats created successfully",
        seats,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create seats:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create seats";

    if (message === "Authentication token is missing") {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 401 }
      );
    }

    if (message === "Admin access required") {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 403 }
      );
    }

    if (message === "Event not found") {
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
        message: "Failed to create seats",
      },
      { status: 500 }
    );
  }
}

//The service identifies what went wrong; the controller translates it into an appropriate HTTP response.
//200 → successful GET
/** 201 → resource successfully created
400 → invalid request data
401 → not authenticated
403 → authenticated but not an admin
404 → requested resource doesn't exist
500 → unexpected server error*/

export async function getSeatsByEventController(eventId: string) {
  try {
    const seats = await getSeatsByEvent(eventId);

    return NextResponse.json({
      success: true,
      seats,
    });
  } catch (error) {
    console.error("Failed to fetch seats:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch seats",
      },
      { status: 500 }
    );
  }
}

