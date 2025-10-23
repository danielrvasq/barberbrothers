# API y Endpoints - Barbería Brothers

Documentación completa de endpoints y operaciones disponibles en el sistema.

---

## 🔐 Autenticación

Todos los endpoints requieren autenticación via JWT token (provisto por Supabase Auth).

### Headers requeridos

```
Authorization: Bearer <JWT_TOKEN>
apikey: <SUPABASE_ANON_KEY>
```

---

## 📋 User Stories → Endpoints Mapping

### HU-001: Registrar Nuevo Producto en Inventario

**Endpoint**: `POST /rest/v1/products`

**Permisos**: Admin only

**Request Body**:
```json
{
  "name": "Shampoo Premium",
  "description": "Shampoo para cabello 250ml",
  "category": "product",
  "sku": "PROD-001",
  "price": 8.50,
  "cost": 4.00,
  "stock": 50,
  "min_stock": 10
}
```

**Response** (201 Created):
```json
{
  "id": "uuid-here",
  "name": "Shampoo Premium",
  "description": "Shampoo para cabello 250ml",
  "category": "product",
  "sku": "PROD-001",
  "price": 8.50,
  "cost": 4.00,
  "stock": 50,
  "min_stock": 10,
  "created_at": "2025-10-22T10:00:00Z",
  "updated_at": "2025-10-22T10:00:00Z"
}
```

**JavaScript Example**:
```js
const { data, error } = await supabase
  .from('products')
  .insert({
    name: 'Shampoo Premium',
    sku: 'PROD-001',
    price: 8.50,
    stock: 50
  })
  .select()
  .single()
```

---

### HU-002: Búsqueda de Productos en Inventario

**Endpoint**: `GET /rest/v1/products`

**Permisos**: Authenticated users

**Query Parameters**:
- `name=ilike.*search*` - Búsqueda por nombre
- `sku=eq.PROD-001` - Búsqueda exacta por SKU
- `category=eq.product` - Filtro por categoría
- `stock=lt.10` - Productos con stock bajo
- `order=name.asc` - Ordenamiento

**Response** (200 OK):
```json
[
  {
    "id": "uuid-1",
    "name": "Shampoo Premium",
    "sku": "PROD-001",
    "stock": 50,
    "price": 8.50
  },
  {
    "id": "uuid-2",
    "name": "Cera para Cabello",
    "sku": "PROD-002",
    "stock": 30,
    "price": 6.00
  }
]
```

**JavaScript Examples**:
```js
// Búsqueda por nombre
const { data } = await supabase
  .from('products')
  .select('*')
  .ilike('name', '%shampoo%')

// Productos con stock bajo
const { data } = await supabase
  .from('products')
  .select('*')
  .lt('stock', 'min_stock')

// Buscar por SKU
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('sku', 'PROD-001')
  .single()
```

---

### HU-003: Actualización de Productos en Inventario

**Endpoint**: `PATCH /rest/v1/products?id=eq.<product_id>`

**Permisos**: Admin only

**Request Body** (partial update):
```json
{
  "stock": 75,
  "price": 9.00
}
```

**Response** (200 OK):
```json
{
  "id": "uuid-here",
  "name": "Shampoo Premium",
  "stock": 75,
  "price": 9.00,
  "updated_at": "2025-10-22T11:00:00Z"
}
```

**JavaScript Example**:
```js
const { data, error } = await supabase
  .from('products')
  .update({ 
    stock: 75,
    price: 9.00 
  })
  .eq('id', productId)
  .select()
```

---

### HU-004: Eliminar Productos del Inventario

**Endpoint**: `DELETE /rest/v1/products?id=eq.<product_id>`

**Permisos**: Admin only

**Response** (204 No Content)

**JavaScript Example**:
```js
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId)
```

---

### HU-005: Generación de Reportes de Inventario

**Endpoint**: `GET /rest/v1/inventory_transactions`

**Permisos**: Authenticated users (read), Admin (full access)

**Query Parameters**:
- `product_id=eq.<uuid>` - Filtrar por producto
- `type=eq.purchase` - Filtrar por tipo de transacción
- `created_at=gte.2025-10-01` - Filtrar por fecha
- `order=created_at.desc` - Ordenamiento

