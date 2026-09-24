import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { clinicasApi } from "../services/api";
import { normalizarTexto } from "../utils/clinica-wizard";
import cachorroBanho from "../assets/cachorrobanho-petagenda.png";

function Servicos() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const buscaInicial = searchParams.get("busca") || "";

  const [busca, setBusca] = useState(buscaInicial);
  const [buscaDebounce, setBuscaDebounce] = useState(buscaInicial);
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAnuncioAberto, setModalAnuncioAberto] = useState(false);
  const [propostaEnviada, setPropostaEnviada] = useState(false);
  const [dadosPetshop, setDadosPetshop] = useState({
    nome: "",
    contato: "",
  });
  const [filtrosAberto, setFiltrosAberto] = useState(false);

  const filtrosIniciais = {
    status: searchParams.get("status") || "",
    categoria: searchParams.get("categoria") || "",
    dataInicio: searchParams.get("inicio") || "",
    dataFim: searchParams.get("fim") || "",
  };

  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciais);

  const fallbackServicos = [
    {
      id: "f1",
      nome: "Clínica VetVida",
      cidade: "São Paulo",
      estado: "SP",
      endereco: "Av. Paulista, 1000",
      telefone: "(11) 98888-1111",
      servicos: ["Consulta", "Vacinas"],
      descricao: "Segunda a sábado",
    },
    {
      id: "f2",
      nome: "Pet Shop Bicho Feliz",
      cidade: "Campinas",
      estado: "SP",
      endereco: "Rua das Flores, 200",
      telefone: "(19) 97777-2222",
      servicos: ["Banho & Tosa"],
      descricao: "Todos os dias",
    },
    {
      id: "f3",
      nome: "Clínica Vida Animal",
      cidade: "São Paulo",
      estado: "SP",
      endereco: "Rua Augusta, 450",
      telefone: "(11) 96666-3333",
      servicos: ["Consulta", "Cirurgia", "Exames"],
      descricao: "Atendimento 24h",
    },
  ];

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

      if (buscaDebounce.trim()) {
        novosParams.set("busca", buscaDebounce.trim());
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

  useEffect(() => {
    async function carregarClinicas() {
      try {
        const data = await clinicasApi.list();
        const locais = JSON.parse(
          localStorage.getItem("petagenda_estabelecimentos_local") || "[]"
        );

        const lista = Array.isArray(data) ? data : [];
        const locaisValidos = Array.isArray(locais) ? locais : [];
        const combinada = [...lista, ...locaisValidos.filter(
          (local) => !lista.some(
            (item) =>
              item.id === local.id ||
              normalizarTexto(item.nome) === normalizarTexto(local.nome)
          )
        )];

        if (combinada.length > 0) {
          setClinicas(combinada);
        } else {
          setClinicas(fallbackServicos);
        }
      } catch (err) {
        const locais = JSON.parse(
          localStorage.getItem("petagenda_estabelecimentos_local") || "[]"
        );
        const locaisValidos = Array.isArray(locais) ? locais : [];
        setClinicas(locaisValidos.length > 0 ? locaisValidos : fallbackServicos);
        console.warn("Erro ao buscar clínicas, usando lista local:", err.message);
      } finally {
        setLoading(false);
      }
    }
    carregarClinicas();
  }, []);

  const clinicasFiltradas = clinicas.filter((clinica) => {
    const servicos = Array.isArray(clinica.servicos)
      ? clinica.servicos
      : clinica.servicos
        ? [clinica.servicos]
        : [];

    const textoCompleto = normalizarTexto(
      `${clinica.nome} ${clinica.cidade || ""} ${clinica.estado || ""} ${
        servicos.join(" ")
      } ${clinica.descricao || ""}`
    );

    const termo = normalizarTexto(buscaDebounce);
    const passaBusca = !termo || textoCompleto.includes(termo);

    const categoriaNormalizada = normalizarTexto(filtrosAplicados.categoria);
    const passaCategoria =
      !categoriaNormalizada ||
      servicos.some((servico) => {
        const nome = normalizarTexto(servico);

        if (categoriaNormalizada === "banho") {
          return nome.includes("banho") || nome.includes("tosa");
        }

        if (categoriaNormalizada === "medicamento") {
          return (
            nome.includes("medicamento") ||
            nome.includes("remedio") ||
            nome.includes("remedio") ||
            nome.includes("remedio")
          );
        }

        return nome.includes(categoriaNormalizada);
      });

    return passaBusca && passaCategoria;
  });

  function aplicarFiltros() {
    setFiltrosAplicados(filtros);

    const params = new URLSearchParams(searchParams);

    if (filtros.status) params.set("status", filtros.status);
    else params.delete("status");

    if (filtros.categoria) params.set("categoria", filtros.categoria);
    else params.delete("categoria");

    if (filtros.dataInicio) params.set("inicio", filtros.dataInicio);
    else params.delete("inicio");

    if (filtros.dataFim) params.set("fim", filtros.dataFim);
    else params.delete("fim");

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

    setFiltros(filtrosVazios);
    setFiltrosAplicados(filtrosVazios);

    const params = new URLSearchParams(searchParams);
    params.delete("status");
    params.delete("categoria");
    params.delete("inicio");
    params.delete("fim");

    setSearchParams(params);
  }

  function handleEnviarInteresse(e) {
    e.preventDefault();
    setPropostaEnviada(true);
  }

  function fecharModal() {
    setModalAnuncioAberto(false);
    setPropostaEnviada(false);
    setDadosPetshop({ nome: "", contato: "" });
  }

  return (
    <div className="servicos-page">
      <div className="servicos-top">
        <div>
          <h1>Serviços</h1>
          <p>PetAgenda / Serviços</p>
        </div>
      </div>

      {/* Banner de Monetização - Anuncie Aqui */}
      <section className="servicos-banner-anuncio">
        <div className="banner-anuncio-conteudo">
          <div className="banner-anuncio-tag">
            <span>📢</span> Espaço Patrocinado • Parceiro Pro
          </div>
          <h3 className="banner-anuncio-titulo">
            Tem um Pet Shop ou Clínica? Anuncie aqui!
          </h3>
          <p className="banner-anuncio-descricao">
            Coloque sua marca em destaque para tutores da sua região e receba agendamentos diretos no PetAgenda.
          </p>
        </div>

        <button
          type="button"
          className="banner-anuncio-botao"
          onClick={() => setModalAnuncioAberto(true)}
        >
          Anuncie aqui ✨
        </button>
      </section>

      {/* Modal Interativo de Anúncio / Monetização */}
      {modalAnuncioAberto && (
        <div className="anuncio-modal-overlay" onClick={fecharModal}>
          <div
            className="anuncio-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="anuncio-modal-fechar"
              onClick={fecharModal}
            >
              &times;
            </button>

            {propostaEnviada ? (
              <div className="anuncio-modal-sucesso">
                <div className="anuncio-sucesso-icone">🎉</div>
                <h3>Interesse Registrado!</h3>
                <p>
                  Obrigado pelo interesse! Nossa equipe entrará em contato para ativar o anúncio do seu Pet Shop no topo do PetAgenda.
                </p>
                <button
                  type="button"
                  className="anuncio-btn-concluir"
                  onClick={fecharModal}
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form
                className="anuncio-modal-form"
                onSubmit={handleEnviarInteresse}
              >
                <div className="anuncio-modal-topo">
                  <span className="anuncio-destaque-tag">
                    Plano Parceiro Pro • R$ 49,90/mês
                  </span>
                  <h3>Destaque seu negócio no PetAgenda</h3>
                  <p>
                    Seja encontrado por tutores ativos quando eles precisarem de cuidados para os seus pets.
                  </p>
                </div>

                <div className="anuncio-vantagens">
                  <div className="anuncio-vantagem">
                    <strong>📍 Visibilidade Local:</strong> Seu pet shop em destaque no topo da busca.
                  </div>
                  <div className="anuncio-vantagem">
                    <strong>📅 Agendamentos Diretos:</strong> Receba contatos de tutores da sua cidade.
                  </div>
                  <div className="anuncio-vantagem">
                    <strong>⭐ Selo de Confiança:</strong> Badge exclusivo de parceiro verificado.
                  </div>
                </div>

                <div className="anuncio-campos">
                  <div className="anuncio-campo">
                    <label htmlFor="nomePetshop">Nome do Pet Shop / Clínica</label>
                    <input
                      id="nomePetshop"
                      type="text"
                      placeholder="Ex: Pet Center & Banho"
                      value={dadosPetshop.nome}
                      onChange={(e) =>
                        setDadosPetshop({ ...dadosPetshop, nome: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="anuncio-campo">
                    <label htmlFor="contato">WhatsApp / Telefone de Contato</label>
                    <input
                      id="contato"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={dadosPetshop.contato}
                      onChange={(e) =>
                        setDadosPetshop({
                          ...dadosPetshop,
                          contato: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="anuncio-btn-enviar">
                  Solicitar Proposta de Anúncio
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="servicos-header">
        <h2>Encontrar serviço</h2>

        <div className="servicos-search">
          <input
            type="text"
            placeholder="Buscar por clínica, serviço ou cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

    <button
      type="button"
      className="search-button"
      aria-label="Buscar"
    >
            🔍
          </button>

    <div className="servicos-filtro-container">
      <button
        type="button"
        className="servicos-filtro-button"
        aria-label="Abrir filtros"
        onClick={() => setFiltrosAberto(!filtrosAberto)}
      >
        ☰
      </button>

      {filtrosAberto && (
        <div className="servicos-filtro-popup">
          <h3>Filtros</h3>

          <div className="servicos-filtro-campo">
            <label htmlFor="filtro-status">Status</label>

            <select
              id="filtro-status"
              value={filtros.status}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  status: e.target.value,
                })
              }
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="cancelado">Cancelado</option>
              <option value="completo">Completo</option>
            </select>
          </div>

          <div className="servicos-filtro-campo">
            <label htmlFor="filtro-categoria">Categoria</label>

            <select
              id="filtro-categoria"
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

          <div className="servicos-filtro-campo">
            <label>Período</label>

            <div className="servicos-filtro-periodo">
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

          <div className="servicos-filtro-acoes">
            <button
              type="button"
              className="servicos-filtro-limpar"
              onClick={limparFiltros}
            >
              Limpar
            </button>

            <button
              type="button"
              className="servicos-filtro-aplicar"
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

      <div className="servicos-list">
        {loading ? (
          <p style={{ padding: "20px", color: "#666" }}>Carregando serviços disponíveis...</p>
        ) : clinicasFiltradas.length === 0 ? (
          <p style={{ padding: "20px", color: "#666" }}>
            Nenhum estabelecimento encontrado com os termos pesquisados.
          </p>
        ) : (
          clinicasFiltradas.map((servico) => (
            <div className="servico-card" key={servico.id || servico.nome}>
              <strong>{servico.nome}</strong>
              <span>
                {Array.isArray(servico.servicos) ? servico.servicos.join(" • ") : servico.servicos}
                {servico.cidade ? ` • ${servico.cidade}/${servico.estado}` : ""}
                {servico.telefone ? ` • Tel: ${servico.telefone}` : ""}
              </span>
            </div>
          ))
        )}
      </div>

      <button
        className="solicitar-servico"
        type="button"
        onClick={() => navigate("/novo-servico")}
        style={{
          position: "relative",
          zIndex: 9999,
          pointerEvents: "auto",
        }}
      >
        Solicitar serviço
      </button>

      <div className="servicos-cena">
        <img
          src={cachorroBanho}
          alt="Cachorro tomando banho"
          className="cachorro-banho-servicos"
        />
      </div>

      <div className="servicos-footer">
        <span>Feito com carinho para quem cuida de quem ama.</span>
        <span>🐾</span>
      </div>
    </div>
  );
}

export default Servicos;