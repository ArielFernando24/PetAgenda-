import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">PetAgenda</div>

      <nav className="menu">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/meus-pets">Meus pets</Link>
        <Link to="/agenda">Agenda</Link>
        <Link to="/historico">Histórico</Link>
        <Link to="/servicos" className="active">
          Serviços
        </Link>
        <Link to="/perfil">Perfil</Link>
      </nav>

      <div className="user">👤 Usuário</div>
    </aside>
  );
}

export default Sidebar;