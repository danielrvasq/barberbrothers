import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "./Button";

export default function UserProfile() {
  const { user, profile, signOut, isAdmin } = useAuth();
  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // El error ya se maneja en AuthContext, solo log aquí
      console.log("Sesión cerrada");
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <div className="card-header">
        <h3 className="card-title">Perfil de Usuario</h3>
      </div>
      <div className="card-body" style={{ display: "grid", gap: 12 }}>
        <div>
          <strong>Email:</strong> {profile?.email || user.email}
        </div>
        <div>
          <strong>Nombre:</strong> {profile?.full_name || "No especificado"}
        </div>
        <div>
          <strong>Rol:</strong> {profile?.role || "user"}{" "}
          {isAdmin() && " (Administrador)"}
        </div>
      </div>
      <div className="card-footer">
        <Button variant="danger" onClick={handleSignOut}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
