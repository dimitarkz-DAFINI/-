import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  availableUsers: User[];
  login: (userId: string) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
}

// Двамата основни потребители на студиото (Димитър и Ивана)
export const SIMULATED_USERS: User[] = [
  {
    id: 'dimitar',
    name: 'Димитър',
    email: 'dimitar.kz@gmail.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    specialty: 'Realism, Dark Lettering & Cover-Ups',
    phone: '+359 88 123 4567',
    instagram: '@dimitar.hacienda.ink',
    colorBadge: '#762685'
  },
  {
    id: 'ivana',
    name: 'Ивана',
    email: 'ivana@hacienda.studio',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    specialty: 'Fine Line, Geometry & Botanical Tattoo',
    phone: '+359 88 987 6543',
    instagram: '@ivana.ink.design',
    colorBadge: '#b87333'
  }
];

export const useAuthStore = create<AuthState>((set) => ({
  // По подразбиране започваме с вписан Димитър за бърз преглед и работа в студиото
  currentUser: SIMULATED_USERS[0],
  isAuthenticated: true,
  availableUsers: SIMULATED_USERS,

  login: (userId: string) => {
    const user = SIMULATED_USERS.find((u) => u.id === userId);
    if (user) {
      set({
        currentUser: user,
        isAuthenticated: true
      });
    }
  },

  logout: () => {
    set({
      currentUser: null,
      isAuthenticated: false
    });
  },

  switchUser: (userId: string) => {
    const user = SIMULATED_USERS.find((u) => u.id === userId);
    if (user) {
      set({
        currentUser: user,
        isAuthenticated: true
      });
    }
  }
}));
