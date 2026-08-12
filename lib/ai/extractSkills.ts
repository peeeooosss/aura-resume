const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'have', 'been', 'were', 'was', 'are', 'not',
  'a', 'an', 'in', 'of', 'on', 'to', 'at', 'by', 'as', 'it', 'or', 'is', 'be', 'can', 'will', 'has',
  'had', 'its', 'you', 'your', 'our', 'their', 'we', 'they', 'than', 'then', 'when', 'where', 'which',
  'who', 'whom', 'whose', 'also', 'but', 'if', 'so', 'etc', 'via', 'per', 'over', 'under', 'between',
  'during', 'use', 'used', 'using', 'tools', 'tool', 'languages', 'language', 'frameworks', 'framework',
  'platforms', 'platform', 'technologies', 'technology', 'skills', 'skill', 'core', 'others', 'other',
  'misc', 'professional', 'personal', 'areas', 'area', 'proficiencies', 'proficiency', 'categories',
  'category', 'sections', 'section', 'databases', 'database', 'libraries', 'library', 'miscellaneous',
  'intermediate', 'advanced', 'beginner', 'proficient', 'expert', 'experienced', 'experience',
  'years', 'year', 'months', 'month', 'level', 'levels', 'programming', 'development', 'engineering',
  'developer', 'software', 'management', 'leadership', 'communication', 'teamwork', 'problem', 'solving',
]);

