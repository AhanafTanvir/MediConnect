"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IDoctor } from "@/types";
import { X, Calendar, Clock, CheckCircle2, User, Phone, AlertCircle, Sparkles } from "lucide-react";

interface BookAppointmentModalProps {
  doctor: IDoctor | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (appointment: any) => void;
}

const AVAILABLE_SLOTS = [
  "09:30 AM",
  "10:15 AM",
  "11:00 AM",
  "11:45 AM",
  "02:00 PM",
  "02:45 PM",
  "03:30 PM",
  "04:15 PM",
];

const COMMON_SYMPTOMS = [
  "Chest Tightness",
  "Hypertension Review",
  "Palpitations",
  "Shortness of Breath",
  "Routine Health Check",
  "Medication Refill",
];

export default function BookAppointmentModal({
  doctor,
  isOpen,
  onClose,
  onSuccess,
}: BookAppointmentModalProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("2026-10-24");

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  }, []);
  const [selectedSlot, setSelectedSlot] = useState("11:00 AM");
  const [patientName, setPatientName] = useState("Arthur Dent");
  const [patientPhone, setPatientPhone] = useState("+1 (555) 019-2834");
  const [patientEmail, setPatientEmail] = useState("patient@mediconnect.org");
  const [reason, setReason] = useState("Cardiovascular routine follow-up & BP review");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["Hypertension Review"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedAppt, setBookedAppt] = useState<any | null>(null);

  if (!isOpen || !doctor) return null;

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor._id,
          patientName,
          patientPhone,
          patientEmail,
          appointmentDate: selectedDate,
          timeSlot: selectedSlot,
          reasonForVisit: reason,
          symptoms: selectedSymptoms,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to book appointment");
      }

      setBookedAppt(json.data);
      if (onSuccess) onSuccess(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Book Doctor Appointment</h3>
              <p className="text-xs text-slate-400">Instant Serial Token & Live Queue Sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {bookedAppt ? (
          /* Confirmation Success Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Booking Confirmed
              </span>
              <h4 className="text-xl font-black text-slate-900 mt-2">
                Your Assigned Serial Token:
              </h4>
              <div className="text-4xl font-black text-emerald-700 tracking-tight my-2">
                #{bookedAppt.serialNumber}
              </div>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Appointment with <span className="font-bold text-slate-900">{doctor.name}</span> on{" "}
                <span className="font-semibold">{bookedAppt.appointmentDate}</span> at{" "}
                <span className="font-semibold">{bookedAppt.timeSlot}</span>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Medical Facility:</span>
                <span className="font-semibold text-slate-800">{doctor.hospitalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consultation Station:</span>
                <span className="font-semibold text-slate-800">{doctor.roomNumber} • {doctor.stationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="font-bold text-emerald-700">${doctor.consultationFee}.00 (Paid via EHR)</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  router.push("/patient");
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#16A878] hover:bg-[#11835D] text-white text-xs font-bold transition shadow-xs"
              >
                Go to Patient Dashboard & Track Queue
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleBooking} className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Doctor Info Card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{doctor.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{doctor.title}</div>
                <div className="text-[11px] font-semibold text-emerald-700">{doctor.hospitalName}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Fee</div>
                <div className="text-base font-bold text-slate-900">${doctor.consultationFee}</div>
              </div>
            </div>

            {/* Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Appointment Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Time Slot
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16A878] bg-white"
                  >
                    {AVAILABLE_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Patient Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone (for SMS Alerts)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Symptoms Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Reported Symptoms & Reasons
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SYMPTOMS.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        isSelected
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visit Objective Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Visit Objective / Clinical Notes
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16A878]"
                placeholder="Describe your current symptoms or reason for consult..."
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="text-xs">
                <span className="text-slate-500">Total Consultation: </span>
                <span className="font-bold text-slate-900">${doctor.consultationFee}.00</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#16A878] hover:bg-[#11835D] text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {loading ? "Assigning Serial..." : "Confirm & Get Serial"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
