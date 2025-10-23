# 🚀 Guía de Despliegue en Vercel - Paso a Paso

Esta guía te llevará desde cero hasta tener tu aplicación desplegada en Vercel con Supabase y Google OAuth funcionando.

---

## ✅ Prerrequisitos Completados

Antes de desplegar, asegúrate de haber completado:

- [x] Proyecto Supabase creado
- [x] Credenciales de Google OAuth configuradas
- [x] Base de datos y tablas creadas (migration ejecutada)
- [x] Primer usuario admin creado
- [x] Aplicación funcionando localmente

---

## 📋 Paso 1: Preparar el Repositorio

### 1.1 Verificar estructura del proyecto

Tu proyecto debe tener esta estructura:

```
barberbrothers/
├── frontend/              ← Root directory para Vercel
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example       ← Template de variables
├── database/
│   └── migrations/
└── README.md
```

### 1.2 Verificar .gitignore

Asegúrate de que `.env` y archivos sensibles estén en `.gitignore`:

```gitignore
# Secrets
.env
.env.local
*.local

# Google OAuth credentials (si tienes archivo JSON)
client_secret_*.json

# Dependencies
node_modules/
dist/

# Vercel
.vercel
```

### 1.3 Push a GitHub/GitLab/Bitbucket

```bash
# Inicializar git si no lo has hecho
git init
git add .
git commit -m "Initial commit - Barbería Brothers"

# Agregar remote (reemplaza con tu URL)
git remote add origin https://github.com/tu-usuario/barberbrothers.git
git branch -M main
git push -u origin main
```

---

## 🌐 Paso 2: Crear Proyecto en Vercel

### 2.1 Acceder a Vercel

1. Ve a https://vercel.com
2. Inicia sesión con GitHub/GitLab/Bitbucket
3. Haz clic en **"Add New..."** → **"Project"**

### 2.2 Importar Repositorio

1. Selecciona tu repositorio `barberbrothers`
2. Si no aparece, haz clic en **"Adjust GitHub App Permissions"** y autoriza el acceso

### 2.3 Configurar el Proyecto

En la pantalla de configuración:

**Project Name**: `barberbrothers` (o el que prefieras)

**Framework Preset**: 
- Selecciona **Vite**

**Root Directory**:
- Haz clic en **"Edit"**
- Selecciona `frontend`
- Muy importante: ✅ **Include source files outside of the Root Directory in the Build Step**

**Build and Output Settings**:
- **Build Command**: `npm run build` (auto-detectado)
- **Output Directory**: `dist` (auto-detectado)
- **Install Command**: `npm install` (auto-detectado)

### 2.4 NO DESPLEGAR TODAVÍA

⚠️ **IMPORTANTE**: NO hagas clic en "Deploy" todavía. Primero debemos configurar las variables de entorno.

Haz clic en **"Environment Variables"** o deja la ventana abierta.

---

## 🔐 Paso 3: Configurar Variables de Entorno

### 3.1 Agregar Variables en Vercel

En la sección **Environment Variables**, agrega:

| Key | Value | Environments |
|-----|-------|--------------|
| `VITE_SUPABASE_URL` | `https://tu-proyecto.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `tu-anon-key-de-supabase` | Production, Preview, Development |

**Cómo obtener estos valores**:

1. Ve a Supabase Dashboard → Settings → API
2. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** → `anon` `public` → `VITE_SUPABASE_ANON_KEY`

⚠️ **Nunca uses el `service_role` key en el frontend**

### 3.2 Verificar Variables

- Asegúrate de que ambas variables estén seleccionadas para **Production**, **Preview** y **Development**
- Haz clic en **"Add"** para cada variable

---

## 🚀 Paso 4: Desplegar

### 4.1 Primera Deployment

1. Ahora sí, haz clic en **"Deploy"**
2. Vercel comenzará a:
   - Clonar tu repositorio
   - Instalar dependencias (`npm install`)
   - Ejecutar build (`npm run build`)
   - Desplegar a CDN

3. Espera 1-3 minutos

### 4.2 Verificar Build

Si el build falla:
- Revisa los logs en Vercel
- Errores comunes:
  - Missing dependencies → ejecuta `npm install` localmente primero
  - Build errors → verifica que `npm run build` funcione localmente
  - Root directory incorrecto → debe ser `frontend`

### 4.3 Obtener URL de Producción

Una vez completado:
- Vercel te dará una URL: `https://barberbrothers-xxx.vercel.app`
- También puedes configurar un dominio personalizado después

---

## 🔗 Paso 5: Actualizar Google OAuth

### 5.1 Agregar Dominio de Producción

1. Ve a Google Cloud Console → Credenciales
2. Edita tu **OAuth 2.0 Client ID**
3. En **Authorized JavaScript origins**, agrega:
   ```
   https://barberbrothers-xxx.vercel.app
   ```
   (reemplaza con tu URL real de Vercel)

4. En **Authorized redirect URIs**, verifica que esté:
   ```
   https://tu-proyecto.supabase.co/auth/v1/callback
   ```

5. Haz clic en **"Save"**

⚠️ **Importante**: Los cambios en Google pueden tardar 5-10 minutos en propagarse

---

## 🧪 Paso 6: Probar en Producción

### 6.1 Acceder a la App

1. Ve a tu URL de Vercel: `https://barberbrothers-xxx.vercel.app`
2. Deberías ver la pantalla de login

### 6.2 Probar Login con Google

1. Haz clic en **"Iniciar sesión con Google"**
2. Selecciona tu cuenta de Google
3. Autoriza la aplicación
4. Deberías ser redirigido de vuelta a la app, ya autenticado

