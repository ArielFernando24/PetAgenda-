import { useState } from "react";

function CadastroUsuario() {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensagemSenha, setMensagemSenha] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (senha !== confirmar) {
      setMensagemSenha("As senhas não são correspondentes.");
    } else {
      setMensagemSenha("");
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
                <input id="nome" type="text" placeholder="nome" />
              </div>

              <div className="cadastro-field">
                <label htmlFor="sobrenome">Sobrenome</label>
                <input id="sobrenome" type="text" placeholder="sobrenome" />
              </div>
            </div>

            <div className="cadastro-field cadastro-full">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="tutor@petagenda.com"
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
