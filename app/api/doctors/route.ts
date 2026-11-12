import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import DoctorModel from "@/models/Doctor";
import { seedDatabase } from "@/lib/seedData";

export async function GET(request: NextRequest) {
  try {
    await seedDatabase();
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const specialty = searchParams.get("specialty") || "";
    const availableToday = searchParams.get("today");
    const hospitalId = searchParams.get("hospitalId") || "";
    const maxFee = searchParams.get("maxFee");
    const minRating = searchParams.get("minRating");
    const minExp = searchParams.get("minExp");

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialty: { $regex: search, $options: "i" } },
        { subSpecialty: { $regex: search, $options: "i" } },
        { hospitalName: { $regex: search, $options: "i" } },
      ];
    }

    if (specialty) {
      query.specialty = { $regex: `^${specialty}$`, $options: "i" };
    }

    if (availableToday === "true") {
      query.isAvailableToday = true;
    }

    if (hospitalId && hospitalId !== "all") {
      query.hospitalId = hospitalId;
    }

    if (maxFee) {
      query.consultationFee = { $lte: Number(maxFee) };
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (minExp) {
      query.experienceYears = { $gte: Number(minExp) };
    }

    const doctors = await DoctorModel.find(query).sort({ rating: -1 }).lean();
    return NextResponse.json({ success: true, count: doctors.length, data: doctors });
  } catch (error: any) {
    console.error("[Doctors API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
