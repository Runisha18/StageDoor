import { NextRequest } from "next/server";
import { updateVenueController ,  deleteVenueController, } from "@/controllers/venueController";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { venueId: string } }
) {
  return await updateVenueController(
    request,
    params.venueId
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { venueId: string } }
) {
  return await deleteVenueController(
    request,
    params.venueId
  );
}