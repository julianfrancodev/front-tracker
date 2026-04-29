import React from 'react';
import { useAuthStore } from '../store/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();

  return (
    <div style={layoutStyle}>
      <header style={headerStyle}>
        <div style={logoStyle}>LogisColombia</div>
        <div style={userInfoStyle}>
          {user && <span style={usernameStyle}>Hola, {user.username}</span>}
          <button onClick={logout} style={logoutButtonStyle}>
            Cerrar Sesión
          </button>
        </div>
      </header>
      <main style={mainContentStyle}>
        {children}
      </main>
    </div>
  );
};

// Styles
const layoutStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  fontFamily: 'system-ui, -apple-system, sans-serif'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  backgroundColor: '#1e293b',
  color: 'white',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

const logoStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  letterSpacing: '0.5px'
};

const userInfoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
};

const usernameStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#cbd5e1'
};

const logoutButtonStyle: React.CSSProperties = {
  backgroundColor: '#ef4444',
  color: 'white',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: '500',
  transition: 'background-color 0.2s'
};

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  padding: '2rem',
  maxWidth: '1200px',
  margin: '0 auto',
  width: '100%',
  boxSizing: 'border-box'
};

export default Layout;
