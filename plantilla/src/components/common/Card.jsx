import "../../styles/components.css";

/**
 * Componente Card reutilizable
 *
 * @param {Object} props
 * @param {string} props.title - Título de la tarjeta
 * @param {string} props.subtitle - Subtítulo (opcional)
 * @param {React.ReactNode} props.icon - Ícono (opcional)
 * @param {React.ReactNode} props.children - Contenido de la tarjeta
 * @param {React.ReactNode} props.footer - Footer con acciones (opcional)
 * @param {Function} props.onClick - Callback al hacer clic en la tarjeta
 * @param {string} props.className - Clases CSS adicionales
 */
function Card({
  title,
  subtitle,
  icon,
  children,
  footer,
  onClick,
  className = "",
}) {
  return (
    <div
      className={`card ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {icon && <div className="card-icon">{icon}</div>}

      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}

      <div className="card-body">{children}</div>

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

export default Card;
