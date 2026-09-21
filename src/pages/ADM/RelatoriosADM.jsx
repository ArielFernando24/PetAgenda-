import { useState } from "react";
import SidebarADM from "../../components/ADM/SidebarADM";
import ModalExportacaoADM from "./ModalExportacaoADM";
function RelatoriosADM() {
  const [periodo, setPeriodo] = useState("Este mês");
  const [tipo, setTipo] = useState("Todos");
  const [status, setStatus] = useState("Todos");

  const [modalExportacaoAberto, setModalExportacaoAberto] =
    useState(false);

  const dados = [
    {
      id: 1,
      data: "18/09/2026",
      usuario: "João Silva",
      servico: "Banho",
      estabelecimento: "Pet Shop Bicho Feliz",
      status: "Concluído",
      valor: "R$ 50,00",
    },
    {
      id: 2,
      data: "18/09/2026",
      usuario: "Maria Souza",
      servico: "Tosa",
      estabelecimento: "Pet Shop Bicho Feliz",
      status: "Agendado",
      valor: "R$ 70,00",
    },
    {
      id: 3,
      data: "17/09/2026",
      usuario: "Carlos Oliveira",
      servico: "Consulta veterinária",
      estabelecimento: "VetCare",
      status: "Concluído",
      valor: "R$ 150,00",
    },
    {
      id: 4,
      data: "17/09/2026",
      usuario: "Ana Costa",
      servico: "Vacinação",
      estabelecimento: "VetCare",
      status: "Cancelado",
      valor: "R$ 80,00",
    },
  ];

  const dadosFiltrados = dados.filter((item) => {
    const correspondeTipo =
      tipo === "Todos" || item.servico === tipo;

    const correspondeStatus =
      status === "Todos" || item.status === status;

    return correspondeTipo && correspondeStatus;
  });

  return (
    <div className="admin-layout">
      <SidebarADM />

      <main className="admin-conteudo admin-relatorios-page">
        <header className="admin-cabecalho">
          <div>
            <span className="admin-breadcrumb">
              PetAgenda / Admin / Relatórios
            </span>

            <h1>Relatórios</h1>

            <p>
              Consulte, filtre e exporte os dados do PetAgenda.
            </p>
          </div>

          <div className="admin-usuario">
            <div className="admin-avatar">A</div>

            <div>
              <strong>Administrador</strong>
              <span>Admin</span>
            </div>

            <span className="admin-chevron">⌄</span>
          </div>
        </header>

        <section className="admin-relatorios-filtros">
          <div className="admin-relatorio-filtro">
            <label>Período</label>

            <select
              value={periodo}
              onChange={(event) => setPeriodo(event.target.value)}
            >
              <option value="Hoje">Hoje</option>
              <option value="Este mês">Este mês</option>
              <option value="Últimos 3 meses">
                Últimos 3 meses
              </option>
              <option value="Este ano">Este ano</option>
            </select>
          </div>

          <div className="admin-relatorio-filtro">
            <label>Serviço</label>

            <select
              value={tipo}
              onChange={(event) => setTipo(event.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Banho">Banho</option>
              <option value="Tosa">Tosa</option>
              <option value="Consulta veterinária">
                Consulta veterinária
              </option>
              <option value="Vacinação">Vacinação</option>
            </select>
          </div>

          <div className="admin-relatorio-filtro">
            <label>Status</label>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Agendado">Agendado</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="admin-relatorio-filtro">
            <label>&nbsp;</label>

            <button
              type="button"
              className="admin-btn-exportar"
              onClick={() => setModalExportacaoAberto(true)}
            >
              Exportar
            </button>
          </div>
        </section>

        <section className="admin-relatorios-resumo">
          <div className="admin-relatorio-resumo-card">
            <span>Registros encontrados</span>
            <strong>{dadosFiltrados.length}</strong>
          </div>

          <div className="admin-relatorio-resumo-card">
            <span>Concluídos</span>

            <strong>
              {
                dadosFiltrados.filter(
                  (item) => item.status === "Concluído"
                ).length
              }
            </strong>
          </div>

          <div className="admin-relatorio-resumo-card">
            <span>Agendados</span>

            <strong>
              {
                dadosFiltrados.filter(
                  (item) => item.status === "Agendado"
                ).length
              }
            </strong>
          </div>

          <div className="admin-relatorio-resumo-card">
            <span>Cancelados</span>

            <strong>
              {
                dadosFiltrados.filter(
                  (item) => item.status === "Cancelado"
                ).length
              }
            </strong>
          </div>
        </section>

        <section className="admin-relatorios-tabela">
          <div className="admin-relatorios-tabela-cabecalho">
            <div>
              <h2>Dados do relatório</h2>

              <p>
                Registros de acordo com os filtros selecionados.
              </p>
            </div>
          </div>

          <div className="admin-relatorio-table-wrapper">
            <table className="admin-relatorio-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Usuário</th>
                  <th>Serviço</th>
                  <th>Estabelecimento</th>
                  <th>Status</th>
                  <th>Valor</th>
                </tr>
              </thead>

              <tbody>
                {dadosFiltrados.map((item) => (
                  <tr key={item.id}>
                    <td>{item.data}</td>

                    <td>{item.usuario}</td>

                    <td>{item.servico}</td>

                    <td>{item.estabelecimento}</td>

                    <td>
                      <span
                        className={`admin-relatorio-status status-${item.status
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/\s+/g, "-")}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>{item.valor}</td>
                  </tr>
                ))}

                {dadosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="admin-relatorio-sem-dados"
                    >
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <ModalExportacaoADM
        aberto={modalExportacaoAberto}
        onFechar={() => setModalExportacaoAberto(false)}
        dados={dadosFiltrados}
      />
    </div>
  );
}

export default RelatoriosADM;