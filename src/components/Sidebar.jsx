import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo-petagenda.png";

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-image-container">
          <img src={logo} alt="Logo PetAgenda" className="logo-image" />
        </div>

        <span>PetAgenda</span>
      </div>

      <nav className="menu">
        <Link
          to="/dashboard"
          className={location.pathname === "/dashboard" ? "active" : ""}
        >
          Dashboard
        </Link>

        <Link
          to="/meus-pets"
          className={location.pathname === "/meus-pets" ? "active" : ""}
        >
          Meus pets
        </Link>

        <Link
          to="/agenda"
          className={location.pathname === "/agenda" ? "active" : ""}
        >
          Agenda
        </Link>

        <Link
          to="/historico"
          className={location.pathname === "/historico" ? "active" : ""}
        >
          Histórico
        </Link>

        <Link
          to="/servicos"
          className={location.pathname === "/servicos" ? "active" : ""}
        >
          Serviços
        </Link>

        <Link
          to="/perfil"
          className={location.pathname === "/perfil" ? "active" : ""}
        >
          Perfil
        </Link>
      </nav>

      <div className="user">👤 Usuário</div>
    </aside>
  );
}

export default Sidebar;