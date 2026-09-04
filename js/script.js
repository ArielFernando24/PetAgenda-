const petForm = document.getElementById("petForm");

petForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const especie = document.getElementById("especie").value.trim();
    const raca = document.getElementById("raca").value.trim();
    const nascimento = document.getElementById("nascimento").value.trim();

    if (!nome || !especie || !raca || !nascimento) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const pet = {
        nome: nome,
        especie: especie,
        raca: raca,
        nascimento: nascimento
    };

    console.log("Pet cadastrado:", pet);

    alert(`Pet ${nome} salvo com sucesso!`);
});