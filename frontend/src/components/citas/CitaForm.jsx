import React, { useEffect, useState } from "react";
import {
  getBarbers,
  checkBarberAvailability,
  checkAppointmentConflict,
} from "../../lib/barbersService";
import { getServices } from "../../lib/productsService";
import {
  validateAppointment,
  generateTimeSlots,
  getDayName,
} from "../../lib/businessHours";

const toLocalDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const toLocalTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CitaForm = ({ initialData = null, onSave, onCancel }) => {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [barberId, setBarberId] = useState("");
  const [service, setService] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar barberos y servicios
  useEffect(() => {
    const loadData = async () => {
      const [barbersRes, servicesRes] = await Promise.all([
        getBarbers(),
        getServices(),
      ]);

      if (barbersRes.error) {
        console.error("Error cargando barberos:", barbersRes.error);
        setError("Error al cargar barberos");
      } else {
        setBarbers(barbersRes.data || []);
      }

      if (servicesRes.error) {
        console.error("Error cargando servicios:", servicesRes.error);
        setError("Error al cargar servicios");
      } else {
        setServices(servicesRes.data || []);
      }

      setLoading(false);
    };
    loadData();
  }, []);

  // Cargar datos iniciales para edición
  useEffect(() => {
    if (initialData) {
      setBarberId(initialData.barber_id || "");
      setService(initialData.service || "");
      setDateStr(toLocalDate(initialData.start_at));
      setTimeStr(toLocalTime(initialData.start_at));
      setNotes(initialData.notes || "");
    } else {
      setBarberId("");
      setService("");
      setDateStr("");
      setTimeStr("");
      setNotes("");
    }
    setError(null);
    setSubmitting(false);
  }, [initialData]);

  // Generar slots de tiempo cuando cambia la fecha
  useEffect(() => {
    if (dateStr) {
      const date = new Date(dateStr + "T00:00:00");
      const slots = generateTimeSlots(date, 30);
      setTimeSlots(slots);
    } else {
      setTimeSlots([]);
    }
  }, [dateStr]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validación básica
    if (!barberId || !service || !dateStr || !timeStr) {
      setError("Todos los campos son obligatorios");
      return;
    }

    // Combinar fecha y hora
    const startAtISO = new Date(`${dateStr}T${timeStr}:00`).toISOString();

    // Validar horario de negocio
    const validation = validateAppointment(barberId, startAtISO, service);
    if (!validation.valid) {
      setError(validation.errors.join(". "));
      return;
    }

    setSubmitting(true);

    try {
      // Verificar disponibilidad del barbero
      const { data: isAvailable } = await checkBarberAvailability(
        barberId,
        startAtISO
      );
      if (!isAvailable) {
        setError("El barbero no está disponible en este horario");
        setSubmitting(false);
        return;
      }

      // Verificar conflictos con otras citas
      const { data: hasConflict } = await checkAppointmentConflict(
        barberId,
        startAtISO,
        30,
        initialData?.id || null
      );
      if (hasConflict) {
        setError("Ya existe una cita en este horario");
        setSubmitting(false);
        return;
      }

      // Preparar payload
      const payload = {
        barber_id: barberId,
        service: service,
        start_at: startAtISO,
        notes: notes || null,
      };

      await onSave(payload);
    } catch (err) {
      console.error("Error en onSave:", err);
      setError(err?.message || String(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Cargando formulario...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: 12, maxWidth: 520 }}
    >
      <label>
        <strong>Barbero *</strong>
        <select
          value={barberId}
          onChange={(e) => setBarberId(e.target.value)}
          required
        >
          <option value="">Selecciona un barbero</option>
          {barbers.map((barber) => (
            <option key={barber.id} value={barber.id}>
              {barber.name} {barber.specialty ? `- ${barber.specialty}` : ""}
            </option>
          ))}
        </select>
      </label>

      <label>
        <strong>Servicio *</strong>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          required
        >
          <option value="">Selecciona un servicio</option>
          {services.map((svc) => (
            <option key={svc.id} value={svc.name}>
              {svc.name} - ${svc.price}
            </option>
          ))}
        </select>
      </label>

      <label>
        <strong>Fecha *</strong>
        <input
          type="date"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          min={(() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split("T")[0];
          })()}
          required
        />
        {dateStr && (
          <small style={{ color: "var(--color-text-secondary)" }}>
            {getDayName(dateStr)}
            {new Date(dateStr + "T00:00:00").getDay() === 0 &&
              " - ⚠️ Domingos cerrado"}
          </small>
        )}
      </label>

      <label>
        <strong>Hora *</strong>
        {timeSlots.length > 0 ? (
          <select
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            required
          >
            <option value="">Selecciona una hora</option>
            {timeSlots.map((slot) => (
              <option key={slot.start} value={slot.start}>
                {slot.display}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="time"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            required
          />
        )}
        <small style={{ color: "var(--color-text-secondary)" }}>
          Lun-Vie: 8:00-12:00 y 13:00-17:00 | Sáb: 8:00-20:00 | Dom: Cerrado
        </small>
      </label>

      <label>
        <strong>Notas (opcional)</strong>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: Cliente prefiere corte corto a los lados"
          rows="3"
        />
      </label>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar Cita"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "12px",
            background: "var(--color-error-light)",
            color: "var(--color-error)",
            borderRadius: "8px",
            border: "1px solid var(--color-error)",
          }}
        >
          {error}
        </div>
      )}
    </form>
  );
};

export default CitaForm;
