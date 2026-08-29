import app from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`🐾 PetAgenda API rodando na porta ${env.PORT}`);
  console.log(`🚀 Ambiente: ${env.NODE_ENV}`);
  console.log(`🩺 Health check disponível em: http://localhost:${env.PORT}/api/health`);
});

process.on('SIGTERM', () => {
  console.log('Recebido sinal SIGTERM, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado.');
    process.exit(0);
  });
});

