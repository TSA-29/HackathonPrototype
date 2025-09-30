import { NextRequest, NextResponse } from "next/server";
import { Server } from "socket.io";

let io: Server | null = null;

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: "Socket.IO server endpoint" });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: "Socket.IO server endpoint" });
}
