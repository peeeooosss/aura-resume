import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'demo123';

interface UserData {
  id: string;
  email: string;
  name: string;
  plan: string;
  credits: number;
}

const demoUsers: UserData[] = [
  {
    id: 'demo-free-user',
    email: 'demo-free@tryaura.in',
    name: 'Free Demo',
    plan: 'free',
    credits: 50,
  },
  {
    id: 'demo-pro-user',
    email: 'demo-pro@tryaura.in',
    name: 'Pro Demo',
    plan: 'pro',
    credits: 900,
  },
  {
    id: 'demo-vip-user',
    email: 'demo-vip@tryaura.in',
    name: 'VIP Demo',
    plan: 'vip',
    credits: 1800,
  },
];

async function main() {
  console.log('Seeding 3 demo users...\n');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const user of demoUsers) {
    // Upsert user
    const created = await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash,
        plan: user.plan,
      },
    });
    console.log(`✓ Created user: ${created.name} (${created.plan})`);

    // Upsert credits
    await prisma.creditBalance.upsert({
      where: { userId: user.id },
      update: { balance: user.credits },
      create: { userId: user.id, balance: user.credits },
    });
    console.log(`  → Credits: ${user.credits}`);
  }

  // --- Pro user demo data ---
  console.log('\nAdding Pro demo data...');

  const proResume = await prisma.resume.create({
    data: {
      userId: 'demo-pro-user',
      title: 'Senior Software Engineer',
      fileUrl: '/demo/resume-pro.pdf',
      status: 'uploaded',
    },
  });

  await prisma.analysis.create({
    data: {
      resumeId: proResume.id,
      userId: 'demo-pro-user',
      type: 'resume',
      overallScore: 78,
      strengths: { items: ['Strong React skills', 'Good project descriptions'] },
      redFlags: { items: ['Missing metrics', 'Too many pages'] },
      suggestions: { items: ['Add quantified achievements', 'Trim to 2 pages'] },
      modelUsed: 'gpt-4o-mini',
      tokensUsed: 850,
    },
  });

  const jobMatches = [
    { title: 'Frontend Developer', company: 'TechCorp', location: 'Bangalore', salary: '18-25 LPA', matchScore: 85 },
    { title: 'React Developer', company: 'StartupX', location: 'Remote', salary: '15-22 LPA', matchScore: 82 },
    { title: 'Full Stack Engineer', company: 'CloudBase', location: 'Hyderabad', salary: '20-30 LPA', matchScore: 79 },
    { title: 'UI Developer', company: 'DesignHub', location: 'Pune', salary: '12-18 LPA', matchScore: 76 },
    { title: 'Senior Frontend', company: 'FinServe', location: 'Mumbai', salary: '22-32 LPA', matchScore: 88 },
  ];

  for (const job of jobMatches) {
    await prisma.jobMatch.create({
      data: {
        userId: 'demo-pro-user',
        resumeId: proResume.id,
        ...job,
        source: 'jobspy',
        skills: { matched: ['React', 'TypeScript', 'Next.js'], missing: ['GraphQL'] },
      },
    });
  }
  console.log('  → 1 resume, 1 analysis, 5 job matches');

  await prisma.linkedInProfile.create({
    data: {
      userId: 'demo-pro-user',
      headline: 'Senior Software Engineer | React & Node.js',
      summary: '5+ years building scalable web apps.',
      experience: { roles: [{ company: 'TechCorp', role: 'SDE', years: 3 }] },
      skills: { items: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'] },
      analysisScore: 72,
    },
  });

  const demoResume = await prisma.resume.findFirst({ where: { userId: 'demo-pro-user' } });
  await prisma.roadmap.create({
    data: {
      userId: 'demo-pro-user',
      resumeId: demoResume?.id || '',
      title: 'Frontend Lead Path',
      goalRole: 'Frontend Lead',
      currentRole: 'Senior Engineer',
      phases: [] as any,
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('  → 1 LinkedIn profile, 1 roadmap');

  await prisma.payment.create({
    data: {
      userId: 'demo-pro-user',
      amount: 100, // ₹1 in paise
      currency: 'INR',
      plan: 'pro',
      status: 'completed',
      metadata: { demo: true },
    },
  });
  console.log('  → 1 payment record (₹1)');

  // --- VIP user demo data ---
  console.log('\nAdding VIP demo data...');

  const vipResume1 = await prisma.resume.create({
    data: {
      userId: 'demo-vip-user',
      title: 'Engineering Manager Resume',
      fileUrl: '/demo/resume-vip-1.pdf',
      status: 'uploaded',
    },
  });

  const vipResume2 = await prisma.resume.create({
    data: {
      userId: 'demo-vip-user',
      title: 'Product Manager Resume',
      fileUrl: '/demo/resume-vip-2.pdf',
      status: 'uploaded',
    },
  });

  await prisma.analysis.create({
    data: {
      resumeId: vipResume1.id,
      userId: 'demo-vip-user',
      type: 'resume',
      overallScore: 91,
      strengths: { items: ['Excellent leadership examples', 'Strong quantified metrics'] },
      redFlags: { items: [] },
      suggestions: { items: ['Minor keyword optimization'] },
      modelUsed: 'gpt-4o-mini',
      tokensUsed: 920,
    },
  });

  await prisma.analysis.create({
    data: {
      resumeId: vipResume2.id,
      userId: 'demo-vip-user',
      type: 'resume',
      overallScore: 84,
      strengths: { items: ['Clear career progression', 'Strong product sense'] },
      redFlags: { items: ['Could add more metrics'] },
      suggestions: { items: ['Add revenue impact numbers'] },
      modelUsed: 'gpt-4o-mini',
      tokensUsed: 880,
    },
  });

  const vipJobs = [
    { title: 'Engineering Manager', company: 'MegaCorp', location: 'Bangalore', salary: '40-55 LPA', matchScore: 94 },
    { title: 'Senior Product Manager', company: 'FinTech Pro', location: 'Mumbai', salary: '35-50 LPA', matchScore: 90 },
    { title: 'VP of Engineering', company: 'ScaleUp', location: 'Remote', salary: '55-80 LPA', matchScore: 87 },
    { title: 'Tech Lead', company: 'InnovateLabs', location: 'Hyderabad', salary: '30-45 LPA', matchScore: 91 },
    { title: 'Engineering Director', company: 'GlobalTech', location: 'Delhi NCR', salary: '50-70 LPA', matchScore: 89 },
    { title: 'Head of Frontend', company: 'AppWorks', location: 'Pune', salary: '38-52 LPA', matchScore: 86 },
    { title: 'Staff Engineer', company: 'CloudNative', location: 'Bangalore', salary: '45-65 LPA', matchScore: 93 },
    { title: 'Principal Engineer', company: 'DataFlow', location: 'Remote', salary: '60-85 LPA', matchScore: 88 },
  ];

  for (const job of vipJobs) {
    await prisma.jobMatch.create({
      data: {
        userId: 'demo-vip-user',
        resumeId: vipResume1.id,
        ...job,
        source: 'jobspy',
        skills: { matched: ['Leadership', 'System Design', 'React'], missing: [] },
      },
    });
  }
  console.log('  → 2 resumes, 2 analyses, 8 job matches');

  await prisma.linkedInProfile.create({
    data: {
      userId: 'demo-vip-user',
      headline: 'Engineering Manager | Building High-Performance Teams',
      summary: '10+ years in tech, leading teams of 20+ engineers.',
      experience: { roles: [{ company: 'MegaCorp', role: 'EM', years: 4 }, { company: 'TechCorp', role: 'SDE', years: 5 }] },
      skills: { items: ['Leadership', 'System Design', 'React', 'AWS', 'Kubernetes'] },
      analysisScore: 92,
    },
  });

  await prisma.roadmap.create({
    data: {
      userId: 'demo-vip-user',
      resumeId: vipResume1.id,
      title: 'CTO Track',
      goalRole: 'CTO',
      currentRole: 'Engineering Manager',
      phases: [] as any,
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.roadmap.create({
    data: {
      userId: 'demo-vip-user',
      resumeId: vipResume2.id,
      title: 'Product Leadership',
      goalRole: 'VP Product',
      currentRole: 'Engineering Manager',
      phases: [] as any,
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.portfolio.create({
    data: {
      userId: 'demo-vip-user',
      title: 'Engineering Leadership Portfolio',
      slug: 'demo-vip-portfolio',
      description: 'Showcase of engineering leadership and technical achievements.',
      template: 'professional',
      data: { projects: ['Led migration to microservices', 'Built team from 5 to 20'] },
      isPublished: true,
      views: 42,
    },
  });
  console.log('  → 1 LinkedIn profile, 2 roadmaps, 1 portfolio');

  await prisma.payment.create({
    data: {
      userId: 'demo-vip-user',
      amount: 100, // ₹1 in paise
      currency: 'INR',
      plan: 'vip',
      status: 'completed',
      metadata: { demo: true },
    },
  });
  console.log('  → 1 payment record (₹1)');

  console.log('\n--- Summary ---');
  console.log('Free: demo-free@tryaura.in / demo123 (50 credits)');
  console.log('Pro:  demo-pro@tryaura.in / demo123  (900 credits)');
  console.log('VIP:  demo-vip@tryaura.in / demo123  (1,800 credits)');
  console.log('\nDone!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
