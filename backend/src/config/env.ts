import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  GEMINI_API_KEY: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  return value || defaultValue!;
};

export const env: EnvConfig = {
  PORT: parseInt(getEnvVariable('PORT', '5000'), 10),
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  DATABASE_URL: getEnvVariable('DATABASE_URL'),
  GEMINI_API_KEY: getEnvVariable('GEMINI_API_KEY'),
};

// Validate critical environment variables on startup
export const validateEnv = (): void => {
  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY must be set to a valid API key');
  }
  
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
  }
  
  console.log('✓ Environment variables validated');
};
