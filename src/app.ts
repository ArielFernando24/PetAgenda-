import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api', routes);

// Middleware de tratamento de erros
app.use(errorHandler);

export default app;
