import React, { useState } from 'react';
import {
  Palette,
  Layers,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Maximize2,
  Trash2,
  LayoutGrid
} from 'lucide-react';
import { Project, VisualCoverConfig, VisualAsset, BookTemplate } from '../types';
import { CoverCanvas } from './CoverCanvas';
import { generateVisualMotif, generateBookImage } from '../services/orchestratorService';
import { ThemeTemplateGallery } from './ThemeTemplateGallery';
import { FullBookIllustrator } from './FullBookIllustrator';

interface VisualModuleProps {
  project: Project;
  onProjectUpdated: (project: Project) => void;
}

export const VisualModule: React.FC<VisualModuleProps> = ({ project, onProjectUpdated }) => {
  const [viewMode, setViewMode] = useState<'front' | 'back' | 'wrap'>('front');
  const [activeTab, setActiveTab] = useState<'templates' | 'cover' | 'full-book' | 'illustrations'>('templates');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isGeneratingCoverArt, setIsGeneratingCoverArt] = useState<boolean>(false);
  const [isGeneratingBackArt, setIsGeneratingBackArt] = useState<boolean>(false);
  const [customCoverPrompt, setCustomCoverPrompt] = useState<string>(
    `Cinematic book cover artwork for "${project.title}". Subtitle: "${project.subtitle || ''}". Tone: ${project.intent?.tone || 'Epic'}. Atmospheric lighting, detailed centerpiece illustration.`
  );

  const coverConfig: VisualCoverConfig = project.coverConfig || {
    title: project.title,
    subtitle: project.subtitle || '',
    author: project.author,
    accentColor: '#d4af37',
    bgColor: '#090e17',
    fontFamily: 'cinzel',
    motif: 'celestial-crest',
    backCoverBlurb: project.intent?.logline || 'An extraordinary journey through mind and form.',
    spineWidthMm: 18,
    barcodeText: '978-1-BOOKFORGE-7729'
  };

  // Progress metrics across the entire book
  const hasCoverArt = Boolean(coverConfig.coverImageUrl);
  const chapters = project.chapters || [];
  const illustratedChaptersCount = chapters.filter((c) => Boolean(c.illustrationUrl)).length;
  const totalElements = 1 + chapters.length;
  const completedElements = (hasCoverArt ? 1 : 0) + illustratedChaptersCount;
  const progressPercentage = Math.round((completedElements / totalElements) * 100);

  const updateCoverConfig = (updates: Partial<VisualCoverConfig>) => {
    const updated = { ...coverConfig, ...updates };
    onProjectUpdated({
      ...project,
      coverConfig: updated,
      updatedAt: new Date().toISOString()
    });
  };

  const handleApplyTemplate = (template: BookTemplate) => {
    const updatedCover: VisualCoverConfig = {
      ...coverConfig,
      accentColor: template.coverConfig.accentColor || coverConfig.accentColor,
      bgColor: template.coverConfig.bgColor || coverConfig.bgColor,
      fontFamily: (template.coverConfig.fontFamily as any) || coverConfig.fontFamily,
      motif: (template.coverConfig.motif as any) || coverConfig.motif,
      templateThemeId: template.id
    };

    onProjectUpdated({
      ...project,
      coverConfig: updatedCover,
      intent: {
        ...project.intent,
        visualArtStyle: template.artStyle
      },
      updatedAt: new Date().toISOString()
    });
  };

  const handleRandomizeMotif = async () => {
    setIsSynthesizing(true);
    try {
      const generated = await generateVisualMotif(
        project.title,
        project.subtitle || '',
        project.author,
        project.intent?.genre || 'Fiction'
      );
      updateCoverConfig(generated);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Generate Cover Art (AI)
  const handleGenerateCoverArtwork = async () => {
    setIsGeneratingCoverArt(true);
    try {
      const style = project.intent?.visualArtStyle || 'Cinematic book plate illustration, rich atmospheric lighting.';
      const res = await generateBookImage(customCoverPrompt, style, '3:4', {
        title: project.title,
        target: 'cover_front'
      });

      updateCoverConfig({ coverImageUrl: res.imageUrl });

      // Record as visual asset
      const newAsset: VisualAsset = {
        id: `asset-cover-front-${Date.now()}`,
        type: 'cover_front',
        title: `Front Cover: ${project.title}`,
        prompt: customCoverPrompt,
        style,
        imageUrl: res.imageUrl,
        placementDescription: 'Front Cover Artwork'
      };

      onProjectUpdated({
        ...project,
        coverConfig: {
          ...coverConfig,
          coverImageUrl: res.imageUrl
        },
        visualAssets: [
          ...project.visualAssets.filter((a) => a.type !== 'cover_front'),
          newAsset
        ],
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      alert(`Kunne ikke generere omslagskunst: ${err?.message || err}`);
    } finally {
      setIsGeneratingCoverArt(false);
    }
  };

  const handleRemoveCoverArtwork = () => {
    updateCoverConfig({ coverImageUrl: undefined });
  };

  // Add or regenerate an illustration asset for a chapter
  const handleIllustrateChapter = async (chapterNumber: number) => {
    const chapIndex = project.chapters.findIndex((c) => c.chapterNumber === chapterNumber);
    if (chapIndex === -1) return;

    const chap = project.chapters[chapIndex];
    const prompt =
      chap.illustrationPrompt ||
      `Dramatic scene illustration for Chapter ${chap.chapterNumber}: "${chap.title}". Setting: ${project.title}. Rich lighting, detailed plate.`;
    const style = project.intent?.visualArtStyle || 'Dark Basalt Slate with Burnished Copper Linework';

    try {
      const res = await generateBookImage(prompt, style, '3:4', {
        title: project.title,
        chapterNumber,
        target: 'illustration'
      });

      const updatedChapters = [...project.chapters];
      updatedChapters[chapIndex] = {
        ...chap,
        illustrationUrl: res.imageUrl,
        illustrationCaption: `Kapittel ${chap.chapterNumber}: ${chap.title}`,
        illustrationPrompt: prompt
      };

      onProjectUpdated({
        ...project,
        chapters: updatedChapters,
        visualAssets: [
          ...project.visualAssets.filter(
            (a) => !(a.type === 'illustration' && a.chapterNumber === chapterNumber)
          ),
          {
            id: `asset-ill-ch${chapterNumber}-${Date.now()}`,
            type: 'illustration',
            chapterNumber,
            title: `Chapter ${chapterNumber} Illustrated Plate: ${chap.title}`,
            prompt,
            style,
            imageUrl: res.imageUrl,
            placementDescription: `Chapter ${chapterNumber} Header Spread`
          }
        ],
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      alert(`Kunne ikke illustrere kapittel: ${err?.message || err}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            <span>BookForge AI Visual &bull; Omslag &amp; Bok-Illustrasjoner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Velg designtema, skap omslagskunst, illustrer hele boken og tilpass visuelle plater for alle kapitler.
          </p>
        </div>

        {/* Global Progress Indicator */}
        <div className="flex items-center gap-3 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-mono text-slate-400">Illustrasjonsfremgang</span>
            <span className="font-mono text-amber-300 font-bold">
              {completedElements} / {totalElements} elementer ({progressPercentage}%)
            </span>
          </div>
          <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800/80">
        <button
          id="tab-visual-templates"
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'templates'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/80'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>1. Tema-maler &amp; Forhåndsvisning</span>
        </button>

        <button
          id="tab-visual-cover"
          type="button"
          onClick={() => setActiveTab('cover')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'cover'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/80'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>2. Omslagsstudio (Illustrere Omslag)</span>
        </button>

        <button
          id="tab-visual-full-book"
          type="button"
          onClick={() => setActiveTab('full-book')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'full-book'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>3. Illustrer Hele Boken (Fremgangsvisning)</span>
        </button>

        <button
          id="tab-visual-illustrations"
          type="button"
          onClick={() => setActiveTab('illustrations')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'illustrations'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/80'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>4. Kapittelplater ({illustratedChaptersCount}/{chapters.length})</span>
        </button>
      </div>

      {/* 1. THEME TEMPLATES GALLERY TAB */}
      {activeTab === 'templates' && (
        <ThemeTemplateGallery
          project={project}
          onApplyTemplate={handleApplyTemplate}
          activeTemplateId={coverConfig.templateThemeId}
        />
      )}

      {/* 2. COVER STUDIO (ILLUSTRATING COVERS) TAB */}
      {activeTab === 'cover' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* AI Cover Illustration Generator Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Illustrere Bokomslag (AI Kunst)
                </h3>
                {hasCoverArt && (
                  <button
                    type="button"
                    onClick={handleRemoveCoverArtwork}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Fjern kunst</span>
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Instruksjon / Prompt for omslagskunst
                </label>
                <textarea
                  rows={3}
                  value={customCoverPrompt}
                  onChange={(e) => setCustomCoverPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none font-serif leading-relaxed"
                />
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  id="btn-generate-cover-art"
                  onClick={handleGenerateCoverArtwork}
                  disabled={isGeneratingCoverArt}
                  className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingCoverArt ? 'animate-spin' : ''}`} />
                  <span>
                    {isGeneratingCoverArt
                      ? 'Genererer omslagskunst...'
                      : hasCoverArt
                      ? 'Regenerer omslagskunst (AI)'
                      : 'Generer omslagskunst (AI)'}
                  </span>
                </button>
              </div>
            </div>

            {/* General Typography & Cover Architecture Controls */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Omslagsarkitektur &amp; Typografi
                </h3>
                <button
                  type="button"
                  onClick={handleRandomizeMotif}
                  disabled={isSynthesizing}
                  className="px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isSynthesizing ? 'animate-spin' : ''}`} />
                  <span>Forny motiv</span>
                </button>
              </div>

              {/* View mode toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Visningsperspektiv</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['front', 'back', 'wrap'] as const).map((m) => (
                    <button
                      key={m}
                      id={`btn-view-${m}`}
                      type="button"
                      onClick={() => setViewMode(m)}
                      className={`py-1.5 px-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all ${
                        viewMode === m
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motif Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Vektor-ornamentikk / Emblem</label>
                <select
                  value={coverConfig.motif}
                  onChange={(e) => updateCoverConfig({ motif: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="celestial-crest">Celestial Harmonic Crest (Stjernebrodert)</option>
                  <option value="minimalist-geometric">Minimalist Geometric Diamond (Moderne)</option>
                  <option value="architectural-lines">Monumental Architectural Lines (Søyler)</option>
                  <option value="botanical-filigree">Organic Botanical Filigree (Floralt)</option>
                </select>
              </div>

              {/* Typography */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Typografi &amp; Skriftfamilie</label>
                <select
                  value={coverConfig.fontFamily}
                  onChange={(e) => updateCoverConfig({ fontFamily: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="cinzel">Cinzel (Klassisk forgylt luksus-serif)</option>
                  <option value="serif">Newsreader (Varm litterær roman-serif)</option>
                  <option value="sans">Plus Jakarta (Moderne geometrisk sans)</option>
                </select>
              </div>

              {/* Color Palettes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">Aksent / Folie-farge</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={coverConfig.accentColor}
                      onChange={(e) => updateCoverConfig({ accentColor: e.target.value })}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300 uppercase">
                      {coverConfig.accentColor}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">Bakgrunnstone</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={coverConfig.bgColor}
                      onChange={(e) => updateCoverConfig({ bgColor: e.target.value })}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300 uppercase">
                      {coverConfig.bgColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Spine width & back blurb */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label className="text-xs font-medium text-slate-300 block">Bokrygg &amp; Bakside-tekst (Blurb)</label>
                <textarea
                  rows={3}
                  value={coverConfig.backCoverBlurb}
                  onChange={(e) => updateCoverConfig({ backCoverBlurb: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none font-serif leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Beregnet ryggbredde:</span>
                  <span className="font-mono text-amber-300 font-bold">{coverConfig.spineWidthMm} mm</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={40}
                  value={coverConfig.spineWidthMm}
                  onChange={(e) => updateCoverConfig({ spineWidthMm: parseInt(e.target.value, 10) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right: Live Rendered Canvas (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
            <div className="w-full max-w-md">
              <CoverCanvas config={coverConfig} mode={viewMode} />
            </div>

            <p className="text-[11px] text-slate-400 mt-4 text-center font-mono">
              Levende Omslagsforhåndsvisning &bull; Klar for EPUB Tittelside &amp; Trykk-omslag
            </p>
          </div>
        </div>
      )}

      {/* 3. FULL BOOK ILLUSTRATOR TAB */}
      {activeTab === 'full-book' && (
        <FullBookIllustrator project={project} onProjectUpdated={onProjectUpdated} />
      )}

      {/* 4. CHAPTER ILLUSTRATIONS TAB */}
      {activeTab === 'illustrations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-100">
                Individuelle Kapittelplater ({illustratedChaptersCount} av {chapters.length} illustrert)
              </h2>
              <p className="text-xs text-slate-400">
                Tilpass og forny illustrasjoner for hvert enkelt kapittel. Bildene plasseres øverst i hvert kapittel i boken.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chapters.map((chap) => {
              const hasImg = Boolean(chap.illustrationUrl);

              return (
                <div
                  key={chap.chapterNumber}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif font-bold text-amber-400">
                        Kapittel {chap.chapterNumber}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {chap.title}
                      </span>
                    </div>

                    {hasImg ? (
                      <div className="space-y-3">
                        <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-[16/9] bg-slate-950">
                          <img
                            src={chap.illustrationUrl}
                            alt={chap.title}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">
                            Scene-beskrivelse
                          </span>
                          <p className="text-slate-200 leading-relaxed font-serif text-[11px]">
                            &ldquo;{chap.illustrationPrompt || chap.summary}&rdquo;
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Aktiv i boken
                          </span>
                          <span>POV: {chap.povCharacter}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center space-y-3 border border-dashed border-slate-800 rounded-lg">
                        <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-xs text-slate-400">Ingen illustrasjonsplate bundet til dette kapittelet.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleIllustrateChapter(chap.chapterNumber)}
                      className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{hasImg ? 'Regenerer plate for Kapittel ' + chap.chapterNumber : 'Illustrer Kapittel ' + chap.chapterNumber}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
