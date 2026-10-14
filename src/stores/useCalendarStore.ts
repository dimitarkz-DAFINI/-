import { create } from 'zustand';
import type { Appointment, SlotAvailabilityResult } from '../types';

export const BUFFER_MINUTES = 30; // Фиксирано буферно време за дезинфекция и стерилизация

// Помощни функции за работа с часове
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
  selectedDate: string; // YYYY-MM-DD
  selectedArtistFilter: string; // 'all' | 'dimitar' | 'ivana'
  setSelectedDate: (date: string) => void;
  setSelectedArtistFilter: (artistId: string) => void;

  // КРИТИЧНО ПРАВИЛО: Проверка за застъпване на часове с включен 30-минутен буфер
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
  ) => { success: boolean; error?: string; appointment?: Appointment };

  updateAppointment: (
    id: string,
    updates: Partial<Appointment>
  ) => { success: boolean; error?: string };

  deleteAppointment: (id: string) => void;
  cancelAppointment: (id: string) => void;

  getAppointmentsByDate: (date: string, artistId?: string) => Appointment[];
  getAppointmentsForMonth: (year: number, monthIndex: number) => Appointment[];
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    clientId: 'client-1',
    clientName: 'Александър Стоянов',
    clientPhone: '+359 88 555 1234',
    artistId: 'dimitar',
    artistName: 'Димитър',
    date: '2026-10-14',
    startTime: '11:00',
    durationMinutes: 150, // 2h 30m
    bufferMinutes: 30,
    sessionEndTime: '13:30',
    totalSlotEndTime: '14:00', // включва 30 мин. дезинфекция
    tattooType: 'Dragon Forearm Realism (Пас 1)',
    bodyLocation: 'Предмишница (Forearm)',
    estimatedPrice: 320,
    deposit: 60,
    status: 'confirmed',
    notes: 'Клиентът иска по-тъмни сенки и детайлни люспи',
    createdAt: '2026-10-10T12:00:00.000Z'
  },
  {
    id: 'apt-2',
    clientId: 'client-2',
    clientName: 'Мария Иванова',
    clientPhone: '+359 87 777 5678',
    artistId: 'ivana',
    artistName: 'Ивана',
    date: '2026-10-14',
    startTime: '14:30',
    durationMinutes: 120, // 2h
    bufferMinutes: 30,
    sessionEndTime: '16:30',
    totalSlotEndTime: '17:00', // дезинфекция до 17:00
    tattooType: 'Peonies Fine Line с цитат',
    bodyLocation: 'Рамо и ключица',
    estimatedPrice: 200,
    deposit: 50,
    status: 'confirmed',
    notes: 'Игли 01RL, деликатен надпис',
    createdAt: '2026-10-11T14:15:00.000Z'
  },
  {
    id: 'apt-3',
    clientId: 'client-3',
    clientName: 'Георги Димитров',
    clientPhone: '+359 89 222 9988',
    artistId: 'dimitar',
    artistName: 'Димитър',
    date: '2026-10-14',
    startTime: '17:30',
    durationMinutes: 90, // 1h 30m
    bufferMinutes: 30,
    sessionEndTime: '19:00',
    totalSlotEndTime: '19:30',
    tattooType: 'Консултация & Проектиране на ръкав',
    bodyLocation: 'Цяла дясна ръка',
    estimatedPrice: 60,
    deposit: 0,
    status: 'confirmed',
    notes: 'Скициране на концепция и измерване на анатомия',
    createdAt: '2026-10-12T09:00:00.000Z'
  },
  {
    id: 'apt-4',
    clientId: 'client-4',
    clientName: 'Елена Петрова',
    clientPhone: '+359 88 444 3322',
    artistId: 'ivana',
    artistName: 'Ивана',
    date: '2026-10-16',
    startTime: '13:00',
    durationMinutes: 180, // 3h
    bufferMinutes: 30,
    sessionEndTime: '16:00',
    totalSlotEndTime: '16:30',
    tattooType: 'Botanical Geometry & Butterfly',
    bodyLocation: 'Ребра (Ribcage)',
    estimatedPrice: 280,
    deposit: 70,
    status: 'confirmed',
    notes: 'Хипоалергенен трансфер и тънък контур',
    createdAt: '2026-10-12T16:00:00.000Z'
  },
  {
    id: 'apt-5',
    clientId: 'client-1',
    clientName: 'Александър Стоянов',
    clientPhone: '+359 88 555 1234',
    artistId: 'dimitar',
    artistName: 'Димитър',
    date: '2026-10-21',
    startTime: '12:00',
    durationMinutes: 240, // 4h
    bufferMinutes: 30,
    sessionEndTime: '16:00',
    totalSlotEndTime: '16:30',
    tattooType: 'Dragon Realism (Пас 2 - Засенчване)',
    bodyLocation: 'Предмишница',
    estimatedPrice: 400,
    deposit: 100,
    status: 'pending',
    notes: 'Попълване на фон и бели акценти',
    createdAt: '2026-10-13T10:00:00.000Z'
  }
];

const STORAGE_KEY = 'hacienda_appointments_v1';

const getSavedAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') return INITIAL_APPOINTMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_APPOINTMENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_APPOINTMENTS;
  } catch {
    return INITIAL_APPOINTMENTS;
  }
};

