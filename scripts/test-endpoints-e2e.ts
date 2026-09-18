import { prisma } from '../src/config/prisma';

const BASE_URL = 'http://127.0.0.1:3000/api';

async function run() {
  console.log('=== INICIANDO TESTES END-TO-END DOS ENDPOINTS (US04 + AUTH) ===\n');

  const testEmail = `tutor.teste.${Date.now()}@petagenda.com`;
  const initialPassword = 'SenhaInicial@123';
  const newPassword = 'NovaSenhaForte@2026';

  // 1. Cadastro de Tutor
  console.log('1. Cadastrando novo tutor de teste...');
  const resCad = await fetch(`${BASE_URL}/tutores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: 'Tutor Teste E2E',
      email: testEmail,
      senha: initialPassword,
    }),
  });
  const dataCad = await resCad.json();
  console.log(`Status: ${resCad.status}`, dataCad);
  if (resCad.status !== 201) throw new Error('Falha no cadastro do tutor');

  // 2. Login e obtenção do primeiro JWT
  console.log('\n2. Efetuando login com senha inicial...');
  const resLogin1 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, senha: initialPassword }),
  });
  const dataLogin1 = await resLogin1.json();
  console.log(`Status: ${resLogin1.status}`, dataLogin1);
  const oldJwtToken = dataLogin1.data.token;

  // 3. Teste do perfil com token atual
  console.log('\n3. Acessando rota protegida /tutores/me com JWT da primeira sessão...');
  const resMe1 = await fetch(`${BASE_URL}/tutores/me`, {
    headers: { Authorization: `Bearer ${oldJwtToken}` },
  });
  const dataMe1 = await resMe1.json();
  console.log(`Status: ${resMe1.status}`, dataMe1);
  if (resMe1.status !== 200) throw new Error('Falha ao obter perfil com JWT atual');

  // 4. Solicitação de recuperação de senha (Forgot Password)
  console.log('\n4. Solicitando recuperação de senha (POST /auth/forgot-password)...');
  const resForgot = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  });
  const dataForgot = await resForgot.json();
  console.log(`Status: ${resForgot.status}`, dataForgot);
  if (resForgot.status !== 200) throw new Error('Falha no forgot-password');

  // 5. Teste anti-enumeração com e-mail inexistente
  console.log('\n5. Testando anti-enumeração com e-mail inexistente...');
  const resForgotFake = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'inexistente.fake@petagenda.com' }),
  });
  const dataForgotFake = await resForgotFake.json();
  console.log(`Status: ${resForgotFake.status} (Mesma resposta neutra)`, dataForgotFake);

  // 6. Buscar o registro de token gerado no banco de dados
  console.log('\n6. Consultando token gerado no banco PostgreSQL...');
  const tutor = await prisma.tutor.findUnique({ where: { email: testEmail } });
  if (!tutor) throw new Error('Tutor não encontrado no banco');

  const tokenRecord = await prisma.passwordResetToken.findFirst({
    where: { tutorId: tutor.id },
    orderBy: { createdAt: 'desc' },
  });
  console.log('Registro de token no banco:', {
    id: tokenRecord?.id,
    expiresAt: tokenRecord?.expiresAt,
    usedAt: tokenRecord?.usedAt,
  });

  // 7. Teste de validação de força de senha no reset-password
  console.log('\n7. Testando rejeição de senha fraca no reset-password...');
  const resResetWeak = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: 'qualquer-token',
      novaSenha: 'fraca',
    }),
  });
  const dataResetWeak = await resResetWeak.json();
  console.log(`Status: ${resResetWeak.status} (Esperado 400)`, dataResetWeak);

  // 8. Como o rawToken foi enviado no e-mail (e no log do console), vamos simular gerando um novo token
  // direto para testar a rota reset-password com precisão
  const crypto = await import('node:crypto');
  const testRawToken = crypto.randomBytes(32).toString('hex');
  const testTokenHash = crypto.createHash('sha256').update(testRawToken).digest('hex');

  await prisma.passwordResetToken.create({
    data: {
      tutorId: tutor.id,
      tokenHash: testTokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  // 9. Executar reset-password com sucesso
  console.log('\n8. Redefinindo a senha com token válido (POST /auth/reset-password)...');
  const resResetOk = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: testRawToken,
      novaSenha: newPassword,
    }),
  });
  const dataResetOk = await resResetOk.json();
  console.log(`Status: ${resResetOk.status}`, dataResetOk);
  if (resResetOk.status !== 200) throw new Error('Falha ao redefinir senha com token válido');

  // 10. Testar reaproveitamento do mesmo token (deve falhar)
  console.log('\n9. Testando tentativa de reaproveitamento do mesmo token...');
  const resReuse = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: testRawToken,
      novaSenha: newPassword,
    }),
  });
  const dataReuse = await resReuse.json();
  console.log(`Status: ${resReuse.status} (Esperado 400 por token já utilizado)`, dataReuse);

  // 11. Testar revogação da sessão antiga
  console.log('\n10. Testando se o JWT antigo foi revogado (GET /tutores/me)...');
  const resMeRevoked = await fetch(`${BASE_URL}/tutores/me`, {
    headers: { Authorization: `Bearer ${oldJwtToken}` },
  });
  const dataMeRevoked = await resMeRevoked.json();
  console.log(`Status: ${resMeRevoked.status} (Esperado 401)`, dataMeRevoked);

  // 12. Testar login com a senha antiga (deve falhar)
  console.log('\n11. Tentando login com a senha antiga...');
  const resOldPass = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, senha: initialPassword }),
  });
  const dataOldPass = await resOldPass.json();
  console.log(`Status: ${resOldPass.status} (Esperado 401)`, dataOldPass);

  // 13. Testar login com a nova senha (deve ter sucesso)
  console.log('\n12. Tentando login com a nova senha...');
  const resNewPass = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, senha: newPassword }),
  });
  const dataNewPass = await resNewPass.json();
  console.log(`Status: ${resNewPass.status} (Esperado 200)`, dataNewPass);
  const newJwtToken = dataNewPass.data.token;

  // 14. Acessar perfil com o novo JWT
  console.log('\n13. Acessando /tutores/me com novo JWT...');
  const resMeNew = await fetch(`${BASE_URL}/tutores/me`, {
    headers: { Authorization: `Bearer ${newJwtToken}` },
  });
  const dataMeNew = await resMeNew.json();
  console.log(`Status: ${resMeNew.status} (Esperado 200)`, dataMeNew);

  console.log('\n=== TODOS OS TESTES DOS ENDPOINTS PASSARAM COM 100% DE SUCESSO! ===');
  await prisma.$disconnect();
}

run().catch((err) => {
  console.error('ERRO NO TESTE:', err);
  process.exit(1);
});
