export const MOCK_ROADMAPS = [
  {
    id: 'roadmap_1',
    userId: 'user_1',
    resumeId: 'res_1',
    targetRole: 'Staff Frontend Engineer',
    targetCompany: 'Swiggy / Zepto / Blinkit',
    startDate: '2024-01-22',
    endDate: '2024-04-21',
    overview: 'Bridge the gap from Senior to Staff by mastering system design, technical leadership, and platform thinking. Focus on 3 pillars: Architecture Depth, Leadership Visibility, and Strategic Impact.',
    milestones: [
      { week: 1, theme: 'Foundation & Audit', focus: ['Skill gap analysis', 'Portfolio refresh', 'LinkedIn optimization'], deliverables: ['Updated resume', 'Project case studies', 'Target company list'] },
      { week: 2, theme: 'System Design Mastery', focus: ['Scalability patterns', 'Caching strategies', 'Database sharding', 'CDN optimization'], deliverables: ['2 system design docs', 'Architecture decision records'] },
      { week: 3, theme: 'System Design Mastery', focus: ['Message queues', 'Event-driven architecture', 'Distributed tracing', 'Rate limiting'], deliverables: ['Kafka/RabbitMQ deep dive', 'System design review'] },
      { week: 4, theme: 'Technical Leadership', focus: ['RFC writing', 'Code review excellence', 'Mentoring frameworks', 'Technical interviews'], deliverables: ['3 RFCs written', 'Mentoring plan doc'] },
      { week: 5, theme: 'Technical Leadership', focus: ['Team dynamics', 'Conflict resolution', 'Project planning', 'Stakeholder management'], deliverables: ['Team health assessment', 'Quarterly planning doc'] },
      { week: 6, theme: 'Platform Thinking', focus: ['Platform vs product', 'Developer experience', 'Internal tooling', 'Infrastructure as code'], deliverables: ['Platform strategy doc', 'DX audit'] },
      { week: 7, theme: 'Platform Thinking', focus: ['CI/CD optimization', 'Testing strategy', 'Release management', 'Observability'], deliverables: ['Pipeline improvements', 'SLO/SLI definitions'] },
      { week: 8, theme: 'Strategic Impact', focus: ['Business alignment', 'OKR setting', 'Cross-functional influence', 'Executive communication'], deliverables: ['Quarterly OKRs', 'Exec presentation'] },
      { week: 9, theme: 'Strategic Impact', focus: ['Innovation time', 'R&D projects', 'Tech debt prioritization', 'Migration strategies'], deliverables: ['Innovation proposal', 'Tech debt registry'] },
      { week: 10, theme: 'Domain Expertise', focus: ['Fintech/Quick-commerce', 'Real-time systems', 'Payment flows', 'Compliance'], deliverables: ['Domain deep-dive doc', 'Competitive analysis'] },
      { week: 11, theme: 'Interview Preparation', focus: ['System design interviews', 'Behavioral stories', 'Leadership examples', 'Negotiation prep'], deliverables: ['5 mock interviews', 'Story bank (15+)'] },
      { week: 12, theme: 'Interview Preparation', focus: ['Coding refresher', 'Architecture presentations', 'Take-home projects', 'Reference prep'], deliverables: ['Portfolio polished', 'References briefed'] },
      { week: 13, theme: 'Application Sprint', focus: ['Targeted applications', 'Referral outreach', 'Recruiter conversations', 'Offer evaluation'], deliverables: ['10+ applications', 'Offer comparison framework'] },
    ],
    dailyTasks: Array.from({ length: 90 }, (_, i) => {
      const day = i + 1;
      const week = Math.ceil(day / 7);
      const baseTasks = [
        { type: 'LEARN' as const, duration: 90 },
        { type: 'BUILD' as const, duration: 120 },
        { type: 'NETWORK' as const, duration: 30 },
      ];
      return {
        day,
        date: new Date(2024, 0, 22 + i).toISOString().split('T')[0],
        tasks: baseTasks.map((t, idx) => ({
          id: `t${day}_${idx}`,
          type: t.type,
          title: getTaskTitle(day, week, t.type),
          duration: t.duration,
          completed: day <= 18 && idx < 2,
          affiliateLinks: idx === 1 && day % 5 === 0 ? [
            { platform: 'udemy', url: 'https://udemy.com/course/system-design', title: 'System Design Masterclass', commission: 0.15 },
            { platform: 'coursera', url: 'https://coursera.org/learn/distributed-systems', title: 'Distributed Systems', commission: 0.10 },
          ] : [],
        })),
      };
    }),
    progress: 20,
    completedTasks: 42,
    totalTasks: 270,
    isActive: true,
    createdAt: '2024-01-22T08:00:00Z',
    updatedAt: '2024-01-25T14:30:00Z',
  },
];

function getTaskTitle(day: number, week: number, type: 'LEARN' | 'BUILD' | 'NETWORK'): string {
  const themes: Record<number, string[]> = {
    1: ['Read "Staff Engineer" Ch 1-2', 'Audit current resume vs Staff rubric', 'Connect with 2 Staff Engineers'],
    2: ['Study "DDIA" Ch 1-3', 'Design URL shortener system', 'Review caching patterns'],
    3: ['Deep dive Kafka architecture', 'Design event-driven order system', 'Practice distributed tracing'],
    4: ['Write RFC for component library v2', 'Conduct 3 code reviews', 'Schedule mentoring sessions'],
    5: ['Read "Five Dysfunctions of a Team"', 'Map stakeholder influence', 'Plan Q2 roadmap'],
    6: ['Study Internal Developer Platforms', 'Audit current DX pain points', 'Design CLI tool concept'],
    7: ['Optimize CI pipeline (target <10min)', 'Define testing pyramid', 'Set up SLO dashboards'],
    8: ['Draft Q2 OKRs with business metrics', 'Prepare exec update deck', 'Practice executive summary'],
    9: ['Allocate 20% innovation time', 'Prototype AI code review bot', 'Catalog top 20 tech debt items'],
    10: ['Study payment processing flows', 'Analyze Swiggy/Zepto architecture', 'Review RBI compliance basics'],
    11: ['Mock system design: Design Instagram', 'Mock behavioral: Conflict resolution', 'Record STAR stories'],
    12: ['LeetCode: 3 medium (systems focus)', 'Prepare architecture talk slides', 'Brief 3 references'],
    13: ['Apply to 5 target companies', 'Request 5 referrals', 'Build offer comparison spreadsheet'],
  };
  const theme = themes[week] || ['Review weekly goals', 'Complete pending tasks', 'Plan next week'];
  const taskMap: Record<string, string> = {
    LEARN: theme[0],
    BUILD: theme[1],
    NETWORK: theme[2],
  };
  return taskMap[type] || `${type} task for week ${week}`;
}

export const ROADMAP_TASK_TYPES = {
  LEARN: { label: 'Learn', color: 'text-blue-400', bgColor: 'bg-blue-500/10', icon: '📚' },
  BUILD: { label: 'Build', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', icon: '🛠️' },
  NETWORK: { label: 'Network', color: 'text-purple-400', bgColor: 'bg-purple-500/10', icon: '🤝' },
  APPLY: { label: 'Apply', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', icon: '📝' },
  INTERVIEW_PREP: { label: 'Interview Prep', color: 'text-amber-400', bgColor: 'bg-amber-500/10', icon: '🎯' },
} as const;