import { useState } from "react";

function App() {
  const [nome, setNome] = useState("Luna");
  const [especie, setEspecie] = useState("Cachorro");
  const [raca, setRaca] = useState("Golden Retriever");
  const [nascimento, setNascimento] = useState("2021-05-03");

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

    alert(`Pet ${nome} salvo com sucesso!`);
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">PetAgenda</div>

        <nav className="menu">
          <a href="#">Início</a>
          <a href="#" className="active">
            Pets
          </a>
          <a href="#">Vacinas</a>
          <a href="#">Medicamentos</a>
          <a href="#">Banhos</a>
          <a href="#">Consultas</a>
        </nav>

        <div className="user">👤 Usuário</div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <p className="breadcrumb">Pets / Novo pet</p>
            <h1>Novo pet</h1>
          </div>
        </header>

        <section className="form-container">
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

            <button type="submit">Salvar pet</button>
          </form>
        </section>

        <footer className="footer">
          <span>Cuide de quem cuida de você</span>
          <span>🐾</span>
        </footer>
      </main>
    </div>
  );
}

export default App;