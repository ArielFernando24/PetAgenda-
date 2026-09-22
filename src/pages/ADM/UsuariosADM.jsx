import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SidebarADM from "../../components/ADM/SidebarADM";

function Usuarios() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: "Ana Souza", email: "ana.souza@email.com", pets: 2, status: "Ativo" },
    { id: 2, nome: "Bruno Lima", email: "bruno.lima@email.com", pets: 1, status: "Ativo" },
    { id: 3, nome: "Carla Mendes", email: "carla.mendes@email.com", pets: 3, status: "Ativo" },
    { id: 4, nome: "Diego Alves", email: "diego.alves@email.com", pets: 0, status: "Pendente" },
  ]);

  function removerUsuario(id) {
    setUsuarios((usuariosAtuais) =>
      usuariosAtuais.filter((usuario) => usuario.id !== id)
    );
  }

  return (
    <div className="admin-layout">
      <SidebarADM />

      <main className="usuarios-page">
      <header className="usuarios-topo">
        <div>
          <h1>Usuários</h1>
          <p>PetAgenda / Admin / Usuários</p>
        </div>
      </header>

      <section className="usuarios-visao-geral">
        <h2>Visão geral da base cadastrada</h2>
        <p>Total: 128 usuários ativos</p>

        <div className="usuarios-tabela-container">
          <table className="usuarios-tabela">
            <thead>
              <tr>
                <th>USUÁRIO</th>
                <th>E-MAIL</th>
                <th>PETS</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.pets}</td>
                  <td className="celula-com-remover">
                    {usuario.status}
                    <button
                      type="button"
                      className="botao-remover-linha"
                      onClick={() => removerUsuario(usuario.id)}
                      aria-label={`Remover ${usuario.nome}`}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="usuarios-acoes">
          <button type="button" onClick={() => navigate("/admin/NovoUsuarioADM")}>+ Novo usuário</button>
          <button type="button" onClick={() => navigate("/admin/NovoPetADM")}>+ Novo Pet</button>
          <button type="button">Exportar Usuários</button>
            
          
        </div>
      </section>
    </main>

    </div>
    

  );
}

export default Usuarios;
