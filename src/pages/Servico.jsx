import { useState } from "react";
import { useNavigate } from "react-router-dom";
import cachorroBanho from "../assets/cachorrobanho-petagenda.png";

function Servicos() {

  const navigate = useNavigate();

  const [busca, setBusca] = useState("");

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

  return (
    <div className="servicos-page">
      <div className="servicos-top">
        <div>
          <h1>Serviços</h1>
          <p>PetAgenda / Serviços</p>
        </div>

        <button className="tutor servicos-tutor" type="button">
          <span className="tutor-icon">●</span>
          <span>Tutor</span>
          <span>⌄</span>
        </button>
      </div>

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