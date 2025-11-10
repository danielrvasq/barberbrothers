# Sistema de Roles y Restricciones de Usuario

## 📋 Resumen

El sistema ahora implementa restricciones de navegación basadas en roles:
- **Usuarios normales (role = 'user')**: Solo acceso a la pantalla de Citas
- **Administradores (role = 'admin')**: Acceso completo a todas las secciones

---

## 🔐 Roles de Usuario

### Usuario Normal (`role = 'user'`)

**Permisos:**
- ✅ Ver sus propias citas
- ✅ Crear nuevas citas
- ✅ Editar sus citas programadas
- ✅ Cancelar sus citas programadas
- ✅ Cerrar sesión

**Restricciones:**
- ❌ No puede acceder a Dashboard/Inicio
- ❌ No puede acceder a Inventario
- ❌ No puede acceder a Barberos
- ❌ No puede acceder a Reportes
- ❌ No puede acceder al Panel de Admin
- ❌ No ve el menú de navegación lateral (sidebar)

**Experiencia de Usuario:**
- Al iniciar sesión, es redirigido automáticamente a `/citas`
- Ve solo una barra superior con:
  - Título: "📅 Mis Citas"
  - Botón: "Cerrar Sesión"
- La página ocupa todo el ancho de la pantalla (sin sidebar)
- Solo puede interactuar con sus citas

### Administrador (`role = 'admin'`)

**Permisos:**
- ✅ Acceso completo a todas las secciones:
  - Dashboard (Inicio)
  - Inventario (productos y servicios)
  - Citas (todas las citas del sistema)
  - Barberos (gestión de barberos)
  - Reportes (estadísticas completas)
  - Panel de Admin
- ✅ Ver y gestionar todos los datos
- ✅ Crear, editar y eliminar recursos
- ✅ Cerrar sesión

**Experiencia de Usuario:**
- Al iniciar sesión, accede al Dashboard
- Ve el menú de navegación lateral (sidebar) completo
- Puede navegar entre todas las secciones
- Tiene acceso a todas las funcionalidades del sistema

---

## 🚀 Implementación Técnica

### 1. Rutas Protegidas (`App.jsx`)

```jsx
// Ruta de inicio - Solo admins pueden ver el Dashboard
<Route path="/" element={
  <ProtectedRoute>
    {isAdmin() ? (
      <Layout pageTitle="Inicio">
        <LandingPage />
      </Layout>
    ) : (
      <Navigate to="/citas" replace />
    )}
  </ProtectedRoute>
} />

// Rutas solo para administradores
<Route path="/inventario" element={
  <ProtectedRoute adminOnly>
    <Layout pageTitle="Inventario">
      <InventoryPage />
    </Layout>
  </ProtectedRoute>
} />

// Ruta de citas - Accesible para todos
<Route path="/citas" element={
  <ProtectedRoute>
    <Layout pageTitle="Citas">
      <CitasPage />
    </Layout>
  </ProtectedRoute>
} />
```

### 2. Redirección Automática

```jsx
// Al hacer login
<Route path="/login" element={
  user ? (
    <Navigate to={isAdmin() ? "/" : "/citas"} replace />
  ) : (
    <LoginPage />
  )
} />

// Rutas no encontradas
<Route path="*" element={
  user ? (
    <Navigate to={isAdmin() ? "/" : "/citas"} replace />
  ) : (
    <Navigate to="/login" replace />
  )
} />
```

### 3. Protección de Rutas (`ProtectedRoute.jsx`)

```jsx
if (adminOnly && profile?.role !== "admin") {
  // Redirigir usuarios normales a su pantalla de citas
  return <Navigate to="/citas" replace />;
}
```

### 4. Layout Adaptativo (`Layout.jsx`)

```jsx
const showSidebar = isAdmin(); // Solo mostrar sidebar para admins

// Sidebar solo visible para admins
{showSidebar && (
  <aside className="layout-sidebar">
    {/* Menú de navegación */}
  </aside>
)}

// Barra superior para usuarios normales
{!showSidebar && (
  <div style={{ /* estilos */ }}>
    <h1>📅 Mis Citas</h1>
    <button onClick={handleLogout}>
      Cerrar Sesión
    </button>
  </div>
)}
```

### 5. Estilos CSS

```css
/* Layout sin sidebar para usuarios normales */
.layout-main.no-sidebar {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
```

---

## 🔄 Flujo de Navegación

### Usuario Normal

