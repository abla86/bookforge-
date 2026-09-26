import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  PenTool,
  Palette,
  Cpu,
  BookOpen,
  FolderOpen,
  Sliders,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PlatformConfig, Project, UserProfile } from '../types';

interface HeaderProps {
  config: PlatformConfig;
  activeProject: Project;
  currentUser: UserProfile | null;
  onSelectModule: (module: PlatformConfig['activeModule']) => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  activeProject,
  currentUser,
  onSelectModule,
  onOpenProfile,
  onOpenAuth
}) => {
  const brand = config.brandName || 'VELORA';

  const modules: { id: PlatformConfig['activeModule']; label: string; sub: string; icon: any }[] = [
    { id: 'dashboard', label: `${brand} Dashboard`, sub: 'Oversikt & Prosjekter', icon: LayoutDashboard },
    { id: 'create', label: `${brand} Create`, sub: 'Idé → Prosjekt', icon: Sparkles },
    { id: 'write', label: `${brand} Write`, sub: 'Tekst & Bible', icon: PenTool },
    { id: 'visual', label: `${brand} Visual`, sub: 'Cover & Art', icon: Palette },
    { id: 'forge', label: `${brand} Forge`, sub: 'Orkestrator', icon: Cpu },
    { id: 'publish', label: `${brand} Publish`, sub: 'EPUB & PDF', icon: BookOpen },
    { id: 'library', label: `${brand} Library`, sub: 'Verk & Assets', icon: FolderOpen },
    { id: 'control', label: `${brand} Control`, sub: 'AI & Brand', icon: Sliders }
  ];

  const totalWords = (activeProject?.chapters || []).reduce((acc, c) => acc + (c.wordCount || 0), 0);
  const completedChaps = (activeProject?.chapters || []).filter((c) => c.status === 'completed').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <div
            className="flex items-center gap-3 shrink-0 cursor-pointer"
            onClick={() => onSelectModule('dashboard')}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-serif font-black text-lg shadow-lg shadow-amber-500/20">
              {brand.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold tracking-widest text-slate-100 text-lg uppercase">
                  {brand}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Platform
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                AI Creative Production &amp; Publishing
              </p>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {modules.map((m) => {
              const Icon = m.icon;
              const isActive = config.activeModule === m.id;
              return (
                <button
                  key={m.id}
                  id={`nav-tab-${m.id}`}
                  onClick={() => onSelectModule(m.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <span className="block leading-none">{m.label}</span>
                    <span className="text-[9px] opacity-70 block leading-tight font-mono">{m.sub}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Project Status, AI Indicator & User Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {activeProject && (
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-medium text-slate-200 truncate max-w-[140px]">
                  {activeProject.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {totalWords.toLocaleString()}w &bull; {completedChaps}/{activeProject.chapters?.length || 0} ch
                </span>
              </div>
            )}

            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
              title="100% Kostnadsfri drift: Ingen eksterne kostnader, ingen API-gebyr"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>0 kr &bull; Kostnadsfri</span>
            </div>

            {/* Creator Profile Button */}
            {currentUser ? (
              <button
                type="button"
                id="btn-header-profile"
                onClick={onOpenProfile}
                title="Manage Creator Profile & Preferences"
                className="flex items-center gap-2 p-1 pl-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl transition-all"
              >
                <div className="text-left hidden md:block">
                  <span className="text-xs font-semibold text-slate-200 block leading-tight truncate max-w-[110px]">
                    {currentUser.penName || currentUser.name}
                  </span>
                  <span className="text-[9px] font-mono text-amber-400 uppercase leading-none block">
                    {currentUser.role}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-serif font-bold text-xs">
                  {currentUser.name?.charAt(0) || 'A'}
                </div>
              </button>
            ) : (
              <button
                type="button"
                id="btn-header-signin"
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors shadow"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
