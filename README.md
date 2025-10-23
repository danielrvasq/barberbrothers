# Barbería Brothers 💈# 🔷 Barbería Brothers - Sistema de Gestión Integral



Sistema de Gestión Integral para Barberías desarrollado con React + Vite y Supabase.Sistema completo de gestión para barberías que incluye:

- 📦 **Inventario**: Gestión de productos y stock

## 🚀 Características- 📅 **Citas**: Programación y seguimiento de citas

- 📊 **Reportes**: Generación de informes de inventario y actividad

- **Autenticación**: Login con Google OAuth- 👥 **Usuarios**: Autenticación con Google OAuth y roles (admin/usuario)

- **Gestión de Inventario**: Control de productos y stock

- **Sistema de Citas**: Reservas y calendario de citas## 🛠️ Stack Tecnológico

- **Reportes**: Estadísticas y análisis de ventas

- **Panel Admin**: Gestión de usuarios y roles- **Frontend**: React 19 + Vite

- **Responsive**: Diseño optimizado para móviles y escritorio- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage)

- **Autenticación**: Google OAuth via Supabase Auth

## 🛠️ Tecnologías- **Despliegue**: Vercel (Frontend)

- **Routing**: React Router v6

- **Frontend**: React 19 + Vite

- **Backend**: Supabase (PostgreSQL + Auth)---

- **Routing**: React Router v6

- **Icons**: Lucide React + Emojis## 📋 Requisitos Previos

- **Deployment**: Vercel

1. **Node.js** (v18 o superior)

## 📦 Instalación Local2. **Cuenta en Supabase** (https://supabase.com) - Gratis

