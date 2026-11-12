import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import DoctorModel from "@/models/Doctor";
import HospitalModel from "@/models/Hospital";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const doctor = await DoctorModel.findById(id).lean();

    if (!doctor) {
      return NextResponse.json({ success: false, error: "Doctor not found" }, { status: 404 });
    }

    let hospital = null;
    if (doctor.hospitalId) {
      hospital = await HospitalModel.findById(doctor.hospitalId).lean();
    }

    return NextResponse.json({ success: true, data: { ...doctor, hospital } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
