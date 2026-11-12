import React from "react";
import Link from "next/link";
import { Activity, ShieldCheck, Lock, Radio } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#16A878] flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">MediConnect</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Unified clinical orchestration and digital triage network supporting acute, outpatient, and multi-specialty regional care facilities.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Encrypted Regional Node #MC-204 Active</span>
            </div>
          </div>

          {/* Portals & Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Portals & Access
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/patient" className="hover:text-emerald-400 transition">
                  Patient Health Record & Queue
                </Link>
              </li>
              <li>
                <Link href="/doctor" className="hover:text-emerald-400 transition">
                  Clinical EMR Workspace (Doctor)
                </Link>
              </li>
              <li>
                <Link href="/receptionist" className="hover:text-emerald-400 transition">
                  Reception Triage & Serial Counter
                </Link>
              </li>
              <li>
                <Link href="/waiting-room" className="hover:text-emerald-400 transition">
                  Public Waiting-Room Display (TV)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition">
                  Enterprise Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Lines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Emergency Lines
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <span className="text-rose-400 font-semibold">Trauma Center:</span> 1-800-555-0911
              </li>
              <li>
                <span className="text-amber-400 font-semibold">Nurse Triage Line:</span> 1-800-555-CARE
              </li>
              <li>
                <span className="text-sky-400 font-semibold">Bed Dispatch:</span> Ext. 4020
              </li>
              <li>
                <span className="text-slate-300">Ambulance Fleet:</span> Code Blue Channel 4
              </li>
            </ul>
          </div>

          {/* Compliance & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Compliance & Security
            </h4>
            <div className="space-y-2 text-slate-400">
              <p className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>HIPAA Compliant • HL7 / FHIR R4 Ready</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <Lock className="w-4 h-4 text-sky-400" />
                <span>256-Bit AES Storage • ISO 27001 Certified</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <Radio className="w-4 h-4 text-indigo-400" />
                <span>Zero Waiting Room Drift Protocol</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © 2026 MediConnect Healthcare Ecosystem. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-slate-300 transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300 transition">Terms of Service</Link>
            <Link href="/waiting-room" className="text-emerald-400 hover:text-emerald-300 transition font-semibold">
              Public Queue Monitor TV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
