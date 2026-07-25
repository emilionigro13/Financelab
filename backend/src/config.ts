import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  FINNHUB_API_KEY: z.string().min(1, 'FINNHUB_API_KEY is required'),
});

const env = envSchema.parse(process.env);

export const config = {
  server: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
  },
  database: {
    url: env.DIRECT_URL,
  },
  security: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
  },
  frontend: {
    url: env.FRONTEND_URL,
  },
  finnhub: {
    apiKey: env.FINNHUB_API_KEY,
  },
};