import { supabase } from "./supabaseClient";

/**
 * Get all users from profiles table
 */
export const getUsers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get a single user by ID
 */
export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update user profile
 */
export const updateUser = async (userId, updates) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update user role
 */
export const updateUserRole = async (userId, role) => {
  return updateUser(userId, { role });
};

/**
 * Delete user profile
 */
export const deleteUser = async (userId) => {
  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  if (error) throw error;
  return true;
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", role)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Search users by email or name
 */
export const searchUsers = async (searchTerm) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};
