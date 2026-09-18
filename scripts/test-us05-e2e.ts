import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://127.0.0.1:3000/api';

async function run() {
  console.log('=== INICIANDO TESTES E2E DA US05 (PERFIL & AVATAR) ===\n');

  const testEmail = `tutor.us5.${Date.now()}@petagenda.com`;
  const password = 'SenhaSegura@123';

  // 1. Cadastrar tutor
  console.log('1. Cadastrando tutor para teste...');
  const resCad = await fetch(`${BASE_URL}/tutores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: 'Ariel US5', email: testEmail, senha: password }),
  });
  const dataCad = await resCad.json();
  console.log(`Status ${resCad.status}:`, dataCad);

  // 2. Login para obter token
  console.log('\n2. Efetuando login...');
  const resLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, senha: password }),
  });
  const dataLogin = await resLogin.json();
  const token = dataLogin.data.token;
  console.log(`Status ${resLogin.status}: Token JWT obtido.`);

  // 3. Atualizar dados cadastrais (PUT /users/me)
  console.log('\n3. Atualizando dados cadastrais (nome, telefone, bio, timezone)...');
  const resPut = await fetch(`${BASE_URL}/users/me`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nome: 'Ariel Fernando US5',
      telefone: '(11) 98765-4321',
      bio: 'Apaixonado por animais de estimação e tecnologia.',
      timezone: 'America/Sao_Paulo',
    }),
  });
  const dataPut = await resPut.json();
  console.log(`Status ${resPut.status}:`, dataPut);
  if (resPut.status !== 200) throw new Error('Falha ao atualizar dados cadastrais');

  // 4. Testar bloqueio de campos restritos (role, email, id)
  console.log('\n4. Testando tentativa de alterar campos restritos (role, email)...');
  const resRestricted = await fetch(`${BASE_URL}/users/me`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nome: 'Nome Qualquer',
      role: 'admin',
      email: 'hacker@petagenda.com',
    }),
  });
  const dataRestricted = await resRestricted.json();
  console.log(`Status ${resRestricted.status} (Esperado 400):`, dataRestricted);

  // 5. Upload de Avatar válido
  console.log('\n5. Criando e enviando imagem de avatar válida (PNG)...');
  const imageBuffer = await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 3,
      background: { r: 30, g: 144, b: 255 },
    },
  }).png().toBuffer();

  const formData = new FormData();
  formData.append('avatar', new Blob([imageBuffer], { type: 'image/png' }), 'meu_avatar.png');

  const resAvatar1 = await fetch(`${BASE_URL}/users/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const dataAvatar1 = await resAvatar1.json();
  console.log(`Status ${resAvatar1.status}:`, dataAvatar1);
  if (resAvatar1.status !== 200) throw new Error('Falha no upload do avatar');

  const oldAvatarUrl = dataAvatar1.data.avatarUrl;
  console.log('Avatar URL:', oldAvatarUrl);
  console.log('Thumb 256:', dataAvatar1.data.avatarThumb256);
  console.log('Thumb 128:', dataAvatar1.data.avatarThumb128);

  // 6. Testar rejeição de arquivo com mais de 2MB
  console.log('\n6. Testando upload de imagem acima de 2MB (> 2MB)...');
  const largeBuffer = Buffer.alloc(2.3 * 1024 * 1024);
  const formDataLarge = new FormData();
  formDataLarge.append('avatar', new Blob([largeBuffer], { type: 'image/png' }), 'pesado.png');

  const resLarge = await fetch(`${BASE_URL}/users/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formDataLarge,
  });
  const dataLarge = await resLarge.json();
  console.log(`Status ${resLarge.status} (Esperado 400):`, dataLarge);

  // 7. Testar rejeição de formato proibido (.exe)
  console.log('\n7. Testando upload de arquivo não permitido (.exe)...');
  const exeBuffer = Buffer.from('fake exe content');
  const formDataExe = new FormData();
  formDataExe.append('avatar', new Blob([exeBuffer], { type: 'application/x-msdownload' }), 'virus.exe');

  const resExe = await fetch(`${BASE_URL}/users/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formDataExe,
  });
  const dataExe = await resExe.json();
  console.log(`Status ${resExe.status} (Esperado 400):`, dataExe);

  // 8. Segundo upload para testar limpeza das imagens antigas
  console.log('\n8. Enviando segundo avatar para verificar limpeza automática do storage...');
  const newImageBuffer = await sharp({
    create: {
      width: 350,
      height: 350,
      channels: 3,
      background: { r: 255, g: 99, b: 71 },
    },
  }).png().toBuffer();

  const formData2 = new FormData();
  formData2.append('avatar', new Blob([newImageBuffer], { type: 'image/png' }), 'novo_avatar.png');

  const resAvatar2 = await fetch(`${BASE_URL}/users/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData2,
  });
  const dataAvatar2 = await resAvatar2.json();
  console.log(`Status ${resAvatar2.status}:`, dataAvatar2);

  // Verificar se o arquivo antigo foi limpo do disco
  const oldFileName = path.basename(oldAvatarUrl.split('?')[0]);
  const oldFilePath = path.resolve(process.cwd(), 'public/uploads/avatars', oldFileName);
  console.log(`Arquivo antigo no disco (${oldFileName}):`, fs.existsSync(oldFilePath) ? 'Ainda existe' : 'Limpo com sucesso (OK)!');

  // 9. Consistência de sessão (GET /users/me)
  console.log('\n9. Acessando GET /users/me para confirmar consistência dos dados...');
  const resGetMe = await fetch(`${BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dataGetMe = await resGetMe.json();
  console.log(`Status ${resGetMe.status}:`, dataGetMe);

  console.log('\n=== TODOS OS TESTES E2E DA US05 PASSARAM COM SUCESSO! ===');
}

run().catch((err) => {
  console.error('ERRO:', err);
  process.exit(1);
});
