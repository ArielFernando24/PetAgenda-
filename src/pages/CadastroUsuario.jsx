import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function CadastroUsuario() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensagemSenha, setMensagemSenha] = useState("");
  const [erroApi, setErroApi] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagemSenha("");
    setErroApi("");

    if (senha !== confirmar) {
      setMensagemSenha("As senhas não são correspondentes.");
      return;
    }

    if (senha.length < 6) {
      setMensagemSenha("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    const nomeCompleto = [nome.trim(), sobrenome.trim()].filter(Boolean).join(" ");

    try {
      await register({
        nome: nomeCompleto,
        email: email.trim(),
        senha,
      });
      navigate("/dashboard");
    } catch (err) {
      setErroApi(err.message || "Erro ao realizar cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cadastro-usuario-page">
      <header className="cadastro-header">
        <h1>PetAgenda</h1>
        <p>Feito com carinho para quem cuida de quem ama.</p>
      </header>

      <main className="cadastro-main">
        <h2>Bem-vindo!</h2>

        <section className="cadastro-card" style={{ height: "auto", minHeight: "520px" }}>
          <h3>Cadastre-se hoje</h3>

          {erroApi && (
            <div
              style={{
                backgroundColor: "#ffebee",
                color: "#c62828",
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {erroApi}
            </div>
          )}

          <form className="cadastro-form" onSubmit={handleSubmit}>
            <div className="cadastro-row">
              <div className="cadastro-field">
                <label htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="cadastro-field">
                <label htmlFor="sobrenome">Sobrenome</label>
                <input
                  id="sobrenome"
                  type="text"
                  placeholder="Sobrenome"
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="cadastro-field cadastro-full">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="tutor@petagenda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="cadastro-row">
              <div className="cadastro-field">
                <label htmlFor="senha">Senha</label>
                <input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="cadastro-field">
                <label htmlFor="confirmar">Confirmar senha</label>
                <input
                  id="confirmar"
                  type="password"
                  placeholder="••••••••"
                  value={confirmar}
                  onChange={(event) => setConfirmar(event.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {mensagemSenha && <p className="cadastro-mensagem-senha">{mensagemSenha}</p>}

            <button
              className={`cadastro-botao ${mensagemSenha ? "cadastro-botao-com-erro" : ""}`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Cadastre-se"}
            </button>
          </form>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Link className="login-link" to="/login">
              Já tenho uma conta. Entrar
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CadastroUsuario;