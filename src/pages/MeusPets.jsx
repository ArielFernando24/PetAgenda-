import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { petsApi } from "../services/api";

function MeusPets() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletandoId, setDeletandoId] = useState(null);

  async function carregarPets() {
    setLoading(true);
    setError("");
    try {
      const data = await petsApi.list();
      setPets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Erro ao carregar seus pets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPets();
  }, []);

  async function handleExcluir(id, nome) {
    if (!window.confirm(`Tem certeza que deseja excluir ${nome}? Todos os agendamentos deste pet também serão removidos.`)) {
      return;
    }

    setDeletandoId(id);
    try {
      await petsApi.delete(id);
      setPets((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(`Falha ao excluir: ${err.message}`);
    } finally {
      setDeletandoId(null);
    }
  }

  function formatarData(dataStr) {
    if (!dataStr) return "Data não informada";
    const apenasData = dataStr.split("T")[0];
    const partes = apenasData.split("-");
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataStr;
  }

  return (
    <main className="meus-pets-page">
      <header className="meus-pets-topo">
        <div>
          <h1>Meus pets</h1>
          <p>PetAgenda / Meus pets</p>
        </div>
      </header>

      <section className="meus-pets-conteudo">
        <h2>Seus animais</h2>

        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: "#666", padding: "20px 0" }}>Carregando seus pets...</p>
        ) : pets.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              padding: "40px 20px",
              borderRadius: "14px",
              textAlign: "center",
              margin: "20px 0",
            }}
          >
            <p style={{ fontSize: "16px", color: "#555", marginBottom: "16px" }}>
              Você ainda não cadastrou nenhum pet. Que tal cadastrar seu melhor amigo agora?
            </p>
            <button
              className="meus-pets-botao-cadastrar"
              onClick={() => navigate("/cadastro-pet")}
            >
              + Cadastrar meu primeiro pet
            </button>
          </div>
        ) : (
          <div className="meus-pets-lista">
            {pets.map((pet) => (
              <article
                className="meus-pets-card"
                key={pet.id}
                style={{ position: "relative", minHeight: "90px" }}
              >
                <div>
                  <h3>{pet.nome}</h3>
                  <p>
                    {pet.especie} • {pet.raca || "SRD / Sem raça"} • {formatarData(pet.dataNascimento)}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "12px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/cadastro-pet?id=${pet.id}`)}
                    style={{
                      background: "#e8eff7",
                      color: "#38598b",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExcluir(pet.id, pet.nome)}
                    disabled={deletandoId === pet.id}
                    style={{
                      background: "#fee2e2",
                      color: "#b91c1c",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    {deletandoId === pet.id ? "Excluindo..." : "🗑️ Excluir"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="meus-pets-acoes">
          <button
            className="meus-pets-botao-cadastrar"
            onClick={() => navigate("/cadastro-pet")}
          >
            + Cadastrar novo pet
          </button>

          <button
            className="meus-pets-botao-premium"
            onClick={() => navigate("/premium")}
          >
            Conhecer Premium
          </button>
        </div>
      </section>

      <footer className="meus-pets-footer">
        <div className="meus-pets-linha"></div>

        <div className="meus-pets-rodape-conteudo">
          <p>Feito com carinho para quem cuida de quem ama.</p>
          <span>🐾</span>
        </div>
      </footer>
    </main>
  );
}

export default MeusPets;