import React from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import { Package, DollarSign, AlertTriangle, Scissors } from "lucide-react";

const ProductCard = ({ product, onEdit, onDelete, isAdmin = false }) => {
  const isLowStock =
    product.is_service === 1 && product.stock <= product.min_stock;
  const margin =
    product.cost > 0
      ? (((product.price - product.cost) / product.price) * 100).toFixed(1)
      : 0;

  return (
    <Card>
      <div style={{ padding: "16px" }}>
        {/* Header con nombre y tipo */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "8px",
                background:
                  product.is_service === 0
                    ? "var(--color-secondary)"
                    : "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              {product.is_service === 0 ? (
                <Scissors size={24} />
              ) : (
                <Package size={24} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
                {product.name}
              </h3>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                SKU: {product.sku}
              </p>
            </div>
          </div>

          {/* Badge de tipo */}
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "0.75rem",
              fontWeight: 600,
              background:
                product.is_service === 0
                  ? "var(--color-secondary-light)"
                  : "var(--color-primary-light)",
              color:
                product.is_service === 0
                  ? "var(--color-secondary)"
                  : "var(--color-primary)",
              whiteSpace: "nowrap",
            }}
          >
            {product.is_service === 0 ? "Servicio" : "Producto"}
          </span>
        </div>

        {/* Descripción */}
        {product.description && (
          <p
            style={{
              marginTop: 8,
              marginBottom: 12,
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.4,
            }}
          >
            {product.description}
          </p>
        )}

        {/* Precios */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
            gap: 12,
            padding: "12px",
            background: "var(--color-background)",
            borderRadius: "8px",
            marginTop: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-secondary)",
                marginBottom: 4,
              }}
            >
              Precio
            </div>
            <div
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--color-success)",
              }}
            >
              ${product.price.toFixed(2)}
            </div>
          </div>

          {product.cost > 0 && (
            <>
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  Costo
                </div>
                <div style={{ fontSize: "1.125rem", fontWeight: 600 }}>
                  ${product.cost.toFixed(2)}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  Margen
                </div>
                <div
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                  }}
                >
                  {margin}%
                </div>
              </div>
            </>
          )}
        </div>

        {/* Stock (solo productos) */}
        {product.is_service === 1 && (
          <div
            style={{
              marginTop: 12,
              padding: "12px",
              background: isLowStock
                ? "var(--color-warning-light)"
                : "var(--color-background)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isLowStock && (
                <AlertTriangle size={16} color="var(--color-warning)" />
              )}
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                Stock: {product.stock} unidades
              </span>
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Mín: {product.min_stock}
            </span>
          </div>
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
              onClick={() => onEdit(product)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(product)}
            >
              Eliminar
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
