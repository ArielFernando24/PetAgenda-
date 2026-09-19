import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import CadastroUsuario from "./pages/CadastroUsuario";
import Agendamento from "./pages/Agendamento";
import Historico from "./pages/Historico";
import CadastroPet from "./pages/CadastroPet";
import Servico from "./pages/Servico";
import NovoServico from "./pages/NovoServico";
import LoginUsuario from "./pages/LoginUsuario";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import AlterarPerfil from "./pages/AlterarPerfil";
import Premium from "./pages/Premium";
import MeusPets from "./pages/MeusPets";


// Layout que inclui a barra lateral para as telas internas
function LayoutComSidebar({ children }) {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

// Rota protegida: exige login
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontFamily: "inherit",
          color: "#38598b",
          fontSize: "18px",
        }}
      >
        <p>Carregando PetAgenda...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <LayoutComSidebar>{children}</LayoutComSidebar>;
}

// Rota pública: redireciona para dashboard se já estiver logado
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas de Acesso (Públicas) */}
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <LoginUsuario />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginUsuario />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/cadastro"
            element={
              <PublicOnlyRoute>
                <CadastroUsuario />
              </PublicOnlyRoute>
            }
          />

          {/* Rotas Protegidas (Exigem autenticação) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meus-pets"
            element={
              <ProtectedRoute>
                <MeusPets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cadastro-pet"
            element={
              <ProtectedRoute>
                <CadastroPet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agenda"
            element={
              <ProtectedRoute>
                <Agendamento />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historico"
            element={
              <ProtectedRoute>
                <Historico />
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicos"
            element={
              <ProtectedRoute>
                <Servico />
              </ProtectedRoute>
            }
          />
          <Route
            path="/novo-servico"
            element={
              <ProtectedRoute>
                <NovoServico />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />

          <Route
  path="/alterar-perfil"
  element={
    <ProtectedRoute>
      <AlterarPerfil />
    </ProtectedRoute>
  }
/>
          <Route
            path="/premium"
            element={
              <ProtectedRoute>
                <Premium />
              </ProtectedRoute>
            }
          />

          {/* Rota coringa: redireciona para login ou dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;