"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IHospital } from "@/types";
import {
  Search,
  Building2,
  MapPin,
  Phone,
  BedDouble,
  Navigation,
  ExternalLink,
  ShieldAlert,
  Clock,
  Star,
} from "lucide-react";

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<IHospital[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHospital, setSelectedHospital] = useState<IHospital | null>(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`/api/hospitals?search=${encodeURIComponent(searchTerm)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setHospitals(json.data);
        if (json.data.length > 0 && !selectedHospital) {
          setSelectedHospital(json.data[0]);
        }
      }
    } catch (err) {
      console.warn("Error fetching hospitals:", err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHospitals();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Integrated Regional Care Mesh</span>
          </div>

          <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Find Hospitals & Medical Pavilions
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Explore accredited regional medical centers, trauma bays, outpatient surgical suites, and specialized clinics.
              </p>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search hospital, department, or city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#16A878] bg-slate-50 focus:bg-white transition"
              />
            </form>
          </div>
        </div>
      </div>

      {/* Hospital Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hosp) => {
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              `${hosp.name}, ${hosp.address}`
            )}`;

            return (
              <div
                key={hosp._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  {/* Hospital Image */}
                  <div className="relative h-44 w-full bg-slate-200 overflow-hidden">
                    <img
                      src={hosp.image}
                      alt={hosp.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-bold text-slate-900 shadow-xs flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{hosp.rating}</span>
                      <span className="text-slate-400 font-normal">({hosp.reviewCount})</span>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{hosp.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{hosp.address}</span>
                      </p>
                    </div>

                    {/* Departments Chips */}
                    <div className="flex flex-wrap gap-1">
                      {hosp.departments?.slice(0, 3).map((dept) => (
                        <span
                          key={dept}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                        >
                          {dept}
                        </span>
                      ))}
                      {(hosp.departments?.length || 0) > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-semibold">
                          +{hosp.departments.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Facility Metrics */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hosp.bedCapacity} Total Beds</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{hosp.openingHours}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1 text-rose-600 font-bold">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{hosp.contactPhone}</span>
                  </div>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#2878D0] hover:bg-[#1E5EA4] text-white font-bold transition shadow-xs"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Directions</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
