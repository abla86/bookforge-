import React, { useState, useMemo } from 'react';
import {
  Palette,
  Sparkles,
  Check,
  Search,
  BookOpen,
  Layers,
  ArrowRight,
  Sliders,
  Filter
} from 'lucide-react';
import { BookTemplate, Project, VisualCoverConfig } from '../types';
import { BOOK_TEMPLATES } from '../data/bookTemplates';

interface ThemeTemplateGalleryProps {
  project: Project;
  onApplyTemplate: (template: BookTemplate) => void;
  activeTemplateId?: string;
}

export const ThemeTemplateGallery: React.FC<ThemeTemplateGalleryProps> = ({
  project,
  onApplyTemplate,
  activeTemplateId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'Alle maler' },
    { id: 'scifi_fantasy', label: 'Sci-Fi & Fantasy' },
    { id: 'mystery_thriller', label: 'Krim & Thriller' },
    { id: 'classical', label: 'Klassisk & Kongelig' },
    { id: 'children_cozy', label: 'Barn & Eventyr' },
    { id: 'poetry_art', label: 'Poesi & Filosofi' },
    { id: 'fiction', label: 'Sakprosa & Fiksjon' }
  ];

  const filteredTemplates = useMemo(() => {
    return BOOK_TEMPLATES.filter((tmpl) => {
      const matchesCategory = selectedCategory === 'all' || tmpl.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        tmpl.name.toLowerCase().includes(query) ||
        tmpl.description.toLowerCase().includes(query) ||
        tmpl.idealFor.toLowerCase().includes(query) ||
        tmpl.badge.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="space-y-1">
          <h2 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <span>Bibliotek for Tema-maler &amp; Visuell Forhåndsvisning</span>
          </h2>
          <p className="text-xs text-slate-400">
            Velg et helhetlig designtema som definerer omslagsfarger, font-typografi, vektorornamentikk og stilretning for alle bok-illustrasjoner.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Søk etter stil, sjanger..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const isSelected = activeTemplateId === template.id || project.coverConfig?.templateThemeId === template.id;

          return (
            <div
              key={template.id}
              className={`rounded-xl border transition-all flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'bg-slate-900/95 border-amber-500/60 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Miniature Cover Preview Card */}
              <div
                className="relative h-44 p-4 flex flex-col justify-between overflow-hidden border-b border-white/10 select-none"
                style={{ backgroundColor: template.coverConfig.bgColor || '#090e17' }}
              >
                {/* Subtle textured overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                <div
                  className="absolute inset-2.5 rounded border pointer-events-none opacity-40"
                  style={{ borderColor: template.palette.accent }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <span
                    className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm border"
                    style={{ color: template.palette.accent, borderColor: `${template.palette.accent}40` }}
                  >
                    {template.badge}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <Check className="w-2.5 h-2.5" />
                      AKTIV MAL
                    </span>
                  )}
                </div>

                {/* Center Title & Motif Indicator */}
                <div className="relative z-10 my-auto text-center space-y-1 py-1">
                  <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center border border-white/20 bg-black/30 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4" style={{ color: template.palette.accent }} />
                  </div>
                  <h3
                    className={`text-sm font-bold uppercase tracking-wider drop-shadow line-clamp-1 ${
                      template.coverConfig.fontFamily === 'cinzel'
                        ? 'font-serif'
                        : template.coverConfig.fontFamily === 'sans'
                        ? 'font-sans'
                        : 'font-serif italic'
                    }`}
                    style={{ color: template.palette.text }}
                  >
                    {project.title || template.name}
                  </h3>
                  <p className="text-[10px] font-light italic truncate max-w-[85%] mx-auto" style={{ color: template.palette.accent }}>
                    {project.author || 'Forfatter'}
                  </p>
                </div>

                {/* Bottom Color Palette Chips */}
                <div className="relative z-10 flex items-center justify-between pt-1 border-t border-white/10">
                  <span className="text-[9px] uppercase font-mono text-slate-400">Palett</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      title={`Aksent: ${template.palette.accent}`}
                      className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: template.palette.accent }}
                    />
                    <span
                      title={`Sekundær: ${template.palette.secondary}`}
                      className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: template.palette.secondary }}
                    />
                    <span
                      title={`Bakgrunn: ${template.palette.bg}`}
                      className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: template.palette.bg }}
                    />
                  </div>
                </div>
              </div>

              {/* Body Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-serif font-bold text-slate-100 flex items-center justify-between">
                      <span>{template.name}</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Ideell for:</span>
                      <span className="text-slate-200 font-medium truncate max-w-[70%]">{template.idealFor}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Font &amp; Motiv:</span>
                      <span className="text-amber-300 font-mono capitalize">
                        {template.coverConfig.fontFamily} &bull; {template.coverConfig.motif?.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onApplyTemplate(template)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Aktiv for denne boken</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Bruk denne malen på boken</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
