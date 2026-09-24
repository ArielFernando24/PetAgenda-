import SidebarADM from "../../components/ADM/SidebarADM";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function NovoUsuarioADM() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  function enviar(event) {
    event.preventDefault();

    if (senha !== confirmarSenha) {
      alert("Usuário cadastrado com sucesso");
      return;
    }

    alert("As senhas são iguais!");
  }

  return (
    <div className="admin-layout">
      <SidebarADM />
    <main className="novo-usuario-page">
      <header className="novo-usuario-topo">
        <h1>Novo usuário</h1>
        <p>PetAgenda / Admin / Usuários / Novo</p>
      </header>

      <section className="novo-usuario-card">
        <h2>Dados do usuário</h2>

        <form className="novo-usuario-form" onSubmit={enviar}>
          <div className="linha-campos">
            <div className="campo">
              <label htmlFor="nome">Nome</label>
              <input id="nome" name="nome" type="text" required/>
            </div>

            <div className="campo">
              <label htmlFor="sobrenome">Sobrenome</label>
              <input id="sobrenome" name="sobrenome" type="text" required/>
            </div>
          </div>

          <div className="campo campo-email">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" required/>
          </div>

          <div className="linha-campos">
            <div className="campo">
              <label htmlFor="senha">Senha</label>
              <input id="senha" name="senha" type="password" required
              value={senha} onChange={(event) => setSenha(event.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="confirmar-senha">Confirmar senha</label>
              <input id="confirmar-senha" name="confirmar-senha" type="password" required
              value={confirmarSenha} onChange={(event) => setConfirmarSenha(event.target.value)}
              />
            </div>
          </div>

          <div className="novo-usuario-acoes">
            <button className="cancelar" type="button" onClick={() => navigate("/admin/usuarios")}>
              cancelar
            </button>

            <button className="salvar" type="submit">
              salvar
            </button>
          </div>
        </form>
      </section>
    </main>
    </div>
  );
}

export default NovoUsuarioADM;
