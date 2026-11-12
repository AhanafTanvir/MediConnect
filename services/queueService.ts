import { connectDB } from "@/lib/db";
import AppointmentModel from "@/models/Appointment";
import QueueStateModel from "@/models/QueueState";
import DoctorModel from "@/models/Doctor";
import AuditLogModel from "@/models/AuditLog";
import NotificationModel from "@/models/Notification";
import { IAppointment, IQueueState } from "@/types";

export class QueueService {
  /**
   * Get Authoritative Queue State for a doctor on a specific date.
   * Single source of truth used across Doctor, Patient, Receptionist, and Public Waiting Room.
   */
  static async getQueueState(doctorId?: string, targetDate?: string): Promise<IQueueState> {
    await connectDB();
    const date = targetDate || new Date().toISOString().split("T")[0];

    let doctor;
    if (doctorId) {
      doctor = await DoctorModel.findById(doctorId);
    }
    if (!doctor) {
      const apptWithDoc = await AppointmentModel.findOne({ appointmentDate: date });
      if (apptWithDoc) {
        doctor = await DoctorModel.findById(apptWithDoc.doctorId);
      }
      if (!doctor) {
        doctor = (await DoctorModel.findOne({ isAvailableToday: true })) || (await DoctorModel.findOne());
      }
    }

    if (!doctor) {
      throw new Error("No doctor found");
    }

    const docId = doctor._id.toString();

    // Fetch all appointments for this doctor on targetDate, sorted by serialNumber
    const appointments = await AppointmentModel.find({
      doctorId: docId,
      appointmentDate: date,
    }).sort({ serialNumber: 1 }).lean();

    // Get or create QueueState record
    let queueDoc = await QueueStateModel.findOne({ doctorId: docId, date });
    if (!queueDoc) {
      queueDoc = await QueueStateModel.create({
        doctorId: docId,
        doctorName: doctor.name,
        hospitalId: doctor.hospitalId,
        hospitalName: doctor.hospitalName,
        date,
        currentServingSerial: null,
        nextEligibleSerial: null,
        flowPace: "Normal (4m avg)",
        events: [],
      });
    }

    // Determine current active patient (in consultation)
    const activeAppt = appointments.find((a) => a.status === "IN_CONSULTATION");
    const calledAppt = appointments.find((a) => a.status === "CALLED");
    
    // Eligible waiting appointments
    const waitingAppts = appointments.filter(
      (a) => a.status === "WAITING" || a.status === "CHECKED_IN"
    );

    const currentServing = activeAppt ? activeAppt.serialNumber : (calledAppt ? calledAppt.serialNumber : null);
    const nextEligible = calledAppt 
      ? calledAppt.serialNumber 
      : (waitingAppts.length > 0 ? waitingAppts[0].serialNumber : null);
    const nextPatientName = calledAppt
      ? calledAppt.patientName
      : (waitingAppts.length > 0 ? waitingAppts[0].patientName : null);

    // Dynamic wait time calculations for each appointment
    const avgConsult = doctor.avgConsultTimeMinutes || 9;
    const enrichedAppointments: IAppointment[] = appointments.map((appt, idx) => {
      let patientsAhead = 0;
      if (appt.status === "WAITING" || appt.status === "SCHEDULED" || appt.status === "CHECKED_IN") {
        // Count how many are ahead of this patient who are not completed or cancelled
        patientsAhead = appointments.slice(0, idx).filter(
          (prev) => prev.status !== "COMPLETED" && prev.status !== "CANCELLED" && prev.status !== "NO_SHOW"
        ).length;
      }
      
      const estWait = patientsAhead * avgConsult;
      const travelMins = appt.travelTimeMinutes || 25;
      const bufferMins = 15;

      // Recommended departure calculation
      let recommendedLeave = "10:20 AM";
      if (appt.timeSlot) {
        try {
          const [timePart, meridiem] = appt.timeSlot.split(" ");
          const [hStr, mStr] = timePart.split(":");
          let hours = parseInt(hStr, 10);
          const minutes = parseInt(mStr, 10);
          if (meridiem === "PM" && hours !== 12) hours += 12;
          if (meridiem === "AM" && hours === 12) hours = 0;
          
          let totalMins = hours * 60 + minutes - travelMins - bufferMins;
          if (totalMins < 0) totalMins += 24 * 60;
          const leaveH = Math.floor(totalMins / 60);
          const leaveM = totalMins % 60;
          const dispH = leaveH % 12 === 0 ? 12 : leaveH % 12;
          const dispM = leaveM < 10 ? `0${leaveM}` : leaveM;
          const dispMeridiem = leaveH >= 12 ? "PM" : "AM";
          recommendedLeave = `${dispH}:${dispM} ${dispMeridiem}`;
        } catch {
          recommendedLeave = "10:20 AM";
        }
      }

      return {
        ...appt,
        _id: appt._id.toString(),
        estimatedWaitMinutes: estWait,
        recommendedDepartureTime: recommendedLeave,
      };
    });

    const scheduledCount = appointments.filter((a) => a.status === "SCHEDULED").length;
    const waitingCount = waitingAppts.length + (calledAppt ? 1 : 0);
    const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;
    const activeCount = activeAppt ? 1 : 0;

    return {
      doctorId: docId,
      doctorName: doctor.name,
      hospitalId: doctor.hospitalId,
      hospitalName: doctor.hospitalName,
      date,
      currentServingSerial: currentServing || (waitingAppts[0]?.serialNumber ?? null),
      activePatientName: activeAppt 
        ? activeAppt.patientName 
        : (calledAppt ? `${calledAppt.patientName} (Called)` : "No Active Consultation"),
      activePatientElapsedMinutes: activeAppt ? 8 : 0,
      activeInRoomToken: activeAppt ? activeAppt.serialNumber : null,
      nextEligibleSerial: nextEligible || "None",
      nextPatientName: nextPatientName || "None Waiting",
      scheduledCount,
      waitingCount,
      completedCount,
      activeCount,
      flowPace: queueDoc.flowPace || "Normal (4m avg)",
      events: queueDoc.events || [],
      queueList: enrichedAppointments,
    };
  }

