import { useNavigate } from "react-router-dom";
import SidebarADM from "../../components/ADM/SidebarADM";
import { useState } from "react";

function AgendamentosADM() {
  const [data, setData] = useState("2026-09-22");
  const [calendarioAberto, setCalendarioAberto] = useState(false);
  const navigate = useNavigate();

  const [agendamentos, setAgendamentos] = useState([
    { id: 1, horario: "09:00", servico: "Thor • Banho e Tosa", responsavel: "Marina / Bicho Feliz", status: "Confirmado" },
    { id: 2, horario: "11:30", servico: "Luna • Consulta", responsavel: "Kaique / Clínica VetCare", status: "Pendente" },
    { id: 3, horario: "15:30", servico: "Luna • Antirrábica", responsavel: "Kaique / VetCare", status: "Confirmado" },
    { id: 4, horario: "18:00", servico: "Thor • Banho", responsavel: "Kaique / Bicho Feliz", status: "Confirmado" },
  ]);

  function removerAgendamento(id) {
    setAgendamentos((agendamentosAtuais) =>
      agendamentosAtuais.filter((agendamento) => agendamento.id !== id)
    );
  }

  function formatarData(data) {
  const [ano, mes, dia] = data.split("-");

  const dataFormatada = new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  );

  return dataFormatada.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

  return (
    <div className="admin-layout">
      <SidebarADM />
      <main className="agendamentos-page">
    <header className="agendamentos-topo">
      <div className="agendamentos-titulo">
        <h1>Agendamentos</h1>
        <p>PetAgenda / Admin / Agendamentos</p>
      </div>

    </header>

    <section className="agendamentos-hoje">
      <h2>{formatarData(data)}</h2>

     <button
        className="mudar-data"
        type="button"
        onClick={() => setCalendarioAberto(!calendarioAberto)}
      >Mudar data</button>

      {calendarioAberto && (
        <div className="popup-calendario">
          <input
            type="date"
            value={data}
            onChange={(event) => {
              setData(event.target.value);
              setCalendarioAberto(false);
            }}
          />
        </div>
      )}

      <div className="agendamentos-tabela-container">
        <table className="agendamentos-tabela">
          <thead>
            <tr>
              <th>HORÁRIO</th>
              <th>PET / SERVIÇO</th>
              <th>TUTOR / PROFISSIONAL</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.map((agendamento) => (
              <tr key={agendamento.id}>
                <td>{agendamento.horario}</td>
                <td>{agendamento.servico}</td>
                <td>{agendamento.responsavel}</td>
                <td className="celula-com-remover">
                  {agendamento.status}
                  <button
                    type="button"
                    className="botao-remover-linha"
                    onClick={() => removerAgendamento(agendamento.id)}
                    aria-label={`Remover agendamento das ${agendamento.horario}`}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="agendamentos-acoes">
        <button type="button" onClick={() => navigate("/admin/servicos/novo")}>+ Novo serviço</button>
        <button type="button">Exportar agenda</button>
      </div>
    </section>
    </main>
    </div>
  );
}

export default AgendamentosADM;



