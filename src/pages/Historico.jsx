import { useState, useEffect } from "react";
import { agendaApi, petsApi } from "../services/api";

function Historico() {
  const [eventos, setEventos] = useState([]);
  const [pets, setPets] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function carregarHistorico() {
      try {
        const [agendaData, petsData] = await Promise.all([
          agendaApi.list(),
          petsApi.list(),
        ]);
        setEventos(Array.isArray(agendaData) ? agendaData : []);
        setPets(Array.isArray(petsData) ? petsData : []);
      } catch (err) {
        setError(err.message || "Erro ao carregar histórico.");
      } finally {
        setLoading(false);
      }
    }
    carregarHistorico();
  }, []);

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

  const formatarData = (isoStr) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("pt-BR");
    } catch {
      return isoStr;
    }
  };

  // Histórico: itens concluídos ou passados
  const concluidos = eventos.filter((e) => e.status === "CONCLUIDO");

  const concluidosFiltrados = concluidos.filter((item) => {
    const nomePet = getNomePet(item.petId).toLowerCase();
    const tipo = formatarTipoCuidado(item.tipoCuidado).toLowerCase();
    const desc = (item.descricao || "").toLowerCase();
    const termo = busca.toLowerCase();
    return nomePet.includes(termo) || tipo.includes(termo) || desc.includes(termo);
  });

  return (
    <main className="historico-page">
      <header className="historico-topo">
        <div>
          <h1>Histórico</h1>
          <p>PetAgenda / Histórico</p>
        </div>
      </header>

      <section className="historico-conteudo">
        <div className="historico-titulo-busca">
          <h2>Histórico de cuidados</h2>

          <div className="historico-busca">
            <input
              type="text"
              placeholder="Buscar por pet ou tipo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <button type="button">⌕</button>
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

        {loading ? (
          <p style={{ padding: "20px", color: "#666" }}>Carregando histórico...</p>
        ) : concluidosFiltrados.length === 0 ? (
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "14px",
              textAlign: "center",
              margin: "20px 0",
            }}
          >
            <p style={{ color: "#666" }}>
              {concluidos.length === 0
                ? "Nenhum cuidado concluído registrado ainda. Ao marcar compromissos como concluídos na Agenda, eles aparecerão aqui!"
                : "Nenhum registro encontrado para esta busca."}
            </p>
          </div>
        ) : (
          <div className="historico-lista">
            {concluidosFiltrados.map((item) => (
              <article className="historico-card" key={item.id}>
                <h3>
                  {formatarData(item.dataHora)} • {formatarTipoCuidado(item.tipoCuidado)}
                </h3>
                <p>
                  {getNomePet(item.petId)} • Concluído
                  {item.descricao ? ` — ${item.descricao}` : ""}
                </p>
              </article>
            ))}
          </div>
        )}
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