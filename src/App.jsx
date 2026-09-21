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
import RecuperarSenha from "./pages/RecuperarSenha";

/* =========================================
   PÁGINAS ADMINISTRATIVAS
   ========================================= */

import DashboardADM from "./pages/ADM/DashboardADM";
import RelatoriosADM from "./pages/ADM/RelatoriosADM";
import EstabelecimentosADM from "./pages/ADM/EstabelecimentosADM";
import NovoEstabelecimentoADM from "./pages/ADM/NovoEstabelecimentoADM";

import EnderecoEstabelecimentoADM from "./pages/ADM/EnderecoEstabelecimentoADM";
import ServicosEstabelecimentoADM from "./pages/ADM/ServicosEstabelecimentoADM";
import HorariosEstabelecimentoADM from "./pages/ADM/HorariosEstabelecimentoADM";

import ServicosADM from "./pages/ADM/ServicosADM";
import NovoServicoADM from "./pages/ADM/NovoServicoADM";
import HorariosADM from "./pages/ADM/HorariosADM";
import AgendamentosADM from "./pages/ADM/AgendamentosADM";
import UsuariosADM from "./pages/ADM/UsuariosADM";

/* =========================================
   LAYOUT COM SIDEBAR DO USUÁRIO
   ========================================= */

function LayoutComSidebar({ children }) {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

/* =========================================
   ROTA PROTEGIDA — USUÁRIO
   ========================================= */

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

/* =========================================
   ROTA PÚBLICA
   ========================================= */

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

/* =========================================
   ROTA EXCLUSIVA DO ADMINISTRADOR
   ========================================= */

function AdminRoute({ children }) {
  const isAdmin =
    sessionStorage.getItem("petagenda_admin") === "true";

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================================
   APP
   ========================================= */

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* =================================
              ROTAS DE ACESSO — PÚBLICAS
              ================================= */}

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

          <Route
            path="/recuperarSenha"
            element={
              <PublicOnlyRoute>
                <RecuperarSenha />
              </PublicOnlyRoute>
            }
          />

          {/* =================================
              ROTAS PROTEGIDAS — USUÁRIO
              ================================= */}

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

          {/* =================================
              ÁREA ADMINISTRATIVA
              ================================= */}

          {/* Dashboard */}

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <DashboardADM />
              </AdminRoute>
            }
          />
          <Route
  path="/admin/relatorios"
  element={
    <AdminRoute>
      <RelatoriosADM />
    </AdminRoute>
  }
/>

          {/* =================================
              ESTABELECIMENTOS
              ================================= */}

          <Route
            path="/admin/estabelecimentos"
            element={
              <AdminRoute>
                <EstabelecimentosADM />
              </AdminRoute>
            }
          />

          {/* =================================
              NOVO ESTABELECIMENTO — ETAPA 1
              INFORMAÇÕES
              ================================= */}

          <Route
            path="/admin/estabelecimentos/novo"
            element={
              <AdminRoute>
                <NovoEstabelecimentoADM />
              </AdminRoute>
            }
          />

          {/* =================================
              NOVO ESTABELECIMENTO — ETAPA 2
              ENDEREÇO
              ================================= */}

          <Route
            path="/admin/estabelecimentos/novo/endereco"
            element={
              <AdminRoute>
                <EnderecoEstabelecimentoADM />
              </AdminRoute>
            }
          />

          {/* =================================
              NOVO ESTABELECIMENTO — ETAPA 3
              SERVIÇOS
              ================================= */}

          <Route
            path="/admin/estabelecimentos/novo/servicos"
            element={
              <AdminRoute>
                <ServicosEstabelecimentoADM />
              </AdminRoute>
            }
          />

          {/* =================================
              NOVO ESTABELECIMENTO — ETAPA 4
              HORÁRIOS
              ================================= */}

          <Route
            path="/admin/estabelecimentos/novo/horarios"
            element={
              <AdminRoute>
                <HorariosEstabelecimentoADM />
              </AdminRoute>
            }
          />

          {/* =================================
              ADMIN — SERVIÇOS
              ================================= */}

          <Route
            path="/admin/servicos"
            element={
              <AdminRoute>
                <ServicosADM />
              </AdminRoute>
            }
            
          />

          <Route
  path="/admin/servicos/novo"
  element={
    <AdminRoute>
      <NovoServicoADM />
    </AdminRoute>
  }
/>

          {/* =================================
              ADMIN — HORÁRIOS
              ================================= */}

          <Route
            path="/admin/horarios"
            element={
              <AdminRoute>
                <HorariosADM />
              </AdminRoute>
            }
          />

          {/* =================================
              ADMIN — AGENDAMENTOS
              ================================= */}

          <Route
            path="/admin/agendamentos"
            element={
              <AdminRoute>
                <AgendamentosADM />
              </AdminRoute>
            }
          />

          {/* =================================
              ADMIN — USUÁRIOS
              ================================= */}

          <Route
            path="/admin/usuarios"
            element={
              <AdminRoute>
                <UsuariosADM />
              </AdminRoute>
            }
          />

          {/* =================================
              ROTA CORINGA
              ================================= */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;