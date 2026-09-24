import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarADM from "../../components/ADM/SidebarADM";

function ServicosEstabelecimentoADM() {
  const navigate = useNavigate();

  const dadosSalvos = JSON.parse(
    localStorage.getItem("petagenda_novo_estabelecimento") || "{}"
  );

  const servicosIniciais = dadosSalvos.servicos || [];

  const [servicos, setServicos] = useState(servicosIniciais);

  const opcoes = [
    "Banho",
    "Tosa",
    "Consulta veterinária",
    "Vacinação",
    "Higiene",
    "Pet shop",
  ];

  function alternarServico(servico) {
    setServicos((atual) => {
      if (atual.includes(servico)) {
        return atual.filter((item) => item !== servico);
      }

      return [...atual, servico];
    });
  }

  function continuar() {
    const dadosAtualizados = {
      ...dadosSalvos,
      servicos,
    };

    localStorage.setItem(
      "petagenda_novo_estabelecimento",
      JSON.stringify(dadosAtualizados)
    );

    navigate("/admin/estabelecimentos/novo/horarios");
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

            <p>Configure os serviços oferecidos pelo estabelecimento.</p>
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

          <div className="admin-step atual">
            <span>3</span>
            <strong>Serviços</strong>
          </div>

          <div className="admin-step-linha" />

          <div className="admin-step">
            <span>4</span>
            <strong>Horários</strong>
          </div>
        </div>

        <section className="admin-wizard-conteudo">
          <div className="admin-wizard-titulo">
            <h2>Serviços</h2>
            <p>Selecione os serviços oferecidos pelo estabelecimento.</p>
          </div>

          <div className="admin-wizard-card">
            <div className="admin-servicos-grid">
              {opcoes.map((servico) => {
                const selecionado = servicos.includes(servico);

                return (
                  <button
                    type="button"
                    key={servico}
                    className={
                      selecionado
                        ? "admin-servico-opcao selecionado"
                        : "admin-servico-opcao"
                    }
                    onClick={() => alternarServico(servico)}
                  >
                    <span>{selecionado ? "✓" : "+"}</span>
                    {servico}
                  </button>
                );
              })}
            </div>

            <div className="admin-wizard-acoes">
              <button
                type="button"
                className="admin-botao-secundario"
                onClick={() =>
                  navigate("/admin/estabelecimentos/novo/endereco")
                }
              >
                ← Voltar
              </button>

              <button
                type="button"
                className="admin-botao-principal"
                onClick={continuar}
              >
                Próximo →
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ServicosEstabelecimentoADM;