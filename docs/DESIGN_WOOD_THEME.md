# 🎨 Tema de Madera - Diseño Barbería

## 📋 Resumen

Se ha implementado un esquema de colores con tonos café/madera para dar un aspecto más cálido y tradicional, evocando la atmósfera clásica de una barbería profesional.

---

## 🎨 Paleta de Colores

### Tonos Madera Principales

```css
--color-wood-light: #d4a574      /* Madera clara (acentos, bordes) */
--color-wood-medium: #8b6f47     /* Madera media (hover, botones) */
--color-wood-dark: #654321       /* Madera oscura (texto, títulos) */
--color-wood-darker: #3e2723     /* Madera muy oscura (sidebar) */
--color-wood-bg: #f5e6d3         /* Fondo madera claro (notas) */
--color-wood-surface: #faf6f1    /* Superficie suave (inputs) */
```

### Colores Base Actualizados

```css
--color-background: #f5f1ed      /* Fondo general beige cálido */
--color-border: #d4c4b0          /* Bordes color madera clara */
--color-text-primary: #3e2723    /* Texto principal café oscuro */
--color-text-secondary: #6d4c41  /* Texto secundario café medio */
```

---

## 🎯 Componentes Afectados

### 1. **Sidebar / Menú Lateral**

**Características:**

- Fondo: Degradado de café oscuro a muy oscuro
- Borde derecho: 3px color madera medio
- Texto: Blanco con opacidad 80%
- Hover: Fondo café medio
- Item activo: Fondo madera medio con sombra

**CSS Aplicado:**

```css
background: linear-gradient(180deg, #3e2723 0%, #3e2723 100%);
border-right: 3px solid #8b6f47;
box-shadow: 4px 0 12px rgba(62, 39, 35, 0.3);
```

**Header del Sidebar:**

- Fondo semitransparente madera media
- Borde inferior madera medio
- Logo color madera clara
- Título blanco

**Footer del Sidebar:**

- Botón logout con borde madera
- Hover: fondo madera medio

---

### 2. **Cards / Tarjetas**

**Características:**

- Borde: 2px color madera clara
- Sombra sutil café
- Hover: Sombra más pronunciada + borde madera medio
- Animación: Levantamiento sutil (translateY -2px)

**CSS Aplicado:**

```css
border: 2px solid var(--color-wood-light);
box-shadow: 0 2px 4px rgba(101, 67, 33, 0.1);

/* Hover */
border-color: var(--color-wood-medium);
box-shadow: 0 4px 12px rgba(101, 67, 33, 0.2);
transform: translateY(-2px);
```

---

### 3. **Botones**

#### **Botón Primary**

- Degradado madera medio a oscuro
- Borde madera oscura
- Sombra café pronunciada
- Hover: Degradado más oscuro

```css
background: linear-gradient(135deg, #8b6f47 0%, #654321 100%);
border: 2px solid #654321;
box-shadow: 0 2px 6px rgba(101, 67, 33, 0.3);
```

#### **Botón Ghost**

- Borde madera clara
- Hover: Fondo beige madera + borde medio

```css
border-color: var(--color-wood-light);
/* Hover */
background: var(--color-wood-bg);
border-color: var(--color-wood-medium);
```

#### **Botón Móvil (Menú)**

- Degradado madera medio a oscuro
- Borde 3px madera clara
- Sombra café pronunciada

---

### 4. **Formularios (Inputs, Selects, Textareas)**

**Características:**

- Borde: 2px color madera clara
- Fondo: Color madera superficie (muy claro)
- Focus: Borde madera medio + sombra café + fondo blanco
- Transición suave

**CSS Aplicado:**

```css
border: 2px solid var(--color-wood-light);
background: var(--color-wood-surface);

/* Focus */
border-color: var(--color-wood-medium);
box-shadow: 0 0 0 3px rgba(139, 111, 71, 0.15);
background: #ffffff;
```

---

### 5. **Panels / Paneles**

**Características:**

- Borde 2px madera clara
- Sombra sutil café

```css
border: 2px solid var(--color-wood-light);
box-shadow: 0 2px 4px rgba(101, 67, 33, 0.1);
```

---

### 6. **Badges de Estado (Citas)**

**Características:**

- Status "Completada": Color madera medio
- Borde 1.5px del color principal
- Padding aumentado
- Font-weight: 600

**CSS Aplicado:**

```css
completed: { color: "var(--color-wood-medium)" }
border: 1.5px solid ${badge.color}40
padding: 4px 10px
fontWeight: 600
```

---

### 7. **Notas en Citas**

**Características:**

- Fondo beige madera
- Borde izquierdo 3px madera medio
- Título en color madera oscuro

```css
background: var(--color-wood-bg);
borderleft: 3px solid var(--color-wood-medium);
```

---

### 8. **Header Usuario (Sin Sidebar)**

**Características:**

- Degradado de fondo madera superficie a blanco
- Borde 2px madera clara
- Sombra café suave
- Título en color madera oscuro

```css
background: linear-gradient(135deg, #faf6f1 0%, #ffffff 100%);
border: 2px solid var(--color-wood-light);
box-shadow: 0 4px 12px rgba(101, 67, 33, 0.15);
color: var(--color-wood-dark);
```

---

