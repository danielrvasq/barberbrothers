-- =====================================================
-- Fix: Corrección de manejo de zonas horarias
-- =====================================================
-- 
-- PROBLEMA: La función is_barber_available estaba convirtiendo
-- timestamptz a time sin considerar zona horaria, causando que
-- las horas de la tarde aparecieran como no disponibles.
-- 
-- SOLUCIÓN: Cambiar el parámetro de timestamptz a timestamp 
-- (sin timezone) para que se maneje como hora local directamente.
-- =====================================================

-- Eliminar la función anterior
DROP FUNCTION IF EXISTS is_barber_available(uuid, timestamptz);

-- Recrear con timestamp (sin timezone)
CREATE OR REPLACE FUNCTION is_barber_available(
  p_barber_id uuid,
  p_start_at timestamp  -- Cambiado de timestamptz a timestamp
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
  
  -- Extraer solo la hora (ahora sin problemas de zona horaria)
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
-- NOTA: Ajusta 'America/Mexico_City' a tu zona horaria
-- =====================================================
-- Otras opciones comunes:
-- - 'America/New_York' (EST/EDT)
-- - 'America/Chicago' (CST/CDT)
-- - 'America/Denver' (MST/MDT)
-- - 'America/Los_Angeles' (PST/PDT)
-- - 'America/Bogota' (COT)
-- - 'America/Lima' (PET)
-- - 'America/Argentina/Buenos_Aires' (ART)
-- - 'America/Sao_Paulo' (BRT)
-- - 'Europe/Madrid' (CET/CEST)
-- =====================================================
