function Dashboard() {
  return (
    <main className="dashboard-page">
      <section className="dashboard-topo">
        <div>
          <h1>Dashboard</h1>
          <p>PetAgenda / Dashboard</p>
        </div>

        <div className="dashboard-usuario">
          <span className="dashboard-avatar"></span>
          <span>Tutor</span>
          <span className="dashboard-seta">⌄</span>
        </div>
      </section>

      <section className="dashboard-aviso">
        <h2>Tudo em dia com seus pets?</h2>
        <p>Acompanhe vacinas, consultas, banho e medicamentos sem esquecer de nada.</p>
      </section>

      <section className="dashboard-boas-vindas">
        <h2>Olá, Tutor!</h2>
        <p>Acompanhe os cuidados dos seus pets.</p>
      </section>

      <section className="dashboard-resumo">
        <article className="dashboard-proximo">
          <h3>Próximo cuidado</h3>
          <p>Vacina antirrábica • Luna • Hoje às 15:30</p>
        </article>

        <article className="dashboard-card-numero">
          <strong>2</strong>
          <p>Pets cadastrados</p>
        </article>

        <article className="dashboard-card-numero">
          <strong>4</strong>
          <p>Cuidados próximos</p>
        </article>
      </section>

      <section className="dashboard-agenda">
        <h2>Agenda de hoje</h2>

        <div className="dashboard-agenda-grid">
          <article>
            <h3>15:30 — Vacina</h3>
            <p>Luna • Antirrábica</p>
          </article>

          <article>
            <h3>18:00 — Banho</h3>
            <p>Thor • Pet Shop Bicho Feliz</p>
          </article>
        </div>
      </section>

      <section className="dashboard-rodape-area">
        <div className="dashboard-acoes">
          <h2>Ações rápidas</h2>

          <div className="dashboard-botoes">
            <button className="dashboard-botao dashboard-botao-azul">+ Novo serviço</button>
            <button className="dashboard-botao">Cadastrar pet</button>
            <button className="dashboard-botao">Buscar serviços</button>
          </div>
        </div>

        <div className="dashboard-mensagem">
          <span className="dashboard-quadrado"></span>
          <h3>Cuidado em cada detalhe.</h3>
          <p>
            Seu pet merece uma rotina organizada e cheia
            <br />
            de carinho.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;