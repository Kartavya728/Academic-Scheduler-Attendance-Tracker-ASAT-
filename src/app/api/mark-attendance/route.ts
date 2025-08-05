// src/app/api/mark-attendance/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Example: Connect to Supabase here to store attendance
  return NextResponse.json({ success: true, data: body })
}
