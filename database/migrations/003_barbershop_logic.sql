-- =====================================================
-- Barbería Brothers - Refactorización de Lógica de Negocio
-- Migración 003: Agregar barberos y ajustar citas
-- =====================================================

-- =====================================================
-- TABLA: barbers
-- Barberos que trabajan en la barbería
-- =====================================================
CREATE TABLE IF NOT EXISTS barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL, -- Opcional: vincular con un usuario
  name text NOT NULL,
  phone text,
  email text,
  specialty text, -- ej: "Cortes Modernos", "Barbería Clásica"
  bio text,
  active boolean NOT NULL DEFAULT true, -- Si está activo para recibir citas
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS barbers_active_idx ON barbers(active);
CREATE INDEX IF NOT EXISTS barbers_profile_id_idx ON barbers(profile_id);

-- Trigger para updated_at (eliminar si existe primero)
DROP TRIGGER IF EXISTS update_barbers_updated_at ON barbers;
CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON barbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MODIFICAR TABLA: appointments
-- Simplificar estructura según lógica de negocio
-- =====================================================

-- 1. Eliminar política RLS que depende de staff_id (si existe)
DROP POLICY IF EXISTS "appointments_staff_select" ON appointments;

-- 2. Eliminar columna end_at (ya no se necesita)
ALTER TABLE appointments DROP COLUMN IF EXISTS end_at;

-- 3. Eliminar columna staff_id (reemplazamos con barber_id)
ALTER TABLE appointments DROP COLUMN IF EXISTS staff_id CASCADE;

-- 4. Agregar columna barber_id
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS barber_id uuid REFERENCES barbers(id) ON DELETE SET NULL;

-- 5. Modificar columna service para ser más específica
-- Puede ser texto libre o referencia a products donde category='service'
COMMENT ON COLUMN appointments.service IS 'Nombre del servicio o referencia al producto/servicio';

-- 6. Agregar índice para barber_id
CREATE INDEX IF NOT EXISTS appointments_barber_idx ON appointments(barber_id);

-- =====================================================
-- MODIFICAR TABLA: products
-- Asegurar que los servicios sean tratados como productos
-- =====================================================

-- Agregar columna is_service (0=servicio, 1=producto)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_service smallint DEFAULT 1 CHECK (is_service IN (0, 1));

-- Actualizar productos existentes según su category
UPDATE products SET is_service = 0 WHERE category = 'service';
UPDATE products SET is_service = 1 WHERE category = 'product' OR category IS NULL;

-- Los servicios tendrían stock = 0 por defecto ya que son intangibles
COMMENT ON COLUMN products.is_service IS '0 = servicio (intangible), 1 = producto (inventario físico)';
COMMENT ON COLUMN products.stock IS 'Para servicios usar 0, para productos físicos el stock real';

-- Mantener category para compatibilidad pero agregar constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_category_check'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_category_check 
      CHECK (category IN ('service', 'product'));
  END IF;
END $$;

-- =====================================================
-- TABLA: barber_schedules (opcional)
-- Horarios de trabajo de cada barbero
-- =====================================================
CREATE TABLE IF NOT EXISTS barber_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL, -- 1=Lunes, 2=Martes, ..., 7=Domingo
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_day_of_week CHECK (day_of_week BETWEEN 1 AND 7),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Índices
CREATE INDEX IF NOT EXISTS barber_schedules_barber_idx ON barber_schedules(barber_id);
CREATE INDEX IF NOT EXISTS barber_schedules_day_idx ON barber_schedules(day_of_week);

-- Trigger para updated_at (eliminar si existe primero)
DROP TRIGGER IF EXISTS update_barber_schedules_updated_at ON barber_schedules;
CREATE TRIGGER update_barber_schedules_updated_at BEFORE UPDATE ON barber_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY: barbers
-- =====================================================
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "barbers_public_select" ON barbers;
DROP POLICY IF EXISTS "barbers_admin_write" ON barbers;

-- Todos los usuarios autenticados pueden ver barberos activos
CREATE POLICY "barbers_public_select" ON barbers
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND active = true);

