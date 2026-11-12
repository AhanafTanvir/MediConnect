"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import InteractiveMap from "@/components/InteractiveMap";
import { IAppointment, IQueueState } from "@/types";
import {
  Car,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Share2,
  Sparkles,
  QrCode,
  Radio,
  FileText,
  Activity,
  PhoneCall,
  Bell,
  Settings,
} from "lucide-react";

export default function PatientDashboardPage() {
  const [queueState, setQueueState] = useState<IQueueState | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [porterRequested, setPorterRequested] = useState(false);
  const [activeToken, setActiveToken] = useState("A-024");

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/queue");
      const json = await res.json();
      if (json.success && json.data) {
        setQueueState(json.data);
      }
    } catch (e) {
      console.warn("Queue fetch error:", e);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleArrivalCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const myAppt = queueState?.queueList?.find((a) => a.serialNumber === activeToken);
      if (myAppt?._id) {
        await fetch("/api/queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "checkin",
            appointmentId: myAppt._id,
            actorName: "Arthur Dent (Self-Arrival)",
          }),
        });
      }
      setCheckedIn(true);
      fetchQueue();
    } catch (e) {
      console.warn(e);
    } finally {
      setCheckInLoading(false);
    }
  };

  const currentServing = queueState?.currentServingSerial || "A-019";
  const myAppt = queueState?.queueList?.find((a) => a.serialNumber === activeToken);

  // Stepper tokens
  const flowSteps = [
    { token: "A-019", label: "In Room", isCurrent: currentServing === "A-019" },
    { token: "A-020", label: "Next", isCurrent: currentServing === "A-020" },
    { token: "A-021", label: "Waiting", isCurrent: currentServing === "A-021" },
    { token: "A-022", label: "Waiting", isCurrent: currentServing === "A-022" },
    { token: "A-023", label: "Waiting", isCurrent: currentServing === "A-023" },
    { token: "A-024", label: "You", isYou: true },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">PATIENT PORTAL</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-bold text-slate-900">My Active Queue & Smart Departure</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Serial Sync Active • Updated 8s ago</span>
            </div>

            <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold">
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Clinical Emergency Line</span>
            </div>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                alt="Arthur Dent"
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">Arthur Dent</div>
                <div className="text-[10px] text-slate-500 font-medium">MRN: #MC-8849-01</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols */}
            <div className="lg:col-span-8 space-y-6">
              {/* Main Active Queue Token Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Your Assigned Serial Number
                    </div>
                    <div className="flex items-baseline gap-3 mt-0.5">
                      <span className="text-5xl font-black text-emerald-700 tracking-tight">
                        #{activeToken}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Confirmed Ticket</span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                      <span>Appointment with</span>
                      <span className="font-bold text-slate-900">Dr. Sarah Jenkins, MD</span>
                      <span className="text-slate-400">(Cardiology)</span>
                    </div>
                  </div>

                  {/* Now Consulting Badge */}
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                      Now Consulting
                    </div>
                    <div className="text-2xl font-black text-sky-900 my-0.5">
                      • #{currentServing}
                    </div>
                    <div className="text-[11px] font-semibold text-sky-700">
                      Room 402 • Station B
                    </div>
                  </div>
                </div>

                {/* Live Queue Flow Stepper */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>Live Queue Flow</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-xs">
                      4 Patients Ahead of You
                    </span>
                  </div>

                  {/* Stepper bubbles */}
                  <div className="grid grid-cols-6 gap-2 text-center pt-1">
                    {flowSteps.map((step) => (
                      <div
                        key={step.token}
                        className={`p-2.5 rounded-xl border transition ${
                          step.isYou
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-200"
                            : step.isCurrent
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="text-xs font-black truncate">{step.token}</div>
                        <div
                          className={`text-[10px] font-semibold truncate mt-0.5 ${
                            step.isYou ? "text-emerald-100 font-black" : "opacity-80"
                          }`}
                        >
                          {step.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3 Metric Badges: Est Wait, Drive Time, Leave By */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Est. Wait</div>
                    <div className="text-2xl font-black text-slate-900 my-0.5">~45 Mins</div>
                    <div className="text-[11px] text-slate-500 font-medium">Avg. 9m / consult</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Drive Time</div>
                    <div className="text-2xl font-black text-blue-700 my-0.5">25 Mins</div>
                    <div className="text-[11px] text-slate-500 font-medium">Metro Expwy (Normal)</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase">Leave By</div>
                    <div className="text-2xl font-black text-emerald-800 my-0.5">10:20 AM</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">+15m check-in buffer</div>
                  </div>
                </div>

                {/* Dynamic alert text */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Estimates adapt dynamically based on actual doctor consultation pace. You will receive an instant SMS and Push notification when Serial A-021 is called into the examination ante-room.
                  </span>
                </div>
              </div>

              {/* Arrival Check-in Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Arrival Check-in</h3>
                    <p className="text-xs text-slate-500">Auto-unlocks within 100m of Clinic Pavilion</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={handleArrivalCheckIn}
                    disabled={checkedIn || checkInLoading}
                    className={`flex-1 sm:flex-none py-2.5 px-5 rounded-xl font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 ${
                      checkedIn
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-[#16A878] hover:bg-[#11835D] text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{checkedIn ? "Checked In Successfully!" : checkInLoading ? "Verifying GPS..." : "Check In Upon Arrival"}</span>
                  </button>

                  <button className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition">
                    Reschedule
                  </button>

                  <button className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition" title="Show QR Ticket">
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Appointment Summary & Clinical Context */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Appointment Summary & Clinical Context
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    MRN: #MC-8849-01
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</div>
                    <div className="font-bold text-slate-900 mt-0.5">Today, Oct 24</div>
                    <div className="text-[11px] text-slate-500">Slot: 11:00 AM</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Consult Type</div>
                    <div className="font-bold text-slate-900 mt-0.5">In-Person Care</div>
                    <div className="text-[11px] text-slate-500">Cardiology Exam</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Billing Status</div>
                    <div className="font-bold text-emerald-700 mt-0.5">Paid in Full</div>
                    <div className="text-[11px] text-slate-500">$140.00 Copay</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Patient Profile</div>
                    <div className="font-bold text-slate-900 mt-0.5">Arthur Dent</div>
                    <div className="text-[11px] text-slate-500">Age 48 • O-Pos</div>
                  </div>
                </div>

                {/* Reported Symptoms note */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Reported Symptoms & Visit Objective:</span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                      Penicillin Allergy Active
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">
                    &quot;Routine post-hypertension quarterly follow-up. Experiencing mild morning lightheadedness with current Lisinopril dosage. Brought 14-day home BP log for review.&quot;
                  </p>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>HIPAA & MediConnect Encrypted Record</span>
                  </span>
                  <Link
                    href="#past-records"
                    className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>View Past Medical Records</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Destination Clinic & Live Events */}
            <div className="lg:col-span-4 space-y-6">
              {/* Destination Clinic Card with Map */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Destination Clinic
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Central Heart & Vascular Pavilion
                  </h3>
                  <p className="text-xs text-slate-500">Suite 402, 742 Evergreen Medical Blvd</p>
                </div>

                {/* Interactive Map */}
                <InteractiveMap
                  hospitalName="Central Heart & Vascular Pavilion"
                  address="Suite 402, 742 Evergreen Medical Blvd"
                  distance="14.2 miles"
                  travelTime="25m Fast Route"
                  routeLabel="via I-95 N"
                />

                {/* Doctor Mini Card */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
                    alt="Dr. Sarah Jenkins"
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>Dr. Sarah Jenkins</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="text-[11px] text-slate-500">Cardiovascular Specialist • 14 Yrs Exp</div>
                    <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>On schedule • 9m avg consult time</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Queue Events Live Log */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <h3 className="text-xs font-bold text-slate-900">Queue Events Live Log</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">Session Morning Shift</span>
                </div>

                <div className="space-y-3 text-xs">
                  {queueState?.events?.map((ev, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{ev.title}</span>
                          <span className="text-[10px] text-slate-400">{ev.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          {ev.description}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-slate-400 text-xs">No queue events logged yet.</div>
                  )}
                </div>

                {/* Porter Request */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Need a companion escort from the parking garage?</span>
                  <button
                    onClick={() => setPorterRequested(true)}
                    className="font-bold text-blue-600 hover:text-blue-700 transition"
                  >
                    {porterRequested ? "Porter Dispatched" : "Request Porter"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
