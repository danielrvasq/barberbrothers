import "../../styles/components.css";

/**
 * Componente Button reutilizable
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {string} props.variant - Variante: 'primary' | 'secondary' | 'danger' | 'ghost'
 * @param {string} props.size - Tamaño: 'sm' | 'md' | 'lg'
 * @param {boolean} props.disabled - Si el botón está deshabilitado
 * @param {Function} props.onClick - Callback al hacer clic
 * @param {string} props.type - Tipo HTML: 'button' | 'submit' | 'reset'
 * @param {React.ReactNode} props.icon - Ícono a mostrar
 * @param {string} props.iconPosition - Posición del ícono: 'left' | 'right'
 * @param {string} props.className - Clases CSS adicionales
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  type = "button",
  icon,
  iconPosition = "left",
  className = "",
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== "md" ? `btn-${size}` : "";

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && iconPosition === "left" && icon}
      {children}
      {icon && iconPosition === "right" && icon}
    </button>
  );
}

export default Button;
