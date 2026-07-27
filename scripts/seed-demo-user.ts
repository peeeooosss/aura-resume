import { prisma } from '../lib/db';

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { id: 'demo-user' },
    update: {},
    create: {
      id: 'demo-user',
      email: 'demo@aura-resume.local',
      name: 'Demo User',
      plan: 'pro',
    },
  });

  await prisma.creditBalance.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: { userId: demoUser.id, balance: 100 },
  });

  console.log('Seeded demo user:', demoUser.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });