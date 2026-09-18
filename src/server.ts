import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

async function main() {
  if (!env.DATABASE_URL) throw new Error('Configure DATABASE_URL antes de iniciar.');
  if (!Number.isInteger(env.PORT) || env.PORT < 0 || env.PORT > 65535) throw new Error('PORT invalida.');
  await prisma.$connect();
  const server = createApp().listen(env.PORT, env.HOST, () => {
    const address = server.address();
    const actualPort = typeof address === 'object' && address ? address.port : env.PORT;
    console.log(`PetAgenda disponivel em http://${env.HOST}:${actualPort}`);
  });
  const shutdown = () => {
    server.close(() => { void prisma.$disconnect().then(() => process.exit(0)); });
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  server.once('error', error => {
    console.error('Falha ao abrir a porta:', error.message);
    void prisma.$disconnect().then(() => process.exit(1));
  });
}
void main().catch(async () => {
  console.error('Falha ao iniciar. Verifique DATABASE_URL, PostgreSQL e migrations.');
  await prisma.$disconnect();
  process.exitCode = 1;
});
