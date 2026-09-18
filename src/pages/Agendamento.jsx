import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { agendaApi, petsApi } from "../services/api";
import coelho from "../assets/coelho-petagenda.png";

function Agendamento() {
  const navigate = useNavigate();

  const [eventos, setEventos] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [petFiltro, setPetFiltro] = useState("");
  const [diaSelecionado, setDiaSelecionado] = useState(0);
  const [animandoCoelho, setAnimandoCoelho] = useState(false);
  const [concluindoId, setConcluindoId] = useState(null);

  // Gerar os próximos 5 dias a partir de hoje
  const hoje = new Date();
  const nomesSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const dias = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    return {
      numero: String(d.getDate()).padStart(2, "0"),
      semana: nomesSemana[d.getDay()],
      hoje: i === 0 ? "Hoje" : null,
      dataIso: d.toISOString().split("T")[0],
    };
  });

  async function carregarDados() {
    setLoading(true);
    setError("");
    try {
      const [agendaData, petsData] = await Promise.all([
        agendaApi.list(petFiltro || undefined),
        petsApi.list(),
      ]);
      setEventos(Array.isArray(agendaData) ? agendaData : []);
      setPets(Array.isArray(petsData) ? petsData : []);
    } catch (err) {
      setError(err.message || "Erro ao carregar a agenda.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [petFiltro]);

  async function handleConcluir(id) {
    setConcluindoId(id);
    try {
      await agendaApi.update(id, { status: "CONCLUIDO" });
      setAnimandoCoelho(true);
      setTimeout(() => setAnimandoCoelho(false), 1000);
      setEventos((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "CONCLUIDO" } : e))
      );
    } catch (err) {
      alert(`Erro ao atualizar: ${err.message}`);
    } finally {
      setConcluindoId(null);
    }
  }

  async function handleExcluir(id) {
    if (!window.confirm("Deseja realmente cancelar este agendamento?")) return;
    try {
      await agendaApi.delete(id);
      setEventos((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  }

  const getNomePet = (petId) => {
    const pet = pets.find((p) => p.id === petId);
    return pet ? pet.nome : "Pet";
  };

  const formatarTipoCuidado = (tipo) => {
    const map = {
      VACINA: "Vacina",
      BANHO_E_TOSA: "Banho & Tosa",
      CONSULTA: "Consulta",
      VERMIFUGO: "Vermífugo",
      REMEDIO: "Medicamento",
    };
    return map[tipo] || tipo;
  };

  const formatarHora = (isoStr) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  // Eventos do dia selecionado
  const dataSelecionadaIso = dias[diaSelecionado]?.dataIso;
  const compromissosDoDia = eventos.filter((e) => {
    if (!e.dataHora) return false;
    return e.dataHora.split("T")[0] === dataSelecionadaIso && e.status !== "CANCELADO";
  });

  // Próximos lembretes gerais (pendentes)
  const proximosLembretes = eventos
    .filter((e) => e.status === "PENDENTE")
    .slice(0, 5);

  return (
    <div className="agenda-page">
      <div className="agenda-top">
        <div>
          <h1>Agenda</h1>
          <p>PetAgenda / Agenda</p>
        </div>
      </div>

      <div className="agenda-header">
        <h2>Calendário de cuidados</h2>

        <div className="agenda-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            value={petFiltro}
            onChange={(e) => setPetFiltro(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#fff",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value="">Todos os pets</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <button
            className="new-service-button"
            type="button"
            onClick={() => navigate("/novo-servico")}
          >
            + Novo serviço
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "10px 14px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <div className="calendar-days">
        {dias.map((dia, index) => (
          <button
            key={dia.numero}
            type="button"
            className={`day-card ${diaSelecionado === index ? "selected" : ""}`}
            onClick={() => setDiaSelecionado(index)}
          >
            <strong>
              {dia.numero} {dia.semana}
            </strong>
            {dia.hoje && <span>{dia.hoje}</span>}
          </button>
        ))}
      </div>

      <div className="appointments">
        {loading ? (
          <p style={{ padding: "20px", color: "#666" }}>Carregando compromissos...</p>
        ) : compromissosDoDia.length === 0 ? (
          <p style={{ padding: "20px", color: "#666" }}>
            Nenhum cuidado agendado para este dia.
          </p>
        ) : (
          compromissosDoDia.map((item) => (
            <div
              key={item.id}
              className={`appointment ${item.status === "CONCLUIDO" ? "selected" : ""}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>
                  {formatarHora(item.dataHora)} • {formatarTipoCuidado(item.tipoCuidado)}
                </strong>
                <span>
                  {getNomePet(item.petId)}
                  {item.descricao ? ` • ${item.descricao}` : ""}
                  {item.status === "CONCLUIDO" ? " (Concluído)" : ""}
                </span>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                {item.status === "PENDENTE" && (
                  <button
                    type="button"
                    onClick={() => handleConcluir(item.id)}
                    disabled={concluindoId === item.id}
                    style={{
                      background: "#22c55e",
                      color: "#fff",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    ✓ Concluir
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleExcluir(item.id)}
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="reminders-header">
        <div>
          <h2>Lembretes</h2>
          <h3>Próximos lembretes</h3>
        </div>

        <button
          className="reminder-button"
          type="button"
          onClick={() => navigate("/novo-servico")}
        >
          + Adicionar cuidado
        </button>
      </div>

      <div className="reminder-bunny-container">
        <img
          className={`reminder-bunny ${animandoCoelho ? "jump" : ""}`}
          src={coelho}
          alt="Coelhinho do PetAgenda"
        />
      </div>

      <div className="reminders">
        {proximosLembretes.length === 0 ? (
          <p style={{ padding: "10px", color: "#666" }}>
            Nenhum lembrete futuro pendente.
          </p>
        ) : (
          proximosLembretes.map((lembrete) => {
            const dataObj = new Date(lembrete.dataHora);
            const dataFormatada = dataObj.toLocaleDateString("pt-BR");
            const horaFormatada = formatarHora(lembrete.dataHora);

            return (
              <div key={lembrete.id} className="reminder">
                <strong>
                  {dataFormatada} • {horaFormatada}
                </strong>
                <span>
                  {formatarTipoCuidado(lembrete.tipoCuidado)} de {getNomePet(lembrete.petId)}
                  {lembrete.descricao ? ` • ${lembrete.descricao}` : ""}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Agendamento;