const SKILL_KEYWORDS: Array<[RegExp, string]> = [
  [/react native/i, 'React Native'],
  [/next\.?js/i, 'Next.js'],
  [/node\.?js/i, 'Node.js'],
  [/google cloud/i, 'Google Cloud'],
  [/machine learning/i, 'Machine Learning'],
  [/deep learning/i, 'Deep Learning'],
  [/computer vision/i, 'Computer Vision'],
  [/data sci/i, 'Data Science'],
  [/power bi/i, 'Power BI'],
  [/spring boot/i, 'Spring Boot'],
  [/ci\/cd/i, 'CI/CD'],
  [/three\.?js/i, 'Three.js'],
  [/typescript/i, 'TypeScript'],
  [/javascript/i, 'JavaScript'],
  [/tailwind/i, 'Tailwind CSS'],
  [/wordpress/i, 'WordPress'],
  [/shopify/i, 'Shopify'],
  [/angular/i, 'Angular'],
  [/express/i, 'Express'],
  [/django/i, 'Django'],
  [/flask/i, 'Flask'],
  [/spring/i, 'Spring'],
  [/\.net/i, '.NET'],
  [/\bjava\b/i, 'Java'],
  [/c#/i, 'C#'],
  [/c\+\+/i, 'C++'],
  [/golang/i, 'Go'],
  [/\brust\b/i, 'Rust'],
  [/swift/i, 'Swift'],
  [/kotlin/i, 'Kotlin'],
  [/ruby/i, 'Ruby'],
  [/\bphp\b/i, 'PHP'],
  [/scala/i, 'Scala'],
  [/\baws\b/i, 'AWS'],
  [/azure/i, 'Azure'],
  [/gcp/i, 'GCP'],
  [/cloud/i, 'Cloud'],
  [/docker/i, 'Docker'],
  [/kubernetes/i, 'Kubernetes'],
  [/k8s/i, 'Kubernetes'],
  [/jenkins/i, 'Jenkins'],
  [/terraform/i, 'Terraform'],
  [/ansible/i, 'Ansible'],
  [/graphql/i, 'GraphQL'],
  [/postgres/i, 'PostgreSQL'],
  [/mysql/i, 'MySQL'],
  [/mongodb/i, 'MongoDB'],
  [/redis/i, 'Redis'],
  [/elasticsearch/i, 'Elasticsearch'],
  [/nosql/i, 'NoSQL'],
  [/\bsql\b/i, 'SQL'],
  [/microservice/i, 'Microservices'],
  [/kafka/i, 'Kafka'],
  [/airflow/i, 'Airflow'],
  [/spark/i, 'Apache Spark'],
  [/hadoop/i, 'Hadoop'],
  [/tensorflow/i, 'TensorFlow'],
  [/pytorch/i, 'PyTorch'],
  [/pandas/i, 'Pandas'],
  [/numpy/i, 'NumPy'],
  [/scikit/i, 'scikit-learn'],
  [/nlp/i, 'NLP'],
  [/restful/i, 'REST'],
  [/\brest\b/i, 'REST'],
  [/\bapi\b/i, 'API'],
  [/linux/i, 'Linux'],
  [/\bgit\b/i, 'Git'],
  [/github/i, 'GitHub'],
  [/agile/i, 'Agile'],
  [/scrum/i, 'Scrum'],
  [/devops/i, 'DevOps'],
  [/prisma/i, 'Prisma'],
  [/\bhtml\b/i, 'HTML'],
  [/\bcss\b/i, 'CSS'],
  [/scss/i, 'SCSS'],
  [/figma/i, 'Figma'],
  [/jira/i, 'Jira'],
  [/tableau/i, 'Tableau'],
  [/excel/i, 'Excel'],
  [/selenium/i, 'Selenium'],
  [/flutter/i, 'Flutter'],
  [/dart/i, 'Dart'],
  [/unity/i, 'Unity'],
  [/unreal/i, 'Unreal Engine'],
];

const SECTION_HEADINGS = new RegExp(
  [
    /#{1,3}\s*(?:skills|technical skills|core competencies|technologies|key skills|technical stack|tech stack|tools & technologies|tools and technologies|skills & technologies|skills and technologies|technical competencies)\s*:?\s*$/i,
    /^\s*(?:technical\s+)?skills\s*:?\s*$/i,
    /^\s*(?:core\s+)?(?:competencies|technologies)\s*:?\s*$/i,
    /^\s*technical\s+(?:stack|skills)\s*:?\s*$/i,
    /^\s*(?:tools|technologies)\s*(?:used)?\s*:?\s*$/i,
  ]
    .map((re) => re.source)
    .join('|'),
  'i'
);

const KNOWN_SECTION_HEADINGS = new RegExp(
  [
    /#{1,3}\s*(?:summary|objective|experience|employment|work history|projects|project|education|certifications|certification|publications|awards|honors|interests|additional|references|volunteer|volunteering|hobbies|contact|profile|about)\b/i,
    /^\s*(?:summary|objective|experience|employment|work history|projects|education|certifications|publications|awards|honors|interests|references|volunteer|volunteering|hobbies|contact|profile|about)\s*:?\s*$/i,
  ]
    .map((re) => re.source)
    .join('|'),
  'i'
);

function getSkillSection(text: string): string {
  const lines = text.split('\n');
  const captured: string[] = [];
  let capturing = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (capturing) {
      if (/^#{1,3}\s/.test(trimmed) || KNOWN_SECTION_HEADINGS.test(trimmed)) break;
      if (trimmed.length > 0) captured.push(trimmed);
      continue;
    }
    if (SECTION_HEADINGS.test(trimmed)) {
      capturing = true;
      const rest = trimmed.replace(SECTION_HEADINGS, '').trim();
      if (rest) captured.push(rest);
    }
  }

  return captured.join('\n');
}

function splitSkillTokens(text: string): string[] {
  if (!text) return [];
  return text
    .replace(/^[-*•·\u2022\s]+/gm, '')
    .split(/[\n,;|•·/]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function cleanSkillToken(raw: string): string | null {
  const t = raw.replace(/^[\s:\-*•·\u2022]+/, '').replace(/[\s.,;:]+$/, '');
  if (!t || t.length < 2) return null;
  if (STOP_WORDS.has(t.toLowerCase())) return null;
  if (/^\d+$/.test(t)) return null;
  if (!/[a-zA-Z]/.test(t)) return null;
  return t;
}

function canonicalForToken(token: string): string | null {
  const t = token.trim();
  if (!t) return null;
  for (const [re, canonical] of SKILL_KEYWORDS) {
    if (re.test(t)) return canonical;
  }
  return null;
}

export function extractSkillsFromText(text: string | null | undefined): string[] {
  if (!text || !text.trim()) return [];

  const allText = String(text);
  const skillsMap = new Map<string, string>();
  const addSkill = (name: string) => {
    if (!name) return;
    const key = name.toLowerCase();
    if (STOP_WORDS.has(key)) return;
    if (!skillsMap.has(key)) skillsMap.set(key, name);
  };

  const section = getSkillSection(allText);
  for (const token of splitSkillTokens(section)) {
    const clean = cleanSkillToken(token);
    if (!clean) continue;
    const canonical = canonicalForToken(clean);
    if (canonical) {
      addSkill(canonical);
    } else if (!/\s/.test(clean)) {
      addSkill(clean);
    }
  }

  for (const [re, canonical] of SKILL_KEYWORDS) {
    if (re.test(allText)) addSkill(canonical);
  }

  return Array.from(skillsMap.values()).slice(0, 30);
}

export function getResumeSkills(resume: any): string[] {
  if (!resume) return [];

  const combined = new Map<string, string>();
  const add = (name: string) => {
    if (!name) return;
    const key = name.toLowerCase();
    if (!combined.has(key)) combined.set(key, name);
  };

  const text = resume.optimizedText || resume.rawText || '';
  if (text) {
    for (const skill of extractSkillsFromText(text)) add(skill);
  }

  const jrp = resume.jobRolePotential;
  if (jrp?.skillsGap) {
    for (const g of jrp.skillsGap) {
      if (g?.skill) add(String(g.skill));
    }
  }
  if (jrp?.potentialRoles) {
    for (const role of jrp.potentialRoles) {
      for (const skill of role?.requiredSkills || []) {
        if (skill) add(String(skill));
      }
    }
  }

  if (Array.isArray(resume.strengths) && resume.strengths.length > 0) {
    for (const skill of extractSkillsFromText(resume.strengths.join(' '))) add(skill);
  }

  return Array.from(combined.values()).slice(0, 40);
}

export function getResumeSearchTerm(resume: any): string {
  const skills = getResumeSkills(resume);
  const roles = resume?.jobRolePotential?.potentialRoles || [];
  if (roles.length > 0) {
    const top = roles[0];
    const parts: string[] = [];
    if (top?.title) parts.push(String(top.title));
    parts.push(...skills.slice(0, 2));
    return parts.join(' ').trim();
  }
  if (skills.length > 0) return skills.slice(0, 3).join(' ');
  return 'software engineer developer';
}
