// prisma.config.ts
export default {
  // For direct database connections (Prisma Client)
  directConnection: {
    url: process.env.DATABASE_URL,
  },
  // For migrations (Prisma CLI)
  migrations: {
    url: process.env.DIRECT_URL,
  },
  // For Accelerate (if using)
  accelerate: {
    url: process.env.ACCELERATE_URL,
  },
};