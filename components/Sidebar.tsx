"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RoleSwitcher from "./RoleSwitcher";
import {
  Activity,
  Stethoscope,
  User,
  ClipboardList,
  Building2,
  Tv,
  Users,
  GitBranch,
  Pill,
  Video,
  BedDouble,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const rolePortals = [
    { label: "Doctor Workspace", href: "/doctor", icon: Stethoscope },
    { label: "Patient Dashboard", href: "/patient", icon: User },
    { label: "Receptionist Desk", href: "/receptionist", icon: ClipboardList },
    { label: "Hospital Admin", href: "/admin", icon: Building2 },
    { label: "Waiting Room Display", href: "/waiting-room", icon: Tv },
  ];

  const clinicalServices = [
    { label: "Patient Roster", href: "#patient-roster", icon: Users },
    { label: "Live Triage Queue", href: "#triage-queue", icon: GitBranch },
    { label: "Rx & Lab Orders", href: "#rx-orders", icon: Pill },
    { label: "Virtual Clinic", href: "#virtual-clinic", icon: Video },
    { label: "Bed Management", href: "#bed-management", icon: BedDouble },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      {/* Top Header & Role Switcher */}
      <div className="p-4 space-y-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#16A878] to-[#11835D] flex items-center justify-center text-white shadow-xs">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-slate-900 leading-tight">
              Medi<span className="text-[#16A878]">Connect</span>
            </div>
            <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase -mt-0.5">
              Clinical Ecosystem
            </div>
          </div>
        </Link>

        {/* Role Switcher */}
        <RoleSwitcher />

        {/* Portals Section */}
        <div className="pt-2">
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-2 mb-1.5">
            Role Portals
          </div>
          <nav className="space-y-0.5">
            {rolePortals.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#16A878] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Clinical Services Section */}
        <div className="pt-2">
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-2 mb-1.5">
            Clinical Services
          </div>
          <nav className="space-y-0.5">
            {clinicalServices.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Station / Department Banner */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
          <div>
            <div className="text-[11px] font-bold text-slate-800">Dept: Cardiology</div>
            <div className="text-[10px] text-slate-500">Ward 4B • Station 02</div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0" />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
          <Link href="/" className="hover:text-slate-800 flex items-center gap-1 font-medium">
            <LogOut className="w-3 h-3" />
            <span>Public Home</span>
          </Link>
          <span className="text-[10px] text-slate-400">v2.4 Live EMR</span>
        </div>
      </div>
    </aside>
  );
}
