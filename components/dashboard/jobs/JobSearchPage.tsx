'use client';

import { useState } from 'react';
import { useJobMatches } from '@/lib/hooks/useJobMatches';
import { Search, MapPin, Briefcase, DollarSign, Filter, X, ChevronDown, ExternalLink, Heart, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import Link from 'next/link';

export function JobSearchPage() {
  const { matches, searchQuery, setSearchQuery, filters, setFilters } = useJobMatches();
  const [showFilters, setShowFilters] = useState(false);

  const remoteTypes = ['remote', 'hybrid', 'onsite'];
  const experienceLevels = ['mid', 'senior', 'lead', 'staff', 'principal'];

  const clearFilters = () => {
    setFilters({
      location: '',
      remoteType: '',
      experienceLevel: '',
      minSalary: 0,
      maxSalary: 0,
      minMatchScore: 0,
    });
    setSearchQuery('');
  };

  const hasActiveFilters = searchQuery || filters.location || filters.remoteType || filters.experienceLevel || filters.minSalary > 0 || filters.maxSalary > 0 || filters.minMatchScore > 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Job Search</h1>
        <p className="text-slate-400 mt-1">Find your next opportunity with AI-powered matching</p>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, company, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors',
              showFilters ? 'bg-indigo-600 text-white' : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
            )}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Bangalore, Mumbai..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Work Type</label>
                <div className="flex flex-wrap gap-2">
                  {remoteTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilters({ ...filters, remoteType: filters.remoteType === type ? '' : type })}
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize',
                        filters.remoteType === type
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Experience Level</label>
                <div className="flex flex-wrap gap-2">
                  {experienceLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setFilters({ ...filters, experienceLevel: filters.experienceLevel === level ? '' : level })}
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize',
                        filters.experienceLevel === level
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Min Match Score</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minMatchScore}
                  onChange={(e) => setFilters({ ...filters, minMatchScore: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
                <div className="text-right text-sm text-slate-500">{filters.minMatchScore}%</div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-slate-400">
          <span className="font-semibold text-white">{matches.length}</span> jobs found
        </p>
        <div className="text-sm text-slate-500">
          Sorted by match score
        </div>
      </div>

      <div className="space-y-4">
        {matches.map((job) => (
          <JobSearchCard key={job.id} job={job} />
        ))}

        {matches.length === 0 && (
          <div className="text-center py-16 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
            <p className="text-slate-400 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function JobSearchCard({ job }: { job: any }) {
  const scoreColor = job.matchScore >= 80 ? 'text-emerald-400' : job.matchScore >= 60 ? 'text-amber-400' : 'text-slate-400';
  const scoreBg = job.matchScore >= 80 ? 'bg-emerald-500/20' : job.matchScore >= 60 ? 'bg-amber-500/20' : 'bg-slate-500/20';

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/dashboard/jobs/${job.id}`} className="text-xl font-semibold text-white hover:text-indigo-400 transition-colors">
              {job.title}
            </Link>
            <span className={cn('px-2 py-0.5 text-xs font-semibold rounded-full', scoreBg, scoreColor)}>
              {job.matchScore}% Match
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-4">
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              {job.company}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax / 100000).toFixed(1)}L
            </span>
            <span className="px-2 py-0.5 text-xs bg-slate-800 rounded-full capitalize">{job.remoteType}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.matchedSkills.slice(0, 4).map((skill: string) => (
              <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-lg">
                {skill}
              </span>
            ))}
            {job.missingSkills.slice(0, 2).map((skill: string) => (
              <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-rose-500/10 text-rose-400 rounded-lg">
                + {skill}
              </span>
            ))}
            {job.matchedSkills.length > 4 && (
              <span className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-slate-400 rounded-lg">
                +{job.matchedSkills.length - 4} more
              </span>
            )}
          </div>

          <p className="text-sm text-slate-500 line-clamp-2">{job.matchReasoning}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Link
            href={`/dashboard/jobs/${job.id}`}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors">
            <Heart className={cn('w-5 h-5', job.isSaved && 'fill-rose-400 text-rose-400')} />
          </button>
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}