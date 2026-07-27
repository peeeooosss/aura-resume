import { MOCK_RESUMES } from './resumeData';

export const MOCK_PORTFOLIOS = [
  {
    id: 'port_1',
    userId: 'user_1',
    resumeId: 'res_1',
    slug: 'arjun-sharma',
    template: 'modern',
    theme: {
      primaryColor: '#6366f1',
      font: 'Inter',
      borderRadius: 'rounded-xl',
      spacing: 'normal',
    },
    hero: {
      headline: 'Arjun Sharma',
      subheadline: 'Senior Frontend Engineer • Building scalable web platforms',
      ctaText: 'View Resume',
      ctaLink: '#resume',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
    },
    about: 'Senior Frontend Engineer with 4+ years of experience building scalable React/Next.js applications. Currently leading frontend architecture at TechCorp India, where I migrated the platform to Next.js 13 and built a component library serving 5 teams. Passionate about developer experience, system design, and mentoring the next generation of engineers.',
    skills: [
      { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Framer Motion', 'React Query', 'Zustand'] },
      { category: 'Backend & Cloud', items: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'Vercel', 'CI/CD', 'WebSockets'] },
      { category: 'Testing & Quality', items: ['Jest', 'React Testing Library', 'Playwright', 'Cypress', 'Storybook', 'ESLint', 'Prettier'] },
      { category: 'Leadership', items: ['Mentoring', 'Code Reviews', 'RFC Writing', 'Architecture Decisions', 'Team Planning', 'Technical Interviews'] },
    ],
    experience: MOCK_RESUMES[0].experience.map(exp => ({
      ...exp,
      tech: exp.tech,
    })),
    projects: MOCK_RESUMES[0].projects,
    education: MOCK_RESUMES[0].education,
    certifications: MOCK_RESUMES[0].certifications,
    testimonials: [
      {
        id: 'test_1',
        name: 'Priya Patel',
        role: 'Engineering Manager',
        company: 'TechCorp India',
        content: 'Arjun is the kind of engineer who elevates everyone around him. His component library work saved us months of development time, and his mentorship made our team 3x more productive.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
      },
      {
        id: 'test_2',
        name: 'Rahul Verma',
        role: 'Senior Backend Engineer',
        company: 'TechCorp India',
        content: 'Working with Arjun on the real-time dashboard was a masterclass in frontend-backend collaboration. He anticipated API needs before we even discussed them.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
      },
    ],
    contact: {
      email: 'arjun.sharma@email.com',
      linkedin: 'https://linkedin.com/in/arjunsharma',
      github: 'https://github.com/arjunsharma',
      twitter: 'https://twitter.com/arjunsharma',
      calendar: 'https://cal.com/arjunsharma',
    },
    seo: {
      title: 'Arjun Sharma | Senior Frontend Engineer',
      description: 'Senior Frontend Engineer specializing in React, Next.js, and scalable frontend architecture. Portfolio showcasing projects, experience, and technical writing.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
    },
    isPublished: true,
    publishedAt: '2024-01-20T10:00:00Z',
    views: 247,
    uniqueVisitors: 189,
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-25T14:30:00Z',
  },
];

export const MOCK_PORTFOLIO_SECTIONS = [
  { id: 'hero', label: 'Hero', required: true, order: 1 },
  { id: 'about', label: 'About', required: true, order: 2 },
  { id: 'skills', label: 'Skills', required: false, order: 3 },
  { id: 'experience', label: 'Experience', required: true, order: 4 },
  { id: 'projects', label: 'Projects', required: false, order: 5 },
  { id: 'education', label: 'Education', required: false, order: 6 },
  { id: 'certifications', label: 'Certifications', required: false, order: 7 },
  { id: 'testimonials', label: 'Testimonials', required: false, order: 8 },
  { id: 'writing', label: 'Writing', required: false, order: 9 },
  { id: 'contact', label: 'Contact', required: true, order: 10 },
];