import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
// @ts-ignore
import { Pool } from 'pg';

// Extract the actual PostgreSQL URL from Prisma Postgres URL
function extractPostgresUrl(prismaUrl: string): string {
  if (prismaUrl.startsWith('prisma+postgres://')) {
    // Extract the base64 encoded payload
    const match = prismaUrl.match(/api_key=([^&]+)/);
    if (match) {
      try {
        const decoded = JSON.parse(Buffer.from(match[1], 'base64').toString());
        return decoded.databaseUrl;
      } catch (e) {
        console.error('Failed to decode Prisma Postgres URL');
      }
    }
  }
  return prismaUrl;
}

// Create PostgreSQL connection pool
const connectionString = extractPostgresUrl(process.env.DATABASE_URL || '');
const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

// Create a single Prisma Client instance with adapter
export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle graceful shutdown
export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('✓ Database disconnected');
};

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
};