-- Solo admins pueden crear, actualizar o eliminar barberos
CREATE POLICY "barbers_admin_write" ON barbers
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- ROW LEVEL SECURITY: barber_schedules
-- =====================================================
ALTER TABLE barber_schedules ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "barber_schedules_public_select" ON barber_schedules;
DROP POLICY IF EXISTS "barber_schedules_admin_write" ON barber_schedules;

-- Todos los usuarios autenticados pueden ver horarios
CREATE POLICY "barber_schedules_public_select" ON barber_schedules
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Solo admins pueden modificar horarios
CREATE POLICY "barber_schedules_admin_write" ON barber_schedules
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- ACTUALIZAR POLÍTICAS RLS: appointments
-- Ahora usan barber_id en lugar de staff_id
-- =====================================================

-- Eliminar política existente para evitar conflictos
DROP POLICY IF EXISTS "appointments_barber_select" ON appointments;

-- Barberos pueden ver citas asignadas a ellos
-- (si tienen profile_id vinculado)
CREATE POLICY "appointments_barber_select" ON appointments
  FOR SELECT
  USING (
    barber_id IN (
      SELECT id FROM barbers WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- DATOS DE EJEMPLO: Barberos y Horarios
-- =====================================================

-- Barberos de ejemplo
INSERT INTO barbers (name, phone, email, specialty, active) VALUES
  ('Carlos Martínez', '555-0101', 'carlos@barberbros.com', 'Cortes Modernos y Fade', true),
  ('Juan Rodríguez', '555-0102', 'juan@barberbros.com', 'Barbería Clásica', true),
  ('Miguel Torres', '555-0103', 'miguel@barberbros.com', 'Especialista en Barba', true)
ON CONFLICT DO NOTHING;

-- Horarios de ejemplo para barberos
-- Lunes a Viernes: 8:00 AM - 12:00 PM y 1:00 PM - 5:00 PM
-- Sábados: 8:00 AM - 8:00 PM
-- Domingos: No hay servicio

-- Obtener IDs de barberos (asumiendo que se insertaron correctamente)
DO $$
DECLARE
  barber_id uuid;
BEGIN
  FOR barber_id IN SELECT id FROM barbers LOOP
    -- Lunes a Viernes: Turno Mañana (8:00 AM - 12:00 PM)
    INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time) VALUES
      (barber_id, 1, '08:00', '12:00'), -- Lunes
      (barber_id, 2, '08:00', '12:00'), -- Martes
      (barber_id, 3, '08:00', '12:00'), -- Miércoles
      (barber_id, 4, '08:00', '12:00'), -- Jueves
      (barber_id, 5, '08:00', '12:00'); -- Viernes
    
    -- Lunes a Viernes: Turno Tarde (1:00 PM - 5:00 PM)
    INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time) VALUES
      (barber_id, 1, '13:00', '17:00'), -- Lunes
      (barber_id, 2, '13:00', '17:00'), -- Martes
      (barber_id, 3, '13:00', '17:00'), -- Miércoles
      (barber_id, 4, '13:00', '17:00'), -- Jueves
      (barber_id, 5, '13:00', '17:00'); -- Viernes
    
    -- Sábado: Turno completo (8:00 AM - 8:00 PM)
    INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time) VALUES
      (barber_id, 6, '08:00', '20:00'); -- Sábado
    
    -- Domingo: No hay servicio (no insertamos registros)
  END LOOP;
END $$;

-- =====================================================
-- DATOS DE EJEMPLO: Servicios y Productos
-- =====================================================

-- Eliminar productos de ejemplo anteriores si existen
DELETE FROM products WHERE sku IN ('SRV-001', 'SRV-002', 'SRV-003', 'PROD-001', 'PROD-002', 'PROD-003');

