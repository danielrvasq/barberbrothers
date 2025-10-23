-- =====================================================
-- Fix de schema - Ejecutar esto en Supabase SQL Editor
-- =====================================================

-- Primero, eliminar las tablas si existen (para empezar limpio)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA: profiles
-- =====================================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  phone text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_role_idx ON profiles(role);

-- =====================================================
-- TABLA: products
-- =====================================================
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'product',
  price numeric(10,2) NOT NULL DEFAULT 0,
  cost numeric(10,2) DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  min_stock integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_sku_idx ON products(sku);
CREATE INDEX products_category_idx ON products(category);

-- =====================================================
-- TABLA: appointments
-- =====================================================
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id),
  staff_id uuid REFERENCES profiles(id),
  service text NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX appointments_customer_idx ON appointments(customer_id);
CREATE INDEX appointments_staff_idx ON appointments(staff_id);
CREATE INDEX appointments_start_at_idx ON appointments(start_at);
CREATE INDEX appointments_status_idx ON appointments(status);

-- =====================================================
-- TABLA: inventory_transactions
-- =====================================================
CREATE TABLE inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  type text NOT NULL,
  reason text,
  reference_id uuid,
  performed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX inventory_product_idx ON inventory_transactions(product_id);
CREATE INDEX inventory_type_idx ON inventory_transactions(type);
CREATE INDEX inventory_created_at_idx ON inventory_transactions(created_at);

-- =====================================================
-- TABLA: audit_logs
-- =====================================================
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  action text NOT NULL,
  record_id text,
  performed_by uuid REFERENCES auth.users(id),
  data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_table_idx ON audit_logs(table_name);
CREATE INDEX audit_action_idx ON audit_logs(action);
CREATE INDEX audit_created_at_idx ON audit_logs(created_at);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- POLÍTICAS: profiles
CREATE POLICY "profiles_owner_access" ON profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_access" ON profiles
  FOR ALL
  USING (is_admin());

-- POLÍTICAS: products
CREATE POLICY "products_public_select" ON products
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

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

-- POLÍTICAS: appointments
CREATE POLICY "appointments_customer_select" ON appointments
  FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "appointments_customer_insert" ON appointments
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "appointments_customer_update" ON appointments
  FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "appointments_staff_select" ON appointments
  FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "appointments_admin_access" ON appointments
  FOR ALL
  USING (is_admin());

-- POLÍTICAS: inventory_transactions
CREATE POLICY "inventory_select_authenticated" ON inventory_transactions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "inventory_admin_write" ON inventory_transactions
  FOR INSERT
  WITH CHECK (is_admin());

-- POLÍTICAS: audit_logs
CREATE POLICY "audit_admin_select" ON audit_logs
  FOR SELECT
  USING (is_admin());

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================
INSERT INTO products (name, description, category, price, cost, stock, sku) VALUES
  ('Corte de Cabello Clásico', 'Corte tradicional de caballero', 'service', 15.00, 0, 0, 'SRV-001'),
  ('Corte + Barba', 'Corte de cabello y arreglo de barba', 'service', 25.00, 0, 0, 'SRV-002'),
  ('Afeitado Clásico', 'Afeitado tradicional con navaja', 'service', 12.00, 0, 0, 'SRV-003'),
  ('Shampoo Premium', 'Shampoo para cabello y barba 250ml', 'product', 8.50, 4.00, 50, 'PROD-001'),
  ('Cera para Cabello', 'Cera de fijación media 100g', 'product', 6.00, 3.00, 30, 'PROD-002'),
  ('Aceite para Barba', 'Aceite hidratante 50ml', 'product', 10.00, 5.00, 25, 'PROD-003')
ON CONFLICT (sku) DO NOTHING;
