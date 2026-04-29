import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ token: null, user: null });
  });

  it('should initialize with null values', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should set authentication data', () => {
    const token = 'fake-token';
    const user = { id: 1, username: 'admin', role: 'ADMIN' };
    
    useAuthStore.getState().setAuth(token, user);
    
    const state = useAuthStore.getState();
    expect(state.token).toBe(token);
    expect(state.user).toEqual(user);
    expect(localStorage.getItem('token')).toBe(token);
  });

  it('should logout and clear data', () => {
    useAuthStore.getState().setAuth('token', { id: 1 } as any);
    useAuthStore.getState().logout();
    
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