3. **Cuenta en Vercel** (https://vercel.com) - Gratis

1. Clona el repositorio:4. **Google Cloud Console** para crear credenciales OAuth

```bash

git clone https://github.com/danielrvasq/barberbrothers.git---

cd barberbrothers

```## 🚀 Instalación y Configuración Local



2. Instala las dependencias:### Paso 1: Clonar el repositorio

```bash

cd frontend```bash

npm installgit clone <tu-repositorio>

```cd barberbrothers/frontend

```

3. Configura las variables de entorno:

Crea un archivo `.env` en la carpeta `frontend/`:### Paso 2: Instalar dependencias

```env

VITE_SUPABASE_URL=tu_supabase_url```bash

VITE_SUPABASE_ANON_KEY=tu_supabase_anon_keynpm install

``````



4. Ejecuta el servidor de desarrollo:### Paso 3: Crear proyecto en Supabase

```bash

npm run dev1. Ve a https://app.supabase.com

```2. Crea un nuevo proyecto

3. Anota:

La aplicación estará disponible en `http://localhost:5174`   - **Project URL**: `https://<tu-proyecto>.supabase.co`

   - **Anon/Public Key**: encontrada en Settings → API

## 🗄️ Base de Datos

### Paso 4: Configurar Google OAuth

El esquema de la base de datos está en `database/migrations/002_fix_schema.sql`

#### 4.1 Crear credenciales en Google Cloud Console

Para configurar la base de datos:

1. Ve a tu proyecto de Supabase1. Ve a https://console.cloud.google.com/apis/credentials

2. Abre el SQL Editor2. Crea un nuevo proyecto o selecciona uno existente

3. Ejecuta el script `002_fix_schema.sql`3. Haz clic en **"Crear credenciales"** → **"ID de cliente de OAuth 2.0"**

4. Tipo de aplicación: **Aplicación web**

### Crear usuario Admin5. **Orígenes autorizados de JavaScript**:

   - `http://localhost:5173`

Después del primer login, ejecuta en Supabase SQL Editor:   - `https://tu-app.vercel.app` (tu dominio de producción)

```sql6. **URIs de redirección autorizados**:

UPDATE profiles SET role = 'admin' WHERE email = 'tu-email@gmail.com';   - `https://<tu-proyecto>.supabase.co/auth/v1/callback`

```7. Copia el **Client ID** y **Client Secret**



## 🚀 Despliegue en Vercel#### 4.2 Configurar en Supabase



1. Conecta tu repositorio de GitHub con Vercel1. En Supabase Dashboard → **Authentication** → **Settings** → **Auth Providers**

2. Configura las variables de entorno en Vercel:2. Busca **Google** y actívalo

   - `VITE_SUPABASE_URL`3. Pega el **Client ID** y **Client Secret** de Google

   - `VITE_SUPABASE_ANON_KEY`4. Guarda los cambios

3. Deploy!

### Paso 5: Crear las tablas en Supabase

## 📱 Configuración de Google OAuth

1. En Supabase Dashboard → **SQL Editor**

### Para Desarrollo Local:2. Abre el archivo `database/migrations/001_initial_schema.sql`

En Supabase → Authentication → URL Configuration:3. Copia todo el contenido y pégalo en el SQL Editor

- Site URL: `http://localhost:5174`4. Ejecuta el script (Run)

- Redirect URLs: `http://localhost:5174/**`

Esto creará:

### Para Producción:- Tablas: `profiles`, `products`, `appointments`, `inventory_transactions`, `audit_logs`

En Supabase → Authentication → URL Configuration:- Políticas RLS (Row Level Security)

- Site URL: `https://tu-app.vercel.app`- Triggers y funciones

- Redirect URLs: `https://tu-app.vercel.app/**`- Datos de ejemplo (servicios y productos iniciales)



En Google Cloud Console:### Paso 6: Configurar variables de entorno

- Authorized redirect URIs: `https://[tu-proyecto].supabase.co/auth/v1/callback`

1. Crea un archivo `.env` en la carpeta `frontend/`:

## 📄 Licencia

```bash

MITVITE_SUPABASE_URL=https://tu-proyecto.supabase.co

VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

## 👨‍💻 Autor```



Daniel Vásquez2. Reemplaza con tus valores reales de Supabase


### Paso 7: Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en http://localhost:5173

### Paso 8: Crear el primer usuario administrador

1. Inicia sesión con tu cuenta de Google
2. Ve a Supabase Dashboard → **SQL Editor** y ejecuta:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'tu-email@gmail.com';
```

---

## 🌐 Despliegue en Vercel

### Paso 1: Preparar el proyecto para producción

Asegúrate de que:
- `.env` está en `.gitignore` (no subir credenciales)
- `.env.example` está actualizado con las variables necesarias

### Paso 2: Importar proyecto en Vercel

1. Ve a https://vercel.com
2. Haz clic en **"Add New..."** → **"Project"**
3. Importa tu repositorio desde GitHub/GitLab/Bitbucket
4. **Root Directory**: selecciona `frontend`
5. **Framework Preset**: Vite
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`

### Paso 3: Configurar Variables de Entorno en Vercel

En el proyecto de Vercel → **Settings** → **Environment Variables**, agrega:

| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `tu-anon-key` |

### Paso 4: Actualizar Google OAuth con dominio de producción

1. Ve a Google Cloud Console → Credenciales
2. Edita tu OAuth 2.0 Client ID
3. Agrega en **Orígenes autorizados de JavaScript**:
   - `https://tu-app.vercel.app`
4. Verifica que la URI de redirección de Supabase siga en la lista:
   - `https://tu-proyecto.supabase.co/auth/v1/callback`

### Paso 5: Deploy

1. Haz push a tu repositorio:

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. Vercel desplegará automáticamente
3. Accede a tu app en `https://tu-app.vercel.app`

---

## 📊 Estructura del Proyecto

```
barberbrothers/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginWithGoogle.jsx    # Botón de login Google
│   │   │   ├── ProtectedRoute.jsx     # HOC para rutas protegidas
│   │   │   └── UserProfile.jsx        # Componente de perfil
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx        # Context de autenticación
│   │   ├── lib/
│   │   │   └── supabaseClient.js      # Cliente de Supabase
│   │   ├── App.jsx                    # Componente principal
│   │   ├── main.jsx                   # Entry point
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── migrations/
│       └── 001_initial_schema.sql     # Schema inicial
└── README.md
```

---

## 🔐 Autenticación y Roles

### Roles disponibles

- **user**: Usuario normal (puede ver productos, crear/ver sus citas)
- **admin**: Administrador (acceso completo a inventario, citas, usuarios)

### Flujo de autenticación

1. Usuario hace clic en "Iniciar sesión con Google"
2. Supabase redirige a Google OAuth
3. Usuario autoriza la aplicación
4. Supabase crea el usuario en `auth.users`
5. Frontend hace upsert automático en `profiles`
6. Usuario accede a la aplicación

### Políticas RLS (Row Level Security)

- **Profiles**: usuarios ven/editan su perfil; admins ven todos
- **Products**: todos ven productos; solo admins pueden crear/editar/eliminar
- **Appointments**: usuarios ven/crean/editan sus citas; admins acceso completo
- **Inventory Transactions**: todos ven; solo admins crean transacciones
- **Audit Logs**: solo admins

---

## 🎯 User Stories Implementadas

### Autenticación
- ✅ **HU-012**: Inicio de Sesión con Google OAuth
- ✅ **HU-013**: Cierre de Sesión
- ✅ **HU-014**: Registro de Usuarios (automático con Google)

### Inventario
- ✅ **HU-001**: Registrar Nuevo Producto en Inventario
- ✅ **HU-002**: Búsqueda de Productos en Inventario
- ✅ **HU-003**: Actualización de Productos en Inventario
- ✅ **HU-004**: Eliminar Productos del Inventario
- ✅ **HU-005**: Generación de Reportes de Inventario

### Citas
- ✅ **HU-007**: Creación de Citas
- ✅ **HU-008**: Actualización de Citas
- ✅ **HU-009**: Eliminación de Citas
- ✅ **HU-010**: Listado de Citas

---

## 🔌 API / Endpoints (Supabase)

### Autenticación

```js
// Login con Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})

// Logout
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### Profiles

```js
// Upsert profile
await supabase.from('profiles').upsert({
  id: user.id,
  email: user.email,
  full_name: 'Nombre Completo'
})

// Get profile
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()

// Update role (solo admin desde SQL o admin UI)
await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', userId)
```

### Products

```js
// Listar productos
const { data } = await supabase
  .from('products')
  .select('*')
  .order('name')

// Crear producto (admin only)
const { data, error } = await supabase
  .from('products')
  .insert({
    name: 'Producto Nuevo',
    price: 10.00,
    stock: 50,
    sku: 'PROD-001'
  })

// Actualizar producto (admin only)
await supabase
  .from('products')
  .update({ stock: 100 })
  .eq('id', productId)

// Eliminar producto (admin only)
await supabase
  .from('products')
  .delete()
  .eq('id', productId)
```

### Appointments

```js
// Crear cita
const { data } = await supabase
  .from('appointments')
  .insert({
    customer_id: user.id,
    service: 'Corte de Cabello',
    start_at: '2025-10-25T10:00:00Z',
    status: 'scheduled'
  })

// Listar mis citas
const { data } = await supabase
  .from('appointments')
  .select('*')
  .eq('customer_id', user.id)
  .order('start_at')

// Actualizar cita
await supabase
  .from('appointments')
  .update({ status: 'completed' })
  .eq('id', appointmentId)

// Cancelar cita
await supabase
  .from('appointments')
  .update({ status: 'canceled' })
  .eq('id', appointmentId)
```

### Inventory Transactions

```js
// Registrar transacción (admin only)
const { data } = await supabase
  .from('inventory_transactions')
  .insert({
    product_id: productId,
    delta: 10, // positivo para entrada, negativo para salida
    type: 'purchase',
    reason: 'Compra de inventario',
    performed_by: user.id
  })

// Listar transacciones de un producto
const { data } = await supabase
  .from('inventory_transactions')
  .select('*, products(name)')
  .eq('product_id', productId)
  .order('created_at', { ascending: false })
```

---

## 🧪 Testing

### Verificaciones rápidas

1. **Login Google**: clic en botón → redirige a Google → vuelve autenticado
2. **Profile upsert**: verifica en Supabase que `profiles` tiene el usuario
3. **RLS**: intenta crear producto con usuario normal → debe fallar
4. **Admin access**: asigna role admin y verifica acceso a `/admin`

### SQL para verificar datos

```sql
-- Ver usuarios
SELECT id, email FROM auth.users LIMIT 10;

-- Ver profiles
SELECT * FROM profiles LIMIT 10;

-- Ver productos
SELECT * FROM products;

-- Ver citas
SELECT * FROM appointments;

-- Ver transacciones de inventario
SELECT * FROM inventory_transactions;
```

---

## 🔧 Troubleshooting

### Error: "Invalid redirect URI"
- Verifica que la URI de callback de Supabase esté en Google Console
- Formato: `https://<proyecto>.supabase.co/auth/v1/callback`

### Error: "Missing environment variables"
- Verifica que `.env` tenga `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- En Vercel, verifica Environment Variables

### Error: "Row Level Security policy violation"
- Verifica que las políticas RLS estén creadas (ejecuta migration)
- Verifica el rol del usuario (`SELECT * FROM profiles WHERE id = auth.uid()`)

### No puedo crear productos
- Verifica que tu usuario tenga `role = 'admin'` en `profiles`
- Ejecuta: `UPDATE profiles SET role = 'admin' WHERE email = 'tu-email';`

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de React Router](https://reactrouter.com/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📧 Soporte

Para preguntas o problemas, abre un issue en el repositorio.

---

**Desarrollado con ❤️ para Barbería Brothers**
