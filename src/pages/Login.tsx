import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, type User } from '../store/authStore';
import api from '../services/api';

interface LoginResponse {
  token: string;
  user: User;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<LoginResponse>('/auth/login', { username, password });
      setAuth(response.data.token, response.data.user);
      navigate('/');
    } catch (err: unknown) {
      // Usamos el tipado any temporalmente o intentamos acceder de forma segura:
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: 'var(--bg-color)',
    }}>
      <form onSubmit={handleSubmit} style={{ 
        padding: '2.5rem', 
        background: 'var(--card-bg)', 
        borderRadius: 'var(--radius)', 
        boxShadow: 'var(--shadow)', 
        display: 'flex', 
        flexDirection: 'column', 
        width: '350px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Bienvenido</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ingresa tus credenciales de logística</p>
        </div>

        {error && (
          <div style={{ 
            color: 'var(--error-text)', 
            marginBottom: '1.5rem', 
            textAlign: 'center', 
            fontSize: '0.85rem', 
            padding: '0.75rem', 
            backgroundColor: 'var(--error-bg)', 
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '500' }}>Usuario</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            placeholder="nombre_usuario"
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border)', 
              boxSizing: 'border-box',
              outline: 'none',
              fontSize: '0.95rem',
              backgroundColor: '#fafafa'
            }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '500' }}>Contraseña</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border)', 
              boxSizing: 'border-box',
              outline: 'none',
              fontSize: '0.95rem',
              backgroundColor: '#fafafa'
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            padding: '0.85rem', 
            backgroundColor: loading ? '#e2e8f0' : 'var(--primary)', 
            color: '#0369a1', 
            borderRadius: '8px', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            fontWeight: '600',
            fontSize: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          {loading ? 'Validando...' : 'Entrar al Panel'}
        </button>
      </form>
    </div>
  );
};

export default Login;
