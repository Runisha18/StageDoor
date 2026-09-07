import { NextRequest } from "next/server";
import { cancelBookingController } from "@/controllers/bookingController";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  return await cancelBookingController(
    request,
    params.bookingId
  );
}
/**Why PATCH?

We're not deleting the booking.

We're changing:

status: "confirmed"

to:

status: "cancelled" */