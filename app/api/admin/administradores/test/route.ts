import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "API de administradores está funcionando",
    timestamp: new Date().toISOString()
  });
}
