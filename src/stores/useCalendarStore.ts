import { create } from 'zustand';
import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Appointment, SlotAvailabilityResult } from '../types';

export const BUFFER_MINUTES = 30;

export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const minutesToTime = (totalMinutes: number): string => {
  const normalized = Math.max(0, totalMinutes % (24 * 60));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const calculateSessionTimes = (startTime: string, durationMinutes: number) => {
  const startMin = timeToMinutes(startTime);
  const sessionEndMin = startMin + durationMinutes;
  const totalSlotEndMin = sessionEndMin + BUFFER_MINUTES;

  return {
    startTime,
    durationMinutes,
    bufferMinutes: BUFFER_MINUTES,
    sessionEndTime: minutesToTime(sessionEndMin),
    totalSlotEndTime: minutesToTime(totalSlotEndMin),
    startMin,
    sessionEndMin,
    totalSlotEndMin
  };
};

interface CalendarState {
  appointments: Appointment[];
  selectedDate: string;
  selectedArtistFilter: string;
  setSelectedDate: (date: string) => void;
  setSelectedArtistFilter: (artistId: string) => void;

  checkSlotAvailability: (
    artistId: string,
    date: string,
    startTime: string,
    durationMinutes: number,
    excludeAppointmentId?: string
  ) => SlotAvailabilityResult;

  addAppointment: (
    appointmentData: Omit<
      Appointment,
      'id' | 'createdAt' | 'bufferMinutes' | 'sessionEndTime' | 'totalSlotEndTime'
    >
  ) => Promise<{ success: boolean; error?: string; appointment?: Appointment }>;

  updateAppointment: (
    id: string,
    updates: Partial<Appointment>
  ) => Promise<{ success: boolean; error?: string }>;

  deleteAppointment: (id: string) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;

  getAppointmentsByDate: (date: string, artistId?: string) => Appointment[];
  getAppointmentsForMonth: (year: number, monthIndex: number) => Appointment[];
  loadAppointmentsFromFirestore: () => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  appointments: [],
  selectedDate: '2026-10-14',
  selectedArtistFilter: 'all',

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedArtistFilter: (artistId) => set({ selectedArtistFilter: artistId }),

  checkSlotAvailability: (
    artistId: string,
    date: string,
    startTime: string,
    durationMinutes: number,
    excludeAppointmentId?: string
  ): SlotAvailabilityResult => {
    const newStartMin = timeToMinutes(startTime);
    const newSessionEndMin = newStartMin + durationMinutes;
    const newTotalEndMin = newSessionEndMin + BUFFER_MINUTES;

    if (newStartMin < timeToMinutes('09:00') || newTotalEndMin > timeToMinutes('22:30')) {
      return {
        available: false,
        conflictReason: `Часът е извън работното време (09:00 - 22:00 ч. с дезинфекция).`
      };
    }

    const activeAppointments = get().appointments.filter(
      (apt) =>
        apt.artistId === artistId &&
        apt.date === date &&
        apt.status !== 'cancelled' &&
        apt.id !== excludeAppointmentId
    );

    for (const existing of activeAppointments) {
      const existingStartMin = timeToMinutes(existing.startTime);
      const existingSessionEndMin = existingStartMin + existing.durationMinutes;
      const existingTotalEndMin = existingSessionEndMin + existing.bufferMinutes;

      const hasOverlap = Math.max(newStartMin, existingStartMin) < Math.min(newTotalEndMin, existingTotalEndMin);

      if (hasOverlap) {
        return {
          available: false,
          conflictReason: `Времеви конфликт при ${existing.artistName}: ${existing.startTime} - ${existing.totalSlotEndTime} е зает.`,
          conflictingAppointment: existing
        };
      }
    }

    return { available: true };
  },

  addAppointment: async (appointmentData) => {
    const { startTime, durationMinutes, artistId, date } = appointmentData;
    const availability = get().checkSlotAvailability(artistId, date, startTime, durationMinutes);

    if (!availability.available) {
      return { success: false, error: availability.conflictReason || 'Часът е зает.' };
    }

    const timeCalculations = calculateSessionTimes(startTime, durationMinutes);
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      bufferMinutes: timeCalculations.bufferMinutes,
      sessionEndTime: timeCalculations.sessionEndTime,
      totalSlotEndTime: timeCalculations.totalSlotEndTime,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'appointments', newAppointment.id), newAppointment);
      set((state) => ({ appointments: [...state.appointments, newAppointment] }));
      return { success: true, appointment: newAppointment };
    } catch (err) {
      console.error('Error adding appointment to Firestore', err);
      return { success: false, error: 'Грешка при запис в базата данни.' };
    }
  },

  updateAppointment: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'appointments', id), updates as any);
      set((state) => ({
        appointments: state.appointments.map((apt) => (apt.id === id ? { ...apt, ...updates } : apt))
      }));
      return { success: true };
    } catch (err) {
      console.error('Error updating appointment', err);
      return { success: false, error: 'Грешка при обновяване.' };
    }
  },

  deleteAppointment: async (id) => {
    await deleteDoc(doc(db, 'appointments', id));
    set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id) }));
  },

  cancelAppointment: async (id) => {
    await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
    }));
  },

  getAppointmentsByDate: (date, artistId) => {
    return get()
      .appointments.filter((a) => a.date === date && a.status !== 'cancelled' && (artistId === 'all' || a.artistId === artistId))
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  },

  getAppointmentsForMonth: (year, monthIndex) => {
    const monthPrefix = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
    return get().appointments.filter((a) => a.date.startsWith(monthPrefix) && a.status !== 'cancelled');
  },

  loadAppointmentsFromFirestore: async () => {
    try {
      const q = query(collection(db, 'appointments'));
      const snapshot = await getDocs(q);
      const appointments: Appointment[] = [];
      snapshot.forEach((docSnap) => appointments.push(docSnap.data() as Appointment));
      set({ appointments });
    } catch (e) {
      console.error('Error loading appointments from Firestore', e);
    }
  }
}));
