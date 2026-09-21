import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarADM from "../../components/ADM/SidebarADM";

function EnderecoEstabelecimentoADM() {
  const navigate = useNavigate();

  const dadosSalvos = JSON.parse(
    localStorage.getItem("petagenda_novo_estabelecimento") || "{}"
  );

  const [cep, setCep] = useState(dadosSalvos.cep || "");
  const [logradouro, setLogradouro] = useState(dadosSalvos.logradouro || "");
  const [numero, setNumero] = useState(dadosSalvos.numero || "");
  const [complemento, setComplemento] = useState(
    dadosSalvos.complemento || ""
  );
  const [bairro, setBairro] = useState(dadosSalvos.bairro || "");
  const [cidade, setCidade] = useState(dadosSalvos.cidade || "");
  const [estado, setEstado] = useState(dadosSalvos.estado || "");

  function salvarEContinuar() {
    const dadosAtualizados = {
      ...dadosSalvos,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
    };

    localStorage.setItem(
      "petagenda_novo_estabelecimento",
      JSON.stringify(dadosAtualizados)
    );

    navigate("/admin/estabelecimentos/novo/servicos");
  }

  function voltar() {
    navigate("/admin/estabelecimentos/novo");
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

            <p>Cadastre as informações do estabelecimento parceiro.</p>
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

          <div className="admin-step atual">
            <span>2</span>
            <strong>Endereço</strong>
          </div>

          <div className="admin-step-linha" />

          <div className="admin-step">
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
            <h2>Endereço</h2>
            <p>Informe o endereço do estabelecimento.</p>
          </div>

          <div className="admin-wizard-card">
            <div className="admin-form-grid">
              <div className="admin-form-grupo">
                <label>CEP</label>
                <input
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                />
              </div>

              <div className="admin-form-grupo admin-form-grupo-maior">
                <label>Logradouro</label>
                <input
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  placeholder="Rua, avenida..."
                />
              </div>

              <div className="admin-form-grupo">
                <label>Número</label>
                <input
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="123"
                />
              </div>

              <div className="admin-form-grupo">
                <label>Complemento</label>
                <input
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Sala, loja..."
                />
              </div>

              <div className="admin-form-grupo">
                <label>Bairro</label>
                <input
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Bairro"
                />
              </div>

              <div className="admin-form-grupo">
                <label>Cidade</label>
                <input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Cidade"
                />
              </div>

              <div className="admin-form-grupo">
                <label>Estado</label>

                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
            </div>

            <div className="admin-wizard-acoes">
              <button
                type="button"
                className="admin-botao-secundario"
                onClick={voltar}
              >
                ← Voltar
              </button>

              <button
                type="button"
                className="admin-botao-principal"
                onClick={salvarEContinuar}
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

export default EnderecoEstabelecimentoADM;