import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarADM from "../../components/ADM/SidebarADM";

function NovoServicoADM() {
  const navigate = useNavigate();

  const [tipo, setTipo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [usuario, setUsuario] = useState("");
  const [estabelecimento, setEstabelecimento] = useState("");
  const [contato, setContato] = useState("");
  const [pet, setPet] = useState("");

  function salvarRascunho() {
    const dados = {
      tipo,
      descricao,
      usuario,
      estabelecimento,
      contato,
      pet,
      status: "Rascunho",
    };

    localStorage.setItem(
      "petagenda_novo_servico",
      JSON.stringify(dados)
    );

    alert("Serviço salvo como rascunho.");
  }

  function proximo() {
    const dados = {
      tipo,
      descricao,
      usuario,
      estabelecimento,
      contato,
      pet,
      status: "Pendente",
    };

    localStorage.setItem(
      "petagenda_novo_servico",
      JSON.stringify(dados)
    );

    alert("Dados do serviço salvos.");

    // Por enquanto, volta para a listagem.
    // A próxima etapa pode ser criada depois.
    navigate("/admin/servicos");
  }

  return (
    <div className="admin-layout">
      <SidebarADM />

      <main className="admin-conteudo admin-novo-servico-page">
        <header className="admin-cabecalho">
          <div>
            <span className="admin-breadcrumb">
              PetAgenda / Admin / Serviços / Novo
            </span>

            <h1>Novo serviço</h1>
          </div>
        </header>

        <section className="admin-novo-servico-topo">
          <h2>Solicitações pendentes</h2>

          <div className="admin-solicitacoes">
            <div className="admin-solicitacao">
              <strong>Pet Bicho feliz</strong>
              <span>Banho &amp; Tosa • Todos os ...</span>
            </div>

            <div className="admin-solicitacao">
              <strong>Pet e Cia</strong>
              <span>Checkup • Segunda a qua...</span>
            </div>

            <div className="admin-solicitacao">
              <strong>Clínica VetVida</strong>
              <span>Banho &amp; Tosa • Todos os ...</span>
            </div>

            <div className="admin-solicitacao">
              <strong>Clínica VetVida</strong>
              <span>Banho &amp; Tosa • Todos os ...</span>
            </div>

            <div className="admin-solicitacao">
              <strong>Clínica VetVida</strong>
              <span>Banho &amp; Tosa • Todos os ...</span>
            </div>
          </div>
        </section>

        <section className="admin-novo-servico-grid">
          <div className="admin-form-card">
            <h3>Dados do serviço</h3>

            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label>Tipo</label>

                <select
                  value={tipo}
                  onChange={(event) => setTipo(event.target.value)}
                >
                  <option value="">Selecionar</option>
                  <option value="Banho">Banho</option>
                  <option value="Tosa">Tosa</option>
                  <option value="Banho + Tosa">Banho + Tosa</option>
                  <option value="Consulta veterinária">
                    Consulta veterinária
                  </option>
                  <option value="Vacinação">Vacinação</option>
                  <option value="Higienização dental">
                    Higienização dental
                  </option>
                </select>
              </div>

              <div className="admin-form-field">
                <label>Usuário</label>

                <input
                  type="text"
                  placeholder="Buscar..."
                  value={usuario}
                  onChange={(event) => setUsuario(event.target.value)}
                />
              </div>

              <div className="admin-form-field admin-form-field-full">
                <label>Descrição</label>

                <input
                  type="text"
                  placeholder="Inserir..."
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                />
              </div>

              <div className="admin-form-field">
                <label>Estabelecimento</label>

                <select
                  value={estabelecimento}
                  onChange={(event) =>
                    setEstabelecimento(event.target.value)
                  }
                >
                  <option value="">Selecionar</option>
                  <option value="Pet Shop Bicho Feliz">
                    Pet Shop Bicho Feliz
                  </option>
                  <option value="Pet e Cia">Pet e Cia</option>
                  <option value="Clínica VetVida">
                    Clínica VetVida
                  </option>
                  <option value="VetCare">VetCare</option>
                </select>
              </div>

              <div className="admin-form-field">
                <label>Contato</label>

                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={contato}
                  onChange={(event) => setContato(event.target.value)}
                />
              </div>

              <div className="admin-form-field pet-field">
                <label>PET</label>

                <input
                  type="text"
                  placeholder="Buscar..."
                  value={pet}
                  onChange={(event) => setPet(event.target.value)}
                />
              </div>

              <button
                type="button"
                className="admin-btn-pet"
                onClick={() => alert("PET adicionado.")}
              >
                Adicionar PET
              </button>
            </div>
          </div>

          <aside className="admin-resumo-servico">
            <h3>Resumo do serviço</h3>

            <div className="admin-resumo-item">
              <span>Serviço</span>
              <strong>{tipo || "Banho e tosa"}</strong>
            </div>

            <div className="admin-resumo-item">
              <span>Estabelecimento</span>
              <strong>
                {estabelecimento || "Pet Bicho feliz"}
              </strong>
            </div>

            <div className="admin-resumo-item">
              <span>Data</span>
              <strong>xx/xx/xxxx</strong>
            </div>

            <div className="admin-resumo-item">
              <span>Hora</span>
              <strong>xx:xx</strong>
            </div>

            <div className="admin-resumo-item">
              <span>Duração</span>
              <strong>xx min</strong>
            </div>

            <div className="admin-resumo-item">
              <span>Preço</span>
              <strong>R$ xx.xx</strong>
            </div>

            <div className="admin-resumo-item">
              <span>Adicional</span>
              <strong>R$ xx.xx</strong>
            </div>

            <div className="admin-resumo-item">
              <span>Total</span>
              <strong>R$ xx.xx</strong>
            </div>
          </aside>
        </section>

        <div className="admin-novo-servico-acoes">
          <button
            type="button"
            className="admin-btn-rascunho"
            onClick={salvarRascunho}
          >
            Salvar rascunho
          </button>

          <button
            type="button"
            className="admin-btn-proximo"
            onClick={proximo}
          >
            Próximo →
          </button>
        </div>
      </main>
    </div>
  );
}

export default NovoServicoADM;