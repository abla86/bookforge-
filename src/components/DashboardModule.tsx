import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Copy,
  Trash2,
  ExternalLink,
  ChevronRight,
  Palette,
  Cpu,
  PenTool,
  Award,
  Users,
  Globe,
  Sliders,
  X,
  FileText
} from 'lucide-react';
import { Project, PlatformConfig, ContentType } from '../types';

interface DashboardModuleProps {
  config: PlatformConfig;
  projects: Project[];
  activeProject: Project;
  onSelectProject: (project: Project) => void;
  onCreateNewProject: () => void;
  onDuplicateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onNavigateToModule: (module: PlatformConfig['activeModule']) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  config,
  projects,
  activeProject,
  onSelectProject,
  onCreateNewProject,
  onDuplicateProject,
  onDeleteProject,
  onNavigateToModule
}) => {
  const brand = config.brandName || 'AETHERIS';

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'completed' | 'draft'>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'title' | 'wordCount' | 'progress' | 'createdAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Detail Modal State
  const [inspectedProject, setInspectedProject] = useState<Project | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Compute Portfolio Metrics
  const metrics = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter((p) => p.isCompleted || p.status === 'completed').length;
    const ongoing = total - completed;
    const totalWords = projects.reduce((sum, p) => {
      return sum + (p.chapters || []).reduce((cSum, c) => cSum + (c.wordCount || 0), 0);
    }, 0);
    const avgQuality = projects.reduce((sum, p) => {
      const scores = (p.chapters || []).map((c) => c.qualityScore || 0).filter((s) => s > 0);
      if (scores.length === 0) return sum;
      return sum + scores.reduce((a, b) => a + b, 0) / scores.length;
    }, 0) / (projects.length || 1);

    return { total, completed, ongoing, totalWords, avgQuality: Math.round(avgQuality) };
  }, [projects]);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // Status filter
        if (statusFilter === 'ongoing') {
          if (p.isCompleted || p.status === 'completed') return false;
        } else if (statusFilter === 'completed') {
          if (!p.isCompleted && p.status !== 'completed') return false;
        } else if (statusFilter === 'draft') {
          if (p.status !== 'draft' && p.status !== 'planning') return false;
        }

        // Content type filter
        if (contentTypeFilter !== 'all' && p.contentType !== contentTypeFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title?.toLowerCase().includes(q);
          const matchSub = p.subtitle?.toLowerCase().includes(q);
          const matchAuthor = p.author?.toLowerCase().includes(q);
          const matchGenre = p.intent?.genre?.toLowerCase().includes(q);
          const matchLogline = p.intent?.logline?.toLowerCase().includes(q);
          if (!matchTitle && !matchSub && !matchAuthor && !matchGenre && !matchLogline) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortBy === 'updatedAt') {
          valA = new Date(a.updatedAt || 0).getTime();
          valB = new Date(b.updatedAt || 0).getTime();
        } else if (sortBy === 'createdAt') {
          valA = new Date(a.createdAt || 0).getTime();
          valB = new Date(b.createdAt || 0).getTime();
        } else if (sortBy === 'title') {
          valA = (a.title || '').toLowerCase();
          valB = (b.title || '').toLowerCase();
        } else if (sortBy === 'wordCount') {
          valA = (a.chapters || []).reduce((sum, c) => sum + (c.wordCount || 0), 0);
          valB = (b.chapters || []).reduce((sum, c) => sum + (c.wordCount || 0), 0);
        } else if (sortBy === 'progress') {
          const totA = a.chapters?.length || 1;
          const compA = a.chapters?.filter((c) => c.status === 'completed').length || 0;
          valA = compA / totA;

          const totB = b.chapters?.length || 1;
          const compB = b.chapters?.filter((c) => c.status === 'completed').length || 0;
          valB = compB / totB;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [projects, statusFilter, contentTypeFilter, searchQuery, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleOpenInWrite = (p: Project) => {
    onSelectProject(p);
    onNavigateToModule('write');
  };

  const handleOpenInVisual = (p: Project) => {
    onSelectProject(p);
    onNavigateToModule('visual');
  };

  const handleOpenInForge = (p: Project) => {
    onSelectProject(p);
    onNavigateToModule('forge');
  };

  const handleOpenInPublish = (p: Project) => {
    onSelectProject(p);
    onNavigateToModule('publish');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-serif font-bold text-slate-100 tracking-wide">
              {brand} Creative Dashboard &amp; Portfolio
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track, orchestrate, and manage ongoing and completed creative productions from initial spark to publishable editions.
          </p>
        </div>

        <button
          type="button"
          id="btn-dashboard-create-new"
          onClick={onCreateNewProject}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Creative Project</span>
        </button>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Total Projects
          </span>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            {metrics.total}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            In active portfolio
          </span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4">
          <span className="text-[10px] font-mono text-amber-400/90 uppercase tracking-wider block">
            Ongoing Works
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {metrics.ongoing}
          </div>
          <span className="text-[10px] text-amber-400/60 mt-1 block">
            In production / drafting
          </span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4">
          <span className="text-[10px] font-mono text-emerald-400/90 uppercase tracking-wider block">
            Completed Editions
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {metrics.completed}
          </div>
          <span className="text-[10px] text-emerald-400/60 mt-1 block">
            Ready for publishing
          </span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Authored Words
          </span>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            {metrics.totalWords.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Verified continuous prose
          </span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Active Workspace
          </span>
          <div className="text-xs font-semibold text-amber-200 truncate mt-1">
            {activeProject?.title || 'No Project Active'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {activeProject?.chapters?.length || 0} chapters &bull; v{activeProject?.version || 1}
          </span>
        </div>
      </div>

      {/* 3. Search, Filter & Sort Controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-dashboard-search"
              placeholder="Search projects by title, premise, author, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/50 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 shrink-0">
            <button
              type="button"
              id="filter-status-all"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              type="button"
              id="filter-status-ongoing"
              onClick={() => setStatusFilter('ongoing')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                statusFilter === 'ongoing'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ongoing ({metrics.ongoing})
            </button>
            <button
              type="button"
              id="filter-status-completed"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                statusFilter === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Completed ({metrics.completed})
            </button>
            <button
              type="button"
              id="filter-status-draft"
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                statusFilter === 'draft'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Drafts
            </button>
          </div>
        </div>

        {/* Second Row: Content Type Filter & Sort Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
              <Filter className="w-3 h-3 text-amber-400" />
              Format:
            </span>
            <select
              id="select-dashboard-content-type"
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-amber-500/40"
            >
              <option value="all">All Content Formats</option>
              <option value="book">Books &amp; Novels</option>
              <option value="comic">Graphic Novels &amp; Comics</option>
              <option value="children_book">Children's Books</option>
              <option value="picture_book">Picture Books</option>
              <option value="magazine">Magazines &amp; Periodicals</option>
              <option value="screenplay">Screenplays</option>
              <option value="educational">Educational Guides</option>
              <option value="report">Analytic Reports</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
              <ArrowUpDown className="w-3 h-3 text-amber-400" />
              Sort By:
            </span>
            <select
              id="select-dashboard-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-amber-500/40"
            >
              <option value="updatedAt">Last Modified</option>
              <option value="title">Project Title (A-Z)</option>
              <option value="wordCount">Total Word Count</option>
              <option value="progress">Completion Progress</option>
              <option value="createdAt">Date Created</option>
            </select>

            <button
              type="button"
              id="btn-dashboard-toggle-sort"
              onClick={toggleSortOrder}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              <span className="font-mono text-[11px] font-bold">
                {sortOrder === 'desc' ? 'DESC' : 'ASC'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center space-y-4">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No Projects Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? `No projects matched your search for "${searchQuery}". Try refining your keywords.`
              : 'You have no projects in this filter category yet.'}
          </p>
          <button
            type="button"
            onClick={onCreateNewProject}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 inline-flex items-center gap-1.5 font-semibold mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isActive = project.id === activeProject?.id;
            const words = (project.chapters || []).reduce((sum, c) => sum + (c.wordCount || 0), 0);
            const totalChaps = project.chapters?.length || 0;
            const completedChaps = (project.chapters || []).filter((c) => c.status === 'completed').length;
            const progressPercent = totalChaps > 0 ? Math.round((completedChaps / totalChaps) * 100) : 0;
            const isCompleted = project.isCompleted || project.status === 'completed';

            return (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                className={`bg-slate-900/80 border rounded-2xl p-5 space-y-4 transition-all duration-200 flex flex-col justify-between hover:border-slate-700 ${
                  isActive
                    ? 'border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'border-slate-800'
                }`}
              >
                {/* Card Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800/90 text-amber-300 border border-amber-500/20 font-medium">
                      {project.contentType}
                    </span>

                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/90 border border-amber-500/20 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          In Production
                        </span>
                      )}

                      {isActive && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-serif font-bold text-slate-100 line-clamp-1 hover:text-amber-300 transition-colors cursor-pointer"
                      onClick={() => setInspectedProject(project)}
                    >
                      {project.title}
                    </h3>
                    {project.subtitle && (
                      <p className="text-xs text-slate-400 italic line-clamp-1 mt-0.5">
                        {project.subtitle}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      By {project.author || 'Anonymous'}
                    </p>
                  </div>

                  {/* Logline */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {project.intent?.logline || project.rawIdea}
                  </p>

                  {/* Genre badge */}
                  <div className="text-[10px] text-slate-400 font-mono bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80 truncate">
                    Genre: <span className="text-slate-200">{project.intent?.genre || 'Speculative'}</span>
                  </div>
                </div>

                {/* Progress & Chapter Breakdown */}
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Progress ({progressPercent}%)</span>
                      <span>
                        {completedChaps}/{totalChaps} Chaps &bull; {words.toLocaleString()} words
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-400'
                            : 'bg-gradient-to-r from-amber-500 to-amber-300'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Jump Buttons to Modules */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      type="button"
                      title="Open in Text & Bible Editor"
                      onClick={() => handleOpenInWrite(project)}
                      className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-200 text-[11px] font-mono flex items-center justify-center gap-1 transition-colors"
                    >
                      <PenTool className="w-3 h-3 text-amber-400" />
                      <span>Write</span>
                    </button>

                    <button
                      type="button"
                      title="Cover & Visual Assets Studio"
                      onClick={() => handleOpenInVisual(project)}
                      className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-200 text-[11px] font-mono flex items-center justify-center gap-1 transition-colors"
                    >
                      <Palette className="w-3 h-3 text-amber-400" />
                      <span>Cover</span>
                    </button>

                    <button
                      type="button"
                      title="Automated Production Engine"
                      onClick={() => handleOpenInForge(project)}
                      className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-200 text-[11px] font-mono flex items-center justify-center gap-1 transition-colors"
                    >
                      <Cpu className="w-3 h-3 text-amber-400" />
                      <span>Forge</span>
                    </button>

                    <button
                      type="button"
                      title="Publish to EPUB / PDF"
                      onClick={() => handleOpenInPublish(project)}
                      className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-200 text-[11px] font-mono flex items-center justify-center gap-1 transition-colors"
                    >
                      <BookOpen className="w-3 h-3 text-amber-400" />
                      <span>Publish</span>
                    </button>
                  </div>

                  {/* Main Action Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      type="button"
                      id={`btn-inspect-${project.id}`}
                      onClick={() => setInspectedProject(project)}
                      className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Details</span>
                    </button>

                    <button
                      type="button"
                      id={`btn-load-${project.id}`}
                      onClick={() => {
                        onSelectProject(project);
                        onNavigateToModule('write');
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <span>{isActive ? 'Current Work' : 'Load Workspace'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      title="Duplicate project"
                      onClick={() => onDuplicateProject(project)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      title="Delete project"
                      onClick={() => setDeleteConfirmId(project.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Project Deep Details Modal */}
      {inspectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                    {inspectedProject.contentType}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ID: {inspectedProject.id} &bull; v{inspectedProject.version}
                  </span>
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-100">
                  {inspectedProject.title}
                </h2>
                {inspectedProject.subtitle && (
                  <p className="text-xs text-slate-400 italic">
                    {inspectedProject.subtitle}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setInspectedProject(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 divide-y divide-slate-800/80">
              {/* Strategic Intent */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-100 uppercase tracking-wider text-[11px] font-mono text-amber-400">
                  Strategic Creative Intent
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px] font-mono block">Genre / Subgenre</span>
                    <span className="text-slate-200 font-medium">{inspectedProject.intent?.genre || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-mono block">Target Audience</span>
                    <span className="text-slate-200 font-medium">{inspectedProject.intent?.targetAudience || 'General'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-mono block">Tone &amp; Atmosphere</span>
                    <span className="text-slate-200 font-medium">{inspectedProject.intent?.tone || 'Balanced'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-mono block">Target Word Count</span>
                    <span className="text-slate-200 font-mono">{inspectedProject.intent?.targetWordCount?.toLocaleString() || 30000}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-mono block">Pacing</span>
                    <span className="text-slate-200 font-mono capitalize">{inspectedProject.intent?.pacing || 'measured'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-mono block">Language</span>
                    <span className="text-slate-200 font-medium">{inspectedProject.intent?.language || 'English'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] font-medium block mb-1">High-Concept Logline:</span>
                  <p className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 italic text-slate-200">
                    "{inspectedProject.intent?.logline || inspectedProject.rawIdea}"
                  </p>
                </div>
              </div>

              {/* Three-Act Work Plan */}
              {inspectedProject.plan?.threeActBreakdown && (
                <div className="pt-6 space-y-3">
                  <h4 className="font-semibold text-slate-100 uppercase tracking-wider text-[11px] font-mono text-amber-400">
                    Architectural 3-Act Structure
                  </h4>
                  <div className="space-y-2">
                    {inspectedProject.plan.threeActBreakdown.map((act, idx) => (
                      <div key={idx} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                        <div className="font-semibold text-slate-200 text-xs flex items-center justify-between">
                          <span>{act.act}</span>
                          <span className="text-[10px] text-amber-400 font-mono">Climax: {act.climaxEvent}</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{act.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapters Progress */}
              <div className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-100 uppercase tracking-wider text-[11px] font-mono text-amber-400">
                    Chapters &amp; Prose Status ({inspectedProject.chapters?.length || 0})
                  </h4>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {(inspectedProject.chapters || []).reduce((sum, c) => sum + (c.wordCount || 0), 0).toLocaleString()} Total Words
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(inspectedProject.chapters || []).map((ch) => (
                    <div
                      key={ch.id || ch.chapterNumber}
                      className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-400 font-bold">
                            Ch. {ch.chapterNumber}
                          </span>
                          <span className="font-semibold text-slate-200 truncate">
                            {ch.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            POV: {ch.povCharacter}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] truncate">
                          {ch.summary}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                        <span className="text-slate-300">{ch.wordCount || 0} words</span>
                        {ch.qualityScore ? (
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {ch.qualityScore}/100
                          </span>
                        ) : null}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            ch.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {ch.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Story Bible Highlights */}
              {inspectedProject.bible?.characters && (
                <div className="pt-6 space-y-3">
                  <h4 className="font-semibold text-slate-100 uppercase tracking-wider text-[11px] font-mono text-amber-400">
                    Story Bible Highlights
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Characters</span>
                      {inspectedProject.bible.characters.map((char) => (
                        <div key={char.id} className="text-xs">
                          <span className="font-semibold text-slate-200">{char.name}</span>
                          <span className="text-slate-400 font-mono text-[10px] ml-1">({char.role})</span>
                          <p className="text-slate-400 text-[11px] line-clamp-1">{char.coreMotivation}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Thematic Pillars</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                        {(inspectedProject.bible.thematicPillars || []).map((tp, idx) => (
                          <li key={idx}>{tp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-slate-500">
                Created: {new Date(inspectedProject.createdAt).toLocaleDateString()} &bull; Modified: {new Date(inspectedProject.updatedAt).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectedProject(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectProject(inspectedProject);
                    onNavigateToModule('write');
                    setInspectedProject(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow"
                >
                  <span>Open in Workspace</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-serif font-bold text-rose-400">
              Confirm Project Deletion
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this project? This will permanently remove the manuscript, story bible, chapters, and visual assets from your platform workspace.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProject(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
