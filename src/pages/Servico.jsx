import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clinicasApi } from "../services/api";
import cachorroBanho from "../assets/cachorrobanho-petagenda.png";

function Servicos() {
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAnuncioAberto, setModalAnuncioAberto] = useState(false);
  const [propostaEnviada, setPropostaEnviada] = useState(false);
  const [dadosPetshop, setDadosPetshop] = useState({
    nome: "",
    contato: "",
  });

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
    async function carregarClinicas() {
      try {
        const data = await clinicasApi.list();
        if (Array.isArray(data) && data.length > 0) {
          setClinicas(data);
        } else {
          setClinicas(fallbackServicos);
        }
      } catch (err) {
        console.warn("Erro ao buscar clínicas, usando lista de referência:", err.message);
        setClinicas(fallbackServicos);
      } finally {
        setLoading(false);
      }
    }
    carregarClinicas();
  }, []);

  const clinicasFiltradas = clinicas.filter((clinica) => {
    const textoCompleto = `${clinica.nome} ${clinica.cidade || ""} ${clinica.estado || ""} ${
      Array.isArray(clinica.servicos) ? clinica.servicos.join(" ") : ""
    } ${clinica.descricao || ""}`.toLowerCase();
    return textoCompleto.includes(busca.toLowerCase());
  });

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

          <button type="button" className="search-button">
            🔍
          </button>
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