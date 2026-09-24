import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SidebarADM from "../../components/ADM/SidebarADM";

const estabelecimentos = [
  {
    nome: "VetCare",
    tipo: "Clínica",
    localizacao: "São Paulo • SP",
    servicos: 8,
    status: "Ativo",
  },
  {
    nome: "Pet Shop Bicho Feliz",
    tipo: "Pet Shop",
    localizacao: "Campinas • SP",
    servicos: 6,
    status: "Ativo",
  },
  {
    nome: "Mundo Pet",
    tipo: "Pet Shop",
    localizacao: "Santos • SP",
    servicos: 4,
    status: "Pendente",
  },
  {
    nome: "Clínica Vida Animal",
    tipo: "Clínica",
    localizacao: "Jundiaí • SP",
    servicos: 10,
    status: "Ativo",
  },
  {
    nome: "Pet & Cia",
    tipo: "Pet Shop",
    localizacao: "São Paulo • SP",
    servicos: 3,
    status: "Suspenso",
  },
  {
    nome: "Amigo Fiel",
    tipo: "Pet Shop",
    localizacao: "Sorocaba • SP",
    servicos: 5,
    status: "Ativo",
  },
];

function EstabelecimentosADM() {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [cidade, setCidade] = useState("Todas");

  const estabelecimentosFiltrados = useMemo(() => {
    return estabelecimentos.filter((estabelecimento) => {
      const termo = busca
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ");

      const correspondeBusca =
        !termo ||
        estabelecimento.nome
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s]/g, " ")
          .replace(/\s+/g, " ")
          .includes(termo) ||
        estabelecimento.localizacao
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s]/g, " ")
          .replace(/\s+/g, " ")
          .includes(termo);

      const correspondeTipo =
        tipo === "Todos" || estabelecimento.tipo === tipo;

      const correspondeStatus =
        status === "Todos" || estabelecimento.status === status;

      const correspondeCidade =
        cidade === "Todas" ||
        estabelecimento.localizacao.startsWith(cidade);

      return (
        correspondeBusca &&
        correspondeTipo &&
        correspondeStatus &&
        correspondeCidade
      );
    });
  }, [busca, tipo, status, cidade]);

  return (
    <div className="admin-layout">
      <SidebarADM />

      <main className="admin-conteudo">
        <header className="admin-cabecalho">
          <div>
            <h1>Estabelecimentos</h1>

            <span className="admin-breadcrumb">
              PetAgenda / Admin / Estabelecimentos
            </span>
          </div>

          
        </header>

        <section className="admin-estabelecimentos-intro">
          <div>
            <h2>Gerencie parceiros do PetAgenda</h2>

            <p>
              Cadastre clínicas, pet shops e negócios de cuidados para pets.
            </p>
          </div>

          <Link
            to="/admin/estabelecimentos/novo"
            className="admin-botao-novo"
          >
            + Novo estabelecimento
          </Link>
        </section>

        <section className="admin-filtros">
          <div className="admin-busca">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Buscar por nome, cidade ou CNPJ..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>

          <select
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
            className="admin-filtro-select"
          >
            <option value="Todos">Todos os tipos</option>
            <option value="Clínica">Clínica</option>
            <option value="Pet Shop">Pet Shop</option>
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="admin-filtro-select admin-filtro-status"
          >
            <option value="Todos">Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Pendente">Pendente</option>
            <option value="Suspenso">Suspenso</option>
          </select>

          <select
            value={cidade}
            onChange={(event) => setCidade(event.target.value)}
            className="admin-filtro-select"
          >
            <option value="Todas">Cidade</option>
            <option value="São Paulo">São Paulo</option>
            <option value="Campinas">Campinas</option>
            <option value="Santos">Santos</option>
            <option value="Jundiaí">Jundiaí</option>
            <option value="Sorocaba">Sorocaba</option>
          </select>
        </section>

        <section className="admin-tabela-estabelecimentos">
          <div className="admin-tabela-cabecalho">
            <span>Estabelecimento</span>
            <span>Tipo</span>
            <span>Localização</span>
            <span>Serviços</span>
            <span>Status</span>
            <span>Ações</span>
          </div>

          {estabelecimentosFiltrados.length > 0 ? (
            estabelecimentosFiltrados.map((estabelecimento) => (
              <div
                className="admin-tabela-linha"
                key={estabelecimento.nome}
              >
                <strong>{estabelecimento.nome}</strong>

                <span>{estabelecimento.tipo}</span>

                <span>{estabelecimento.localizacao}</span>

                <strong>{estabelecimento.servicos}</strong>

                <span
                  className={`admin-status admin-status-${estabelecimento.status
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")}`}
                >
                  {estabelecimento.status}
                </span>

                <button
                  type="button"
                  className="admin-acao"
                  onClick={() =>
                    console.log(
                      `Editar estabelecimento: ${estabelecimento.nome}`
                    )
                  }
                >
                  Editar&nbsp; • &nbsp;⋮
                </button>
              </div>
            ))
          ) : (
            <div className="admin-tabela-sem-resultados">
              Nenhum estabelecimento encontrado.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default EstabelecimentosADM;