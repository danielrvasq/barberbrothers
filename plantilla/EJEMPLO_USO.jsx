import Layout from "./components/layout/Layout";
import Card from "./components/common/Card";
import Button from "./components/common/Button";
import Toast from "./components/common/Toast";
import { useState } from "react";
import "./styles/global.css";
import "./styles/components.css";

// Ejemplo de items del menú
const menuItems = [
  { path: "/dashboard", icon: "🏠", label: "Inicio" },
  { path: "/users", icon: "👥", label: "Usuarios" },
  { path: "/settings", icon: "⚙️", label: "Configuración" },
  { path: "/reports", icon: "📊", label: "Reportes" },
];

function App() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleLogout = () => {
    showToast("Sesión cerrada exitosamente", "success");
    // Aquí agregarías tu lógica de logout
  };

  return (
    <Layout menuItems={menuItems} appName="Mi App" onLogout={handleLogout}>
      <div style={{ padding: "2rem" }}>
        <h1>Bienvenido a la Plantilla</h1>
        <p>
          Esta es una plantilla reutilizable con componentes listos para usar.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          <Card
            title="Card de Ejemplo"
            subtitle="Con título y subtítulo"
            icon="📦"
            footer={
              <Button onClick={() => showToast("Card clickeada!")}>
                Ver más
              </Button>
            }
          >
            Este es un ejemplo de una tarjeta con todos los elementos.
          </Card>

          <Card
            title="Otra Card"
            icon="🎨"
            footer={
              <>
                <Button variant="secondary">Cancelar</Button>
                <Button
                  onClick={() => showToast("Acción ejecutada", "success")}
                >
                  Guardar
                </Button>
              </>
            }
          >
            Cards con múltiples botones en el footer.
          </Card>

          <Card
            title="Card Simple"
            onClick={() => showToast("Card simple clickeada", "info")}
          >
            Esta card es clickeable completa.
          </Card>
        </div>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <Button onClick={() => showToast("Success!", "success")}>
            Success Toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => showToast("Error!", "error")}
          >
            Error Toast
          </Button>
          <Button
            variant="danger"
            onClick={() => showToast("Warning!", "warning")}
          >
            Warning Toast
          </Button>
          <Button variant="ghost" onClick={() => showToast("Info!", "info")}>
            Info Toast
          </Button>
        </div>
      </div>

      <Toast visible={toastVisible} message={toastMessage} type={toastType} />
    </Layout>
  );
}

export default App;
