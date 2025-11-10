# Módulo de Reportes

Este módulo proporciona estadísticas completas y métricas de rendimiento del negocio, incluyendo citas, ingresos, barberos y servicios.

## Componente Principal

### `ReportsPage`

Página de reportes y análisis con múltiples secciones de estadísticas.

**Características principales:**

- Métricas generales de citas
- Cálculo de ingresos estimados (solo admin)
- Top 5 servicios más solicitados
- Rendimiento individual por barbero
- Resumen de inventario
- Filtros por período (semana, mes, año, todo)
- Exportación de reportes en JSON

## Secciones del Reporte

### 1. Métricas Generales

Cards con estadísticas principales:

- **Total Citas**: Todas las citas registradas
- **Completadas**: Citas con status 'completed' ✅
- **Programadas**: Citas con status 'scheduled' ⏰
- **Canceladas**: Citas con status 'canceled' ❌

### 2. Ingresos Estimados (Solo Admin)

Cálculo basado en precios de servicios y citas completadas:

- **Este Mes**: Suma de precios de citas completadas en el mes actual
- **Total Histórico**: Suma de todas las citas completadas

**Cálculo:**

```javascript
// Para cada cita completada:
const servicePrice =
  products.find((p) => p.name === appointment.service)?.price || 0;
totalRevenue += servicePrice;
```

**Nota:** Los ingresos son **estimados** porque asumen que se cobró el precio de lista del servicio.

### 3. Top 5 Servicios Más Solicitados

Ranking de servicios más demandados con:

- Posición (1-5)
- Nombre del servicio
- Cantidad de citas
- Barra de progreso visual proporcional

**Ordenamiento:** De mayor a menor cantidad de citas

### 4. Rendimiento por Barbero

Cards individuales para cada barbero mostrando:

- Nombre del barbero
- Total de citas asignadas
- Citas completadas ✅
- Citas pendientes (scheduled + confirmed) ⏰

**Ordenamiento:** Por total de citas (descendente)

### 5. Resumen de Inventario

Cards con estadísticas de productos:

- **Servicios Disponibles**: Productos con `is_service = 0`
- **Productos en Inventario**: Productos con `is_service = 1`
- **Con Stock Bajo**: Productos donde `stock <= min_stock` (solo si > 0)

## Filtros de Período

Botones para cambiar el rango de fechas (actualmente visual, la lógica completa se puede expandir):

- **Esta Semana**: Desde el domingo de la semana actual
- **Este Mes**: Desde el día 1 del mes actual
- **Este Año**: Desde el 1 de enero del año actual
- **Todo el Tiempo**: Sin filtro de fecha

**Estado actual:** Los filtros cargan todos los datos, pero se pueden expandir para filtrar dinámicamente.

## Exportación de Reportes

### Formato de exportación: JSON

Botón "Exportar Reporte" genera un archivo JSON con:

```json
{
  "fecha_generacion": "2025-11-10T...",
  "periodo": "month",
  "estadisticas": {
    "totalAppointments": 150,
    "completedAppointments": 120,
    "scheduledAppointments": 25,
    "canceledAppointments": 5,
    "estimatedRevenue": 1800.00,
    "topServices": [...],
    "barberStats": [...],
    ...
  }
}
```

**Nombre del archivo:** `reporte-barberia-YYYY-MM-DD.json`

## Permisos

### Usuarios normales:

- ✅ Ver todas las estadísticas de citas
- ✅ Ver servicios más solicitados
- ✅ Ver rendimiento de barberos
- ✅ Ver resumen de inventario
- ✅ Exportar reportes
- ❌ **NO** pueden ver ingresos estimados

### Administradores:

- ✅ Todo lo anterior +
- ✅ Ver sección de ingresos estimados
- ✅ Ver ingresos mensuales y totales

## Estadísticas Calculadas

### Citas por Período

```javascript
// Hoy
todayAppointments = appointments.filter((a) => a.start_at.startsWith(today));

// Esta semana
weekAppointments = appointments.filter(
  (a) => new Date(a.start_at) >= startOfWeek
);

// Este mes
monthAppointments = appointments.filter(
  (a) => new Date(a.start_at) >= startOfMonth
);
```

### Top Servicios

```javascript
// Contar servicios
serviceCounts[serviceName] = count;

// Ordenar y tomar top 5
topServices = Object.entries(serviceCounts)
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);
```

### Rendimiento por Barbero

```javascript
barberStats = {
  total: citasAsignadas,
  completed: citasCompletadas,
  scheduled: citasPendientes,
};
```

## Visualizaciones

### Barras de Progreso

Los servicios más solicitados tienen barras proporcionales:

- El #1 siempre tiene 100% de ancho
- Los demás se calculan: `(count / topCount) * 100%`

### Cards de Métricas

Colores semánticos:

- **Verde** (`--color-success`): Completadas, Ingresos
- **Azul** (`--color-primary`): Totales, General
- **Amarillo** (`--color-warning`): Programadas, Pendientes, Stock Bajo
- **Rojo** (`--color-error`): Canceladas

### Iconos (Lucide React)

- Calendar: Citas
- CheckCircle: Completadas
- Clock: Programadas
- XCircle: Canceladas
- DollarSign: Ingresos
- TrendingUp: Tendencias
- Users: Barberos
- Scissors: Servicios
- Package: Productos
- BarChart3: Reportes

## Ruta

```
/reportes
```

Accesible para todos los usuarios autenticados.

## Integración con otros módulos

### Con Citas:

- Obtiene todas las citas con `getCitas()`
- Analiza estados: scheduled, completed, canceled, confirmed
- Extrae servicio solicitado de cada cita

### Con Productos:

- Obtiene servicios con `getAllProducts()`
- Usa precios de servicios para calcular ingresos
- Cuenta productos y servicios

### Con Barberos:

- Obtiene barberos con `getBarbers(true)`
- Relaciona citas con barberos por `barber_id`
- Muestra nombre desde `appointments_with_details`

## Mejoras Futuras

- [ ] Gráficos visuales (Chart.js o Recharts)
- [ ] Exportación a PDF y CSV
- [ ] Filtros de período funcionales con recarga de datos
- [ ] Comparación mes a mes
- [ ] Tendencias y proyecciones
- [ ] Reportes de productos más vendidos (cuando se implemente ventas)
- [ ] Reportes de horarios pico
- [ ] Tasa de cancelación por período
- [ ] Tiempo promedio por servicio
- [ ] Reporte de satisfacción del cliente
- [ ] Dashboard con gráficos interactivos
- [ ] Alertas automáticas de métricas importantes
- [ ] Integración con facturación real

## Notas Técnicas

### Cálculo de Fecha de Inicio de Semana

```javascript
const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
```

Calcula el domingo de la semana actual.

### Cálculo de Fecha de Inicio de Mes

```javascript
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
```

Primer día del mes actual.

### Agrupación por Barbero

```javascript
barberCounts[barberId] = {
  id,
  name,
  total,
  completed,
  scheduled,
};
```

Objeto indexado por `barber_id` para evitar duplicados.

### Ingresos Estimados

**Importante:** Los ingresos son **estimados** porque:

1. Asumen que se cobró el precio de lista
2. No consideran descuentos o promociones
3. No incluyen propinas
4. No consideran cancelaciones tardías con cargo

Para ingresos reales, se necesitaría un módulo de facturación.

## Estilos

Usa el sistema de diseño de la plantilla:

- Variables CSS de `styles/variables.css`
- Componentes comunes (Button, Card)
- Layout responsivo con grid
- Iconos de Lucide React
- Colores semánticos según tipo de dato
