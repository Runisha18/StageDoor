import { NextRequest, NextResponse } from "next/server";
import { createVenue ,updateVenue, deleteVenue, getVenues,} from "@/services/venueService";
import { createVenueSchema ,updateVenueSchema, } from "@/types/venue";
import { requireAdmin } from "@/lib/auth";

export async function createVenueController(request: NextRequest) {
  try {
    // 1. Check whether the user is an admin
    await requireAdmin(request);

    // 2. Read request body
    const body = await request.json();

    // 3. Validate the request data
    const validationResult = createVenueSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid venue data",
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // 4. Create the venue
    const venue = await createVenue(validationResult.data);

    // 5. Return the created venue
    return NextResponse.json(
      {
        success: true,
        message: "Venue created successfully",
        venue,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create venue:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create venue";

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

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create venue",
      },
      { status: 500 }

    );
  }
}

export async function updateVenueController(
  request: NextRequest,
  venueId: string
) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    const validationResult =
      updateVenueSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid venue data",
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const venue = await updateVenue(
      venueId,
      validationResult.data
    );

    return NextResponse.json({
      success: true,
      message: "Venue updated successfully",
      venue,
    });
  } catch (error) {
    console.error("Failed to update venue:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update venue";

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

    if (message === "Venue not found") {
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
        message: "Failed to update venue",
      },
      { status: 500 }
    );
  }
}

export async function deleteVenueController(
  request: NextRequest,
  venueId: string
) {
  try {
    await requireAdmin(request);

    const venue = await deleteVenue(venueId);

    return NextResponse.json({
      success: true,
      message: "Venue deleted successfully",
      venue,
    });
  } catch (error) {
    console.error("Failed to delete venue:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete venue";

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

    if (message === "Venue not found") {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 404 }
      );
    }

    if (
      message ===
      "Cannot delete venue because it is being used by an event"
    ) {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete venue",
      },
      { status: 500 }
    );
  }
}

export async function getVenuesController() {
  try {
    const venues = await getVenues();

    return NextResponse.json({
      success: true,
      venues,
    });
  } catch (error) {
    console.error("Get venues failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch venues",
      },
      { status: 500 }
    );
  }
}