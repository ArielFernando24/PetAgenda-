import { api, message, sessionKey } from './api.js';
const form = document.getElementById('petForm');
const list = document.getElementById('petList');
const empty = document.getElementById('empty');
let editingId = null;
let busy = false;
let currentPets = [];
if (!sessionStorage.getItem(sessionKey)) location.replace('/?login=1');
document.getElementById('logout').onclick = () => {
  sessionStorage.removeItem(sessionKey);
  location.assign('/?login=1');
};
const today = new Date();
document.getElementById('nascimento').max = [today.getFullYear(), String(today.getMonth()+1).padStart(2,'0'), String(today.getDate()).padStart(2,'0')].join('-');
function resetForm() {
  editingId = null;
  form.reset();
  document.getElementById('formHeading').textContent = 'Cadastrar pet';
  document.getElementById('cancelEdit').hidden = true;
  document.getElementById('savePet').textContent = 'Salvar pet';
}
document.getElementById('cancelEdit').onclick = resetForm;
function renderPets() {
  list.replaceChildren();
  empty.hidden = currentPets.length > 0;
  empty.textContent = 'Você ainda não cadastrou pets. Use o formulário abaixo para começar.';
  for (const pet of currentPets) {
    const card = document.createElement('article');
    card.className = 'pet-card';
    const title = document.createElement('h4');
    title.textContent = pet.nome;
    const details = document.createElement('p');
    details.textContent = pet.especie + ' · ' + (pet.raca || 'Raça não informada') + ' · ' + pet.dataNascimento.split('-').reverse().join('/');
    card.append(title, details);
    for (const [action, label] of [['edit', 'Editar'], ['delete', 'Excluir']]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.dataset.action = action;
      button.dataset.id = pet.id;
      button.setAttribute('aria-label', label + ' ' + pet.nome);
      card.append(button);
    }
    list.append(card);
  }
}
async function loadPets() { currentPets = await api('/api/pets'); renderPets(); }
function setBusy(value) {
  busy = value;
  for (const element of document.querySelectorAll('#petForm button, #petList button')) element.disabled = value;
}
list.addEventListener('click', event => {
  const button = event.target.closest('button[data-id]');
  if (!button || busy) return;
  const pet = currentPets.find(item => item.id === button.dataset.id);
  if (!pet) return;
  if (button.dataset.action === 'edit') {
    editingId = pet.id;
    for (const key of ['nome','especie','raca','sexo','dataNascimento']) form.elements.namedItem(key).value = pet[key] ?? '';
    document.getElementById('formHeading').textContent = 'Editar ' + pet.nome;
    document.getElementById('savePet').textContent = 'Salvar alterações';
    document.getElementById('cancelEdit').hidden = false;
    form.elements.namedItem('nome').focus();
    return;
  }
  if (!window.confirm('Excluir ' + pet.nome + '? Esta ação não pode ser desfeita.')) return;
  void (async () => {
    setBusy(true);
    try {
      await api('/api/pets/' + pet.id, { method: 'DELETE' });
      if (editingId === pet.id) resetForm();
      await loadPets();
      message('Pet excluído.');
    } catch (error) { message(error.message, true); }
    finally { setBusy(false); }
  })();
});
form.addEventListener('submit', event => {
  event.preventDefault();
  if (busy) return;
  void (async () => {
    setBusy(true);
    const fields = new FormData(form);
    const body = Object.fromEntries(fields);
    body.raca = body.raca.trim() || null;
    try {
      await api('/api/pets' + (editingId ? '/' + editingId : ''), { method: editingId ? 'PUT' : 'POST', body });
      resetForm();
      await loadPets();
      message('Pet salvo com sucesso.');
    } catch (error) { message(error.message, true); }
    finally { setBusy(false); }
  })();
});
void (async () => {
  if (!sessionStorage.getItem(sessionKey)) return;
  try {
    const tutor = await api('/api/tutores/me');
    document.getElementById('tutorName').textContent = tutor.nome;
    await loadPets();
  } catch (error) { empty.textContent = 'Não foi possível carregar seus pets.'; message(error.message, true); }
})();
