import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  Eye,
  Sliders,
  Maximize2
} from 'lucide-react';
import { Project, Chapter } from '../types';
import { generateBookImage } from '../services/orchestratorService';

interface FullBookIllustratorProps {
  project: Project;
  onProjectUpdated: (project: Project) => void;
}

export const FullBookIllustrator: React.FC<FullBookIllustratorProps> = ({
  project,
  onProjectUpdated
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentStepName, setCurrentStepName] = useState<string>('');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [previewModalImage, setPreviewModalImage] = useState<{ url: string; title: string; prompt: string } | null>(null);

  const chapters = project.chapters || [];
  const coverConfig = project.coverConfig;
  const artStyle = project.intent?.visualArtStyle || 'Cinematic literary illustration, dramatic atmospheric lighting, detailed book plate quality.';

  // Metrics
  const hasCoverArt = Boolean(coverConfig?.coverImageUrl);
  const illustratedChaptersCount = chapters.filter((c) => Boolean(c.illustrationUrl)).length;
  const totalElements = 1 + chapters.length; // 1 cover + N chapters
  const completedElements = (hasCoverArt ? 1 : 0) + illustratedChaptersCount;
  const progressPercentage = Math.round((completedElements / totalElements) * 100);

  // Batch runner to illustrate the entire book step-by-step
  const handleStartFullBookIllustration = async () => {
    setIsRunning(true);
    setIsPaused(false);

    let currentProject = { ...project };

    try {
      // Step 1: Front Cover
      if (!currentProject.coverConfig?.coverImageUrl) {
        setCurrentStepName(`Genererer omslagsillustrasjon for "${currentProject.title}"...`);
        setActiveStepIndex(1);

        const coverPrompt = `Full cover artwork for literary book titled "${currentProject.title}". Subtitle: "${currentProject.subtitle || ''}". Premise: ${currentProject.intent?.logline || currentProject.rawIdea}. Dramatic centerpiece composition.`;
        const coverResult = await generateBookImage(coverPrompt, artStyle, '3:4', {
          title: currentProject.title,
          target: 'cover_front'
        });

        currentProject = {
          ...currentProject,
          coverConfig: {
            ...currentProject.coverConfig,
            coverImageUrl: coverResult.imageUrl
          },
          visualAssets: [
            ...currentProject.visualAssets.filter((a) => a.type !== 'cover_front'),
            {
              id: `asset-cover-front-${Date.now()}`,
              type: 'cover_front',
              title: `Front Cover: ${currentProject.title}`,
              prompt: coverPrompt,
              style: artStyle,
              imageUrl: coverResult.imageUrl,
              placementDescription: 'Book Front Cover'
            }
          ],
          updatedAt: new Date().toISOString()
        };
        onProjectUpdated(currentProject);
      }

      // Steps 2 to N: Each Chapter
      for (let i = 0; i < currentProject.chapters.length; i++) {
        const chap = currentProject.chapters[i];
        setCurrentStepName(`Illustrerer Kapittel ${chap.chapterNumber}: "${chap.title}" (${i + 1} av ${currentProject.chapters.length})...`);
        setActiveStepIndex(i + 2);

        const chapterPrompt = chap.illustrationPrompt || `Dramatic scene illustration for chapter ${chap.chapterNumber}: ${chap.title}. POV: ${chap.povCharacter}. Summary: ${chap.summary || currentProject.title}. Atmospheric lighting and rich environmental detail.`;

        const imgResult = await generateBookImage(chapterPrompt, artStyle, '3:4', {
          title: currentProject.title,
          chapterNumber: chap.chapterNumber,
          target: 'illustration'
        });

        const updatedChapters = [...currentProject.chapters];
        updatedChapters[i] = {
          ...chap,
          illustrationUrl: imgResult.imageUrl,
          illustrationCaption: `Kapittel ${chap.chapterNumber}: ${chap.title}`,
          illustrationPrompt: chapterPrompt
        };

        const existingAssetIdx = currentProject.visualAssets.findIndex(
          (a) => a.type === 'illustration' && a.chapterNumber === chap.chapterNumber
        );
        let updatedAssets = [...currentProject.visualAssets];
        const newAsset = {
          id: `asset-ill-ch${chap.chapterNumber}-${Date.now()}`,
          type: 'illustration' as const,
          chapterNumber: chap.chapterNumber,
          title: `Plate: Kapittel ${chap.chapterNumber} - ${chap.title}`,
          prompt: chapterPrompt,
          style: artStyle,
          imageUrl: imgResult.imageUrl,
          placementDescription: `Kapittel ${chap.chapterNumber} innledning`
        };

        if (existingAssetIdx >= 0) {
          updatedAssets[existingAssetIdx] = newAsset;
        } else {
          updatedAssets.push(newAsset);
        }

        currentProject = {
          ...currentProject,
          chapters: updatedChapters,
          visualAssets: updatedAssets,
          updatedAt: new Date().toISOString()
        };
        onProjectUpdated(currentProject);
      }

      setCurrentStepName('Boken er ferdig illustrert!');
    } catch (error: any) {
      console.error('Full book illustration error:', error);
      alert(`Feil under illustrering: ${error?.message || error}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Generate an individual chapter's illustration
  const handleIllustrateSingleChapter = async (chapterNumber: number) => {
    const chapIndex = project.chapters.findIndex((c) => c.chapterNumber === chapterNumber);
    if (chapIndex === -1) return;

    const chap = project.chapters[chapIndex];
    const prompt = chap.illustrationPrompt || `Dramatic scene illustration for Chapter ${chap.chapterNumber}: "${chap.title}". Setting: ${project.title}. Rich book plate composition.`;

    try {
      const result = await generateBookImage(prompt, artStyle, '3:4', {
        title: project.title,
        chapterNumber: chap.chapterNumber,
        target: 'illustration'
      });

      const updatedChapters = [...project.chapters];
      updatedChapters[chapIndex] = {
        ...chap,
        illustrationUrl: result.imageUrl,
        illustrationCaption: `Kapittel ${chap.chapterNumber}: ${chap.title}`,
        illustrationPrompt: prompt
      };

      onProjectUpdated({
        ...project,
        chapters: updatedChapters,
        visualAssets: [
          ...project.visualAssets.filter(
            (a) => !(a.type === 'illustration' && a.chapterNumber === chap.chapterNumber)
          ),
          {
            id: `asset-ill-ch${chap.chapterNumber}-${Date.now()}`,
            type: 'illustration',
            chapterNumber: chap.chapterNumber,
            title: `Plate: Kapittel ${chap.chapterNumber} - ${chap.title}`,
            prompt,
            style: artStyle,
            imageUrl: result.imageUrl,
            placementDescription: `Kapittel ${chap.chapterNumber} innledning`
          }
        ],
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      alert(`Kunne ikke illustrere kapittel: ${err?.message || err}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview & Live Progress Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold">
              Bok-Illustratør &bull; Helhetlig Kunstprosess
            </span>
            <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Illustrer Hele Boken med Fremgangsvisning</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Generer samstemte illustrasjoner for bokomslaget og alle {chapters.length} kapitler i én koordinert arbeidsflyt. Bildene integreres direkte på omslaget og inne i boken.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              id="btn-illustrate-entire-book"
              onClick={handleStartFullBookIllustration}
              disabled={isRunning}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Illustrerer...' : 'Illustrer hele boken (AI)'}</span>
            </button>
          </div>
        </div>

        {/* Live Visual Progress Bar */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">Fremgangsvisning:</span>
              <span className="font-mono text-amber-300 font-bold">
                {completedElements} av {totalElements} elementer illustrert
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-400 text-sm">
                {progressPercentage}%
              </span>
              {progressPercentage === 100 && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Fullført
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar Line */}
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Current Running State Banner */}
          {isRunning && (
            <div className="flex items-center gap-2 text-xs font-mono text-amber-200 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/30">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
              <span>{currentStepName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of All Illustrated Plates in the Book */}
      <div className="space-y-4">
        <h3 className="text-sm font-serif font-bold text-slate-200 flex items-center justify-between">
          <span>Oversikt over alle illustrerte plater i boken ({totalElements} elementer)</span>
          <span className="text-xs font-mono text-slate-400 font-normal">
            Aktiv stil: {project.intent?.visualArtStyle ? 'Egendefinert' : 'Standard'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Front Cover Artwork */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
            <div className="relative aspect-[3/2] bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800">
              {coverConfig?.coverImageUrl ? (
                <>
                  <img
                    src={coverConfig.coverImageUrl}
                    alt="Omslag"
                    className="w-full h-full object-cover object-center"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewModalImage({
                        url: coverConfig.coverImageUrl!,
                        title: `Omslagsillustrasjon: ${project.title}`,
                        prompt: 'Bokens frontomslagskunst'
                      })
                    }
                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-black/60 text-slate-200 hover:text-white border border-white/20 backdrop-blur-sm"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500">Intet omslagsbilde generert ennå</p>
                </div>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-amber-400">
                  Bokomslag (Front Cover)
                </span>
                {hasCoverArt ? (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Illustrert
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Venter
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">
                Hovedomslaget brukes på forsiden, i boken og i EPUB-tittelsiden.
              </p>
            </div>
          </div>

          {/* Cards 2..N: Chapter Plates */}
          {chapters.map((chap) => {
            const hasImg = Boolean(chap.illustrationUrl);

            return (
              <div
                key={chap.chapterNumber}
                className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-[3/2] bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800">
                  {hasImg ? (
                    <>
                      <img
                        src={chap.illustrationUrl}
                        alt={chap.title}
                        className="w-full h-full object-cover object-center"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewModalImage({
                            url: chap.illustrationUrl!,
                            title: `Kapittel ${chap.chapterNumber}: ${chap.title}`,
                            prompt: chap.illustrationPrompt || chap.title
                          })
                        }
                        className="absolute right-2 top-2 p-1.5 rounded-lg bg-black/60 text-slate-200 hover:text-white border border-white/20 backdrop-blur-sm"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-500">Mangler illustrasjon</p>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-slate-200">
                      Kapittel {chap.chapterNumber}
                    </span>
                    {hasImg ? (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Illustrert
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        Venter
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-medium line-clamp-1">
                    {chap.title}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-2 italic font-serif">
                    &ldquo;{chap.illustrationPrompt || chap.summary || 'Ingen egendefinert prompt'}&rdquo;
                  </p>

                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleIllustrateSingleChapter(chap.chapterNumber)}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{hasImg ? 'Regenerer plate' : 'Illustrer dette kapittelet'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {previewModalImage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-serif font-bold text-slate-100">
                {previewModalImage.title}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Lukk
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black max-h-[500px] flex items-center justify-center">
              <img
                src={previewModalImage.url}
                alt={previewModalImage.title}
                className="max-h-[500px] w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-400 italic">
              {previewModalImage.prompt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
