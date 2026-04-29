import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;

      setAuth(token, user);
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error.response?.status === 401) {
        setError('Credenciales incorrectas. Verifica tu usuario y contraseña.');
      } else {
        setError(error.response?.data?.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Logística Pro</h2>
        <p style={subtitleStyle}>Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label htmlFor="username" style={labelStyle}>Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              required
              placeholder="admin"
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="password" style={labelStyle}>Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
              placeholder="••••••••"
            />
          </div>

          <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              ...errorStyle,
              opacity: error ? 1 : 0,
              transform: error ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'all 0.3s ease-in-out',
              pointerEvents: error ? 'auto' : 'none',
              width: '100%'
            }}>
              {error}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: loading ? '#ccc' : '#2563eb',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f3f4f6',
  fontFamily: 'system-ui, -apple-system, sans-serif'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '2.5rem',
  borderRadius: '1rem',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '400px'
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.875rem',
  fontWeight: 'bold',
  color: '#111827',
  textAlign: 'center',
  marginBottom: '0.5rem'
};

const subtitleStyle: React.CSSProperties = {
  color: '#6b7280',
  textAlign: 'center',
  marginBottom: '2rem'
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem'
};

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#374151'
};

const inputStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid #d1d5db',
  fontSize: '1rem',
  outline: 'none',
  transition: 'border-color 0.2s'
};

const buttonStyle: React.CSSProperties = {
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: 'none',
  color: 'white',
  fontSize: '1rem',
  fontWeight: '600',
  transition: 'background-color 0.2s',
  marginTop: '0.5rem'
};

const errorStyle: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '0.875rem',
  textAlign: 'center',
  backgroundColor: '#fee2e2',
  padding: '0.5rem',
  borderRadius: '0.375rem'
};

export default Login;