-- Servicios de barbería (is_service = 0)
INSERT INTO products (name, description, category, price, cost, stock, sku, is_service) VALUES
  ('Corte de Cabello Clásico', 'Corte tradicional de caballero con tijera y máquina', 'service', 15.00, 0, 0, 'SRV-001', 0),
  ('Corte Moderno + Fade', 'Corte moderno con degradado (fade) profesional', 'service', 20.00, 0, 0, 'SRV-002', 0),
  ('Corte + Barba', 'Corte de cabello y arreglo completo de barba', 'service', 25.00, 0, 0, 'SRV-003', 0),
  ('Afeitado Clásico', 'Afeitado tradicional con navaja y toallas calientes', 'service', 12.00, 0, 0, 'SRV-004', 0),
  ('Arreglo de Barba', 'Perfilado y recorte de barba con aceites', 'service', 10.00, 0, 0, 'SRV-005', 0),
  ('Corte Infantil', 'Corte especial para niños menores de 12 años', 'service', 12.00, 0, 0, 'SRV-006', 0),
  ('Diseño en Cabello', 'Diseños artísticos y líneas en cabello', 'service', 8.00, 0, 0, 'SRV-007', 0),
  ('Tratamiento Capilar', 'Tratamiento hidratante para cabello y cuero cabelludo', 'service', 18.00, 0, 0, 'SRV-008', 0)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_service = EXCLUDED.is_service,
  stock = 0;

-- Productos de inventario (is_service = 1)
INSERT INTO products (name, description, category, price, cost, stock, min_stock, sku, is_service) VALUES
  ('Shampoo Premium 250ml', 'Shampoo profesional para cabello y barba', 'product', 12.00, 6.00, 50, 10, 'PROD-001', 1),
  ('Cera para Cabello Fuerte', 'Cera de fijación fuerte para peinados duraderos', 'product', 8.50, 4.00, 35, 8, 'PROD-002', 1),
  ('Aceite para Barba 50ml', 'Aceite hidratante con aroma a madera de cedro', 'product', 15.00, 7.50, 28, 6, 'PROD-003', 1),
  ('Gel Fijador Extra Fuerte', 'Gel para peinados con fijación extrema', 'product', 7.00, 3.50, 42, 10, 'PROD-004', 1),
  ('Pomada Clásica', 'Pomada tradicional con brillo medio', 'product', 10.00, 5.00, 25, 5, 'PROD-005', 1),
  ('Navaja de Afeitar Profesional', 'Navaja de acero inoxidable con mango ergonómico', 'product', 45.00, 22.00, 8, 3, 'PROD-006', 1),
  ('Loción After Shave', 'Loción refrescante post-afeitado', 'product', 9.00, 4.50, 30, 8, 'PROD-007', 1),
  ('Talco para Barbería', 'Talco mentolado profesional 200g', 'product', 6.00, 3.00, 45, 12, 'PROD-008', 1),
  ('Cepillo para Barba', 'Cepillo de cerdas naturales para barba', 'product', 12.00, 6.00, 20, 5, 'PROD-009', 1),
  ('Tijeras Profesionales 6"', 'Tijeras de acero japonés para corte profesional', 'product', 75.00, 35.00, 5, 2, 'PROD-010', 1)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  cost = EXCLUDED.cost,
  stock = EXCLUDED.stock,
  min_stock = EXCLUDED.min_stock,
  is_service = EXCLUDED.is_service;

-- Actualizar servicios existentes para que tengan stock=0 e is_service=0
UPDATE products 
SET 
  stock = 0,
  is_service = 0,
  category = 'service'
WHERE 
  category = 'service' 
  OR name ILIKE '%corte%' 
  OR name ILIKE '%afeitado%'
  OR name ILIKE '%barba%'
  OR sku LIKE 'SRV-%';

-- =====================================================
-- FUNCIÓN HELPER: Verificar disponibilidad de barbero
-- =====================================================

CREATE OR REPLACE FUNCTION is_barber_available(
  p_barber_id uuid,
  p_start_at timestamptz
) RETURNS boolean AS $$
DECLARE
  day_num integer;
  time_only time;
  is_available boolean;
BEGIN
  -- Extraer día de la semana (1=Lunes, 7=Domingo)
  day_num := EXTRACT(ISODOW FROM p_start_at);
  
  -- Domingos no hay servicio
  IF day_num = 7 THEN
    RETURN false;
  END IF;
  
  -- Extraer solo la hora
  time_only := p_start_at::time;
  
  -- Verificar si el barbero tiene horario disponible
  SELECT EXISTS (
    SELECT 1 
    FROM barber_schedules
    WHERE 
      barber_id = p_barber_id
      AND day_of_week = day_num
      AND start_time <= time_only
      AND end_time > time_only
  ) INTO is_available;
  
  RETURN is_available;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN HELPER: Verificar conflictos de citas
