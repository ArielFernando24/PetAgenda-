import { useState } from "react";
import SidebarADM from "../../components/ADM/SidebarADM";

const dias = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

function HorariosADM() {
  const [estabelecimento, setEstabelecimento] = useState(
    "Pet Shop Bicho Feliz"
  );

  const [horarios, setHorarios] = useState({
    Segunda: {
      inicio1: "08:00",
      fim1: "12:00",
      inicio2: "13:00",
      fim2: "18:00",
    },
    Terça: {
      inicio1: "08:00",
      fim1: "12:00",
      inicio2: "13:00",
      fim2: "18:00",
    },
    Quarta: {
      inicio1: "08:00",
      fim1: "12:00",
      inicio2: "13:00",
      fim2: "18:00",
    },
    Quinta: {
      inicio1: "08:00",
      fim1: "12:00",
      inicio2: "13:00",
      fim2: "18:00",
    },
    Sexta: {
      inicio1: "08:00",
      fim1: "12:00",
      inicio2: "13:00",
      fim2: "18:00",
    },
    Sábado: {
      inicio1: "08:00",
      fim1: "14:00",
      inicio2: "",
      fim2: "",
    },
    Domingo: {
      inicio1: "",
      fim1: "",
      inicio2: "",
      fim2: "",
    },
  });

  const [excecoes, setExcecoes] = useState([
    {
      id: 1,
      data: "25/12/2026",
      nome: "Natal",
      tipo: "fechado",
      inicio: "",
      fim: "",
    },
    {
      id: 2,
      data: "31/12/2026",
      nome: "Réveillon",
      tipo: "horario",
      inicio: "08:00",
      fim: "13:00",
    },
    {
      id: 3,
      data: "01/01/2027",
      nome: "Ano Novo",
      tipo: "fechado",
      inicio: "",
      fim: "",
    },
  ]);

  const [mostrarFormExcecao, setMostrarFormExcecao] = useState(false);

  const [novaExcecao, setNovaExcecao] = useState({
    data: "",
    nome: "",
    tipo: "fechado",
    inicio: "08:00",
    fim: "13:00",
  });

  const [servicos, setServicos] = useState([
    {
      id: 1,
      nome: "Banho",
      disponivel: true,
    },
    {
      id: 2,
      nome: "Tosa",
      disponivel: true,
    },
    {
      id: 3,
      nome: "Banho + Tosa",
      disponivel: true,
    },
    {
      id: 4,
      nome: "Consulta veterinária",
      disponivel: true,
    },
  ]);

  function atualizarHorario(dia, campo, valor) {
    setHorarios((estadoAtual) => ({
      ...estadoAtual,
      [dia]: {
        ...estadoAtual[dia],
        [campo]: valor,
      },
    }));
  }

  function adicionarExcecao() {
    if (!novaExcecao.data || !novaExcecao.nome.trim()) {
      alert("Preencha a data e o nome da exceção.");
      return;
    }

    if (
      novaExcecao.tipo === "horario" &&
      (!novaExcecao.inicio || !novaExcecao.fim)
    ) {
      alert("Informe o horário inicial e final da exceção.");
      return;
    }

    const excecao = {
      id: Date.now(),
      ...novaExcecao,
      nome: novaExcecao.nome.trim(),
    };

    setExcecoes((estadoAtual) => [...estadoAtual, excecao]);

    setNovaExcecao({
      data: "",
      nome: "",
      tipo: "fechado",
      inicio: "08:00",
      fim: "13:00",
    });

    setMostrarFormExcecao(false);
  }

  function removerExcecao(id) {
    setExcecoes((estadoAtual) =>
      estadoAtual.filter((excecao) => excecao.id !== id)
    );
  }

  function alternarServico(id) {
    setServicos((estadoAtual) =>
      estadoAtual.map((servico) =>
        servico.id === id
          ? {
              ...servico,
              disponivel: !servico.disponivel,
            }
          : servico
      )
    );
  }

  function formatarData(data) {
    if (!data) {
      return "";
    }

    // Se a data já estiver no formato DD/MM/AAAA,
    // mantém como está.
    if (data.includes("/")) {
      return data;
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function salvarHorarios() {
    const dados = {
      estabelecimento,
      horarios,
      excecoes,
      servicos,
    };

    localStorage.setItem(
      "petagenda_horarios_adm",
      JSON.stringify(dados)
    );

    alert("Horários e disponibilidade salvos com sucesso!");
  }

  return (
    <div className="admin-layout">
      <SidebarADM />

      <main className="admin-conteudo admin-horarios-page">
        <header className="admin-cabecalho admin-horarios-cabecalho">
          <div>
            <h1>Horários e disponibilidade</h1>

            <span className="admin-breadcrumb">
              PetAgenda / Admin / Horários
            </span>
          </div>

          <div className="admin-usuario">
            <div className="admin-avatar">A</div>

            <div>
              <strong>Administrador</strong>
              <span>Admin</span>
            </div>

            <span className="admin-chevron">⌄</span>
          </div>
        </header>

        <section className="admin-horarios-intro">
          <h2>Horários de atendimento</h2>

          <p>
            Controle funcionamento, intervalos e exceções de cada
            estabelecimento.
          </p>
        </section>

        {/* ESTABELECIMENTO */}
        <section className="admin-horarios-estabelecimento">
          <div className="admin-horarios-estabelecimento-label">
            <span>Estabelecimento</span>
          </div>

          <select
            value={estabelecimento}
            onChange={(event) =>
              setEstabelecimento(event.target.value)
            }
          >
            <option value="Pet Shop Bicho Feliz">
              Pet Shop Bicho Feliz
            </option>

            <option value="VetCare">VetCare</option>
          </select>

          <span className="admin-horarios-status">Ativo</span>
        </section>

        <section className="admin-horarios-grid">
          {/* =====================================================
              HORÁRIOS
              ===================================================== */}
          <div className="admin-horarios-card">
            <div className="admin-horarios-card-cabecalho">
              <h3>Horário de funcionamento</h3>
            </div>

            <div className="admin-horarios-lista">
              {dias.map((dia) => {
                const horario = horarios[dia];

                const fechado = dia === "Domingo";
                const sabado = dia === "Sábado";

                return (
                  <div
                    key={dia}
                    className={`admin-horario-linha ${
                      fechado
                        ? "admin-horario-fechado-linha"
                        : ""
                    }`}
                  >
                    <div className="admin-horario-dia">
                      <strong>{dia}</strong>
                    </div>

                    {fechado ? (
                      <span className="admin-horario-fechado">
                        Fechado
                      </span>
                    ) : (
                      <div className="admin-horario-periodos">
                        {/* PRIMEIRO PERÍODO */}
                        <div className="admin-horario-periodo">
                          <input
                            type="time"
                            value={horario.inicio1}
                            onChange={(event) =>
                              atualizarHorario(
                                dia,
                                "inicio1",
                                event.target.value
                              )
                            }
                          />

                          <span>—</span>

                          <input
                            type="time"
                            value={horario.fim1}
                            onChange={(event) =>
                              atualizarHorario(
                                dia,
                                "fim1",
                                event.target.value
                              )
                            }
                          />
                        </div>

                        {/* SEGUNDO PERÍODO */}
                        {!sabado && (
                          <div className="admin-horario-periodo">
                            <input
                              type="time"
                              value={horario.inicio2}
                              onChange={(event) =>
                                atualizarHorario(
                                  dia,
                                  "inicio2",
                                  event.target.value
                                )
                              }
                            />

                            <span>—</span>

                            <input
                              type="time"
                              value={horario.fim2}
                              onChange={(event) =>
                                atualizarHorario(
                                  dia,
                                  "fim2",
                                  event.target.value
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="admin-horarios-observacao">
              Intervalo de almoço configurado automaticamente.
            </div>
          </div>

          {/* =====================================================
              EXCEÇÕES
              ===================================================== */}
          <div className="admin-excecoes-card">
            <div className="admin-excecoes-cabecalho">
              <div>
                <h3>Exceções</h3>
              </div>

              <button
                type="button"
                className="admin-excecoes-adicionar"
                onClick={() =>
                  setMostrarFormExcecao(
                    (estadoAtual) => !estadoAtual
                  )
                }
              >
                <span>+</span>
                {mostrarFormExcecao
                  ? "Fechar"
                  : "Adicionar"}
              </button>
            </div>

            {/* FORMULÁRIO */}
            {mostrarFormExcecao && (
              <div className="admin-excecao-form">
                <div className="admin-excecao-form-linha">
                  <label>
                    Data

                    <input
                      type="date"
                      value={novaExcecao.data}
                      onChange={(event) =>
                        setNovaExcecao({
                          ...novaExcecao,
                          data: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Nome

                    <input
                      type="text"
                      placeholder="Ex.: Feriado"
                      value={novaExcecao.nome}
                      onChange={(event) =>
                        setNovaExcecao({
                          ...novaExcecao,
                          nome: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>

                <label>
                  Tipo

                  <select
                    value={novaExcecao.tipo}
                    onChange={(event) =>
                      setNovaExcecao({
                        ...novaExcecao,
                        tipo: event.target.value,
                      })
                    }
                  >
                    <option value="fechado">
                      Fechado
                    </option>

                    <option value="horario">
                      Horário especial
                    </option>
                  </select>
                </label>

                {novaExcecao.tipo === "horario" && (
                  <div className="admin-excecao-form-periodo">
                    <input
                      type="time"
                      value={novaExcecao.inicio}
                      onChange={(event) =>
                        setNovaExcecao({
                          ...novaExcecao,
                          inicio: event.target.value,
                        })
                      }
                    />

                    <span>—</span>

                    <input
                      type="time"
                      value={novaExcecao.fim}
                      onChange={(event) =>
                        setNovaExcecao({
                          ...novaExcecao,
                          fim: event.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div className="admin-excecao-form-acoes">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormExcecao(false);

                      setNovaExcecao({
                        data: "",
                        nome: "",
                        tipo: "fechado",
                        inicio: "08:00",
                        fim: "13:00",
                      });
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={adicionarExcecao}
                  >
                    Adicionar exceção
                  </button>
                </div>
              </div>
            )}

            {/* LISTA DE EXCEÇÕES */}
            <div className="admin-excecoes-lista">
              {excecoes.length === 0 ? (
                <div className="admin-excecoes-vazia">
                  Nenhuma exceção cadastrada.
                </div>
              ) : (
                excecoes.map((excecao) => (
                  <div
                    key={excecao.id}
                    className="admin-excecao-item"
                  >
                    <div className="admin-excecao-info">
                      <strong>
                        {formatarData(excecao.data)}
                      </strong>

                      <span>{excecao.nome}</span>
                    </div>

                    {excecao.tipo === "fechado" ? (
                      <span className="admin-excecao-badge fechado">
                        Fechado
                      </span>
                    ) : (
                      <span className="admin-excecao-badge horario">
                        {excecao.inicio} — {excecao.fim}
                      </span>
                    )}

                    <button
                      type="button"
                      className="admin-excecao-remover"
                      onClick={() =>
                        removerExcecao(excecao.id)
                      }
                      title="Remover exceção"
                      aria-label={`Remover exceção de ${excecao.nome}`}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* =================================================
                DISPONIBILIDADE POR SERVIÇO
                ================================================= */}
            <div className="admin-disponibilidade">
              <h4>Disponibilidade por serviço</h4>

              <p>
                Ative ou desative quais serviços podem receber
                agendamentos neste estabelecimento.
              </p>

              <div className="admin-servicos-disponibilidade">
                {servicos.map((servico) => (
                  <div
                    key={servico.id}
                    className="admin-servico-disponibilidade"
                  >
                    <div className="admin-servico-info">
                      <span className="admin-servico-nome">
                        {servico.nome}
                      </span>

                      <span
                        className={`admin-servico-status ${
                          servico.disponivel
                            ? "ativo"
                            : "inativo"
                        }`}
                      >
                        {servico.disponivel
                          ? "Disponível"
                          : "Indisponível"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`admin-mini-switch ${
                        servico.disponivel
                          ? "ativo"
                          : ""
                      }`}
                      onClick={() =>
                        alternarServico(servico.id)
                      }
                      aria-pressed={servico.disponivel}
                      aria-label={
                        servico.disponivel
                          ? `Desativar ${servico.nome}`
                          : `Ativar ${servico.nome}`
                      }
                      title={
                        servico.disponivel
                          ? "Desativar serviço"
                          : "Ativar serviço"
                      }
                    >
                      <span className="admin-mini-switch-slider" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SALVAR
            ===================================================== */}
        <div className="admin-horarios-acoes">
          <button
            type="button"
            className="admin-horarios-btn-principal"
            onClick={salvarHorarios}
          >
            Salvar alterações
          </button>
        </div>
      </main>
    </div>
  );
}

export default HorariosADM;