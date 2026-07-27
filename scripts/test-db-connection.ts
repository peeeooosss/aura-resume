import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();