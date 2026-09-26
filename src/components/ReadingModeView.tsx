import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Type,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  Clock,
  AlignJustify,
  ListOrdered,
  X
} from 'lucide-react';
import { Project, Chapter } from '../types';

interface ReadingModeViewProps {
  project: Project;
  currentChapterIndex: number;
  onChapterChange: (newIndex: number) => void;
  onExit: () => void;
}

type ReadingTheme = 'slate' | 'sepia' | 'midnight';
type FontSize = 'sm' | 'md' | 'lg' | 'xl';
type LineWidth = 'normal' | 'wide' | 'narrow';

export const ReadingModeView: React.FC<ReadingModeViewProps> = ({
  project,
  currentChapterIndex,
  onChapterChange,
  onExit
}) => {
  const [theme, setTheme] = useState<ReadingTheme>('slate');
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [lineWidth, setLineWidth] = useState<LineWidth>('normal');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [showIllustration, setShowIllustration] = useState<boolean>(true);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);

  const chapters = project.chapters;
  const currentChapter: Chapter | undefined = chapters[currentChapterIndex];
  const chapterPlan = project.plan?.chaptersPlan?.find(
    (p) => p.chapterNumber === currentChapter?.chapterNumber
  );

  // Keyboard navigation: Escape exits, ArrowLeft/ArrowRight navigates chapters
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      } else if (e.key === 'ArrowRight' && (e.altKey || e.metaKey)) {
        if (currentChapterIndex < chapters.length - 1) {
          onChapterChange(currentChapterIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' && (e.altKey || e.metaKey)) {
        if (currentChapterIndex > 0) {
          onChapterChange(currentChapterIndex - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIndex, chapters.length, onChapterChange, onExit]);

  // Scroll to top when changing chapter
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentChapterIndex]);

  // Theme styles
  const themeClasses = {
    slate: {
      wrapper: 'bg-slate-950 text-slate-200',
      header: 'bg-slate-950/90 border-slate-800/80 text-slate-300',
      card: 'bg-slate-900/60 border-slate-800 text-slate-200',
      meta: 'text-slate-400',
      accent: 'text-amber-400',
      dropCap: 'text-amber-400',
      button: 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800',
      activeBtn: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    sepia: {
      wrapper: 'bg-[#18130e] text-[#e3dac9]',
      header: 'bg-[#18130e]/95 border-[#2e261d] text-[#c9bea9]',
      card: 'bg-[#221c15]/80 border-[#382e23] text-[#e3dac9]',
      meta: 'text-[#9e9282]',
      accent: 'text-[#e5a95d]',
      dropCap: 'text-[#e5a95d]',
      button: 'bg-[#221c15] hover:bg-[#2e261d] text-[#c9bea9] border-[#382e23]',
      activeBtn: 'bg-[#e5a95d]/20 text-[#e5a95d] border-[#e5a95d]/40'
    },
    midnight: {
      wrapper: 'bg-black text-neutral-300',
      header: 'bg-black/95 border-neutral-900 text-neutral-400',
      card: 'bg-neutral-950 border-neutral-900 text-neutral-300',
      meta: 'text-neutral-500',
      accent: 'text-cyan-400',
      dropCap: 'text-cyan-400',
      button: 'bg-neutral-950 hover:bg-neutral-900 text-neutral-400 border-neutral-900',
      activeBtn: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    }
  }[theme];

  const fontSizeClass = {
    sm: 'text-base leading-relaxed',
    md: 'text-lg leading-loose',
    lg: 'text-xl leading-loose',
    xl: 'text-2xl leading-loose'
  }[fontSize];

  const widthClass = {
    narrow: 'max-w-xl',
    normal: 'max-w-2xl',
    wide: 'max-w-4xl'
  }[lineWidth];

  const words = currentChapter?.prose
    ? currentChapter.prose.trim().split(/\s+/).filter(Boolean).length
    : currentChapter?.wordCount || 0;
  const readTime = Math.max(1, Math.ceil(words / 220));

  return (
    <div
      id="focus-reading-mode"
      className={`min-h-screen transition-colors duration-300 ${themeClasses.wrapper} flex flex-col`}
    >
      {/* Distraction-Free Sticky Navigation Bar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-6 py-3 transition-colors duration-300 ${themeClasses.header}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Exit Reading Mode & Table of Contents Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-exit-reading-mode"
              onClick={onExit}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${themeClasses.button}`}
              title="Gå tilbake til redigeringsverktøy (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Avslutt lesemodus</span>
              <kbd className="hidden sm:inline ml-1 px-1 py-0.2 text-[10px] rounded bg-black/30 border border-current opacity-60 font-mono">
                Esc
              </kbd>
            </button>

            <button
              type="button"
              id="btn-reading-toc-toggle"
              onClick={() => setIsTocOpen(!isTocOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isTocOpen ? themeClasses.activeBtn : themeClasses.button
              }`}
              title="Vis klikkbar innholdsfortegnelse for alle kapitler"
            >
              <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Innholdsfortegnelse</span>
            </button>

            <div className="hidden lg:flex flex-col ml-1">
              <span className="text-xs font-semibold truncate max-w-xs">{project.title}</span>
              <span className={`text-[11px] truncate max-w-xs ${themeClasses.meta}`}>
                Kapittel {currentChapterIndex + 1} av {chapters.length}: &laquo;{currentChapter?.title}&raquo;
              </span>
            </div>
          </div>

          {/* Center: Chapter Quick Prev / Next Switcher */}
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-current/10">
            <button
              type="button"
              id="btn-reading-prev-chapter"
              onClick={() => onChapterChange(currentChapterIndex - 1)}
              disabled={currentChapterIndex === 0}
              className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
              title="Forrige kapittel (Alt + Pil venstre)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              id="select-reading-chapter"
              value={currentChapterIndex}
              onChange={(e) => onChapterChange(Number(e.target.value))}
              className="bg-transparent text-xs font-serif font-medium px-2 py-1 rounded focus:outline-none cursor-pointer text-center"
            >
              {chapters.map((chap, idx) => (
                <option key={chap.id} value={idx} className="bg-slate-900 text-slate-100">
                  Kapittel {chap.chapterNumber}: {chap.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              id="btn-reading-next-chapter"
              onClick={() => onChapterChange(currentChapterIndex + 1)}
              disabled={currentChapterIndex >= chapters.length - 1}
              className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
              title="Neste kapittel (Alt + Pil høyre)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Typography & Aesthetic Preferences */}
          <div className="flex items-center gap-2">
            {/* Font family */}
            <button
              type="button"
              onClick={() => setFontFamily((f) => (f === 'serif' ? 'sans' : 'serif'))}
              className={`px-2 py-1 rounded text-xs font-mono border transition-colors ${themeClasses.button}`}
              title="Bytt skrifttype (Serif / Sans-serif)"
            >
              {fontFamily === 'serif' ? 'Serif' : 'Sans'}
            </button>

            {/* Font size */}
            <div className="hidden sm:flex items-center gap-0.5 bg-black/20 p-0.5 rounded border border-current/10 text-xs">
              {(['sm', 'md', 'lg', 'xl'] as FontSize[]).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setFontSize(sz)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    fontSize === sz ? themeClasses.activeBtn : 'hover:bg-white/10'
                  }`}
                >
                  {sz === 'sm' ? 'A-' : sz === 'md' ? 'A' : sz === 'lg' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>

            {/* Line width */}
            <div className="hidden lg:flex items-center gap-0.5 bg-black/20 p-0.5 rounded border border-current/10 text-xs">
              {(['narrow', 'normal', 'wide'] as LineWidth[]).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setLineWidth(w)}
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono transition-colors ${
                    lineWidth === w ? themeClasses.activeBtn : 'hover:bg-white/10'
                  }`}
                >
                  {w === 'narrow' ? 'Smal' : w === 'normal' ? 'Norm' : 'Bred'}
                </button>
              ))}
            </div>

            {/* Theme selector */}
            <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded border border-current/10">
              <button
                type="button"
                onClick={() => setTheme('slate')}
                className={`p-1 rounded transition-colors ${theme === 'slate' ? themeClasses.activeBtn : 'hover:bg-white/10'}`}
                title="Mørk skifer (Klassisk)"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('sepia')}
                className={`p-1 rounded transition-colors ${theme === 'sepia' ? themeClasses.activeBtn : 'hover:bg-white/10'}`}
                title="Varm pergament (Sepia)"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('midnight')}
                className={`p-1 rounded transition-colors ${theme === 'midnight' ? themeClasses.activeBtn : 'hover:bg-white/10'}`}
                title="Dyp natt (Ren sort)"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Innholdsfortegnelse Drawer for Reading Mode */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsTocOpen(false)}
          />
          <aside
            id="reading-mode-toc-drawer"
            aria-label="Innholdsfortegnelse"
            className={`relative z-10 w-full max-w-sm sm:max-w-md h-full p-6 overflow-y-auto space-y-4 shadow-2xl border-r ${themeClasses.card} flex flex-col`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-current/10">
              <div className="flex items-center gap-2">
                <ListOrdered className={`w-4 h-4 ${themeClasses.accent}`} />
                <h3 className="text-base font-serif font-bold">Innholdsfortegnelse</h3>
              </div>
              <button
                type="button"
                id="btn-close-reading-toc"
                onClick={() => setIsTocOpen(false)}
                className={`p-1.5 rounded-lg border transition-colors ${themeClasses.button}`}
                title="Lukk innholdsfortegnelse"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs opacity-75">
              <span>{project.title} &bull; {chapters.length} kapitler</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {chapters.map((chap, idx) => {
                const isSelected = currentChapterIndex === idx;
                const effectiveWords = chap.prose
                  ? chap.prose.trim().split(/\s+/).filter(Boolean).length
                  : chap.wordCount || 0;
                const isDone = chap.status === 'completed' || effectiveWords > 0;

                return (
                  <button
                    key={chap.id}
                    type="button"
                    onClick={() => {
                      onChapterChange(idx);
                      setIsTocOpen(false);
                    }}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? themeClasses.activeBtn
                        : `${themeClasses.button} opacity-90 hover:opacity-100`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold font-serif ${themeClasses.accent} flex items-center gap-1.5`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                        Kapittel {chap.chapterNumber}
                      </span>
                      {isDone ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono opacity-80">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{effectiveWords} ord</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono opacity-60">
                          {chap.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium line-clamp-1">{chap.title}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] opacity-70">
                      <span>POV: {chap.povCharacter}</span>
                      <span>~{Math.max(1, Math.ceil(effectiveWords / 220))} min</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* Main Reading Canvas */}
      <main className="flex-1 w-full px-4 sm:px-8 py-10 sm:py-16">
        <div className={`mx-auto ${widthClass} space-y-10`}>
          {currentChapter ? (
            <>
              {/* Chapter Header Card */}
              <div className="text-center space-y-3 pb-8 border-b border-current/10">
                <span className={`text-xs uppercase tracking-widest font-mono ${themeClasses.accent}`}>
                  Kapittel {currentChapter.chapterNumber}
                </span>
                <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
                  {currentChapter.title}
                </h1>
                <div className={`flex flex-wrap items-center justify-center gap-3 text-xs ${themeClasses.meta}`}>
                  <span>Synsvinkel: <strong className="font-semibold">{currentChapter.povCharacter}</strong></span>
                  {chapterPlan?.setting && (
                    <>
                      <span>&bull;</span>
                      <span>{chapterPlan.setting}</span>
                    </>
                  )}
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>~{readTime} min lesetid</span>
                  </span>
                  <span>&bull;</span>
                  <span>{words.toLocaleString()} ord</span>
                </div>
              </div>

              {/* Optional Illustrated Book Plate */}
              {currentChapter.illustrationUrl && showIllustration && (
                <div className="my-8 rounded-xl overflow-hidden border border-current/10 shadow-2xl space-y-2">
                  <img
                    src={currentChapter.illustrationUrl}
                    alt={`Illustrasjon til kapittel ${currentChapter.chapterNumber}`}
                    className="w-full max-h-[500px] object-cover object-center"
                  />
                  {currentChapter.illustrationCaption && (
                    <p className={`p-3 text-center text-xs font-serif italic ${themeClasses.meta}`}>
                      {currentChapter.illustrationCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Pure Chapter Prose */}
              {currentChapter.prose ? (
                <article
                  className={`select-text ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'} ${fontSizeClass} space-y-6 sm:space-y-8`}
                >
                  {currentChapter.prose.split(/\n\s*\n/).map((paragraph, idx) => {
                    const text = paragraph.trim();
                    if (!text) return null;
                    const isFirst = idx === 0;

                    return (
                      <p
                        key={idx}
                        className={
                          isFirst
                            ? `first-letter:text-5xl first-letter:font-bold first-letter:font-serif first-letter:mr-2.5 first-letter:float-left first-letter:${themeClasses.dropCap} text-justify leading-relaxed`
                            : 'text-justify indent-6 sm:indent-8'
                        }
                      >
                        {text}
                      </p>
                    );
                  })}
                </article>
              ) : (
                <div className="py-20 text-center space-y-4 border border-dashed border-current/20 rounded-xl">
                  <BookOpen className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-sm font-serif italic">
                    Dette kapittelet har ennå ingen generert tekst.
                  </p>
                  <button
                    type="button"
                    onClick={onExit}
                    className={`px-4 py-2 rounded-lg text-xs font-medium border ${themeClasses.button}`}
                  >
                    Gå til skrivevisning for å skrive kapittelet
                  </button>
                </div>
              )}

              {/* Chapter Footer Navigation */}
              <div className="pt-12 mt-12 border-t border-current/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => onChapterChange(currentChapterIndex - 1)}
                  disabled={currentChapterIndex === 0}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 disabled:opacity-30 ${themeClasses.button}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Forrige kapittel</span>
                </button>

                <button
                  type="button"
                  onClick={onExit}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 ${themeClasses.button}`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Avslutt lesemodus</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChapterChange(currentChapterIndex + 1)}
                  disabled={currentChapterIndex >= chapters.length - 1}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 disabled:opacity-30 ${themeClasses.button}`}
                >
                  <span>Neste kapittel</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-400">
              Fant ingen kapitteldata.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
