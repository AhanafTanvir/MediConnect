import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import HospitalModel from "@/models/Hospital";
import { seedDatabase } from "@/lib/seedData";

export async function GET(request: NextRequest) {
  try {
    await seedDatabase();
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const city = searchParams.get("city") || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { departments: { $in: [new RegExp(search, "i")] } },
      ];
    }
    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    const hospitals = await HospitalModel.find(query).sort({ rating: -1 }).lean();
    return NextResponse.json({ success: true, count: hospitals.length, data: hospitals });
  } catch (error: any) {
    console.error("[Hospitals API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
