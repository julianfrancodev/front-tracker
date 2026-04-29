import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { routeService } from '../services/routeService';
import { useAuthStore } from '../store/authStore';
import type { Route } from '../types/route.types';

const Dashboard: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Input states (for live typing)
  const [originInput, setOriginInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  
  // Debounced filters (triggers the actual API call)
  const [debouncedFilters, setDebouncedFilters] = useState({ origin: '', status: '' });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<Partial<Route>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const columns: Column[] = [
    { key: 'origin_city', label: 'Origen' },
    { key: 'destination_city', label: 'Destino' },
    { key: 'vehicle_type', label: 'Vehículo' },
    { key: 'carrier', label: 'Transportadora' },
    { key: 'status', label: 'Estado' },
    { 
      key: 'actions', 
      label: 'Acciones',
      render: (_, route: Route) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/tracking/${route.id}`} style={actionButtonStyle}>Ver</Link>
          {isAdmin && (
            <>
              <button onClick={() => handleOpenModal('edit', route)} style={editButtonStyle}>Editar</button>
              <button onClick={() => handleDelete(route.id)} style={deleteButtonStyle}>Eliminar</button>
            </>
          )}
        </div>
      )
    },
  ];

  // Logic to debounce input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({ origin: originInput, status: statusInput });
      setCurrentPage(1); // Reset to page 1 on filter change
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [originInput, statusInput]);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await routeService.getRoutes(
        currentPage, 
        20, 
        debouncedFilters.origin || undefined, 
        debouncedFilters.status || undefined
      );
      setRoutes(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedFilters]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleClearFilters = () => {
    setOriginInput('');
    setStatusInput('');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar ruta?')) {
      try {
        await routeService.deleteRoute(id);
        fetchRoutes();
      } catch (error) {
        alert('Error');
      }
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit', route?: Route) => {
    setModalMode(mode);
    setFormError(null);
    setFormData(route || {
      origin_city: '',
      destination_city: '',
      distance_km: 0,
      estimated_time_hours: 0,
      vehicle_type: '',
      carrier: '',
      cost_usd: 0,
      status: 'PENDING'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await routeService.createRoute(formData as Omit<Route, 'id'>);
      } else {
        await routeService.updateRoute(formData.id!, formData);
      }
      setIsModalOpen(false);
      fetchRoutes();
    } catch (error: any) {
      setFormError('Error al guardar.');
    }
  };

  return (
    <Layout>
      <div style={headerContainerStyle}>
        <div>
          <h1 style={titleStyle}>Gestión de Rutas</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Monitoreo dinámico de logística</p>
        </div>
        {isAdmin && (
          <button onClick={() => handleOpenModal('create')} style={createButtonStyle}>
            + Nueva Ruta
          </button>
        )}
      </div>

      {/* Dynamic Filter Bar */}
      <div style={filterBarContainerStyle}>
        <div style={filterInputGroupStyle}>
          <label style={filterLabelStyle}>Origen (Búsqueda en vivo)</label>
          <input 
            type="text" 
            placeholder="Escribe para buscar..."
            value={originInput}
            onChange={(e) => setOriginInput(e.target.value)}
            style={filterInputStyle}
          />
        </div>
        <div style={filterInputGroupStyle}>
          <label style={filterLabelStyle}>Estado</label>
          <select 
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
            style={filterInputStyle}
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVA">ACTIVA</option>
            <option value="INACTIVA">INACTIVA</option>
            <option value="SUSPENDIDA">SUSPENDIDA</option>
            <option value="EN_MANTENIMIENTO">EN MANTENIMIENTO</option>
          </select>
        </div>
        <button onClick={handleClearFilters} style={clearFilterButtonStyle}>
          Limpiar
        </button>
      </div>
      
      {loading ? (
        <div style={loadingStyle}>Cargando...</div>
      ) : (
        <DataTable
          columns={columns}
          data={routes}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modal Overlay remains... */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{modalMode === 'create' ? 'Nueva Ruta' : 'Editar Ruta'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={closeButtonStyle}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={formStyle}>
              {formError && <div style={modalErrorStyle}>{formError}</div>}
              <div style={gridStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Origen</label>
                  <input type="text" value={formData.origin_city || ''} onChange={e => setFormData({...formData, origin_city: e.target.value})} style={inputStyle}/>
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Destino</label>
                  <input type="text" value={formData.destination_city || ''} onChange={e => setFormData({...formData, destination_city: e.target.value})} style={inputStyle}/>
                </div>
              </div>
              <div style={modalFooterStyle}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelButtonStyle}>Cancelar</button>
                <button type="submit" style={saveButtonStyle}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

// Styles
const headerContainerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' };
const titleStyle: React.CSSProperties = { fontSize: '1.5rem', color: '#1e293b', fontWeight: '700', margin: 0 };
const loadingStyle: React.CSSProperties = { textAlign: 'center', padding: '3rem', color: '#64748b' };
const actionButtonStyle: React.CSSProperties = { padding: '0.4rem 0.8rem', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '0.375rem', fontSize: '0.75rem' };
const editButtonStyle: React.CSSProperties = { backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer' };
const deleteButtonStyle: React.CSSProperties = { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer' };
const createButtonStyle: React.CSSProperties = { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' };

// Filter Styles
const filterBarContainerStyle: React.CSSProperties = {
  display: 'flex', gap: '1.5rem', alignItems: 'flex-end', marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0'
};
const filterInputGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 };
const filterLabelStyle: React.CSSProperties = { fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' };
const filterInputStyle: React.CSSProperties = { padding: '0.6rem 0.8rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const clearFilterButtonStyle: React.CSSProperties = { padding: '0.6rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.875rem', color: '#64748b' };

// Modal Styles (simplified)
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContentStyle: React.CSSProperties = { backgroundColor: 'white', borderRadius: '1rem', width: '100%', maxWidth: '500px' };
const modalHeaderStyle: React.CSSProperties = { padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeButtonStyle: React.CSSProperties = { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' };
const formStyle: React.CSSProperties = { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' };
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
const inputGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.3rem' };
const labelStyle: React.CSSProperties = { fontSize: '0.813rem', fontWeight: '600', color: '#475569' };
const inputStyle: React.CSSProperties = { padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' };
const modalErrorStyle: React.CSSProperties = { padding: '0.5rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.375rem', fontSize: '0.875rem' };
const modalFooterStyle: React.CSSProperties = { padding: '1rem 1.25rem', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' };
const cancelButtonStyle: React.CSSProperties = { padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', backgroundColor: 'white', cursor: 'pointer' };
const saveButtonStyle: React.CSSProperties = { padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' };

export default Dashboard;
