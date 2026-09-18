import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { petsApi } from "../services/api";
import cachorro from "../assets/cachorro-petagenda.png";

function CadastroPet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("Cachorro");
  const [raca, setRaca] = useState("");
  const [sexo, setSexo] = useState("NAO_INFORMADO");
  const [dataNascimento, setDataNascimento] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(Boolean(editId));
  const [error, setError] = useState("");
  const [cadastrado, setCadastrado] = useState(false);

  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (editId) {
      async function carregarPet() {
        try {
          const pet = await petsApi.getById(editId);
          if (pet) {
            setNome(pet.nome || "");
            setEspecie(pet.especie || "Cachorro");
            setRaca(pet.raca || "");
            setSexo(pet.sexo || "NAO_INFORMADO");
            if (pet.dataNascimento) {
              setDataNascimento(pet.dataNascimento.split("T")[0]);
            }
          }
        } catch (err) {
          setError(`Erro ao carregar dados do pet: ${err.message}`);
        } finally {
          setLoadingDados(false);
        }
      }
      carregarPet();
    }
  }, [editId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!nome.trim() || !especie.trim() || !dataNascimento) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (new Date(`${dataNascimento}T00:00:00Z`) > new Date()) {
      setError("A data de nascimento não pode ser no futuro.");
      return;
    }

    setLoading(true);

    const payload = {
      nome: nome.trim(),
      especie: especie.trim(),
      raca: raca.trim() || null,
      sexo,
      dataNascimento,
    };

    try {
      if (editId) {
        await petsApi.update(editId, payload);
      } else {
        await petsApi.create(payload);
      }

      setCadastrado(true);
      setTimeout(() => {
        navigate("/meus-pets");
      }, 1300);
    } catch (err) {
      setError(err.message || "Erro ao salvar o pet.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingDados) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Carregando dados do pet...</p>
      </div>
    );
  }

  return (
    <>
      <header className="header">
        <div>
          <p className="breadcrumb">
            <Link to="/meus-pets" style={{ textDecoration: "none", color: "inherit" }}>
              Pets
            </Link>{" "}
            / {editId ? "Editar pet" : "Novo pet"}
          </p>
          <h1>{editId ? `Editar ${nome || "Pet"}` : "Novo pet"}</h1>
        </div>
      </header>

      <section className="pet-register">
        <div className="form-container">
          {error && (
            <div
              style={{
                backgroundColor: "#ffebee",
                color: "#c62828",
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome *</label>
              <input
                id="nome"
                type="text"
                placeholder="Ex: Luna, Thor"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="especie">Espécie *</label>
              <select
                id="especie"
                value={especie}
                onChange={(event) => setEspecie(event.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "10px",
                  border: "none",
                  padding: "0 14px",
                  background: "#f5f7f5",
                  fontSize: "14px",
                }}
              >
                <option value="Cachorro">Cachorro</option>
                <option value="Gato">Gato</option>
                <option value="Pássaro">Pássaro</option>
                <option value="Roedor">Roedor</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="raca">Raça</label>
              <input
                id="raca"
                type="text"
                placeholder="Ex: Golden Retriever, SRD"
                value={raca}
                onChange={(event) => setRaca(event.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sexo">Sexo</label>
              <select
                id="sexo"
                value={sexo}
                onChange={(event) => setSexo(event.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "10px",
                  border: "none",
                  padding: "0 14px",
                  background: "#f5f7f5",
                  fontSize: "14px",
                }}
              >
                <option value="MACHO">Macho</option>
                <option value="FEMEA">Fêmea</option>
                <option value="NAO_INFORMADO">Não informado</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="nascimento">Data de nascimento *</label>
              <input
                id="nascimento"
                type="date"
                max={hoje}
                value={dataNascimento}
                onChange={(event) => setDataNascimento(event.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button type="submit" disabled={loading} style={{ flex: 1 }}>
                {loading
                  ? "Salvando..."
                  : cadastrado
                  ? "✓ Salvo com sucesso!"
                  : editId
                  ? "Atualizar pet"
                  : "Salvar pet"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/meus-pets")}
                style={{
                  background: "#e2e8f0",
                  color: "#475569",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0 20px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <div className={`pet-mascot ${cadastrado ? "jump" : ""}`}>
          <img src={cachorro} alt="Cachorrinho do PetAgenda" />

          <p>
            {cadastrado
              ? editId
                ? "Uhull! As informações do seu pet foram atualizadas! 🐾"
                : "Uhull! Seu novo pet foi cadastrado com sucesso! 🐾"
              : editId
              ? "Atualize os dados para manter os cuidados em dia! 🐾"
              : "Pronto para cuidar do seu pet? 🐾"}
          </p>
        </div>
      </section>
    </>
  );
}

export default CadastroPet;