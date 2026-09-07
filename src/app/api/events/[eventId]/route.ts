import { NextRequest } from "next/server";
import {
  getEventByIdController,
  updateEventController,
  deleteEventController,
} from "@/controllers/eventController";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  return await getEventByIdController(
    params.eventId
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  return await updateEventController(
    request,
    params.eventId
  );
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  return await deleteEventController(
    request,
    params.eventId
  );
}
/**GET   /api/events/[eventId]  → View event
PATCH /api/events/[eventId]  → Admin update event 
DELETE /api/events/[eventId] → Delete (Admin)*/