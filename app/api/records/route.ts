import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MedicalRecordModel from "@/models/MedicalRecord";
import { seedDatabase } from "@/lib/seedData";

export async function GET(request: NextRequest) {
  try {
    await seedDatabase();
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patientId");
    const category = searchParams.get("category");

    const query: any = {};
    if (patientId) query.patientId = patientId;
    if (category && category !== "all") query.category = category;

    const records = await MedicalRecordModel.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: records.length, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
