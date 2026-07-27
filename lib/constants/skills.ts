export const SKILL_CATEGORIES = {
  frontend: [
    'React', 'Next.js', 'TypeScript', 'JavaScript', 'Vue.js', 'Svelte',
    'Tailwind CSS', 'CSS Modules', 'Styled Components', 'Framer Motion',
    'React Query', 'SWR', 'Redux', 'Zustand', 'Recoil', 'Jotai',
    'Vite', 'Webpack', 'Storybook', 'Chromatic', 'Playwright', 'Cypress',
    'Jest', 'React Testing Library', 'Vitest', 'MSW',
  ],
  backend: [
    'Node.js', 'Express', 'Fastify', 'NestJS', 'Hono', 'Elysia',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Prisma', 'Drizzle ORM',
    'TypeORM', 'Sequelize', 'GraphQL', 'Apollo', 'tRPC', 'REST APIs',
    'WebSockets', 'Socket.io', 'Server-Sent Events', 'gRPC',
  ],
  cloud: [
    'AWS', 'Vercel', 'Netlify', 'Railway', 'Render', 'Fly.io',
    'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'GitLab CI',
    'Cloudflare', 'Supabase', 'PlanetScale', 'Neon', 'Turso',
    'Lambda', 'ECS', 'EKS', 'S3', 'CloudFront', 'Route53',
  ],
  data: [
    'Python', 'Pandas', 'NumPy', 'SQL', 'PostgreSQL', 'BigQuery',
    'Snowflake', 'dbt', 'Airflow', 'Kafka', 'Spark', 'Flink',
    'Tableau', 'Looker', 'Metabase', 'Evidence', 'Streamlit',
  ],
  mobile: [
    'React Native', 'Expo', 'Flutter', 'Swift', 'Kotlin',
    'iOS', 'Android', 'Capacitor', 'Ionic',
  ],
  devops: [
    'Linux', 'Nginx', 'NGINX', 'HAProxy', 'Prometheus', 'Grafana',
    'ELK Stack', 'Datadog', 'New Relic', 'Sentry', 'PagerDuty',
    'ArgoCD', 'Flux', 'Helm', 'Kustomize', 'Istio', 'Linkerd',
  ],
  ai: [
    'OpenAI API', 'Anthropic API', 'LangChain', 'LlamaIndex',
    'Vector Databases', 'Pinecone', 'Weaviate', 'Chroma', 'Qdrant',
    'Embeddings', 'RAG', 'Fine-tuning', 'Prompt Engineering',
    'LangSmith', 'LangGraph', 'AutoGPT', 'BabyAGI',
  ],
} as const;

export const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat();

export function categorizeSkill(skill: string): keyof typeof SKILL_CATEGORIES | 'other' {
  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    if (skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      return category as keyof typeof SKILL_CATEGORIES;
    }
  }
  return 'other';
}

export function getSkillCategory(skill: string) {
  return categorizeSkill(skill);
}

export const SKILL_SYNONYMS: Record<string, string[]> = {
  'React.js': ['React', 'ReactJS'],
  'Next.js': ['NextJS', 'Next'],
  'TypeScript': ['TS'],
  'JavaScript': ['JS', 'ES6', 'ES2015+'],
  'Node.js': ['NodeJS', 'Node'],
  'PostgreSQL': ['Postgres', 'PSQL'],
  'MongoDB': ['Mongo'],
  'Amazon Web Services': ['AWS'],
  'Google Cloud Platform': ['GCP', 'Google Cloud'],
  'Microsoft Azure': ['Azure'],
  'CI/CD': ['Continuous Integration', 'Continuous Deployment'],
  'Machine Learning': ['ML', 'AI'],
  'Artificial Intelligence': ['AI', 'ML'],
};