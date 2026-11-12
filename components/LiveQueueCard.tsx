"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Car, Clock, ShieldCheck, Send, CheckCircle2, Navigation } from "lucide-react";

interface LiveQueueCardProps {
  initialSerial?: string;
  nowServing?: string;
  patientsAhead?: number;
  estWait?: string;
  leaveBy?: string;
}

export default function LiveQueueCard({
  initialSerial = "A-024",
  nowServing = "A-019",
  patientsAhead = 4,
  estWait = "~45 mins",
  leaveBy = "10:20 AM",
}: LiveQueueCardProps) {
  const [currentServing, setCurrentServing] = useState(nowServing);
  const [assignedToken] = useState(initialSerial);
  const [aheadCount, setAheadCount] = useState(patientsAhead);
  const [smsSent, setSmsSent] = useState(false);

  // Poll or sync queue changes
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch("/api/queue");
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.currentServingSerial) {
            setCurrentServing(json.data.currentServingSerial);
          }
          if (json.data.queueList) {
            const myIndex = json.data.queueList.findIndex(
              (item: any) => item.serialNumber === assignedToken
            );
            if (myIndex >= 0) {
              const activeIndex = json.data.queueList.findIndex(
                (item: any) => item.serialNumber === json.data.currentServingSerial
              );
              const remaining = Math.max(0, myIndex - (activeIndex >= 0 ? activeIndex : 0));
              setAheadCount(remaining);
            }
          }
        }
      } catch (e) {
        console.warn("Queue fetch error:", e);
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 6000);
    return () => clearInterval(interval);
  }, [assignedToken]);

  const handleSendSms = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 4000);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Top Header */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
            Live Queue Monitor
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-400">Real-Time EMR Sync</span>
      </div>

      {/* Facility & Room bar */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">St. Jude Medical Pavilion</h3>
          <p className="text-[11px] text-slate-500 font-medium">Clinic 3B • Cardiac & Vascular Wing</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
          Active Room 14
        </span>
      </div>

      {/* Two Token Metric Blocks */}
      <div className="px-5 py-3 grid grid-cols-2 gap-3">
        {/* Your Token */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Your Assigned Token
          </div>
          <div className="text-2xl font-black text-emerald-800 tracking-tight my-0.5">
            #{assignedToken}
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Confirmed & Verified</span>
          </div>
        </div>

        {/* Now Serving */}
        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
            Now Serving
          </div>
          <div className="text-2xl font-black text-sky-800 tracking-tight my-0.5">
            #{currentServing}
          </div>
          <div className="text-[10px] font-semibold text-sky-700">
            {aheadCount} Patients Ahead
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="px-5 py-2 grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
          <Car className="w-4 h-4 text-slate-500 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 font-medium">Recommended Departure</div>
            <div className="font-bold text-slate-900">{leaveBy}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
          <Clock className="w-4 h-4 text-slate-500 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 font-medium">Est. Waiting Time</div>
            <div className="font-bold text-slate-900">{estWait}</div>
          </div>
        </div>
      </div>

      {/* Map Preview Snippet */}
      <div className="px-5 py-2">
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-24 flex items-center justify-between px-4">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#2878D0_1px,transparent_1px)] [background-size:12px_12px]" />
          
          {/* Simulated Route Line */}
          <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900">12 miles via Expressway</div>
              <div className="text-[10px] text-slate-500">Live traffic clear • 25 min travel</div>
            </div>
          </div>

          <Link
            href="/patient"
            className="relative z-10 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-xs hover:bg-slate-50 transition"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Route Map</span>
          </Link>
        </div>
      </div>

      {/* Footer bar with SMS */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium text-slate-600">Device pacing: On schedule</span>
        </div>

        <button
          onClick={handleSendSms}
          disabled={smsSent}
          className="inline-flex items-center gap-1 font-bold text-xs text-blue-600 hover:text-blue-700 transition"
        >
          <Send className="w-3 h-3" />
          <span>{smsSent ? "SMS Alert Dispatched!" : "Send SMS Alert"}</span>
        </button>
      </div>
    </div>
  );
}
