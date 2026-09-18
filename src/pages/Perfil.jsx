import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Perfil() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();

  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(user?.nome || "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const [error, setError] = useState("");

  async function handleSalvarPerfil(e) {
    e.preventDefault();
    setSucesso("");
    setError("");
    setLoading(true);

    try {
      const payload = {
        nome: nome.trim(),
      };
      if (novaSenha) {
        if (novaSenha.length < 6) {
          throw new Error("A nova senha deve ter no mínimo 6 caracteres.");
        }
        payload.senhaAtual = senhaAtual;
        payload.novaSenha = novaSenha;
      }

      await updateProfile(payload);
      setSucesso("Perfil atualizado com sucesso!");
      setEditando(false);
      setSenhaAtual("");
      setNovaSenha("");
    } catch (err) {
      setError(err.message || "Erro ao atualizar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <main className="perfil-page">
      <header className="perfil-topo">
        <div className="perfil-titulo">
          <h1>Perfil</h1>
          <p>PetAgenda / Perfil</p>
        </div>
      </header>

      {sucesso && (
        <div
          style={{
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "16px",
            fontWeight: "500",
          }}
        >
          {sucesso}
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "16px",
            fontWeight: "500",
          }}
        >
          {error}
        </div>
      )}

      <section className="perfil-cartao perfil-cartao-tutor" style={{ height: "auto", minHeight: "120px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2>{user?.nome || "Tutor"}</h2>
            <p>{user?.email || "tutor@email.com"}</p>
            {user?.data_criacao && (
              <span style={{ fontSize: "12px", color: "#666" }}>
                Cadastrado em: {new Date(user.data_criacao).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setEditando((v) => !v)}
            style={{
              background: editando ? "#e2e8f0" : "#38598b",
              color: editando ? "#334155" : "#fff",
              border: "none",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {editando ? "Cancelar" : "Editar perfil"}
          </button>
        </div>

        {editando && (
          <form onSubmit={handleSalvarPerfil} style={{ marginTop: "20px" }}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
                Nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
                Senha atual (necessária para alterar a senha)
              </label>
              <input
                type="password"
                placeholder="Sua senha atual"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
                Nova senha (mínimo 6 caracteres)
              </label>
              <input
                type="password"
                placeholder="Deixe em branco se não quiser alterar"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#22c55e",
                color: "#fff",
                border: "none",
                padding: "8px 18px",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        )}
      </section>

      <section className="perfil-cartao perfil-cartao-plano">
        <h2>Plano atual</h2>
        <p>Gratuito • até 2 pets • lembretes básicos</p>
      </section>

      <section className="perfil-premium">
        <h2>PetAgenda Premium</h2>
        <p>Pets ilimitados, histórico vitalício, exportação do cartão de vacinas e alertas.</p>
        <button className="perfil-premium-botao" onClick={() => navigate("/premium")}>
          Conhecer Premium • R$ 9,90/mês
        </button>
      </section>

      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            border: "none",
            padding: "10px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          🚪 Sair da conta (Logout)
        </button>
      </div>

      <footer className="perfil-footer">
        <div className="perfil-linha"></div>

        <div className="perfil-rodape-conteudo">
          <p>Feito com carinho para quem cuida de quem ama.</p>
          <span className="perfil-marca"></span>
        </div>
      </footer>
    </main>
  );
}

export default Perfil;
