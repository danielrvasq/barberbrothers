import { supabase } from "./supabaseClient";

/**
 * Obtener barberos
 * @param {boolean} includeInactive - Si es true, incluye barberos inactivos
 */
export const getBarbers = async (includeInactive = false) => {
  let query = supabase.from("barbers").select("*");

  if (!includeInactive) {
    query = query.eq("active", true);
  }

  const { data, error } = await query.order("name", { ascending: true });

  return { data, error };
};

/**
 * Obtener un barbero por ID
 */
export const getBarberById = async (id) => {
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
};

/**
 * Obtener horarios de un barbero
 */
export const getBarberSchedules = async (barberId) => {
  const { data, error } = await supabase
    .from("barber_schedules")
    .select("*")
    .eq("barber_id", barberId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  return { data, error };
};

/**
 * Verificar disponibilidad de un barbero
 * @param {string} barberId - ID del barbero
 * @param {string} startAt - Fecha y hora en formato ISO
 */
export const checkBarberAvailability = async (barberId, startAt) => {
  const { data, error } = await supabase.rpc("is_barber_available", {
    p_barber_id: barberId,
    p_start_at: startAt,
  });

  return { data, error };
};

/**
 * Verificar conflictos de citas
 * @param {string} barberId - ID del barbero
 * @param {string} startAt - Fecha y hora en formato ISO
 * @param {number} durationMinutes - Duración en minutos (default: 30)
 * @param {string} excludeAppointmentId - ID de cita a excluir (para ediciones)
 */
export const checkAppointmentConflict = async (
  barberId,
  startAt,
  durationMinutes = 30,
  excludeAppointmentId = null
) => {
  const { data, error } = await supabase.rpc("has_appointment_conflict", {
    p_barber_id: barberId,
    p_start_at: startAt,
    p_duration_minutes: durationMinutes,
    p_exclude_appointment_id: excludeAppointmentId,
  });

  return { data, error };
};

/**
 * Crear un nuevo barbero (solo admin)
 */
export const createBarber = async (barber) => {
  const { data, error } = await supabase
    .from("barbers")
    .insert([barber])
    .select()
    .single();

  return { data, error };
};

/**
 * Actualizar un barbero (solo admin)
 */
export const updateBarber = async (id, updates) => {
  const { data, error } = await supabase
    .from("barbers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
};

/**
 * Desactivar un barbero (no se elimina, solo se marca como inactivo)
 */
export const deactivateBarber = async (id) => {
  return updateBarber(id, { active: false });
};
