import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PrescriptionModel from "@/models/Prescription";
import MedicalRecordModel from "@/models/MedicalRecord";
import AuditLogModel from "@/models/AuditLog";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const appointmentId = searchParams.get("appointmentId");
    const patientId = searchParams.get("patientId");
    const doctorId = searchParams.get("doctorId");

    const query: any = {};
    if (appointmentId) query.appointmentId = appointmentId;
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;

    const prescriptions = await PrescriptionModel.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      appointmentId,
      patientId,
      patientName,
      patientMrn,
      doctorId,
      doctorName,
      doctorSpecialty,
      hospitalName,
      diagnosisCode,
      diagnosisName,
      severity,
      symptoms,
      clinicalAssessment,
      medications,
      dietaryAdvice,
      customAdvice,
      investigations,
      digitalSignature,
      isDraft,
    } = body;

    const todayStr = new Date().toISOString().split("T")[0];

    const prescription = await PrescriptionModel.findOneAndUpdate(
      { appointmentId },
      {
        appointmentId,
        patientId,
        patientName,
        patientMrn,
        doctorId,
        doctorName,
        doctorSpecialty,
        hospitalName,
        date: todayStr,
        diagnosisCode: diagnosisCode || "I10",
        diagnosisName: diagnosisName || "Essential (Primary) Hypertension",
        severity: severity || "Moderate",
        symptoms: symptoms || [],
        clinicalAssessment: clinicalAssessment || "",
        medications: medications || [],
        dietaryAdvice: dietaryAdvice || [],
        customAdvice: customAdvice || "",
        investigations: investigations || [],
        digitalSignature: digitalSignature || `Dr. ${doctorName}`,
        isDraft: isDraft ?? false,
        issuedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // If finalized (not draft), sync into patient's medical records
    if (!isDraft) {
      await MedicalRecordModel.create({
        patientId,
        patientName,
        category: "Prescription",
        title: `Digital Prescription #${prescription._id.toString().slice(-6).toUpperCase()}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        doctorName,
        hospitalName,
        summary: `${medications?.length || 0} medications prescribed for ${diagnosisName}.`,
        badge: "Active",
      });

      await AuditLogModel.create({
        actorId: doctorId,
        actorName: doctorName,
        actorRole: "DOCTOR",
        action: "ISSUE_PRESCRIPTION",
        resourceType: "PRESCRIPTION",
        resourceId: prescription._id.toString(),
        details: `Issued digital prescription for ${patientName} (${patientMrn})`,
      });
    }

    return NextResponse.json({ success: true, data: prescription });
  } catch (error: any) {
    console.error("[Prescription POST Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
