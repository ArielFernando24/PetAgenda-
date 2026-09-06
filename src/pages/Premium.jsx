function Premium() {
  return (
    <main className="premium-page">
      <header className="premium-topo">
        <div>
          <h1>Premium</h1>
          <p>PetAgenda / Premium</p>
        </div>

        <div className="premium-usuario">
          <span className="premium-avatar"></span>
          <span>Tutor</span>
          <span className="premium-seta">⌄</span>
        </div>
      </header>

      <section className="premium-card-page">
        <div className="premium-linha"></div>

        <p className="premium-rotulo">PETAGENDA PREMIUM</p>
        <h2>Mais cuidado, sem limites.</h2>
        <p className="premium-subtitulo">Seus pets merecem mais!</p>

        <div className="premium-linha premium-linha-superior"></div>

        <div className="premium-beneficios">
          <div className="premium-beneficio">
            <h3>✓&nbsp; Pets ilimitados</h3>
            <p>Cadastre quantos animais quiser.</p>
          </div>

          <div className="premium-beneficio">
            <h3>✓&nbsp; Cartão de vacinas</h3>
            <p>Exporte seus registros com facilidade.</p>
          </div>

          <div className="premium-beneficio">
            <h3>✓&nbsp; Histórico vitalício</h3>
            <p>Acesse todos os cuidados já registrados.</p>
          </div>

          <div className="premium-beneficio">
            <h3>✓&nbsp; Alertas completos</h3>
            <p>Nunca perca um cuidado importante.</p>
          </div>
        </div>

        <div className="premium-plano">
          <div>
            <h3>Plano Premium</h3>

            <div className="premium-preco">
              <strong>R$ 9,90</strong>
              <span>/ mês</span>
            </div>
          </div>

          <p>Cancele quando quiser.</p>
        </div>

        <div className="premium-linha premium-linha-preco"></div>

        <button className="premium-assinar-botao">
          Assinar Premium
        </button>

        <div className="premium-linha premium-linha-inferior"></div>
      </section>

      <section className="premium-chamada">
        <h2>Premium</h2>
        <strong>Assinar por R$ 9,90/mês</strong>
      </section>

      <footer className="premium-footer">
        <div className="premium-linha-rodape"></div>

        <div className="premium-rodape-conteudo">
          <p>Feito com carinho para quem cuida de quem ama.</p>
          <span className="premium-marca"></span>
        </div>
      </footer>
    </main>
  );
}

export default Premium;
