import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import "../../styles/components.css";

/**
 * Componente Toast para notificaciones
 *
 * @param {Object} props
 * @param {boolean} props.visible - Si el toast está visible
 * @param {string} props.message - Mensaje a mostrar
 * @param {string} props.type - Tipo: 'success' | 'error' | 'warning' | 'info'
 */
function Toast({ visible, message, type = "success" }) {
  const Icon =
    type === "success"
      ? CheckCircle
      : type === "error"
      ? XCircle
      : type === "warning"
      ? AlertTriangle
      : Info;

  return (
    <div
      className={`toast ${type} ${visible ? "show" : ""}`}
      role="status"
      aria-live="polite"
    >
      <Icon size={18} className="toast-icon" />
      <span>{message}</span>
    </div>
  );
}

export default Toast;
