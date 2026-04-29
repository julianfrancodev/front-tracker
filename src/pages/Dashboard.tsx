import React from 'react';
import { useAuthStore } from '../store/authStore';

const Dashboard: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <header style={{ 
        padding: '1.5rem 2rem', 
        backgroundColor: 'var(--card-bg)', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Logística Panel</h1>
        <button 
          onClick={logout}
          style={{ 
            padding: '0.5rem 1.25rem', 
            backgroundColor: '#fee2e2', 
            color: '#b91c1c', 
            borderRadius: '8px', 
            fontWeight: '600',
            fontSize: '0.9rem'
          }}
        >
          Cerrar Sesión
        </button>
      </header>

      <main style={{ padding: '3rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ 
          padding: '3rem', 
          backgroundColor: 'var(--card-bg)', 
          borderRadius: 'var(--radius)', 
          boxShadow: 'var(--shadow)',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Bienvenido al Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Aquí podrás gestionar todas tus operaciones logísticas con una interfaz clara y eficiente.
          </p>
          
          <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--accent)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Envíos</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>124</p>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Pendientes</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>12</p>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: '#dcfce7', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Entregados</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>89</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
