import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";

import CadastroUsuario from "./pages/CadastroUsuario";
import Agendamento from "./pages/Agendamento";
import Historico from "./pages/Historico";
import CadastroPet from "./pages/CadastroPet";
import NovoServico from "./pages/NovoServico";
import LoginUsuario from "./pages/LoginUsuario"
import Dashboard from "./pages/Dashboard"
import Perfil from "./pages/Perfil"
import Premium from "./pages/Premium"

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
        
        <Route path="/" element={<LayoutComSidebar> <Premium /> </LayoutComSidebar>} />

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
              <NovoServico />
            </LayoutComSidebar>
          }
        />

        <Route
          path="/Perfil"
          element={
            <LayoutComSidebar>
              <Perfil />
            </LayoutComSidebar>
          }
        />

        <Route
          path="/Premium"
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