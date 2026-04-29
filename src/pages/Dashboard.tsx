import React, { useState, useEffect } from 'react';
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

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await routeService.getRoutes(currentPage, 20);
      setRoutes(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [currentPage]);

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta ruta?')) {
      try {
        await routeService.deleteRoute(id);
        fetchRoutes();
      } catch (error) {
        alert('Error al eliminar');
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

  const validateForm = () => {
    if (!formData.origin_city?.trim()) return 'La ciudad de origen es requerida';
    if (!formData.destination_city?.trim()) return 'La ciudad de destino es requerida';
    if (!formData.carrier?.trim()) return 'La transportadora es requerida';
    if (!formData.vehicle_type?.trim()) return 'El tipo de vehículo es requerido';
    if ((formData.distance_km ?? 0) <= 0) return 'La distancia debe ser mayor a 0';
    if ((formData.cost_usd ?? 0) <= 0) return 'El costo debe ser mayor a 0';
    if ((formData.estimated_time_hours ?? 0) <= 0) return 'El tiempo estimado debe ser mayor a 0';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    try {
      console.log('Sending data:', formData);
      if (modalMode === 'create') {
        await routeService.createRoute(formData as Omit<Route, 'id'>);
      } else {
        await routeService.updateRoute(formData.id!, formData);
      }
      setIsModalOpen(false);
      fetchRoutes();
    } catch (error: any) {
      console.error('API Error:', error.response?.data);
      const serverMessage = error.response?.data?.message || error.response?.data?.error;
      setFormError(serverMessage || 'Error al guardar la ruta. Inténtalo de nuevo.');
    }
  };

  return (
    <Layout>
      <div style={headerContainerStyle}>
        <div>
          <h1 style={titleStyle}>Gestión de Rutas</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Administra los trayectos y transportistas</p>
        </div>
        {isAdmin && (
          <button onClick={() => handleOpenModal('create')} style={createButtonStyle}>
            + Nueva Ruta
          </button>
        )}
      </div>
      
      {loading ? (
        <div style={loadingStyle}>Cargando datos...</div>
      ) : (
        <DataTable
          columns={columns}
          data={routes}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Enhanced Modal Overlay */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                {modalMode === 'create' ? 'Crear Nueva Ruta' : 'Editar Detalles de Ruta'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={closeButtonStyle}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} style={formStyle}>
              {formError && <div style={modalErrorStyle}>{formError}</div>}
              
              <div style={gridStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Ciudad Origen</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Bogotá"
                    value={formData.origin_city || ''} 
                    onChange={e => setFormData({...formData, origin_city: e.target.value})}
                    style={inputStyle}
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Ciudad Destino</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Medellín"
                    value={formData.destination_city || ''} 
                    onChange={e => setFormData({...formData, destination_city: e.target.value})}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={gridStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Distancia (KM)</label>
                  <input 
                    type="number" 
                    value={formData.distance_km || ''} 
                    onChange={e => setFormData({...formData, distance_km: Number(e.target.value)})}
                    style={inputStyle}
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Costo (USD)</label>
                  <input 
                    type="number" 
                    value={formData.cost_usd || ''} 
                    onChange={e => setFormData({...formData, cost_usd: Number(e.target.value)})}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={gridStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Transportadora</label>
                  <input 
                    type="text" 
                    placeholder="Nombre de la empresa"
                    value={formData.carrier || ''} 
                    onChange={e => setFormData({...formData, carrier: e.target.value})}
                    style={inputStyle}
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Tiempo Est. (Horas)</label>
                  <input 
                    type="number" 
                    value={formData.estimated_time_hours || ''} 
                    onChange={e => setFormData({...formData, estimated_time_hours: Number(e.target.value)})}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={gridStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Tipo Vehículo</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Camión NHR"
                    value={formData.vehicle_type || ''} 
                    onChange={e => setFormData({...formData, vehicle_type: e.target.value})}
                    style={inputStyle}
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Estado</label>
                  <select 
                    value={formData.status || ''} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    style={inputStyle}
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="IN_TRANSIT">En Tránsito</option>
                    <option value="DELIVERED">Entregado</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </div>
              </div>
              
              <div style={modalFooterStyle}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelButtonStyle}>
                  Cancelar
                </button>
                <button type="submit" style={saveButtonStyle}>
                  {modalMode === 'create' ? 'Crear Ruta' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

// Existing Styles
const headerContainerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' };
const titleStyle: React.CSSProperties = { fontSize: '1.5rem', color: '#1e293b', fontWeight: '700', margin: 0 };
const loadingStyle: React.CSSProperties = { textAlign: 'center', padding: '3rem', color: '#64748b' };
const actionButtonStyle: React.CSSProperties = { padding: '0.4rem 0.8rem', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '500' };
const editButtonStyle: React.CSSProperties = { backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '500' };
const deleteButtonStyle: React.CSSProperties = { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '500' };
const createButtonStyle: React.CSSProperties = { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' };

// Enhanced Modal Styles
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
};
const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'white', borderRadius: '1rem', width: '100%', maxWidth: '550px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
};
const modalHeaderStyle: React.CSSProperties = {
  padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc'
};
const closeButtonStyle: React.CSSProperties = {
  background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8'
};
const formStyle: React.CSSProperties = { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' };
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
const inputGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.4rem' };
const labelStyle: React.CSSProperties = { fontSize: '0.813rem', fontWeight: '600', color: '#475569' };
const inputStyle: React.CSSProperties = {
  padding: '0.625rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.938rem', outline: 'none', transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box'
};
const modalErrorStyle: React.CSSProperties = {
  padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', fontSize: '0.875rem', border: '1px solid #fee2e2', textAlign: 'center'
};
const modalFooterStyle: React.CSSProperties = {
  padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'
};
const cancelButtonStyle: React.CSSProperties = {
  padding: '0.625rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: 'white', cursor: 'pointer', fontWeight: '500', color: '#64748b'
};
const saveButtonStyle: React.CSSProperties = {
  padding: '0.625rem 1.25rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
};

export default Dashboard;
