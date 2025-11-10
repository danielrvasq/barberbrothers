import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getBarbers } from "../lib/barbersService";
import { getCitas } from "../lib/citasService";
import { getAllProducts } from "../lib/productsService";
import Card from "../components/common/Card";
import {
  Users,
  Calendar,
  Package,
  Scissors,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function LandingPage() {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    barbers: 0,
    appointments: 0,
    todayAppointments: 0,
    products: 0,
    services: 0,
    lowStock: 0,
    loading: true,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [barbersRes, citasRes, productsRes] = await Promise.all([
          getBarbers(true),
          getCitas(),
          getAllProducts(),
        ]);

        const today = new Date().toISOString().split("T")[0];
        const todayAppointments = (citasRes.data || []).filter(
          (cita) =>
            cita.start_at?.startsWith(today) && cita.status === "scheduled"
        );

        const products = productsRes.data || [];
        const lowStockItems = products.filter(
          (p) => p.is_service === 1 && p.stock <= p.min_stock
        );

        setStats({
          barbers: (barbersRes.data || []).filter((b) => b.active).length,
          appointments: (citasRes.data || []).length,
          todayAppointments: todayAppointments.length,
          products: products.filter((p) => p.is_service === 1).length,
          services: products.filter((p) => p.is_service === 0).length,
          lowStock: lowStockItems.length,
          loading: false,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    loadStats();
  }, []);

  return (
    <div className="container">
      {/* Welcome Section */}
      <section style={{ textAlign: "center", marginTop: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 700 }}>
          ¡Bienvenido, {profile?.full_name?.split(" ")[0] || "Usuario"}! 👋
        </h2>
        <p className="muted">Sistema de Gestión Integral para tu Barbería</p>
      </section>

      {/* User Profile Card */}
      <section
        className="panel"
        style={{ padding: "clamp(16px, 3vw, 20px)", marginBottom: 24 }}
      >
        <h3 style={{ fontSize: 18, marginBottom: 12 }}>Tu Perfil</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
              className="muted"
            >
              Email
            </span>
            <span style={{ fontSize: 15, wordBreak: "break-all" }}>
              {profile?.email || user?.email}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
              className="muted"
            >
              Nombre
            </span>
            <span style={{ fontSize: 15 }}>
              {profile?.full_name || "No especificado"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
              className="muted"
            >
              Rol
            </span>
            <span style={{ fontSize: 15 }}>
              {isAdmin() ? "👑 Administrador" : "👤 Usuario"}
            </span>
          </div>
          {profile?.phone && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
                className="muted"
              >
                Teléfono
              </span>
              <span style={{ fontSize: 15 }}>{profile.phone}</span>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 16 }}>
          Funcionalidades del Sistema
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
            gap: 16,
          }}
        >
          {/* Inventario */}
          <div className="panel" style={{ padding: "clamp(16px, 3vw, 20px)" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
            <h4 style={{ fontSize: 16, marginBottom: 8 }}>Inventario</h4>
            <ul
              className="muted"
              style={{ listStyle: "none", padding: 0, margin: "0 0 12px 0" }}
            >
              <li>Registrar productos</li>
              <li>Búsqueda avanzada</li>
              <li>Actualizar stock</li>
              <li>Eliminar productos</li>
              <li>Reportes de inventario</li>
            </ul>
            {isAdmin() ? (
              <button
                className="btn-primary"
                style={{ width: "100%" }}
                onClick={() => navigate("/inventario")}
              >
                Ir a Inventario
              </button>
            ) : (
              <button
                disabled
                style={{ width: "100%", opacity: 0.6, cursor: "not-allowed" }}
              >
                Solo Admin
              </button>
            )}
          </div>

          {/* Citas */}
          <div className="panel" style={{ padding: "clamp(16px, 3vw, 20px)" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
            <h4 style={{ fontSize: 16, marginBottom: 8 }}>Citas</h4>
            <ul
              className="muted"
              style={{ listStyle: "none", padding: 0, margin: "0 0 12px 0" }}
            >
              <li>Crear nueva cita</li>
              <li>Ver mis citas</li>
              <li>Actualizar cita</li>
              <li>Cancelar cita</li>
              <li>Calendario de citas</li>
            </ul>
            <button
              className="btn-primary"
              style={{ width: "100%" }}
              onClick={() => navigate("/citas")}
            >
              Gestionar Citas
            </button>
          </div>

          {/* Barberos */}
          <div className="panel" style={{ padding: "clamp(16px, 3vw, 20px)" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✂️</div>
            <h4 style={{ fontSize: 16, marginBottom: 8 }}>Barberos</h4>
            <ul
              className="muted"
              style={{ listStyle: "none", padding: 0, margin: "0 0 12px 0" }}
            >
              <li>Ver barberos activos</li>
              <li>Información de contacto</li>
              <li>Especialidades</li>
              <li>Horarios de trabajo</li>
              <li>Gestión completa (Admin)</li>
            </ul>
            <button
              className="btn-primary"
              style={{ width: "100%" }}
              onClick={() => navigate("/barberos")}
            >
              Ver Barberos
            </button>
          </div>

          {/* Reportes */}
          <div className="panel" style={{ padding: "clamp(16px, 3vw, 20px)" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
            <h4 style={{ fontSize: 16, marginBottom: 8 }}>Reportes</h4>
            <ul
              className="muted"
              style={{ listStyle: "none", padding: 0, margin: "0 0 12px 0" }}
            >
              <li>Ventas mensuales</li>
              <li>Productos más vendidos</li>
              <li>Citas completadas</li>
              <li>Estadísticas generales</li>
              <li>Exportar a PDF/CSV</li>
            </ul>
            <button
              className="btn-primary"
              style={{ width: "100%" }}
              onClick={() => navigate("/reportes")}
            >
              Ver Reportes
            </button>
          </div>

          {/* Admin Panel */}
          {isAdmin() && (
            <div
              className="panel"
              style={{
                padding: "clamp(16px, 3vw, 20px)",
                borderWidth: 2,
                borderColor: "#eab308",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>👑</div>
              <h4 style={{ fontSize: 16, marginBottom: 8 }}>Panel Admin</h4>
              <ul
                className="muted"
                style={{ listStyle: "none", padding: 0, margin: "0 0 12px 0" }}
              >
                <li>Gestión de usuarios</li>
                <li>Asignar roles</li>
                <li>Ver logs de auditoría</li>
                <li>Configuración</li>
                <li>Métricas del sistema</li>
              </ul>
              <button
                className="btn-primary"
                style={{ width: "100%" }}
                onClick={() => navigate("/admin")}
              >
                Ir al Panel Admin
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, marginBottom: 16 }}>Resumen del Negocio</h3>

        {stats.loading ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <p className="muted">Cargando estadísticas...</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {/* Barberos */}
            <Card
              onClick={() => navigate("/barberos")}
              style={{ cursor: "pointer" }}
            >
              <div style={{ padding: 20, textAlign: "center" }}>
                <Users
                  size={32}
                  color="var(--color-primary)"
                  style={{ marginBottom: 8 }}
                />
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                  }}
                >
                  {stats.barbers}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    marginTop: 4,
                  }}
                >
                  Barberos Activos
                </div>
              </div>
            </Card>

            {/* Citas de Hoy */}
            <Card
              onClick={() => navigate("/citas")}
              style={{ cursor: "pointer" }}
            >
              <div style={{ padding: 20, textAlign: "center" }}>
                <Calendar
                  size={32}
                  color="var(--color-success)"
                  style={{ marginBottom: 8 }}
                />
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 600,
                    color: "var(--color-success)",
                  }}
                >
                  {stats.todayAppointments}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    marginTop: 4,
                  }}
                >
                  Citas de Hoy
                </div>
              </div>
            </Card>

            {/* Total Citas */}
            <Card
              onClick={() => navigate("/citas")}
              style={{ cursor: "pointer" }}
            >
              <div style={{ padding: 20, textAlign: "center" }}>
                <TrendingUp
                  size={32}
                  color="var(--color-secondary)"
                  style={{ marginBottom: 8 }}
                />
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 600,
                    color: "var(--color-secondary)",
                  }}
                >
                  {stats.appointments}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    marginTop: 4,
                  }}
                >
                  Total Citas
                </div>
              </div>
            </Card>

            {/* Servicios */}
            <Card
              onClick={() => navigate("/inventario")}
              style={{ cursor: "pointer" }}
            >
              <div style={{ padding: 20, textAlign: "center" }}>
                <Scissors
                  size={32}
                  color="var(--color-secondary)"
                  style={{ marginBottom: 8 }}
                />
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 600,
                    color: "var(--color-secondary)",
                  }}
                >
                  {stats.services}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    marginTop: 4,
                  }}
                >
                  Servicios
                </div>
              </div>
            </Card>

            {/* Productos */}
            <Card
              onClick={() => navigate("/inventario")}
              style={{ cursor: "pointer" }}
            >
              <div style={{ padding: 20, textAlign: "center" }}>
                <Package
                  size={32}
                  color="var(--color-primary)"
                  style={{ marginBottom: 8 }}
                />
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                  }}
                >
                  {stats.products}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    marginTop: 4,
                  }}
                >
                  Productos
                </div>
              </div>
            </Card>

            {/* Stock Bajo */}
            {stats.lowStock > 0 && (
              <Card
                onClick={() => navigate("/inventario")}
                style={{ cursor: "pointer" }}
              >
                <div style={{ padding: 20, textAlign: "center" }}>
                  <AlertCircle
                    size={32}
                    color="var(--color-warning)"
                    style={{ marginBottom: 8 }}
                  />
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 600,
                      color: "var(--color-warning)",
                    }}
                  >
                    {stats.lowStock}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-text-secondary)",
                      marginTop: 4,
                    }}
                  >
                    Stock Bajo
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
