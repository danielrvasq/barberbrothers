import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container">
      {/* Welcome Section */}
      <section style={{ textAlign: 'center', marginTop: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700 }}>¡Bienvenido, {profile?.full_name?.split(' ')[0] || 'Usuario'}! 👋</h2>
        <p className="muted">Sistema de Gestión Integral para tu Barbería</p>
      </section>

        {/* User Profile Card */}
        <section className="panel" style={{ padding: 'clamp(16px, 3vw, 20px)', marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 12 }}>Tu Perfil</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }} className="muted">Email</span>
              <span style={{ fontSize: 15, wordBreak: 'break-all' }}>{profile?.email || user?.email}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }} className="muted">Nombre</span>
              <span style={{ fontSize: 15 }}>{profile?.full_name || 'No especificado'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }} className="muted">Rol</span>
              <span style={{ fontSize: 15 }}>{isAdmin() ? '👑 Administrador' : '👤 Usuario'}</span>
            </div>
            {profile?.phone && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }} className="muted">Teléfono</span>
                <span style={{ fontSize: 15 }}>{profile.phone}</span>
              </div>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, marginBottom: 16 }}>Funcionalidades del Sistema</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
            {/* Inventario */}
            <div className="panel" style={{ padding: 'clamp(16px, 3vw, 20px)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
              <h4 style={{ fontSize: 16, marginBottom: 8 }}>Inventario</h4>
              <ul className="muted" style={{ listStyle: 'none', padding: 0, margin: '0 0 12px 0' }}>
                <li>Registrar productos</li>
                <li>Búsqueda avanzada</li>
                <li>Actualizar stock</li>
                <li>Eliminar productos</li>
                <li>Reportes de inventario</li>
              </ul>
              {isAdmin() ? (
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/inventario')}>Ir a Inventario</button>
              ) : (
                <button disabled style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}>Solo Admin</button>
              )}
            </div>

            {/* Citas */}
            <div className="panel" style={{ padding: 'clamp(16px, 3vw, 20px)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
              <h4 style={{ fontSize: 16, marginBottom: 8 }}>Citas</h4>
              <ul className="muted" style={{ listStyle: 'none', padding: 0, margin: '0 0 12px 0' }}>
                <li>Crear nueva cita</li>
                <li>Ver mis citas</li>
                <li>Actualizar cita</li>
                <li>Cancelar cita</li>
                <li>Calendario de citas</li>
              </ul>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/citas')}>Gestionar Citas</button>
            </div>

            {/* Reportes */}
            <div className="panel" style={{ padding: 'clamp(16px, 3vw, 20px)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
              <h4 style={{ fontSize: 16, marginBottom: 8 }}>Reportes</h4>
              <ul className="muted" style={{ listStyle: 'none', padding: 0, margin: '0 0 12px 0' }}>
                <li>Ventas mensuales</li>
                <li>Productos más vendidos</li>
                <li>Citas completadas</li>
                <li>Estadísticas generales</li>
                <li>Exportar a PDF/CSV</li>
              </ul>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/reportes')}>Ver Reportes</button>
            </div>

            {/* Admin Panel */}
            {isAdmin() && (
              <div className="panel" style={{ padding: 'clamp(16px, 3vw, 20px)', borderWidth: 2, borderColor: '#eab308' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>👑</div>
                <h4 style={{ fontSize: 16, marginBottom: 8 }}>Panel Admin</h4>
                <ul className="muted" style={{ listStyle: 'none', padding: 0, margin: '0 0 12px 0' }}>
                  <li>Gestión de usuarios</li>
                  <li>Asignar roles</li>
                  <li>Ver logs de auditoría</li>
                  <li>Configuración</li>
                  <li>Métricas del sistema</li>
                </ul>
                <button 
                  className="btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => navigate('/admin')}
                >
                  Ir al Panel Admin
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Quick Stats */}
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, marginBottom: 16 }}>Estado del Sistema</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <div className="panel" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>🔒</div>
              <div className="muted">Autenticado</div>
            </div>
            <div className="panel" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>{isAdmin() ? '👑' : '👤'}</div>
              <div className="muted">{isAdmin() ? 'Admin' : 'Usuario'}</div>
            </div>
            <div className="panel" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>✅</div>
              <div className="muted">Sistema Activo</div>
            </div>
            <div className="panel" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>🔐</div>
              <div className="muted">Google OAuth</div>
            </div>
          </div>
        </section>
      </div>
  );
}
