import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogOut, Menu, X, Scissors } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "./Layout.css";

function Layout({ children, pageTitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const showSidebar = isAdmin(); // Solo mostrar sidebar para admins

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (e) {
      // Si el error es porque no hay sesión, solo navegamos al login
      console.error("Error al cerrar sesión:", e);
      // Navegar al login de todas formas
      navigate("/login");
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
      const timeoutId = setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="layout-container">
      {showSidebar && (
        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {showSidebar && isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {showSidebar && (
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
              className={`nav-item ${
                location.pathname === "/" ? "active" : ""
              }`}
              onClick={() => handleNavigate("/")}
            >
              <span className="nav-icon" aria-hidden>
                🏠
              </span>
              <span className="nav-text">Inicio</span>
            </button>
            <button
              className={`nav-item ${
                location.pathname === "/inventario" ? "active" : ""
              }`}
              onClick={() => handleNavigate("/inventario")}
            >
              <span className="nav-icon" aria-hidden>
                📦
              </span>
              <span className="nav-text">Inventario</span>
            </button>
            <button
              className={`nav-item ${
                location.pathname === "/citas" ? "active" : ""
              }`}
              onClick={() => handleNavigate("/citas")}
            >
              <span className="nav-icon" aria-hidden>
                📅
              </span>
              <span className="nav-text">Citas</span>
            </button>
            <button
              className={`nav-item ${
                location.pathname === "/barberos" ? "active" : ""
              }`}
              onClick={() => handleNavigate("/barberos")}
            >
              <span className="nav-icon" aria-hidden>
                ✂️
              </span>
              <span className="nav-text">Barberos</span>
            </button>
            <button
              className={`nav-item ${
                location.pathname === "/reportes" ? "active" : ""
              }`}
              onClick={() => handleNavigate("/reportes")}
            >
              <span className="nav-icon" aria-hidden>
                📊
              </span>
              <span className="nav-text">Reportes</span>
            </button>
            <button
              className={`nav-item ${
                location.pathname === "/usuarios" ? "active" : ""
              }`}
              onClick={() => handleNavigate("/usuarios")}
            >
              <span className="nav-icon" aria-hidden>
                👥
              </span>
              <span className="nav-text">Usuarios</span>
            </button>
            {isAdmin() && (
              <button
                className={`nav-item ${
                  location.pathname === "/admin" ? "active" : ""
                }`}
                onClick={() => handleNavigate("/admin")}
              >
                <span className="nav-icon" aria-hidden>
                  👑
                </span>
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
      )}

      <main className={`layout-main ${!showSidebar ? "no-sidebar" : ""}`}>
        <div className="layout-content">
          {!showSidebar && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                padding: "1rem 1.25rem",
                background:
                  "linear-gradient(135deg, var(--color-wood-surface) 0%, #ffffff 100%)",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(101, 67, 33, 0.15)",
                border: "2px solid var(--color-wood-light)",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.75rem",
                  color: "var(--color-wood-dark)",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ fontSize: "2rem" }}>📅</span>
                Mis Citas
              </h1>
              <button
                onClick={handleLogout}
                className="btn btn-ghost"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <LogOut size={18} />
                Cerrar Sesión
              </button>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;
