import { NextRequest } from "next/server";
import { getAllBookingsController } from "@/controllers/bookingController";

export const dynamic = "force-dynamic"; //This route depends on request information such as authentication headers, so don't try to pre-render it.

export async function GET(request: NextRequest) {
  return await getAllBookingsController(request);
}