import React from "react";
import "./UserCard.css";

const UserCard = ({ user, onEdit, onDelete, onChangeRole }) => {
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "role-badge role-admin";
      case "barber":
        return "role-badge role-barber";
      case "client":
        return "role-badge role-client";
      default:
        return "role-badge";
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "barber":
        return "Barbero";
      case "client":
        return "Cliente";
      default:
        return role || "Sin rol";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="user-card card">
      <div className="user-card-header">
        <div className="user-avatar">
          {user.full_name
            ? user.full_name.charAt(0).toUpperCase()
            : user.email.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <h3 className="user-name">{user.full_name || "Sin nombre"}</h3>
          <p className="user-email">{user.email}</p>
          <span className={getRoleBadgeClass(user.role)}>
            {getRoleDisplayName(user.role)}
          </span>
        </div>
      </div>

      <div className="user-card-body">
        <div className="user-details">
          <div className="detail-item">
            <span className="detail-label">Teléfono:</span>
            <span className="detail-value">
              {user.phone || "No disponible"}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Registrado:</span>
            <span className="detail-value">{formatDate(user.created_at)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">ID:</span>
            <span className="detail-value user-id">
              {user.id.substring(0, 8)}...
            </span>
          </div>
        </div>
      </div>

      <div className="user-card-footer card-footer">
        <select
          className="role-select"
          value={user.role || "client"}
          onChange={(e) => onChangeRole(user.id, e.target.value)}
        >
          <option value="client">Cliente</option>
          <option value="barber">Barbero</option>
          <option value="admin">Administrador</option>
        </select>
        <button className="btn btn-sm btn-ghost" onClick={() => onEdit(user)}>
          ✏️ Editar
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => onDelete(user.id)}
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};

export default UserCard;
