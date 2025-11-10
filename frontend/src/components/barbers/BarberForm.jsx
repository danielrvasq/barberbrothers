import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import { AlertCircle } from "lucide-react";

const BarberForm = ({ initialData = null, onSave, onCancel }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos iniciales para edición
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setPhone(initialData.phone || "");
      setEmail(initialData.email || "");
      setSpecialty(initialData.specialty || "");
      setBio(initialData.bio || "");
      setActive(initialData.active ?? true);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        specialty: specialty.trim() || null,
        bio: bio.trim() || null,
        active,
      };

      await onSave(payload);
    } catch (err) {
      console.error("Error en onSave:", err);
      setError(err?.message || String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: 12, maxWidth: 520 }}
    >
      {error && (
        <div
          style={{
            padding: "12px",
            background: "var(--color-error-light)",
            color: "var(--color-error)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <label>
        <strong>Nombre *</strong>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre completo del barbero"
          required
          maxLength={100}
        />
      </label>

      <label>
        <strong>Teléfono</strong>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="555-0123"
          maxLength={20}
        />
      </label>

      <label>
        <strong>Email</strong>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="barbero@ejemplo.com"
          maxLength={100}
        />
      </label>

      <label>
        <strong>Especialidad</strong>
        <input
          type="text"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          placeholder="Ej: Cortes Modernos y Fade"
          maxLength={100}
        />
        <small style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>
          Describe la especialidad del barbero (opcional)
        </small>
      </label>

      <label>
        <strong>Biografía</strong>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Información adicional sobre el barbero..."
          rows={3}
          maxLength={500}
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          style={{ width: "auto", margin: 0 }}
        />
        <span>Activo (puede recibir citas)</span>
      </label>

      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "flex-end",
          marginTop: 8,
        }}
      >
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting
            ? "Guardando..."
            : initialData
            ? "Actualizar"
            : "Crear Barbero"}
        </Button>
      </div>
    </form>
  );
};

export default BarberForm;
