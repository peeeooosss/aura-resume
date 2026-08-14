import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all users and related data...\n');

  // Delete in order to respect foreign key constraints
  const tables = [
    { name: 'interviewSession', model: prisma.interviewSession },
    { name: 'portfolio', model: prisma.portfolio },
    { name: 'linkedInTemplate', model: prisma.linkedInTemplate },
    { name: 'usageRecord', model: prisma.usageRecord },
    { name: 'creditBalance', model: prisma.creditBalance },
    { name: 'payment', model: prisma.payment },
    { name: 'roadmap', model: prisma.roadmap },
    { name: 'jobMatch', model: prisma.jobMatch },
    { name: 'analysis', model: prisma.analysis },
    { name: 'resume', model: prisma.resume },
    { name: 'linkedInProfile', model: prisma.linkedInProfile },
    { name: 'user', model: prisma.user },
  ];

  for (const { name, model } of tables) {
    try {
      const result = await (model as any).deleteMany({});
      console.log(`✓ Cleared ${name}: ${result.count} records`);
    } catch (err: any) {
      console.warn(`  Could not clear ${name}: ${err.message}`);
    }
  }

  console.log('\nAll user data cleared!');
}

main()
  .catch((e) => {
    console.error('Clear failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });