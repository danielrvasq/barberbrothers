import { supabase } from './supabaseClient'

export const getCitas = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('start_at', { ascending: true })

  return { data, error }
}

export const createCita = async (cita) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([cita])
    .select()
    .single()

  return { data, error }
}

export const updateCita = async (id, updates) => {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export const deleteCita = async (id) => {
  const { data, error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
    .select()

  return { data, error }
}
