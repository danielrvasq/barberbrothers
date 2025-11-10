import React from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import { User, Phone, Mail, Award, CheckCircle, XCircle } from "lucide-react";

const BarberCard = ({ barber, onEdit, onToggleActive, isAdmin = false }) => {
  return (
    <Card>
      <div style={{ padding: "16px" }}>
        {/* Header con nombre y estado */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <User size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>
                {barber.name}
              </h3>
              {barber.specialty && (
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Award size={14} />
                  {barber.specialty}
                </p>
              )}
            </div>
          </div>

          {/* Badge de estado */}
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "0.75rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: barber.active
                ? "var(--color-success-light)"
                : "var(--color-error-light)",
              color: barber.active
                ? "var(--color-success)"
                : "var(--color-error)",
            }}
          >
            {barber.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {barber.active ? "Activo" : "Inactivo"}
          </span>
        </div>

        {/* Información de contacto */}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {barber.phone && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              <Phone size={16} />
              <span>{barber.phone}</span>
            </div>
          )}

          {barber.email && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              <Mail size={16} />
              <span>{barber.email}</span>
            </div>
          )}
        </div>

        {/* Biografía */}
        {barber.bio && (
          <p
            style={{
              marginTop: 12,
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            {barber.bio}
          </p>
        )}

        {/* Acciones (solo para admin) */}
        {isAdmin && (
          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid var(--color-border)",
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(barber)}
            >
              Editar
            </Button>
            <Button
              variant={barber.active ? "danger" : "primary"}
              size="sm"
              onClick={() => onToggleActive(barber)}
            >
              {barber.active ? "Desactivar" : "Activar"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BarberCard;
