# Módulo de Inventario

Este módulo permite administrar el inventario completo de la barbería, incluyendo productos físicos y servicios.

## Componentes

### `InventoryPage`

Página principal que muestra la lista de productos y servicios con estadísticas.

**Características:**

- Lista de items en formato de cards responsivos
- Estadísticas en tiempo real (total, productos, servicios, stock bajo)
- Filtros: Todos, Solo Productos, Solo Servicios
- Formulario de creación/edición inline
- Alertas de stock bajo
- Toast notifications para feedback

**Permisos:**

- Usuarios: Ver productos y servicios (solo lectura)
- Admins: Ver, crear, editar, eliminar

### `ProductCard`

Card que muestra la información de un producto o servicio.

**Props:**

- `product`: Objeto con datos del producto
- `onEdit`: Callback para editar (solo admin)
- `onDelete`: Callback para eliminar (solo admin)
- `isAdmin`: Boolean para mostrar/ocultar acciones

**Información mostrada:**

- Icono según tipo (Producto/Servicio)
- Nombre y SKU
- Badge de tipo
- Descripción
- Precio, costo y margen de ganancia
- Stock actual y mínimo (solo productos)
- Alerta visual si stock está bajo
- Botones de acción (solo admin)

### `ProductForm`

Formulario para crear o editar productos/servicios.

**Props:**

- `initialData`: Datos iniciales para edición (null para crear)
- `onSave`: Callback con el payload a guardar
- `onCancel`: Callback para cancelar

**Campos:**

- Nombre\* (requerido, max 100 chars)
- SKU\* (requerido, max 50 chars, auto uppercase)
- Categoría\* (product/service)
- Descripción (opcional, max 500 chars, textarea)
- Precio de Venta\* (requerido, > 0)
- Costo (opcional, para calcular margen)
- Stock Actual (solo productos)
- Stock Mínimo (solo productos)

**Validación:**

- Nombre y SKU obligatorios
- Precio debe ser mayor a 0
- Servicios automáticamente tienen stock = 0
- Al cambiar a "Servicio", se ocultan campos de stock

**Características especiales:**

- Sincronización automática: category='service' → is_service=0, stock=0
- Cálculo de margen de ganancia: `((precio - costo) / precio) * 100`
- SKU se convierte automáticamente a mayúsculas

## Servicio: `productsService.js`

### Funciones disponibles:

```javascript
// Obtener servicios (is_service = 0)
getServices();

// Obtener productos (is_service = 1)
getProducts();

// Obtener todos (servicios y productos)
getAllProducts();

// Obtener un producto/servicio por ID
getProductById(id);

// Crear producto/servicio (solo admin)
createProduct(product);

// Actualizar producto/servicio (solo admin)
updateProduct(id, updates);

// Eliminar producto/servicio (solo admin)
deleteProduct(id);
```

## Base de Datos

### Tabla: `products`

```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  sku text UNIQUE NOT NULL,
  category text CHECK (category IN ('service', 'product')),
  is_service smallint DEFAULT 1 CHECK (is_service IN (0, 1)),
  price numeric(10,2) NOT NULL,
  cost numeric(10,2) DEFAULT 0,
  stock integer DEFAULT 0,
  min_stock integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Campos importantes:**

- `is_service`: 0 = servicio (intangible), 1 = producto (inventario físico)
- `category`: 'service' o 'product' (mantenido por compatibilidad)
- `stock`: Stock actual (0 para servicios)
- `min_stock`: Nivel mínimo antes de alerta (0 para servicios)

### Políticas RLS:

- **Lectura**: Todos los usuarios autenticados pueden ver productos
- **Escritura**: Solo admins pueden crear/editar/eliminar

## Estadísticas

El módulo muestra 4 estadísticas principales:

1. **Total Items**: Cantidad total de productos + servicios
2. **Productos**: Items con `is_service = 1`
3. **Servicios**: Items con `is_service = 0`
4. **Stock Bajo**: Productos donde `stock <= min_stock` (solo si > 0)

## Filtros

- **Todos**: Muestra productos y servicios
- **Productos**: Solo items con `is_service = 1`
- **Servicios**: Solo items con `is_service = 0`

Los filtros muestran el conteo actualizado en el botón.

## Ruta

```
/inventario
```

Accesible para todos los usuarios autenticados. Las acciones de administración solo están disponibles para admins.

## Integración con otros módulos

### Con Citas:

- `CitaForm` carga servicios desde `products` donde `is_service = 0`
- El dropdown de servicios muestra nombre y precio
- Los servicios se almacenan como texto en `appointments.service`

### Con Dashboard:

- Muestra estadísticas de productos y servicios
- Alerta de stock bajo visible en LandingPage
- Cards clicables para navegar al inventario

## Alertas de Stock Bajo

Un producto se considera con **stock bajo** cuando:

```javascript
product.is_service === 1 && product.stock <= product.min_stock;
```

**Visualización:**

- Badge amarillo en ProductCard
- Fondo amarillo en sección de stock
- Contador en estadísticas principales
- Card de alerta en Dashboard (solo si hay items)

## Cálculo de Margen

El margen de ganancia se calcula solo si existe `cost > 0`:

```javascript
margin = ((price - cost) / price) * 100;
```

Ejemplo:

- Precio: $15
- Costo: $7.50
- Margen: 50%

## Flujo de Uso

1. **Usuario normal:**

   - Ve la lista completa de productos y servicios
   - Puede filtrar por tipo
   - Ve precios y descripciones
   - No ve botones de administración

2. **Admin:**
   - Ve todo lo que ve un usuario normal
   - Puede hacer clic en "Agregar Producto/Servicio"
   - Puede editar items existentes
   - Puede eliminar items (con confirmación)
   - Ve costos y márgenes de ganancia
   - Recibe notificaciones toast de las acciones

## Estilos

Usa el sistema de diseño de la plantilla:

- Variables CSS de `styles/variables.css`
- Componentes comunes (Button, Card, Toast)
- Layout responsivo con grid (min 320px por card)
- Iconos de Lucide React

## Próximas Mejoras

- [ ] Historial de movimientos de inventario
- [ ] Ajuste manual de stock con notas
- [ ] Importar/Exportar productos (CSV/Excel)
- [ ] Códigos de barras
- [ ] Proveedores y órdenes de compra
- [ ] Alertas automáticas por email cuando stock bajo
- [ ] Categorías personalizadas
- [ ] Fotos de productos
- [ ] Reportes de rotación de inventario
