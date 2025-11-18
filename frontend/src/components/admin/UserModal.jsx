import React, { useState, useEffect } from "react";
import "./UserModal.css";

const UserModal = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "client",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "client",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Usuario</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="full_name">Nombre Completo</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Nombre completo del usuario"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              disabled
            />
            <small className="form-hint">
              El email no puede ser modificado
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+34 600 000 000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="client">Cliente</option>
              <option value="barber">Barbero</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              💾 Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
