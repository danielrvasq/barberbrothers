import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import CitasPage from "./pages/CitasPage";
import BarbersPage from "./pages/BarbersPage";
import InventoryPage from "./pages/InventoryPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import Layout from "./components/layout/Layout";
import UserProfile from "./components/common/UserProfile";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={isAdmin() ? "/" : "/citas"} replace />
            ) : (
              <LoginPage />
            )
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              {isAdmin() ? (
                <Layout pageTitle="Inicio">
                  <LandingPage />
                </Layout>
              ) : (
                <Navigate to="/citas" replace />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventario"
          element={
            <ProtectedRoute adminOnly>
              <Layout pageTitle="Inventario">
                <InventoryPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/citas"
          element={
            <ProtectedRoute>
              <Layout pageTitle="Citas">
                <CitasPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/barberos"
          element={
            <ProtectedRoute adminOnly>
              <Layout pageTitle="Barberos">
                <BarbersPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reportes"
          element={
            <ProtectedRoute adminOnly>
              <Layout pageTitle="Reportes">
                <ReportsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <ProtectedRoute adminOnly>
              <Layout pageTitle="Usuarios">
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Layout pageTitle="Panel de Administración">
                <div className="container">
                  <h2>Panel de Administración</h2>
                  <p className="muted">Solo accesible para administradores</p>
                  <UserProfile />
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            user ? (
              <Navigate to={isAdmin() ? "/" : "/citas"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
