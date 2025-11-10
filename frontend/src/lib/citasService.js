import { supabase } from "./supabaseClient";

/**
 * Obtener todas las citas del usuario actual o todas (si es admin)
 */
export const getCitas = async () => {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      *,
      barber:barbers(id, name, specialty),
      customer:profiles(id, full_name, email)
    `
    )
    .order("start_at", { ascending: true });

  return { data, error };
};

/**
 * Obtener una cita por ID
 */
export const getCitaById = async (id) => {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      *,
      barber:barbers(id, name, specialty),
      customer:profiles(id, full_name, email)
    `
    )
    .eq("id", id)
    .single();

  return { data, error };
};

/**
 * Crear una nueva cita
 * @param {Object} cita - Debe incluir: customer_id, barber_id, service, start_at, notes (opcional)
 */
export const createCita = async (cita) => {
  const { data, error } = await supabase
    .from("appointments")
    .insert([
      {
        ...cita,
        status: "scheduled",
      },
    ])
    .select(
      `
      *,
      barber:barbers(id, name, specialty)
    `
    )
    .single();

  return { data, error };
};

/**
 * Actualizar una cita existente
 */
export const updateCita = async (id, updates) => {
  const { data, error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", id)
    .select(
      `
      *,
      barber:barbers(id, name, specialty)
    `
    )
    .single();

  return { data, error };
};

/**
 * Cancelar una cita (cambiar estado a canceled)
 */
export const cancelCita = async (id) => {
  return updateCita(id, { status: "canceled" });
};

/**
 * Completar una cita (cambiar estado a completed)
 */
export const completeCita = async (id) => {
  return updateCita(id, { status: "completed" });
};

/**
 * Eliminar una cita permanentemente
 */
export const deleteCita = async (id) => {
  const { data, error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id)
    .select();

  return { data, error };
};

/**
 * Obtener citas de un barbero específico en un rango de fechas
 */
export const getCitasByBarberAndDate = async (barberId, startDate, endDate) => {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      *,
      customer:profiles(id, full_name, email)
    `
    )
    .eq("barber_id", barberId)
    .gte("start_at", startDate)
    .lte("start_at", endDate)
    .in("status", ["scheduled", "confirmed"])
    .order("start_at", { ascending: true });

  return { data, error };
};

/**
 * Obtener todas las citas de un día específico (para validar disponibilidad)
 */
export const getCitasByDate = async (dateStr) => {
  const startDate = `${dateStr}T00:00:00`;
  const endDate = `${dateStr}T23:59:59`;

  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      barber_id,
      start_at,
      status
    `
    )
    .gte("start_at", startDate)
    .lte("start_at", endDate)
    .in("status", ["scheduled", "confirmed"])
    .order("start_at", { ascending: true });

  return { data, error };
};
