import type { PlanId } from '../constants/plans';

export const MOCK_USER = {
  id: 'user_1',
  email: 'arjun.sharma@email.com',
  name: 'Arjun Sharma',
  image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
  plan: 'pro' as PlanId,
  planExpiresAt: '2024-04-15T00:00:00Z',
  scansUsedThisMonth: 12,
  lastScanReset: '2024-01-01T00:00:00Z',
  createdAt: '2024-01-15T10:30:00Z',
};

export const MOCK_RESUMES = [
  {
    id: 'res_1',
    userId: 'user_1',
    fileName: 'arjun_sharma_resume.pdf',
    fileSize: 245760,
    mimeType: 'application/pdf',
    status: 'PARSED',
    isPrimary: true,
    version: 1,
    atsScore: 72,
    atsBreakdown: {
      formatting: 85,
      keywords: 68,
      sections: 90,
      readability: 75,
      contact: 100,
    },
    skills: [
      'React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL',
      'Tailwind CSS', 'GraphQL', 'Docker', 'AWS', 'Git',
      'Jest', 'React Testing Library', 'CI/CD', 'REST APIs',
      'Redis', 'WebSockets', 'Micro-frontends',
    ],
    experience: [
      {
        id: 'exp_1',
        role: 'Senior Frontend Engineer',
        company: 'TechCorp India',
        location: 'Bangalore, KA',
        startDate: '2022-01',
        endDate: null,
        current: true,
        bullets: [
          'Led migration from CRA to Next.js 13, improving FCP by 40%',
          'Architected component library used by 5 teams (200+ components)',
          'Mentored 3 junior developers, introduced code review standards',
          'Built real-time dashboard with WebSockets handling 10k+ events/sec',
        ],
        tech: ['React', 'TypeScript', 'Next.js', 'WebSockets', 'Redis'],
      },
      {
        id: 'exp_2',
        role: 'Frontend Developer',
        company: 'StartupXYZ',
        location: 'Remote',
        startDate: '2020-06',
        endDate: '2021-12',
        current: false,
        bullets: [
          'Developed customer-facing SPA serving 50k+ MAU',
          'Implemented design system reducing UI dev time by 30%',
          'Optimized bundle size from 2.1MB to 650KB',
        ],
        tech: ['React', 'Redux', 'Webpack', 'Sass', 'Storybook'],
      },
      {
        id: 'exp_3',
        role: 'Junior Frontend Developer',
        company: 'Digital Agency',
        location: 'Mumbai, MH',
        startDate: '2019-01',
        endDate: '2020-05',
        current: false,
        bullets: [
          'Built 10+ client websites using React and WordPress',
          'Collaborated with designers to implement pixel-perfect UIs',
        ],
        tech: ['React', 'WordPress', 'PHP', 'SCSS', 'jQuery'],
      },
    ],
    education: [
      {
        id: 'edu_1',
        degree: 'B.Tech Computer Science',
        school: 'IIT Delhi',
        year: '2020',
        honors: "Dean's List 2018-2020",
      },
    ],
    certifications: [
      'AWS Certified Developer Associate (2023)',
      'Google Cloud Professional Cloud Architect (2022)',
    ],
    languages: ['English (Fluent)', 'Hindi (Native)'],
    projects: [
      {
        id: 'proj_1',
        name: 'DevFlow - Developer Productivity Tracker',
        description: 'VS Code extension tracking coding metrics with 5k+ installs',
        tech: ['TypeScript', 'VS Code API', 'Electron'],
        link: 'https://github.com/arjun/devflow',
        github: 'https://github.com/arjun/devflow',
      },
      {
        id: 'proj_2',
        name: 'React Performance Profiler',
        description: 'Open-source tool for identifying render bottlenecks',
        tech: ['React', 'TypeScript', 'Chrome DevTools Protocol'],
        link: 'https://github.com/arjun/react-profiler',
        github: 'https://github.com/arjun/react-profiler',
      },
    ],
    redFlags: [
      'Missing keywords for "System Design" roles',
      'No measurable results in StartupXYZ role',
      'Gap between 2020-2020 (6 months)',
    ],
    strengths: [
      'Strong action verbs throughout',
      'Quantifiable achievements in current role',
      'ATS-friendly formatting confirmed',
      'Clear career progression',
    ],
    rawText: `Arjun Sharma
Senior Frontend Engineer | Bangalore | arjun.sharma@email.com | +91-9876543210
LinkedIn: linkedin.com/in/arjunsharma | GitHub: github.com/arjun

EXPERIENCE
TechCorp India | Senior Frontend Engineer | Jan 2022 - Present
- Led migration from CRA to Next.js 13, improving FCP by 40%
- Architected component library used by 5 teams (200+ components)
- Mentored 3 junior developers, introduced code review standards
- Built real-time dashboard with WebSockets handling 10k+ events/sec

StartupXYZ | Frontend Developer | Jun 2020 - Dec 2021
- Developed customer-facing SPA serving 50k+ MAU
- Implemented design system reducing UI dev time by 30%
- Optimized bundle size from 2.1MB to 650KB

Digital Agency | Junior Frontend Developer | Jan 2019 - May 2020
- Built 10+ client websites using React and WordPress
- Collaborated with designers to implement pixel-perfect UIs

EDUCATION
IIT Delhi | B.Tech Computer Science | 2020

SKILLS
React, TypeScript, Next.js, Node.js, PostgreSQL, Tailwind CSS, GraphQL, Docker, AWS, Git, Jest, React Testing Library, CI/CD, REST APIs, Redis, WebSockets, Micro-frontends

CERTIFICATIONS
AWS Certified Developer Associate (2023)
Google Cloud Professional Cloud Architect (2022)`,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:22:00Z',
  },
  {
    id: 'res_2',
    userId: 'user_1',
    fileName: 'arjun_sharma_backend_focus.pdf',
    fileSize: 189440,
    mimeType: 'application/pdf',
    status: 'PARSED',
    isPrimary: false,
    version: 1,
    atsScore: 68,
    atsBreakdown: {
      formatting: 80,
      keywords: 65,
      sections: 85,
      readability: 70,
      contact: 100,
    },
    skills: [
      'Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker',
      'AWS', 'GraphQL', 'REST APIs', 'Kubernetes', 'Terraform',
      'Python', 'FastAPI', 'Prisma', 'Kafka', 'RabbitMQ',
    ],
    experience: [
      {
        id: 'exp_1',
        role: 'Backend Engineer',
        company: 'FinTech Startup',
        location: 'Bangalore, KA',
        startDate: '2021-03',
        endDate: '2022-12',
        current: false,
        bullets: [
          'Built payment processing microservices handling 1M+ transactions/day',
          'Designed event-driven architecture with Kafka',
          'Reduced API latency from 500ms to 50ms',
        ],
        tech: ['Node.js', 'TypeScript', 'PostgreSQL', 'Kafka', 'Docker', 'Kubernetes'],
      },
    ],
    education: [
      {
        id: 'edu_1',
        degree: 'B.Tech Computer Science',
        school: 'IIT Delhi',
        year: '2020',
      },
    ],
    certifications: ['AWS Certified Solutions Architect (2023)'],
    languages: ['English (Fluent)', 'Hindi (Native)'],
    projects: [],
    redFlags: [
      'Frontend skills not highlighted',
      'Only 1 year backend experience shown',
    ],
    strengths: [
      'Strong backend architecture experience',
      'Cloud infrastructure knowledge',
    ],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z',
  },
  {
    id: 'res_3',
    userId: 'user_1',
    fileName: 'arjun_sharma_fullstack.pdf',
    fileSize: 312000,
    mimeType: 'application/pdf',
    status: 'DRAFT',
    isPrimary: false,
    version: 1,
    atsScore: null,
    atsBreakdown: null,
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    languages: [],
    projects: [],
    redFlags: [],
    strengths: [],
    createdAt: '2024-01-25T16:00:00Z',
    updatedAt: '2024-01-25T16:00:00Z',
  },
];