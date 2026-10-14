import { create } from 'zustand';
import type { Client } from '../types';

export const normalizePhoneNumber = (phone: string): string => {
  // Премахване на интервали, тирета, скоби
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '').trim();

  // Преобразуване на водещи '00359' в '+359'
  if (cleaned.startsWith('00359')) {
    cleaned = '+359' + cleaned.slice(5);
  }
  // Преобразуване на водеща '0' (български национален формат 088...) в '+35988...'
  else if (cleaned.startsWith('0') && cleaned.length >= 9) {
    cleaned = '+359' + cleaned.slice(1);
  }

  return cleaned;
};

interface ClientState {
  clients: Client[];
  addClient: (
    clientData: Omit<Client, 'id' | 'createdAt' | 'totalSessions' | 'normalizedPhone'>
  ) => { success: boolean; error?: string; client?: Client };
  updateClient: (id: string, updates: Partial<Client>) => { success: boolean; error?: string };
  deleteClient: (id: string) => void;
  isPhoneDuplicate: (phone: string, excludeClientId?: string) => boolean;
  getClientByPhone: (phone: string) => Client | undefined;
  getClientById: (id: string) => Client | undefined;
  incrementSessions: (id: string, tattooTitle?: string) => void;
  searchClients: (query: string) => Client[];
}

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Александър Стоянов',
    phone: '+359 88 555 1234',
    normalizedPhone: '+359885551234',
    email: 'alex.stoyanov@gmail.com',
    instagram: '@alex_ink_fan',
    allergies: 'Няма алергии',
    medicalNotes: 'Добра поносимост на болка, чиста кожа без екземи',
    notes: 'Работим по голям проект за цяла ръка (Dragon Realism)',
    hasConsent: true,
    createdAt: '2026-09-10T10:00:00.000Z',
    totalSessions: 3,
    lastTattoo: 'Dragon forearm realism - 1st pass'
  },
  {
    id: 'client-2',
    name: 'Мария Иванова',
    phone: '+359 87 777 5678',
    normalizedPhone: '+359877775678',
    email: 'maria.iva@abv.bg',
    instagram: '@maria_iva',
    allergies: 'Чувствителност към дезинфектанти с никел/алкохол',
    medicalNotes: 'Да се използва хипоалергенен сапун и зелен сапун без аромати',
    notes: 'Предпочита фини линии и ботанически мотиви (Peonies)',
    hasConsent: true,
    createdAt: '2026-09-18T14:30:00.000Z',
    totalSessions: 1,
    lastTattoo: 'Peonies Fine Line on shoulder'
  },
  {
    id: 'client-3',
    name: 'Георги Димитров',
    phone: '+359 89 222 9988',
    normalizedPhone: '+359892229988',
    email: 'g.dimitrov88@gmail.com',
    instagram: '@georgi_d',
    allergies: 'Няма алергии',
    medicalNotes: 'Всички предишни татуировки са заздравели перфектно',
    notes: 'Редовен клиент от 2 години, пълен Black & Grey ръкав',
    hasConsent: true,
    createdAt: '2026-08-01T11:00:00.000Z',
    totalSessions: 5,
    lastTattoo: 'Full sleeve black & grey realism'
  },
  {
    id: 'client-4',
    name: 'Елена Петрова',
    phone: '+359 88 444 3322',
    normalizedPhone: '+359884443322',
    email: 'elena.petrova@mail.bg',
    instagram: '@elena_p',
    allergies: 'Лека чувствителност към червен пигмент',
    medicalNotes: 'Да се направи тест с червено мастило преди попълване',
    notes: 'Микро-реализъм пеперуда и геометрични детайли',
    hasConsent: true,
    createdAt: '2026-10-02T16:00:00.000Z',
    totalSessions: 1,
    lastTattoo: 'Micro butterfly on ribcage'
  }
];

const STORAGE_KEY = 'hacienda_clients_crm_v1';

const getSavedClients = (): Client[] => {
  if (typeof window === 'undefined') return INITIAL_CLIENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CLIENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CLIENTS;
  } catch {
    return INITIAL_CLIENTS;
  }
};

const saveClientsToStorage = (clients: Client[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error('Failed to save clients to localStorage', e);
  }
};

export const useClientStore = create<ClientState>((set, get) => ({
  clients: getSavedClients(),

  isPhoneDuplicate: (phone: string, excludeClientId?: string) => {
    const normalized = normalizePhoneNumber(phone);
    if (!normalized || normalized.length < 6) return false;

    return get().clients.some(
      (c) => c.normalizedPhone === normalized && c.id !== excludeClientId
    );
  },

  getClientByPhone: (phone: string) => {
    const normalized = normalizePhoneNumber(phone);
    return get().clients.find((c) => c.normalizedPhone === normalized);
  },

  getClientById: (id: string) => {
    return get().clients.find((c) => c.id === id);
  },

  addClient: (clientData) => {
    const normalized = normalizePhoneNumber(clientData.phone);

    // Валидация за минимална дължина
    if (!normalized || normalized.length < 8) {
      return {
        success: false,
        error: 'Моля въведете валиден телефонен номер (минимум 8 цифри).'
      };
    }

    // Задължителна валидация срещу дублиран телефонен номер в CRM
    const existingClient = get().clients.find((c) => c.normalizedPhone === normalized);
    if (existingClient) {
      return {
        success: false,
        error: `Клиент с телефон ${clientData.phone} вече съществува в базата: "${existingClient.name}". Използвайте съществуващия запис или проверете номера!`
      };
    }

    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      normalizedPhone: normalized,
      createdAt: new Date().toISOString(),
      totalSessions: 0
    };

    set((state) => {
      const updated = [newClient, ...state.clients];
      saveClientsToStorage(updated);
      return { clients: updated };
    });

    return { success: true, client: newClient };
  },

  updateClient: (id, updates) => {
    if (updates.phone) {
      const normalized = normalizePhoneNumber(updates.phone);
      const duplicate = get().clients.find(
        (c) => c.normalizedPhone === normalized && c.id !== id
      );
      if (duplicate) {
        return {
          success: false,
          error: `Телефонният номер ${updates.phone} вече е зает от друг клиент (${duplicate.name}).`
        };
      }
      updates.normalizedPhone = normalized;
    }

    set((state) => {
      const updated = state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveClientsToStorage(updated);
      return { clients: updated };
    });

    return { success: true };
  },

  deleteClient: (id) => {
    set((state) => {
      const updated = state.clients.filter((c) => c.id !== id);
      saveClientsToStorage(updated);
      return { clients: updated };
    });
  },

  incrementSessions: (id, tattooTitle) => {
    set((state) => {
      const updated = state.clients.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            totalSessions: c.totalSessions + 1,
            lastTattoo: tattooTitle || c.lastTattoo
          };
        }
        return c;
      });
      saveClientsToStorage(updated);
      return { clients: updated };
    });
  },

  searchClients: (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return get().clients;

    const normalizedQ = normalizePhoneNumber(q);
    return get().clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (normalizedQ && c.normalizedPhone.includes(normalizedQ)) ||
        (c.instagram && c.instagram.toLowerCase().includes(q))
    );
  }
}));
