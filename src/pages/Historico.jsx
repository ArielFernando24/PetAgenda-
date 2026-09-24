import { useState, useEffect } from "react";
import { agendaApi, petsApi } from "../services/api";
import { useSearchParams } from "react-router-dom";

function Historico() {
  const [eventos, setEventos] = useState([]);
  const [pets, setPets] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const lerFiltrosDaUrl = () => ({
    status: searchParams.get("status") || "",
    categoria: searchParams.get("categoria") || "",
    dataInicio: searchParams.get("inicio") || "",
    dataFim: searchParams.get("fim") || "",
  });

  const buscaInicial = searchParams.get("busca") || "";

  const [busca, setBusca] = useState(buscaInicial);
  const [buscaDebounce, setBuscaDebounce] = useState(buscaInicial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtrosAberto, setFiltrosAberto] = useState(false);
  const [filtros, setFiltros] = useState(lerFiltrosDaUrl);
  const [filtrosAplicados, setFiltrosAplicados] = useState(lerFiltrosDaUrl);

  useEffect(() => {
  const timer = setTimeout(() => {
    setBuscaDebounce(busca);
  }, 300);

  return () => {
    clearTimeout(timer);
  };
  }, [busca]);

  useEffect(() => {
    setSearchParams((params) => {
      const novosParams = new URLSearchParams(params);
      const termo = buscaDebounce.trim();

      if (termo) {
        novosParams.set("busca", termo);
      } else {
        novosParams.delete("busca");
      }

      return novosParams;
    }, { replace: true });
  }, [buscaDebounce, setSearchParams]);

  useEffect(() => {
    const buscaUrl = searchParams.get("busca") || "";
    const filtrosUrl = {
      status: searchParams.get("status") || "",
      categoria: searchParams.get("categoria") || "",
      dataInicio: searchParams.get("inicio") || "",
      dataFim: searchParams.get("fim") || "",
    };

    setBusca(buscaUrl);
    setBuscaDebounce(buscaUrl);
    setFiltros(filtrosUrl);
    setFiltrosAplicados(filtrosUrl);
  }, [searchParams]);

  function aplicarFiltros() {
    const params = new URLSearchParams(searchParams);

    const sincronizar = (nome, valor) => {
      if (valor) params.set(nome, valor);
      else params.delete(nome);
    };

    sincronizar("status", filtros.status);
    sincronizar("categoria", filtros.categoria);
    sincronizar("inicio", filtros.dataInicio);
    sincronizar("fim", filtros.dataFim);

    setFiltrosAplicados(filtros);
    setSearchParams(params);
    setFiltrosAberto(false);
  }

  function limparFiltros() {
    const filtrosVazios = {
      status: "",
      categoria: "",
      dataInicio: "",
      dataFim: "",
    };

    const params = new URLSearchParams(searchParams);
    params.delete("status");
    params.delete("categoria");
    params.delete("inicio");
    params.delete("fim");

    setFiltros(filtrosVazios);
    setFiltrosAplicados(filtrosVazios);
    setSearchParams(params);
  }

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

  const historico = eventos.filter(
    (e) => e.status === "CONCLUIDO" || e.status === "CANCELADO"
  );

  const categoriaPorTipo = {
    VACINA: "vacina",
    BANHO_E_TOSA: "banho",
    CONSULTA: "consulta",
    VERMIFUGO: "vermifugo",
    REMEDIO: "medicamento",
  };

  const concluidosFiltrados = historico.filter((item) => {
    const nomePet = getNomePet(item.petId).toLowerCase();
    const tipo = formatarTipoCuidado(item.tipoCuidado).toLowerCase();
    const desc = (item.descricao || "").toLowerCase();
    const termo = buscaDebounce.trim().toLowerCase();

    const passaBusca =
      nomePet.includes(termo) ||
      tipo.includes(termo) ||
      desc.includes(termo);

    const passaStatus =
      !filtrosAplicados.status || item.status === filtrosAplicados.status;

    const categoriaItem = categoriaPorTipo[item.tipoCuidado] || "";
    const passaCategoria =
      !filtrosAplicados.categoria ||
      categoriaItem === filtrosAplicados.categoria;

    const dataItem = item.dataHora ? new Date(item.dataHora) : null;
    const inicio = filtrosAplicados.dataInicio
      ? new Date(`${filtrosAplicados.dataInicio}T00:00:00`)
      : null;
    const fim = filtrosAplicados.dataFim
      ? new Date(`${filtrosAplicados.dataFim}T23:59:59.999`)
      : null;

    const passaPeriodo =
      (!inicio || (dataItem && dataItem >= inicio)) &&
      (!fim || (dataItem && dataItem <= fim));

    return passaBusca && passaStatus && passaCategoria && passaPeriodo;
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

  <button
    type="button"
    className="historico-search-button"
    aria-label="Buscar"
  ></button>

  <div className="historico-filtro-container">
    <button
      type="button"
      className="historico-filtro-button"
      aria-label="Abrir filtros"
      onClick={() => setFiltrosAberto(!filtrosAberto)}
    >
      ☰
    </button>

    {filtrosAberto && (
      <div className="historico-filtro-popup">
        <h3>Filtros</h3>

        <div className="historico-filtro-campo">
          <label htmlFor="historico-status">Status</label>

          <select
            id="historico-status"
            value={filtros.status}
            onChange={(e) =>
              setFiltros({
                ...filtros,
                status: e.target.value,
              })
            }
          >
            <option value="">Todos</option>
            <option value="CONCLUIDO">Completo</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        <div className="historico-filtro-campo">
          <label htmlFor="historico-categoria">Categoria</label>

          <select
            id="historico-categoria"
            value={filtros.categoria}
            onChange={(e) =>
              setFiltros({
                ...filtros,
                categoria: e.target.value,
              })
            }
          >
            <option value="">Todas</option>
            <option value="vacina">Vacina</option>
            <option value="banho">Banho & tosa</option>
            <option value="vermifugo">Vermifugo</option>
            <option value="consulta">Consulta</option>
            <option value="medicamento">Medicamento</option>
          </select>
        </div>

        <div className="historico-filtro-campo">
          <label>Período</label>

          <div className="historico-filtro-periodo">
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  dataInicio: e.target.value,
                })
              }
            />

            <span>até</span>

            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  dataFim: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="historico-filtro-acoes">
          <button
            type="button"
            className="historico-filtro-limpar"
            onClick={limparFiltros}
          >
            Limpar
          </button>

          <button
            type="button"
            className="historico-filtro-aplicar"
            onClick={aplicarFiltros}
          >
            Aplicar
          </button>
        </div>
      </div>
    )}
  </div>
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
              {historico.length === 0
                ? "Nenhum cuidado concluído ou cancelado registrado ainda."
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
                  {getNomePet(item.petId)} • {item.status === "CANCELADO" ? "Cancelado" : "Concluído"}
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