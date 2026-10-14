import { create } from 'zustand';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { PaymentRecord, StudioSettings } from '../types';

interface FinanceState {
  settings: StudioSettings;
  payments: PaymentRecord[];
  updateSettings: (newSettings: Partial<StudioSettings>) => void;
  calculateSplit: (
    totalAmount: number,
    depositDeducted: number,
    materialFee?: number,
    customStudioPercent?: number
  ) => {
    finalPaidAmount: number;
    studioCutPercent: number;
    artistCutPercent: number;
    studioAmount: number;
    artistAmount: number;
    materialFee: number;
  };
  addPayment: (
    paymentData: Omit<PaymentRecord, 'id' | 'createdAt'>
  ) => Promise<{ success: boolean; payment?: PaymentRecord; error?: string }>;
  getPaymentsByArtist: (artistId: string) => PaymentRecord[];
}

const DEFAULT_SETTINGS: StudioSettings = {
  studioName: 'Hacienda Di Ink Studio',
  defaultStudioCutPercent: 35, // 35% за касата на студиото
  defaultArtistCutPercent: 65, // 65% нето за татуиста
  materialFeeDefault: 0, // По избор: консумативи
  currency: 'лв'
};

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    appointmentId: 'apt-1',
    clientId: 'client-1',
    clientName: 'Александър Стоянов',
    artistId: 'dimitar',
    artistName: 'Димитър',
    tattooTitle: 'Dragon Forearm Realism (Пас 1)',
    totalAmount: 320,
    depositDeducted: 60,
    finalPaidAmount: 260,
    materialFee: 0,
    studioCutPercent: 35,
    studioAmount: 91, // 35% от 260 лв
    artistAmount: 169, // 65% от 260 лв
    paymentMethod: 'cash',
    notes: 'Платено в брой на касата на студиото',
    date: '2026-10-14',
    createdAt: '2026-10-14T13:45:00.000Z'
  },
  {
    id: 'pay-2',
    appointmentId: 'apt-2',
    clientId: 'client-2',
    clientName: 'Мария Иванова',
    artistId: 'ivana',
    artistName: 'Ивана',
    tattooTitle: 'Peonies Fine Line с цитат',
    totalAmount: 200,
    depositDeducted: 50,
    finalPaidAmount: 150,
    materialFee: 0,
    studioCutPercent: 35,
    studioAmount: 52.5,
    artistAmount: 97.5,
    paymentMethod: 'card',
    notes: 'ПОС терминал студио',
    date: '2026-10-14',
    createdAt: '2026-10-14T16:40:00.000Z'
  }
];

const STORAGE_KEY_PAYMENTS = 'hacienda_payments_v1';
const STORAGE_KEY_SETTINGS = 'hacienda_studio_settings_v1';

const getSavedSettings = (): StudioSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const getSavedPayments = (): PaymentRecord[] => {
  if (typeof window === 'undefined') return INITIAL_PAYMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAYMENTS);
    return raw ? JSON.parse(raw) : INITIAL_PAYMENTS;
  } catch {
    return INITIAL_PAYMENTS;
  }
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
  settings: getSavedSettings(),
  payments: getSavedPayments(),

  updateSettings: (newSettings) => {
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      }
      return { settings: updated };
    });
  },

  calculateSplit: (totalAmount, depositDeducted, materialFee = 0, customStudioPercent) => {
    const studioPercent = customStudioPercent ?? get().settings.defaultStudioCutPercent;
    const artistPercent = 100 - studioPercent;

    // Реално дължимо плащане (след приспадане на вече платено капаро)
    const finalPaidAmount = Math.max(0, totalAmount - depositDeducted);

    // База за разпределение (след консумативи, ако има)
    const baseForSplit = Math.max(0, finalPaidAmount - materialFee);

    const rawStudioCut = (baseForSplit * studioPercent) / 100;
    const studioAmount = Math.round((rawStudioCut + materialFee) * 100) / 100;
    const artistAmount = Math.round(((baseForSplit * artistPercent) / 100) * 100) / 100;

    return {
      finalPaidAmount,
      studioCutPercent: studioPercent,
      artistCutPercent: artistPercent,
      studioAmount,
      artistAmount,
      materialFee
    };
  },

  addPayment: async (paymentData) => {
    const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: paymentId,
      createdAt: new Date().toISOString()
    };

    set((state) => {
      const updated = [newPayment, ...state.payments];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(updated));
      }
      return { payments: updated };
    });

    // Запис във Firestore колекция "payments"
    try {
      await setDoc(doc(db, 'payments', paymentId), newPayment);
      console.log(`[Firestore] Payment ${paymentId} saved to collection "payments".`);
    } catch (err) {
      console.warn('[Firestore] Stored payment locally in IndexedDB cache:', err);
    }

    return { success: true, payment: newPayment };
  },

  getPaymentsByArtist: (artistId) => {
    if (!artistId || artistId === 'all') return get().payments;
    return get().payments.filter((p) => p.artistId === artistId);
  }
}));