-- =====================================================

CREATE OR REPLACE FUNCTION has_appointment_conflict(
  p_barber_id uuid,
  p_start_at timestamptz,
  p_duration_minutes integer DEFAULT 30,
  p_exclude_appointment_id uuid DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  end_time timestamptz;
  has_conflict boolean;
BEGIN
  -- Calcular hora de fin basada en duración
  end_time := p_start_at + (p_duration_minutes || ' minutes')::interval;
  
  -- Buscar conflictos con otras citas
  SELECT EXISTS (
    SELECT 1 
    FROM appointments
    WHERE 
      barber_id = p_barber_id
      AND status IN ('scheduled', 'confirmed')
      AND id != COALESCE(p_exclude_appointment_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (
        -- La nueva cita empieza durante una cita existente
        (p_start_at >= start_at AND p_start_at < start_at + interval '30 minutes')
        OR
        -- La nueva cita termina durante una cita existente
        (end_time > start_at AND end_time <= start_at + interval '30 minutes')
        OR
        -- La nueva cita contiene completamente una cita existente
        (p_start_at <= start_at AND end_time >= start_at + interval '30 minutes')
      )
  ) INTO has_conflict;
  
  RETURN has_conflict;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VISTA: appointments_with_details
-- Vista que combina información de citas con barberos y clientes
-- =====================================================

CREATE OR REPLACE VIEW appointments_with_details AS
SELECT 
  a.id,
  a.service,
  a.start_at,
  a.status,
  a.notes,
  a.created_at,
  a.updated_at,
  b.id as barber_id,
  b.name as barber_name,
  b.specialty as barber_specialty,
  p.id as customer_id,
  p.full_name as customer_name,
  p.email as customer_email,
  p.phone as customer_phone
FROM appointments a
LEFT JOIN barbers b ON a.barber_id = b.id
LEFT JOIN profiles p ON a.customer_id = p.id;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE barbers IS 'Barberos que trabajan en la barbería';
COMMENT ON TABLE barber_schedules IS 'Horarios de trabajo de cada barbero por día de la semana';
COMMENT ON COLUMN appointments.barber_id IS 'Barbero asignado a la cita';
COMMENT ON FUNCTION is_barber_available IS 'Verifica si un barbero está disponible en un horario dado';
COMMENT ON FUNCTION has_appointment_conflict IS 'Verifica si hay conflicto con otras citas del barbero';

-- =====================================================
-- FIN DE MIGRACIÓN 003
-- =====================================================

/*
NOTAS DE USO:

1. HORARIOS DE SERVICIO:
   - Lunes a Viernes: 8:00 AM - 12:00 PM y 1:00 PM - 5:00 PM
   - Sábados: 8:00 AM - 8:00 PM
   - Domingos: No hay servicio

2. VALIDACIONES EN FRONTEND:
   - Validar que la hora seleccionada esté dentro del horario del barbero
   - Validar que no sea domingo
   - Validar que no haya conflictos con otras citas (usar has_appointment_conflict)
   - Duración estimada por defecto: 30 minutos

3. CREAR UNA CITA:
   INSERT INTO appointments (customer_id, barber_id, service, start_at, notes, created_by)
   VALUES (
     'customer-uuid',
     'barber-uuid',
     'Corte de Cabello Clásico',
     '2025-11-10 10:00:00-00',
     'Cliente prefiere corte corto a los lados',
     'customer-uuid'
   );

4. VERIFICAR DISPONIBILIDAD:
   SELECT is_barber_available('barber-uuid', '2025-11-10 10:00:00-00');
   SELECT has_appointment_conflict('barber-uuid', '2025-11-10 10:00:00-00', 30);

5. LISTAR BARBEROS ACTIVOS:
   SELECT * FROM barbers WHERE active = true;

6. VER HORARIOS DE UN BARBERO:
   SELECT * FROM barber_schedules WHERE barber_id = 'barber-uuid' ORDER BY day_of_week, start_time;
*/
