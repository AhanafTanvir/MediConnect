"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookAppointmentModal from "@/components/BookAppointmentModal";
import InteractiveMap from "@/components/InteractiveMap";
import { IDoctor, IHospital } from "@/types";
import {
  CheckCircle2,
  Calendar,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Award,
  ArrowLeft,
  Share2,
} from "lucide-react";

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [doctor, setDoctor] = useState<(IDoctor & { hospital?: IHospital }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/doctors/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setDoctor(json.data);
        }
      })
      .catch((err) => console.warn(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-xl font-bold text-slate-800">Doctor Profile Not Found</h2>
          <Link href="/doctors" className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
            Back to Doctors Directory
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Back Link */}
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clinicians Directory</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Doctor Profile */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-100 shadow-xs shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-slate-900">{doctor.name}</h1>
                    <span className="p-1 rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="text-sm font-bold text-emerald-700">{doctor.title}</div>
                  <div className="text-xs text-slate-500 font-medium">{doctor.qualifications}</div>

                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span>{doctor.rating}</span>
                      <span className="text-slate-400 font-normal">({doctor.reviewCount} verified reviews)</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 font-semibold">{doctor.experienceYears} Years Experience</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-700 font-semibold">{doctor.hospitalName}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Professional Biography
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {doctor.bio ||
                    "Dedicated medical specialist providing patient-centered healthcare, evidence-based triage protocols, and integrated multidisciplinary treatment plans."}
                </p>
              </div>

              {/* Highlights & Credentials */}
              <div className="border-t border-slate-100 pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Consultation Room</div>
                  <div className="font-bold text-slate-900 mt-0.5">{doctor.roomNumber} • {doctor.stationNumber}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Average Consult Velocity</div>
                  <div className="font-bold text-emerald-700 mt-0.5">{doctor.avgConsultTimeMinutes} Mins / Patient</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Clinical Verification</div>
                  <div className="font-bold text-blue-700 mt-0.5">Primary-Source Audited</div>
                </div>
              </div>
            </div>

            {/* Hospital Location & Map */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Affiliated Medical Facility & Directions</h3>
                <span className="text-xs text-emerald-700 font-semibold">{doctor.hospitalName}</span>
              </div>
              <InteractiveMap
                hospitalName={doctor.hospitalName}
                address={doctor.hospital?.address || "Suite 402, 742 Evergreen Medical Blvd"}
              />
            </div>
          </div>

          {/* Right Booking Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Guaranteed Time Slot
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1.5">Book Consultation</h3>
                <p className="text-xs text-slate-500">Atomic queue serial generated immediately.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Consultation Fee:</span>
                  <span className="text-base font-black text-slate-900">${doctor.consultationFee}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Earliest Availability:</span>
                  <span className="font-semibold text-emerald-700">{doctor.nextSlotTime || "Today 3:15 PM"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Remaining Serial Tokens:</span>
                  <span className="font-bold text-slate-800">{doctor.remainingTokens || 18} Tokens</span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-[#16A878] hover:bg-[#11835D] text-white text-xs font-bold transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment & Get Serial</span>
              </button>

              <div className="pt-2 text-[11px] text-slate-400 text-center space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Free cancellation up to 30 mins before arrival</span>
                </p>
                <p>Includes digital prescription, lab requests & waiting tracker</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <BookAppointmentModal
        doctor={doctor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
