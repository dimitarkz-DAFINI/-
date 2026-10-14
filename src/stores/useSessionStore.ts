import { create } from 'zustand';
import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { SessionLog } from '../types';

interface SessionState {
  sessions: SessionLog[];
  isLoading: boolean;
  addSession: (
    sessionData: Omit<SessionLog, 'id' | 'createdAt'>
  ) => Promise<{ success: boolean; error?: string; session?: SessionLog }>;
  getSessionsByArtist: (artistId: string) => SessionLog[];
  getSessionsByClient: (clientId: string) => SessionLog[];
  loadSessionsFromFirestore: () => Promise<void>;
}

const STORAGE_KEY = 'hacienda_sessions_log_v1';

const INITIAL_SESSIONS: SessionLog[] = [
  {
    id: 'session-1',
    clientId: 'client-1',
    clientName: 'Александър Стоянов',
    artistId: 'dimitar',
    artistName: 'Димитър',
    tattooTitle: 'Dragon Forearm Realism (Пас 1)',
    bodyLocation: 'Дясна предмишница',
    date: '2026-10-14',
    durationMinutes: 150,
    voltage: 7.8,
    needleSizes: ['03RL (Контур)', '07CM (Преливки)', '17RM (Плътен черен пълнеж)'],
    inksUsed: ['Dynamic Triple Black', 'Solid Ink Dark Grey Wash', 'Eternal White Highlight'],
    machineModel: 'Bishop Rotary Power Wand 4.2',
    notes: 'Отлична поносимост. Кожата пое пигмента без кървене. Поставено Dermalize фолио.',
    priceCharged: 320,
    createdAt: '2026-10-14T13:30:00.000Z'
  },
  {
    id: 'session-2',
    clientId: 'client-2',
    clientName: 'Мария Иванова',
    artistId: 'ivana',
    artistName: 'Ивана',
    tattooTitle: 'Peonies Fine Line с цитат',
    bodyLocation: 'Ляво рамо & ключица',
    date: '2026-10-14',
    durationMinutes: 120,
    voltage: 6.5,
    needleSizes: ['01RL (Ултра фин контур)', '03RL (Текстура)'],
    inksUsed: ['Dynamic Standard Black', 'Panthera Light Grey Wash'],
    machineModel: 'Cheyenne SOL Nova Unlimited 3.5',
    notes: 'Деликатни линии, хипоалергенен сапун. Клиентката е предупредена за слънцезащита.',
    priceCharged: 200,
    createdAt: '2026-10-14T16:30:00.000Z'
  },
  {
    id: 'session-3',
    clientId: 'client-3',
    clientName: 'Георги Димитров',
    artistId: 'dimitar',
    artistName: 'Димитър',
    tattooTitle: 'Full Sleeve Black & Grey (Засенчване лакът)',
    bodyLocation: 'Дясна ръка (лакът и бицепс)',
    date: '2026-10-12',
    durationMinutes: 240,
    voltage: 8.2,
    needleSizes: ['09RL', '15M1', '23RM (Голям магнум за фон)'],
    inksUsed: ['World Famous Pitch Black', 'Dynamic Dark Grey Wash'],
    machineModel: 'FK Irons Spektra Flux Max',
    notes: 'Тежка сесия на лакътна става, клиентът издържа без почивка.',
    priceCharged: 450,
    createdAt: '2026-10-12T17:00:00.000Z'
  }
];

const getSavedSessions = (): SessionLog[] => {
  if (typeof window === 'undefined') return INITIAL_SESSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_SESSIONS;
  } catch {
    return INITIAL_SESSIONS;
  }
};

const saveSessionsToStorage = (sessions: SessionLog[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions to localStorage', e);
  }
};

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: getSavedSessions(),
  isLoading: false,

  addSession: async (sessionData) => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newSession: SessionLog = {
      ...sessionData,
      id: newSessionId,
      createdAt: new Date().toISOString()
    };

    // 1. Моментен ъпдейт на локалния Zustand state
    set((state) => {
      const updated = [newSession, ...state.sessions];
      saveSessionsToStorage(updated);
      return { sessions: updated };
    });

    // 2. Персистиране във Firestore колекция "sessions" (с поддръжка на офлайн кеш)
    try {
      const sessionDocRef = doc(db, 'sessions', newSessionId);
      await setDoc(sessionDocRef, newSession);
      console.log(`[Firestore] Session ${newSessionId} synced successfully to collection "sessions".`);
    } catch (err) {
      console.warn('[Firestore] Stored locally; will sync to "sessions" when online:', err);
    }

    return { success: true, session: newSession };
  },

  getSessionsByArtist: (artistId) => {
    if (!artistId || artistId === 'all') return get().sessions;
    return get().sessions.filter((s) => s.artistId === artistId);
  },

  getSessionsByClient: (clientId) => {
    return get().sessions.filter((s) => s.clientId === clientId);
  },

  loadSessionsFromFirestore: async () => {
    try {
      set({ isLoading: true });
      const q = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const firestoreSessions: SessionLog[] = [];
      snapshot.forEach((docSnap) => {
        firestoreSessions.push(docSnap.data() as SessionLog);
      });

      if (firestoreSessions.length > 0) {
        set({ sessions: firestoreSessions });
        saveSessionsToStorage(firestoreSessions);
      }
    } catch (e) {
      console.warn('[Firestore] Using cached local sessions:', e);
    } finally {
      set({ isLoading: false });
    }
  }
}));
