import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        padding: "16px",
      }}
    >
      <div
        className="panel"
        style={{ maxWidth: 460, width: "100%", padding: "24px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#e5e7eb" />
              <path
                d="M20 35 L28 35 L28 45 M36 35 L44 35 L44 45 M24 25 L24 32 M40 25 L40 32"
                stroke="#11181c"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M18 32 C18 32 22 28 32 28 C42 28 46 32 46 32"
                stroke="#11181c"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Barbería Brothers</h1>
          <p className="muted">Sistema de Gestión Integral</p>
        </div>

        <p className="muted" style={{ textAlign: "center", marginBottom: 16 }}>
          Inicia sesión con tu cuenta de Google para acceder al sistema
        </p>

        {error && (
          <div
            style={{
              background: "#fff0f1",
              border: "1px solid #fecdd3",
              color: "#991b1b",
              borderRadius: 8,
              padding: 10,
              marginBottom: 12,
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn btn-primary"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <svg
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          <span>
            {loading ? "Iniciando sesión..." : "Continuar con Google"}
          </span>
        </button>

        <div
          style={{
            marginTop: 20,
            borderTop: "1px solid var(--border)",
            paddingTop: 16,
          }}
        >
        </div>

        <div style={{ marginTop: 16 }}>
          <p className="muted" style={{ fontSize: 12, textAlign: "center" }}>
            Sistema seguro con autenticación de Google
          </p>
        </div>
      </div>
    </div>
  );
}