### 9. **Fondo General (Body)**

**Características:**

- Color base beige cálido
- Patrón sutil de líneas verticales café (simula vetas de madera)

```css
background: var(--color-background);
background-image: repeating-linear-gradient(
  90deg,
  transparent,
  transparent 2px,
  rgba(139, 111, 71, 0.02) 2px,
  rgba(139, 111, 71, 0.02) 4px
);
```

---

## 📐 Jerarquía Visual

### Colores por Importancia

1. **Más Oscuro → Más Importante**

   - `--color-wood-darker` (#3e2723): Sidebar, elementos principales
   - `--color-wood-dark` (#654321): Títulos, texto importante

2. **Medio → Interacción**

   - `--color-wood-medium` (#8b6f47): Botones, hover, bordes activos

3. **Claro → Sutil**

   - `--color-wood-light` (#d4a574): Bordes, acentos

4. **Muy Claro → Fondos**
   - `--color-wood-bg` (#f5e6d3): Fondos de notas
   - `--color-wood-surface` (#faf6f1): Inputs, superficies

---

## 🎭 Contraste y Accesibilidad

### Combinaciones Aprobadas

✅ **Texto café oscuro sobre fondo claro**

- `#3e2723` sobre `#ffffff`
- Ratio: ~14:1 (Excelente)

✅ **Texto blanco sobre café oscuro**

- `#ffffff` sobre `#3e2723`
- Ratio: ~14:1 (Excelente)

✅ **Texto café medio sobre fondo beige**

- `#6d4c41` sobre `#f5f1ed`
- Ratio: ~6:1 (Bueno para texto)

---

## 🎨 Efectos Visuales

### Sombras Café

```css
/* Sombra sutil */
box-shadow: 0 2px 4px rgba(101, 67, 33, 0.1);

/* Sombra media */
box-shadow: 0 4px 12px rgba(101, 67, 33, 0.2);

/* Sombra pronunciada */
box-shadow: 0 4px 12px rgba(101, 67, 33, 0.4);

/* Sombra lateral (sidebar) */
box-shadow: 4px 0 12px rgba(62, 39, 35, 0.3);
```

### Degradados

```css
/* Sidebar */
background: linear-gradient(180deg, #3e2723 0%, #3e2723 100%);

/* Botón primary */
background: linear-gradient(135deg, #8b6f47 0%, #654321 100%);

/* Header usuario */
background: linear-gradient(135deg, #faf6f1 0%, #ffffff 100%);
```

---

## 📱 Responsive

Los tonos madera se mantienen consistentes en todos los tamaños de pantalla:

- **Desktop**: Sidebar con degradado café completo
- **Tablet**: Sidebar colapsable con mismos colores
- **Mobile**:
  - Botón menú con degradado madera
  - Sidebar con fondo café completo
  - Overlay semitransparente

---

## 🔧 Archivos Modificados

### 1. **variables.css**

- Definición de paleta de colores madera
- Actualización de colores base

### 2. **Layout.css**

- Sidebar con degradado café
- Botones y navegación con tonos madera
- Botón móvil con estilo madera

### 3. **components.css**

- Cards con bordes madera
- Botones primary con degradado café
- Botones ghost con hover madera

### 4. **global.css**

- Body con fondo beige y patrón sutil
- Inputs con borde y fondo madera
- Panels con borde café

### 5. **CitasList.jsx**

- Badges con colores actualizados
- Notas con fondo beige madera
- Borde café en secciones

### 6. **Layout.jsx**

- Header usuario con degradado madera
- Título con color café oscuro

---

## 🌟 Ventajas del Tema Madera

### Estética

✅ Aspecto cálido y acogedor
✅ Evoca tradición y profesionalismo
✅ Asociación con barberías clásicas
✅ Diferenciación visual clara

### Funcional

✅ Excelente contraste de lectura
✅ Jerarquía visual clara
✅ Estados hover bien definidos
✅ Accesibilidad mantenida (WCAG AA)

### Psicológica

✅ Transmite calidez y confianza
✅ Refleja artesanía y calidad
✅ Ambiente masculino tradicional
✅ Sensación premium

---

## 🎯 Identidad Visual

### Palabras Clave del Diseño

- **Cálido**: Tonos café beige
- **Tradicional**: Colores madera clásica
- **Profesional**: Gradientes sutiles
- **Premium**: Sombras suaves
- **Acogedor**: Fondos claros

### Asociaciones

- 🪵 Madera noble
- ☕ Café expreso
- 🏛️ Barbería clásica
- 🎩 Elegancia vintage
- ✂️ Artesanía profesional

---

## 🔮 Futuras Mejoras Opcionales

1. **Texturas**

   - Agregar imagen sutil de textura madera en sidebar
   - Patrón de grano de madera en cards

2. **Animaciones**

   - Transición de color al hover más suave
   - Efecto de brillo en botones primary

3. **Iconografía**

   - Iconos personalizados con estilo vintage
   - Ilustraciones en tonos sepia

4. **Modo Oscuro**
   - Versión nocturna con café muy oscuro
   - Acentos dorados en lugar de madera clara

---

**Implementado el 10 de noviembre de 2025**

**Paleta inspirada en**: Barberías tradicionales europeas, muebles de roble, café artesanal
