import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Perfil() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const nomeUsuario = user?.nome || "Tutor";
  const emailUsuario = user?.email || "tutor@email.com";

  function getIniciais(nome) {
    if (!nome) return "TU";

    const partes = nome.trim().split(" ");

    if (partes.length === 1) {
      return partes[0].substring(0, 2).toUpperCase();
    }

    return (
      partes[0].charAt(0) +
      partes[partes.length - 1].charAt(0)
    ).toUpperCase();
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <main className="perfil-page">

      {/* =========================
          CABEÇALHO
      ========================= */}

      <header className="perfil-topo">
        <div className="perfil-titulo">
          <h1>Perfil</h1>
          <p>PetAgenda / Perfil</p>
        </div>
      </header>


      {/* =========================
          CARD DO PERFIL
      ========================= */}

      <section className="perfil-card-principal">

        <div className="perfil-avatar-container">

          <div className="perfil-avatar">
            <span>{getIniciais(nomeUsuario)}</span>
          </div>

          <button
            type="button"
            className="perfil-camera"
            onClick={() => navigate("/alterar-perfil")}
            aria-label="Alterar foto de perfil"
          >
            📷
          </button>

        </div>


        <div className="perfil-info-principal">

          <span className="perfil-label">
            Tutor
          </span>

          <h2>{nomeUsuario}</h2>

          <div className="perfil-info-linha">
            <span>✉</span>
            <p>{emailUsuario}</p>
          </div>

          {user?.data_criacao && (
            <div className="perfil-info-linha">
              <span>▣</span>
              <p>
                Cadastrado em{" "}
                {new Date(
                  user.data_criacao
                ).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}

        </div>


        <button
          type="button"
          className="perfil-editar-botao"
          onClick={() => navigate("/alterar-perfil")}
        >
          <span>✎</span>
          Editar perfil
          <strong>→</strong>
        </button>


        <div className="perfil-patinhas">
          <span>🐾</span>
        </div>

      </section>


      {/* =========================
          ASSINATURA
      ========================= */}

      <section className="perfil-assinatura">

        <div className="perfil-assinatura-icone">
          ♢
        </div>

        <div className="perfil-assinatura-info">

          <span className="perfil-label">
            Assinatura
          </span>

          <h2>Plano atual</h2>

          <p>
            Gratuito • até 2 pets • lembretes básicos
          </p>

        </div>

        <span className="perfil-plano-badge">
          GRATUITO
        </span>

      </section>


      {/* =========================
          PREMIUM
      ========================= */}

      <section className="perfil-premium">

        <div className="perfil-premium-conteudo">

          <div className="perfil-premium-titulo">

            <span className="perfil-premium-icone">
              ♛
            </span>

            <span className="perfil-premium-label">
              PETAGENDA PREMIUM
            </span>

          </div>

          <h2>
            Cuide ainda melhor dos seus pets.
          </h2>

          <p>
            Tenha pets ilimitados, histórico vitalício,
            exportação do cartão de vacinas e alertas.
          </p>

          <button
            type="button"
            className="perfil-premium-botao"
            onClick={() => navigate("/premium")}
          >
            Conhecer Premium • R$ 9,90/mês
            <span>→</span>
          </button>

        </div>

        <div className="perfil-premium-pets">
          <span>🐶</span>
          <span>🐱</span>
        </div>

      </section>


      {/* =========================
          SAIR
      ========================= */}

      <button
        type="button"
        className="perfil-logout"
        onClick={handleLogout}
      >
        <span>↪</span>
        <strong>Sair da conta</strong>
        <span className="perfil-logout-seta">
          →
        </span>
      </button>


      {/* =========================
          RODAPÉ
      ========================= */}

      <footer className="perfil-footer">

        <div className="perfil-linha"></div>

        <div className="perfil-rodape-conteudo">

          <p>
            🐾 Feito com carinho para quem cuida de quem ama.
          </p>

          <span className="perfil-marca">
            PetAgenda
          </span>

        </div>

      </footer>

    </main>
  );
}

export default Perfil;