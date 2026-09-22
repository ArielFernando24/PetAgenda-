import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo-petagenda.png";

function SidebarADM() {
  const location = useLocation();
  const navigate = useNavigate();

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
    sessionStorage.removeItem("petagenda_admin");
    navigate("/login");
  }

  const links = [
    {
      label: "Dashboard",
      path: "/admin",
    },
    {
      label: "Estabelecimentos",
      path: "/admin/estabelecimentos",
    },
    {
      label: "Serviços",
      path: "/admin/servicos",
    },
    {
      label: "Horários",
      path: "/admin/horarios",
    },
    {
      label: "Agendamentos",
      path: "/admin/agendamentos",
    },
    {
      label: "Usuários",
      path: "/admin/usuarios",
    },
  ];

  return (
    <aside className="sidebar-adm">
      <div className="logo-adm">
        <div className="logo-adm-image-container">
          <img
            src={logo}
            alt="Logo PetAgenda"
            className="logo-adm-image"
          />
        </div>

        <span>PetAgenda</span>
      </div>

      <nav className="menu-adm">
        {links.map((link) => {
          const ativo =
            link.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(link.path);

          return (
            <Link
              key={link.path}
              to={link.path}
              className={ativo ? "active" : ""}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div
        ref={menuContasRef}
        className={`menu-contas ${menuContasAberto ? "aberto" : ""}`}
      >
        {menuContasAberto && (
          <>
            <Link
              to="/admin"
              className="item-conta-adm item-conta-secundario"
            >
              <span className="icone">👤</span>
              <span>Administrador 1</span>
            </Link>

            <button
              type="button"
              className="item-conta-adm item-conta-adicionar"
              onClick={handleLogout}
            >
              <span className="icone">🚪</span>
              <span>Sair da conta</span>
            </button>
          </>
        )}

        <button
          type="button"
          className="item-conta-adm item-conta-principal"
          onClick={() =>
            setMenuContasAberto((aberto) => !aberto)
          }
          aria-expanded={menuContasAberto}
        >
          <span className="icone">👤</span>
          <span>Administrador</span>
        </button>
      </div>
    </aside>
  );
}

export default SidebarADM;