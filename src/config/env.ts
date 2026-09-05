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
};
