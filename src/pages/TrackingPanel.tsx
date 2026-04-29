import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { trackingService } from '../services/trackingService';
import type { TrackingData } from '../types/tracking.types';

const TrackingPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTracking = async () => {
      try {
        const result = await trackingService.getTracking(id);
        setData(result);
        setLastFetch(new Date());
      } catch (error) {
        console.error('Error fetching tracking data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Llamada inicial
    fetchTracking();

    // Configurar polling cada 30 segundos
    const intervalId = setInterval(() => {
      fetchTracking();
    }, 30000);

    // Limpieza para evitar memory leaks
    return () => clearInterval(intervalId);
  }, [id]);

  return (
    <Layout>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Monitoreo de Ruta #{id}</h1>
          <Link to="/" style={backLinkStyle}>Volver al Dashboard</Link>
        </div>

        {loading && !data ? (
          <div style={loadingStyle}>Cargando datos de monitoreo...</div>
        ) : data ? (
          <div style={cardStyle}>
            <div style={infoGridStyle}>
              <div style={infoItemStyle}>
                <span style={labelStyle}>Estado</span>
                <span style={valueStyle}>{data.status}</span>
              </div>
              <div style={infoItemStyle}>
                <span style={labelStyle}>Ubicación Actual</span>
                <span style={valueStyle}>{data.current_location}</span>
              </div>
              <div style={infoItemStyle}>
                <span style={labelStyle}>ETA (Estimado)</span>
                <span style={valueStyle}>{data.estimated_time_arrival}</span>
              </div>
            </div>

            <div style={progressContainerStyle}>
              <div style={progressHeaderStyle}>
                <span style={progressLabelStyle}>Progreso del viaje</span>
                <span style={progressPercentageStyle}>{data.progress_percentage}%</span>
              </div>
              <div style={progressBarBackgroundStyle}>
                <div 
                  style={{ 
                    ...progressBarFillStyle, 
                    width: `${data.progress_percentage}%` 
                  }} 
                />
              </div>
            </div>

            {lastFetch && (
              <div style={footerStyle}>
                Última actualización: {lastFetch.toLocaleTimeString()}
              </div>
            )}
          </div>
        ) : (
          <div style={errorStyle}>No se pudo cargar la información de la ruta.</div>
        )}
      </div>
    </Layout>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem'
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.875rem',
  color: '#1e293b',
  margin: 0
};

const backLinkStyle: React.CSSProperties = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: '500',
  fontSize: '0.9rem'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '1rem',
  padding: '2rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  border: '1px solid #e2e8f0'
};

const infoGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem'
};

const infoItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#64748b',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const valueStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  color: '#0f172a',
  fontWeight: '600'
};

const progressContainerStyle: React.CSSProperties = {
  marginTop: '2rem',
  paddingTop: '2rem',
  borderTop: '1px solid #f1f5f9'
};

const progressHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '0.75rem'
};

const progressLabelStyle: React.CSSProperties = {
  fontWeight: '500',
  color: '#334155'
};

const progressPercentageStyle: React.CSSProperties = {
  fontWeight: 'bold',
  color: '#2563eb'
};

const progressBarBackgroundStyle: React.CSSProperties = {
  height: '1rem',
  backgroundColor: '#e2e8f0',
  borderRadius: '9999px',
  overflow: 'hidden'
};

const progressBarFillStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: '#2563eb',
  borderRadius: '9999px',
  transition: 'width 1s ease-in-out'
};

const footerStyle: React.CSSProperties = {
  marginTop: '1.5rem',
  textAlign: 'right',
  fontSize: '0.75rem',
  color: '#94a3b8'
};

const loadingStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '3rem',
  color: '#64748b',
  fontSize: '1.1rem'
};

const errorStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem',
  backgroundColor: '#fef2f2',
  color: '#ef4444',
  borderRadius: '0.5rem',
  border: '1px solid #fca5a5'
};

export default TrackingPanel;
