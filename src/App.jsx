import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";

import CadastroUsuario from "./pages/CadastroUsuario";
import Agendamento from "./pages/Agendamento";
import Historico from "./pages/Historico";
import CadastroPet from "./pages/CadastroPet";
import Servico from "./pages/Servico";
import LoginUsuario from "./pages/LoginUsuario";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Premium from "./pages/Premium";

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
        
        {/* Tela de cadastro de usuário separada se precisar */}
        <Route path="/cadastro" element={<CadastroUsuario />} />

        {/* Telas internas do sistema (com Sidebar) */}
        <Route
          path="/dashboard"
          element={
            <LayoutComSidebar>
              <Dashboard />
            </LayoutComSidebar>
          }
        />

        <Route
          path="/meus-pets"
          element={
            <LayoutComSidebar>
              <CadastroPet />
            </LayoutComSidebar>
          }
        />

        <Route
          path="/agenda"
          element={
            <LayoutComSidebar>
              <Agendamento />
            </LayoutComSidebar>
          }
        />

        <Route
          path="/historico"
          element={
            <LayoutComSidebar>
              <Historico />
            </LayoutComSidebar>
          }
        />

        <Route
          path="/servicos"
          element={
            <LayoutComSidebar>
              <Servico />
            </LayoutComSidebar>
          }
        />

        <Route
          path="/perfil"
          element={
            <LayoutComSidebar>
              <Perfil />
            </LayoutComSidebar>
          }
        />

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