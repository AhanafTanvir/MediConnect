"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IQueueState } from "@/types";
import { announcePatient, playChime } from "@/lib/audioAnnouncement";
import {
  Activity,
  Volume2,
  VolumeX,
  Maximize2,
  Eye,
  EyeOff,
  Clock,
  ArrowRight,
  Shield,
  Sparkles,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

export default function WaitingRoomDisplayPage() {
  const [queueState, setQueueState] = useState<IQueueState | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false); // only show serials, hide names
  const [lastAnnouncedToken, setLastAnnouncedToken] = useState<string | null>(null);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Play audio chime using Web Audio API synthesis
  const playChime = () => {
    if (!audioEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      // Tone 1: High bell
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      // Tone 2: Harmonious bell
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.2); // A5
      gain2.gain.setValueAtTime(0.35, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 1.2);
    } catch (e) {
      console.warn("Audio chime:", e);
    }
  };

  // Poll Queue State
  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/queue");
      const json = await res.json();
      if (json.success && json.data) {
        setQueueState(json.data);

        // Announce with voice & chime if active token changed
        const activeToken = json.data.currentServingSerial;
        const activeName = json.data.activePatientName || "Patient";
        if (activeToken && activeToken !== "None" && activeToken !== lastAnnouncedToken) {
          setLastAnnouncedToken(activeToken);
          if (audioEnabled) {
            announcePatient(activeToken, activeName, "Room 408");
          }
        }
      }
    } catch (e) {
      console.warn("Display queue error:", e);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 4000);
    return () => clearInterval(interval);
  }, [lastAnnouncedToken]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.warn(err));
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
    }
  };

  const activeToken = queueState?.currentServingSerial || "A-022";
  const activeName = queueState?.activePatientName || "Rahim Hasan";
  const nextToken = queueState?.nextEligibleSerial || "A-023";
  const nextName = queueState?.nextPatientName || "Nusrat Jahan";

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 lg:p-12 select-none overflow-hidden font-sans">
      {/* Top Header Bar for 1920x1080 display */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#16A878] flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>St. Jude Medical Pavilion</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold uppercase tracking-wider">
                Live EMR Sync
              </span>
            </div>
            <div className="text-sm lg:text-base text-slate-400 font-medium mt-0.5">
              Cardiology & Vascular Department • Room 408 • Station 02
            </div>
          </div>
        </div>

        {/* Live Clock & Date */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl lg:text-4xl font-black tracking-tight text-emerald-400 font-mono">
              {currentTime || "10:24:18 AM"}
            </div>
            <div className="text-xs lg:text-sm text-slate-400 font-semibold">{currentDate}</div>
          </div>

          {/* Quick Screen Controls for Receptionist */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
            <button
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                playChime();
              }}
              title="Toggle Audio Announcement Chime"
              className={`p-2.5 rounded-xl transition ${
                audioEnabled ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              title="Toggle Privacy Mode (Only Show Serials)"
              className={`p-2.5 rounded-xl transition ${
                privacyMode ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {privacyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleFullscreen}
              title="Full Screen TV Monitor (1920x1080)"
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Waiting Room Calling Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-8">
        {/* Left Column: Huge NOW SERVING Token (8 cols) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 rounded-3xl border-2 border-emerald-500/50 p-8 lg:p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Activity className="w-96 h-96 text-emerald-500" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-sm font-bold uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>NOW SERVING • IN CONSULTATION</span>
            </div>

            <span className="text-sm font-semibold text-slate-400">
              Dr. Sarah Jenkins, MD FACC
            </span>
          </div>

          {/* Enormous Token Number */}
          <div className="relative z-10 my-8 text-center sm:text-left">
            <div className="text-8xl sm:text-9xl lg:text-[140px] font-black text-white tracking-tighter leading-none text-shadow-lg">
              #{activeToken}
            </div>

            {!privacyMode && (
              <div className="text-2xl sm:text-4xl font-black text-emerald-300 mt-4 tracking-tight">
                {activeName}
              </div>
            )}
          </div>

          {/* Loud Clear Directive for Patient */}
          <div className="relative z-10 bg-emerald-900/60 border border-emerald-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="text-xl sm:text-2xl font-black text-white">
                PLEASE PROCEED TO ROOM 408
              </div>
              <div className="text-sm font-semibold text-emerald-300">
                Cardiology Examination Suite • Station 02
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-lg">
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Right Column: NEXT PATIENT & UPCOMING QUEUE (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-6">
          {/* Next Patient Card */}
          <div className="bg-slate-900 rounded-3xl border-2 border-blue-500/40 p-6 lg:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                NEXT PATIENT IN LINE
              </span>
              <span className="text-xs font-semibold text-slate-400">Please prepare</span>
            </div>

            <div className="text-6xl lg:text-7xl font-black text-blue-300 tracking-tight">
              #{nextToken}
            </div>

            {!privacyMode && (
              <div className="text-xl font-bold text-white truncate">{nextName}</div>
            )}

            <div className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
              Please take a seat near Door 4B. The clinic coordinator will usher you when called.
            </div>
          </div>

          {/* Upcoming Serials Mini Board */}
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Upcoming Queue Serials
            </div>

            <div className="grid grid-cols-3 gap-2">
              {queueState?.queueList
                ?.filter((a) => a.serialNumber !== activeToken && a.serialNumber !== nextToken && a.status !== "COMPLETED")
                .slice(0, 6)
                .map((item) => (
                  <div
                    key={item.serialNumber}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center"
                  >
                    <div className="text-base font-bold text-slate-200">#{item.serialNumber}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {privacyMode ? "Waiting" : item.patientName?.split(" ")[0]}
                    </div>
                  </div>
                )) || (
                <div className="col-span-3 text-center text-xs text-slate-500 py-2">
                  No further patients in waiting line
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Display Footer */}
      <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <Link href="/receptionist" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Receptionist Desk</span>
          </Link>
          <span>•</span>
          <span>MediConnect Clinical TV Monitor Standard (1920 × 1080)</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Patient Identity Protection Mode: {privacyMode ? "Active (Serials Only)" : "Standard (Name & Token)"}</span>
        </div>
      </div>
    </div>
  );
}
