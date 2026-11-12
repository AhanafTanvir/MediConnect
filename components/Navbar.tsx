"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RoleSwitcher from "./RoleSwitcher";
import { Activity, ShieldAlert, PhoneCall, ChevronRight, Menu, X, ArrowUpRight } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Public Portal", href: "/" },
    { label: "Find Doctors", href: "/doctors" },
    { label: "Services & Clinics", href: "/hospitals" },
    { label: "Patient Access", href: "/patient" },
    { label: "Staff Console", href: "/doctor" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 shadow-2xs">
      {/* Top Clinical Emergency Notification Banner */}
      <div className="bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 border-b border-rose-200/60 text-xs px-4 py-1.5 text-rose-900 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 max-w-4xl">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
          <span className="font-semibold text-rose-700">Need immediate trauma care or ambulatory transfer?</span>
          <span className="hidden md:inline text-rose-600/90">Immediate clinical response across 450+ integrated facilities.</span>
        </div>
        <div className="flex items-center gap-3 font-medium">
          <span className="flex items-center gap-1.5 text-rose-800">
            <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
            <span className="font-bold">Priority Dispatch: Dial 911 / 108</span>
          </span>
          <Link
            href="/hospitals"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-semibold text-[11px] hover:bg-rose-700 transition"
          >
            Find Nearest ER
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#16A878] to-[#11835D] flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1">
                Medi<span className="text-[#16A878]">Connect</span>
              </div>
              <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase -mt-0.5">
                Clinical Ecosystem
              </div>
            </div>
          </Link>

          {/* Operational Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Hospital Operational • Online</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Switch Persona */}
          <RoleSwitcher minimal />

          <Link
            href="/doctor"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#16A878] hover:bg-[#11835D] text-white text-xs font-bold shadow-xs hover:shadow-md transition"
          >
            <span>Staff Console</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <Link
              href="/patient"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-700"
            >
              Patient Portal
            </Link>
            <Link
              href="/doctor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-xs font-bold rounded-lg bg-[#16A878] text-white"
            >
              Doctor Workspace
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
