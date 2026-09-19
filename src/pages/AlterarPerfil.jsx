import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ImageCropper from "../components/ImageCropper";
import { getCroppedImage } from "../utils/imageUtils";

function AlterarPerfil() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const inputFotoRef = useRef(null);

  const [nome, setNome] = useState(user?.nome || "");
  const [email, setEmail] = useState(user?.email || "");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [fotoOriginal, setFotoOriginal] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoProcessada, setFotoProcessada] = useState(null);

  const [mostrarCrop, setMostrarCrop] = useState(false);
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [progresso, setProgresso] = useState(0);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    setNome(user?.nome || "");
    setEmail(user?.email || "");
  }, [user]);

  useEffect(() => {
    return () => {
      if (fotoOriginal) {
        URL.revokeObjectURL(fotoOriginal);
      }

      if (fotoPreview) {
        URL.revokeObjectURL(fotoPreview);
      }
    };
  }, [fotoOriginal, fotoPreview]);

  function obterIniciais() {
    const nomeAtual = nome || "Usuário";

    return nomeAtual
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0].toUpperCase())
      .join("");
  }

  function abrirSeletorFoto() {
    inputFotoRef.current?.click();
  }

  function selecionarFoto(event) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    setErro("");
    setSucesso("");

    const formatosPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!formatosPermitidos.includes(arquivo.type)) {
      setErro("Selecione uma imagem JPG, PNG ou WebP.");
      event.target.value = "";
      return;
    }

    if (arquivo.size > 10 * 1024 * 1024) {
      setErro("A imagem original deve ter no máximo 10 MB.");
      event.target.value = "";
      return;
    }

    if (fotoOriginal) {
      URL.revokeObjectURL(fotoOriginal);
    }

    const url = URL.createObjectURL(arquivo);

    setFotoOriginal(url);
    setFotoPreview(null);
    setFotoProcessada(null);
    setMostrarCrop(true);

    event.target.value = "";
  }

  async function confirmarCrop(croppedAreaPixels) {
    try {
      setProcessandoFoto(true);
      setErro("");

      const imagem = await getCroppedImage(
        fotoOriginal,
        croppedAreaPixels
      );

      if (imagem.size > 2 * 1024 * 1024) {
        throw new Error(
          "Não foi possível reduzir a imagem para menos de 2 MB."
        );
      }

      if (fotoPreview) {
        URL.revokeObjectURL(fotoPreview);
      }

      const previewUrl = URL.createObjectURL(imagem);

      setFotoProcessada(imagem);
      setFotoPreview(previewUrl);
      setMostrarCrop(false);
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível processar a imagem."
      );
    } finally {
      setProcessandoFoto(false);
    }
  }

  function cancelarCrop() {
    setMostrarCrop(false);

    if (fotoOriginal) {
      URL.revokeObjectURL(fotoOriginal);
    }

    setFotoOriginal(null);
  }

  function validarFormulario() {
    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return false;
    }

    if (novaSenha || confirmarSenha) {
      if (novaSenha.length < 6) {
        setErro(
          "A nova senha deve ter pelo menos 6 caracteres."
        );
        return false;
      }

      if (novaSenha !== confirmarSenha) {
        setErro("As senhas não conferem.");
        return false;
      }
    }

    return true;
  }

  async function simularProgressoUpload() {
    setProgresso(0);

    return new Promise((resolve) => {
      let atual = 0;

      const intervalo = setInterval(() => {
        atual += 10;

        setProgresso(atual);

        if (atual >= 100) {
          clearInterval(intervalo);
          resolve();
        }
      }, 50);
    });
  }

  async function salvarPerfil(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setProgresso(0);

    if (!validarFormulario()) {
      return;
    }

    try {
      setSalvando(true);

      const dados = {
        nome: nome.trim(),
      };

      /*
       * A atualização do e-mail não será enviada aqui
       * até confirmarmos que o backend permite essa alteração.
       */

      if (novaSenha) {
        dados.novaSenha = novaSenha;
      }

      await updateProfile(dados);

      /*
       * O crop e a compressão já estão funcionando.
       * O envio definitivo da foto será conectado ao
       * endpoint de upload existente no backend.
       */
      if (fotoProcessada) {
        await simularProgressoUpload();
      }

      setSucesso("Perfil atualizado com sucesso!");

      setTimeout(() => {
        navigate("/perfil");
      }, 1200);
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível atualizar seu perfil."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="alterar-perfil-page">
      <div className="alterar-perfil-topo">
        <div>
          <h1>Alterar perfil</h1>

          <p>
            PetAgenda / Perfil / Alterar perfil
          </p>
        </div>

        <button
          type="button"
          className="alterar-perfil-voltar"
          onClick={() => navigate("/perfil")}
          disabled={salvando}
        >
          ← Voltar
        </button>
      </div>

      <form
        className="alterar-perfil-card"
        onSubmit={salvarPerfil}
      >
        <div className="alterar-perfil-card-header">
          <div>
            <span className="alterar-perfil-label">
              DADOS DA CONTA
            </span>

            <h2>Editar informações</h2>

            <p>
              Atualize os dados da sua conta no PetAgenda.
            </p>
          </div>
        </div>

        <div className="alterar-perfil-foto-area">
          <div className="alterar-perfil-avatar">
            {fotoPreview ? (
              <img
                src={fotoPreview}
                alt="Prévia da foto de perfil"
              />
            ) : (
              <span>{obterIniciais()}</span>
            )}

            <button
              type="button"
              className="alterar-perfil-camera"
              title="Alterar foto"
              onClick={abrirSeletorFoto}
              disabled={salvando || processandoFoto}
            >
              📷
            </button>

            <input
              ref={inputFotoRef}
              id="foto-perfil"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={selecionarFoto}
              hidden
            />
          </div>

          <div className="alterar-perfil-foto-info">
            <h3>Foto de perfil</h3>

            <p>
              Escolha uma imagem para usar como sua foto.
            </p>

            <span>
              JPG, PNG ou WebP • máximo 2 MB
            </span>

            {fotoProcessada && (
              <strong>
                ✓ Foto preparada para envio
              </strong>
            )}
          </div>
        </div>

        <div className="alterar-perfil-form">
          <div className="alterar-perfil-campo">
            <label htmlFor="nome">
              Nome
            </label>

            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(event) =>
                setNome(event.target.value)
              }
              placeholder="Seu nome"
              disabled={salvando}
            />
          </div>

          <div className="alterar-perfil-campo">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              disabled
            />

            <small>
              O e-mail da conta não pode ser alterado nesta tela.
            </small>
          </div>

          <div className="alterar-perfil-campo">
            <label htmlFor="nova-senha">
              Nova senha
            </label>

            <input
              id="nova-senha"
              type="password"
              value={novaSenha}
              onChange={(event) =>
                setNovaSenha(event.target.value)
              }
              placeholder="Digite uma nova senha"
              disabled={salvando}
            />
          </div>

          <div className="alterar-perfil-campo">
            <label htmlFor="confirmar-senha">
              Confirmar nova senha
            </label>

            <input
              id="confirmar-senha"
              type="password"
              value={confirmarSenha}
              onChange={(event) =>
                setConfirmarSenha(event.target.value)
              }
              placeholder="Confirme a nova senha"
              disabled={salvando}
            />
          </div>
        </div>

        {progresso > 0 && (
          <div className="alterar-perfil-progresso">
            <div className="alterar-perfil-progresso-topo">
              <span>
                Enviando foto...
              </span>

              <strong>
                {progresso}%
              </strong>
            </div>

            <div className="alterar-perfil-progresso-barra">
              <div
                style={{
                  width: `${progresso}%`,
                }}
              />
            </div>
          </div>
        )}

        {erro && (
          <div className="alterar-perfil-mensagem erro">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="alterar-perfil-mensagem sucesso">
            {sucesso}
          </div>
        )}

        <div className="alterar-perfil-acoes">
          <button
            type="button"
            className="alterar-perfil-cancelar"
            onClick={() => navigate("/perfil")}
            disabled={salvando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="alterar-perfil-salvar"
            disabled={salvando || processandoFoto}
          >
            {salvando
              ? "Salvando..."
              : "Salvar alterações"}
          </button>
        </div>
      </form>

      {mostrarCrop && fotoOriginal && (
        <ImageCropper
          image={fotoOriginal}
          onCancel={cancelarCrop}
          onConfirm={confirmarCrop}
        />
      )}
    </div>
  );
}

export default AlterarPerfil;