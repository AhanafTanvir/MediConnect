import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AppointmentModel from "@/models/Appointment";
import { QueueService } from "@/services/queueService";
import { seedDatabase } from "@/lib/seedData";

export async function GET(request: NextRequest) {
  try {
    await seedDatabase();
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patientId");
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    const query: any = {};
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;
    if (status) query.status = status;
    if (date) query.appointmentDate = date;

    const appointments = await AppointmentModel.find(query).sort({ appointmentDate: -1, serialNumber: 1 }).lean();
    return NextResponse.json({ success: true, count: appointments.length, data: appointments });
  } catch (error: any) {
    console.error("[Appointments GET Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      patientName,
      patientPhone,
      patientEmail,
      patientMrn,
      doctorId,
      appointmentDate,
      timeSlot,
      reasonForVisit,
      symptoms,
    } = body;

    if (!patientName || !patientPhone || !doctorId || !appointmentDate || !timeSlot) {
      return NextResponse.json(
        { success: false, error: "Missing required booking fields (patientName, phone, doctorId, date, timeSlot)." },
        { status: 400 }
      );
    }

    const appointment = await QueueService.bookAppointment({
      patientId: patientId || "patient_self",
      patientName,
      patientPhone,
      patientEmail,
      patientMrn,
      doctorId,
      appointmentDate,
      timeSlot,
      reasonForVisit,
      symptoms: symptoms || [],
    });

    return NextResponse.json({ success: true, data: appointment }, { status: 201 });
  } catch (error: any) {
    console.error("[Appointments POST Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
