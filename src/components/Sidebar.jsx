import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo-petagenda.png";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuContasAberto, setMenuContasAberto] = useState(false);
  const [painelNotificacoesAberto, setPainelNotificacoesAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState([
    { id: 1, titulo: "Notif 1", texto: "Há 6 horas", lida: false },
    { id: 2, titulo: "Notif 2", texto: "Há 18 horas", lida: false },
    { id: 3, titulo: "Notif 3", texto: "Há 1 dia", lida: false },
    { id: 4, titulo: "Notif 4", texto: "Há 4 dias", lida: false },
    { id: 5, titulo: "Notif 5", texto: "Há 5 dias", lida: false },
    { id: 6, titulo: "Notif 6", texto: "Há uma semana", lida: false },
  ]);
  const menuContasRef = useRef(null);
  const notificacoesRef = useRef(null);

  useEffect(() => {
    function fecharAoClicarFora(event) {
      if (
        menuContasRef.current &&
        !menuContasRef.current.contains(event.target)
      ) {
        setMenuContasAberto(false);
      }

      if (
        notificacoesRef.current &&
        !notificacoesRef.current.contains(event.target)
      ) {
        setPainelNotificacoesAberto((aberto) => {
          if (aberto) {
            setNotificacoes((atuais) =>
              atuais.filter((notificacao) => !notificacao.lida)
            );
          }
          return false;
        });
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

  function abrirNotificacao(id, titulo) {
    alert(titulo);
    setNotificacoes((atuais) =>
      atuais.map((notificacao) =>
        notificacao.id === id
          ? { ...notificacao, lida: true }
          : notificacao
      )
    );
  }

  function alternarPainelNotificacoes() {
    if (painelNotificacoesAberto) {
      setPainelNotificacoesAberto(false);
      setNotificacoes((atuais) =>
        atuais.filter((notificacao) => !notificacao.lida)
      );
      return;
    }

    setPainelNotificacoesAberto(true);
  }

  const quantidadeNaoLidas = notificacoes.filter(
    (notificacao) => !notificacao.lida
  ).length;

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

        <div className="notificacoes-container" ref={notificacoesRef}>
          <button
            type="button"
            className="botao-notificacoes"
            aria-label={`Notificações: ${quantidadeNaoLidas} não lidas`}
            aria-expanded={painelNotificacoesAberto}
            onClick={(event) => {
              event.stopPropagation();
              alternarPainelNotificacoes();
            }}
          >
            <span className="icone-notificacao" aria-hidden="true">
              <span className="sino"></span>
              <span className="badalo"></span>
              {quantidadeNaoLidas > 0 && (
                <span className="contador-notificacoes">
                  {quantidadeNaoLidas}
                </span>
              )}
            </span>
          </button>

          {painelNotificacoesAberto && (
            <section className="painel-notificacoes">
              <h1>Notificações</h1>
              <div className="divisor"></div>
              <div className="lista-notificacoes">
                {notificacoes.map((notificacao) => (
                  <button
                    key={notificacao.id}
                    type="button"
                    className="notificacao"
                    onClick={() =>
                      abrirNotificacao(notificacao.id, notificacao.titulo)
                    }
                  >
                    <span className="notificacao-conteudo">
                      <strong>{notificacao.titulo}</strong>
                      <small>{notificacao.texto}</small>
                    </span>
                    {!notificacao.lida && <span className="indicador"></span>}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