**Response** (200 OK):
```json
[
  {
    "id": "uuid-1",
    "product_id": "uuid-product",
    "delta": 50,
    "type": "purchase",
    "reason": "Compra mensual",
    "performed_by": "uuid-user",
    "created_at": "2025-10-22T09:00:00Z"
  },
  {
    "id": "uuid-2",
    "product_id": "uuid-product",
    "delta": -5,
    "type": "sale",
    "reason": "Venta al cliente",
    "performed_by": "uuid-user",
    "created_at": "2025-10-22T10:30:00Z"
  }
]
```

**JavaScript Examples**:
```js
// Reporte de transacciones del último mes
const { data } = await supabase
  .from('inventory_transactions')
  .select('*, products(name, sku)')
  .gte('created_at', '2025-10-01')
  .order('created_at', { ascending: false })

// Reporte de un producto específico
const { data } = await supabase
  .from('inventory_transactions')
  .select('*')
  .eq('product_id', productId)

// Sumar entradas y salidas
const { data } = await supabase
  .from('inventory_transactions')
  .select('delta')
  .eq('product_id', productId)

const total = data.reduce((sum, t) => sum + t.delta, 0)
```

**Crear transacción (Admin only)**:
```js
const { data, error } = await supabase
  .from('inventory_transactions')
  .insert({
    product_id: productId,
    delta: 10,
    type: 'purchase',
    reason: 'Reposición de stock',
    performed_by: user.id
  })
```

---

### HU-007: Creación de Citas

**Endpoint**: `POST /rest/v1/appointments`

**Permisos**: Authenticated users (can create for themselves)

**Request Body**:
```json
{
  "customer_id": "uuid-user",
  "service": "Corte de Cabello Clásico",
  "start_at": "2025-10-25T10:00:00Z",
  "end_at": "2025-10-25T10:30:00Z",
  "notes": "Cliente prefiere tijera"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid-appointment",
  "customer_id": "uuid-user",
  "service": "Corte de Cabello Clásico",
  "start_at": "2025-10-25T10:00:00Z",
  "end_at": "2025-10-25T10:30:00Z",
  "status": "scheduled",
  "notes": "Cliente prefiere tijera",
  "created_at": "2025-10-22T12:00:00Z"
}
```

**JavaScript Example**:
```js
const { data, error } = await supabase
  .from('appointments')
  .insert({
    customer_id: user.id,
    service: 'Corte de Cabello Clásico',
    start_at: '2025-10-25T10:00:00Z',
    end_at: '2025-10-25T10:30:00Z'
  })
  .select()
```

---

### HU-008: Actualización de Citas

**Endpoint**: `PATCH /rest/v1/appointments?id=eq.<appointment_id>`

**Permisos**: Owner or Admin

**Request Body**:
```json
{
  "start_at": "2025-10-25T11:00:00Z",
  "notes": "Cliente llegará 10 min tarde"
}
```

**JavaScript Example**:
```js
const { data, error } = await supabase
  .from('appointments')
  .update({
    start_at: '2025-10-25T11:00:00Z',
    notes: 'Cliente llegará tarde'
  })
  .eq('id', appointmentId)
  .select()
```

---

### HU-009: Eliminación de Citas

**Endpoint**: `PATCH /rest/v1/appointments?id=eq.<appointment_id>`

**Permisos**: Owner or Admin

**Request Body** (soft delete - cambiar status):
```json
{
  "status": "canceled"
}
```

**JavaScript Example**:
```js
// Cancelar cita (soft delete)
const { error } = await supabase
  .from('appointments')
  .update({ status: 'canceled' })
  .eq('id', appointmentId)

// Hard delete (admin only)
const { error } = await supabase
  .from('appointments')
  .delete()
  .eq('id', appointmentId)
```

---

### HU-010: Listado de Citas

**Endpoint**: `GET /rest/v1/appointments`

**Permisos**: Authenticated users (see own), Admin (see all)

**Query Parameters**:
- `customer_id=eq.<uuid>` - Filtrar por cliente
- `staff_id=eq.<uuid>` - Filtrar por barbero
- `status=eq.scheduled` - Filtrar por estado
- `start_at=gte.2025-10-25` - Filtrar por fecha
- `order=start_at.asc` - Ordenamiento

