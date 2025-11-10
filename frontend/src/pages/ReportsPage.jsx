import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getCitas } from "../lib/citasService";
import { getAllProducts } from "../lib/productsService";
import { getBarbers } from "../lib/barbersService";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Package,
  Scissors,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Download,
} from "lucide-react";

const ReportsPage = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month"); // 'week', 'month', 'year', 'all'
  const [stats, setStats] = useState({
    // Citas
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    canceledAppointments: 0,
    confirmedAppointments: 0,

    // Por período
    appointmentsThisWeek: 0,
    appointmentsThisMonth: 0,
    appointmentsToday: 0,

    // Barberos
    totalBarbers: 0,
    activeBarbers: 0,
    barberStats: [],

    // Servicios más solicitados
    topServices: [],

    // Productos
    totalProducts: 0,
    totalServices: 0,
    lowStockProducts: 0,

    // Ingresos estimados (basado en precios de servicios)
    estimatedRevenue: 0,
    estimatedRevenueThisMonth: 0,
  });

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [citasRes, productsRes, barbersRes] = await Promise.all([
        getCitas(),
        getAllProducts(),
        getBarbers(true),
      ]);

      const appointments = citasRes.data || [];
      const products = productsRes.data || [];
      const barbers = barbersRes.data || [];

      // Fechas
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Filtrar citas por estado
      const scheduled = appointments.filter((a) => a.status === "scheduled");
      const completed = appointments.filter((a) => a.status === "completed");
      const canceled = appointments.filter((a) => a.status === "canceled");
      const confirmed = appointments.filter((a) => a.status === "confirmed");

      // Citas por período
      const todayAppointments = appointments.filter((a) =>
        a.start_at?.startsWith(today)
      );

      const weekAppointments = appointments.filter((a) => {
        const appointmentDate = new Date(a.start_at);
        return appointmentDate >= startOfWeek;
      });

      const monthAppointments = appointments.filter((a) => {
        const appointmentDate = new Date(a.start_at);
        return appointmentDate >= startOfMonth;
      });

      // Servicios más solicitados
      const serviceCounts = {};
      appointments.forEach((appointment) => {
        const service = appointment.service || "Sin especificar";
        serviceCounts[service] = (serviceCounts[service] || 0) + 1;
      });

      const topServices = Object.entries(serviceCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Estadísticas por barbero
      // Crear mapa de barberos para lookup rápido
      const barbersMap = {};
      barbers.forEach((barber) => {
        barbersMap[barber.id] = barber.name;
      });

      const barberCounts = {};
      appointments.forEach((appointment) => {
        if (appointment.barber_id) {
          if (!barberCounts[appointment.barber_id]) {
            // Obtener nombre del barbero desde el mapa o desde la cita
            const barberName =
              barbersMap[appointment.barber_id] ||
              appointment.barber_name ||
              "Sin nombre";

            barberCounts[appointment.barber_id] = {
              id: appointment.barber_id,
              name: barberName,
              total: 0,
              completed: 0,
              scheduled: 0,
            };
          }
          barberCounts[appointment.barber_id].total++;
          if (appointment.status === "completed") {
            barberCounts[appointment.barber_id].completed++;
          }
          if (
            appointment.status === "scheduled" ||
            appointment.status === "confirmed"
          ) {
            barberCounts[appointment.barber_id].scheduled++;
          }
        }
      });

      const barberStats = Object.values(barberCounts).sort(
        (a, b) => b.total - a.total
      );

      // Calcular ingresos estimados (basado en precios de servicios)
      const servicesPriceMap = {};
      products
        .filter((p) => p.is_service === 0)
        .forEach((service) => {
          servicesPriceMap[service.name] = service.price;
        });

      let estimatedRevenue = 0;
      let estimatedRevenueThisMonth = 0;

      completed.forEach((appointment) => {
        const price = servicesPriceMap[appointment.service] || 0;
        estimatedRevenue += price;
      });

      monthAppointments
        .filter((a) => a.status === "completed")
        .forEach((appointment) => {
          const price = servicesPriceMap[appointment.service] || 0;
          estimatedRevenueThisMonth += price;
        });

      // Productos
      const lowStock = products.filter(
        (p) => p.is_service === 1 && p.stock <= p.min_stock
      );

      setStats({
        totalAppointments: appointments.length,
        scheduledAppointments: scheduled.length,
        completedAppointments: completed.length,
        canceledAppointments: canceled.length,
        confirmedAppointments: confirmed.length,

        appointmentsThisWeek: weekAppointments.length,
        appointmentsThisMonth: monthAppointments.length,
        appointmentsToday: todayAppointments.length,

        totalBarbers: barbers.length,
        activeBarbers: barbers.filter((b) => b.active).length,
        barberStats,

        topServices,

        totalProducts: products.filter((p) => p.is_service === 1).length,
        totalServices: products.filter((p) => p.is_service === 0).length,
        lowStockProducts: lowStock.length,

        estimatedRevenue,
        estimatedRevenueThisMonth,
      });
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Crear contenido HTML para el PDF
    const fecha = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const periodText =
      {
        week: "Esta Semana",
        month: "Este Mes",
        year: "Este Año",
        all: "Todo el Tiempo",
      }[dateRange] || "Todo el Tiempo";

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte Barbería</title>
  <style>
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      margin: 40px;
      color: #3e2723;
      background: #faf6f1;
    }
    .header {
      text-align: center;
      border-bottom: 4px solid #8b6f47;
      padding-bottom: 20px;
      margin-bottom: 30px;
      background: linear-gradient(135deg, #faf6f1 0%, #ffffff 100%);
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(101, 67, 33, 0.15);
    }
    h1 {
      color: #654321;
      margin: 0;
      font-size: 36px;
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(101, 67, 33, 0.1);
    }
    .date {
      color: #6d4c41;
      font-size: 14px;
      margin-top: 10px;
      font-style: italic;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      background: linear-gradient(135deg, #8b6f47 0%, #654321 100%);
      color: white;
      padding: 12px 18px;
      margin-bottom: 15px;
      border-radius: 8px;
      font-weight: bold;
      box-shadow: 0 2px 6px rgba(101, 67, 33, 0.3);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      border: 2px solid #d4a574;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      background: #ffffff;
      box-shadow: 0 2px 4px rgba(101, 67, 33, 0.1);
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #8b6f47;
    }
    .stat-label {
      font-size: 14px;
      color: #6d4c41;
      margin-top: 5px;
      font-weight: 500;
    }
    .revenue-card {
      background: linear-gradient(135deg, #f5e6d3 0%, #faf6f1 100%);
      border: 3px solid #8b6f47;
      border-radius: 10px;
      padding: 25px;
      margin-bottom: 15px;
      box-shadow: 0 4px 12px rgba(101, 67, 33, 0.2);
    }
    .revenue-value {
      font-size: 40px;
      font-weight: bold;
      color: #654321;
      text-shadow: 1px 1px 2px rgba(101, 67, 33, 0.1);
    }
    .service-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border-bottom: 2px solid #d4c4b0;
      background: #ffffff;
      transition: background 0.2s;
    }
    .service-item:hover {
      background: #faf6f1;
    }
    .service-rank {
      width: 35px;
      height: 35px;
      background: linear-gradient(135deg, #8b6f47 0%, #654321 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      font-weight: bold;
      box-shadow: 0 2px 6px rgba(101, 67, 33, 0.3);
    }
    .service-name {
      flex: 1;
      font-weight: 600;
      color: #3e2723;
    }
    .service-count {
      color: #6d4c41;
      font-size: 14px;
      font-weight: 500;
    }
    .barber-card {
      border: 2px solid #d4a574;
      border-radius: 10px;
      padding: 18px;
      margin-bottom: 15px;
      background: #ffffff;
      box-shadow: 0 2px 6px rgba(101, 67, 33, 0.15);
    }
    .barber-name {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #654321;
    }
    .barber-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 10px;
    }
    .barber-stat {
      text-align: center;
      padding: 10px;
      background: linear-gradient(135deg, #f5e6d3 0%, #faf6f1 100%);
      border-radius: 6px;
      border: 1px solid #d4a574;
    }
    .barber-stat-value {
      font-size: 22px;
      font-weight: bold;
      color: #8b6f47;
    }
    .barber-stat-label {
      font-size: 12px;
      color: #6d4c41;
      margin-top: 4px;
      font-weight: 500;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 3px solid #8b6f47;
      text-align: center;
      color: #6d4c41;
      font-size: 12px;
      font-style: italic;
    }
    @media print {
      body { margin: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Reporte de Barbería</h1>
    <div class="date">
      Generado el ${fecha}<br>
      Período: ${periodText}
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">📈 Métricas Generales</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.totalAppointments}</div>
        <div class="stat-label">Total Citas</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.completedAppointments}</div>
        <div class="stat-label">Completadas</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.scheduledAppointments}</div>
        <div class="stat-label">Programadas</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.canceledAppointments}</div>
        <div class="stat-label">Canceladas</div>
      </div>
    </div>
  </div>

  ${
    isAdmin
      ? `
  <div class="section">
    <h2 class="section-title">💰 Ingresos Estimados</h2>
    <div class="revenue-card">
      <div style="font-size: 18px; margin-bottom: 10px;">Este Mes</div>
      <div class="revenue-value">$${stats.estimatedRevenueThisMonth.toFixed(
        2
      )}</div>
      <div style="color: #666; margin-top: 8px;">
        Basado en ${stats.appointmentsThisMonth} citas este mes
      </div>
    </div>
    <div class="revenue-card">
      <div style="font-size: 18px; margin-bottom: 10px;">Total Histórico</div>
      <div class="revenue-value">$${stats.estimatedRevenue.toFixed(2)}</div>
      <div style="color: #666; margin-top: 8px;">
        Basado en ${stats.completedAppointments} citas completadas
      </div>
    </div>
  </div>
  `
      : ""
  }

  <div class="section">
    <h2 class="section-title">⭐ Top 5 Servicios Más Solicitados</h2>
    ${
      stats.topServices.length === 0
        ? '<p style="text-align: center; color: #666;">No hay datos de servicios aún</p>'
        : stats.topServices
            .map(
              (service, index) => `
        <div class="service-item">
          <div class="service-rank">${index + 1}</div>
          <div class="service-name">${service.name}</div>
          <div class="service-count">${service.count} citas</div>
        </div>
      `
            )
            .join("")
    }
  </div>

  ${
    stats.barberStats.length > 0
      ? `
  <div class="section">
    <h2 class="section-title">✂️ Rendimiento por Barbero</h2>
    ${stats.barberStats
      .map(
        (barber) => `
      <div class="barber-card">
        <div class="barber-name">${barber.name}</div>
        <div class="barber-stats">
          <div class="barber-stat">
            <div class="barber-stat-value">${barber.total}</div>
            <div class="barber-stat-label">Total</div>
          </div>
          <div class="barber-stat">
            <div class="barber-stat-value">${barber.completed}</div>
            <div class="barber-stat-label">Completadas</div>
          </div>
          <div class="barber-stat">
            <div class="barber-stat-value">${barber.scheduled}</div>
            <div class="barber-stat-label">Pendientes</div>
          </div>
        </div>
      </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  <div class="section">
    <h2 class="section-title">📦 Resumen de Inventario</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.totalServices}</div>
        <div class="stat-label">Servicios Disponibles</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalProducts}</div>
        <div class="stat-label">Productos</div>
      </div>
      ${
        stats.lowStockProducts > 0
          ? `
      <div class="stat-card" style="border-color: #d4a574; background: #fff3e0;">
        <div class="stat-value" style="color: #d4a574;">${stats.lowStockProducts}</div>
        <div class="stat-label" style="color: #8b6f47;">Stock Bajo</div>
      </div>
      `
          : ""
      }
    </div>
  </div>

  <div class="footer">
    ✂️ Sistema de Gestión de Barbería Brothers - Reporte generado automáticamente ✂️
  </div>
</body>
</html>
    `;

    // Crear ventana de impresión
    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Esperar a que se cargue el contenido y luego imprimir
    printWindow.onload = () => {
      printWindow.print();
      // Cerrar la ventana después de imprimir (opcional)
      // printWindow.close()
    };
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p>Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BarChart3 size={32} color="var(--color-primary)" />
          <h1 style={{ margin: 0 }}>Reportes y Estadísticas</h1>
        </div>

        <Button variant="primary" onClick={exportReport}>
          <Download size={20} />
          Exportar Reporte
        </Button>
      </div>

      {/* Filtros de período */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant={dateRange === "week" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setDateRange("week")}
        >
          Esta Semana
        </Button>
        <Button
          variant={dateRange === "month" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setDateRange("month")}
        >
          Este Mes
        </Button>
        <Button
          variant={dateRange === "year" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setDateRange("year")}
        >
          Este Año
        </Button>
        <Button
          variant={dateRange === "all" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setDateRange("all")}
        >
          Todo el Tiempo
        </Button>
      </div>

      {/* Métricas principales */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: 16 }}>
          Métricas Generales
        </h2>
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          <Card>
            <div style={{ padding: 20, textAlign: "center" }}>
              <Calendar
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
                {stats.totalAppointments}
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

          <Card>
            <div style={{ padding: 20, textAlign: "center" }}>
              <CheckCircle
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
                {stats.completedAppointments}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  marginTop: 4,
                }}
              >
                Completadas
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ padding: 20, textAlign: "center" }}>
              <Clock
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
                {stats.scheduledAppointments}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  marginTop: 4,
                }}
              >
                Programadas
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ padding: 20, textAlign: "center" }}>
              <XCircle
                size={32}
                color="var(--color-error)"
                style={{ marginBottom: 8 }}
              />
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 600,
                  color: "var(--color-error)",
                }}
              >
                {stats.canceledAppointments}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  marginTop: 4,
                }}
              >
                Canceladas
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Ingresos estimados */}
      {isAdmin && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: 16 }}>
            Ingresos Estimados
          </h2>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            }}
          >
            <Card>
              <div style={{ padding: 24 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <DollarSign size={28} color="var(--color-success)" />
                  <h3 style={{ margin: 0, fontSize: "1rem" }}>Este Mes</h3>
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: "var(--color-success)",
                  }}
                >
                  ${stats.estimatedRevenueThisMonth.toFixed(2)}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    marginTop: 8,
                  }}
                >
                  Basado en {stats.appointmentsThisMonth} citas este mes
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ padding: 24 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <TrendingUp size={28} color="var(--color-primary)" />
                  <h3 style={{ margin: 0, fontSize: "1rem" }}>
                    Total Histórico
                  </h3>
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                  }}
                >
                  ${stats.estimatedRevenue.toFixed(2)}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    marginTop: 8,
                  }}
                >
                  Basado en {stats.completedAppointments} citas completadas
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Servicios más solicitados */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: 16 }}>
          Top 5 Servicios Más Solicitados
        </h2>
        <Card>
          <div style={{ padding: 24 }}>
            {stats.topServices.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                }}
              >
                No hay datos de servicios aún
              </p>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {stats.topServices.map((service, index) => (
                  <div
                    key={service.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background:
                          index === 0
                            ? "var(--color-primary)"
                            : "var(--color-secondary)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{service.name}</div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {service.count} citas
                      </div>
                    </div>
                    <div
                      style={{
                        height: 8,
                        flex: 1,
                        background: "var(--color-background)",
                        borderRadius: 4,
                        overflow: "hidden",
                        maxWidth: 200,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${
                            (service.count / stats.topServices[0].count) * 100
                          }%`,
                          background:
                            index === 0
                              ? "var(--color-primary)"
                              : "var(--color-secondary)",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Rendimiento por barbero */}
      {stats.barberStats.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: 16 }}>
            Rendimiento por Barbero
          </h2>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            }}
          >
            {stats.barberStats.map((barber) => (
              <Card key={barber.id}>
                <div style={{ padding: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: "var(--color-primary)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Users size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1rem" }}>
                        {barber.name}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {barber.total} citas totales
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        textAlign: "center",
                        padding: 12,
                        background: "var(--color-background)",
                        borderRadius: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 600,
                          color: "var(--color-success)",
                        }}
                      >
                        {barber.completed}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-secondary)",
                          marginTop: 4,
                        }}
                      >
                        Completadas
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        padding: 12,
                        background: "var(--color-background)",
                        borderRadius: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 600,
                          color: "var(--color-warning)",
                        }}
                      >
                        {barber.scheduled}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-secondary)",
                          marginTop: 4,
                        }}
                      >
                        Pendientes
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Resumen de inventario */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: 16 }}>
          Resumen de Inventario
        </h2>
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          <Card>
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
                {stats.totalServices}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  marginTop: 4,
                }}
              >
                Servicios Disponibles
              </div>
            </div>
          </Card>

          <Card>
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
                {stats.totalProducts}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  marginTop: 4,
                }}
              >
                Productos en Inventario
              </div>
            </div>
          </Card>

          {stats.lowStockProducts > 0 && (
            <Card>
              <div style={{ padding: 20, textAlign: "center" }}>
                <Package
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
                  {stats.lowStockProducts}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    marginTop: 4,
                  }}
                >
                  Con Stock Bajo
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default ReportsPage;
