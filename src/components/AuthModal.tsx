import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Feather
} from 'lucide-react';
import { UserProfile } from '../types';
import { loginUser, registerUser } from '../services/orchestratorService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [penName, setPenName] = useState('');
  const [imprintName, setImprintName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { user } = await loginUser(email, password);
        onAuthSuccess(user);
        onClose();
      } else {
        const { user } = await registerUser({
          email,
          password,
          name,
          penName: penName || name,
          imprintName: imprintName || `${name} Editions`
        });
        onAuthSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('annebeth.andersen@gmail.com');
    setPassword('Aetheris2026!');
    setLoading(true);
    setError(null);

    try {
      const { user } = await loginUser('annebeth.andersen@gmail.com', 'Aetheris2026!');
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-serif font-black text-lg shadow-md">
              A
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-slate-100">
                {mode === 'login' ? 'Creator Sign In' : 'Register Creator Account'}
              </h2>
              <p className="text-xs text-slate-400">
                AETHERIS Creative Production Architecture
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

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950/70 border-b border-slate-800 text-xs font-medium">
          <button
            type="button"
            id="auth-toggle-login"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            id="auth-toggle-register"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            New Creator Registration
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="input-auth-name"
                    required
                    placeholder="e.g. Annebeth Andersen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 uppercase block">
                    Pen Name
                  </label>
                  <input
                    type="text"
                    id="input-auth-pen-name"
                    placeholder="e.g. A. B. Andersen"
                    value={penName}
                    onChange={(e) => setPenName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 uppercase block">
                    Imprint Name
                  </label>
                  <input
                    type="text"
                    id="input-auth-imprint"
                    placeholder="e.g. Aetheris Editions"
                    value={imprintName}
                    onChange={(e) => setImprintName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-400 uppercase block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                id="input-auth-email"
                required
                placeholder="creator@aetheris.pub"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-400 uppercase block">
              Password {mode === 'register' && '(min 8 chars)'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                id="input-auth-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            id="btn-auth-submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center justify-center gap-2 shadow transition-all mt-2"
          >
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In to Workspace' : 'Create Creator Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Box */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Quick Creator Profile Demo
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              OWASP Scrypt Verified
            </span>
          </div>

          <button
            type="button"
            id="btn-demo-annebeth"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full py-2 px-3 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-200 text-left flex items-center justify-between transition-colors"
          >
            <div>
              <div className="font-semibold text-slate-200">
                Annebeth Andersen (A. B. Andersen)
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                annebeth.andersen@gmail.com &bull; 3 projects pre-loaded
              </div>
            </div>
            <Feather className="w-4 h-4 text-amber-400 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
