# Corrección: Sistema de Cancelación de Citas

## Problema Identificado

**Reporte del usuario:**

> "cuando un usuario no admin elimina una cita propia, no se elimina de la base de datos, solo del frontend, y cuando se elimina una cita debe sumarse a la lista de citas canceladas"

## Análisis del Problema

### 1. **Problema de Permisos RLS**

- **Causa**: No existía una política RLS de `DELETE` para usuarios normales en la tabla `appointments`
- **Ubicación**: `database/migrations/001_initial_schema.sql`
- **Políticas existentes**:
  - ✅ `appointments_customer_insert` - Usuarios pueden crear citas
  - ✅ `appointments_customer_update` - Usuarios pueden actualizar sus propias citas
  - ❌ **Faltaba política DELETE** - Solo admins podían eliminar (política `appointments_admin_access FOR ALL`)

### 2. **Lógica de Negocio Incorrecta**

- El sistema usaba **hard delete** (eliminación permanente) en lugar de **soft delete** (marcado como cancelado)
- Las citas eliminadas desaparecían completamente de la base de datos
- No se registraban en las estadísticas de citas canceladas

## Solución Implementada

### ✅ Cambio 1: Uso de `cancelCita` en lugar de `deleteCita`

**Archivo**: `frontend/src/pages/CitasPage.jsx`

```javascript
// ANTES (hard delete)
const handleDelete = async (id) => {
  const { error } = await deleteCita(id);
  setCitas((prev) => prev.filter((c) => c.id !== id)); // Elimina del estado
};

// DESPUÉS (soft delete)
const handleDelete = async (id) => {
  const { data, error } = await cancelCita(id);
  // Actualiza el status a 'canceled' en el estado local
  setCitas((prev) =>
    prev.map((c) => (c.id === id ? { ...c, status: "canceled" } : c))
  );
};
```

**Ventajas**:

- ✅ Usa la política RLS existente `appointments_customer_update` (ya permitida)
- ✅ No requiere cambios en la base de datos
- ✅ Mantiene el historial completo de citas
- ✅ Las citas canceladas aparecen en reportes

### ✅ Cambio 2: Actualización de la UI

**Archivo**: `frontend/src/components/citas/CitasList.jsx`

1. **Cambio de ícono y título del botón**:

   ```jsx
   // ANTES
   <button title="Eliminar cita">🗑️</button>

   // DESPUÉS
   <button title="Cancelar cita">❌</button>
   ```

2. **Estilo visual para citas canceladas**:
   ```jsx
   <div
     className="card"
     style={{
       opacity: c.status === 'canceled' ? 0.6 : 1,
       filter: c.status === 'canceled' ? 'grayscale(50%)' : 'none'
     }}
   >
   ```

### ✅ Cambio 3: Mensajes de confirmación actualizados

```javascript
// Mensaje de confirmación
window.confirm("¿Estás seguro de que deseas cancelar esta cita?");

// Toast de éxito
showToast("Cita cancelada correctamente", "success");
```

## Funcionamiento del Sistema

### Servicio `cancelCita`

**Ubicación**: `frontend/src/lib/citasService.js`

```javascript
export const cancelCita = async (id) => {
  return updateCita(id, { status: "canceled" });
};
```

- Usa internamente `updateCita` que realiza un `UPDATE` en PostgreSQL
- Aprovecha la política RLS existente: `appointments_customer_update`
- Solo actualiza el campo `status` a `'canceled'`

### Estados de Citas

| Estado      | Descripción | Color Badge     | Acciones Permitidas    |
| ----------- | ----------- | --------------- | ---------------------- |
| `scheduled` | Agendada    | Azul (info)     | ✏️ Editar, ❌ Cancelar |
| `confirmed` | Confirmada  | Verde (success) | -                      |
| `completed` | Completada  | Gris            | -                      |
| `canceled`  | Cancelada   | Rojo (error)    | -                      |

### Visualización en Reportes

**Archivo**: `frontend/src/pages/ReportsPage.jsx`

```javascript
const canceled = appointments.filter((a) => a.status === "canceled");
// ...
stats.canceledAppointments = canceled.length;
```

Las citas canceladas:

