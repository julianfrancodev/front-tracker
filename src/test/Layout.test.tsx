import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';

// Mock simplificado para Zustand que funciona con y sin selector
vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { username: 'testuser', role: 'ADMIN' },
    logout: vi.fn()
  }))
}));

describe('Layout Component', () => {
  it('should render children and user info', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div data-testid="test-child">Content</div>
        </Layout>
      </BrowserRouter>
    );

    // Ajustamos los textos para que coincidan con Layout.tsx (LogisColombia)
    expect(screen.getByText(/LogisColombia/i)).toBeInTheDocument();
    expect(screen.getByText(/testuser/i)).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });
});