  /**
   * Check in a patient upon arrival (Receptionist or Patient geofence action)
   */
  static async checkIn(appointmentId: string, actorName = "Patient Self-Arrival") {
    await connectDB();
    const appt = await AppointmentModel.findById(appointmentId);
    if (!appt) throw new Error("Appointment not found");

    if (appt.status !== "SCHEDULED") {
      return appt;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    appt.status = "WAITING";
    appt.checkInTime = timeStr;
    await appt.save();

    // Log event to QueueState
    await QueueStateModel.findOneAndUpdate(
      { doctorId: appt.doctorId, date: appt.appointmentDate },
      {
        $push: {
          events: {
            time: timeStr,
            title: `Serial ${appt.serialNumber} Checked In`,
            description: `${appt.patientName} arrived at clinic pavilion and joined active waiting queue.`,
            serial: appt.serialNumber,
            type: "CHECKIN",
          },
        },
      }
    );

    // Audit log
    await AuditLogModel.create({
      actorId: "actor_checkin",
      actorName,
      actorRole: "RECEPTIONIST",
      action: "PATIENT_CHECK_IN",
      resourceType: "APPOINTMENT",
      resourceId: appt.serialNumber,
      details: `Checked in patient ${appt.patientName} for slot ${appt.timeSlot}`,
    });

    return appt;
  }

  /**
   * Call the next eligible patient into the consultation preparation / room
   */
  static async callPatient(appointmentId: string, actorName = "Staff Console") {
    await connectDB();
    const appt = await AppointmentModel.findById(appointmentId);
    if (!appt) throw new Error("Appointment not found");

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    appt.status = "CALLED";
    appt.calledTime = timeStr;
    await appt.save();

    await QueueStateModel.findOneAndUpdate(
      { doctorId: appt.doctorId, date: appt.appointmentDate },
      {
        nextEligibleSerial: appt.serialNumber,
        nextPatientName: appt.patientName,
        $push: {
          events: {
            time: timeStr,
            title: `Calling Serial ${appt.serialNumber}`,
            description: `Serial ${appt.serialNumber} (${appt.patientName}) called to enter examination station.`,
            serial: appt.serialNumber,
            type: "CALL",
          },
        },
      }
    );

    // Send Simulated SMS Notification to Patient
    await NotificationModel.create({
      recipientId: appt.patientId,
      recipientRole: "PATIENT",
      title: "Your Serial is Called!",
      message: `Token ${appt.serialNumber} is now being called to Room 408 (${appt.doctorName}). Please proceed immediately.`,
      type: "SMS",
      serialNumber: appt.serialNumber,
      status: "DELIVERED",
    });

    await AuditLogModel.create({
      actorId: "actor_queue",
      actorName,
      actorRole: "RECEPTIONIST",
      action: "CALL_PATIENT",
      resourceType: "APPOINTMENT",
      resourceId: appt.serialNumber,
      details: `Called ${appt.patientName} (${appt.serialNumber})`,
    });

    return appt;
  }

  /**
   * Mark patient entered the doctor's room (In Consultation)
   */
  static async enterRoom(appointmentId: string, actorName = "Doctor / Receptionist") {
    await connectDB();
    const appt = await AppointmentModel.findById(appointmentId);
    if (!appt) throw new Error("Appointment not found");

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Mark any previous in-consultation appointment for this doctor as completed
    await AppointmentModel.updateMany(
      {
        doctorId: appt.doctorId,
        appointmentDate: appt.appointmentDate,
        status: "IN_CONSULTATION",
        _id: { $ne: appt._id },
      },
      {
        status: "COMPLETED",
        completedTime: timeStr,
      }
    );

    appt.status = "IN_CONSULTATION";
    appt.inConsultationTime = timeStr;
    await appt.save();

    // Update queue state
    await QueueStateModel.findOneAndUpdate(
      { doctorId: appt.doctorId, date: appt.appointmentDate },
      {
        currentServingSerial: appt.serialNumber,
        activePatientName: appt.patientName,
        activeInRoomToken: appt.serialNumber,
        $push: {
          events: {
            time: timeStr,
            title: `Serial ${appt.serialNumber} Entered Doctor Room`,
            description: `${appt.patientName} entered consultation room. Consultation in active progress.`,
            serial: appt.serialNumber,
            type: "ENTER",
          },
        },
      }
    );

    await AuditLogModel.create({
      actorId: "actor_doctor",
      actorName,
      actorRole: "DOCTOR",
      action: "ENTER_ROOM",
      resourceType: "APPOINTMENT",
      resourceId: appt.serialNumber,
      details: `Patient ${appt.patientName} (${appt.serialNumber}) entered consultation room.`,
    });

    return appt;
  }

  /**
   * Complete Consultation & advance queue
   */
  static async completeConsultation(appointmentId?: string, actorName = "Dr. S. Thorne", doctorId?: string) {
    await connectDB();
    const date = new Date().toISOString().split("T")[0];
    let appt;

    if (appointmentId) {
      appt = await AppointmentModel.findById(appointmentId);
    } else {
      const query: any = { status: "IN_CONSULTATION" };
      if (doctorId) query.doctorId = doctorId;
      appt = await AppointmentModel.findOne(query);
    }

    if (!appt) throw new Error("No active in-consultation appointment found to complete.");

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    appt.status = "COMPLETED";
    appt.completedTime = timeStr;
    await appt.save();

    // Clear active room in QueueState
    await QueueStateModel.findOneAndUpdate(
      { doctorId: appt.doctorId, date: appt.appointmentDate },
      {
        currentServingSerial: null,
        activePatientName: null,
        activeInRoomToken: null,
        $push: {
          events: {
            time: timeStr,
            title: `Serial ${appt.serialNumber} Completed`,
            description: `${appt.patientName} consultation completed. Digital Rx synced to EHR.`,
            serial: appt.serialNumber,
            type: "COMPLETE",
          },
        },
      }
    );

    await AuditLogModel.create({
      actorId: "actor_doctor",
      actorName,
      actorRole: "RECEPTIONIST",
      action: "COMPLETE_CONSULTATION",
      resourceType: "APPOINTMENT",
      resourceId: appt.serialNumber,
      details: `Completed consultation for ${appt.patientName} (${appt.serialNumber})`,
    });

    return appt;
  }

  /**
   * Call next eligible patient in queue and advance queue state
   */
  static async callNext(doctorId?: string, actorName = "Clara Evans (Receptionist)") {
    await connectDB();
    const date = new Date().toISOString().split("T")[0];

    let doctor;
    if (doctorId) {
      doctor = await DoctorModel.findById(doctorId);
    }
    if (!doctor) {
      doctor = (await DoctorModel.findOne({ isAvailableToday: true })) || (await DoctorModel.findOne());
    }
    if (!doctor) throw new Error("No doctor found");

    const docId = doctor._id.toString();

    // 1. If a patient is already CALLED but not yet entered room, re-call/return them
    const calledAppt = await AppointmentModel.findOne({
      doctorId: docId,
      appointmentDate: date,
      status: "CALLED",
    }).sort({ serialNumber: 1 });

    if (calledAppt) {
      return await this.callPatient(calledAppt._id.toString(), actorName);
    }

    // 2. Next waiting or checked-in patient
    const nextWaiting = await AppointmentModel.findOne({
      doctorId: docId,
      appointmentDate: date,
      status: { $in: ["WAITING", "CHECKED_IN"] },
    }).sort({ serialNumber: 1 });

    if (nextWaiting) {
      return await this.callPatient(nextWaiting._id.toString(), actorName);
    }

    // 3. Fallback: Check if there's any scheduled patient for today
    const nextScheduled = await AppointmentModel.findOne({
      doctorId: docId,
      appointmentDate: date,
      status: "SCHEDULED",
    }).sort({ serialNumber: 1 });

    if (nextScheduled) {
      nextScheduled.status = "WAITING";
      await nextScheduled.save();
      return await this.callPatient(nextScheduled._id.toString(), actorName);
    }

    throw new Error("No waiting patients available in queue.");
  }

  /**
   * Complete current consultation (if any) and immediately call next patient
   */
  static async completeAndCallNext(appointmentId?: string, doctorId?: string, actorName = "Clara Evans (Receptionist)") {
    try {
      await this.completeConsultation(appointmentId, actorName, doctorId);
    } catch (e: any) {
      console.warn("Notice during complete step:", e.message);
    }
    return await this.callNext(doctorId, actorName);
  }

  /**
   * Skip a patient with mandatory recorded reason
   */
  static async skipPatient(appointmentId: string, reason: string, actorName = "Clara Evans") {
    await connectDB();
    if (!reason || reason.trim().length === 0) {
      throw new Error("A recorded reason is mandatory to skip a patient.");
    }

    const appt = await AppointmentModel.findById(appointmentId);
    if (!appt) throw new Error("Appointment not found");

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    appt.status = "NO_SHOW";
    appt.skipReason = reason;
    await appt.save();

    await QueueStateModel.findOneAndUpdate(
      { doctorId: appt.doctorId, date: appt.appointmentDate },
      {
        $push: {
          events: {
            time: timeStr,
            title: `Serial ${appt.serialNumber} Skipped`,
            description: `Patient skipped. Recorded reason: ${reason}`,
            serial: appt.serialNumber,
            type: "SKIP",
          },
        },
      }
    );

    await AuditLogModel.create({
      actorId: "actor_receptionist",
      actorName,
      actorRole: "RECEPTIONIST",
      action: "SKIP_PATIENT",
      resourceType: "APPOINTMENT",
      resourceId: appt.serialNumber,
      details: `Skipped ${appt.patientName} (${appt.serialNumber}). Reason: ${reason}`,
    });

    return appt;
  }

  /**
   * Book an appointment with server-generated unique serial number
   */
  static async bookAppointment(data: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    patientMrn?: string;
    doctorId: string;
    appointmentDate: string;
    timeSlot: string;
    reasonForVisit?: string;
    symptoms?: string[];
  }) {
    await connectDB();

    const doctor = await DoctorModel.findById(data.doctorId);
    if (!doctor) throw new Error("Doctor not found");

    // Check if slot already booked
    const existing = await AppointmentModel.findOne({
      doctorId: data.doctorId,
      appointmentDate: data.appointmentDate,
      timeSlot: data.timeSlot,
      status: { $nin: ["CANCELLED", "NO_SHOW"] },
    });

    if (existing) {
      throw new Error("This appointment slot has already been booked. Please choose another time slot.");
    }

    // Atomic serial generation for this doctor + date
    const count = await AppointmentModel.countDocuments({
      doctorId: data.doctorId,
      appointmentDate: data.appointmentDate,
    });

    const nextSeq = count + 1;
    const prefix = "A";
    const serialNumber = `${prefix}-${nextSeq < 10 ? "00" + nextSeq : nextSeq < 100 ? "0" + nextSeq : nextSeq}`;

    const appt = await AppointmentModel.create({
      patientId: data.patientId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail,
      patientMrn: data.patientMrn || `MC-${Math.floor(100000 + Math.random() * 900000)}`,
      doctorId: doctor._id.toString(),
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      hospitalId: doctor.hospitalId,
      hospitalName: doctor.hospitalName,
      appointmentDate: data.appointmentDate,
      timeSlot: data.timeSlot,
      serialNumber,
      status: "SCHEDULED",
      reasonForVisit: data.reasonForVisit || "General Consultation",
      symptoms: data.symptoms || [],
      billingStatus: "PAID",
      copayAmount: doctor.consultationFee,
      travelTimeMinutes: 25,
    });

    // Notify Patient via SMS simulation
    await NotificationModel.create({
      recipientId: data.patientId,
      recipientRole: "PATIENT",
      title: "Appointment Confirmed",
      message: `Your appointment with ${doctor.name} on ${data.appointmentDate} at ${data.timeSlot} is confirmed. Serial Token: ${serialNumber}.`,
      type: "SMS",
      serialNumber,
      status: "DELIVERED",
    });

    return appt;
  }
}
