-- =====================================================
-- Barbería - Sistema de Gestión
-- Migraciones SQL para Supabase (PostgreSQL)
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- para gen_random_uuid()

-- =====================================================
-- TABLA: profiles
-- Perfil extendido de usuarios (referencia auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  phone text,
  role text NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- =====================================================
-- TABLA: products
-- Productos/servicios y su inventario
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE,
  name text NOT NULL,
  description text,
  category text, -- 'product' | 'service'
  price numeric(10,2) NOT NULL DEFAULT 0,
  cost numeric(10,2) DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  min_stock integer DEFAULT 0, -- alerta de stock mínimo
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS products_sku_idx ON products(sku);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);

-- =====================================================
-- TABLA: appointments
-- Citas de clientes con la barbería
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id),
  staff_id uuid REFERENCES profiles(id), -- barbero asignado
  service text NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled', -- scheduled | completed | canceled
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS appointments_customer_idx ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS appointments_staff_idx ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS appointments_start_at_idx ON appointments(start_at);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);

-- =====================================================
-- TABLA: inventory_transactions
-- Registro de entradas y salidas de inventario
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  delta integer NOT NULL, -- positivo (entrada) o negativo (salida)
  type text NOT NULL, -- purchase | sale | adjustment | correction | return
  reason text,
  reference_id uuid, -- referencia a venta, compra, etc.
  performed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS inventory_product_idx ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS inventory_type_idx ON inventory_transactions(type);
CREATE INDEX IF NOT EXISTS inventory_created_at_idx ON inventory_transactions(created_at);

-- =====================================================
-- TABLA: audit_logs
-- Registro de auditoría para cambios importantes
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  action text NOT NULL, -- insert|update|delete
  record_id text,
  performed_by uuid REFERENCES auth.users(id),
  data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS audit_table_idx ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS audit_action_idx ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_created_at_idx ON audit_logs(created_at);

-- =====================================================
-- TRIGGER: actualizar updated_at automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: actualizar stock automáticamente
-- Cuando se crea una transacción de inventario
-- =====================================================
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = stock + NEW.delta
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_on_transaction AFTER INSERT ON inventory_transactions
  FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNCIÓN HELPER: verificar si usuario es admin
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean 
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- =====================================================
-- POLÍTICAS RLS: profiles
-- =====================================================

-- Usuarios pueden ver y editar su propio perfil
CREATE POLICY "profiles_owner_access" ON profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins pueden ver y editar todos los perfiles
CREATE POLICY "profiles_admin_access" ON profiles
  FOR ALL
  USING (is_admin());

-- =====================================================
-- POLÍTICAS RLS: products
-- =====================================================

-- Todos los usuarios autenticados pueden ver productos
CREATE POLICY "products_public_select" ON products
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Solo admins pueden insertar, actualizar o eliminar productos
CREATE POLICY "products_admin_write" ON products
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "products_admin_update" ON products
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "products_admin_delete" ON products
  FOR DELETE
  USING (is_admin());

-- =====================================================
-- POLÍTICAS RLS: appointments
-- =====================================================

-- Usuarios pueden ver sus propias citas (como cliente)
CREATE POLICY "appointments_customer_select" ON appointments
  FOR SELECT
  USING (customer_id = auth.uid());

-- Usuarios pueden crear citas para sí mismos
CREATE POLICY "appointments_customer_insert" ON appointments
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Usuarios pueden actualizar sus propias citas
CREATE POLICY "appointments_customer_update" ON appointments
  FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Staff pueden ver citas asignadas a ellos
CREATE POLICY "appointments_staff_select" ON appointments
  FOR SELECT
  USING (staff_id = auth.uid());

-- Admins tienen acceso completo a citas
CREATE POLICY "appointments_admin_access" ON appointments
  FOR ALL
  USING (is_admin());

-- =====================================================
-- POLÍTICAS RLS: inventory_transactions
-- =====================================================

-- Usuarios autenticados pueden ver transacciones (para reportes)
CREATE POLICY "inventory_select_authenticated" ON inventory_transactions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Solo admins pueden crear transacciones de inventario
CREATE POLICY "inventory_admin_write" ON inventory_transactions
  FOR INSERT
  WITH CHECK (is_admin());

-- =====================================================
-- POLÍTICAS RLS: audit_logs
-- =====================================================

-- Solo admins pueden ver logs de auditoría
CREATE POLICY "audit_admin_select" ON audit_logs
  FOR SELECT
  USING (is_admin());

-- =====================================================
-- DATOS DE EJEMPLO (opcional - comentar si no deseas)
-- =====================================================

-- Nota: Los usuarios se crearán automáticamente vía Google OAuth
-- Para crear un usuario admin inicial, después del primer login ejecuta:
-- UPDATE profiles SET role = 'admin' WHERE email = 'tu-email@gmail.com';

-- Productos de ejemplo
INSERT INTO products (name, description, category, price, cost, stock, sku) VALUES
  ('Corte de Cabello Clásico', 'Corte tradicional de caballero', 'service', 15.00, 0, 0, 'SRV-001'),
  ('Corte + Barba', 'Corte de cabello y arreglo de barba', 'service', 25.00, 0, 0, 'SRV-002'),
  ('Afeitado Clásico', 'Afeitado tradicional con navaja', 'service', 12.00, 0, 0, 'SRV-003'),
  ('Shampoo Premium', 'Shampoo para cabello y barba 250ml', 'product', 8.50, 4.00, 50, 'PROD-001'),
  ('Cera para Cabello', 'Cera de fijación media 100g', 'product', 6.00, 3.00, 30, 'PROD-002'),
  ('Aceite para Barba', 'Aceite hidratante 50ml', 'product', 10.00, 5.00, 25, 'PROD-003')
ON CONFLICT (sku) DO NOTHING;

-- =====================================================
-- FIN DE MIGRACIONES
-- =====================================================

-- Para verificar que todo está correcto:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- SELECT * FROM profiles LIMIT 5;
-- SELECT * FROM products LIMIT 5;
