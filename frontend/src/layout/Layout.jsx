import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogOut, Menu, X, Scissors } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import "./Layout.css";

function Layout({ children, pageTitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, isAdmin, user, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
      alert("Error al cerrar sesión: " + e.message);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Cerrar menú al navegar
  };

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Cerrar menú al hacer clic fuera (solo en móvil)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        !event.target.closest(".layout-sidebar") &&
        !event.target.closest(".mobile-menu-toggle")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      // Usar timeout para evitar que se cierre inmediatamente
      const timeoutId = setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isMobileMenuOpen]);

  // Prevenir scroll del body cuando el menú está abierto en móvil
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="layout-container">
      {/* Botón hamburguesa para móvil */}
      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para cerrar el menú en móvil */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`layout-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <span className="sidebar-logo" aria-hidden>
            <Scissors size={24} />
          </span>
          <span className="sidebar-title">Barbería</span>
        </div>

        <nav className="sidebar-nav" aria-label="Secciones">
          <button
            className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => handleNavigate("/")}
          >
            <span className="nav-icon" aria-hidden>🏠</span>
            <span className="nav-text">Inicio</span>
          </button>

          <button
            className={`nav-item ${location.pathname === "/inventario" ? "active" : ""}`}
            onClick={() => handleNavigate("/inventario")}
          >
            <span className="nav-icon" aria-hidden>📦</span>
            <span className="nav-text">Inventario</span>
          </button>

          <button
            className={`nav-item ${location.pathname === "/citas" ? "active" : ""}`}
            onClick={() => handleNavigate("/citas")}
          >
            <span className="nav-icon" aria-hidden>📅</span>
            <span className="nav-text">Citas</span>
          </button>

          <button
            className={`nav-item ${location.pathname === "/reportes" ? "active" : ""}`}
            onClick={() => handleNavigate("/reportes")}
          >
            <span className="nav-icon" aria-hidden>📊</span>
            <span className="nav-text">Reportes</span>
          </button>

          {isAdmin() && (
            <button
              className={`nav-item ${location.pathname === "/admin" ? "active" : ""}`}
              onClick={() => handleNavigate("/admin")}
            >
              <span className="nav-icon" aria-hidden>👑</span>
              <span className="nav-text">Admin</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={20} />
            <span className="logout-text">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="layout-main">
        <div className="layout-content">
          {children}
        </div>
      </main>
    </div>
  );

}
export default Layout;
