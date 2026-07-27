export const PORTFOLIO_TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern Developer',
    preview: '📱',
    description: 'Clean, technical focus with dark mode support',
    sections: ['hero', 'about', 'skills', 'experience', 'projects', 'contact'],
    defaultTheme: {
      primaryColor: '#6366f1',
      font: 'Inter',
      borderRadius: 'rounded-xl',
      spacing: 'normal',
    },
    features: ['Dark mode toggle', 'Skill proficiency bars', 'Project cards with tech stack'],
  },
  {
    id: 'minimal',
    name: 'Minimalist',
    preview: '📄',
    description: 'Whitespace-heavy, content-first design',
    sections: ['hero', 'about', 'experience', 'projects', 'contact'],
    defaultTheme: {
      primaryColor: '#000000',
      font: 'IBM Plex Sans',
      borderRadius: 'rounded-none',
      spacing: 'relaxed',
    },
    features: ['Clean typography', 'Print-friendly', 'Fast loading'],
  },
  {
    id: 'technical',
    name: 'Technical Deep-Dive',
    preview: '⚙️',
    description: 'Code snippets, architecture diagrams, tech stack visualization',
    sections: ['hero', 'about', 'skills', 'experience', 'projects', 'writing', 'contact'],
    defaultTheme: {
      primaryColor: '#10b981',
      font: 'JetBrains Mono',
      borderRadius: 'rounded-lg',
      spacing: 'normal',
    },
    features: ['Code blocks with syntax highlighting', 'Architecture diagrams', 'Tech stack radar chart'],
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    preview: '🎨',
    description: 'Visual-focused with animations and gallery',
    sections: ['hero', 'about', 'skills', 'experience', 'projects', 'testimonials', 'contact'],
    defaultTheme: {
      primaryColor: '#ec4899',
      font: 'Cal Sans',
      borderRadius: 'rounded-2xl',
      spacing: 'comfortable',
    },
    features: ['Image galleries', 'Smooth animations', 'Testimonial carousel'],
  },
] as const;

export type TemplateId = typeof PORTFOLIO_TEMPLATES[number]['id'];

export function getTemplate(templateId: TemplateId) {
  return PORTFOLIO_TEMPLATES.find(t => t.id === templateId) || PORTFOLIO_TEMPLATES[0];
}

export const DEFAULT_PORTFOLIO_CONTENT = {
  hero: {
    headline: '',
    subheadline: '',
    ctaText: 'View Resume',
    ctaLink: '#resume',
    avatar: '',
  },
  about: '',
  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: [],
  testimonials: [],
  contact: {
    email: '',
    linkedin: '',
    github: '',
    twitter: '',
    calendar: '',
  },
  seo: {
    title: '',
    description: '',
    image: '',
  },
};