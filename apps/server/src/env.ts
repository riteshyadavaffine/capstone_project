import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'supportpilot-dev-secret',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
};

