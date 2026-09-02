import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the backend package root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'insecure-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseFile: process.env.DATABASE_FILE || './data/auth.sqlite',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

if (config.jwtSecret === 'insecure-dev-secret') {
  console.warn('[config] WARNING: JWT_SECRET is not set. Using an insecure default. Set it in .env.');
}
