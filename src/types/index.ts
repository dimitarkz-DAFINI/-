export type UserRole = 'admin' | 'artist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  specialty: string;
  phone: string;
  instagram: string;
  colorBadge: string;
}

export type TabId = 'home' | 'calendar' | 'clients' | 'sessions' | 'menu';

export interface TabItem {
  id: TabId;
  label: string;
  badge?: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  normalizedPhone: string;
  email?: string;
  instagram?: string;
  allergies?: string;
  medicalNotes?: string;
  notes?: string;
  hasConsent: boolean;
  waiverPdfUrl?: string;
  waiverSignedAt?: string;
  createdAt: string;
  totalSessions: number;
  lastTattoo?: string;
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  artistId: string;
  artistName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  bufferMinutes: number;
  sessionEndTime: string;
  totalSlotEndTime: string;
  tattooType: string;
  bodyLocation?: string;
  estimatedPrice: number;
  deposit: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface SlotAvailabilityResult {
  available: boolean;
  conflictReason?: string;
  conflictingAppointment?: Appointment;
}

export interface SessionLog {
  id: string;
  clientId: string;
  clientName: string;
  artistId: string;
  artistName: string;
  tattooTitle: string;
  bodyLocation: string;
  date: string;
  durationMinutes: number;
  voltage: number;
  needleSizes: string[];
  inksUsed: string[];
  machineModel?: string;
  notes?: string;
  priceCharged: number;
  createdAt: string;
}

export interface DigitalWaiver {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  artistId: string;
  artistName: string;
  date: string;
  timestamp: string;
  signatureDataUrl: string;
  pdfUrl?: string;
  declarationText: string;
  isLegalAge: boolean;
  hasMedicalCleared: boolean;
  agreedToAftercare: boolean;
  agreedToDataProcessing: boolean;
}

export interface StudioSettings {
  studioName: string;
  defaultStudioCutPercent: number; // e.g. 35%
  defaultArtistCutPercent: number; // e.g. 65%
  materialFeeDefault: number; // e.g. 15 лв
  currency: string;
}

export type PaymentMethod = 'cash' | 'card' | 'revolut' | 'bank_transfer';

export interface PaymentRecord {
  id: string;
  appointmentId?: string;
  clientId: string;
  clientName: string;
  artistId: string;
  artistName: string;
  tattooTitle: string;
  totalAmount: number;
  depositDeducted: number;
  finalPaidAmount: number;
  materialFee: number;
  studioCutPercent: number;
  studioAmount: number; // За касата на студиото
  artistAmount: number; // Нето за артиста
  paymentMethod: PaymentMethod;
  notes?: string;
  date: string;
  createdAt: string;
}

export interface TattooComplexityAssessment {
  complexityLevel: 'Ниска (1/5)' | 'Умерена (2/5)' | 'Висока (3/5)' | 'Много висока (4/5)' | 'Майсторска / Пълен проект (5/5)';
  estimatedHoursMin: number;
  estimatedHoursMax: number;
  recommendedSessions: number;
  recommendedNeedles: string[];
  recommendedVoltage: string;
  painIndex: string;
  technicalAdvice: string;
  recommendedPriceMin: number;
  recommendedPriceMax: number;
}