- ✅ Se cuentan en la sección "Métricas Generales"
- ✅ NO se incluyen en cálculos de ingresos estimados
- ✅ NO aparecen en "Top 5 Servicios"
- ✅ Se mantienen en el historial de citas del barbero

## Políticas RLS Actuales

### Tabla: `appointments`

```sql
-- Usuarios pueden crear citas para sí mismos
CREATE POLICY "appointments_customer_insert" ON appointments
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- ✅ USADA PARA CANCELACIÓN: Usuarios pueden actualizar sus propias citas
CREATE POLICY "appointments_customer_update" ON appointments
  FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Barberos pueden ver citas asignadas a ellos
CREATE POLICY "appointments_barber_select" ON appointments
  FOR SELECT
  USING (barber_id IN (SELECT id FROM barbers WHERE profile_id = auth.uid()));

-- Admins tienen acceso completo
CREATE POLICY "appointments_admin_access" ON appointments
  FOR ALL
  USING (is_admin());
```

## Beneficios de la Solución

### 1. **Seguridad**

- ✅ No requiere nueva política RLS DELETE (evita potenciales brechas)
- ✅ Usa políticas existentes y probadas
- ✅ Mantiene principio de menor privilegio

### 2. **Integridad de Datos**

- ✅ Historial completo de citas (auditoría)
- ✅ No se pierden datos permanentemente
- ✅ Posibilidad de análisis histórico

### 3. **Experiencia de Usuario**

- ✅ Usuarios pueden ver sus citas canceladas
- ✅ Diferenciación visual clara (gris + opacidad)
- ✅ Mensajes claros ("cancelar" en lugar de "eliminar")

### 4. **Reportes y Estadísticas**

- ✅ Conteo preciso de citas canceladas
- ✅ Métricas de negocio más completas
- ✅ Análisis de comportamiento de cancelaciones

## Testing Recomendado

### Casos de Prueba

1. **Usuario Normal - Cancelar Cita Propia**

   - ✅ Debe poder cancelar su propia cita agendada
   - ✅ La cita debe cambiar a status `canceled`
   - ✅ La cita debe aparecer en gris/deshabilitada
   - ✅ No debe poder editar ni cancelar nuevamente

2. **Usuario Normal - Cita de Otro Usuario**

   - ✅ No debe ver citas de otros usuarios (RLS SELECT)
   - ✅ No debe poder cancelar citas de otros

3. **Barbero - Ver Citas Asignadas**

   - ✅ Debe ver todas sus citas (incluidas canceladas)
   - ✅ Debe ver el estado correcto de cada cita

4. **Admin - Gestión Completa**

   - ✅ Debe ver todas las citas del sistema
   - ✅ Puede realizar cualquier operación (política FOR ALL)

5. **Reportes**
   - ✅ Citas canceladas deben incrementar contador
   - ✅ No deben afectar ingresos estimados
   - ✅ No deben aparecer en "Top 5 Servicios"

## Notas Adicionales

### Función `deleteCita` - Uso Limitado

La función `deleteCita` **aún existe** en `citasService.js` pero:

- ⚠️ Solo debe usarse por administradores en casos excepcionales
- ⚠️ No debe exponerse en la UI normal de usuarios
- ⚠️ Solo admins tienen permiso RLS para ejecutarla

### Futuras Mejoras Opcionales

1. **Campo `canceled_at`**: Agregar timestamp de cancelación
2. **Motivo de cancelación**: Campo para registrar por qué se canceló
3. **Límite de cancelaciones**: Prevenir abuso del sistema
4. **Notificaciones**: Alertar al barbero cuando se cancela una cita

## Resumen

✅ **Problema resuelto sin modificar base de datos**

- Cambio de `deleteCita` → `cancelCita`
- Soft delete en lugar de hard delete
- Mejor UX con estilos para citas canceladas
- Estadísticas precisas en reportes

🔒 **Seguridad mantenida**

- Usa políticas RLS existentes (`UPDATE` permitido)
- No requiere nuevos permisos
- Principio de menor privilegio respetado

📊 **Mejor trazabilidad**

- Historial completo de citas
- Estadísticas de cancelaciones
- Análisis de comportamiento posible
