import { NextRequest } from "next/server";
import {
  getEventsController,
  createEventController,
} from "@/controllers/eventController";

export async function GET(
  request: NextRequest
) {
  return await getEventsController(request);
}

export async function POST(
  request: NextRequest
) {
  return await createEventController(request);
}