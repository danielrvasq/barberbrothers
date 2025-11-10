import { supabase } from "./supabaseClient";

/**
 * Obtener todos los servicios (is_service = 0)
 */
export const getServices = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_service", 0)
    .order("name", { ascending: true });

  return { data, error };
};

/**
 * Obtener todos los productos de inventario (is_service = 1)
 */
export const getProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_service", 1)
    .order("name", { ascending: true });

  return { data, error };
};

/**
 * Obtener todos (servicios y productos)
 */
export const getAllProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  return { data, error };
};

/**
 * Obtener un producto/servicio por ID
 */
export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
};

/**
 * Crear un producto/servicio (solo admin)
 */
export const createProduct = async (product) => {
  const { data, error } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single();

  return { data, error };
};

/**
 * Actualizar un producto/servicio (solo admin)
 */
export const updateProduct = async (id, updates) => {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
};

/**
 * Eliminar un producto/servicio (solo admin)
 */
export const deleteProduct = async (id) => {
  const { data, error } = await supabase.from("products").delete().eq("id", id);

  return { data, error };
};
