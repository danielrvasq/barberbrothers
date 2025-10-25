import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import CitasPage from './pages/CitasPage'
import Layout from './layout/Layout'
import UserProfile from './components/UserProfile'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout pageTitle="Inicio">
                <LandingPage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/inventario" 
          element={
            <ProtectedRoute>
              <Layout pageTitle="Inventario">
                <div className="container">
                  <h2>Gestión de Inventario</h2>
                  <p className="muted">Próximamente: CRUD de productos y stock</p>
                </div>
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
          path="/reportes" 
          element={
            <ProtectedRoute>
              <Layout pageTitle="Reportes">
                <div className="container">
                  <h2>Reportes y Estadísticas</h2>
                  <p className="muted">Próximamente: Métricas y exportación</p>
                </div>
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
