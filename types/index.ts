export type UserRole = "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "ADMIN";

export type QueueStatus =
  | "SCHEDULED"
  | "CHECKED_IN"
  | "WAITING"
  | "CALLED"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  mrn?: string;
  assignedHospitalId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IHospital {
  _id?: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  contactPhone: string;
  emergencyHotline: string;
  departments: string[];
  bedCapacity: number;
  openingHours: string;
  rating: number;
  reviewCount: number;
  image: string;
  parkingInfo?: string;
  intakeDeskInfo?: string;
}

export interface IDoctor {
  _id?: string;
  userId?: string;
  name: string;
  title: string;
  specialty: string;
  subSpecialty?: string;
  qualifications: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  hospitalId: string;
  hospitalName: string;
  roomNumber: string;
  stationNumber: string;
  avatar: string;
  bio: string;
  availableDays: string[];
  avgConsultTimeMinutes: number;
  nextSlotTime?: string;
  remainingTokens?: number;
  isAvailableToday?: boolean;
}

export interface IVitals {
  bloodPressure: string; // e.g. "138/88"
  pulseRate: number; // e.g. 76
  oxygenSpO2: number; // e.g. 98
  bodyTemp: number; // e.g. 98.4
  weightKg: number; // e.g. 78
  bmi: number; // e.g. 26.2
}

export interface IAppointment {
  _id?: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientMrn: string;
  patientAge?: number;
  patientGender?: "Male" | "Female" | "Other";
  patientBloodGroup?: string;
  allergies?: string[];
  
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  
  hospitalId: string;
  hospitalName: string;
  hospitalAddress?: string;
  
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "11:00 AM"
  serialNumber: string; // e.g. "A-024"
  status: QueueStatus;
  
  reasonForVisit: string;
  symptoms: string[];
  vitals?: IVitals;
  
  billingStatus: "PAID" | "PENDING";
  copayAmount: number;
  
  checkInTime?: string;
  calledTime?: string;
  inConsultationTime?: string;
  completedTime?: string;
  cancelledReason?: string;
  skipReason?: string;
  
  estimatedWaitMinutes?: number;
  travelTimeMinutes?: number;
  recommendedDepartureTime?: string;
  
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IMedicationItem {
  name: string;
  dosage: string; // e.g. "5 mg"
  frequency: string; // e.g. "1 Tab Once Daily (1-0-0)"
  timing: string; // e.g. "After Breakfast"
  duration: string; // e.g. "30 Days"
  quantity: string; // e.g. "30 Tabs"
}

export interface IPrescription {
  _id?: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  hospitalName: string;
  date: string;
  
  diagnosisCode: string; // e.g. "I10"
  diagnosisName: string; // e.g. "Essential (Primary) Hypertension"
  severity: "Mild" | "Moderate" | "Severe";
  symptoms: string[];
  clinicalAssessment: string;
  
  medications: IMedicationItem[];
  dietaryAdvice: string[];
  customAdvice?: string;
  investigations: string[];
  
  digitalSignature: string;
  isDraft: boolean;
  issuedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IMedicalRecord {
  _id?: string;
  patientId: string;
  patientName: string;
  category: "Consultation" | "Prescription" | "Lab Report" | "Document";
  title: string;
  date: string;
  doctorName: string;
  hospitalName: string;
  summary: string;
  fileUrl?: string;
  downloadUrl?: string;
  badge?: string;
}

export interface IQueueEvent {
  time: string;
  title: string;
  description: string;
  serial?: string;
  type: "CALL" | "ENTER" | "COMPLETE" | "OPEN" | "CHECKIN" | "SKIP";
}

export interface IQueueState {
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  date: string;
  currentServingSerial: string | null;
  activePatientName?: string | null;
  activePatientElapsedMinutes?: number;
  activeInRoomToken?: string | null;
  nextEligibleSerial: string | null;
  nextPatientName?: string | null;
  scheduledCount: number;
  waitingCount: number;
  completedCount: number;
  activeCount: number;
  flowPace: string; // e.g. "Normal (4m avg)"
  events: IQueueEvent[];
  queueList: IAppointment[];
}

export interface INotification {
  _id?: string;
  recipientId: string;
  recipientRole: UserRole;
  title: string;
  message: string;
  type: "SMS" | "IN_APP" | "SYSTEM";
  serialNumber?: string;
  status: "SENT" | "DELIVERED" | "FAILED";
  timestamp: string;
}

export interface IAuditLog {
  _id?: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  timestamp: string;
}
