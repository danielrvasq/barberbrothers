import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getCitas,
  createCita,
  updateCita,
  cancelCita,
} from "../lib/citasService";
import CitaForm from "../components/citas/CitaForm";
import CitasList from "../components/citas/CitasList";
import Toast from "../components/common/Toast";

const CitasPage = () => {
  const { user, profile } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(
      () => setToast({ visible: false, message: "", type: "success" }),
      3000
    );
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await getCitas();
    if (error) {
      console.error("Error cargando citas:", error);
      showToast("Error al cargar las citas", "error");
    } else {
      setCitas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (values) => {
    try {
      const payload = {
        ...values,
        customer_id: user.id,
        created_by: user.id,
      };
      const { data, error } = await createCita(payload);
      if (error) throw error;

      // Envío de correo de confirmación en background (no bloquea UX)
      if (data) {
        fetch("/api/notify-appointment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointment: data }),
        }).catch((e) => console.warn("Fallo envío email cita:", e));
      }

      setCitas((prev) => [data, ...prev]);
      setShowForm(false);
      setEditing(null);
      showToast("✅ Cita creada correctamente", "success");
    } catch (err) {
      console.error("Error creando cita:", err);
      showToast(
        "Error creando cita: " + (err?.message || String(err)),
        "error"
      );
      throw err;
    }
  };

  const handleUpdate = async (id, values) => {
    try {
      const { data, error } = await updateCita(id, values);
      if (error) throw error;

      setCitas((prev) => prev.map((c) => (c.id === id ? data : c)));
      setEditing(null);
      setShowForm(false);
      showToast("✅ Cita actualizada correctamente", "success");
    } catch (err) {
      console.error("Error actualizando cita:", err);
      showToast(
        "Error actualizando cita: " + (err?.message || String(err)),
        "error"
      );
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita?"))
      return;

    try {
      const { data, error } = await cancelCita(id);
      if (error) throw error;

      // Actualizar la cita en el estado local con el nuevo status
      setCitas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "canceled" } : c))
      );
      showToast("Cita cancelada correctamente", "success");
    } catch (err) {
      console.error("Error cancelando cita:", err);
      showToast(
        "Error cancelando cita: " + (err?.message || String(err)),
        "error"
      );
    }
  };

  const handleEdit = (cita) => {
    setEditing(cita);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditing(null);
    setShowForm(false);
  };

  const handleNewCita = () => {
    setEditing(null);
    setShowForm(true);
  };

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2 style={{ margin: 0 }}>Mis Citas</h2>
        {!showForm && (
          <button className="btn btn-primary" onClick={handleNewCita}>
            ➕ Nueva Cita
          </button>
        )}
      </div>

      {profile?.role === "admin" && (
        <div
          className="panel"
          style={{
            padding: 12,
            marginBottom: 16,
            background: "var(--color-info-light)",
          }}
        >
          <p style={{ margin: 0, fontSize: 14 }}>
            👑 <strong>Vista de administrador:</strong> Puedes ver y gestionar
            todas las citas del sistema
          </p>
        </div>
      )}

      {showForm && (
        <div className="panel" style={{ padding: 20, marginBottom: 24 }}>
          <h3>{editing ? "✏️ Editar Cita" : "➕ Nueva Cita"}</h3>
          <CitaForm
            initialData={editing}
            onSave={(values) =>
              editing ? handleUpdate(editing.id, values) : handleCreate(values)
            }
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <div>
        <h3 style={{ marginBottom: 16 }}>
          {loading ? "Cargando..." : `Citas Registradas (${citas.length})`}
        </h3>

        {loading ? (
          <div className="panel" style={{ padding: 40, textAlign: "center" }}>
            <p>Cargando citas...</p>
          </div>
        ) : (
          <CitasList
            citas={citas}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};

export default CitasPage;
