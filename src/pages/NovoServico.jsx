import { useNavigate } from "react-router-dom";

function NovoServico() {
  const navigate = useNavigate();

  return (
    <main className="novo-servico-page">
      <header className="novo-servico-topo">
        <div>
          <h1>Novo serviço</h1>
          <p>PetAgenda / Novo cuidado</p>
        </div>

        <div className="novo-servico-usuario">
          <span className="novo-servico-avatar"></span>
          <span>Tutor</span>
          <span className="novo-servico-seta">⌄</span>
        </div>
      </header>

      <section className="novo-servico-conteudo">
        <div className="novo-servico-formulario">
          <h2>Cadastrar cuidado recorrente</h2>

          <label>Tipo</label>
          <select defaultValue="Vacina">
            <option>Vacina</option>
            <option>Banho & Tosa</option>
            <option>Consulta</option>
            <option>Outro</option>
          </select>

          <label>Pet</label>
          <select defaultValue="Luna">
            <option>Luna</option>
            <option>Thor</option>
          </select>

          <label>Data</label>
          <input type="date" defaultValue="2026-08-17" />

          <label>Hora</label>
          <input type="time" defaultValue="15:30" />

          <label>Contato</label>
          <input type="text" defaultValue="99999-9999" />

          <label>Descrição</label>
          <input type="text" placeholder="Inserir..." />

          <div className="novo-servico-acoes">
            <button
              className="novo-servico-salvar"
              type="button"
            >
              Salvar cuidado
            </button>

            <button
              className="novo-servico-cancelar"
              type="button"
              onClick={() => navigate("/servicos")}
            >
              Cancelar
            </button>
          </div>
        </div>

        <aside className="novo-servico-estabelecimentos">
          <h3>Estabelecimentos disponíveis</h3>

          <article className="estabelecimento-card">
            <strong>Pet Shop Bicho Feliz</strong>

            <div className="estabelecimento-info">
              <span>Valor</span>
              <span>────────</span>
              <span>Duração</span>
              <span>────────</span>
            </div>

            <div className="horarios">
              <button>07:00</button>
              <button>07:30</button>
              <button>08:00</button>
              <button>08:30</button>
              <button className="horario-avancar">›</button>
            </div>
          </article>

          <article className="estabelecimento-card">
            <strong>Amigo Fiel</strong>

            <div className="estabelecimento-info">
              <span>Valor</span>
              <span>────────</span>
              <span>Duração</span>
              <span>────────</span>
            </div>

            <div className="horarios">
              <button>07:00</button>
              <button>07:30</button>
              <button>08:00</button>
              <button>08:30</button>
              <button className="horario-avancar">›</button>
            </div>
          </article>

          <article className="estabelecimento-card">
            <strong>Clínica Vida Animal</strong>

            <div className="estabelecimento-info">
              <span>Valor</span>
              <span>────────</span>
              <span>Duração</span>
              <span>────────</span>
            </div>

            <div className="horarios">
              <button>07:00</button>
              <button>07:30</button>
              <button>08:00</button>
              <button>08:30</button>
              <button className="horario-avancar">›</button>
            </div>
          </article>
        </aside>
      </section>

      <footer className="novo-servico-footer">
        <div className="novo-servico-linha"></div>

        <div className="novo-servico-rodape-conteudo">
          <p>Feito com carinho para quem cuida de quem ama.</p>
          <span>🐾</span>
        </div>
      </footer>
    </main>
  );
}

export default NovoServico;