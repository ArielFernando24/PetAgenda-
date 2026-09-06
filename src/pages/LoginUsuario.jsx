import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  function entrar(event) {
    event.preventDefault();
    navigate("/dashboard");
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <h1>PetAgenda</h1>
        <p>Feito com carinho para quem cuida de quem ama.</p>
      </header>

      <main className="login-main">
        <h2>Bem-vindo de volta!</h2>

        <section className="login-card">
          <h3>Olá, tutor :)</h3>

          <form className="login-form" onSubmit={entrar}>
            <div className="login-campo">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="tutor@petagenda.com"
                required
              />
            </div>

            <div className="login-campo login-senha">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <button className="login-botao" type="submit">
              Entrar
            </button>
          </form>

          <a className="login-link" href="#">
            Esqueci minha senha
          </a>

          {/* Alterado para usar o Link do react-router-dom */}
          <Link className="login-link" to="/cadastro">
            Cadastre-se
          </Link>
        </section>
      </main>
    </div>
  );
}

export default Login;