```
Login ──> /citas (única pantalla accesible)
  │
  ├─ Intenta acceder a /inventario ──> Redirige a /citas
  ├─ Intenta acceder a /barberos ──> Redirige a /citas
  ├─ Intenta acceder a /reportes ──> Redirige a /citas
  ├─ Intenta acceder a / ──> Redirige a /citas
  └─ Cierra sesión ──> /login
```

### Administrador

```
Login ──> / (Dashboard)
  │
  ├─ Navega a /inventario ──> ✅ Acceso permitido
  ├─ Navega a /citas ──> ✅ Acceso permitido
  ├─ Navega a /barberos ──> ✅ Acceso permitido
  ├─ Navega a /reportes ──> ✅ Acceso permitido
  ├─ Navega a /admin ──> ✅ Acceso permitido
  └─ Cierra sesión ──> /login
```

---

## 🔧 Configuración de Roles

### Crear Usuario Administrador

Después del primer login, ejecutar en Supabase SQL Editor:

```sql
-- Verificar email del usuario
SELECT id, email, role FROM profiles;

-- Asignar rol de administrador
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### Verificar Rol Actual

```sql
-- Ver todos los usuarios y sus roles
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;
```

### Cambiar Rol de Usuario

```sql
-- Degradar de admin a user
UPDATE profiles 
SET role = 'user' 
WHERE email = 'usuario@example.com';

-- Promover de user a admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'usuario@example.com';
```

---

## 📊 Políticas RLS (Row Level Security)

### Tabla: `appointments`

```sql
-- Usuarios pueden ver sus propias citas
CREATE POLICY "appointments_customer_select" ON appointments
  FOR SELECT
  USING (customer_id = auth.uid());

-- Usuarios pueden crear citas para sí mismos
CREATE POLICY "appointments_customer_insert" ON appointments
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Usuarios pueden actualizar (cancelar) sus propias citas
CREATE POLICY "appointments_customer_update" ON appointments
  FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Admins tienen acceso completo
CREATE POLICY "appointments_admin_access" ON appointments
  FOR ALL
  USING (is_admin());
```

### Función Helper: `is_admin()`

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🧪 Testing

### Casos de Prueba - Usuario Normal

1. **Login y redirección**
   - ✅ Al hacer login, debe ser redirigido a `/citas`
   - ✅ No debe ver el sidebar
   - ✅ Debe ver barra superior con "Mis Citas" y "Cerrar Sesión"

2. **Intentos de navegación directa**
   - ✅ URL: `/` → Redirige a `/citas`
   - ✅ URL: `/inventario` → Redirige a `/citas`
   - ✅ URL: `/barberos` → Redirige a `/citas`
   - ✅ URL: `/reportes` → Redirige a `/citas`
   - ✅ URL: `/admin` → Redirige a `/citas`
   - ✅ URL: `/ruta-inexistente` → Redirige a `/citas`

3. **Funcionalidad de citas**
   - ✅ Puede ver sus propias citas
   - ✅ Puede crear nuevas citas
   - ✅ Puede editar citas programadas
   - ✅ Puede cancelar citas programadas
   - ❌ No puede ver citas de otros usuarios (RLS)

4. **Cierre de sesión**
   - ✅ Botón "Cerrar Sesión" funciona
   - ✅ Redirige a `/login` después de cerrar sesión

### Casos de Prueba - Administrador

1. **Login y redirección**
   - ✅ Al hacer login, accede al Dashboard (`/`)
   - ✅ Ve el sidebar completo con todas las opciones
   - ✅ Sidebar funciona en hover (se expande)

2. **Navegación completa**
   - ✅ Puede acceder a `/inventario`
   - ✅ Puede acceder a `/citas`
   - ✅ Puede acceder a `/barberos`
   - ✅ Puede acceder a `/reportes`
   - ✅ Puede acceder a `/admin`

3. **Funcionalidad completa**
   - ✅ Ve todas las citas del sistema
   - ✅ Ve estadísticas en Dashboard
   - ✅ Puede gestionar inventario
   - ✅ Puede gestionar barberos
   - ✅ Puede ver reportes completos

### Script de Testing Manual

```javascript
// En la consola del navegador (después de login)

// 1. Verificar rol actual
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();
console.log('Rol actual:', profile.role);

