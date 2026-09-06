import { useState } from "react";
import cachorro from "../assets/cachorro-petagenda.png";

function CadastroPet() {
  const [nome, setNome] = useState("Luna");
  const [especie, setEspecie] = useState("Cachorro");
  const [raca, setRaca] = useState("Golden Retriever");
  const [nascimento, setNascimento] = useState("2021-05-03");
  const [cadastrado, setCadastrado] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (!nome || !especie || !raca || !nascimento) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const pet = {
      nome,
      especie,
      raca,
      nascimento,
    };

    console.log("Pet cadastrado:", pet);

    setCadastrado(true);

    setTimeout(() => {
      setCadastrado(false);
    }, 1200);
  }

  return (
    <>
      <header className="header">
        <div>
          <p className="breadcrumb">Pets / Novo pet</p>
          <h1>Novo pet</h1>
        </div>
      </header>

      <section className="pet-register">
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="especie">Espécie</label>
              <input
                id="especie"
                type="text"
                value={especie}
                onChange={(event) => setEspecie(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="raca">Raça</label>
              <input
                id="raca"
                type="text"
                value={raca}
                onChange={(event) => setRaca(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nascimento">Data de nascimento</label>
              <input
                id="nascimento"
                type="date"
                value={nascimento}
                onChange={(event) => setNascimento(event.target.value)}
              />
            </div>

            <button type="submit">
              {cadastrado ? "✓ Pet cadastrado!" : "Salvar pet"}
            </button>
          </form>
        </div>

        <div className={`pet-mascot ${cadastrado ? "jump" : ""}`}>
          <img src={cachorro} alt="Cachorrinho do PetAgenda" />

          <p>
            {cadastrado
              ? "Uhull! Seu pet foi cadastrado com sucesso! 🐾"
              : "Pronto para cuidar do seu pet? 🐾"}
          </p>
        </div>
      </section>
    </>
  );
}

export default CadastroPet;