function Historico() {
  return (
    <main className="historico-page">
      <header className="historico-topo">
        <div>
          <h1>Histórico</h1>
          <p>PetAgenda / Histórico</p>
        </div>

        <div className="historico-usuario">
          <span className="historico-avatar"></span>
          <span>Tutor</span>
          <span className="historico-seta">⌄</span>
        </div>
      </header>

      <section className="historico-conteudo">
        <div className="historico-titulo-busca">
          <h2>Histórico de cuidados</h2>

          <div className="historico-busca">
            <input type="text" placeholder="Buscar..." />
            <button>⌕</button>
          </div>
        </div>

        <div className="historico-lista">
          <article className="historico-card">
            <h3>12/08/2026 • Banho &amp; Tosa</h3>
            <p>Luna • Concluído</p>
          </article>

          <article className="historico-card">
            <h3>03/05/2026 • Vacina</h3>
            <p>Luna • Concluído</p>
          </article>

          <article className="historico-card">
            <h3>18/03/2026 • Consulta</h3>
            <p>Luna • Concluído</p>
          </article>
        </div>
      </section>

      <footer className="historico-footer">
        <div className="historico-linha"></div>

        <div className="historico-rodape-conteudo">
          <p>Feito com carinho para quem cuida de quem ama.</p>
          <span>🐾</span>
        </div>
      </footer>
    </main>
  );
}

export default Historico;