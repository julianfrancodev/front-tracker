import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  
  // Filtro Servidor
  const [originInput, setOriginInput] = useState('');
  const [debouncedOrigin, setDebouncedOrigin] = useState('');

  // Filtros Frontend
  const [destFilter, setDestFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
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

  // Debounce para origen (Server)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedOrigin(originInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [originInput]);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await routeService.getRoutes(
        currentPage, 
        50, // Límite mayor para mejor filtrado front
        debouncedOrigin || undefined
      );
      setRoutes(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedOrigin]);

  useEffect(() => {
    const loadRoutes = async () => {
      await fetchRoutes();
    };
    loadRoutes();
  }, [fetchRoutes]);

  // Lógica de filtrado Front
  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      const matchDest = route.destination_city.toLowerCase().includes(destFilter.toLowerCase());
      const matchVehicle = route.vehicle_type.toLowerCase().includes(vehicleFilter.toLowerCase());
      const matchCarrier = (route.carrier || '').toLowerCase().includes(carrierFilter.toLowerCase());
      const matchStatus = statusFilter === '' || route.status === statusFilter;
      return matchDest && matchVehicle && matchCarrier && matchStatus;
    });
  }, [routes, destFilter, vehicleFilter, carrierFilter, statusFilter]);

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
      setFormError('Completa los campos obligatorios (*)');
      return;
    }

    console.log(`--- [MODO: ${modalMode.toUpperCase()}] Enviando datos ---`);
    console.log('Payload:', formData);

    try {
      let response;
      if (modalMode === 'create') {
        response = await routeService.createRoute(formData as Omit<Route, 'id'>);
        console.log('✅ CREADO:', response);
        alert(`Ruta creada con ID: ${response.id}`);
      } else {
        response = await routeService.updateRoute(formData.id!, formData);
        console.log('✅ ACTUALIZADO:', response);
        alert(`Ruta ${formData.id} actualizada`);
      }
      setIsModalOpen(false);
      fetchRoutes();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      console.error('❌ ERROR:', error.response?.data || error.message);
      setFormError(error.response?.data?.message || 'Error al guardar los datos');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta ruta?')) {
      try {
        await routeService.deleteRoute(id);
        fetchRoutes();
      } catch {
        alert('Error al eliminar');
      }
    }
  };

  return (
    <Layout>
      <div style={headerContainerStyle}>
        <h1 style={titleStyle}>Gestión de Logística</h1>
        {isAdmin && (
          <button onClick={() => handleOpenModal('create')} style={createButtonStyle}>
            + Nueva Ruta
          </button>
        )}
      </div>

      {/* Panel de Filtros */}
      <div style={filterBarContainerStyle}>
        <div style={filterGridStyle}>
          <div style={filterInputGroupStyle}>
            <label style={filterLabelStyle}>Origen (Server)</label>
            <input type="text" value={originInput} onChange={e => setOriginInput(e.target.value)} style={filterInputStyle} placeholder="Filtrar origen..."/>
          </div>
          <div style={filterInputGroupStyle}>
            <label style={filterLabelStyle}>Destino (Front)</label>
            <input type="text" value={destFilter} onChange={e => setDestFilter(e.target.value)} style={filterInputStyle} placeholder="Filtrar destino..."/>
          </div>
          <div style={filterInputGroupStyle}>
            <label style={filterLabelStyle}>Vehículo</label>
            <input type="text" value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)} style={filterInputStyle} placeholder="Filtrar vehículo..."/>
          </div>
          <div style={filterInputGroupStyle}>
            <label style={filterLabelStyle}>Transportadora</label>
            <input type="text" value={carrierFilter} onChange={e => setCarrierFilter(e.target.value)} style={filterInputStyle} placeholder="Filtrar trans..."/>
          </div>
          <div style={filterInputGroupStyle}>
            <label style={filterLabelStyle}>Estado</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={filterInputStyle}>
              <option value="">Todos</option>
              <option value="ACTIVA">ACTIVA</option>
              <option value="INACTIVA">INACTIVA</option>
              <option value="SUSPENDIDA">SUSPENDIDA</option>
              <option value="EN_MANTENIMIENTO">EN MANTENIMIENTO</option>
            </select>
          </div>
        </div>
        <button onClick={() => {setOriginInput(''); setDestFilter(''); setVehicleFilter(''); setCarrierFilter(''); setStatusFilter('');}} style={clearFilterButtonStyle}>Limpiar Filtros</button>
      </div>

      {loading ? <p style={{textAlign:'center', padding:'2rem'}}>Cargando rutas...</p> : (
        <DataTable columns={columns} data={filteredRoutes} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>
      )}

      {/* MODAL COMPLETO (Restaurado) */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{margin:0, fontSize:'1.25rem'}}>{modalMode === 'create' ? 'Crear Nueva Ruta' : 'Editar Ruta'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={closeButtonStyle}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} style={formStyle}>
              {formError && <div style={modalErrorStyle}>{formError}</div>}
              
              <div style={gridStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Ciudad Origen *</label>
                  <input type="text" value={formData.origin_city || ''} onChange={e => setFormData({...formData, origin_city: e.target.value})} style={inputStyle}/>
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Ciudad Destino *</label>
                  <input type="text" value={formData.destination_city || ''} onChange={e => setFormData({...formData, destination_city: e.target.value})} style={inputStyle}/>
                </div>
              </div>

              <div style={gridStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Distancia (KM)</label>
                  <input type="number" value={formData.distance_km || ''} onChange={e => setFormData({...formData, distance_km: Number(e.target.value)})} style={inputStyle}/>
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Tiempo Est. (H)</label>
                  <input type="number" value={formData.estimated_time_hours || ''} onChange={e => setFormData({...formData, estimated_time_hours: Number(e.target.value)})} style={inputStyle}/>
                </div>
              </div>

              <div style={gridStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Transportadora *</label>
                  <input type="text" value={formData.carrier || ''} onChange={e => setFormData({...formData, carrier: e.target.value})} style={inputStyle}/>
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Costo (USD)</label>
                  <input type="number" value={formData.cost_usd || ''} onChange={e => setFormData({...formData, cost_usd: Number(e.target.value)})} style={inputStyle}/>
                </div>
              </div>

              <div style={gridStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Tipo Vehículo</label>
                  <input type="text" value={formData.vehicle_type || ''} onChange={e => setFormData({...formData, vehicle_type: e.target.value})} style={inputStyle}/>
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Estado</label>
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
                <button type="submit" style={saveButtonStyle}>Guardar Cambios</button>
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
const titleStyle: React.CSSProperties = { fontSize:'1.5rem', fontWeight:'700', margin:0, color:'#1e293b' };
const actionButtonStyle: React.CSSProperties = { padding:'0.4rem 0.8rem', backgroundColor:'#2563eb', color:'white', textDecoration:'none', borderRadius:'0.375rem', fontSize:'0.75rem', fontWeight:'500' };
const editButtonStyle: React.CSSProperties = { backgroundColor:'#f59e0b', color:'white', border:'none', padding:'0.4rem 0.8rem', borderRadius:'0.375rem', fontSize:'0.75rem', cursor:'pointer' };
const deleteButtonStyle: React.CSSProperties = { backgroundColor:'#ef4444', color:'white', border:'none', padding:'0.4rem 0.8rem', borderRadius:'0.375rem', fontSize:'0.75rem', cursor:'pointer' };
const createButtonStyle: React.CSSProperties = { backgroundColor:'#2563eb', color:'white', border:'none', padding:'0.6rem 1.2rem', borderRadius:'0.5rem', fontWeight:'600', cursor:'pointer' };

const filterBarContainerStyle: React.CSSProperties = { marginBottom:'1.5rem', padding:'1.25rem', backgroundColor:'#ffffff', borderRadius:'0.75rem', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' };
const filterGridStyle: React.CSSProperties = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'1rem', marginBottom:'1rem' };
const filterInputGroupStyle: React.CSSProperties = { display:'flex', flexDirection:'column', gap:'0.3rem' };
const filterLabelStyle: React.CSSProperties = { fontSize:'0.75rem', fontWeight:'600', color:'#64748b', textTransform:'uppercase' };
const filterInputStyle: React.CSSProperties = { padding:'0.5rem', borderRadius:'0.375rem', border:'1px solid #e2e8f0', outline:'none', fontSize:'0.875rem' };
const clearFilterButtonStyle: React.CSSProperties = { padding:'0.5rem 1rem', border:'1px solid #d1d5db', borderRadius:'0.375rem', backgroundColor:'white', cursor:'pointer', fontSize:'0.875rem', color:'#64748b' };

const modalOverlayStyle: React.CSSProperties = { position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(15, 23, 42, 0.65)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000, backdropFilter:'blur(4px)' };
const modalContentStyle: React.CSSProperties = { backgroundColor:'white', borderRadius:'1rem', width:'100%', maxWidth:'550px', boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow:'hidden' };
const modalHeaderStyle: React.CSSProperties = { padding:'1.25rem 1.5rem', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', backgroundColor:'#f8fafc' };
const closeButtonStyle: React.CSSProperties = { background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color:'#94a3b8' };
const formStyle: React.CSSProperties = { padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' };
const gridStyle: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' };
const inputGroupStyle: React.CSSProperties = { display:'flex', flexDirection:'column', gap:'0.3rem' };
const labelStyle: React.CSSProperties = { fontSize:'0.813rem', fontWeight:'600', color:'#475569' };
const inputStyle: React.CSSProperties = { padding:'0.6rem', borderRadius:'0.375rem', border:'1px solid #e2e8f0', outline:'none', width:'100%', boxSizing:'border-box' };
const modalErrorStyle: React.CSSProperties = { padding:'0.75rem', backgroundColor:'#fef2f2', color:'#dc2626', borderRadius:'0.375rem', fontSize:'0.875rem', border:'1px solid #fee2e2' };
const modalFooterStyle: React.CSSProperties = { padding:'1.25rem 1.5rem', backgroundColor:'#f8fafc', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', gap:'0.75rem' };
const cancelButtonStyle: React.CSSProperties = { padding:'0.6rem 1.2rem', border:'1px solid #e2e8f0', borderRadius:'0.375rem', backgroundColor:'white', cursor:'pointer', color:'#64748b' };
const saveButtonStyle: React.CSSProperties = { padding:'0.6rem 1.2rem', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'0.375rem', cursor:'pointer', fontWeight:'600' };

export default Dashboard;
