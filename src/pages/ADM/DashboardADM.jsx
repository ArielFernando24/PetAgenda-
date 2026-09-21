import SidebarADM from "../../components/ADM/SidebarADM";

function DashboardADM() {
  return (
    <div className="admin-layout">
      <SidebarADM />

      <main className="admin-conteudo">
        <div className="admin-cabecalho">
          <div>
            <span className="admin-breadcrumb">Administração</span>
            <h1>Painel Administrativo</h1>
            <p>Bem-vindo ao painel do administrador.</p>
          </div>

          <div className="admin-usuario">
            <div className="admin-avatar">A</div>

            <div>
              <strong>Administrador</strong>
              <span>Admin</span>
            </div>

            <span className="admin-chevron">⌄</span>
          </div>
        </div>

        <section className="admin-dashboard">
          <div className="admin-card">
            <span>Estabelecimentos</span>
            <strong>0</strong>
          </div>

          <div className="admin-card">
            <span>Serviços</span>
            <strong>0</strong>
          </div>

          <div className="admin-card">
            <span>Agendamentos</span>
            <strong>0</strong>
          </div>

          <div className="admin-card">
            <span>Usuários</span>
            <strong>0</strong>
          </div>
        </section>

        <section className="admin-secao">
          <div className="admin-secao-cabecalho">
            <div>
              <h2>Agendamentos recentes</h2>
              <p>Visualize os últimos agendamentos realizados.</p>
            </div>
          </div>

          <div className="admin-tabela-vazia">
            <p>Nenhum agendamento recente.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardADM;