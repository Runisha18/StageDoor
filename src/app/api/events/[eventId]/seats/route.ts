import { NextRequest } from "next/server";
import { getSeatsByEventController } from "@/controllers/seatController";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  return await getSeatsByEventController(params.eventId);
}