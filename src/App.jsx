import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";

import CadastroUsuario from "./pages/CadastroUsuario";
import Agendamento from "./pages/Agendamento";
import Historico from "./pages/Historico";
import CadastroPet from "./pages/CadastroPet";
import Servico from "./pages/Servico";
import NovoServico from "./pages/NovoServico";
import LoginUsuario from "./pages/LoginUsuario";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Premium from "./pages/Premium";
import MeusPets from "./pages/MeusPets";

// Layout que inclui a barra lateral para as telas internas
function LayoutComSidebar({ children }) {
  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rota raiz abre direto a tela de Login (sem Sidebar) */}
        <Route path="/" element={<LoginUsuario />} />

        {/* Caso queira uma rota explícita /login também */}
        <Route path="/login" element={<LoginUsuario />} />

        {/* Tela de cadastro de usuário */}
        <Route path="/cadastro" element={<CadastroUsuario />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <LayoutComSidebar>
              <Dashboard />
            </LayoutComSidebar>
          }
        />

        {/* Lista de pets */}
        <Route
          path="/meus-pets"
          element={
            <LayoutComSidebar>
              <MeusPets />
            </LayoutComSidebar>
          }
        />

        {/* Cadastro de um novo pet */}
        <Route
          path="/cadastro-pet"
          element={
            <LayoutComSidebar>
              <CadastroPet />
            </LayoutComSidebar>
          }
        />

        {/* Agenda */}
        <Route
          path="/agenda"
          element={
            <LayoutComSidebar>
              <Agendamento />
            </LayoutComSidebar>
          }
        />

        {/* Histórico */}
        <Route
          path="/historico"
          element={
            <LayoutComSidebar>
              <Historico />
            </LayoutComSidebar>
          }
        />

        {/* Serviços */}
        <Route
          path="/servicos"
          element={
            <LayoutComSidebar>
              <Servico />
            </LayoutComSidebar>
          }
        />

        <Route
  path="/novo-servico"
  element={
    <LayoutComSidebar>
      <NovoServico />
    </LayoutComSidebar>
  }
/>

        {/* Perfil */}
        <Route
          path="/perfil"
          element={
            <LayoutComSidebar>
              <Perfil />
            </LayoutComSidebar>
          }
        />

        {/* Premium */}
        <Route
          path="/premium"
          element={
            <LayoutComSidebar>
              <Premium />
            </LayoutComSidebar>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;