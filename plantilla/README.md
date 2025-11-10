# Plantilla de Proyecto Frontend

Esta es una plantilla reutilizable extraída del proyecto RadicApp. Incluye:

## 🎨 Características

- ✅ **Sidebar responsivo** con menú hamburguesa en móvil
- ✅ **Sistema de colores personalizado**
  - Primario: `#ff6600` (naranja)
  - Secundario: `#00359a` (azul)
  - Sidebar: `#e6f0ff` (azul claro)
  - Activo: `#ffc999` / `#5f2701`
- ✅ **Cards con diseño moderno**
- ✅ **Sistema de notificaciones Toast**
- ✅ **Totalmente responsive** (Desktop, Tablet, Mobile)
- ✅ **Fuente**: Segoe UI
- ✅ **Sin datos de prueba** - listo para usar en cualquier proyecto

## 📦 Estructura

```
plantilla/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx          # Sidebar + Layout principal
│   │   │   └── Layout.css          # Estilos del layout
│   │   └── common/
│   │       ├── Toast.jsx           # Componente de notificaciones
│   │       ├── Card.jsx            # Componente de tarjetas
│   │       └── Button.jsx          # Componente de botones
│   └── styles/
│       ├── global.css              # Estilos globales
│       ├── variables.css           # Variables CSS
│       └── components.css          # Estilos de componentes comunes
└── README.md
```

## 🚀 Uso

1. Copia la carpeta `plantilla` a tu nuevo proyecto
2. Instala las dependencias necesarias:
   ```bash
   npm install react-router-dom lucide-react react-icons
   ```
3. Importa los componentes en tu aplicación
4. Personaliza las secciones del menú en `Layout.jsx`
5. Ajusta los colores en `variables.css` si lo deseas

## 🎨 Paleta de Colores

```css
--color-primary: #ff6600;
--color-primary-hover: #e55a00;
--color-secondary: #00359a;
--color-secondary-hover: #002d82;
--color-sidebar-bg: #e6f0ff;
--color-active-bg: #ffc999;
--color-active-text: #5f2701;
```

## 📱 Breakpoints Responsivos

- **Desktop**: > 768px
- **Tablet**: 481px - 768px
- **Mobile**: < 480px

## 🔧 Componentes Incluidos

### Layout

- Sidebar colapsable con hover
- Menú móvil con overlay
- Navegación con React Router
- Botón de logout

### Toast

- 4 tipos: success, error, warning, info
- Animaciones de entrada/salida
- Auto-dismiss configurable

### Card

- Diseño moderno con hover effects
- Responsive
- Íconos personalizables

### Button

- Variantes: primary, secondary, danger, ghost
- Tamaños: sm, md, lg
- Estados: hover, active, disabled

---

**Creado desde**: RadicApp
**Fecha**: Octubre 2025
