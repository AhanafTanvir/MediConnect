"use client";

import React from "react";
import { Navigation, MapPin, ExternalLink, ShieldCheck } from "lucide-react";

interface InteractiveMapProps {
  hospitalName?: string;
  address?: string;
  distance?: string;
  travelTime?: string;
  routeLabel?: string;
  lat?: number;
  lng?: number;
}

export default function InteractiveMap({
  hospitalName = "Central Heart & Vascular Pavilion",
  address = "Suite 402, 742 Evergreen Medical Blvd",
  distance = "14.2 miles",
  travelTime = "25m Fast Route",
  routeLabel = "via I-95 N",
  lat = 40.758896,
  lng = -73.98513,
}: InteractiveMapProps) {
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${hospitalName}, ${address}`
  )}`;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Map Canvas Frame */}
      <div className="relative w-full h-56 bg-slate-100 overflow-hidden flex flex-col justify-between p-4">
        {/* Subtle grid pattern resembling maps */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-70" />
        
        {/* Vector road curves */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <path
            d="M 60 160 Q 180 130 280 80 T 420 50"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Active Navigation Route */}
          <path
            d="M 60 160 Q 180 130 280 80 T 420 50"
            fill="none"
            stroke="#2878D0"
            strokeWidth="4"
            strokeDasharray="6 4"
            className="animate-pulse"
          />
        </svg>

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>{distance} {routeLabel}</span>
          </div>

          <div className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs">
            <MapPin className="w-4 h-4" />
          </div>
        </div>

        {/* Points on Map */}
        <div className="relative z-10 flex items-end justify-between">
          {/* User Origin Pin */}
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
            <span>Your Current Location</span>
          </div>

          {/* Destination Pin */}
          <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>{travelTime}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-4 space-y-3 bg-white">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2878D0] hover:bg-[#1E5EA4] text-white text-xs font-bold transition shadow-xs hover:shadow-md"
        >
          <span>Get Turn-by-Turn Directions</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Parking & Intake Desk Quick Info */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Visitor Parking
            </div>
            <div className="font-semibold text-slate-800 text-[11px] mt-0.5">
              Blue Lot P2 (Bays 12-40)
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Intake Desk
            </div>
            <div className="font-semibold text-slate-800 text-[11px] mt-0.5">
              Floor 4 • Kiosk Station B
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
