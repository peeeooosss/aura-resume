import {
  LayoutDashboard, FileText, Target, Search, Map, Globe,
  Settings, Mail, Mic, Shield, Zap, Sparkles, Users, Award,
  Wrench, FilePen, FileSearch,
} from 'lucide-react';

export const NAV_ITEMS = [
  {
    title: 'Core',
    items: [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, plan: 'free' as const, badge: null },
      { href: '/dashboard/resumes', label: 'My Resumes', icon: FileText, plan: 'free' as const, badge: null },
      { href: '/dashboard/fixer', label: 'Resume Fixer', icon: Wrench, plan: 'free' as const, badge: null },
      { href: '/dashboard/templates', label: 'Cover Letters', icon: FilePen, plan: 'pro' as const, badge: null },
    ],
  },
  {
    title: 'Job Search',
    items: [
      { href: '/dashboard/jobs', label: 'Job Browser', icon: Search, plan: 'free' as const, badge: null },
      { href: '/dashboard/jobs/matches', label: 'Job Matches', icon: Target, plan: 'pro' as const, badge: null },
      { href: '/dashboard/jobs/compare', label: 'Resume vs Job', icon: FileSearch, plan: 'pro' as const, badge: null },
    ],
  },
  {
    title: 'Career Growth',
    items: [
      { href: '/dashboard/roadmap', label: '90-Day Roadmap', icon: Map, plan: 'pro' as const, badge: null },
      { href: '/dashboard/portfolio', label: 'Portfolio', icon: Globe, plan: 'vip' as const, badge: null },
    ],
  },
  {
    title: 'VIP Features',
    items: [
      { href: '/dashboard/emails', label: 'Cold Emails', icon: Mail, plan: 'vip' as const, badge: null },
      { href: '/dashboard/interviews', label: 'AI Interviews', icon: Mic, plan: 'vip' as const, badge: 'New' as const },
    ],
  },
  {
    title: 'Account',
    items: [
      { href: '/dashboard/settings', label: 'Settings', icon: Settings, plan: 'free' as const, badge: null },
    ],
  },
] as const;