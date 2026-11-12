import { NextRequest, NextResponse } from "next/server";
import { QueueService } from "@/services/queueService";
import { seedDatabase } from "@/lib/seedData";

export async function GET(request: NextRequest) {
  try {
    await seedDatabase();
    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get("doctorId") || undefined;
    const date = searchParams.get("date") || undefined;

    const queueState = await QueueService.getQueueState(doctorId, date);
    return NextResponse.json({ success: true, data: queueState });
  } catch (error: any) {
    console.error("[Queue API GET Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, appointmentId, reason, actorName, doctorId } = body;

    let result;
    switch (action) {
      case "checkin":
        result = await QueueService.checkIn(appointmentId, actorName || "Receptionist");
        break;
      case "call":
        result = await QueueService.callPatient(appointmentId, actorName || "Staff Console");
        break;
      case "callNext":
      case "next":
        result = await QueueService.callNext(doctorId, actorName || "Clara Evans (Receptionist)");
        break;
      case "completeAndNext":
        result = await QueueService.completeAndCallNext(appointmentId, doctorId, actorName || "Clara Evans (Receptionist)");
        break;
      case "enter":
        result = await QueueService.enterRoom(appointmentId, actorName || "Doctor S. Thorne");
        break;
      case "complete":
        result = await QueueService.completeConsultation(appointmentId, actorName || "Dr. S. Thorne", doctorId);
        break;
      case "skip":
        result = await QueueService.skipPatient(appointmentId, reason || "Patient not responding in waiting lobby", actorName || "Receptionist");
        break;
      default:
        return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
    }

    // Return the fresh authoritative queue state
    const queueState = await QueueService.getQueueState(doctorId);
    return NextResponse.json({
      success: true,
      actionResult: result,
      calledPatient: result,
      data: queueState,
    });
  } catch (error: any) {
    console.error("[Queue API POST Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
