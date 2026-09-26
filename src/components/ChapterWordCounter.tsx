import React, { useState, useMemo } from 'react';
import {
  AlignLeft,
  Clock,
  Target,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Layers,
  Copy,
  Check,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface ChapterWordCounterProps {
  prose: string;
  chapterNumber: number;
  chapterTitle: string;
  targetWordCount?: number;
  onTargetChange?: (newTarget: number) => void;
  isEditing?: boolean;
}

const PRESET_TARGETS = [800, 1000, 1200, 1500, 2000];

export const ChapterWordCounter: React.FC<ChapterWordCounterProps> = ({
  prose,
  chapterNumber,
  chapterTitle,
  targetWordCount = 1200,
  onTargetChange,
  isEditing = false
}) => {
  const [copied, setCopied] = useState(false);
  const [currentTarget, setCurrentTarget] = useState<number>(targetWordCount);

  // Realtime metric computations
  const stats = useMemo(() => {
    const trimmed = prose.trim();
    if (!trimmed) {
      return {
        words: 0,
        charsWithSpaces: 0,
        charsNoSpaces: 0,
        paragraphs: 0,
        sentences: 0,
        readTimeMinutes: 0
      };
    }

    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const charsWithSpaces = prose.length;
    const charsNoSpaces = prose.replace(/\s+/g, '').length;
    const paragraphs = prose.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    const sentences = (prose.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length || (words > 0 ? 1 : 0);
    const readTimeMinutes = Math.max(1, Math.ceil(words / 220));

    return {
      words,
      charsWithSpaces,
      charsNoSpaces,
      paragraphs,
      sentences,
      readTimeMinutes
    };
  }, [prose]);

  const progressPercent = Math.min(100, Math.round((stats.words / currentTarget) * 100));

  const handleCopy = () => {
    if (!prose) return;
    navigator.clipboard.writeText(prose);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetTarget = (target: number) => {
    setCurrentTarget(target);
    if (onTargetChange) onTargetChange(target);
  };

  // Writing progress milestones and narrative stage
  const getStageInfo = () => {
    if (stats.words === 0) {
      return {
        label: 'Ikke påbegynt',
        color: 'text-slate-400',
        badgeBg: 'bg-slate-800 text-slate-400 border-slate-700',
        advice: 'Start med å etablere rommet, sansene eller karakterens umiddelbare mål.'
      };
    }
    if (stats.words < 300) {
      return {
        label: 'Første scene / Etablering',
        color: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        advice: 'Etabler synsvinkelen og den emosjonelle spenningen tidlig i scenen.'
      };
    }
    if (stats.words < 700) {
      return {
        label: 'Stigende konflikt',
        color: 'text-sky-400',
        badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
        advice: 'La motstanden øke og introduser en uventet observasjon eller dialog.'
      };
    }
    if (stats.words < currentTarget) {
      return {
        label: 'Mot klimaks & vendepunkt',
        color: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        advice: 'Nærmer deg målet! Sørg for at scenen etterlater leseren med et åpent spørsmål.'
      };
    }
    return {
      label: 'Mål nådd – Fullverdig kapittel',
      color: 'text-emerald-300',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold',
      advice: 'Kapittelmålet er oppnådd. Gjennomgå rytme, sanseinntrykk og språklig flyt.'
    };
  };

  const stage = getStageInfo();

  return (
    <div
      id={`realtime-word-counter-ch${chapterNumber}`}
      className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4"
    >
      {/* Top row: Live counter header & badges */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlignLeft className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                Sanntids Ordteller
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Aktiv
              </span>
              {isEditing && (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse">
                  Skriver...
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Kapittel {chapterNumber}: &laquo;{chapterTitle}&raquo;
            </p>
          </div>
        </div>

        {/* Free mode reassurance badge + copy button */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-950 border border-slate-800 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>0 kr &bull; Gratis motor</span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!prose}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-40 transition-colors"
            title="Kopier kapittelet til utklippstavlen"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Kopiert!' : 'Kopier'}</span>
          </button>
        </div>
      </div>

      {/* Main real-time metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Metric 1: Words */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Ord i kapittelet
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-300">
              {stats.words.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-slate-500">
              / {currentTarget}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
            {progressPercent}% av målet
          </span>
        </div>

        {/* Metric 2: Characters */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Tegn (med / uten)
          </span>
          <div className="text-lg sm:text-xl font-mono font-semibold text-slate-200">
            {stats.charsWithSpaces.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
            {stats.charsNoSpaces.toLocaleString()} uten mellomrom
          </span>
        </div>

        {/* Metric 3: Paragraphs & Sentences */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Struktur
          </span>
          <div className="text-lg sm:text-xl font-mono font-semibold text-slate-200">
            {stats.paragraphs} <span className="text-xs text-slate-500 font-normal">avsnitt</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
            ~{stats.sentences} setninger
          </span>
        </div>

        {/* Metric 4: Reading time */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Estimert lesetid
          </span>
          <div className="flex items-center gap-1.5 text-lg sm:text-xl font-serif font-semibold text-slate-200">
            <Clock className="w-4 h-4 text-amber-400/80" />
            <span>
              {stats.words === 0
                ? '0 min'
                : stats.words < 100
                ? '< 1 min'
                : `~${stats.readTimeMinutes} min`}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
            ved 220 ord/min
          </span>
        </div>
      </div>

      {/* Progress Bar & Target Selector */}
      <div className="space-y-2 pt-1 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${stage.badgeBg}`}>
              {stage.label}
            </span>
            <span className="text-slate-400 text-[11px] hidden md:inline">
              &bull; {stage.advice}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-mono">Mål:</span>
            <div className="flex items-center gap-1">
              {PRESET_TARGETS.map((target) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => handleSetTarget(target)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    currentTarget === target
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {target}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Meter bar */}
        <div className="relative w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              progressPercent >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : progressPercent >= 60
                ? 'bg-gradient-to-r from-amber-500 to-emerald-400'
                : 'bg-gradient-to-r from-amber-600 to-amber-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone markers */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500 px-0.5">
          <span>0 ord</span>
          <span>{Math.round(currentTarget * 0.25)} (25%)</span>
          <span>{Math.round(currentTarget * 0.5)} (50%)</span>
          <span>{Math.round(currentTarget * 0.75)} (75%)</span>
          <span className={progressPercent >= 100 ? 'text-emerald-400 font-bold' : ''}>
            {currentTarget} ord (100%)
          </span>
        </div>
      </div>
    </div>
  );
};
