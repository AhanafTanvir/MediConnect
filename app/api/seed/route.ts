import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seedData";

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[Seed API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
