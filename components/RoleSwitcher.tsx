"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserRole } from "@/types";
import { ChevronDown, Check, UserCheck, Stethoscope, ClipboardList, Shield, Tv } from "lucide-react";

interface RoleOption {
  id: string;
  role: UserRole;
  label: string;
  sub: string;
  path: string;
  icon: any;
}

const ROLES: RoleOption[] = [
  {
    id: "doctor",
    role: "DOCTOR",
    label: "Dr. S. Thorne (MD)",
    sub: "Chief Medical Officer",
    path: "/doctor",
    icon: Stethoscope,
  },
  {
    id: "patient",
    role: "PATIENT",
    label: "Arthur Dent",
    sub: "Serial Token #A-024",
    path: "/patient",
    icon: UserCheck,
  },
  {
    id: "receptionist",
    role: "RECEPTIONIST",
    label: "Clara Evans",
    sub: "Triage & Desk Lead",
    path: "/receptionist",
    icon: ClipboardList,
  },
  {
    id: "admin",
    role: "ADMIN",
    label: "Hospital Admin",
    sub: "System Operations",
    path: "/admin",
    icon: Shield,
  },
  {
    id: "display",
    role: "RECEPTIONIST",
    label: "Waiting Room Display",
    sub: "1920x1080 TV Monitor",
    path: "/waiting-room",
    icon: Tv,
  },
];

export default function RoleSwitcher({ minimal = false }: { minimal?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleOption>(ROLES[0]);

  useEffect(() => {
    // Detect active role from path
    if (pathname.startsWith("/patient")) {
      setSelectedRole(ROLES[1]);
    } else if (pathname.startsWith("/receptionist")) {
      setSelectedRole(ROLES[2]);
    } else if (pathname.startsWith("/admin")) {
      setSelectedRole(ROLES[3]);
    } else if (pathname.startsWith("/waiting-room")) {
      setSelectedRole(ROLES[4]);
    } else if (pathname.startsWith("/doctor")) {
      setSelectedRole(ROLES[0]);
    }
  }, [pathname]);

  const handleSelect = (option: RoleOption) => {
    setSelectedRole(option);
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("mediconnect_active_role", option.role);
      localStorage.setItem("mediconnect_active_persona", option.label);
      window.dispatchEvent(new Event("mediconnect_role_change"));
    }
    router.push(option.path);
  };

  const Icon = selectedRole.icon;

  if (minimal) {
    return (
      <div className="relative inline-block text-left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition shadow-xs"
          title="Switch Active Clinical Persona"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Icon className="w-3.5 h-3.5 text-emerald-700" />
          <span>{selectedRole.label}</span>
          <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-64 rounded-xl bg-white shadow-xl border border-slate-200 z-50 py-1 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Role Switcher
            </div>
            {ROLES.map((opt) => {
              const OptIcon = opt.icon;
              const isCurrent = opt.id === selectedRole.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs transition ${
                    isCurrent ? "bg-emerald-50/80 text-emerald-950 font-medium" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isCurrent ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                    <OptIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{opt.label}</div>
                    <div className="text-[11px] text-slate-500 truncate">{opt.sub}</div>
                  </div>
                  {isCurrent && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1 px-1">
        Active Role Switcher
      </div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition shadow-2xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <div className="truncate">
            <div className="text-xs font-bold text-slate-900 truncate">{selectedRole.label}</div>
            <div className="text-[11px] text-slate-500 truncate">{selectedRole.sub}</div>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 overflow-hidden">
          {ROLES.map((opt) => {
            const OptIcon = opt.icon;
            const isCurrent = opt.id === selectedRole.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition ${
                  isCurrent ? "bg-emerald-50 text-emerald-950 font-medium" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isCurrent ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                  <OptIcon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 truncate">{opt.sub}</div>
                </div>
                {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
