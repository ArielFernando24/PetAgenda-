import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarADM from "../../components/ADM/SidebarADM";
import { clinicasApi } from "../../services/api";
import { buildClinicaPayloadFromWizard } from "../../utils/clinica-wizard";

function HorariosEstabelecimentoADM() {
  const navigate = useNavigate();

  const dadosSalvos = JSON.parse(
    localStorage.getItem("petagenda_novo_estabelecimento") || "{}"
  );

  const [horarios, setHorarios] = useState(
    dadosSalvos.horarios || {
      segunda: { ativo: true, abertura: "08:00", fechamento: "18:00" },
      terca: { ativo: true, abertura: "08:00", fechamento: "18:00" },
      quarta: { ativo: true, abertura: "08:00", fechamento: "18:00" },
      quinta: { ativo: true, abertura: "08:00", fechamento: "18:00" },
      sexta: { ativo: true, abertura: "08:00", fechamento: "18:00" },
      sabado: { ativo: true, abertura: "08:00", fechamento: "13:00" },
      domingo: { ativo: false, abertura: "08:00", fechamento: "13:00" },
    }
  );

  const dias = [
    ["segunda", "Segunda-feira"],
    ["terca", "Terça-feira"],
    ["quarta", "Quarta-feira"],
    ["quinta", "Quinta-feira"],
    ["sexta", "Sexta-feira"],
    ["sabado", "Sábado"],
    ["domingo", "Domingo"],
  ];

  function atualizarHorario(dia, campo, valor) {
    setHorarios((atual) => ({
      ...atual,
      [dia]: {
        ...atual[dia],
        [campo]: valor,
      },
    }));
  }

  async function finalizar() {
    const dadosFinais = {
      ...dadosSalvos,
      horarios,
      status: "Ativo",
    };

    const payload = buildClinicaPayloadFromWizard(dadosFinais);

    try {
      const clinicaCriada = await clinicasApi.create(payload);

      const locais = JSON.parse(
        localStorage.getItem("petagenda_estabelecimentos_local") || "[]"
      );

      const arrayLocal = Array.isArray(locais) ? locais : [];
      arrayLocal.push({
        ...clinicaCriada,
        id: clinicaCriada?.id || crypto.randomUUID(),
        servicos: Array.isArray(clinicaCriada?.servicos)
          ? clinicaCriada.servicos
          : payload.servicos || [],
      });
      localStorage.setItem(
        "petagenda_estabelecimentos_local",
        JSON.stringify(arrayLocal)
      );

      localStorage.removeItem("petagenda_novo_estabelecimento");
      alert("Estabelecimento cadastrado com sucesso!");
      navigate("/admin/estabelecimentos");
    } catch (error) {
      const locais = JSON.parse(
        localStorage.getItem("petagenda_estabelecimentos_local") || "[]"
      );
      const arrayLocal = Array.isArray(locais) ? locais : [];
      arrayLocal.push({
        id: crypto.randomUUID(),
        nome: payload.nome,
        telefone: payload.telefone,
        email: payload.email,
        endereco: payload.endereco,
        cidade: payload.cidade,
        estado: payload.estado,
        descricao: payload.descricao,
        servicos: payload.servicos,
        horarioFuncionamento: payload.horarioFuncionamento,
      });
      localStorage.setItem(
        "petagenda_estabelecimentos_local",
        JSON.stringify(arrayLocal)
      );
      localStorage.removeItem("petagenda_novo_estabelecimento");
      alert("Estabelecimento salvo localmente e ficará disponível para seleção do usuário.");
      navigate("/admin/estabelecimentos");
    }
  }

  return (
    <div className="admin-layout">
      <SidebarADM />

      <main className="admin-conteudo admin-wizard-page">
        <header className="admin-cabecalho">
          <div>
            <span className="admin-breadcrumb">
              PetAgenda / Admin / Estabelecimentos / Novo
            </span>

            <h1>Novo estabelecimento</h1>

            <p>Defina os horários de funcionamento.</p>
          </div>

          <div className="admin-usuario">
            <div className="admin-avatar">AD</div>

            <div>
              <strong>Administrador</strong>
              <span>Administrador</span>
            </div>

            <span className="admin-chevron">⌄</span>
          </div>
        </header>

        <div className="admin-stepper">
          <div className="admin-step concluido">
            <span>✓</span>
            <strong>Informações</strong>
          </div>

          <div className="admin-step-linha ativo" />

          <div className="admin-step concluido">
            <span>✓</span>
            <strong>Endereço</strong>
          </div>

          <div className="admin-step-linha ativo" />

          <div className="admin-step concluido">
            <span>✓</span>
            <strong>Serviços</strong>
          </div>

          <div className="admin-step-linha ativo" />

          <div className="admin-step atual">
            <span>4</span>
            <strong>Horários</strong>
          </div>
        </div>

        <section className="admin-wizard-conteudo">
          <div className="admin-wizard-titulo">
            <h2>Horários de funcionamento</h2>
            <p>Configure os dias e horários em que o estabelecimento funciona.</p>
          </div>

          <div className="admin-wizard-card">
            <div className="admin-horarios">
              {dias.map(([dia, nome]) => (
                <div className="admin-horario-linha" key={dia}>
                  <label className="admin-horario-dia">
                    <input
                      type="checkbox"
                      checked={horarios[dia].ativo}
                      onChange={(e) =>
                        atualizarHorario(dia, "ativo", e.target.checked)
                      }
                    />

                    <span>{nome}</span>
                  </label>

                  <input
                    type="time"
                    value={horarios[dia].abertura}
                    disabled={!horarios[dia].ativo}
                    onChange={(e) =>
                      atualizarHorario(dia, "abertura", e.target.value)
                    }
                  />

                  <span className="admin-horario-separador">até</span>

                  <input
                    type="time"
                    value={horarios[dia].fechamento}
                    disabled={!horarios[dia].ativo}
                    onChange={(e) =>
                      atualizarHorario(dia, "fechamento", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div className="admin-wizard-acoes">
              <button
                type="button"
                className="admin-botao-secundario"
                onClick={() =>
                  navigate("/admin/estabelecimentos/novo/servicos")
                }
              >
                ← Voltar
              </button>

              <button
                type="button"
                className="admin-botao-principal"
                onClick={finalizar}
              >
                Finalizar cadastro
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HorariosEstabelecimentoADM;