const saveAppointmentsToStorage = (appointments: Appointment[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch (e) {
    console.error('Failed to save appointments to localStorage', e);
  }
};

export const useCalendarStore = create<CalendarState>((set, get) => ({
  appointments: getSavedAppointments(),
  selectedDate: '2026-10-14',
  selectedArtistFilter: 'all',

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedArtistFilter: (artistId) => set({ selectedArtistFilter: artistId }),

  /**
   * КРИТИЧНО ПРАВИЛО ЗА КАЛЕНДАРА:
   * Проверка за застъпване на часове с автоматично добавени 30 мин. буфер за дезинфекция.
   * Всеки час [Start, SessionEnd] заема реално времевия прозорец [Start, SessionEnd + 30m Buffer].
   */
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

    // Проверка за валидно работно време на студиото (напр. 09:00 - 22:00)
    if (newStartMin < timeToMinutes('09:00') || newTotalEndMin > timeToMinutes('22:30')) {
      return {
        available: false,
        conflictReason: `Часът е извън работното време на студиото (09:00 - 22:00 ч. включително дезинфекция).`
      };
    }

    // Търсене на съществуващи активни часове за същия татуист и дата
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

      // Проверка за застъпване на времеви интервали:
      // Новият интервал е [newStartMin, newTotalEndMin)
      // Съществуващият интервал е [existingStartMin, existingTotalEndMin)
      const hasOverlap = Math.max(newStartMin, existingStartMin) < Math.min(newTotalEndMin, existingTotalEndMin);

      if (hasOverlap) {
        // Детайлизирано съобщение защо е отказан часът
        let specificConflict = '';
        if (newStartMin >= existingStartMin && newStartMin < existingSessionEndMin) {
          specificConflict = `Артистът има активна сесия (${existing.startTime} - ${existing.sessionEndTime}) с клиент ${existing.clientName}.`;
        } else if (newStartMin >= existingSessionEndMin && newStartMin < existingTotalEndMin) {
          specificConflict = `Застъпва 30-минутния буфер за дезинфекция и стерилизация на предходната сесия (до ${existing.totalSlotEndTime} ч.).`;
        } else if (newSessionEndMin > existingStartMin) {
          specificConflict = `Продължителността на новата сесия застъпва следващия записан час в ${existing.startTime} ч.`;
        } else {
          specificConflict = `30-минутният буфер за почистване след новата сесия (до ${minutesToTime(newTotalEndMin)} ч.) навлиза в следващия час (${existing.startTime} ч.).`;
        }

        return {
          available: false,
          conflictReason: `Времеви конфликт при ${existing.artistName}: ${specificConflict}`,
          conflictingAppointment: existing
        };
      }
    }

    return { available: true };
  },

  addAppointment: (appointmentData) => {
    const { startTime, durationMinutes, artistId, date } = appointmentData;

    // Извикване на критичната валидация за застъпване
    const availability = get().checkSlotAvailability(
      artistId,
      date,
      startTime,
      durationMinutes
    );

    if (!availability.available) {
      return {
        success: false,
        error: availability.conflictReason || 'Избраният времеви интервал не е свободен.'
      };
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

    set((state) => {
      const updated = [...state.appointments, newAppointment].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
      });
      saveAppointmentsToStorage(updated);
      return { appointments: updated };
    });

    return { success: true, appointment: newAppointment };
  },

  updateAppointment: (id, updates) => {
    const current = get().appointments.find((a) => a.id === id);
    if (!current) {
      return { success: false, error: 'Резервацията не е намерена.' };
    }

    const artistId = updates.artistId || current.artistId;
    const date = updates.date || current.date;
    const startTime = updates.startTime || current.startTime;
    const durationMinutes = updates.durationMinutes || current.durationMinutes;

    // Проверка за застъпване ако са променени дата, час или продължителност
    if (
      updates.startTime ||
      updates.durationMinutes ||
      updates.date ||
      updates.artistId
    ) {
      const availability = get().checkSlotAvailability(
        artistId,
        date,
        startTime,
        durationMinutes,
        id // изключваме текущия запис от проверката
      );

      if (!availability.available) {
        return {
          success: false,
          error: availability.conflictReason || 'Новият час се застъпва с друга сесия или буфер.'
        };
      }
    }

    const timeCalc = calculateSessionTimes(startTime, durationMinutes);

    set((state) => {
      const updated = state.appointments.map((apt) => {
        if (apt.id === id) {
          return {
            ...apt,
            ...updates,
            sessionEndTime: timeCalc.sessionEndTime,
            totalSlotEndTime: timeCalc.totalSlotEndTime
          };
        }
        return apt;
      });
      saveAppointmentsToStorage(updated);
      return { appointments: updated };
    });

    return { success: true };
  },

  deleteAppointment: (id) => {
    set((state) => {
      const updated = state.appointments.filter((a) => a.id !== id);
      saveAppointmentsToStorage(updated);
      return { appointments: updated };
    });
  },

  cancelAppointment: (id) => {
    set((state) => {
      const updated = state.appointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' as const } : a
      );
      saveAppointmentsToStorage(updated);
      return { appointments: updated };
    });
  },

  getAppointmentsByDate: (date, artistId) => {
    return get()
      .appointments.filter((a) => {
        if (a.date !== date) return false;
        if (artistId && artistId !== 'all' && a.artistId !== artistId) return false;
        return a.status !== 'cancelled';
      })
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  },

  getAppointmentsForMonth: (year, monthIndex) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const monthPrefix = `${year}-${pad(monthIndex + 1)}`;
    return get().appointments.filter(
      (a) => a.date.startsWith(monthPrefix) && a.status !== 'cancelled'
    );
  }
}));
