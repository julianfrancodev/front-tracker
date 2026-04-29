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
      console.log('--- Iniciando fetch de tracking para ID:', id, '---');
      try {
        const response: any = await trackingService.getTracking(id);
        
        // Manejar el caso donde la API devuelve { success, data } o solo la data
        const trackingData: TrackingData = response.data ? response.data : response;
        
        console.log('Datos de monitoreo recibidos:', trackingData);
        setData(trackingData);
        setLastFetch(new Date());
      } catch (error) {
        console.error('Error fatal en fetchTracking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
    const intervalId = setInterval(fetchTracking, 30000);
    return () => clearInterval(intervalId);
  }, [id]);

  return (
    <Layout>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Ruta #{id} - En Vivo</h1>
          <Link to="/" style={backLinkStyle}>← Volver al Dashboard</Link>
        </div>

        {loading && !data ? (
          <div style={loadingStyle}>Sincronizando con GPS...</div>
        ) : data ? (
          <div style={cardStyle}>
            <div style={infoGridStyle}>
              <div style={infoItemStyle}>
                <span style={labelStyle}>Última Ubicación</span>
                <span style={valueStyle}>{data.lastLocation}</span>
              </div>
              <div style={infoItemStyle}>
                <span style={labelStyle}>Tiempo Restante</span>
                <span style={valueStyle}>{data.etaMinutes} minutos</span>
              </div>
              <div style={infoItemStyle}>
                <span style={labelStyle}>ID de Seguimiento</span>
                <span style={valueStyle}>{data.routeId}</span>
              </div>
            </div>

            <div style={progressContainerStyle}>
              <div style={progressHeaderStyle}>
                <span style={progressLabelStyle}>Progreso de la Entrega</span>
                <span style={progressPercentageStyle}>{data.progressPercent}%</span>
              </div>
              <div style={progressBarBackgroundStyle}>
                <div 
                  style={{ 
                    ...progressBarFillStyle, 
                    width: `${data.progressPercent}%` 
                  }} 
                />
              </div>
            </div>

            <div style={footerStyle}>
              {lastFetch && (
                <span>Sincronizado: {lastFetch.toLocaleTimeString()}</span>
              )}
              <span style={{ marginLeft: '1rem', color: '#10b981' }}>● Señal Activa</span>
            </div>
          </div>
        ) : (
          <div style={errorStyle}>Error: No se encontró información de GPS para esta ruta.</div>
        )}
      </div>
    </Layout>
  );
};

// Styles
const containerStyle: React.CSSProperties = { maxWidth: '800px', margin: '0 auto', padding: '1rem' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' };
const titleStyle: React.CSSProperties = { fontSize: '1.875rem', color: '#1e293b', margin: 0, fontWeight: '700' };
const backLinkStyle: React.CSSProperties = { color: '#64748b', textDecoration: 'none', fontWeight: '500', fontSize: '0.875rem' };
const cardStyle: React.CSSProperties = { backgroundColor: 'white', borderRadius: '1.25rem', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9' };
const infoGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginBottom: '2.5rem' };
const infoItemStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const labelStyle: React.CSSProperties = { fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' };
const valueStyle: React.CSSProperties = { fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' };
const progressContainerStyle: React.CSSProperties = { marginTop: '2rem', paddingTop: '2.5rem', borderTop: '2px solid #f8fafc' };
const progressHeaderStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-end' };
const progressLabelStyle: React.CSSProperties = { fontWeight: '600', color: '#475569', fontSize: '1rem' };
const progressPercentageStyle: React.CSSProperties = { fontSize: '1.5rem', fontWeight: '800', color: '#2563eb' };
const progressBarBackgroundStyle: React.CSSProperties = { height: '1.25rem', backgroundColor: '#f1f5f9', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0' };
const progressBarFillStyle: React.CSSProperties = { height: '100%', backgroundColor: '#2563eb', borderRadius: '1rem', transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)', backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)' };
const footerStyle: React.CSSProperties = { marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' };
const loadingStyle: React.CSSProperties = { textAlign: 'center', padding: '5rem', color: '#64748b', fontSize: '1.25rem', fontWeight: '500' };
const errorStyle: React.CSSProperties = { textAlign: 'center', padding: '3rem', backgroundColor: '#fff1f2', color: '#be123c', borderRadius: '1rem', border: '1px solid #fecdd3', fontWeight: '600' };

export default TrackingPanel;
