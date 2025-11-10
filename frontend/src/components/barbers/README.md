# Módulo de Barberos

Este módulo permite administrar los barberos de la barbería, incluyendo sus datos personales, especialidades y estado de actividad.

## Componentes

### `BarbersPage`

Página principal que muestra la lista de barberos y permite administrarlos (solo admins).

**Características:**

- Lista de barberos en formato de cards responsivos
- Filtrado automático: usuarios ven solo activos, admins ven todos
- Formulario de creación/edición inline
- Activar/desactivar barberos
- Toast notifications para feedback

**Permisos:**

- Usuarios: Ver barberos activos
- Admins: Ver todos, crear, editar, activar/desactivar

### `BarberCard`

Card que muestra la información de un barbero.

**Props:**

- `barber`: Objeto con datos del barbero
- `onEdit`: Callback para editar (solo admin)
- `onToggleActive`: Callback para cambiar estado (solo admin)
- `isAdmin`: Boolean para mostrar/ocultar acciones

**Información mostrada:**

- Avatar con icono
- Nombre y especialidad
- Badge de estado (Activo/Inactivo)
- Teléfono y email
- Biografía
- Botones de acción (solo admin)

### `BarberForm`

Formulario para crear o editar barberos.

**Props:**

- `initialData`: Datos iniciales para edición (null para crear)
- `onSave`: Callback con el payload a guardar
- `onCancel`: Callback para cancelar

**Campos:**

- Nombre\* (requerido, max 100 chars)
- Teléfono (opcional, max 20 chars)
- Email (opcional, max 100 chars)
- Especialidad (opcional, max 100 chars)
- Biografía (opcional, max 500 chars, textarea)
- Activo (checkbox)

**Validación:**

- Nombre es obligatorio
- Email debe ser válido si se proporciona
- Teléfono con formato tel

## Servicio: `barbersService.js`

### Funciones disponibles:

```javascript
// Obtener barberos (active=true por default, o todos si includeInactive=true)
getBarbers((includeInactive = false));

// Obtener un barbero por ID
getBarberById(id);

// Obtener horarios de un barbero
getBarberSchedules(barberId);

// Verificar disponibilidad (usa función PostgreSQL)
checkBarberAvailability(barberId, startAt);

// Verificar conflictos de citas (usa función PostgreSQL)
checkAppointmentConflict(
  barberId,
  startAt,
  (durationMinutes = 30),
  (excludeAppointmentId = null)
);

// Crear barbero (solo admin)
createBarber(barber);

// Actualizar barbero (solo admin)
updateBarber(id, updates);

// Desactivar barbero (solo admin)
deactivateBarber(id);
```

## Base de Datos

### Tabla: `barbers`

```sql
CREATE TABLE barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text,
  email text,
  specialty text,
  bio text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### Políticas RLS:

- **Lectura**: Usuarios autenticados pueden ver barberos activos
- **Escritura**: Solo admins pueden crear/editar/desactivar

## Ruta

```
/barberos
```

Accesible para todos los usuarios autenticados. Las acciones de administración solo están disponibles para admins.

## Flujo de Uso

1. **Usuario normal:**

   - Ve la lista de barberos activos
   - No ve botones de administración
   - Puede ver información de contacto y especialidades

2. **Admin:**
   - Ve todos los barberos (activos e inactivos)
   - Puede hacer clic en "Agregar Barbero"
   - Puede editar barberos existentes
   - Puede activar/desactivar barberos
   - Recibe notificaciones toast de las acciones

## Integración con Citas

Los barberos se usan en el módulo de citas:

- `CitaForm` carga la lista de barberos activos
- Se valida disponibilidad antes de crear citas
- Se verifica conflictos de horarios

## Estilos

Usa el sistema de diseño de la plantilla:

- Variables CSS de `styles/variables.css`
- Componentes comunes (Button, Card, Toast)
- Layout responsivo con grid

## Próximas Mejoras

- [ ] Subir foto de perfil del barbero
- [ ] Gestión de horarios individuales por barbero
- [ ] Estadísticas de citas por barbero
- [ ] Comisiones y reportes de ganancias
- [ ] Vincular barberos con usuarios del sistema (profile_id)
