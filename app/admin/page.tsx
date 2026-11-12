"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Shield,
  Building2,
  Users,
  Calendar,
  Activity,
  Sliders,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  Radio,
  Plus,
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "staff" | "queue-settings" | "audit-logs">("overview");
  const [hospitalsCount, setHospitalsCount] = useState(4);
  const [doctorsCount, setDoctorsCount] = useState(7);
  const [queueFormat, setQueueFormat] = useState("A-{seq:03d}");
  const [slotDuration, setSlotDuration] = useState("10");
  const [bufferTime, setBufferTime] = useState("15");
  const [savedSettings, setSavedSettings] = useState(false);

  const auditLogs = [
    {
      actor: "Clara Evans (Receptionist)",
      action: "PATIENT_CHECK_IN",
      resource: "Serial #A-024",
      details: "Arthur Dent checked into Ward 4 Kiosk B",
      time: "10:20 AM",
    },
    {
      actor: "Dr. Sarah Thorne, MD",
      action: "ISSUE_PRESCRIPTION",
      resource: "Prescription #RX-882194",
      details: "Finalized anti-hypertensive regimen for Rahim Hasan",
      time: "10:14 AM",
    },
    {
      actor: "Clara Evans (Receptionist)",
      action: "SKIP_PATIENT",
      resource: "Serial #A-017",
      details: "Patient failed to present after 3 announcements. Recorded reason logged.",
      time: "09:55 AM",
    },
    {
      actor: "System Administrator",
      action: "SLOT_RECALIBRATION",
      resource: "Cardiology Pavilion",
      details: "Pacing velocity tuned to 9m/consult",
      time: "09:00 AM",
    },
  ];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-black text-slate-900">Enterprise Hospital Administration</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              Root Level Authority
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600">SMS Gateway: Simulated Active</span>
          </div>
        </header>

        {/* Admin Navigation Tabs */}
        <div className="bg-white border-b border-slate-200 px-6 pt-3 flex gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-3 border-b-2 transition ${
              activeTab === "overview"
                ? "border-[#16A878] text-[#16A878]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            System Overview
          </button>

          <button
            onClick={() => setActiveTab("queue-settings")}
            className={`pb-3 px-3 border-b-2 transition ${
              activeTab === "queue-settings"
                ? "border-[#16A878] text-[#16A878]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Queue & Serial Policy
          </button>

          <button
            onClick={() => setActiveTab("staff")}
            className={`pb-3 px-3 border-b-2 transition ${
              activeTab === "staff"
                ? "border-[#16A878] text-[#16A878]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Staff & Clinicians
          </button>

          <button
            onClick={() => setActiveTab("audit-logs")}
            className={`pb-3 px-3 border-b-2 transition ${
              activeTab === "audit-logs"
                ? "border-[#16A878] text-[#16A878]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            HIPAA Audit Logs
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Hospital Pavilions</div>
                  <div className="text-3xl font-black text-slate-900">{hospitalsCount}</div>
                  <div className="text-xs text-emerald-700 font-semibold">100% Operational</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Board Clinicians</div>
                  <div className="text-3xl font-black text-slate-900">{doctorsCount}</div>
                  <div className="text-xs text-blue-700 font-semibold">Audited & Credentialed</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Today&apos;s Appointments</div>
                  <div className="text-3xl font-black text-slate-900">48</div>
                  <div className="text-xs text-slate-500">Across 6 specialty queues</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">On-Time Clinic Start</div>
                  <div className="text-3xl font-black text-emerald-700">98.4%</div>
                  <div className="text-xs text-slate-500">Zero waiting room drift</div>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Subsystem Telemetry</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">Authoritative Queue Engine</div>
                    <div className="text-emerald-700 font-semibold">Healthy • Single Source of Truth</div>
                    <p className="text-[11px] text-slate-500">Real-time SSE event bus synchronized</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">SMS Notification Dispatch</div>
                    <div className="text-emerald-700 font-semibold">Live (Simulation Active)</div>
                    <p className="text-[11px] text-slate-500">Ready for Twilio / MessageBird secrets in .env</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">Database Engine</div>
                    <div className="text-emerald-700 font-semibold">Mongoose Active</div>
                    <p className="text-[11px] text-slate-500">Atomic serial sequencing protected</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "queue-settings" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs max-w-2xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Queue & Serial Configuration</h3>
                <p className="text-xs text-slate-500">
                  Tune arrival buffers, token formatting, and algorithmic waiting pace.
                </p>
              </div>

              {savedSettings && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Configuration saved and propagated to all clinical endpoints!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Serial Number Format Pattern
                  </label>
                  <input
                    type="text"
                    value={queueFormat}
                    onChange={(e) => setQueueFormat(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Generates tokens like A-001, A-002, etc.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Consultation Slot Duration (Mins)
                    </label>
                    <input
                      type="number"
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Recommended Arrival Buffer (Mins)
                    </label>
                    <input
                      type="number"
                      value={bufferTime}
                      onChange={(e) => setBufferTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-[#16A878] hover:bg-[#11835D] text-white font-bold text-xs transition shadow-xs"
                >
                  Save Policy
                </button>
              </form>
            </div>
          )}

          {activeTab === "staff" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hospital Staff Directory</h3>
                  <p className="text-xs text-slate-500">Assigned doctors, nurses, and triage receptionists.</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-[#16A878] text-white text-xs font-bold">
                  + Add Staff Account
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1594824813637-b715694c965c?auto=format&fit=crop&w=400&q=80"
                      className="w-10 h-10 rounded-full object-cover"
                      alt="Doctor"
                    />
                    <div>
                      <div className="font-bold text-slate-900">Dr. Sarah Thorne, MD</div>
                      <div className="text-[11px] text-slate-500">Chief Medical Officer • Role: DOCTOR</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                    Active
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
                      className="w-10 h-10 rounded-full object-cover"
                      alt="Receptionist"
                    />
                    <div>
                      <div className="font-bold text-slate-900">Clara Evans</div>
                      <div className="text-[11px] text-slate-500">Triage Lead • Role: RECEPTIONIST</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "audit-logs" && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Clinical Audit Trail</h3>
                <span className="text-[11px] text-slate-400">HIPAA Compliant Immutable Ledger</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900">{log.action} • {log.resource}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{log.details}</div>
                      <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">By {log.actor}</div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
