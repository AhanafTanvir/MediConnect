"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveQueueCard from "@/components/LiveQueueCard";
import BookAppointmentModal from "@/components/BookAppointmentModal";
import { IDoctor } from "@/types";
import {
  Search,
  MapPin,
  Building2,
  Calendar,
  HeartPulse,
  Brain,
  Baby,
  Bone,
  Sparkles,
  Activity,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Car,
  ChevronDown,
  ChevronUp,
  FileText,
  Smartphone,
  Navigation,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"doctors" | "hospitals" | "specialties">("doctors");
  const [searchSpecialty, setSearchSpecialty] = useState("Cardiology");
  const [searchLocation, setSearchLocation] = useState("Metro Center District");
  const [searchFacility, setSearchFacility] = useState("St. Jude Medical Pavilion");
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<IDoctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  useEffect(() => {
    // Seed and load initial featured specialists
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setDoctors(json.data.slice(0, 3));
        }
      })
      .catch((err) => console.warn("Failed to load doctors:", err));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "hospitals") {
      router.push(`/hospitals?search=${encodeURIComponent(searchFacility || searchLocation)}`);
    } else {
      router.push(`/doctors?specialty=${encodeURIComponent(searchSpecialty)}&search=${encodeURIComponent(searchFacility)}`);
    }
  };

  const openBooking = (doc: IDoctor) => {
    setSelectedDoctorForBooking(doc);
    setIsModalOpen(true);
  };

  const specialties = [
    { name: "Cardiology", count: "142 Specialists", icon: HeartPulse, color: "text-rose-600 bg-rose-50" },
    { name: "Neurology", count: "89 Specialists", icon: Brain, color: "text-indigo-600 bg-indigo-50" },
    { name: "Pediatrics", count: "210 Specialists", icon: Baby, color: "text-emerald-600 bg-emerald-50" },
    { name: "Orthopedics", count: "115 Specialists", icon: Bone, color: "text-amber-600 bg-amber-50" },
    { name: "Dermatology", count: "92 Specialists", icon: Sparkles, color: "text-sky-600 bg-sky-50" },
    { name: "Oncology", count: "78 Specialists", icon: Activity, color: "text-purple-600 bg-purple-50" },
  ];

  const faqs = [
    {
      q: "How does the Live Serial Tracking estimate my arrival time?",
      a: "Our algorithmic model analyzes the doctor's average encounter velocity, the count of verified patients physically checked into the triage buffer ahead of you, and current live traffic telemetry to calculate your ideal departure time down to the minute.",
    },
    {
      q: "Can I reschedule or cancel if I encounter traffic delays?",
      a: "Yes. In your Patient Dashboard, you can select 'Reschedule' or 'Delay Window' up to 30 minutes before your estimated call time without losing your clinical registration priority.",
    },
    {
      q: "Are doctors verified and affiliated with certified facilities?",
      a: "Every clinician in the MediConnect registry undergoes primary-source credentialing with national medical boards, malpractice history verification, and hospital-privileged appointment auditing.",
    },
    {
      q: "Will my diagnostic history and prescriptions transfer to other doctors?",
      a: "All records are securely unified under your unique Medical Record Number (MRN) conforming to HL7 / FHIR R4 interoperability standards. Only clinicians authorized during active appointments can access encrypted records.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200/70 bg-gradient-to-b from-white via-slate-50/50 to-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Smart Healthcare Management</span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Your Healthcare, <br />
                  <span className="text-[#16A878]">Organized in One Place.</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
                  Find verified specialists, book guaranteed slots, track real-time queue serials, and estimate your departure time with live clinic tracking.
                </p>
              </div>

              {/* Search Box Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 sm:p-5 space-y-4 max-w-2xl">
                {/* Search Mode Tabs */}
                <div className="flex gap-2 border-b border-slate-100 pb-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("doctors")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeTab === "doctors"
                        ? "bg-[#16A878] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    Find Doctors
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("hospitals")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeTab === "hospitals"
                        ? "bg-[#16A878] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    Hospitals & Clinics
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("specialties")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeTab === "specialties"
                        ? "bg-[#16A878] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    Medical Specialties
                  </button>
                </div>

                {/* Search Inputs */}
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Specialty */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:ring-2 focus-within:ring-[#16A878] focus-within:bg-white transition">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Specialty / Condition
                      </div>
                      <input
                        type="text"
                        value={searchSpecialty}
                        onChange={(e) => setSearchSpecialty(e.target.value)}
                        placeholder="e.g. Cardiology"
                        className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none mt-0.5"
                      />
                    </div>

                    {/* Location */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:ring-2 focus-within:ring-[#16A878] focus-within:bg-white transition">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Location / City
                      </div>
                      <input
                        type="text"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        placeholder="Metro Center District"
                        className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none mt-0.5"
                      />
                    </div>

                    {/* Facility */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:ring-2 focus-within:ring-[#16A878] focus-within:bg-white transition">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Facility Name
                      </div>
                      <input
                        type="text"
                        value={searchFacility}
                        onChange={(e) => setSearchFacility(e.target.value)}
                        placeholder="St. Jude Medical Pavilion"
                        className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Actions & Badges */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Instant EMR Sync</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Zero Waiting Room Drift</span>
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A878] hover:bg-[#11835D] text-white text-xs font-bold shadow-md hover:shadow-lg transition"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Availability</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 max-w-2xl border-t border-slate-200/80">
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">450+</div>
                  <div className="text-xs text-slate-500 font-medium">Hospital Partners</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">3,200+</div>
                  <div className="text-xs text-slate-500 font-medium">Verified Doctors</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-700 tracking-tight">98.4%</div>
                  <div className="text-xs text-slate-500 font-medium">On-Time Starts</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">4.9/5</div>
                  <div className="text-xs text-slate-500 font-medium">Patient Rating</div>
                </div>
              </div>
            </div>

            {/* Right Hero: Live Queue Monitor Widget */}
            <div className="lg:col-span-5 flex justify-center">
              <LiveQueueCard
                initialSerial="A-024"
                nowServing="A-019"
                patientsAhead={4}
                estWait="~45 mins"
                leaveBy="10:20 AM"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Explore Core Specialties */}
      <section className="py-14 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Clinical Disciplines
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Explore Core Specialties
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Book directly with accredited departmental chairs and specialized care teams.
              </p>
            </div>
            <Link
              href="/doctors"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              <span>View All 32 Specialties</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={`/doctors?specialty=${item.name}`}
                  className="group p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-lg transition text-center space-y-2.5"
                >
                  <div
                    className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">{item.count}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Board-Certified Specialists */}
      <section className="py-14 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Verified Care Delivery
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Featured Board-Certified Specialists
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Immediate appointment confirmation with live queue synchronization.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Updated 4 mins ago</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Doctor Card Top */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 truncate">{doc.name}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <div className="text-xs font-semibold text-emerald-700 truncate">{doc.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{doc.qualifications}</div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold mt-0.5">
                        <span>★ {doc.rating}</span>
                        <span className="text-slate-400 font-normal">({doc.reviewCount} clinical reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Hospital Affiliation & Fee */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Affiliation:</span>
                      <span className="font-semibold text-slate-800 text-right truncate ml-2">
                        {doc.hospitalName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Consultation Fee:</span>
                      <span className="font-bold text-slate-900">${doc.consultationFee} / Visit</span>
                    </div>
                  </div>

                  {/* Slot Pill */}
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs font-semibold text-emerald-900">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{doc.nextSlotTime || "Today 3:15 PM"}</span>
                    </div>
                    <span className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-800">
                      {doc.remainingTokens || 3} Serials Left
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                  <Link
                    href={`/doctors/${doc._id}`}
                    className="flex-1 text-center py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => openBooking(doc)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#16A878] hover:bg-[#11835D] text-white text-xs font-bold transition shadow-xs"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Live Serial Tracking Works */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Predictive Triage System
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How Live Serial Tracking Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Eliminate congested clinic waiting rooms with zero-friction digital orchestration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <Smartphone className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Instant Booking & Serial</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your specialist, choose an arrival window, and receive your digital queue serial with encrypted access pass.
              </p>
              <div className="text-[11px] font-semibold text-emerald-700 pt-2 border-t border-slate-200/60">
                100% Atomic Token Issuance
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <Car className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Dynamic Wait & Leave Alert</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our algorithmic model factors doctor pacing and local traffic, pinging your phone when it is precisely time to leave home.
              </p>
              <div className="text-[11px] font-semibold text-blue-700 pt-2 border-t border-slate-200/60">
                GPS Route Calibration
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <MapPin className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Check-In & Real-Time Call</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Geofence data confirms your presence upon parking. Screen indicators guide you straight into the doctor&apos;s consultation room.
              </p>
              <div className="text-[11px] font-semibold text-emerald-700 pt-2 border-t border-slate-200/60">
                &lt; 8 Mins Lobby Dwell
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Prescription & History</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diagnostics, electronic scripts, and follow-up directives sync instantly to your encrypted MediConnect patient portal.
              </p>
              <div className="text-[11px] font-semibold text-purple-700 pt-2 border-t border-slate-200/60">
                HL7 / FHIR Standardized
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Sovereignty Banner */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Enterprise Clinical Compliance</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Uncompromising Patient Privacy & Data Sovereignty
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Every clinical consult, serial ticket, and biometric record is safeguarded under strict HIPAA guidelines, zero-knowledge encryption protocols, and verified ISO 27001 clinical standards.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300 pt-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> HIPAA Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> HL7 / FHIR R4 Ready
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 256-Bit AES Storage
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SOC2 Type II Certified
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/doctor"
                className="px-6 py-3 rounded-xl bg-[#16A878] hover:bg-[#11835D] text-white text-xs font-bold text-center transition shadow-lg"
              >
                Read Security Architecture
              </Link>
              <Link
                href="/admin"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center border border-slate-700 transition"
              >
                Hospital Admin Request Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Patient Knowledge Base
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Everything you need to know about live queuing, doctor schedules, and digital records.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = faqOpen === idx;
              return (
                <div
                  key={faq.q}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-emerald-700 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Booking Modal */}
      <BookAppointmentModal
        doctor={selectedDoctorForBooking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
