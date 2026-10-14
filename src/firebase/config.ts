import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
  type Firestore
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Конфигурация за Hacienda Di Ink Studio Firebase проект
// Зарежда се от environment променливи (с безопасни резервни стойности за разработка)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyHaciendaDiInkStudioDemoKey123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hacienda-di-ink-studio.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hacienda-di-ink-studio",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hacienda-di-ink-studio.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475610",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475610:web:89a1b2c3d4e5f6g7"
};

// Инициализация на Firebase App сингълтън
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth инстанция
export const auth: Auth = getAuth(app);

// Cloud Firestore инстанция
export const db: Firestore = getFirestore(app);

// Firebase Cloud Storage инстанция за дизайни, скици и снимки на татуировки
export const storage: FirebaseStorage = getStorage(app);

// Изрично активиране на Offline Persistence чрез IndexedDB
// Това гарантира, че ако интернетът в студиото прекъсне, татуистите могат да записват
// клиенти, часове и сесии офлайн, а данните ще се синхронизират автоматично при възстановяване на връзката.
export const initializeOfflinePersistence = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    await enableIndexedDbPersistence(db);
    console.log('[Hacienda Firestore] Offline IndexedDB persistence successfully enabled.');
    return true;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error.code === 'failed-precondition') {
      // Множество отворени табове – persistence може да е активен само в един таб едновременно
      console.warn('[Hacienda Firestore] Multiple tabs open, persistence enabled in first tab only.');
    } else if (error.code === 'unimplemented') {
      // Браузърът не поддържа необходимите IndexedDB функции
      console.warn('[Hacienda Firestore] Current browser does not support offline IndexedDB persistence.');
    } else {
      console.error('[Hacienda Firestore] Error enabling offline persistence:', error.message || error);
    }
    return false;
  }
};

// Автоматично извикване на офлайн персистентността при зареждане в браузъра
if (typeof window !== 'undefined') {
  initializeOfflinePersistence();
}

export default app;
