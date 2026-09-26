import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  Shield,
  Award,
  Key,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  Layers,
  FileText,
  Sliders,
  X,
  RefreshCw
} from 'lucide-react';
import { UserProfile, UserPreferences, SecurityAuditEvent, ContentType } from '../types';
import {
  updateUserProfile,
  changeUserPassword,
  fetchSecurityLogs,
  logoutUser
} from '../services/orchestratorService';

interface UserProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onProfileUpdated,
  onLogout,
  onOpenAuth
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'stats'>('profile');

  // Form State
  const [name, setName] = useState(user.name || '');
  const [penName, setPenName] = useState(user.penName || '');
  const [bio, setBio] = useState(user.bio || '');
  const [imprintName, setImprintName] = useState(user.imprintName || '');

  // Preferences State
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultContentType: user.preferences?.defaultContentType || 'book',
    defaultGenre: user.preferences?.defaultGenre || 'Speculative Mystery & Dystopian Drama',
    defaultTargetWordCount: user.preferences?.defaultTargetWordCount || 30000,
    defaultPacing: user.preferences?.defaultPacing || 'measured',
    defaultVisualArtStyle: user.preferences?.defaultVisualArtStyle || 'Dark basalt slate with burnished copper foil linework',
    defaultLanguage: user.preferences?.defaultLanguage || 'English',
    autoSave: user.preferences?.autoSave !== false,
    orchestratorWorkers: user.preferences?.orchestratorWorkers || 2,
    qualityGateStrictness: user.preferences?.qualityGateStrictness || 'balanced',
    themeAccent: user.preferences?.themeAccent || 'amber'
  });

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security Audit Logs
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditEvent[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // General Status
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch security logs when switching to security tab
  useEffect(() => {
    if (activeTab === 'security') {
      setLoadingLogs(true);
      fetchSecurityLogs()
        .then((logs) => setSecurityLogs(logs))
        .finally(() => setLoadingLogs(false));
    }
  }, [activeTab]);

  const handleSaveProfileAndPrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      const updated = await updateUserProfile({
        name: name.trim(),
        penName: penName.trim(),
        bio: bio.trim(),
        imprintName: imprintName.trim(),
        preferences
      });
      onProfileUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      await changeUserPassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password successfully updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Password update failed.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-serif font-black text-lg shadow-md shadow-amber-500/20">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold text-slate-100">
                  {user.name}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20 font-semibold uppercase">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {user.email} &bull; Pen Name: <span className="text-slate-200">{user.penName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-800 bg-slate-950/40 overflow-x-auto text-xs">
          <button
            type="button"
            id="tab-profile-info"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personal Information</span>
          </button>

          <button
            type="button"
            id="tab-profile-preferences"
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Creative Preferences</span>
          </button>

          <button
            type="button"
            id="tab-profile-stats"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Portfolio Progress</span>
          </button>

          <button
            type="button"
            id="tab-profile-security"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security &amp; Audit Logs</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {saveSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Profile and creative preferences saved successfully.</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfileAndPrefs} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 block uppercase">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    id="input-user-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 block uppercase">
                    Publishing Pen Name
                  </label>
                  <input
                    type="text"
                    id="input-user-pen-name"
                    value={penName}
                    onChange={(e) => setPenName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 block uppercase">
                    Account Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-slate-950/50 border border-slate-800/60 rounded-lg px-3 py-2 text-slate-400 text-xs font-mono cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 block uppercase">
                    Publisher / Imprint Name
                  </label>
                  <input
                    type="text"
                    id="input-user-imprint"
                    value={imprintName}
                    onChange={(e) => setImprintName(e.target.value)}
                    placeholder="e.g. Velora Editions"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 block uppercase">
                  Author Biography
                </label>
                <textarea
                  id="input-user-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell readers and collaborative engines about your artistic voice..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CREATIVE PREFERENCES */}
          {activeTab === 'preferences' && (
            <form onSubmit={handleSaveProfileAndPrefs} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 block uppercase">
                    Default Content Type
                  </label>
                  <select
                    id="pref-content-type"
                    value={preferences.defaultContentType}
                    onChange={(e) => setPreferences({ ...preferences, defaultContentType: e.target.value as ContentType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="book">Book &bull; Novel / Prose Manuscript</option>
                    <option value="picture_book">Picture Book &bull; Illustrated Story</option>
                    <option value="comic">Comic / Graphic Novel &bull; Panel Script</option>
                    <option value="magazine">Magazine &bull; Curated Editorial</option>
                    <option value="screenplay">Screenplay &bull; Film &amp; Episodic</option>
                    <option value="educational">Educational &bull; Structured Guide</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 block uppercase">
                    Default Narrative Pacing
                  </label>
                  <select
                    id="pref-pacing"
                    value={preferences.defaultPacing}
                    onChange={(e) => setPreferences({ ...preferences, defaultPacing: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="brisk">Brisk &bull; Rapid escalations &amp; tight scenes</option>
                    <option value="measured">Measured &bull; Rich subtext &amp; atmospheric depth</option>
                    <option value="epic">Epic &bull; Sweeping worldbuilding &amp; grand scale</option>
                    <option value="contemplative">Contemplative &bull; Internal monologue &amp; poetic cadence</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 block uppercase">
                    Default Genre &amp; Subgenre
                  </label>
                  <input
                    type="text"
                    id="pref-genre"
                    value={preferences.defaultGenre}
                    onChange={(e) => setPreferences({ ...preferences, defaultGenre: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 block uppercase">
                    Target Word Count: {preferences.defaultTargetWordCount.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min={5000}
                    max={80000}
                    step={2500}
                    value={preferences.defaultTargetWordCount}
                    onChange={(e) => setPreferences({ ...preferences, defaultTargetWordCount: Number(e.target.value) })}
                    className="w-full accent-amber-400 mt-2"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>5k (Novella)</span>
                    <span>30k (Standard)</span>
                    <span>80k (Epic)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 block uppercase">
                  Default Visual Art Style &amp; Linework
                </label>
                <input
                  type="text"
                  id="pref-visual-style"
                  value={preferences.defaultVisualArtStyle}
                  onChange={(e) => setPreferences({ ...preferences, defaultVisualArtStyle: e.target.value })}
                  placeholder="e.g. Dark basalt slate with burnished copper foil linework"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 block uppercase">
                    Target Language
                  </label>
                  <select
                    id="pref-language"
                    value={preferences.defaultLanguage}
                    onChange={(e) => setPreferences({ ...preferences, defaultLanguage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="English">English</option>
                    <option value="Norwegian">Norsk (Norwegian)</option>
                    <option value="German">Deutsch (German)</option>
                    <option value="French">Français (French)</option>
                    <option value="Spanish">Español (Spanish)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 block uppercase">
                    Quality Gate Strictness
                  </label>
                  <select
                    id="pref-strictness"
                    value={preferences.qualityGateStrictness}
                    onChange={(e) => setPreferences({ ...preferences, qualityGateStrictness: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="balanced">Balanced (&gt;80 score)</option>
                    <option value="strict">Strict Publisher Grade (&gt;90)</option>
                    <option value="relaxed">Relaxed Draft Mode</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 block uppercase">
                    Worker Concurrency
                  </label>
                  <select
                    id="pref-workers"
                    value={preferences.orchestratorWorkers}
                    onChange={(e) => setPreferences({ ...preferences, orchestratorWorkers: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/50"
                  >
                    <option value={1}>1 Worker (Sequential)</option>
                    <option value={2}>2 Workers (Standard)</option>
                    <option value={3}>3 Workers (Fast)</option>
                    <option value={4}>4 Workers (Maximum)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Creative Preferences'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PORTFOLIO PROGRESS & STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                    Total Authored Projects
                  </span>
                  <div className="text-3xl font-bold font-mono text-slate-100 mt-1">
                    {user.stats?.totalProjects || 0}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Under {user.imprintName || 'Velora Imprint'}
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase block">
                    Completed Editions
                  </span>
                  <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                    {user.stats?.completedProjects || 0}
                  </div>
                  <span className="text-[10px] text-emerald-500/70 mt-1 block">
                    Fully assembled &amp; exportable
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] font-mono text-amber-400 uppercase block">
                    Total Authored Words
                  </span>
                  <div className="text-3xl font-bold font-mono text-amber-400 mt-1">
                    {(user.stats?.totalAuthoredWords || 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-amber-500/70 mt-1 block">
                    Verified manuscript prose
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase block">
                    Estimated Token Footprint
                  </span>
                  <div className="text-3xl font-bold font-mono text-cyan-400 mt-1">
                    {(user.stats?.estimatedTokensUsed || 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-cyan-500/70 mt-1 block">
                    Through orchestrated pipelines
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-200 block">
                  Author Profile Certification
                </span>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Registered on the VELORA creative production platform on{' '}
                  <span className="text-slate-200 font-mono">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  . All generated manuscripts are owned 100% by the creator, with zero automated public disclosure.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & AUDIT LOGS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password Form */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <h4 className="font-semibold text-slate-200">Change Account Password</h4>
                </div>

                {passwordMsg && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                      passwordMsg.type === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                    }`}
                  >
                    {passwordMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400 block">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="input-current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-400 block">
                        New Password (min 8 chars)
                      </label>
                      <input
                        type="password"
                        id="input-new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-400 block">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="input-confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Update Password</span>
                  </button>
                </form>
              </div>

              {/* Security Audit Log (OWASP & Anti-Abuse) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-semibold text-slate-200">
                      Security &amp; Anti-Abuse Audit Trail
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    OWASP Certified Logging
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                  {loadingLogs ? (
                    <div className="py-4 text-center text-slate-500 font-mono text-xs">
                      Loading security records...
                    </div>
                  ) : securityLogs.length === 0 ? (
                    <div className="py-4 text-center text-slate-500 text-xs">
                      No security events logged for this session.
                    </div>
                  ) : (
                    securityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-slate-800/50 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              log.status === 'success'
                                ? 'bg-emerald-400'
                                : log.status === 'denied'
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                          />
                          <span className="text-slate-300 font-semibold">{log.action}</span>
                          {log.details && (
                            <span className="text-slate-500 truncate max-w-[200px]">
                              {log.details}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-profile-logout"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>

            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
