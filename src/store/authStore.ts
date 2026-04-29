import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

const initialToken = localStorage.getItem('token');

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  user: null,
  setAuth: (token: string, user: User) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));
