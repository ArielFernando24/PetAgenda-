import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authApi } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  async function entrar(event) {
    event.preventDefault();
    setError("");
    setAviso("");
    setLoading(true);

    try {
      await login(email, senha);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEsqueciSenha(event) {
    event.preventDefault();
    setError("");
    setAviso("");

    const emailRecuperacao = email || window.prompt("Informe seu e-mail cadastrado:");
    if (!emailRecuperacao) return;

    try {
      await authApi.forgotPassword(emailRecuperacao);
      setAviso("Se o e-mail estiver cadastrado, as instruções para redefinir a senha foram enviadas.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <h1>PetAgenda</h1>
        <p>Feito com carinho para quem cuida de quem ama.</p>
      </header>

      <main className="login-main">
        <h2>Bem-vindo de volta!</h2>

        <section className="login-card" style={{ height: "auto", minHeight: "450px" }}>
          <h3>Olá, tutor :)</h3>

          {error && (
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
              {error}
            </div>
          )}

          {aviso && (
            <div
              style={{
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {aviso}
            </div>
          )}

          <form className="login-form" onSubmit={entrar}>
            <div className="login-campo">
              <label htmlFor="email">E-mail</label>
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

            <div className="login-campo login-senha">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button className="login-botao" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <a className="login-link" href="#" onClick={handleEsqueciSenha}>
            Esqueci minha senha
          </a>

          <Link className="login-link" to="/cadastro">
            Cadastre-se
          </Link>
        </section>
      </main>
    </div>
  );
}

export default Login;