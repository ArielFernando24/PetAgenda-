import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo-petagenda.png";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuContasAberto, setMenuContasAberto] = useState(false);
  const menuContasRef = useRef(null);

  useEffect(() => {
    function fecharAoClicarFora(event) {
      if (
        menuContasRef.current &&
        !menuContasRef.current.contains(event.target)
      ) {
        setMenuContasAberto(false);
      }
    }

    document.addEventListener("mousedown", fecharAoClicarFora);

    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
    };
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const nomeExibicao = user?.nome ? user.nome.split(" ")[0] : "Tutor";

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

      <div
        ref={menuContasRef}
        className={`menu-contas ${menuContasAberto ? "aberto" : ""}`}
      >
        {menuContasAberto && (
          <>
            <Link to="/perfil" className="item-conta item-conta-secundario">
              <span className="icone">👤</span>
              <span>Meu perfil</span>
            </Link>

            <button
              type="button"
              className="item-conta item-conta-adicionar"
              onClick={handleLogout}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                color: "#ff6b6b",
              }}
            >
              <span className="icone">🚪</span>
              <span>Sair da conta</span>
            </button>
          </>
        )}

        <button
          type="button"
          className="item-conta item-conta-principal"
          onClick={() => setMenuContasAberto((aberto) => !aberto)}
          aria-expanded={menuContasAberto}
        >
          <span className="icone">👤</span>
          <span>{nomeExibicao}</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
