import { create } from 'zustand';
import type { AuthState } from '../interfaces/auth.interface';

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: (() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  })(),
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
    window.location.href = '/login';
  },
}));
