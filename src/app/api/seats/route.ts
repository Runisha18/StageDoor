import { NextRequest } from "next/server";
import { createSeatsController } from "@/controllers/seatController";

export async function POST(request: NextRequest) {
  return await createSeatsController(request);
}