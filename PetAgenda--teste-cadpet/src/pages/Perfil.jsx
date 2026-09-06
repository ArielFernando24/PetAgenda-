import { useNavigate } from "react-router-dom";



function Perfil() {

  const navigate = useNavigate();

  function entrar(event) {
    event.preventDefault();
    navigate("/Premium");
  }

  return (
    <main className="perfil-page">
      <header className="perfil-topo">
        <div className="perfil-titulo">
          <h1>Perfil</h1>
          <p>PetAgenda / Perfil</p>
        </div>

        <div className="perfil-usuario">
          <span className="perfil-avatar"></span>
          <span>Tutor</span>
          <span className="perfil-seta">⌄</span>
        </div>
      </header>

      <section className="perfil-cartao perfil-cartao-tutor">
        <h2>Tutor</h2>
        <p>tutor@email.com</p>
      </section>

      <section className="perfil-cartao perfil-cartao-plano">
        <h2>Plano atual</h2>
        <p>Gratuito • até 2 pets • lembretes básicos</p>
      </section>

      <section className="perfil-premium">
        <h2>PetAgenda Premium</h2>
        <p>Pets ilimitados, histórico vitalício, exportação do cartão de vacinas e alertas.</p>
        <button className="perfil-premium-botao" onClick={entrar}>
          Conhecer Premium • R$ 9,90/mês
        </button>
      </section>

      <footer className="perfil-footer">
        <div className="perfil-linha"></div>

        <div className="perfil-rodape-conteudo">
          <p>Feito com carinho para quem cuida de quem ama.</p>
          <span className="perfil-marca"></span>
        </div>
      </footer>
    </main>
  );
}

export default Perfil;
