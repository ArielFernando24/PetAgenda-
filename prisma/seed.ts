import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados (US01)...');

  const saltRounds = 10;
  const senhaHash = await bcrypt.hash('senha123', saltRounds);

  const tutor1 = await prisma.tutor.upsert({
    where: { email: 'mariana@email.com' },
    update: {},
    create: {
      nome: 'Mariana Silva',
      email: 'mariana@email.com',
      senha_hash: senhaHash,
    },
  });

  const tutor2 = await prisma.tutor.upsert({
    where: { email: 'carlos@email.com' },
    update: {},
    create: {
      nome: 'Carlos Eduardo',
      email: 'carlos@email.com',
      senha_hash: senhaHash,
    },
  });

  console.log('Tutores criados com sucesso:');
  console.log(`- ${tutor1.nome} (${tutor1.email})`);
  console.log(`- ${tutor2.nome} (${tutor2.email})`);
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
