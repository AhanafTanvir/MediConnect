"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { IAppointment, IQueueState, IMedicationItem } from "@/types";
import {
  Search,
  Bell,
  Settings,
  Activity,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Save,
  Plus,
  Trash2,
  Mic,
  Calendar,
  ExternalLink,
  ChevronRight,
  Stethoscope,
  Pill,
} from "lucide-react";

export default function DoctorWorkspacePage() {
  const [queueState, setQueueState] = useState<IQueueState | null>(null);
  const [activeAppt, setActiveAppt] = useState<IAppointment | null>(null);
  const [loading, setLoading] = useState(true);

  // EMR Examination & Diagnosis Form State
  const [diagnosisCode, setDiagnosisCode] = useState("I10");
  const [diagnosisName, setDiagnosisName] = useState("Essential (Primary) Hypertension");
  const [severity, setSeverity] = useState<"Mild" | "Moderate" | "Severe">("Moderate");
  const [symptoms, setSymptoms] = useState<string[]>([
    "Exertional Tightness",
    "Mild Dyspnea",
    "Occasional Palpitations",
  ]);
  const [clinicalAssessment, setClinicalAssessment] = useState(
    "Patient reports bilateral retrosternal discomfort during stair climbs over the last 3 weeks. Normal S1/S2 heart sounds, no carotid bruits. Resting ECG demonstrated normal sinus rhythm without acute ST-segment shifts. Advised continued anti-hypertensive regimen and initiated lipid control therapy."
  );

  // Medications
  const [medications, setMedications] = useState<IMedicationItem[]>([
    {
      name: "Tab. Amlodipine Besylate",
      dosage: "5 mg",
      frequency: "1 Tab Once Daily (1-0-0)",
      timing: "After Breakfast",
      duration: "30 Days",
      quantity: "30 Tabs",
    },
    {
      name: "Tab. Atorvastatin Calcium",
      dosage: "10 mg",
      frequency: "1 Tab Nightly (0-0-1)",
      timing: "After Dinner",
      duration: "30 Days",
      quantity: "30 Tabs",
    },
  ]);

  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("10 mg");
  const [newMedFreq, setNewMedFreq] = useState("1 Tab Daily (1-0-0)");
  const [newMedDays, setNewMedDays] = useState("30 Days");

  // Advice
  const [adviceList, setAdviceList] = useState<string[]>([
    "Reduce sodium (< 2g/day)",
    "30 min daily brisk walk",
    "Home BP log 2x weekly",
    "Return for follow-up in 4 weeks",
  ]);
  const [customAdvice, setCustomAdvice] = useState(
    "Strict low-salt diet, 30 min daily aerobic walk, monitor home morning BP, repeat Lipid Panel & Serum Creatinine prior to next encounter."
  );

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Fetch Authoritative Queue State
  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/queue");
      const json = await res.json();
      if (json.success && json.data) {
        setQueueState(json.data);

        // Find active in-room patient
        const inRoom = json.data.queueList?.find(
          (a: IAppointment) => a.status === "IN_CONSULTATION"
        );
        if (inRoom) {
          setActiveAppt(inRoom);
        } else if (json.data.queueList?.length > 0) {
          setActiveAppt(json.data.queueList[0]);
        }
      }
    } catch (err) {
      console.warn("Queue state error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  // Actions
  const handleCallNext = async (apptId: string) => {
    try {
      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "call",
          appointmentId: apptId,
          actorName: "Dr. Sarah Thorne, MD",
        }),
      });
      fetchQueue();
    } catch (e) {
      console.warn(e);
    }
  };

  const handleEnterRoom = async (apptId: string) => {
    try {
      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enter",
          appointmentId: apptId,
          actorName: "Dr. Sarah Thorne, MD",
        }),
      });
      fetchQueue();
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCompleteAndCallNext = async () => {
    if (!activeAppt) return;
    setSaveStatus("Finalizing Prescription & Syncing to EHR...");

    try {
      // 1. Issue Prescription
      await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: activeAppt._id,
          patientId: activeAppt.patientId,
          patientName: activeAppt.patientName,
          patientMrn: activeAppt.patientMrn,
          doctorId: activeAppt.doctorId,
          doctorName: "Dr. Sarah Thorne",
          doctorSpecialty: "Cardiology",
          hospitalName: activeAppt.hospitalName,
          diagnosisCode,
          diagnosisName,
          severity,
          symptoms,
          clinicalAssessment,
          medications,
          dietaryAdvice: adviceList,
          customAdvice,
          investigations: ["12-Lead ECG", "Echocardiogram", "Lipid Profile + HbA1c", "Serum Creatinine"],
          digitalSignature: "Dr. Sarah Thorne, MD - Chief Medical Officer",
          isDraft: false,
        }),
      });

      // 2. Complete active appointment
      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          appointmentId: activeAppt._id,
          actorName: "Dr. Sarah Thorne, MD",
        }),
      });

      setSaveStatus("Prescription Signed! Calling next patient...");
      setTimeout(() => setSaveStatus(null), 3000);

      // 3. Advance to next in line
      const nextInLine = queueState?.queueList?.find(
        (a) => a.status === "CALLED" || a.status === "WAITING"
      );
      if (nextInLine) {
        await handleEnterRoom(nextInLine._id as string);
      } else {
        fetchQueue();
      }
    } catch (e) {
      console.warn(e);
      setSaveStatus("Error updating records.");
    }
  };

  const handleSaveDraft = async () => {
    if (!activeAppt) return;
    setSaveStatus("Draft saved locally");
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const addMedication = () => {
    if (!newMedName.trim()) return;
    setMedications([
      ...medications,
      {
        name: newMedName,
        dosage: newMedDosage,
        frequency: newMedFreq,
        timing: "With Meals",
        duration: newMedDays,
        quantity: "30 Tabs",
      },
    ]);
    setNewMedName("");
  };

  const removeMedication = (idx: number) => {
    setMedications(medications.filter((_, i) => i !== idx));
  };

  const nextAppt = queueState?.queueList?.find(
    (a) => a.status === "CALLED" || (a.status === "WAITING" && a._id !== activeAppt?._id)
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Clinical Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
          {/* Patient Quick Search */}
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient by MRN, name, national ID, or clinic room..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A878]"
            />
          </div>

          {/* Right Header Status & Doctor Profile */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Queue Flow: {queueState?.flowPace || "Normal (4m avg)"}</span>
            </div>

            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
              <Settings className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1594824813637-b715694c965c?auto=format&fit=crop&w=400&q=80"
                alt="Dr. Sarah Thorne"
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">Dr. Sarah Thorne</div>
                <div className="text-[10px] text-slate-500 font-medium">Chief Medical Officer</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="p-6 space-y-6">
          {/* Top 4 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Scheduled Today */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                <span>Scheduled Today</span>
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">28</span>
                <span className="text-xs text-slate-500">Slots</span>
                <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                  88% Cap
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">4 Telehealth • 24 In-Clinic</div>
            </div>

            {/* 2. Waiting Room */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                <span>Waiting Room</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {queueState?.waitingCount ?? 6}
                </span>
                <span className="text-xs text-slate-500">Patients</span>
                <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px]">
                  Avg 11m wait
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">Priority Triage: 0 Critical</div>
            </div>

            {/* 3. Active In-Room */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-800 uppercase">
                <span>Active In-Room</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-800">
                  #{activeAppt?.serialNumber || "A-022"}
                </span>
                <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Active: 08:42
                </span>
              </div>
              <div className="text-[11px] font-semibold text-slate-700 pt-1 truncate">
                {activeAppt?.patientName || "Rahim Hasan"} ({activeAppt?.patientAge || 48}y M)
              </div>
            </div>

            {/* 4. Completed Sessions */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                <span>Completed Sessions</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {queueState?.completedCount ?? 14}
                </span>
                <span className="text-xs text-slate-500">Discharged</span>
                <span className="ml-auto px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                  50% Shift
                </span>
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                ✓ 14 Digital Rx Synced to EHR
              </div>
            </div>
          </div>

          {/* Grid Layout: Main Clinical EMR (Left 8 cols) vs Live Room Queue & Orders (Right 4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Active Patient EMR Consultation Card */}
            <div className="lg:col-span-8 space-y-6">
              {/* Patient Banner & Vitals */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                {/* Header Profile */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-base flex items-center justify-center shrink-0">
                      {activeAppt?.patientName?.slice(0, 2).toUpperCase() || "RH"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-slate-900">
                          {activeAppt?.patientName || "Rahim Hasan"}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Active Patient
                        </span>
                        <span className="text-sm font-bold text-emerald-700">
                          Serial #{activeAppt?.serialNumber || "A-022"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>Male, {activeAppt?.patientAge || 48} Years</span>
                        <span>•</span>
                        <span className="font-semibold text-rose-600 bg-rose-50 px-1.5 rounded">
                          Blood Group {activeAppt?.patientBloodGroup || "B+"}
                        </span>
                        <span>•</span>
                        <span>MRN: #{activeAppt?.patientMrn || "MC-882194"}</span>
                        <span>•</span>
                        <span>Check-in: {activeAppt?.checkInTime || "10:15 AM"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50">
                      Full EHR
                    </button>
                    <button className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
                      <Mic className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                </div>

                {/* Chief Complaint & Allergy Banner */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 uppercase text-[10px] block">
                      Chief Complaint / Reason for Visit
                    </span>
                    <span className="text-slate-800 font-medium">
                      {activeAppt?.reasonForVisit ||
                        "Chest tightness on exertion, mild shortness of breath, history of stage 1 hypertension."}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] shrink-0">
                    PENICILLIN ALLERGY
                  </span>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Blood Pressure</div>
                    <div className="text-base font-black text-rose-600 my-0.5">
                      {activeAppt?.vitals?.bloodPressure || "138/88"}
                    </div>
                    <div className="text-[10px] font-bold text-rose-600">Stage 1 High</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Pulse Rate</div>
                    <div className="text-base font-black text-slate-900 my-0.5">
                      {activeAppt?.vitals?.pulseRate || 76} <span className="text-xs font-normal">bpm</span>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Normal Sinus</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Oxygen (SpO2)</div>
                    <div className="text-base font-black text-emerald-700 my-0.5">
                      {activeAppt?.vitals?.oxygenSpO2 || 98}%
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Optimal</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Body Temp</div>
                    <div className="text-base font-black text-slate-900 my-0.5">
                      {activeAppt?.vitals?.bodyTemp || 98.4}°F
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Afebrile</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center col-span-2 sm:col-span-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Weight / BMI</div>
                    <div className="text-base font-black text-slate-900 my-0.5">
                      {activeAppt?.vitals?.weightKg || 78} kg
                    </div>
                    <div className="text-[10px] text-amber-600 font-semibold">26.2 Overweight</div>
                  </div>
                </div>

                {/* Prior Encounter / Recent Lab Pills */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-900 font-medium border border-blue-200/80">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Prior Encounter: Aug 12, 2026 (Amlodipine 5mg Initiated)</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-900 font-medium border border-amber-200/80">
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    <span>Recent Lab: Borderline LDL 142 mg/dL</span>
                  </div>
                </div>
              </div>

              {/* Clinical Examination & Diagnosis */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Clinical Examination & Diagnosis</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Auto-saving to cloud EHR
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirmed Primary Diagnosis
                    </label>
                    <select
                      value={diagnosisCode}
                      onChange={(e) => {
                        setDiagnosisCode(e.target.value);
                        setDiagnosisName(
                          e.target.value === "I10"
                            ? "Essential (Primary) Hypertension"
                            : "Type 2 Diabetes Mellitus"
                        );
                      }}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                    >
                      <option value="I10">I10 - Essential (Primary) Hypertension</option>
                      <option value="E11">E11 - Type 2 Diabetes Mellitus without complications</option>
                      <option value="I20">I20 - Angina Pectoris, unspecified</option>
                      <option value="R07.9">R07.9 - Chest Pain, unspecified</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Severity / Staging
                    </label>
                    <div className="flex gap-1">
                      {(["Mild", "Moderate", "Severe"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSeverity(lvl)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                            severity === lvl
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Confirmed Symptoms Chips */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirmed Symptoms
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Exertional Tightness",
                      "Mild Dyspnea",
                      "Occasional Palpitations",
                      "Morning Headache",
                      "Bilateral Ankle Edema",
                    ].map((sym) => {
                      const active = symptoms.includes(sym);
                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => {
                            if (active) setSymptoms(symptoms.filter((s) => s !== sym));
                            else setSymptoms([...symptoms, sym]);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            active
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {active ? "✓ " : "+ "}
                          {sym}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Assessment & Plan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Physician Clinical Assessment & Plan
                  </label>
                  <textarea
                    rows={3}
                    value={clinicalAssessment}
                    onChange={(e) => setClinicalAssessment(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A878] leading-relaxed"
                  />
                </div>
              </div>

              {/* Digital Prescription (e-Rx) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Digital Prescription (e-Rx)</h3>
                    <span className="text-[11px] text-slate-400 font-medium">Validated for instant pharmacy fulfillment</span>
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <span>Load Rx Template</span>
                  </button>
                </div>

                {/* Medication Items List */}
                <div className="space-y-2.5">
                  {medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                          Rx{idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{med.name}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-[10px] text-slate-700">
                              {med.dosage}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="text-blue-600 font-semibold">{med.frequency}</span>
                            <span>•</span>
                            <span>{med.timing}</span>
                            <span>•</span>
                            <span>Duration: {med.duration}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="font-semibold text-slate-600">Qty: {med.quantity}</span>
                        <button
                          onClick={() => removeMedication(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Another Medicine */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">+ Add Another Medicine</span>
                    <span className="text-[11px] font-semibold text-slate-500">Dosage Presets</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Search generic or brand name..."
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                    />
                    <select
                      value={newMedFreq}
                      onChange={(e) => setNewMedFreq(e.target.value)}
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                    >
                      <option>1 Tab Daily (Morn)</option>
                      <option>1 Tab Twice Daily (1-0-1)</option>
                      <option>1 Tab Nightly (0-0-1)</option>
                    </select>
                    <select
                      value={newMedDays}
                      onChange={(e) => setNewMedDays(e.target.value)}
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                    >
                      <option>30 Days</option>
                      <option>60 Days</option>
                      <option>90 Days</option>
                      <option>14 Days</option>
                    </select>
                    <button
                      type="button"
                      onClick={addMedication}
                      className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Insert</span>
                    </button>
                  </div>
                </div>

                {/* Dietary & Clinical Advice */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Dietary & Clinical Advice to Patient
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {adviceList.map((adv) => (
                      <span
                        key={adv}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                      >
                        {adv}
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customAdvice}
                    onChange={(e) => setCustomAdvice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                  />
                </div>

                {/* Bottom Signature & Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Digital signature Dr. S. Thorne applied</span>
                    {saveStatus && <span className="text-blue-600 font-bold ml-2">{saveStatus}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveDraft}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Draft</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Rx</span>
                    </button>

                    <button
                      onClick={handleCompleteAndCallNext}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#16A878] hover:bg-[#11835D] text-white text-xs font-black shadow-md hover:shadow-lg transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete & Call Next</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Cadence, Live Room Queue & Orders */}
            <div className="lg:col-span-4 space-y-5">
              {/* Cadence Header */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Schedule Cadence
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">Morning Clinic (09:00 - 13:00)</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                  Break at 1:00 PM
                </span>
              </div>

              {/* Live Room Queue Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-900">Live Room Queue</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                    {queueState?.queueList?.length || 5} In Line
                  </span>
                </div>

                {/* Queue Items */}
                <div className="space-y-2.5 text-xs">
                  {/* In Consultation */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                        In Consultation
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-800">Elapsed: 8m 42s</span>
                    </div>
                    <div className="font-black text-slate-900 text-sm">
                      #{activeAppt?.serialNumber || "A-022"} {activeAppt?.patientName || "Rahim Hasan"}
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">
                      {activeAppt?.patientAge || 48}y M • {activeAppt?.reasonForVisit?.slice(0, 35)}...
                    </div>
                  </div>

                  {/* Next Up (Checked In) with Call Into Room button */}
                  {nextAppt && (
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">
                          Next Up • Checked In
                        </span>
                        <span className="text-[10px] font-semibold text-blue-800">
                          Arr: {nextAppt.checkInTime || "10:22 AM"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            #{nextAppt.serialNumber} {nextAppt.patientName}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">
                            {nextAppt.patientAge}y {nextAppt.patientGender?.slice(0, 1)} • {nextAppt.reasonForVisit?.slice(0, 25)}...
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEnterRoom(nextAppt._id as string)}
                        className="w-full py-2 px-3 rounded-xl bg-[#2878D0] hover:bg-[#1E5EA4] text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Call #{nextAppt.serialNumber} Into Room</span>
                      </button>
                    </div>
                  )}

                  {/* Other Waiting Patients */}
                  {queueState?.queueList
                    ?.filter(
                      (a) =>
                        a._id !== activeAppt?._id &&
                        a._id !== nextAppt?._id &&
                        a.status !== "COMPLETED" &&
                        a.status !== "CANCELLED"
                    )
                    .map((item) => (
                      <div
                        key={item._id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-800">
                            #{item.serialNumber} {item.patientName}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {item.status === "WAITING" ? "Waiting Lobby" : "En Route • Pre-Triaged"} • Slot: {item.timeSlot}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCallNext(item._id as string)}
                          className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-white"
                        >
                          Call
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Order Investigations Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-900">Order Investigations</h3>
                  <span className="text-[10px] font-bold text-emerald-700">Cardiology Panel</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-800">12-Lead ECG</div>
                    <div className="text-[10px] text-emerald-700">Stat in Room 204</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-800">Echocardiogram</div>
                    <div className="text-[10px] text-slate-500">Next Available</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-800">Lipid Profile + HbA1c</div>
                    <div className="text-[10px] text-slate-500">Fasting Morning</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-800">Serum Creatinine</div>
                    <div className="text-[10px] text-slate-500">Renal panel check</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
