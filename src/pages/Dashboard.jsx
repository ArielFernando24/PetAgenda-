import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { petsApi, agendaApi } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pets, setPets] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [petsData, agendaData] = await Promise.all([
          petsApi.list().catch(() => []),
          agendaApi.list().catch(() => []),
        ]);
        setPets(Array.isArray(petsData) ? petsData : []);
        setEventos(Array.isArray(agendaData) ? agendaData : []);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  const nomeExibicao = user?.nome ? user.nome.split(" ")[0] : "Tutor";
  const petsCount = pets.length;

  const pendentes = eventos.filter((e) => e.status === "PENDENTE");
  const cuidadosProximosCount = pendentes.length;

  // Próximo cuidado (o primeiro pendente)
  const proximoCuidado = pendentes.length > 0 ? pendentes[0] : null;

  // Agenda de hoje
  const hojeStr = new Date().toISOString().split("T")[0];
  const agendaHoje = eventos.filter((e) => {
    if (!e.dataHora) return false;
    return e.dataHora.split("T")[0] === hojeStr;
  });

  const getNomePet = (petId) => {
    const pet = pets.find((p) => p.id === petId);
    return pet ? pet.nome : "Pet";
  };

  const formatarHora = (isoStr) => {
    if (!isoStr) return "";
    try {
      const data = new Date(isoStr);
      return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
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

  return (
    <main className="dashboard-page">
      <section className="dashboard-topo">
        <div>
          <h1>Dashboard</h1>
          <p>PetAgenda / Dashboard</p>
        </div>
      </section>

      <section className="dashboard-aviso">
        <h2>Tudo em dia com seus pets?</h2>
        <p>Acompanhe vacinas, consultas, banho e medicamentos sem esquecer de nada.</p>
      </section>

      <section className="dashboard-boas-vindas">
        <h2>Olá, {nomeExibicao}!</h2>
        <p>Acompanhe os cuidados dos seus pets.</p>
      </section>

      <section className="dashboard-resumo">
        <article className="dashboard-proximo">
          <h3>Próximo cuidado</h3>
          {loading ? (
            <p>Carregando...</p>
          ) : proximoCuidado ? (
            <p>
              {formatarTipoCuidado(proximoCuidado.tipoCuidado)} • {getNomePet(proximoCuidado.petId)} •{" "}
              {new Date(proximoCuidado.dataHora).toLocaleDateString("pt-BR")} às{" "}
              {formatarHora(proximoCuidado.dataHora)}
            </p>
          ) : (
            <p>Nenhum cuidado pendente agendado.</p>
          )}
        </article>

        <article
          className="dashboard-card-numero"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/meus-pets")}
        >
          <strong>{loading ? "..." : petsCount}</strong>
          <p>Pets cadastrados</p>
        </article>

        <article
          className="dashboard-card-numero"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/agenda")}
        >
          <strong>{loading ? "..." : cuidadosProximosCount}</strong>
          <p>Cuidados próximos</p>
        </article>
      </section>

      <section className="dashboard-agenda">
        <h2>Agenda de hoje</h2>

        <div className="dashboard-agenda-grid">
          {loading ? (
            <p style={{ color: "#666", padding: "10px" }}>Carregando agenda...</p>
          ) : agendaHoje.length === 0 ? (
            <p style={{ color: "#666", padding: "10px" }}>
              Nenhum cuidado programado para hoje. Aproveite o dia com seus pets! 🐾
            </p>
          ) : (
            agendaHoje.map((item) => (
              <article key={item.id}>
                <h3>
                  {formatarHora(item.dataHora)} — {formatarTipoCuidado(item.tipoCuidado)}
                </h3>
                <p>
                  {getNomePet(item.petId)}
                  {item.descricao ? ` • ${item.descricao}` : ""}
                </p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="dashboard-rodape-area">
        <div className="dashboard-acoes">
          <h2>Ações rápidas</h2>

          <div className="dashboard-botoes">
            <button
              className="dashboard-botao dashboard-botao-azul"
              type="button"
              onClick={() => navigate("/novo-servico")}
            >
              + Novo serviço
            </button>
            <button
              className="dashboard-botao"
              type="button"
              onClick={() => navigate("/cadastro-pet")}
            >
              Cadastrar pet
            </button>
            <button
              className="dashboard-botao"
              type="button"
              onClick={() => navigate("/servicos")}
            >
              Buscar serviços
            </button>
          </div>
        </div>

        <div className="dashboard-mensagem">
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