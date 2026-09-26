/**
 * BookForge AI Artistic Plate Synthesizer
 * Generates high-fidelity visual artwork as SVG data URLs for book covers and chapter plates.
 */

interface ArtSynthOptions {
  prompt: string;
  style?: string;
  title?: string;
  chapterNumber?: number;
  target?: string;
}

export function generateArtisticSvgPlate(options: ArtSynthOptions): string {
  const { prompt, style = '', title = 'BookForge AI', chapterNumber, target = 'illustration' } = options;

  // Determine atmospheric color theme based on prompt/style
  const text = `${prompt} ${style}`.toLowerCase();

  let c1 = '#090e17';
  let c2 = '#1a2b4c';
  let c3 = '#38bdf8';
  let gold = '#d4af37';
  let themeName = 'Celestial Night';

  if (text.includes('gold') || text.includes('gothic') || text.includes('vampire') || text.includes('grimoire')) {
    c1 = '#09080c';
    c2 = '#231526';
    c3 = '#f59e0b';
    gold = '#fbbf24';
    themeName = 'Gothic Midnight';
  } else if (text.includes('emerald') || text.includes('forest') || text.includes('woodland') || text.includes('moss')) {
    c1 = '#05140f';
    c2 = '#0b3322';
    c3 = '#10b981';
    gold = '#34d399';
    themeName = 'Emerald Sylvan';
  } else if (text.includes('crimson') || text.includes('blood') || text.includes('royal') || text.includes('throne') || text.includes('flame')) {
    c1 = '#180a0f';
    c2 = '#380e18';
    c3 = '#f43f5e';
    gold = '#fbbf24';
    themeName = 'Imperial Crimson';
  } else if (text.includes('cyber') || text.includes('neon') || text.includes('future') || text.includes('matrix')) {
    c1 = '#08080f';
    c2 = '#1b1035';
    c3 = '#06b6d4';
    gold = '#ec4899';
    themeName = 'Cyber Basalt';
  } else if (text.includes('cottage') || text.includes('watercolor') || text.includes('whimsical') || text.includes('child')) {
    c1 = '#171412';
    c2 = '#362319';
    c3 = '#fb923c';
    gold = '#fde047';
    themeName = 'Golden Hour Fable';
  } else if (text.includes('snow') || text.includes('ice') || text.includes('nordic') || text.includes('winter')) {
    c1 = '#080e1a';
    c2 = '#162842';
    c3 = '#93c5fd';
    gold = '#e0f2fe';
    themeName = 'Arctic Solitude';
  }

  // Generate deterministic stars/particles based on string hash
  let seed = 0;
  for (let i = 0; i < prompt.length; i++) {
    seed = (seed * 31 + prompt.charCodeAt(i)) % 100000;
  }
  const stars: Array<{ x: number; y: number; r: number; o: number }> = [];
  for (let i = 0; i < 36; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const x = Math.abs(seed % 760) + 20;
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const y = Math.abs(seed % 500) + 20;
    const r = (i % 3 === 0 ? 2 : 1) + (i % 5 === 0 ? 1 : 0);
    const o = 0.3 + ((i % 7) / 10);
    stars.push({ x, y, r, o });
  }

  const isCover = target.includes('cover');
  const label = isCover
    ? `${title.toUpperCase()} \u2022 FRONT COVER ART`
    : chapterNumber
    ? `CHAPTER ${chapterNumber} \u2022 LITERARY PLATE`
    : 'BOOK ILLUMINATION PLATE';

  // Sanitize text for XML
  const safeTitle = title.replace(/[<>&"]/g, '');
  const safePrompt = prompt.slice(0, 120).replace(/[<>&"]/g, '');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1060" width="800" height="1060">
  <defs>
    <radialGradient id="skyGrad" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="${c2}" />
      <stop offset="65%" stop-color="${c1}" />
      <stop offset="100%" stop-color="#020408" />
    </radialGradient>
    <linearGradient id="mistGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${c3}" stop-opacity="0" />
      <stop offset="50%" stop-color="${c3}" stop-opacity="0.18" />
      <stop offset="100%" stop-color="${c1}" stop-opacity="0.95" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gold}" />
      <stop offset="50%" stop-color="#fff5cf" />
      <stop offset="100%" stop-color="${gold}" />
    </linearGradient>
    <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${gold}" stop-opacity="0.2" />
      <stop offset="50%" stop-color="${gold}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${gold}" stop-opacity="0.2" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Canvas Base -->
  <rect width="800" height="1060" fill="url(#skyGrad)" />

  <!-- Stars & Constellations -->
  <g fill="#ffffff">
    ${stars.map((s) => `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" opacity="${s.o}" />`).join('\n    ')}
  </g>

  <!-- Celestial Orb / Moon -->
  <g filter="url(#glow)">
    <circle cx="400" cy="360" r="140" fill="${gold}" opacity="0.08" />
    <circle cx="400" cy="360" r="100" fill="url(#goldGrad)" opacity="0.25" />
    <circle cx="400" cy="360" r="70" fill="#ffffff" opacity="0.15" />
  </g>

  <!-- Sacred Geometric Linework -->
  <g stroke="${gold}" stroke-width="1" opacity="0.4" fill="none">
    <circle cx="400" cy="360" r="180" stroke-dasharray="4 6" />
    <circle cx="400" cy="360" r="230" stroke-opacity="0.25" />
    <polygon points="400,160 490,440 250,265 550,265 310,440" stroke-opacity="0.2" />
    <line x1="150" y1="360" x2="650" y2="360" stroke-dasharray="2 4" stroke-opacity="0.3" />
    <line x1="400" y1="120" x2="400" y2="600" stroke-dasharray="2 4" stroke-opacity="0.3" />
  </g>

  <!-- Layer 1 Distant Mountains Silhouette -->
  <path d="M 0 620 L 120 520 L 260 580 L 400 480 L 550 560 L 680 500 L 800 610 L 800 1060 L 0 1060 Z"
        fill="${c1}" opacity="0.8" />

  <!-- Layer 2 Middle Spire / Mountain Silhouette -->
  <path d="M 0 710 L 180 620 L 320 670 L 400 590 L 480 670 L 620 610 L 800 700 L 800 1060 L 0 1060 Z"
        fill="#04070d" opacity="0.92" />

  <!-- Layer 3 Foreground Architectural Citadel Silhouette -->
  <g fill="#020306">
    <path d="M 120 850 L 120 740 L 140 700 L 160 740 L 160 850 Z" />
    <path d="M 370 850 L 370 660 L 400 600 L 430 660 L 430 850 Z" />
    <path d="M 640 850 L 640 720 L 660 670 L 680 720 L 680 850 Z" />
    <path d="M 0 820 Q 200 790 400 810 Q 600 830 800 800 L 800 1060 L 0 1060 Z" />
  </g>

  <!-- Atmospheric Ground Mist -->
  <rect x="0" y="580" width="800" height="480" fill="url(#mistGrad)" />

  <!-- Decorative Inner Border & Folio Corners -->
  <rect x="36" y="36" width="728" height="988" fill="none" stroke="url(#frameGrad)" stroke-width="1.5" />
  <rect x="46" y="46" width="708" height="968" fill="none" stroke="${gold}" stroke-width="0.8" opacity="0.3" stroke-dasharray="6 4" />

  <!-- Corner Accents -->
  <g stroke="${gold}" stroke-width="1.8" fill="none" opacity="0.75">
    <path d="M 30 50 L 50 50 L 50 30" />
    <path d="M 770 50 L 750 50 L 750 30" />
    <path d="M 30 1010 L 50 1010 L 50 1030" />
    <path d="M 770 1010 L 750 1010 L 750 1030" />
  </g>

  <!-- Typography Plaque at Bottom -->
  <g>
    <!-- Darkened plaque backdrop -->
    <rect x="60" y="880" width="680" height="110" rx="10" fill="#03050a" fill-opacity="0.85" stroke="url(#frameGrad)" stroke-width="1" />
    <text x="400" y="915" text-anchor="middle" font-family="'Cinzel', 'Times New Roman', serif" font-size="13" font-weight="700" letter-spacing="4" fill="${gold}">
      ${label}
    </text>
    <text x="400" y="942" text-anchor="middle" font-family="'Cinzel', 'Times New Roman', serif" font-size="20" font-weight="700" letter-spacing="2" fill="#ffffff">
      ${safeTitle}
    </text>
    <text x="400" y="968" text-anchor="middle" font-family="sans-serif" font-size="11" font-style="italic" fill="#94a3b8">
      &ldquo;${safePrompt}&rdquo;
    </text>
  </g>
</svg>
`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
