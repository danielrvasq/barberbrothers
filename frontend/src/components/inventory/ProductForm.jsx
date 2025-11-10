import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import { AlertCircle } from "lucide-react";

const ProductForm = ({ initialData = null, onSave, onCancel }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("product");
  const [isService, setIsService] = useState(1);
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos iniciales para edición
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setSku(initialData.sku || "");
      setCategory(initialData.category || "product");
      setIsService(initialData.is_service ?? 1);
      setPrice(initialData.price || "");
      setCost(initialData.cost || "");
      setStock(initialData.stock || "");
      setMinStock(initialData.min_stock || "");
    }
  }, [initialData]);

  // Sincronizar is_service con category
  useEffect(() => {
    if (category === "service") {
      setIsService(0);
      setStock("0");
      setMinStock("0");
    } else {
      setIsService(1);
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        sku: sku.trim().toUpperCase(),
        category: category,
        is_service: isService,
        price: parseFloat(price),
        cost: parseFloat(cost) || 0,
        stock: parseInt(stock) || 0,
        min_stock: parseInt(minStock) || 0,
      };

      // Validaciones
      if (payload.price <= 0) {
        throw new Error("El precio debe ser mayor a 0");
      }

      if (isService === 0) {
        payload.stock = 0;
        payload.min_stock = 0;
      }

      await onSave(payload);
    } catch (err) {
      console.error("Error en onSave:", err);
      setError(err?.message || String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: 12, maxWidth: 720 }}
    >
      {error && (
        <div
          style={{
            padding: "12px",
            background: "var(--color-error-light)",
            color: "var(--color-error)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <label style={{ gridColumn: "1 / -1" }}>
          <strong>Nombre *</strong>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del producto o servicio"
            required
            maxLength={100}
          />
        </label>

        <label>
          <strong>SKU *</strong>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="PROD-001"
            required
            maxLength={50}
          />
          <small style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>
            Código único del producto
          </small>
        </label>

        <label>
          <strong>Categoría *</strong>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="product">Producto (inventario físico)</option>
            <option value="service">Servicio (intangible)</option>
          </select>
        </label>
      </div>

      <label>
        <strong>Descripción</strong>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción detallada del producto o servicio..."
          rows={3}
          maxLength={500}
        />
      </label>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <label>
          <strong>Precio de Venta * ($)</strong>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
          />
        </label>

        <label>
          <strong>Costo ($)</strong>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          <small style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>
            Costo de adquisición
          </small>
        </label>
      </div>

      {isService === 1 && (
        <div
          style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}
        >
          <label>
            <strong>Stock Actual</strong>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              min="0"
            />
          </label>

          <label>
            <strong>Stock Mínimo</strong>
            <input
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              placeholder="0"
              min="0"
            />
            <small
              style={{ color: "var(--color-text-secondary)", marginTop: 4 }}
            >
              Alerta cuando el stock sea menor
            </small>
          </label>
        </div>
      )}

      {isService === 0 && (
        <div
          style={{
            padding: "12px",
            background: "var(--color-primary-light)",
            borderRadius: "8px",
            fontSize: "0.875rem",
          }}
        >
          ℹ️ Los servicios no manejan inventario físico
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "flex-end",
          marginTop: 8,
        }}
      >
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
