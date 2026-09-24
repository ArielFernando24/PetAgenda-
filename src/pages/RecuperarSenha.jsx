import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

function RecuperarSenha() {
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState(1);

  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  async function enviarEmail(event) {
    event.preventDefault();

    setErro("");
    setAviso("");
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setEtapa(2);
    } catch (err) {
      setErro(err.message || "Não foi possível enviar o código.");
    } finally {
      setLoading(false);
    }
  }

  async function verificarCodigo(event) {
    event.preventDefault();

    setErro("");
    setAviso("");
    setLoading(true);

    try {
      setEtapa(3);
    } catch (err) {
      setErro(err.message || "Código inválido.");
    } finally {
      setLoading(false);
    }
  }

  async function redefinirSenha(event) {
    event.preventDefault();

    setErro("");
    setAviso("");

    if (novaSenha.length < 8) {
      setErro("A senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    if (!/[A-Z]/.test(novaSenha)) {
      setErro("A senha deve possuir pelo menos uma letra maiúscula.");
      return;
    }

    if (!/[0-9]/.test(novaSenha)) {
      setErro("A senha deve possuir pelo menos um número.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      setAviso("Senha alterada com sucesso!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setErro(err.message || "Não foi possível alterar a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="recuperar-page">
      <header className="recuperar-header">
        <h1>PetAgenda</h1>
        <p>Feito com carinho para quem cuida de quem ama.</p>
      </header>

      <main className="recuperar-main">
        <section className="recuperar-card">

          {etapa === 1 && (
            <>
              <h2>Recuperar senha</h2>

              <p className="recuperar-descricao">
                Informe o e-mail cadastrado na sua conta.
              </p>

              <form
                className="recuperar-form"
                onSubmit={enviarEmail}
              >
                <div className="recuperar-campo">
                  <label htmlFor="email">E-mail</label>

                  <input
                    id="email"
                    type="email"
                    placeholder="tutor@petagenda.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  className="recuperar-botao"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Continuar"}
                </button>
              </form>
            </>
          )}

          {etapa === 2 && (
            <>
              <h2>Digite o código</h2>
              <form
                className="recuperar-form"
                onSubmit={verificarCodigo}
              >
                <div className="recuperar-campo">
                  <p className="recuperar-descricao">
                    Informe o código enviado ao seu e-mail.
                  </p>

                  <input
                    id="codigo"
                    type="text"
                    placeholder="Digite o código"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  className="recuperar-botao"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Verificando..." : "Continuar"}
                </button>
              </form>
            </>
          )}

          {etapa === 3 && (
            <>
              <h2>Nova senha</h2>

              <p className="recuperar-descricao">
                Escolha uma nova senha para sua conta.
              </p>

              <form
                className="recuperar-form"
                onSubmit={redefinirSenha}
              >
                <div className="recuperar-campo">
                  <label htmlFor="novaSenha">
                    Nova senha
                  </label>

                  <input
                    id="novaSenha"
                    type="password"
                    placeholder="••••••••"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="recuperar-campo">
                  <label htmlFor="confirmarSenha">
                    Confirmar nova senha
                  </label>

                  <input
                    id="confirmarSenha"
                    type="password"
                    placeholder="••••••••"
                    value={confirmarSenha}
                    onChange={(e) =>
                      setConfirmarSenha(e.target.value)
                    }
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  className="recuperar-botao"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Alterando..." : "Alterar senha"}
                </button>
              </form>
            </>
          )}

          {erro && (
            <p className="recuperar-mensagem recuperar-erro">
              {erro}
            </p>
          )}

          {aviso && (
            <p className="recuperar-mensagem recuperar-sucesso">
              {aviso}
            </p>
          )}

        </section>
      </main>
    </div>
  );
}

export default RecuperarSenha;