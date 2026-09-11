import { useState } from "react";
import { useNavigate } from "react-router-dom";
import cachorroBanho from "../assets/cachorrobanho-petagenda.png";

function Servicos() {

  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [modalAnuncioAberto, setModalAnuncioAberto] = useState(false);
  const [propostaEnviada, setPropostaEnviada] = useState(false);
  const [dadosPetshop, setDadosPetshop] = useState({
    nome: "",
    contato: "",
  });

  const servicos = [
    {
      nome: "Clínica VetVida",
      descricao: "Consulta • Vacinas • Segunda a sábado",
    },
    {
      nome: "Pet Shop Bicho Feliz",
      descricao: "Banho & Tosa • Todos os dias",
    },
  ];

  const servicosFiltrados = servicos.filter((servico) =>
    `${servico.nome} ${servico.descricao}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  function solicitarServico() {
    navigate("/novo-servico");
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
            placeholder="Buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <button type="button" className="search-button">
            🔍
          </button>
        </div>
      </div>

      <div className="servicos-list">
        {servicosFiltrados.map((servico) => (
          <div className="servico-card" key={servico.nome}>
            <strong>{servico.nome}</strong>
            <span>{servico.descricao}</span>
          </div>
        ))}
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