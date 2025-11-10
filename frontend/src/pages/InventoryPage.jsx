import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../lib/productsService";
import ProductCard from "../components/inventory/ProductCard";
import ProductForm from "../components/inventory/ProductForm";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Toast from "../components/common/Toast";
import { Plus, Package, Scissors, Filter } from "lucide-react";

const InventoryPage = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'products', 'services'
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Cargar productos
  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await getAllProducts();

    if (error) {
      console.error("Error cargando productos:", error);
      showToast("Error al cargar inventario", "error");
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filtrar productos
  useEffect(() => {
    let filtered = products;

    if (filter === "products") {
      filtered = products.filter((p) => p.is_service === 1);
    } else if (filter === "services") {
      filtered = products.filter((p) => p.is_service === 0);
    }

    setFilteredProducts(filtered);
  }, [products, filter]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

  // Crear o actualizar producto
  const handleSave = async (payload) => {
    try {
      if (editingProduct) {
        const { error } = await updateProduct(editingProduct.id, payload);
        if (error) throw new Error(error.message);
        showToast("Producto actualizado correctamente", "success");
      } else {
        const { error } = await createProduct(payload);
        if (error) throw new Error(error.message);
        showToast("Producto creado correctamente", "success");
      }

      setShowForm(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      showToast(err.message || "Error al guardar producto", "error");
      throw err;
    }
  };

  // Eliminar producto
  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar "${product.name}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      const { error } = await deleteProduct(product.id);
      if (error) throw new Error(error.message);

      showToast(`"${product.name}" eliminado correctamente`, "success");
      loadProducts();
    } catch (err) {
      showToast(err.message || "Error al eliminar producto", "error");
    }
  };

  // Abrir formulario para editar
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // Cancelar formulario
  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // Abrir formulario para crear
  const handleCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  // Estadísticas
  const stats = {
    total: products.length,
    products: products.filter((p) => p.is_service === 1).length,
    services: products.filter((p) => p.is_service === 0).length,
    lowStock: products.filter(
      (p) => p.is_service === 1 && p.stock <= p.min_stock
    ).length,
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p>Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Toast de notificaciones */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

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
          <Package size={32} color="var(--color-primary)" />
          <h1 style={{ margin: 0 }}>Inventario</h1>
        </div>

        {isAdmin && !showForm && (
          <Button variant="primary" onClick={handleCreate}>
            <Plus size={20} />
            Agregar Producto/Servicio
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          marginBottom: 24,
        }}
      >
        <Card>
          <div style={{ padding: "16px", textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 600,
                color: "var(--color-primary)",
              }}
            >
              {stats.total}
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                marginTop: 4,
              }}
            >
              Total Items
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ padding: "16px", textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 600,
                color: "var(--color-success)",
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

        <Card>
          <div style={{ padding: "16px", textAlign: "center" }}>
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

        {stats.lowStock > 0 && (
          <Card>
            <div style={{ padding: "16px", textAlign: "center" }}>
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

      {/* Formulario de creación/edición */}
      {showForm && isAdmin && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ padding: "24px" }}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>
              {editingProduct
                ? "Editar Producto/Servicio"
                : "Nuevo Producto/Servicio"}
            </h2>
            <ProductForm
              initialData={editingProduct}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </Card>
      )}

      {/* Filtros */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <Filter size={20} color="var(--color-text-secondary)" />
        <Button
          variant={filter === "all" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Todos ({stats.total})
        </Button>
        <Button
          variant={filter === "products" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setFilter("products")}
        >
          <Package size={16} />
          Productos ({stats.products})
        </Button>
        <Button
          variant={filter === "services" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setFilter("services")}
        >
          <Scissors size={16} />
          Servicios ({stats.services})
        </Button>
      </div>

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <Card>
          <div style={{ padding: "48px", textAlign: "center" }}>
            <Package
              size={48}
              color="var(--color-text-secondary)"
              style={{ marginBottom: 16 }}
            />
            <h3
              style={{
                margin: "0 0 8px 0",
                color: "var(--color-text-secondary)",
              }}
            >
              {filter === "all"
                ? "No hay productos o servicios"
                : filter === "products"
                ? "No hay productos"
                : "No hay servicios"}
            </h3>
            {isAdmin && (
              <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                Agrega el primer item para comenzar
              </p>
            )}
          </div>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          }}
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
