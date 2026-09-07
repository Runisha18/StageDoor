import { NextRequest } from "next/server";
import {
  createBookingController,
  getUserBookingsController,
} from "@/controllers/bookingController";

export async function GET(request: NextRequest) {
  return await getUserBookingsController(request);
}

export async function POST(request: NextRequest) {
  return await createBookingController(request);
}