### 6.3 Verificar Profile

1. Ve a Supabase Dashboard → Table Editor → `profiles`
2. Deberías ver tu usuario con el email y nombre de Google

### 6.4 Probar Funcionalidades

- [ ] Ver productos
- [ ] Crear cita (usuario normal)
- [ ] Acceder a `/admin` (si eres admin)
- [ ] Cerrar sesión

---

## 🔧 Paso 7: Configuraciones Adicionales (Opcional)

### 7.1 Dominio Personalizado

1. En Vercel → Settings → Domains
2. Agrega tu dominio (ej: `barberia.com`)
3. Configura los DNS según las instrucciones de Vercel
4. **Importante**: Actualiza Google OAuth con el nuevo dominio

### 7.2 Environment Variables por Entorno

Si quieres diferentes configs para Preview y Production:

1. Puedes crear otro proyecto de Supabase para staging
2. Configurar variables específicas para cada entorno en Vercel

### 7.3 Redirects y Rewrites

Si necesitas configurar redirects, crea `vercel.json` en `frontend/`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

(Normalmente no es necesario para Vite + React Router)

---

## 🔄 Paso 8: Actualizaciones Continuas

### 8.1 Automatic Deployments

Vercel despliega automáticamente cuando haces push a `main`:

```bash
git add .
git commit -m "Nueva funcionalidad"
git push origin main
```

Vercel detecta el cambio y redespliega automáticamente.

### 8.2 Preview Deployments

Cada Pull Request genera un preview deployment:

```bash
git checkout -b feature/nueva-funcion
git add .
git commit -m "WIP: nueva función"
git push origin feature/nueva-funcion
```

Abre un PR en GitHub → Vercel genera URL de preview automáticamente.

### 8.3 Rollback

Si algo sale mal:

1. Ve a Vercel Dashboard → Deployments
2. Encuentra el deployment anterior que funcionaba
3. Haz clic en los 3 puntos → **"Promote to Production"**

---

## ⚠️ Troubleshooting

### Error: "Failed to compile"

**Causa**: Error en el código TypeScript/JavaScript

**Solución**:
1. Ejecuta `npm run build` localmente
2. Corrige los errores
3. Push de nuevo

### Error: "Module not found"

**Causa**: Dependencia faltante en `package.json`

**Solución**:
```bash
cd frontend
npm install <paquete-faltante> --save
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

### Error: "Invalid redirect URI" al hacer login

**Causa**: El dominio de Vercel no está en Google OAuth

**Solución**:
1. Ve a Google Cloud Console
2. Agrega la URL exacta de Vercel a Authorized JavaScript origins
3. Espera 5-10 minutos
4. Limpia cache del navegador e intenta de nuevo

### Error: "Missing environment variables"

**Causa**: Variables no configuradas en Vercel

**Solución**:
1. Vercel → Settings → Environment Variables
2. Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
3. Haz clic en **"Redeploy"** en el último deployment

### Login funciona en local pero no en producción

**Causa**: Redirect URIs incorrectas

**Solución**:
1. Verifica que la callback URI de Supabase esté en Google:
   `https://<proyecto>.supabase.co/auth/v1/callback`
2. Verifica que el dominio de Vercel esté en Authorized JavaScript origins
3. Limpia cookies y cache del navegador

### App carga pero muestra pantalla blanca

**Causa**: Posible error de runtime no capturado

**Solución**:
1. Abre DevTools (F12) → Console
2. Revisa errores
3. Verifica que las variables de entorno estén correctas
4. Verifica que el build se completó exitosamente en Vercel

---

## 📊 Monitoreo y Analytics

### Vercel Analytics (opcional)

1. Ve a Vercel → Analytics
2. Habilita Web Analytics (gratis para proyectos pequeños)
3. Ve métricas de rendimiento, tráfico, etc.

### Supabase Logs

1. Ve a Supabase → Logs
2. Revisa:
   - Auth logs (logins, signups)
   - Database logs (queries, errors)
   - API logs

---

## 🎯 Checklist Final

Antes de considerar el despliegue completo:

- [ ] App desplegada en Vercel
- [ ] Login con Google funciona en producción
- [ ] Variables de entorno configuradas
- [ ] Google OAuth tiene dominio de producción
- [ ] Primer usuario admin creado
- [ ] Productos de ejemplo visibles
- [ ] RLS funciona (usuario normal no puede crear productos)
- [ ] Admin puede acceder a `/admin`
- [ ] Citas se pueden crear y listar
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en logs de Vercel
- [ ] No hay errores en logs de Supabase

---

## 🚀 Siguientes Pasos

Después del despliegue:

1. **Crear usuarios admin adicionales**:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'otro-admin@example.com';
   ```

2. **Poblar productos/servicios reales** (si no usaste los de ejemplo)

3. **Configurar backups automáticos** en Supabase (Settings → Backups)

4. **Implementar las vistas faltantes**:
   - Panel de inventario completo
   - Gestión de citas con calendario
   - Reportes visuales
   - Administración de usuarios

5. **Monitoreo**:
   - Configurar alertas de errores (ej: Sentry)
   - Revisar logs regularmente

6. **SEO y Performance** (opcional):
   - Agregar meta tags
   - Optimizar imágenes
   - Configurar caché

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs de Vercel
2. Revisa los logs de Supabase
3. Verifica la consola del navegador (F12)
4. Consulta la documentación:
   - https://vercel.com/docs
   - https://supabase.com/docs

---

**¡Felicitaciones! Tu app está en producción 🎉**
