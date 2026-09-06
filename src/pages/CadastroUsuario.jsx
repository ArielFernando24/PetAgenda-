import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CadastroUsuario() {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensagemSenha, setMensagemSenha] = useState("");
  
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    if (senha !== confirmar) {
      setMensagemSenha("As senhas não são correspondentes.");
    } else {
      setMensagemSenha("");
      // Se as senhas baterem, redireciona direto para o dashboard!
      navigate("/dashboard");
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

        <section className="cadastro-card">
          <h3>Cadastre-se hoje</h3>

          <form className="cadastro-form" onSubmit={handleSubmit}>
            <div className="cadastro-row">
              <div className="cadastro-field">
                <label htmlFor="nome">Nome</label>
                <input id="nome" type="text" placeholder="nome" required />
              </div>

              <div className="cadastro-field">
                <label htmlFor="sobrenome">Sobrenome</label>
                <input id="sobrenome" type="text" placeholder="sobrenome" required />
              </div>
            </div>

            <div className="cadastro-field cadastro-full">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="tutor@petagenda.com"
                required
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
                />
              </div>
            </div>

            <p className="cadastro-mensagem-senha">{mensagemSenha}</p>

            <button
              className={`cadastro-botao ${
                mensagemSenha ? "cadastro-botao-com-erro" : ""
              }`}
              type="submit"
            >
              Cadastre-se
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default CadastroUsuario;