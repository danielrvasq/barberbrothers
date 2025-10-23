import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function UserProfile() {
  const { user, profile, signOut, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <div style={{ 
      padding: '16px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      maxWidth: '400px'
    }}>
      <h3>Perfil de Usuario</h3>
      <div style={{ marginBottom: '12px' }}>
        <strong>Email:</strong> {profile?.email || user.email}
      </div>
      <div style={{ marginBottom: '12px' }}>
        <strong>Nombre:</strong> {profile?.full_name || 'No especificado'}
      </div>
      <div style={{ marginBottom: '12px' }}>
        <strong>Rol:</strong> {profile?.role || 'user'}
        {isAdmin() && ' (Administrador)'}
      </div>
      <button 
        onClick={signOut}
        style={{
          padding: '8px 16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
