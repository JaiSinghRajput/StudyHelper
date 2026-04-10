import dotenv from 'dotenv';

dotenv.config();

export const environment = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    expiry: process.env.JWT_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  pythonEngine: {
    url: process.env.PYTHON_ENGINE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.PYTHON_ENGINE_TIMEOUT || '60000', 10),
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    credentials: true,
  },

  database: {
    url: process.env.DATABASE_URL || 'sqlite:sqlite.db',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validate required environment variables
export function validateEnvironment(): void {
  const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }
}
