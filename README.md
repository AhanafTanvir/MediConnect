# MediConnect 🩺

> **Full-Stack Healthcare Ecosystem & Live Queue Management Platform**  
> Connecting Patients, Doctors, Receptionists, and Public Waiting Rooms with live serial queue tracking, smart departure estimation, digital EMR prescriptions, and automated audio calling.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://mediconnect-ahanaf.vercel.app/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2F%20Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

---

## 🌐 Live Application
- **Production URL:** [https://mediconnect-ahanaf.vercel.app/](https://mediconnect-ahanaf.vercel.app/)
- **Repository:** [https://github.com/AhanafTanvir/MediConnect](https://github.com/AhanafTanvir/MediConnect)

---

## ✨ Key Features

### 1. 🏥 Patient Portal & Smart Scheduling
- **Doctor & Specialty Directory**: Search physicians by specialty, ratings, hospital affiliations, and consultation fees.
- **Atomic Serial Generation**: Guaranteed sequential, collision-free queue token assignment (e.g., `#A-022`, `#A-023`).
- **Smart Departure & Arrival Estimator**: Calculates optimal home departure times based on live queue dwell times, traffic buffers, and clinic flow velocity.
- **Digital Health Passport**: View past consultation notes, vitals history, and instant digital prescription PDFs.

### 2. 📢 Receptionist Desk & Voice Calling
- **Dedicated Consultation Control Station**: Real-time triage monitor showing active in-room patients and next-in-line tokens.
- **Audio Chime & Voice Speech Announcement**:
  - Broadcasts hospital dual-tone bell chime (E5 & A5).
  - Clear speech synthesis: *"Attention please. Next patient: Serial number A 23, Nusrat Jahan. Please proceed to Room 408."*
- **One-Click Progression**: "Complete Patient Appointment", "Next Patient", and "Complete & Next" quick actions.
- **Repeat Announcement**: Instantly replay the chime and spoken voice call if a patient is in the lobby or restroom.
- **Walk-In Intake**: Rapid registration modal for unexpected clinical arrivals.

### 3. 📺 1920×1080 Public Waiting Room TV Display
- Full-screen TV monitor mode (`/waiting-room`) designed for lobby displays.
- High-visibility "NOW SERVING" token and "NEXT IN LINE" indicator.
- Synchronized lobby audio chime and announcements whenever the queue advances.
- **Patient Privacy Mode**: Single-click toggle to display token numbers only, protecting patient identity in public spaces.

### 4. 🩺 Doctor Examination Workspace
- Live active consultation timer and patient history intake.
- ICD-10 diagnostic coding, severity grading, and clinical observation recorder.
- Interactive medication builder with dosage, frequency notation (e.g., `1-0-1`), and dietary instructions.
- Instant digital prescription generator with printable EHR export.

### 5. 🛡️ Hospital Admin & Operational Analytics
- Patient dwell time metrics, doctor utilization, and no-show rate analytics.
- Comprehensive audit trail logging every queue transition, doctor action, and patient check-in.

---

## 🏗️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio & Speech**: Web Audio API (Dual-tone frequency synthesis) & Web Speech API (`SpeechSynthesis`)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) (includes automatic fallback to in-memory MongoDB for instant zero-config local testing)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18.17+ or 20+
- npm, pnpm, or yarn

### 1. Clone the repository
```bash
git clone https://github.com/AhanafTanvir/MediConnect.git
cd MediConnect
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

> **Note**: For local development, `MONGODB_URI` can be left empty — MediConnect includes an automatic embedded in-memory MongoDB server with seed data!

### 4. Start the development server
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📂 Key Application Routes

| Route | Description |
|---|---|
| `/` | Landing page, hospital directory & instant booking |
| `/patient` | Patient portal, upcoming appointments & digital prescriptions |
| `/receptionist` | Reception triage desk, live queue calling station with voice announcement |
| `/waiting-room` | 1920×1080 public waiting room TV display with automated lobby chime |
| `/doctor` | Doctor examination suite, EMR notes & prescription authoring |
| `/admin` | Clinical audit logs, department metrics & doctor schedule management |

---

## 📄 License
This project is licensed under the MIT License.
