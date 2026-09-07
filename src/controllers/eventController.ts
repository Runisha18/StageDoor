import { NextRequest, NextResponse } from "next/server";
import { getAllEvents, createEvent,
  getEventById,
  updateEvent,
  deleteEvent, } from "@/services/eventService";
import { createEventSchema,
  updateEventSchema, } from "@/types/event";
import { requireAdmin } from "@/lib/auth";

export async function getEventsController(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const category =
      searchParams.get("category") || undefined;
    const city =
      searchParams.get("city") || undefined;

    const events = await getAllEvents({
      search,
      category,
      city,
    });

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Failed to fetch events:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch events",
      },
      { status: 500 }
    );
  }
}

export async function createEventController(request: NextRequest) {
  try {
    // 1. Check whether the user is an admin
    await requireAdmin(request);

    // 2. Read request body --> Get the JSON Body
    const body = await request.json();

    // 3. Validate the request data
    const validationResult = createEventSchema.safeParse(body);/**If someone sends:

{
  "title": "",
  "price": -500
}

validation fails and we return:

400 Bad Request

instead of sending bad data to MongoDB. */

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event data",
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // 4. Create the event
    const event = await createEvent(validationResult.data);

    // 5. Return the created event
    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully",
        event,
      },
      { status: 201 } //201 means The server successfully created a new resource.For a successful GET we use 200.
    );
  } catch (error) {
    console.error("Failed to create event:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create event";

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
        message: "Failed to create event",
      },
      { status: 500 }
    );

  }
}

export async function getEventByIdController(
  eventId: string
) {
  try {
    const event = await getEventById(eventId);

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Failed to fetch event:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch event";

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
        message: "Failed to fetch event",
      },
      { status: 500 }
    );
  }
}

/**It receives the request indirectly and says:

"I need all events. Service, you handle the data retrieval."

Controller
    ↓
getAllEvents()
    ↓
Service
    ↓
MongoDB*/

/**
 GET /api/events
       ↓
   route.ts       ← HTTP endpoint (next)
       ↓
eventController   ← HTTP response/error handling
       ↓
 eventService     ← data/business logic
       ↓
   Event.ts       ← Mongoose model
       ↓
   MongoDB
 */

   export async function updateEventController(
  request: NextRequest,
  eventId: string
) {
  try {
    await requireAdmin(request);//admin req

    const body = await request.json();

    const validationResult =
      updateEventSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event data",
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const event = await updateEvent(
      eventId,
      validationResult.data
    );

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Failed to update event:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update event";

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
        message: "Failed to update event",
      },
      { status: 500 }
    );
  }
}

export async function deleteEventController(
  request: NextRequest,
  eventId: string
) {
  try {
    await requireAdmin(request);

    const event = await deleteEvent(eventId);

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
      event,
    });
  } catch (error) {
    console.error("Failed to delete event:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete event";

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

    if (
  message ===
  "Cannot delete event because it has bookings"
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
        message: "Failed to delete event",
      },
      { status: 500 }
    );
  }
}