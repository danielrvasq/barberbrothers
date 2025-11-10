import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getBarbers,
  createBarber,
  updateBarber,
  deactivateBarber,
} from "../lib/barbersService";
import BarberCard from "../components/barbers/BarberCard";
import BarberForm from "../components/barbers/BarberForm";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Toast from "../components/common/Toast";
import { UserPlus, Users } from "lucide-react";

const BarbersPage = () => {
  const { isAdmin } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Cargar barberos
  const loadBarbers = async () => {
    setLoading(true);
    // Incluir inactivos si es admin
    const { data, error } = await getBarbers(isAdmin);

    if (error) {
      console.error("Error cargando barberos:", error);
      showToast("Error al cargar barberos", "error");
    } else {
      // Ordenar: activos primero, luego por nombre
      const sorted = (data || []).sort((a, b) => {
        if (a.active === b.active) {
          return a.name.localeCompare(b.name);
        }
        return b.active ? 1 : -1;
      });
      setBarbers(sorted);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadBarbers();
  }, [isAdmin]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

  // Crear o actualizar barbero
  const handleSave = async (payload) => {
    try {
      if (editingBarber) {
        const { error } = await updateBarber(editingBarber.id, payload);
        if (error) throw new Error(error.message);
        showToast("Barbero actualizado correctamente", "success");
      } else {
        const { error } = await createBarber(payload);
        if (error) throw new Error(error.message);
        showToast("Barbero creado correctamente", "success");
      }

      setShowForm(false);
      setEditingBarber(null);
      loadBarbers();
    } catch (err) {
      showToast(err.message || "Error al guardar barbero", "error");
      throw err;
    }
  };

  // Activar/desactivar barbero
  const handleToggleActive = async (barber) => {
    try {
      if (barber.active) {
        const { error } = await deactivateBarber(barber.id);
        if (error) throw new Error(error.message);
        showToast(`${barber.name} desactivado correctamente`, "success");
      } else {
        const { error } = await updateBarber(barber.id, { active: true });
        if (error) throw new Error(error.message);
        showToast(`${barber.name} activado correctamente`, "success");
      }

      loadBarbers();
    } catch (err) {
      showToast(err.message || "Error al cambiar estado del barbero", "error");
    }
  };

  // Abrir formulario para editar
  const handleEdit = (barber) => {
    setEditingBarber(barber);
    setShowForm(true);
  };

  // Cancelar formulario
  const handleCancel = () => {
    setShowForm(false);
    setEditingBarber(null);
  };

  // Abrir formulario para crear
  const handleCreate = () => {
    setEditingBarber(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p>Cargando barberos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Toast de notificaciones */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Users size={32} color="var(--color-primary)" />
          <h1 style={{ margin: 0 }}>Barberos</h1>
        </div>

        {isAdmin && !showForm && (
          <Button variant="primary" onClick={handleCreate}>
            <UserPlus size={20} />
            Agregar Barbero
          </Button>
        )}
      </div>

      {/* Formulario de creación/edición */}
      {showForm && isAdmin && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ padding: "24px" }}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>
              {editingBarber ? "Editar Barbero" : "Nuevo Barbero"}
            </h2>
            <BarberForm
              initialData={editingBarber}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </Card>
      )}

      {/* Lista de barberos */}
      {barbers.length === 0 ? (
        <Card>
          <div style={{ padding: "48px", textAlign: "center" }}>
            <Users
              size={48}
              color="var(--color-text-secondary)"
              style={{ marginBottom: 16 }}
            />
            <h3
              style={{
                margin: "0 0 8px 0",
                color: "var(--color-text-secondary)",
              }}
            >
              No hay barberos registrados
            </h3>
            {isAdmin && (
              <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                Agrega el primer barbero para comenzar
              </p>
            )}
          </div>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          }}
        >
          {barbers.map((barber) => (
            <BarberCard
              key={barber.id}
              barber={barber}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BarbersPage;
