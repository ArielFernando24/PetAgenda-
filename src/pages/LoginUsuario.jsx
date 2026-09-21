import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authApi } from "../services/api";

const ADMIN_EMAIL = "admin@petagenda.com";
const ADMIN_SENHA = "admin123";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [modoAdmin, setModoAdmin] = useState(false);

  async function entrar(event) {
    event.preventDefault();

    setError("");
    setAviso("");
    setLoading(true);

    try {
      // ==========================================
      // LOGIN ADMINISTRATIVO - SOMENTE FRONTEND
      // ==========================================
      if (modoAdmin) {
        if (email !== ADMIN_EMAIL || senha !== ADMIN_SENHA) {
          throw new Error("E-mail ou senha de administrador inválidos.");
        }

        // Marca o acesso administrativo no navegador.
        sessionStorage.setItem("petagenda_admin", "true");

        navigate("/admin");
        return;
      }

      // ==========================================
      // LOGIN NORMAL - BACKEND
      // ==========================================
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

    const emailRecuperacao =
      email || window.prompt("Informe seu e-mail cadastrado:");

    if (!emailRecuperacao) return;

    try {
      await authApi.forgotPassword(emailRecuperacao);

      setAviso(
        "Se o e-mail estiver cadastrado, as instruções para redefinir a senha foram enviadas."
      );
    } catch (err) {
      setError(err.message);
    }
  }

  function alternarModoAdmin() {
    setModoAdmin((atual) => !atual);

    setEmail("");
    setSenha("");
    setError("");
    setAviso("");
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <h1>PetAgenda</h1>
        <p>Feito com carinho para quem cuida de quem ama.</p>
      </header>

      <main className="login-main">
        <h2>
          {modoAdmin ? "Acesso administrativo" : "Bem-vindo de volta!"}
        </h2>

        <section
          className="login-card"
          style={{
            height: "auto",
            minHeight: "450px",
          }}
        >
          <h3>
            {modoAdmin
              ? "Olá, administrador :)"
              : "Olá, tutor :)"}
          </h3>

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
                placeholder={
                  modoAdmin
                    ? "admin@petagenda.com"
                    : "tutor@petagenda.com"
                }
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

            <button
              className="login-botao"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Entrando..."
                : modoAdmin
                  ? "Entrar como administrador"
                  : "Entrar"}
            </button>
          </form>

          {!modoAdmin && (
            <>
              <Link className="login-link" to="/recuperarSenha">
                Esqueci minha senha
              </Link>

              <Link className="login-link" to="/cadastro">
                Cadastre-se
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={alternarModoAdmin}
            disabled={loading}
            style={{
              marginTop: "20px",
              background: "none",
              border: "none",
              color: "#38598b",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              textDecoration: "underline",
              width: "100%",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {modoAdmin
              ? "← Voltar para acesso do tutor"
              : "Acesso administrativo"}
          </button>
        </section>
      </main>
    </div>
  );
}

export default Login;