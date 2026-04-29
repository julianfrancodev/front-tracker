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
  
  // Filtros
  const [originInput, setOriginInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [debouncedFilters, setDebouncedFilters] = useState({ origin: '', status: '' });

  // Modal
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({ origin: originInput, status: statusInput });
      setCurrentPage(1);
    }, 500);
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
      status: 'ACTIVA'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.origin_city || !formData.destination_city || !formData.carrier) {
      setFormError('Completa los campos obligatorios');
      return;
    }
    try {
      if (modalMode === 'create') {
        await routeService.createRoute(formData as Omit<Route, 'id'>);
      } else {
        await routeService.updateRoute(formData.id!, formData);
      }
      setIsModalOpen(false);
      fetchRoutes();
    } catch (error: any) {
      setFormError('Error al guardar los datos');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar esta ruta?')) {
      try {
        await routeService.deleteRoute(id);
        fetchRoutes();
      } catch (error) {
        alert('Error al eliminar');
      }
    }
  };

  return (
    <Layout>
      <div style={headerContainerStyle}>
        <h1 style={titleStyle}>Gestión de Rutas</h1>
        {isAdmin && (
          <button onClick={() => handleOpenModal('create')} style={createButtonStyle}>
            + Nueva Ruta
          </button>
        )}
      </div>

      <div style={filterBarContainerStyle}>
        <div style={filterInputGroupStyle}>
          <label style={filterLabelStyle}>Origen</label>
          <input type="text" value={originInput} onChange={e => setOriginInput(e.target.value)} style={filterInputStyle} placeholder="Filtrar..."/>
        </div>
        <div style={filterInputGroupStyle}>
          <label style={filterLabelStyle}>Estado</label>
          <select value={statusInput} onChange={e => setStatusInput(e.target.value)} style={filterInputStyle}>
            <option value="">Todos</option>
            <option value="ACTIVA">ACTIVA</option>
            <option value="INACTIVA">INACTIVA</option>
            <option value="SUSPENDIDA">SUSPENDIDA</option>
            <option value="EN_MANTENIMIENTO">EN MANTENIMIENTO</option>
          </select>
        </div>
        <button onClick={() => {setOriginInput(''); setStatusInput('');}} style={clearFilterButtonStyle}>Limpiar</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <DataTable columns={columns} data={routes} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>
      )}

      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{margin:0}}>{modalMode === 'create' ? 'Nueva Ruta' : 'Editar Ruta'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={formStyle}>
              {formError && <div style={modalErrorStyle}>{formError}</div>}
              <div style={gridStyle}>
                <div style={inputGroupStyle}><label>Origen *</label><input type="text" value={formData.origin_city || ''} onChange={e => setFormData({...formData, origin_city: e.target.value})} style={inputStyle}/></div>
                <div style={inputGroupStyle}><label>Destino *</label><input type="text" value={formData.destination_city || ''} onChange={e => setFormData({...formData, destination_city: e.target.value})} style={inputStyle}/></div>
              </div>
              <div style={gridStyle}>
                <div style={inputGroupStyle}><label>Distancia (KM)</label><input type="number" value={formData.distance_km || ''} onChange={e => setFormData({...formData, distance_km: Number(e.target.value)})} style={inputStyle}/></div>
                <div style={inputGroupStyle}><label>Tiempo (H)</label><input type="number" value={formData.estimated_time_hours || ''} onChange={e => setFormData({...formData, estimated_time_hours: Number(e.target.value)})} style={inputStyle}/></div>
              </div>
              <div style={gridStyle}>
                <div style={inputGroupStyle}><label>Transportadora *</label><input type="text" value={formData.carrier || ''} onChange={e => setFormData({...formData, carrier: e.target.value})} style={inputStyle}/></div>
                <div style={inputGroupStyle}><label>Costo (USD)</label><input type="number" value={formData.cost_usd || ''} onChange={e => setFormData({...formData, cost_usd: Number(e.target.value)})} style={inputStyle}/></div>
              </div>
              <div style={gridStyle}>
                <div style={inputGroupStyle}><label>Vehículo</label><input type="text" value={formData.vehicle_type || ''} onChange={e => setFormData({...formData, vehicle_type: e.target.value})} style={inputStyle}/></div>
                <div style={inputGroupStyle}>
                  <label>Estado</label>
                  <select value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})} style={inputStyle}>
                    <option value="ACTIVA">ACTIVA</option>
                    <option value="INACTIVA">INACTIVA</option>
                    <option value="SUSPENDIDA">SUSPENDIDA</option>
                    <option value="EN_MANTENIMIENTO">EN MANTENIMIENTO</option>
                  </select>
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
const headerContainerStyle: React.CSSProperties = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' };
const titleStyle: React.CSSProperties = { fontSize:'1.5rem', fontWeight:'700', margin:0 };
const actionButtonStyle: React.CSSProperties = { padding:'0.4rem 0.8rem', backgroundColor:'#2563eb', color:'white', textDecoration:'none', borderRadius:'0.375rem', fontSize:'0.75rem' };
const editButtonStyle: React.CSSProperties = { backgroundColor:'#f59e0b', color:'white', border:'none', padding:'0.4rem 0.8rem', borderRadius:'0.375rem', fontSize:'0.75rem', cursor:'pointer', marginLeft:'0.5rem' };
const deleteButtonStyle: React.CSSProperties = { backgroundColor:'#ef4444', color:'white', border:'none', padding:'0.4rem 0.8rem', borderRadius:'0.375rem', fontSize:'0.75rem', cursor:'pointer', marginLeft:'0.5rem' };
const createButtonStyle: React.CSSProperties = { backgroundColor:'#2563eb', color:'white', border:'none', padding:'0.6rem 1.2rem', borderRadius:'0.5rem', fontWeight:'600', cursor:'pointer' };
const filterBarContainerStyle: React.CSSProperties = { display:'flex', gap:'1rem', alignItems:'flex-end', marginBottom:'1.5rem', padding:'1rem', backgroundColor:'#f8fafc', borderRadius:'0.75rem' };
const filterInputGroupStyle: React.CSSProperties = { display:'flex', flexDirection:'column', gap:'0.3rem', flex:1 };
const filterLabelStyle: React.CSSProperties = { fontSize:'0.75rem', fontWeight:'600', color:'#64748b' };
const filterInputStyle: React.CSSProperties = { padding:'0.5rem', borderRadius:'0.375rem', border:'1px solid #e2e8f0', outline:'none' };
const clearFilterButtonStyle: React.CSSProperties = { padding:'0.5rem 1rem', border:'1px solid #d1d5db', borderRadius:'0.375rem', backgroundColor:'white', cursor:'pointer' };
const modalOverlayStyle: React.CSSProperties = { position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor:'white', borderRadius:'1rem', width:'100%', maxWidth:'550px', overflow:'hidden' };
const modalHeaderStyle: React.CSSProperties = { padding:'1rem 1.5rem', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' };
const formStyle: React.CSSProperties = { padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' };
const gridStyle: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' };
const inputGroupStyle: React.CSSProperties = { display:'flex', flexDirection:'column', gap:'0.3rem' };
const inputStyle: React.CSSProperties = { padding:'0.6rem', borderRadius:'0.375rem', border:'1px solid #e2e8f0', outline:'none' };
const modalErrorStyle: React.CSSProperties = { padding:'0.75rem', backgroundColor:'#fef2f2', color:'#dc2626', borderRadius:'0.375rem', fontSize:'0.875rem' };
const modalFooterStyle: React.CSSProperties = { padding:'1rem 1.5rem', backgroundColor:'#f8fafc', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', gap:'0.75rem' };
const cancelButtonStyle: React.CSSProperties = { padding:'0.6rem 1.2rem', border:'1px solid #e2e8f0', borderRadius:'0.375rem', backgroundColor:'white', cursor:'pointer' };
const saveButtonStyle: React.CSSProperties = { padding:'0.6rem 1.2rem', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'0.375rem', cursor:'pointer', fontWeight:'600' };

export default Dashboard;
