import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { petsApi, clinicasApi, agendaApi } from "../services/api";

function NovoServico() {
  const navigate = useNavigate();

  const [pets, setPets] = useState([]);
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState("");

  const hojeStr = new Date().toISOString().split("T")[0];

  const [tipoCuidado, setTipoCuidado] = useState("Vacina");
  const [petId, setPetId] = useState("");
  const [clinicaId, setClinicaId] = useState("");
  const [data, setData] = useState(hojeStr);
  const [hora, setHora] = useState("14:00");
  const [recorrencia, setRecorrencia] = useState("Nenhuma");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const [petsData, clinicasData] = await Promise.all([
          petsApi.list(),
          clinicasApi.list(),
        ]);
        const listaPets = Array.isArray(petsData) ? petsData : [];
        setPets(listaPets);
        if (listaPets.length > 0) {
          setPetId(listaPets[0].id);
        }

        const listaClinicas = Array.isArray(clinicasData) ? clinicasData : [];
        setClinicas(listaClinicas);
      } catch (err) {
        setError(err.message || "Erro ao carregar dados iniciais.");
      } finally {
        setLoading(false);
      }
    }
    carregarDadosIniciais();
  }, []);

  async function handleSalvarCuidado(e) {
    if (e) e.preventDefault();
    setError("");

    if (!petId) {
      setError("Você precisa cadastrar um pet antes de agendar um serviço.");
      return;
    }

    if (!data || !hora) {
      setError("Informe a data e a hora do cuidado.");
      return;
    }

    setSalvando(true);

    try {
      const dataHoraIso = new Date(`${data}T${hora}:00`).toISOString();

      await agendaApi.create({
        pet_id: petId,
        clinica_id: clinicaId || null,
        tipo_cuidado: tipoCuidado,
        data_hora: dataHoraIso,
        recorrencia: recorrencia,
        descricao: descricao.trim() || null,
      });

      navigate("/agenda");
    } catch (err) {
      setError(err.message || "Erro ao agendar o cuidado.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="novo-servico-page">
      <header className="novo-servico-topo">
        <div>
          <h1>Novo serviço</h1>
          <p>PetAgenda / Novo cuidado</p>
        </div>
      </header>

      <section className="novo-servico-conteudo">
        <form className="novo-servico-formulario" onSubmit={handleSalvarCuidado}>
          <h2>Cadastrar cuidado</h2>

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

          <label htmlFor="tipoCuidado">Tipo de cuidado *</label>
          <select
            id="tipoCuidado"
            value={tipoCuidado}
            onChange={(e) => setTipoCuidado(e.target.value)}
          >
            <option value="Vacina">Vacina</option>
            <option value="Banho & Tosa">Banho & Tosa</option>
            <option value="Consulta">Consulta</option>
            <option value="Vermífugo">Vermífugo</option>
            <option value="Remédio">Medicamento / Remédio</option>
          </select>

          <label htmlFor="petSelect">Pet *</label>
          {loading ? (
            <p>Carregando pets...</p>
          ) : pets.length === 0 ? (
            <div style={{ marginBottom: "12px" }}>
              <p style={{ color: "#d9534f", fontSize: "13px" }}>
                Nenhum pet encontrado.
              </p>
              <button
                type="button"
                onClick={() => navigate("/cadastro-pet")}
                style={{
                  marginTop: "6px",
                  padding: "6px 12px",
                  background: "#38598b",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "352px"  
                }}
              >
                Cadastrar um pet agora
              </button>
            </div>
          ) : (
            <select
              id="petSelect"
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              required
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.especie})
                </option>
              ))}
            </select>
          )}

          <label htmlFor="dataCuidado">Data *</label>
          <input
            id="dataCuidado"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />

          <label htmlFor="horaCuidado">Hora *</label>
          <input
            id="horaCuidado"
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
          />

          <label htmlFor="recorrencia">Recorrência</label>
          <select
            id="recorrencia"
            value={recorrencia}
            onChange={(e) => setRecorrencia(e.target.value)}
          >
            <option value="Nenhuma">Nenhuma (Única vez)</option>
            <option value="Semanal">Semanal</option>
            <option value="Mensal">Mensal</option>
            <option value="Anual">Anual</option>
          </select>

          <label htmlFor="clinicaSelect">Clínica / Estabelecimento (Opcional)</label>
          <select
            id="clinicaSelect"
            value={clinicaId}
            onChange={(e) => setClinicaId(e.target.value)}
          >
            <option value="">Nenhum estabelecimento selecionado</option>
            {clinicas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} - {c.cidade}/{c.estado}
              </option>
            ))}
          </select>

          <label htmlFor="descricao">Descrição ou Observações</label>
          <input
            id="descricao"
            type="text"
            placeholder="Ex: Reforço anual, tosa higiênica, etc."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <div className="novo-servico-acoes">
            <button
              className="novo-servico-salvar"
              type="submit"
              disabled={salvando || pets.length === 0}
            >
              {salvando ? "Salvando..." : "Salvar cuidado"}
            </button>

            <button
              className="novo-servico-cancelar"
              type="button"
              onClick={() => navigate("/agenda")}
            >
              Cancelar
            </button>
          </div>
        </form>

        <aside className="novo-servico-estabelecimentos">
          <h3>Estabelecimentos recomendados</h3>

          {clinicas.length === 0 ? (
            <p style={{ color: "#666", padding: "10px" }}>
              Nenhum estabelecimento parceiro cadastrado no momento.
            </p>
          ) : (
            clinicas.slice(0, 3).map((clinica) => (
              <article
                className="estabelecimento-card"
                key={clinica.id}
                style={{
                  border: clinicaId === clinica.id ? "2px solid #38598b" : "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
                onClick={() => setClinicaId(clinica.id)}
              >
                <strong>{clinica.nome}</strong>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0" }}>
                  📍 {clinica.endereco} - {clinica.cidade}/{clinica.estado}
                </p>
                <p style={{ fontSize: "12px", color: "#64748b" }}>
                  📞 {clinica.telefone}
                </p>

                <div className="estabelecimento-info">
                  <span>{clinica.servicos?.join(", ") || "Clínica Geral"}</span>
                </div>

                <button
                  type="button"
                  style={{
                    marginTop: "8px",
                    width: "100%",
                    padding: "6px",
                    background: clinicaId === clinica.id ? "#38598b" : "#f1f5f9",
                    color: clinicaId === clinica.id ? "#fff" : "#334155",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {clinicaId === clinica.id ? "✓ Selecionado" : "Selecionar estabelecimento"}
                </button>
              </article>
            ))
          )}
        </aside>
      </section>

      <footer className="novo-servico-footer">
        <div className="novo-servico-linha"></div>

        <div className="novo-servico-rodape-conteudo">
          <p>Feito com carinho para quem cuida de quem ama.</p>
          <span>🐾</span>
        </div>
      </footer>
    </main>
  );
}

export default NovoServico;