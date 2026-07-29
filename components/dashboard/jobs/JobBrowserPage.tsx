'use client';

import { useState, useEffect } from 'react';
import { useJobMatches } from '@/lib/hooks/useJobMatches';
import { Search, MapPin, Briefcase, ExternalLink, Heart, ArrowRight, Loader2, AlertCircle, Filter, X, IndianRupee, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import Link from 'next/link';

const CATEGORIES = [
  { label: 'All', terms: 'software engineer developer' },
  { label: 'Software Engineering', terms: 'software engineer developer' },
  { label: 'Data Science', terms: 'data scientist machine learning analyst' },
  { label: 'Digital Marketing', terms: 'digital marketing seo sem marketing' },
  { label: 'Sales', terms: 'sales business development executive' },
  { label: 'Design', terms: 'ui ux designer graphic designer' },
  { label: 'Product', terms: 'product manager scrum agile' },
  { label: 'Finance', terms: 'finance accountant financial analyst' },
  { label: 'HR', terms: 'human resources recruitment hr manager' },
  { label: 'Writing', terms: 'content writer copywriter journalist' },
  { label: 'Customer Support', terms: 'customer support service representative' },
];

const REMOTE_TYPES = ['remote', 'hybrid', 'onsite'];
const EXPERIENCE_LEVELS = ['mid', 'senior', 'lead', 'staff', 'principal'];

export function JobBrowserPage() {
  const { matches, allMatches, searchQuery, setSearchQuery, filters, setFilters, isLoading, loadingSources, error, searchRealJobs } = useJobMatches();
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!hasLoaded) {
      searchRealJobs('software engineer', 'India');
      setHasLoaded(true);
    }
  }, [hasLoaded, searchRealJobs]);

  const handleSearch = () => {
    setActiveCategory('All');
    setSearchQuery(searchInput);
    searchRealJobs(searchInput || 'software engineer', filters.location || 'India');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCategoryClick = (label: string, terms: string) => {
    setActiveCategory(label);
    setSearchInput('');
    setSearchQuery('');
    searchRealJobs(terms, filters.location || 'India');
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      remoteType: '',
      experienceLevel: '',
      minSalary: 0,
      maxSalary: 0,
      minMatchScore: 0,
    });
    setSearchInput('');
    setSearchQuery('');
    setActiveCategory('All');
    searchRealJobs('software engineer', 'India');
  };

  const hasActiveFilters = searchQuery || filters.location || filters.remoteType || filters.experienceLevel || filters.minSalary > 0 || filters.maxSalary > 0 || filters.minMatchScore > 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Job Browser</h1>
        <p className="text-surface-500 dark:text-slate-400 mt-1">Browse & search real jobs from LinkedIn, Indeed & more</p>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => handleCategoryClick(cat.label, cat.terms)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeCategory === cat.label
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-slate-900/80 border border-surface-200 dark:border-slate-800 text-surface-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-400'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search Bar + Filters */}
      <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, company, or keyword..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-3 bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors',
              showFilters ? 'bg-indigo-600 text-white' : 'bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 text-surface-600 dark:text-slate-300 hover:text-white hover:border-slate-600'
            )}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-surface-200 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-500 dark:text-slate-400 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Bangalore, Mumbai..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-100 dark:bg-slate-800/50 border border-surface-300 dark:border-slate-700 rounded-xl text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-500 dark:text-slate-400 mb-2">Work Type</label>
                <div className="flex flex-wrap gap-2">
                  {REMOTE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilters({ ...filters, remoteType: filters.remoteType === type ? '' : type })}
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize',
                        filters.remoteType === type
                          ? 'bg-indigo-600 text-white'
                          : 'bg-surface-100 dark:bg-slate-800/50 text-surface-500 dark:text-slate-400 hover:text-white hover:bg-surface-200 dark:hover:bg-slate-800'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-500 dark:text-slate-400 mb-2">Experience Level</label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => setFilters({ ...filters, experienceLevel: filters.experienceLevel === level ? '' : level })}
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize',
                        filters.experienceLevel === level
                          ? 'bg-indigo-600 text-white'
                          : 'bg-surface-100 dark:bg-slate-800/50 text-surface-500 dark:text-slate-400 hover:text-white hover:bg-surface-200 dark:hover:bg-slate-800'
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-500 dark:text-slate-400 mb-2">Min Match Score</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minMatchScore}
                  onChange={(e) => setFilters({ ...filters, minMatchScore: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
                <div className="text-right text-sm text-surface-400 dark:text-slate-500">{filters.minMatchScore}%</div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-surface-500 dark:text-slate-400 hover:text-surface-900 dark:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-surface-500 dark:text-slate-400">
          <span className="font-semibold text-surface-900 dark:text-white">{allMatches.length}</span> jobs found
        </p>
        <div className="flex items-center gap-2 text-sm text-surface-400 dark:text-slate-500">
          {!isLoading && allMatches.length > 0 && (
            <span className="text-emerald-400">✓ All sources loaded</span>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center mb-6">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <p className="text-rose-300 font-medium">{error}</p>
          <button
            onClick={() => searchRealJobs('software engineer', 'India')}
            className="mt-3 px-4 py-2 bg-rose-500/20 text-rose-300 rounded-xl text-sm hover:bg-rose-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && allMatches.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="text-surface-900 dark:text-white font-medium">Searching job boards...</p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {['indeed', 'linkedin'].map(src => (
                <span
                  key={src}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                    loadingSources.includes(src)
                      ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-400'
                  )}
                >
                  {loadingSources.includes(src) ? '⏳' : '✓'} {src.charAt(0).toUpperCase() + src.slice(1)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress bar while loading + results showing */}
      {isLoading && allMatches.length > 0 && (
        <div className="mb-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
          <p className="text-sm text-indigo-300">
            {allMatches.length} jobs loaded · Still searching {loadingSources.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && allMatches.length === 0 && (
        <div className="bg-white border border-surface-200 dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-surface-900 dark:text-white text-lg font-medium mb-2">No jobs found</p>
          <p className="text-surface-500 dark:text-slate-400">Try a different category, search term, or adjust your filters.</p>
        </div>
      )}

      {/* Job Cards */}
      {allMatches.length > 0 && (
        <div className="space-y-4">
          {matches.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}

          {matches.length === 0 && !isLoading && (
            <div className="text-center py-16 bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-3xl">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">No jobs match your filters</h3>
              <p className="text-surface-500 dark:text-slate-400 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-surface-900 dark:text-white rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JobCard({ job }: { job: any }) {
  const scoreColor = job.matchScore >= 80 ? 'text-emerald-400' : job.matchScore >= 60 ? 'text-amber-400' : 'text-surface-500 dark:text-slate-400';
  const scoreBg = job.matchScore >= 80 ? 'bg-emerald-500/20' : job.matchScore >= 60 ? 'bg-amber-500/20' : 'bg-slate-500/20';

  return (
    <div className="bg-white border border-surface-200 shadow-sm dark:bg-slate-900/80 dark:border-surface-200 dark:border-slate-800 rounded-2xl p-6 hover:border-surface-300 dark:border-slate-700 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/dashboard/jobs/${job.id}`} className="text-xl font-semibold text-surface-900 dark:text-white hover:text-indigo-400 transition-colors">
              {job.title}
            </Link>
            <span className={cn('px-2 py-0.5 text-xs font-semibold rounded-full', scoreBg, scoreColor)}>
              {job.matchScore}% Match
            </span>
            <span className="px-2 py-0.5 text-xs font-medium bg-surface-100 dark:bg-slate-800 text-surface-500 dark:text-slate-400 rounded-full flex-shrink-0">
              {job.source}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-surface-500 dark:text-slate-400 mb-4">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              {job.company}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            {(job.salaryMin || job.salaryMax) && (
              <span className="flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4" />
                {job.salaryMin && job.salaryMax
                  ? `₹${(job.salaryMin / 100000).toFixed(1)}L - ₹${(job.salaryMax / 100000).toFixed(1)}L`
                  : job.salaryMin
                  ? `₹${(job.salaryMin / 100000).toFixed(1)}L+`
                  : `Up to ₹${(job.salaryMax / 100000).toFixed(1)}L`}
              </span>
            )}
            {job.remoteType && (
              <span className="px-2 py-0.5 text-xs bg-surface-100 dark:bg-slate-800 rounded-full capitalize">{job.remoteType}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {job.matchedSkills.slice(0, 5).map((skill: string) => (
              <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-lg">
                {skill}
              </span>
            ))}
            {job.missingSkills.slice(0, 3).map((skill: string) => (
              <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-rose-500/10 text-rose-400 rounded-lg">
                + {skill}
              </span>
            ))}
            {job.matchedSkills.length > 5 && (
              <span className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-surface-500 dark:text-slate-400 rounded-lg">
                +{job.matchedSkills.length - 5} more
              </span>
            )}
          </div>

          {job.matchReasoning && (
            <p className="text-sm text-surface-400 dark:text-slate-500 line-clamp-2">{job.matchReasoning}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <Link
            href={`/dashboard/jobs/${job.id}`}
            className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-500 hover:text-surface-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-surface-500 dark:text-slate-400 hover:text-rose-400 transition-colors">
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
