import React from "react";
import { formatDate, formatTime } from "../../lib/businessHours";

const CitasList = ({ citas = [], onEdit, onDelete }) => {
  if (!citas || citas.length === 0) {
    return (
      <div className="panel" style={{ padding: 16, textAlign: "center" }}>
        <p className="muted">No hay citas registradas</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { label: "Agendada", color: "var(--color-info)" },
      confirmed: { label: "Confirmada", color: "var(--color-success)" },
      completed: { label: "Completada", color: "var(--color-wood-medium)" },
      canceled: { label: "Cancelada", color: "var(--color-error)" },
    };
    const badge = badges[status] || {
      label: status,
      color: "var(--color-text-secondary)",
    };
    return (
      <span
        style={{
          display: "inline-block",
          padding: "4px 10px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: 600,
          background: badge.color + "20",
          color: badge.color,
          border: `1.5px solid ${badge.color}40`,
        }}
      >
        {badge.label}
      </span>
    );
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {citas.map((c) => (
        <div
          key={c.id}
          className="card"
          style={{
            padding: 16,
            opacity:
              c.status === "canceled" || c.status === "completed" ? 0.6 : 1,
            filter: c.status === "canceled" ? "grayscale(50%)" : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <strong style={{ fontSize: 16 }}>{c.service}</strong>
                {getStatusBadge(c.status)}
              </div>

              <div
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                📅 {formatDate(new Date(c.start_at))}
              </div>
              <div
                style={{ color: "var(--color-text-secondary)", fontSize: 14 }}
              >
                🕐 {formatTime(new Date(c.start_at))}
              </div>

              {c.barber && (
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  <span style={{ fontWeight: 500 }}>Barbero:</span>{" "}
                  {c.barber.name}
                  {c.barber.specialty && (
                    <span className="muted"> · {c.barber.specialty}</span>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {c.status === "scheduled" && (
                <>
                  <button
                    onClick={() => onEdit(c)}
                    className="btn btn-sm btn-ghost"
                    title="Editar cita"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="btn btn-sm btn-danger"
                    title="Cancelar cita"
                  >
                    ❌
                  </button>
                </>
              )}
            </div>
          </div>

          {c.notes && (
            <div
              style={{
                marginTop: 12,
                padding: 10,
                background: "var(--color-wood-bg)",
                borderRadius: 6,
                fontSize: 14,
                borderLeft: "3px solid var(--color-wood-medium)",
              }}
            >
              <strong style={{ color: "var(--color-wood-dark)" }}>Notas:</strong> {c.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CitasList;
