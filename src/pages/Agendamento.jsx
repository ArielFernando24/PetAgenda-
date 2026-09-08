import { useState } from "react";
import coelho from "../assets/coelho-petagenda.png";
import { useNavigate } from "react-router-dom";

function Agendamento() {

  const navigate = useNavigate();
  const [diaSelecionado, setDiaSelecionado] = useState(0);
  const [lembreteAdicionado, setLembreteAdicionado] = useState(false);

  const dias = [
    { numero: "17", semana: "SEG", hoje: "Hoje" },
    { numero: "18", semana: "TER" },
    { numero: "19", semana: "QUA" },
    { numero: "20", semana: "QUI" },
    { numero: "21", semana: "SEX" },
  ];

  function handleAdicionarLembrete() {
    setLembreteAdicionado(true);

    setTimeout(() => {
      setLembreteAdicionado(false);
    }, 800);
  }

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

        <div className="agenda-actions">
          <button className="filter-button">Filtrar por...</button>
          <button className="new-service-button" type="button" onClick={() => navigate("/novo-servico")}>+ Novo serviço</button>
        </div>
      </div>

      <div className="calendar-days">
        {dias.map((dia, index) => (
          <button
            key={dia.numero}
            type="button"
            className={`day-card ${
              diaSelecionado === index ? "selected" : ""
            }`}
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
        <div className="appointment selected">
          <strong>15:30 • Vacina</strong>
          <span>Luna • Antirrábica</span>
        </div>

        <div className="appointment">
          <strong>18:00 • Banho</strong>
          <span>Thor • Banho & Tosa</span>
        </div>

        <div className="appointment">
          <strong>09:00 • Remédio</strong>
          <span>Luna • Antipulgas</span>
        </div>
      </div>

      <div className="reminders-header">
        <div>
          <h2>Lembretes</h2>
          <h3>Próximos lembretes</h3>
        </div>

        <button
          className="reminder-button"
          onClick={handleAdicionarLembrete}
        >
          Adicionar lembrete
        </button>
      </div>

      <div className="reminder-bunny-container">
        <img
          className={`reminder-bunny ${
            lembreteAdicionado ? "jump" : ""
          }`}
          src={coelho}
          alt="Coelhinho do PetAgenda"
        />
      </div>

      <div className="reminders">
        <div className="reminder selected">
          <strong>Hoje • 15:30</strong>
          <span>Vacina antirrábica de Luna</span>
        </div>

        <div className="reminder">
          <strong>Amanhã • 09:00</strong>
          <span>Antipulgas de Luna</span>
        </div>

        <div className="reminder">
          <strong>22/08 • 16:00</strong>
          <span>Banho de Thor</span>
        </div>
      </div>
    </div>
  );
}

export default Agendamento;