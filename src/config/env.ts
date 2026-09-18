import dotenv from 'dotenv';
import { randomBytes } from 'node:crypto';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET?.trim();
if (process.env.NODE_ENV === 'production' && (!jwtSecret || jwtSecret.length < 32)) {
  throw new Error('Configure JWT_SECRET com pelo menos 32 caracteres em producao.');
}
export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  HOST: process.env.HOST ?? '127.0.0.1',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  JWT_SECRET: jwtSecret || randomBytes(32).toString('hex'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  MAIL_PROVIDER: process.env.MAIL_PROVIDER || 'console',
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  STORAGE_BASE_URL: process.env.STORAGE_BASE_URL || `http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 3000}/uploads/avatars`,
};
