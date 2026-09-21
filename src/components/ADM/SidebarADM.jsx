import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo-petagenda.png";

function SidebarADM() {
  const location = useLocation();

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

      <div className="sidebar-adm-rodape">
        MVP • PC / Desktop
      </div>
    </aside>
  );
}

export default SidebarADM;