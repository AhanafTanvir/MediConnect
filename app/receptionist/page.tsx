"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { IAppointment, IQueueState } from "@/types";
import { announcePatient, playChime, stopAnnouncement } from "@/lib/audioAnnouncement";
import {
  Search,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Plus,
  Tv,
  Filter,
  Eye,
  ShieldAlert,
  ArrowRight,
  X,
  Phone,
  Volume2,
  VolumeX,
  Megaphone,
  Sparkles,
  Check,
} from "lucide-react";

export default function ReceptionistPage() {
  const [queueState, setQueueState] = useState<IQueueState | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [skipModalAppt, setSkipModalAppt] = useState<IAppointment | null>(null);
  const [skipReason, setSkipReason] = useState("");
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("+1 (555) ");
  const [walkInReason, setWalkInReason] = useState("Walk-in acute triage");
  const [loading, setLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [announcementText, setAnnouncementText] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/queue");
      const json = await res.json();
      if (json.success && json.data) {
        setQueueState(json.data);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerAnnouncement = (serialNumber: string, patientName: string) => {
    if (!audioEnabled) {
      setFeedbackMessage(`Called Serial #${serialNumber} (${patientName}) [Audio Announcement is Muted]`);
      setTimeout(() => setFeedbackMessage(null), 4000);
      return;
    }

    const message = `Serial #${serialNumber} — ${patientName} called to Room 408`;
    setAnnouncementText(message);

    announcePatient(serialNumber, patientName, "Room 408", {
      onStart: () => {},
      onEnd: () => {
        setTimeout(() => setAnnouncementText(null), 3000);
      },
    });
  };

  const handleAction = async (action: string, appointmentId: string, extra?: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          appointmentId,
          doctorId: queueState?.doctorId,
          actorName: "Clara Evans (Receptionist)",
          ...extra,
        }),
      });
      const json = await res.json();

      if (action === "call" && json.calledPatient) {
        triggerAnnouncement(json.calledPatient.serialNumber, json.calledPatient.patientName);
      }

      fetchQueue();
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (appointmentId?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          appointmentId,
          doctorId: queueState?.doctorId,
          actorName: "Clara Evans (Receptionist)",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedbackMessage("Consultation marked completed. Click 'Next Patient' to announce the next in line.");
        setTimeout(() => setFeedbackMessage(null), 5000);
        fetchQueue();
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "callNext",
          doctorId: queueState?.doctorId,
          actorName: "Clara Evans (Receptionist)",
        }),
      });
      const json = await res.json();
      if (json.success && json.calledPatient) {
        triggerAnnouncement(json.calledPatient.serialNumber, json.calledPatient.patientName);
        fetchQueue();
      } else if (!json.success) {
        setFeedbackMessage(json.error || "No waiting patients available in queue.");
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAndNext = async (appointmentId?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "completeAndNext",
          appointmentId,
          doctorId: queueState?.doctorId,
          actorName: "Clara Evans (Receptionist)",
        }),
      });
      const json = await res.json();
      if (json.success && json.calledPatient) {
        triggerAnnouncement(json.calledPatient.serialNumber, json.calledPatient.patientName);
        fetchQueue();
      } else if (!json.success) {
        setFeedbackMessage(json.error || "Action could not be completed.");
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const submitSkip = async () => {
    if (!skipModalAppt || !skipReason.trim()) return;
    await handleAction("skip", skipModalAppt._id as string, { reason: skipReason });
    setSkipModalAppt(null);
    setSkipReason("");
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || !queueState?.doctorId) return;
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: queueState.doctorId,
          patientName: walkInName,
          patientPhone: walkInPhone,
          appointmentDate: todayStr,
          timeSlot: nowTime,
          reasonForVisit: walkInReason,
          symptoms: ["Walk-In Arrival"],
        }),
      });

      setWalkInOpen(false);
      setWalkInName("");
      fetchQueue();
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Appointments
  const appointments =
    queueState?.queueList?.filter((a) => {
      const matchSearch =
        a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.patientMrn.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = selectedStatus === "all" || a.status === selectedStatus;
      return matchSearch && matchStatus;
    }) || [];

  const activeInRoomAppt = queueState?.queueList?.find((a) => a.status === "IN_CONSULTATION");
  const calledAppt = queueState?.queueList?.find((a) => a.status === "CALLED");
  const nextWaitingAppt = queueState?.queueList?.find(
    (a) => a.status === "WAITING" || a.status === "CHECKED_IN"
  );
  const candidateNext = calledAppt || nextWaitingAppt;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-black text-slate-900">Reception Triage & Queue Desk</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              Station 02 • St. Jude Pavilion
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Audio Announcement Toggle */}
            <button
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                if (!audioEnabled) {
                  playChime();
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs cursor-pointer ${
                audioEnabled
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                  : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"
              }`}
              title="Toggle Voice Speech & Chime Announcement"
            >
              {audioEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span>Voice Calling: {audioEnabled ? "ON" : "OFF"}</span>
            </button>

            {/* Open 1920x1080 Waiting Room Screen Button */}
            <Link
              href="/waiting-room"
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
            >
              <Tv className="w-4 h-4 text-emerald-400" />
              <span>Launch Waiting Room TV Display</span>
            </Link>

            <button
              onClick={() => setWalkInOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#16A878] hover:bg-[#11835D] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Walk-In</span>
            </button>
          </div>
        </header>

        {/* Operational Stats Bar & Action Center */}
        <div className="p-6 space-y-6">
          {/* Live Announcement Toast/Banner */}
          {announcementText && (
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white px-5 py-3.5 rounded-2xl shadow-md flex items-center justify-between border border-emerald-400/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>Live Public Voice Announcement Broadcast</span>
                  </div>
                  <div className="text-sm font-black text-white">
                    {announcementText}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    stopAnnouncement();
                    setAnnouncementText(null);
                  }}
                  className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold text-white transition cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Feedback Toast */}
          {feedbackMessage && !announcementText && (
            <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{feedbackMessage}</span>
              </div>
              <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Dedicated Doctor Room & Queue Calling Control Station */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Doctor Room 408 • Live Queue Calling Station
                </h2>
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Dr. Sarah Jenkins, MD FACC
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
              {/* Box 1: Currently In Room (5 cols) */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Now in Examination Room
                  </span>
                  {activeInRoomAppt ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      In Consultation
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">
                      Room Available
                    </span>
                  )}
                </div>

                <div className="my-2">
                  {activeInRoomAppt ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-emerald-800">
                          #{activeInRoomAppt.serialNumber}
                        </span>
                        <span className="text-base font-bold text-slate-900 truncate">
                          {activeInRoomAppt.patientName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {activeInRoomAppt.reasonForVisit || "Consultation in progress"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs">
                      <div className="font-bold text-slate-700">Room 408 is currently clear</div>
                      <div className="text-[11px] text-slate-400">
                        Click the Next button to call and announce the next patient.
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                  {activeInRoomAppt ? (
                    <button
                      onClick={() => handleComplete(activeInRoomAppt._id as string)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Patient Appointment</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      Ready for next intake
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow Indicator (1 col) */}
              <div className="hidden lg:flex lg:col-span-1 justify-center items-center text-slate-300">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Box 2: Next In Line & Calling Buttons (5 cols) */}
              <div className="lg:col-span-5 bg-gradient-to-br from-blue-50/80 via-emerald-50/30 to-white border border-blue-200 rounded-2xl p-4 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Next Patient In Line</span>
                  </span>
                  {candidateNext && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-bold">
                      {candidateNext.status === "CALLED" ? "Already Called" : "Waiting in Lobby"}
                    </span>
                  )}
                </div>

                <div className="my-2">
                  {candidateNext ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-blue-700">
                          #{candidateNext.serialNumber}
                        </span>
                        <span className="text-base font-bold text-slate-900 truncate">
                          {candidateNext.patientName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        Slot: {candidateNext.timeSlot} • Reason: {candidateNext.reasonForVisit}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs">
                      <div className="font-bold text-slate-700">Queue is caught up</div>
                      <div className="text-[11px] text-slate-400">No further patients waiting for today.</div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-blue-200/60 flex flex-wrap items-center gap-2">
                  {/* THE NEXT BUTTON */}
                  <button
                    onClick={handleCallNext}
                    disabled={!candidateNext || loading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#16A878] hover:from-blue-700 hover:to-[#11835D] active:scale-95 text-white text-xs font-black transition shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                    title="Call next patient and announce name and serial number aloud"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>Next Patient ({candidateNext ? `#${candidateNext.serialNumber}` : "Next"})</span>
                  </button>

                  {/* Announce Again Button */}
                  {candidateNext && (
                    <button
                      onClick={() => triggerAnnouncement(candidateNext.serialNumber, candidateNext.patientName)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                      title="Replay hospital chime and voice announcement"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-600" />
                      <span>Announce Again</span>
                    </button>
                  )}

                  {/* Complete & Call Next (1-click transition) */}
                  {activeInRoomAppt && candidateNext && (
                    <button
                      onClick={() => handleCompleteAndNext(activeInRoomAppt._id as string)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      title="Complete current patient and immediately call the next patient"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Complete & Next</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Now In Doctor Room</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                #{queueState?.currentServingSerial || "A-022"}
              </div>
              <div className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                {queueState?.activePatientName || "Rahim Hasan"}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Next Called Patient</div>
              <div className="text-2xl font-black text-blue-700 mt-1">
                #{queueState?.nextEligibleSerial || "A-023"}
              </div>
              <div className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                {queueState?.nextPatientName || "Nusrat Jahan"}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Waiting in Lobby</div>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {queueState?.waitingCount || 4} Patients
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Avg dwell: 11 mins</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Completed Today</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {queueState?.completedCount || 14}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Discharged smoothly</div>
            </div>
          </div>

          {/* Table & Control Center */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            {/* Table Controls */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by patient name, MRN, or serial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {["all", "WAITING", "CALLED", "IN_CONSULTATION", "SCHEDULED", "COMPLETED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      selectedStatus === st
                        ? "bg-[#16A878] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st === "all" ? "All Patients" : st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Patients Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Serial</th>
                    <th className="py-3 px-4">Patient Name & MRN</th>
                    <th className="py-3 px-4">Appointment Slot</th>
                    <th className="py-3 px-4">Reason for Visit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((appt) => {
                    const isInRoom = appt.status === "IN_CONSULTATION";
                    const isCalled = appt.status === "CALLED";
                    const isWaiting = appt.status === "WAITING" || appt.status === "CHECKED_IN";
                    const isScheduled = appt.status === "SCHEDULED";
                    const isCompleted = appt.status === "COMPLETED";

                    return (
                      <tr
                        key={appt._id}
                        className={`hover:bg-slate-50/70 transition ${
                          isInRoom ? "bg-emerald-50/40" : isCalled ? "bg-blue-50/30" : ""
                        }`}
                      >
                        {/* Serial */}
                        <td className="py-3.5 px-4">
                          <span className="font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            #{appt.serialNumber}
                          </span>
                        </td>

                        {/* Name & MRN */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{appt.patientName}</div>
                          <div className="text-[11px] text-slate-500">
                            MRN: #{appt.patientMrn} • {appt.patientPhone}
                          </div>
                        </td>

                        {/* Slot */}
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {appt.timeSlot}
                        </td>

                        {/* Reason */}
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {appt.reasonForVisit}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              isInRoom
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : isCalled
                                ? "bg-blue-100 text-blue-800 border border-blue-300"
                                : isWaiting
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : isCompleted
                                ? "bg-slate-100 text-slate-600"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {isInRoom && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />}
                            {appt.status.replace("_", " ")}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {isInRoom && (
                              <button
                                onClick={() => handleComplete(appt._id as string)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Complete consultation for this patient"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Complete</span>
                              </button>
                            )}

                            {isScheduled && (
                              <button
                                onClick={() => handleAction("checkin", appt._id as string)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition cursor-pointer"
                              >
                                Check In
                              </button>
                            )}

                            {isWaiting && (
                              <button
                                onClick={() => handleAction("call", appt._id as string)}
                                className="px-3 py-1.5 rounded-lg bg-[#2878D0] text-white font-bold hover:bg-[#1E5EA4] transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Call patient & announce name and serial number aloud"
                              >
                                <Megaphone className="w-3.5 h-3.5" />
                                <span>Call & Announce</span>
                              </button>
                            )}

                            {isCalled && (
                              <>
                                <button
                                  onClick={() => triggerAnnouncement(appt.serialNumber, appt.patientName)}
                                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Repeat voice announcement aloud"
                                >
                                  <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Announce</span>
                                </button>
                                <button
                                  onClick={() => handleAction("enter", appt._id as string)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition cursor-pointer"
                                >
                                  Mark Enter Room
                                </button>
                              </>
                            )}

                            {!isCompleted && appt.status !== "NO_SHOW" && (
                              <button
                                onClick={() => setSkipModalAppt(appt)}
                                className="px-2 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-slate-50 transition cursor-pointer"
                                title="Skip patient with recorded reason"
                              >
                                Skip
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Skip Patient Modal */}
      {skipModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Skip Patient #{skipModalAppt.serialNumber}
              </h3>
              <button onClick={() => setSkipModalAppt(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Skipping {skipModalAppt.patientName} requires a mandatory audit log entry. This action updates the queue state immediately.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Skipping (Mandatory)
              </label>
              <textarea
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                placeholder="e.g. Patient not present in waiting area after 3 calls..."
                rows={3}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSkipModalAppt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={submitSkip}
                disabled={!skipReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walk-in Modal */}
      {walkInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleCreateWalkIn} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Register Walk-In Patient</h3>
              <button type="button" onClick={() => setWalkInOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name</label>
              <input
                type="text"
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit</label>
              <input
                type="text"
                value={walkInReason}
                onChange={(e) => setWalkInReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWalkInOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#16A878] text-white text-xs font-bold hover:bg-[#11835D]"
              >
                Issue Serial Token
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
