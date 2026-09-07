import { NextRequest } from "next/server";
import {
  createVenueController,
  getVenuesController,
} from "@/controllers/venueController";

export async function GET() {
  return await getVenuesController();
}

export async function POST(request: NextRequest) {
  return await createVenueController(request);
}