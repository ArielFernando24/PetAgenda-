import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarADM from "../../components/ADM/SidebarADM";

function ServicosADM() {
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [estabelecimento, setEstabelecimento] = useState("Todos");

  const servicos = [
    {
      id: 1,
      nome: "Banho",
      categoria: "Higiene e estética",
      estabelecimento: "Pet Shop Bicho Feliz",
      preco: "R$ 50,00",
      duracao: "60 min",
      capacidade: "2 pets",
      status: "Ativo",
    },
    {
      id: 2,
      nome: "Tosa",
      categoria: "Higiene e estética",
      estabelecimento: "Pet Shop Bicho Feliz",
      preco: "R$ 70,00",
      duracao: "90 min",
      capacidade: "1 pet",
      status: "Ativo",
    },
    {
      id: 3,
      nome: "Banho + Tosa",
      categoria: "Higiene e estética",
      estabelecimento: "Pet Shop Bicho Feliz",
      preco: "R$ 110,00",
      duracao: "120 min",
      capacidade: "1 pet",
      status: "Ativo",
    },
    {
      id: 4,
      nome: "Consulta veterinária",
      categoria: "Veterinário",
      estabelecimento: "VetCare",
      preco: "R$ 150,00",
      duracao: "30 min",
      capacidade: "1 pet",
      status: "Ativo",
    },
    {
      id: 5,
      nome: "Vacinação",
      categoria: "Veterinário",
      estabelecimento: "VetCare",
      preco: "R$ 80,00",
      duracao: "20 min",
      capacidade: "1 pet",
      status: "Ativo",
    },
    {
      id: 6,
      nome: "Higienização dental",
      categoria: "Odontologia",
      estabelecimento: "VetCare",
      preco: "R$ 90,00",
      duracao: "30 min",
      capacidade: "1 pet",
      status: "Ativo",
    },
  ];

  const servicosFiltrados = useMemo(() => {
    return servicos.filter((servico) => {
      const textoBusca = busca.toLowerCase().trim();

      const correspondeBusca =
        !textoBusca ||
        servico.nome.toLowerCase().includes(textoBusca) ||
        servico.categoria.toLowerCase().includes(textoBusca) ||
        servico.estabelecimento.toLowerCase().includes(textoBusca);

      const correspondeCategoria =
        categoria === "Todas" || servico.categoria === categoria;

      const correspondeEstabelecimento =
        estabelecimento === "Todos" ||
        servico.estabelecimento === estabelecimento;

      return (
        correspondeBusca &&
        correspondeCategoria &&
        correspondeEstabelecimento
      );
    });
  }, [busca, categoria, estabelecimento]);

  return (
    <div className="admin-layout">
      <SidebarADM />

      <main className="admin-conteudo admin-servicos-page">
        <header className="admin-cabecalho">
          <div>
            <span className="admin-breadcrumb">
              PetAgenda / Admin / Serviços
            </span>

            <h1>Serviços</h1>
          </div>

          <div className="admin-usuario">
            <div className="admin-avatar">A</div>

            <div>
              <strong>Admin</strong>
            </div>

            <span className="admin-chevron">⌄</span>
          </div>
        </header>

        <section className="admin-servicos-intro">
          <div>
            <h2>Catálogo de serviços</h2>

            <p>
              Defina serviços, duração, preço e capacidade de atendimento.
            </p>
          </div>

          <button
            type="button"
            className="admin-botao-novo"
            onClick={() => navigate("/admin/servicos/novo")}
          >
            + Novo serviço
          </button>
        </section>

        <section className="admin-servicos-filtros">
          <div className="admin-servicos-busca">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Buscar serviço..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>

          <select
            value={categoria}
            onChange={(event) => setCategoria(event.target.value)}
          >
            <option value="Todas">Categoria</option>
            <option value="Todas">Todas</option>
            <option value="Higiene e estética">
              Higiene e estética
            </option>
            <option value="Veterinário">Veterinário</option>
            <option value="Odontologia">Odontologia</option>
          </select>

          <select
            value={estabelecimento}
            onChange={(event) =>
              setEstabelecimento(event.target.value)
            }
          >
            <option value="Todos">Estabelecimento</option>
            <option value="Todos">Todos</option>
            <option value="Pet Shop Bicho Feliz">
              Pet Shop Bicho Feliz
            </option>
            <option value="VetCare">VetCare</option>
          </select>
        </section>

        <section className="admin-lista-servicos">
          {servicosFiltrados.map((servico) => (
            <article
              className="admin-servico-row"
              key={servico.id}
            >
              <div className="admin-servico-nome">
                <strong>{servico.nome}</strong>
                <span>{servico.categoria}</span>
              </div>

              <div className="admin-servico-estabelecimento">
                {servico.estabelecimento}
              </div>

              <div className="admin-servico-preco">
                {servico.preco}
              </div>

              <div className="admin-servico-duracao">
                {servico.duracao}
              </div>

              <div className="admin-servico-capacidade">
                {servico.capacidade}
              </div>

              <div className="admin-servico-status">
                <span>{servico.status}</span>
              </div>

              <button
                type="button"
                className="admin-servico-acoes"
                onClick={() =>
                  alert(`Editar serviço: ${servico.nome}`)
                }
              >
                Editar&nbsp;&nbsp;•&nbsp;&nbsp;⋮
              </button>
            </article>
          ))}

          {servicosFiltrados.length === 0 && (
            <div className="admin-servicos-vazio">
              <p>Nenhum serviço encontrado.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ServicosADM;