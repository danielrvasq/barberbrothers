import React, { useEffect, useState } from "react";
import {
  getBarbers,
  checkBarberAvailability,
  checkAppointmentConflict,
} from "../../lib/barbersService";
import { getServices } from "../../lib/productsService";
import { getCitasByDate } from "../../lib/citasService";
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
  const [unavailableSlots, setUnavailableSlots] = useState(new Set());
  const [unavailableBarbers, setUnavailableBarbers] = useState(new Set());
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [appointmentsOfDay, setAppointmentsOfDay] = useState([]);

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

  // Cargar citas del día cuando cambia la fecha
  useEffect(() => {
    const loadAppointmentsOfDay = async () => {
      if (!dateStr) {
        setAppointmentsOfDay([]);
        return;
      }

      try {
        const { data, error } = await getCitasByDate(dateStr);
        if (error) {
          console.error("Error cargando citas del día:", error);
          setAppointmentsOfDay([]);
        } else {
          // Filtrar la cita actual si estamos editando
          const filtered = initialData?.id
            ? (data || []).filter(apt => apt.id !== initialData.id)
            : (data || []);
          setAppointmentsOfDay(filtered);
        }
      } catch (err) {
        console.error("Error:", err);
        setAppointmentsOfDay([]);
      }
    };

    loadAppointmentsOfDay();
  }, [dateStr, initialData]);

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

  // Verificar disponibilidad de horarios cuando se selecciona barbero + fecha
  useEffect(() => {
    const checkTimeSlotsAvailability = async () => {
      if (!barberId || !dateStr || timeSlots.length === 0) {
        setUnavailableSlots(new Set());
        return;
      }

      setCheckingAvailability(true);
      const unavailable = new Set();

      try {
        // Verificar cada slot de tiempo
        for (const slot of timeSlots) {
          // Construir timestamp manteniendo la zona horaria local
          const localDate = new Date(`${dateStr}T${slot.start}:00`);
          // Convertir a formato ISO pero ajustando el offset de zona horaria
          const tzOffset = localDate.getTimezoneOffset() * 60000; // offset en milisegundos
          const localISOTime = new Date(localDate.getTime() - tzOffset).toISOString().slice(0, -1);
          const startAtISO = `${dateStr}T${slot.start}:00`;
          
          // Verificar disponibilidad del barbero en su horario de trabajo
          const { data: isAvailable } = await checkBarberAvailability(
            barberId,
            startAtISO
          );

          // Verificar conflictos con citas existentes
          const hasConflict = appointmentsOfDay.some(apt => {
            const aptTime = new Date(apt.start_at).toTimeString().slice(0, 5);
            return apt.barber_id === barberId && aptTime === slot.start;
          });

          if (!isAvailable || hasConflict) {
            unavailable.add(slot.start);
          }
        }

        setUnavailableSlots(unavailable);
      } catch (err) {
        console.error("Error verificando disponibilidad de horarios:", err);
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkTimeSlotsAvailability();
  }, [barberId, dateStr, timeSlots, appointmentsOfDay]);

  // Verificar disponibilidad de barberos cuando se selecciona hora + fecha
  useEffect(() => {
    const checkBarbersAvailability = async () => {
      if (!timeStr || !dateStr || barbers.length === 0) {
        setUnavailableBarbers(new Set());
        return;
      }

      setCheckingAvailability(true);
      const unavailable = new Set();

      try {
        // Construir timestamp en formato local (no UTC)
        const startAtISO = `${dateStr}T${timeStr}:00`;

        // Verificar cada barbero
        for (const barber of barbers) {
          // Verificar disponibilidad del barbero en su horario de trabajo
          const { data: isAvailable } = await checkBarberAvailability(
            barber.id,
            startAtISO
          );

          // Verificar conflictos con citas existentes
          const hasConflict = appointmentsOfDay.some(apt => {
            const aptTime = new Date(apt.start_at).toTimeString().slice(0, 5);
            return apt.barber_id === barber.id && aptTime === timeStr;
          });

          if (!isAvailable || hasConflict) {
            unavailable.add(barber.id);
          }
        }

        setUnavailableBarbers(unavailable);
      } catch (err) {
        console.error("Error verificando disponibilidad de barberos:", err);
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkBarbersAvailability();
  }, [timeStr, dateStr, barbers, appointmentsOfDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validación básica
    if (!barberId || !service || !dateStr || !timeStr) {
      setError("Todos los campos son obligatorios");
      return;
    }

    // Combinar fecha y hora (formato local, no UTC)
    const startAtISO = `${dateStr}T${timeStr}:00`;

    // Validar horario de negocio
    const validation = validateAppointment(barberId, startAtISO, service);
    if (!validation.valid) {
      setError(validation.errors.join(". "));
      return;
    }

    setSubmitting(true);

    try {
      // Verificación final de seguridad (aunque las opciones están deshabilitadas)
      const { data: isAvailable } = await checkBarberAvailability(
        barberId,
        startAtISO
      );
      const { data: hasConflict } = await checkAppointmentConflict(
        barberId,
        startAtISO,
        30,
        initialData?.id || null
      );

      if (!isAvailable || hasConflict) {
        setError("El horario seleccionado ya no está disponible. Por favor selecciona otro.");
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
          {barbers.map((barber) => {
            const isUnavailable = unavailableBarbers.has(barber.id);
            return (
              <option 
                key={barber.id} 
                value={barber.id}
                disabled={isUnavailable}
              >
                {barber.name} {barber.specialty ? `- ${barber.specialty}` : ""}
                {isUnavailable ? " (No disponible)" : ""}
              </option>
            );
          })}
        </select>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
          {checkingAvailability && timeStr && (
            <small style={{ 
              color: "var(--color-wood-medium)", 
              fontStyle: "italic",
              fontWeight: 500 
            }}>
              ⏳ Verificando disponibilidad...
            </small>
          )}
          {!checkingAvailability && timeStr && unavailableBarbers.size > 0 && (
            <small style={{ 
              color: "var(--color-wood-dark)", 
              fontWeight: 500 
            }}>
              ℹ️ Barberos en gris no disponibles en este horario
            </small>
          )}
        </div>
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
            {timeSlots.map((slot) => {
              const isUnavailable = unavailableSlots.has(slot.start);
              return (
                <option 
                  key={slot.start} 
                  value={slot.start}
                  disabled={isUnavailable}
                >
                  {slot.display}
                  {isUnavailable ? " (No disponible)" : ""}
                </option>
              );
            })}
          </select>
        ) : (
          <input
            type="time"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            required
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {checkingAvailability && barberId && (
            <small style={{ 
              color: "var(--color-wood-medium)", 
              fontStyle: "italic",
              fontWeight: 500 
            }}>
              ⏳ Verificando disponibilidad...
            </small>
          )}
          {!checkingAvailability && barberId && unavailableSlots.size > 0 && (
            <small style={{ 
              color: "var(--color-wood-dark)", 
              fontWeight: 500 
            }}>
              ℹ️ Horarios en gris no disponibles
            </small>
          )}
          <small style={{ color: "var(--color-text-secondary)" }}>
            Lun-Vie: 8:00-12:00 y 13:00-17:00 | Sáb: 8:00-20:00 | Dom: Cerrado
          </small>
        </div>
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
