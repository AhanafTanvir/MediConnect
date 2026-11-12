import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediConnect — Doctor Appointment & Patient Record Management System",
  description:
    "Full-stack desktop-first healthcare platform connecting Patients, Doctors, Receptionists, and Administrators with live serial tracking, smart departure estimation, and digital prescriptions.",
  keywords: [
    "doctor appointments",
    "live queue serial",
    "patient records",
    "digital prescription",
    "hospital directory",
    "smart departure",
    "waiting room display",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] text-slate-900">
        {children}
      </body>
    </html>
  );
}
