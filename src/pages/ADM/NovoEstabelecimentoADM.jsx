import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarADM from "../../components/ADM/SidebarADM";

function NovoEstabelecimentoADM() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("Pet Shop Bicho Feliz");
  const [tipo, setTipo] = useState("Pet Shop + Banho e Tosa");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [descricao, setDescricao] = useState(
    "Cuidados, banho e serviços para cães e gatos."
  );

  const [salvando, setSalvando] = useState(false);

  function salvarRascunho() {
    setSalvando(true);

    const estabelecimento = {
      nome,
      tipo,
      cnpj,
      telefone,
      whatsapp,
      email,
      descricao,
      status: "Rascunho",
    };

    localStorage.setItem(
      "petagenda_estabelecimento_rascunho",
      JSON.stringify(estabelecimento)
    );

    setTimeout(() => {
      setSalvando(false);
      alert("Rascunho salvo com sucesso!");
    }, 400);
  }

 function proximoPasso() {
  localStorage.setItem(
    "petagenda_novo_estabelecimento",
    JSON.stringify({
      nome,
      tipo,
      cnpj,
      telefone,
      whatsapp,
      email,
      descricao,
    })
  );

  navigate("/admin/estabelecimentos/novo/endereco");
}

  return (
    <div className="admin-layout admin-novo-estabelecimento">
      <SidebarADM />

      <main className="admin-conteudo">
        <header className="admin-cabecalho admin-novo-cabecalho">
          <div>
            <h1>Novo estabelecimento</h1>

            <span className="admin-breadcrumb">
              PetAgenda / Admin / Estabelecimentos / Novo
            </span>
          </div>

          <div className="admin-usuario">
            <div className="admin-avatar">A</div>

            <div>
              <strong>Admin</strong>
              <span>Administrador</span>
            </div>

            <span className="admin-chevron">⌄</span>
          </div>
        </header>

        <section className="admin-stepper">
          <div className="admin-step admin-step-ativo">
            <span>1</span>
            <strong>Informações</strong>
          </div>

          <div className="admin-step-divider" />

          <div className="admin-step">
            <span>2</span>
            <strong>Endereço</strong>
          </div>

          <div className="admin-step-divider" />

          <div className="admin-step">
            <span>3</span>
            <strong>Serviços</strong>
          </div>

          <div className="admin-step-divider" />

          <div className="admin-step">
            <span>4</span>
            <strong>Horários</strong>
          </div>
        </section>

        <section className="admin-novo-intro">
          <h2>Informações básicas</h2>
          <p>Comece pelo perfil público do estabelecimento.</p>
        </section>

        <div className="admin-novo-grid">
          <section className="admin-form-card">
            <h3>Dados do estabelecimento</h3>

            <div className="admin-form-group admin-form-full">
              <label htmlFor="nome">Nome *</label>

              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do estabelecimento"
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="tipo">Tipo *</label>

                <select
                  id="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option>Pet Shop + Banho e Tosa</option>
                  <option>Pet Shop</option>
                  <option>Clínica Veterinária</option>
                  <option>Banho e Tosa</option>
                  <option>Hotel para Pets</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label htmlFor="cnpj">CNPJ</label>

                <input
                  id="cnpj"
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="telefone">Telefone *</label>

                <input
                  id="telefone"
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="whatsapp">WhatsApp</label>

                <input
                  id="whatsapp"
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="admin-form-group admin-form-full">
              <label htmlFor="email">E-mail *</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@estabelecimento.com.br"
              />
            </div>

            <div className="admin-form-group admin-form-full">
              <label htmlFor="descricao">Descrição</label>

              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o estabelecimento"
              />
            </div>
          </section>

          <aside className="admin-preview-card">
            <h3>Prévia do perfil</h3>

            <div className="admin-preview-logo">
              <span>🐾</span>
            </div>

            <h4>{nome || "Nome do estabelecimento"}</h4>

            <p>{tipo || "Tipo de estabelecimento"}</p>

            <span className="admin-status-ativo">Ativo</span>

            <div className="admin-preview-divider" />

            <h5>Próximos passos</h5>

            <p className="admin-preview-text">
              Depois, adicione endereço, serviços e horários de atendimento.
            </p>

            <div className="admin-preview-botoes">
              <button
                type="button"
                className="admin-btn-rascunho"
                onClick={salvarRascunho}
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Salvar rascunho"}
              </button>

              <button
                type="button"
                className="admin-btn-proximo"
                onClick={proximoPasso}
              >
                Próximo →
              </button>
            </div>
          </aside>
        </div>

        <button
          type="button"
          className="admin-voltar-estabelecimentos"
          onClick={() => navigate("/admin/estabelecimentos")}
        >
          ← Voltar para estabelecimentos
        </button>
      </main>
    </div>
  );
}

export default NovoEstabelecimentoADM;