// 2. Verificar redirecciones
const routes = ['/', '/inventario', '/barberos', '/reportes', '/admin'];
routes.forEach(route => {
  console.log(`Navegando a ${route}...`);
  window.location.href = route;
  // Verificar si redirige a /citas (para users) o permite acceso (para admins)
});
```

---

## 🎨 Diferencias Visuales

### Pantalla de Usuario Normal

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  📅 Mis Citas                  [ Cerrar Sesión ]  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │         CONTENIDO DE CITAS                        │ │
│  │         (CitasPage.jsx)                           │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Pantalla de Administrador

```
┌──────┬──────────────────────────────────────────────────┐
│      │                                                  │
│  🏠  │  ┌────────────────────────────────────────────┐ │
│      │  │                                            │ │
│  📦  │  │        CONTENIDO DE LA PÁGINA              │ │
│      │  │        (LandingPage, InventoryPage, etc.)  │ │
│  📅  │  │                                            │ │
│      │  └────────────────────────────────────────────┘ │
│  ✂️  │                                                  │
│      │                                                  │
│  📊  │                                                  │
│      │                                                  │
│  👑  │  (Sidebar con hover expandible)                 │
│      │                                                  │
│  🚪  │                                                  │
│      │                                                  │
└──────┴──────────────────────────────────────────────────┘
```

---

## 🔐 Seguridad

### Capas de Protección

1. **Frontend (React Router)**
   - Redirecciones automáticas basadas en rol
   - Componente `ProtectedRoute` con validación
   - Layout adaptativo según rol

2. **Backend (Supabase RLS)**
   - Políticas de seguridad a nivel de base de datos
   - Los usuarios solo ven/modifican sus propios datos
   - Admins tienen acceso completo mediante función `is_admin()`

3. **Autenticación (Supabase Auth)**
   - Google OAuth para login seguro
   - Sesiones gestionadas por Supabase
   - Tokens JWT validados en cada request

### Buenas Prácticas Implementadas

- ✅ **Principio de menor privilegio**: Usuarios solo ven lo necesario
- ✅ **Validación en frontend y backend**: Doble capa de seguridad
- ✅ **Redirecciones automáticas**: Previene acceso no autorizado
- ✅ **RLS activo**: Protección a nivel de base de datos
- ✅ **Roles en tabla profiles**: Gestión centralizada de permisos

---

## 📝 Notas de Implementación

### Archivos Modificados

1. **`frontend/src/App.jsx`**
   - Agregado `isAdmin()` en destructuring de `useAuth`
   - Redirecciones condicionales en rutas `/`, `/login`, `*`
   - Prop `adminOnly` en rutas protegidas

2. **`frontend/src/components/layout/Layout.jsx`**
   - Variable `showSidebar` basada en `isAdmin()`
   - Sidebar y botón móvil condicionales
   - Barra superior para usuarios normales
   - Clase `no-sidebar` en `layout-main`

3. **`frontend/src/components/layout/Layout.css`**
   - Estilos para `.layout-main.no-sidebar`
   - Centrado y ancho máximo para vista sin sidebar

4. **`frontend/src/components/common/ProtectedRoute.jsx`**
   - Redirección a `/citas` en lugar de mostrar mensaje de error
   - Simplificación de lógica de acceso denegado

### Compatibilidad

- ✅ Responsive: Funciona en móvil, tablet y desktop
- ✅ Sin sidebar en móvil para usuarios normales
- ✅ Experiencia consistente en todos los dispositivos
- ✅ Mantiene funcionalidad de hover en sidebar para admins

---

## 🚀 Siguientes Pasos (Opcional)

### Mejoras Futuras

1. **Roles Adicionales**
   - `barber`: Barberos pueden ver sus citas asignadas
   - `receptionist`: Recepcionistas pueden gestionar citas de todos

2. **Permisos Granulares**
   - Tabla `permissions` con permisos específicos
   - Relación many-to-many entre roles y permisos

3. **Notificaciones**
   - Notificar a barberos cuando se crea/cancela una cita
   - Recordatorios automáticos para usuarios

4. **Logs de Auditoría**
   - Registrar intentos de acceso no autorizado
   - Historial de cambios en permisos

5. **UI Mejorada**
   - Mensajes toast cuando se bloquea acceso
   - Animaciones de transición entre pantallas
   - Modo oscuro

---

## 📚 Recursos

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/overview#protected-routes)
- [Role-Based Access Control (RBAC)](https://en.wikipedia.org/wiki/Role-based_access_control)

---

**Implementado el 10 de noviembre de 2025**
