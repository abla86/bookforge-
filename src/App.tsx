import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardModule } from './components/DashboardModule';
import { CreateModule } from './components/CreateModule';
import { WriteModule } from './components/WriteModule';
import { VisualModule } from './components/VisualModule';
import { ForgeModule } from './components/ForgeModule';
import { PublishModule } from './components/PublishModule';
import { LibraryModule } from './components/LibraryModule';
import { ControlModule } from './components/ControlModule';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { INITIAL_PROJECT } from './data/sampleProjects';
import { Project, PlatformConfig, UserProfile } from './types';
import { checkServerHealth, fetchCurrentUser, logoutUser, fetchUserProjects, saveUserProjects } from './services/orchestratorService';
import { loadServerSnapshot, readLocalSnapshot, saveServerSnapshot, writeLocalSnapshot } from './services/projectPersistence';

const DEFAULT_CONFIG: PlatformConfig = {
  brandName: 'VELORA',
  activeModule: 'dashboard',
  modelId: 'velora-narrative-v2',
  orchestratorWorkers: 2,
  qualityGateStrictness: 'balanced',
  autoRepairChapters: true
};

const localSnapshot = readLocalSnapshot();

export default function App() {
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>({
    ...DEFAULT_CONFIG,
    ...(localSnapshot.platformConfig || {})
  });
  const [activeProject, setActiveProject] = useState<Project>(localSnapshot.activeProject ?? INITIAL_PROJECT);
  const [allProjects, setAllProjects] = useState<Project[]>(localSnapshot.allProjects.length ? localSnapshot.allProjects : [INITIAL_PROJECT]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [serverStateLoaded, setServerStateLoaded] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load User and Server State on Startup
  useEffect(() => {
    let cancelled = false;
    Promise.all([checkServerHealth(), loadServerSnapshot(), fetchCurrentUser()]).then(([_health, snapshot, user]) => {
      if (cancelled) return;
      if (user) {
        setCurrentUser(user);
        fetchUserProjects(user.id).then((projects) => {
          if (projects && projects.length > 0) {
            setAllProjects(projects);
            setActiveProject(projects[0]);
          }
        });
      }
      if (snapshot) {
        if (snapshot.platformConfig) {
          setPlatformConfig((prev) => ({ ...prev, ...snapshot.platformConfig, brandName: 'VELORA' }));
        }
        if (snapshot.activeProject) setActiveProject(snapshot.activeProject);
        if (snapshot.allProjects?.length && !user) setAllProjects(snapshot.allProjects);
      }
      setServerStateLoaded(true);
    }).catch(() => {
      if (!cancelled) setServerStateLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Sync state to local and server
  useEffect(() => {
    const snapshot = { activeProject, allProjects, platformConfig };
    writeLocalSnapshot(snapshot);
    if (!serverStateLoaded) return;
    setSaveState('saving');

    if (currentUser?.id) {
      saveUserProjects(currentUser.id, allProjects).catch(() => {});
    }

    const timer = window.setTimeout(() => {
      saveServerSnapshot(snapshot).then((ok) => setSaveState(ok ? 'saved' : 'error'));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [activeProject, allProjects, platformConfig, serverStateLoaded, currentUser]);

  const handleUpdateConfig = (updates: Partial<PlatformConfig>) => {
    setPlatformConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleSelectModule = (module: PlatformConfig['activeModule']) => {
    setPlatformConfig((prev) => ({ ...prev, activeModule: module }));
  };

  const handleProjectUpdated = (updated: Project) => {
    setActiveProject(updated);
    setAllProjects((prev) => {
      const index = prev.findIndex((p) => p.id === updated.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = updated;
        return next;
      }
      return [updated, ...prev];
    });
  };

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    handleSelectModule('write');
  };

  const handleCreateNewProject = () => {
    handleSelectModule('create');
  };

  const handleDuplicateProject = (project: Project) => {
    const dup: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      title: `${project.title} (Draft 2)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: project.version + 1
    };
    setAllProjects((prev) => [dup, ...prev]);
    setActiveProject(dup);
  };

  const handleDeleteProject = (projectId: string) => {
    setAllProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== projectId);
      if (activeProject.id === projectId) {
        setActiveProject(remaining[0] || INITIAL_PROJECT);
      }
      return remaining.length > 0 ? remaining : [INITIAL_PROJECT];
    });
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    fetchUserProjects(user.id).then((projects) => {
      if (projects && projects.length > 0) {
        setAllProjects(projects);
        setActiveProject(projects[0]);
      }
    });
    handleSelectModule('dashboard');
  };

  const handleProfileUpdated = (updated: UserProfile) => {
    setCurrentUser(updated);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setIsProfileModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      <Header
        config={platformConfig}
        activeProject={activeProject}
        currentUser={currentUser}
        onSelectModule={handleSelectModule}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1">
        {platformConfig.activeModule === 'dashboard' && (
          <DashboardModule
            config={platformConfig}
            projects={allProjects}
            activeProject={activeProject}
            currentUser={currentUser}
            onSelectProject={handleSelectProject}
            onCreateNewProject={handleCreateNewProject}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
            onNavigateToModule={handleSelectModule}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
        {platformConfig.activeModule === 'create' && (
          <CreateModule config={platformConfig} activeProject={activeProject} onProjectUpdated={handleProjectUpdated} onNavigateToModule={handleSelectModule} />
        )}
        {platformConfig.activeModule === 'write' && (
          <WriteModule project={activeProject} onProjectUpdated={handleProjectUpdated} />
        )}
        {platformConfig.activeModule === 'visual' && (
          <VisualModule project={activeProject} onProjectUpdated={handleProjectUpdated} />
        )}
        {platformConfig.activeModule === 'forge' && (
          <ForgeModule config={platformConfig} project={activeProject} onProjectUpdated={handleProjectUpdated} onNavigateToModule={handleSelectModule} />
        )}
        {platformConfig.activeModule === 'publish' && (
          <PublishModule config={platformConfig} project={activeProject} onNavigateToModule={handleSelectModule} />
        )}
        {platformConfig.activeModule === 'library' && (
          <LibraryModule config={platformConfig} activeProject={activeProject} allProjects={allProjects} onSelectProject={handleSelectProject} onCreateNewProject={handleCreateNewProject} onDuplicateProject={handleDuplicateProject} onDeleteProject={handleDeleteProject} />
        )}
        {platformConfig.activeModule === 'control' && (
          <ControlModule config={platformConfig} onUpdateConfig={handleUpdateConfig} activeProject={activeProject} />
        )}
      </main>

      {/* Authentication & Profile Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {currentUser && (
        <UserProfileModal
          user={currentUser}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onProfileUpdated={handleProfileUpdated}
          onLogout={handleLogout}
          onOpenAuth={() => {
            setIsProfileModalOpen(false);
            setIsAuthModalOpen(true);
          }}
        />
      )}

      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 sm:px-6 lg:px-8 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-slate-400 uppercase tracking-wider">{platformConfig.brandName} PLATFORM</span>
          <span>&bull;</span>
          <span>Idea &rarr; Creation &rarr; Production &rarr; Visuals &rarr; Assembly &rarr; Publish</span>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span>0 kr &bull; Kostnadsfri forfattermotor</span>
          <span>&bull;</span>
          <span>Status: {saveState === 'saving' ? 'lagrer…' : saveState === 'error' ? 'feil ved lagring' : 'synkronisert'}</span>
        </div>
      </footer>
    </div>
  );
}
