import SidebarADM from "../../components/ADM/SidebarADM";
import { useNavigate } from "react-router-dom";

function NovoPetADM() {
  const navigate = useNavigate();

  function salvarPet(event) {
    event.preventDefault();

    alert("Pet registrado com sucesso!");
  }

  return (
    <div className="admin-layout">
      <SidebarADM />

      <main className="novo-pet-page">
        <header className="cabecalho">
          <h1>Novo pet</h1>
          <p>PetAgenda / Admin / Usuários / Novo pet</p>
        </header>

        <section className="pet-card">
          <h2>Dados do pet</h2>

          <form className="pet-form" onSubmit={salvarPet}>
            <div className="linha-campos">
            <div className="campo">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="tutor">Tutor</label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
              />
            </div>
            </div>            

            <div className="linha-campos">
              <div className="campo">
                <label htmlFor="especie">Espécie</label>
                <input
                  id="especie"
                  name="especie"
                  type="text"
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="raca">Raça</label>
                <input
                  id="raca"
                  name="raca"
                  type="text"
                  required
                />
              </div>
            </div>

            <div className="linha-campos">
              <div className="campo">
                <label htmlFor="sexo">Sexo</label>
                <select className="novo-pet-adm-sexo" id="sexo" name="sexo" defaultValue="" required>
                  <option value="" disabled>Selecione</option>
                  <option value="Macho">Macho</option>
                  <option value="Fêmea">Fêmea</option>
                  <option value="Não informado">Não informado</option>
                  </select>
              </div>

              <div className="campo">
                <label htmlFor="nascimento">
                  Data de nascimento
                </label>
                <input
                  id="nascimento"
                  name="nascimento"
                  type="date"
                  required
                />
              </div>
            </div>

            <div className="acoes">
              <button
                className="btn-cancelar"
                type="button"
                onClick={() => navigate("/admin/usuarios")}
              >
                cancelar
              </button>

              <button
                className="btn-salvar"
                type="submit"
              >
                salvar
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default NovoPetADM;
