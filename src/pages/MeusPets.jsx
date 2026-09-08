import { useNavigate } from "react-router-dom";

function MeusPets() {
  const navigate = useNavigate();
  return (
    <main className="meus-pets-page">
      <header className="meus-pets-topo">
        <div>
          <h1>Meus pets</h1>
          <p>PetAgenda / Meus pets</p>
        </div>
      </header>

      <section className="meus-pets-conteudo">
        <h2>Seus animais</h2>

        <div className="meus-pets-lista">
          <article className="meus-pets-card">
            <h3>Luna</h3>
            <p>Cachorra • Golden Retriever • 03/05/2021</p>
          </article>

          <article className="meus-pets-card">
            <h3>Thor</h3>
            <p>Gato • SRD • 18/09/2022</p>
          </article>
        </div>

        <div className="meus-pets-acoes">
          <button
  className="meus-pets-botao-cadastrar"
  onClick={() => navigate("/cadastro-pet")}
>
  + Cadastrar novo pet
</button>

          <button
  className="meus-pets-botao-premium"
  onClick={() => navigate("/premium")}
>
  Conhecer Premium
</button>
        </div>
      </section>

      <footer className="meus-pets-footer">
        <div className="meus-pets-linha"></div>

        <div className="meus-pets-rodape-conteudo">
          <p>Feito com carinho para quem cuida de quem ama.</p>
          <span>🐾</span>
        </div>
      </footer>
    </main>
  );
}

export default MeusPets;