**Response** (200 OK):
```json
[
  {
    "id": "uuid-1",
    "customer_id": "uuid-user",
    "service": "Corte de Cabello",
    "start_at": "2025-10-25T10:00:00Z",
    "status": "scheduled"
  },
  {
    "id": "uuid-2",
    "customer_id": "uuid-user",
    "service": "Afeitado Clásico",
    "start_at": "2025-10-26T14:00:00Z",
    "status": "scheduled"
  }
]
```

**JavaScript Examples**:
```js
// Mis citas próximas
const { data } = await supabase
  .from('appointments')
  .select('*')
  .eq('customer_id', user.id)
  .eq('status', 'scheduled')
  .gte('start_at', new Date().toISOString())
  .order('start_at')

// Todas las citas de hoy (admin)
const today = new Date().toISOString().split('T')[0]
const { data } = await supabase
  .from('appointments')
  .select('*, profiles!customer_id(full_name, phone)')
  .gte('start_at', `${today}T00:00:00Z`)
  .lt('start_at', `${today}T23:59:59Z`)
  .order('start_at')
```

---

### HU-012: Inicio de Sesión

**Método**: Google OAuth via Supabase Auth

**JavaScript Example**:
```js
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin
  }
})
```

**Flow**:
1. Usuario hace clic en botón
2. Redirige a Google
3. Usuario autoriza
4. Google redirige a Supabase callback
5. Supabase crea sesión y JWT
6. Frontend recibe evento de auth
7. Frontend hace upsert de `profiles`

---

### HU-013: Cierre de Sesión

**JavaScript Example**:
```js
const { error } = await supabase.auth.signOut()
```

---

### HU-014: Registro de Usuarios

**Método**: Automático via Google OAuth + upsert de profile

**JavaScript Example** (ejecutado automáticamente en AuthContext):
```js
const { data, error } = await supabase
  .from('profiles')
  .upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.name
  })
  .select()
```

---

## 📊 Administración de Usuarios (Admin)

### Listar todos los usuarios

```js
const { data } = await supabase
  .from('profiles')
  .select('*')
  .order('created_at', { ascending: false })
```

### Cambiar rol de usuario (solo desde SQL o admin UI)

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'usuario@example.com';
```

---

## 🔒 Seguridad y RLS

Todas las tablas tienen Row Level Security (RLS) habilitado:

- **profiles**: usuarios ven su perfil; admins ven todos
- **products**: todos leen; solo admins escriben
- **appointments**: usuarios ven/editan las suyas; admins ven todas
- **inventory_transactions**: todos leen; solo admins crean
- **audit_logs**: solo admins leen

Las políticas se aplican automáticamente en todos los endpoints.

---

## 📈 Paginación

Supabase soporta paginación con `range`:

```js
const { data, error, count } = await supabase
  .from('products')
  .select('*', { count: 'exact' })
  .range(0, 9) // primeros 10 resultados

// Página 2
.range(10, 19)
```

---

## 🔍 Filtros Avanzados

```js
// Operadores disponibles
.eq('column', value)        // igual
.neq('column', value)       // no igual
.gt('column', value)        // mayor que
.gte('column', value)       // mayor o igual
.lt('column', value)        // menor que
.lte('column', value)       // menor o igual
.like('column', '%pattern%') // LIKE
.ilike('column', '%pattern%') // ILIKE (case-insensitive)
.is('column', null)         // IS NULL
.in('column', [val1, val2]) // IN
.contains('column', ['val']) // contiene (arrays/jsonb)
.order('column', { ascending: false })
```

---

## ⚠️ Manejo de Errores

Todos los endpoints pueden devolver errores. Siempre verifica `error`:

```js
const { data, error } = await supabase
  .from('products')
  .select('*')

if (error) {
  console.error('Error:', error.message)
  // Manejar error
}
```

Errores comunes:
- `403`: Política RLS denegó acceso (verificar rol)
- `404`: Registro no encontrado
- `409`: Conflicto (ej: SKU duplicado)
- `422`: Validación fallida

---

**Para más información**: https://supabase.com/docs/reference/javascript
