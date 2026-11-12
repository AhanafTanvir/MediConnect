"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookAppointmentModal from "@/components/BookAppointmentModal";
import { IDoctor } from "@/types";
import {
  Search,
  CheckCircle2,
  Bookmark,
  Calendar,
  Building2,
  Video,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(["Cardiology", "Neurology"]);
  const [availability, setAvailability] = useState<"today" | "tomorrow" | "weekend">("today");
  const [consultType, setConsultType] = useState<"in-person" | "telehealth">("in-person");
  const [maxFee, setMaxFee] = useState(220);
  const [minRating, setMinRating] = useState(4.5);
  const [experience, setExperience] = useState<number>(10);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<IDoctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [availability, maxFee, experience]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (availability === "today") params.set("today", "true");
      if (maxFee) params.set("maxFee", maxFee.toString());

      const res = await fetch(`/api/doctors?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setDoctors(json.data);
      }
    } catch (err) {
      console.warn("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const toggleSpecialty = (spec: string) => {
    if (selectedSpecialties.includes(spec)) {
      setSelectedSpecialties(selectedSpecialties.filter((s) => s !== spec));
    } else {
      setSelectedSpecialties([...selectedSpecialties, spec]);
    }
  };

  const openBooking = (doc: IDoctor) => {
    setSelectedDoctorForBooking(doc);
    setIsModalOpen(true);
  };

  const filterSpecialtyList = [
    { name: "Cardiology", count: 42 },
    { name: "Neurology", count: 28 },
    { name: "Pediatrics", count: 35 },
    { name: "Orthopedics", count: 19 },
    { name: "Dermatology", count: 14 },
    { name: "General Medicine", count: 60 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Accredited Clinical Directory • Regional Triage Mesh</span>
          </div>

          <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Find & Consult Verified Clinicians
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Real-time multi-specialty availability across accredited teaching hospitals, outpatient pavilions, and telehealth consults.
              </p>
            </div>

            {/* Quick Search */}
            <form onSubmit={handleSearch} className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by physician, condition, or procedure..."
                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#16A878] bg-slate-50 focus:bg-white transition"
              />
              <span className="absolute right-3 top-2.5 px-1.5 py-0.5 rounded bg-slate-200 text-[10px] font-bold text-slate-600">
                ⌘K
              </span>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  <span>Filters</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpecialties([]);
                    setMaxFee(300);
                  }}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-700"
                >
                  Reset All
                </button>
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2">Specialty</label>
                <div className="space-y-1.5">
                  {filterSpecialtyList.map((item) => {
                    const checked = selectedSpecialties.includes(item.name);
                    return (
                      <label
                        key={item.name}
                        className="flex items-center justify-between text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSpecialty(item.name)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">{item.count}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Doctor Availability */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-900 mb-2">Doctor Availability</label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setAvailability("today")}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition ${
                      availability === "today"
                        ? "bg-emerald-50 text-emerald-900 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Today</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvailability("tomorrow")}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition ${
                      availability === "tomorrow"
                        ? "bg-emerald-50 text-emerald-900 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>Tomorrow</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvailability("weekend")}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition ${
                      availability === "weekend"
                        ? "bg-emerald-50 text-emerald-900 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>This Weekend</span>
                  </button>
                </div>
              </div>

              {/* Consultation Type */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-900 mb-2">Consultation Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultType("in-person")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition ${
                      consultType === "in-person"
                        ? "bg-[#16A878] text-white shadow-xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>In-Person</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultType("telehealth")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition ${
                      consultType === "telehealth"
                        ? "bg-[#16A878] text-white shadow-xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Telehealth</span>
                  </button>
                </div>
              </div>

              {/* Consultation Fee Range */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-900">Consultation Fee</label>
                  <span className="text-xs font-bold text-emerald-700">$50 - ${maxFee}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={maxFee}
                  onChange={(e) => setMaxFee(Number(e.target.value))}
                  className="w-full accent-[#16A878] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>$50</span>
                  <span>$300+</span>
                </div>
              </div>

              {/* Doctor Experience */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-900 mb-2">Doctor Experience</label>
                <div className="flex gap-2">
                  {[5, 10, 15].map((yrs) => (
                    <button
                      key={yrs}
                      type="button"
                      onClick={() => setExperience(yrs)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition ${
                        experience === yrs
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {yrs}+ yrs
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="border-t border-slate-100 pt-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={minRating === 4.5}
                    onChange={(e) => setMinRating(e.target.checked ? 4.5 : 0)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>★ ★ ★ ★ ★ 4.5+ Stars</span>
                </label>
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={fetchDoctors}
                className="w-full py-2.5 rounded-xl bg-[#16A878] hover:bg-[#11835D] text-white text-xs font-bold transition shadow-xs"
              >
                Apply Active Filters
              </button>
            </div>
          </aside>

          {/* Main List */}
          <main className="lg:col-span-9 space-y-6">
            {/* Top Bar with counts, active chips, and sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-slate-900">
                  {doctors.length} Verified Doctors Available in Central Metro
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-semibold">SORT BY:</span>
                <select className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none">
                  <option>Highest Rated (4.8+)</option>
                  <option>Lowest Fee</option>
                  <option>Earliest Available Slot</option>
                  <option>Most Experienced</option>
                </select>
              </div>
            </div>

            {/* Active Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] text-slate-400 font-bold uppercase">Active:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-800 text-[11px] font-semibold">
                Cardiology & Neurology
                <X className="w-3 h-3 cursor-pointer" />
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-800 text-[11px] font-semibold">
                Fee ≤ ${maxFee}
                <X className="w-3 h-3 cursor-pointer" />
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-800 text-[11px] font-semibold">
                Available Today
                <X className="w-3 h-3 cursor-pointer" />
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-800 text-[11px] font-semibold">
                Rating 4.5+ ★
                <X className="w-3 h-3 cursor-pointer" />
              </span>
              <button
                type="button"
                onClick={() => {
                  setMaxFee(300);
                  setSelectedSpecialties([]);
                }}
                className="text-[11px] font-bold text-emerald-700 hover:underline ml-2"
              >
                Clear all
              </button>
            </div>

            {/* Doctor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-lg transition p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Header with photo & status pill */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                          {doc.isAvailableToday ? "Available Today" : "Next Available"}
                        </span>
                        <button className="text-slate-400 hover:text-slate-600">
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Name & Credentials */}
                    <div className="mt-3">
                      <div className="text-sm font-bold text-slate-900">{doc.name}</div>
                      <div className="text-xs font-semibold text-emerald-700 truncate">{doc.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{doc.qualifications}</div>
                    </div>

                    {/* Affiliation & Stats */}
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.hospitalName}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>{doc.experienceYears} Yrs Experience</span>
                        <span className="text-amber-600 font-bold">★ {doc.rating} ({doc.reviewCount})</span>
                      </div>
                    </div>

                    {/* Next Slot & Serial */}
                    <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-semibold">
                      <div>
                        <div className="text-[10px] text-slate-400">Next Slot</div>
                        <div className="text-slate-900">{doc.nextSlotTime || "Today 3:15 PM"}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Serial</div>
                        <div className="text-emerald-700 font-black">#{doc.remainingTokens || "18"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Fee & Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Fee</div>
                      <div className="text-base font-bold text-slate-900">${doc.consultationFee}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/doctors/${doc._id}`}
                        className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => openBooking(doc)}
                        className="py-1.5 px-3.5 rounded-xl bg-[#16A878] hover:bg-[#11835D] text-white text-xs font-bold transition shadow-xs"
                      >
                        Book →
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Promo Card: Urgent Virtual Consultation */}
              <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 rounded-2xl border border-blue-200 p-5 flex flex-col justify-between shadow-2xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    <span>Immediate Queue</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    Need an Urgent Virtual Consultation?
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Connect with on-call acute triage physicians under 10 minutes via our encrypted FHIR telehealth network.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-2 rounded-xl bg-white/80 border border-blue-200/80">
                      <div className="text-[10px] text-slate-500">Avg Wait</div>
                      <div className="text-sm font-bold text-slate-900">7 Mins</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/80 border border-blue-200/80">
                      <div className="text-[10px] text-slate-500">Doctors Active</div>
                      <div className="text-sm font-bold text-blue-700">24 On-Call</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <Link
                    href="/patient"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2878D0] hover:bg-[#1E5EA4] text-white text-xs font-bold transition shadow-xs"
                  >
                    <Video className="w-4 h-4" />
                    <span>Enter Telehealth Triage</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div>Showing 1 - {doctors.length} of 148 doctors</div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-[#16A878] text-white font-bold">1</button>
                <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">2</button>
                <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">3</button>
                <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">4</button>
                <span className="px-1 text-slate-400">...</span>
                <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">12</button>
                <button className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

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
