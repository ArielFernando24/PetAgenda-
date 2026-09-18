import { api, message, sessionKey } from './api.js';
const registerPanel = document.getElementById('registerPanel');
const loginPanel = document.getElementById('loginPanel');
function showLogin(login) {
  registerPanel.hidden = login;
  loginPanel.hidden = !login;
  message('');
  document.getElementById(login ? 'loginEmail' : 'nome').focus();
}
document.getElementById('showLogin').onclick = () => showLogin(true);
document.getElementById('showRegister').onclick = () => showLogin(false);
if (new URLSearchParams(location.search).has('login')) showLogin(true);
async function login(email, senha) {
  const result = await api('/api/auth/login', { method: 'POST', body: { email, senha }, authenticated: false });
  sessionStorage.setItem(sessionKey, result.token);
  location.assign('/pets.html');
}
async function submit(form, operation) {
  const button = form.querySelector('button[type=submit]');
  button.disabled = true;
  message('Aguarde…');
  try { await operation(new FormData(form)); }
  catch (error) { message(error.message, true); }
  finally { button.disabled = false; }
}
document.getElementById('registerForm').addEventListener('submit', event => {
  event.preventDefault();
  void submit(event.currentTarget, async fields => {
    if (fields.get('senha') !== fields.get('confirmar')) throw new Error('As senhas não conferem.');
    const nome = [fields.get('nome').trim(), fields.get('sobrenome').trim()].filter(Boolean).join(' ');
    const email = fields.get('email').trim();
    const senha = fields.get('senha');
    await api('/api/tutores', { method: 'POST', authenticated: false, body: { nome, email, senha } });
    await login(email, senha);
  });
});
document.getElementById('loginForm').addEventListener('submit', event => {
  event.preventDefault();
  void submit(event.currentTarget, fields => login(fields.get('email').trim(), fields.get('senha')));
});
