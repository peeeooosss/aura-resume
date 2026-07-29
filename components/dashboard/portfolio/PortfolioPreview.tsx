// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  Calendar,
  Building2,
  GraduationCap,
  Award,
  Quote,
  ChevronLeft,
  ChevronRight,
  Code,
  Briefcase,
  FolderGit2,
  Star,
} from 'lucide-react';

interface PortfolioData {
  name: string;
  headline: string;
  avatar: string;
  location: string;
  about: string;
  skills: Array<{
    category: string;
    items: string[];
  }>;
  experience: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
    highlights: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    image: string;
    tags: string[];
    liveUrl: string;
    githubUrl: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    period: string;
    description: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    url: string;
  }>;
  testimonials: Array<{
    name: string;
    role: string;
    content: string;
    avatar: string;
    rating: number;
  }>;
  contact: {
    email: string;
    phone: string;
    social: {
      github: string;
      linkedin: string;
      twitter: string;
      website: string;
    };
  };
  template: string;
  primaryColor: string;
  font: string;
}

export function PortfolioPreview({ slug }: { slug: string }) {
  const { portfolios } = usePortfolio();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portfolio: any = portfolios.find(p => p.slug === slug) || null;

  useEffect(() => {
    if (portfolio?.testimonials && portfolio.testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) =>
          prev === portfolio.testimonials.length - 1 ? 0 : prev + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [portfolio]);

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const primaryColor = portfolio.theme?.primaryColor || '#6366f1';
  const fontFamily =
    portfolio.theme?.font === 'poppins'
      ? "'Poppins', sans-serif"
      : portfolio.theme?.font === 'roboto'
      ? "'Roboto', sans-serif"
      : portfolio.theme?.font === 'montserrat'
      ? "'Montserrat', sans-serif"
      : "'Inter', sans-serif";

  return (
    <div
      className="min-h-screen bg-slate-950 text-surface-900 dark:text-white"
      style={{ fontFamily }}
    >
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-surface-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-semibold text-lg" style={{ color: primaryColor }}>
            {portfolio.name}
          </div>
          <div className="flex items-center gap-6">
            {portfolio.contact?.social?.github && (
              <a
                href={portfolio.contact.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {portfolio.contact?.social?.linkedin && (
              <a
                href={portfolio.contact.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {portfolio.contact?.social?.twitter && (
              <a
                href={portfolio.contact.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            <a
              href={`mailto:${portfolio.contact?.email}`}
              className="px-4 py-2 rounded-xl text-surface-900 dark:text-white text-sm font-medium transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            {portfolio.avatar && (
              <img
                src={portfolio.avatar}
                alt={portfolio.name}
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4"
                style={{ borderColor: primaryColor }}
              />
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {portfolio.name}
            </h1>
            <p className="text-xl text-surface-500 dark:text-slate-400 mb-4">{portfolio.headline}</p>
            {portfolio.location && (
              <div className="flex items-center justify-center gap-2 text-surface-400 dark:text-slate-500">
                <MapPin className="w-4 h-4" />
                <span>{portfolio.location}</span>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 px-6 bg-surface-100 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: primaryColor }}
            >
              About
            </h2>
            <p className="text-surface-600 dark:text-slate-300 leading-relaxed text-lg">
              {portfolio.about}
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-2xl font-bold mb-6 flex items-center gap-2"
              style={{ color: primaryColor }}
            >
              <Code className="w-6 h-6" />
              Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.skills?.map((group, index) => (
                <div
                  key={index}
                  className="bg-surface-100 dark:bg-slate-900/50 rounded-2xl p-5 border border-surface-200 dark:border-slate-800"
                >
                  <h3 className="font-semibold text-surface-900 dark:text-white mb-3">
                    {group.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg text-sm"
                        style={{
                          backgroundColor: `${primaryColor}20`,
                          color: primaryColor,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-surface-100 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-2xl font-bold mb-6 flex items-center gap-2"
              style={{ color: primaryColor }}
            >
              <Briefcase className="w-6 h-6" />
              Experience
            </h2>
            <div className="relative">
              <div
                className="absolute left-4 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: `${primaryColor}30` }}
              />
              <div className="space-y-8">
                {portfolio.experience?.map((exp, index) => (
                  <div key={index} className="relative pl-12">
                    <div
                      className="absolute left-2.5 w-3 h-3 rounded-full border-2 bg-slate-950"
                      style={{ borderColor: primaryColor }}
                    />
                    <div className="bg-surface-100 dark:bg-slate-900/50 rounded-2xl p-5 border border-surface-200 dark:border-slate-800">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-surface-900 dark:text-white text-lg">
                            {exp.title}
                          </h3>
                          <div className="flex items-center gap-2 text-surface-500 dark:text-slate-400">
                            <Building2 className="w-4 h-4" />
                            <span>{exp.company}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-surface-400 dark:text-slate-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{exp.period}</span>
                        </div>
                      </div>
                      <p className="text-surface-600 dark:text-slate-300 mt-3">{exp.description}</p>
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {exp.highlights.map((highlight, i) => (
                            <li
                              key={i}
                              className="text-sm text-surface-500 dark:text-slate-400 flex items-start gap-2"
                            >
                              <span
                                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: primaryColor }}
                              />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-2xl font-bold mb-6 flex items-center gap-2"
              style={{ color: primaryColor }}
            >
              <FolderGit2 className="w-6 h-6" />
              Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.projects?.map((project, index) => (
                <div
                  key={index}
                  className="bg-surface-100 dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-slate-800 overflow-hidden group hover:border-surface-300 dark:border-slate-700 transition-colors"
                >
                  {project.image && (
                    <div className="h-40 bg-surface-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-surface-900 dark:text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-surface-500 dark:text-slate-400 mb-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags?.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: `${primaryColor}20`,
                            color: primaryColor,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Live
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:text-white transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {(portfolio.education?.length > 0 ||
          portfolio.certifications?.length > 0) && (
          <section className="py-16 px-6 bg-surface-100 dark:bg-slate-900/50">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {portfolio.education?.length > 0 && (
                  <div>
                    <h2
                      className="text-2xl font-bold mb-6 flex items-center gap-2"
                      style={{ color: primaryColor }}
                    >
                      <GraduationCap className="w-6 h-6" />
                      Education
                    </h2>
                    <div className="space-y-4">
                      {portfolio.education.map((edu, index) => (
                        <div
                          key={index}
                          className="bg-surface-100 dark:bg-slate-800/50 rounded-xl p-4 border border-surface-300 dark:border-slate-700"
                        >
                          <h3 className="font-semibold text-surface-900 dark:text-white">
                            {edu.degree}
                          </h3>
                          <p className="text-surface-500 dark:text-slate-400">{edu.school}</p>
                          <p className="text-sm text-surface-400 dark:text-slate-500 mt-1">
                            {edu.period}
                          </p>
                          {edu.description && (
                            <p className="text-sm text-surface-500 dark:text-slate-400 mt-2">
                              {edu.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {portfolio.certifications?.length > 0 && (
                  <div>
                    <h2
                      className="text-2xl font-bold mb-6 flex items-center gap-2"
                      style={{ color: primaryColor }}
                    >
                      <Award className="w-6 h-6" />
                      Certifications
                    </h2>
                    <div className="space-y-4">
                      {portfolio.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className="bg-surface-100 dark:bg-slate-800/50 rounded-xl p-4 border border-surface-300 dark:border-slate-700"
                        >
                          <h3 className="font-semibold text-surface-900 dark:text-white">
                            {cert.name}
                          </h3>
                          <p className="text-surface-500 dark:text-slate-400">{cert.issuer}</p>
                          <p className="text-sm text-surface-400 dark:text-slate-500 mt-1">
                            {cert.date}
                          </p>
                          {cert.url && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm mt-2 hover:underline"
                              style={{ color: primaryColor }}
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {portfolio.testimonials?.length > 0 && (
          <section className="py-16 px-6">
            <div className="max-w-4xl mx-auto">
              <h2
                className="text-2xl font-bold mb-6 flex items-center gap-2"
                style={{ color: primaryColor }}
              >
                <Quote className="w-6 h-6" />
                Testimonials
              </h2>
              <div className="relative bg-surface-100 dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-slate-800 p-8">
                <Quote
                  className="w-10 h-10 mb-4 opacity-30"
                  style={{ color: primaryColor }}
                />
                <p className="text-lg text-surface-600 dark:text-slate-300 mb-6 leading-relaxed">
                  "{portfolio.testimonials[currentTestimonial].content}"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {portfolio.testimonials[currentTestimonial].avatar && (
                      <img
                        src={portfolio.testimonials[currentTestimonial].avatar}
                        alt={portfolio.testimonials[currentTestimonial].name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-surface-900 dark:text-white">
                        {portfolio.testimonials[currentTestimonial].name}
                      </div>
                      <div className="text-sm text-surface-500 dark:text-slate-400">
                        {portfolio.testimonials[currentTestimonial].role}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4"
                        style={{
                          color:
                            i < portfolio.testimonials[currentTestimonial].rating
                              ? primaryColor
                              : '#475569',
                          fill:
                            i < portfolio.testimonials[currentTestimonial].rating
                              ? primaryColor
                              : 'transparent',
                        }}
                      />
                    ))}
                  </div>
                </div>
                {portfolio.testimonials.length > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                      onClick={() =>
                        setCurrentTestimonial((prev) =>
                          prev === 0
                            ? portfolio.testimonials.length - 1
                            : prev - 1
                        )
                      }
                      className="p-2 rounded-full bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex gap-2">
                      {portfolio.testimonials.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentTestimonial(i)}
                          className="w-2 h-2 rounded-full transition-colors"
                          style={{
                            backgroundColor:
                              i === currentTestimonial ? primaryColor : '#475569',
                          }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentTestimonial((prev) =>
                          prev === portfolio.testimonials.length - 1
                            ? 0
                            : prev + 1
                        )
                      }
                      className="p-2 rounded-full bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="py-16 px-6 bg-surface-100 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: primaryColor }}
            >
              Get in Touch
            </h2>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {portfolio.contact?.email && (
                <a
                  href={`mailto:${portfolio.contact.email}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </a>
              )}
              {portfolio.contact?.phone && (
                <a
                  href={`tel:${portfolio.contact.phone}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>Phone</span>
                </a>
              )}
              {portfolio.contact?.social?.website && (
                <a
                  href={portfolio.contact.social.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  <span>Website</span>
                </a>
              )}
            </div>
            <div className="flex justify-center gap-4">
              {portfolio.contact?.social?.github && (
                <a
                  href={portfolio.contact.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <Github className="w-6 h-6" />
                </a>
              )}
              {portfolio.contact?.social?.linkedin && (
                <a
                  href={portfolio.contact.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {portfolio.contact?.social?.twitter && (
                <a
                  href={portfolio.contact.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <Twitter className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        </section>

        <footer className="py-8 px-6 border-t border-surface-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto text-center text-sm text-surface-400 dark:text-slate-500">
            Built with Aura Resume
          </div>
        </footer>
      </main>
    </div>
  );
}
