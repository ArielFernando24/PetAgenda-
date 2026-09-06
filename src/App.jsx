import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";

import CadastroUsuario from "./pages/CadastroUsuario";
import Agendamento from "./pages/Agendamento";
import Historico from "./pages/Historico";
import CadastroPet from "./pages/CadastroPet";
import NovoServico from "./pages/NovoServico";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<CadastroPet />} />

            <Route path="/dashboard" element={<CadastroUsuario />} />
            <Route path="/meus-pets" element={<CadastroPet />} />
            <Route path="/agenda" element={<Agendamento />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/servicos" element={<NovoServico />} />
            <Route path="/perfil" element={<CadastroUsuario />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;