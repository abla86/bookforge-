import { BookTemplate } from '../types';

export const BOOK_TEMPLATES: BookTemplate[] = [
  {
    id: 'nordic-noir',
    name: 'Nordisk Noir & Kalt Skifer',
    category: 'mystery_thriller',
    description: 'Kald skifergrå tone med arktisk isblå aksent, skarp typografi og dyster, stemningsfull atmosfære.',
    badge: 'Nordic Noir',
    coverConfig: {
      accentColor: '#38bdf8',
      bgColor: '#0b111e',
      fontFamily: 'cinzel',
      motif: 'minimalist-geometric'
    },
    artStyle: 'Atmospheric Nordic Noir, cold slate tones, dramatic mist and volumetric fog, high contrast, cinematic chiaroscuro, subtle icy blue highlights.',
    samplePrompt: 'Solitary figure walking through a dense snow-covered fjord forest at twilight, cold mist, sharp silhouette, icy blue ambiance.',
    palette: {
      bg: '#0b111e',
      accent: '#38bdf8',
      secondary: '#64748b',
      text: '#f8fafc'
    },
    idealFor: 'Krim, psykologisk thriller, nordisk spenning og dystre mysterier',
    previewMotif: 'minimalist-geometric'
  },
  {
    id: 'gothic-midnight',
    name: 'Gotisk Natt & Gullfiligran',
    category: 'scifi_fantasy',
    description: 'Fløyelsmyk midnattsort med antikt polert gull, intrikat ornamentikk og kongelig mystikk.',
    badge: 'Mørk Fantasy',
    coverConfig: {
      accentColor: '#d4af37',
      bgColor: '#09080c',
      fontFamily: 'cinzel',
      motif: 'celestial-crest'
    },
    artStyle: 'Dark Gothic oil painting on canvas, heavy velvet shadows, radiant antique gold leaf detailing, baroque mood, dramatic rim lighting.',
    samplePrompt: 'An ancient gothic cathedral tower framed by eclipsed blood moon, arcane gold sigils glowing in the obsidian darkness.',
    palette: {
      bg: '#09080c',
      accent: '#d4af37',
      secondary: '#9333ea',
      text: '#fafafa'
    },
    idealFor: 'Mørk fantasy, gotiske romaner, okkulte grimoarer og episk spenning',
    previewMotif: 'celestial-crest'
  },
  {
    id: 'cosmic-retro',
    name: 'Retro-Futuristisk Kosmos',
    category: 'scifi_fantasy',
    description: 'Dyp koboltblå og neon-cyan linjer inspirert av 70- og 80-tallets klassiske romodysséer.',
    badge: 'Sci-Fi Classic',
    coverConfig: {
      accentColor: '#22d3ee',
      bgColor: '#060b17',
      fontFamily: 'sans',
      motif: 'minimalist-geometric'
    },
    artStyle: 'Retro-futuristic 1970s sci-fi paperback concept art, rich gouache and airbrush textures, glowing neon cyan nebulae, cosmic dust grids.',
    samplePrompt: 'Orbital space station floating above a ringed cyan gas giant, distant stars and sleek interstellar cruiser.',
    palette: {
      bg: '#060b17',
      accent: '#22d3ee',
      secondary: '#818cf8',
      text: '#e2e8f0'
    },
    idealFor: 'Hard sci-fi, romoperaer, kunstig intelligens og fremtidsvisjoner',
    previewMotif: 'minimalist-geometric'
  },
  {
    id: 'cozy-botanical',
    name: 'Varm Botanisk Eventyrbok',
    category: 'children_cozy',
    description: 'Myk pergament med salviegrønne og ferskenfargede toner, florale kurver og lun hjertevarme.',
    badge: 'Koselig & Barnebok',
    coverConfig: {
      accentColor: '#fb923c',
      bgColor: '#171412',
      fontFamily: 'serif',
      motif: 'botanical-filigree'
    },
    artStyle: 'Whimsical watercolor and colored pencil children\'s book illustration, soft textured paper, warm golden hour tones, gentle organic shapes.',
    samplePrompt: 'A cozy cottage hidden beneath giant glowing wild mushrooms in an enchanted mossy woodland, warm lanterns hanging from oak branches.',
    palette: {
      bg: '#171412',
      accent: '#fb923c',
      secondary: '#84cc16',
      text: '#fef3c7'
    },
    idealFor: 'Barnebøker, fabel, hjertevarm feelgood og naturpoesi',
    previewMotif: 'botanical-filigree'
  },
  {
    id: 'classical-sovereign',
    name: 'Klassisk Forgylt Kongerike',
    category: 'classical',
    description: 'Keiserlig burgunder med dyp preget messinggull, monumentale søyler og tidløs verdighet.',
    badge: 'Mesterverk',
    coverConfig: {
      accentColor: '#f59e0b',
      bgColor: '#180a0f',
      fontFamily: 'cinzel',
      motif: 'architectural-lines'
    },
    artStyle: 'Classical Renaissance museum oil painting, rich imperial crimson drapery, warm burnished gold highlights, masterful chiaroscuro.',
    samplePrompt: 'A royal marble throne chamber with tall arched colonnades, gilded tapestries and sunlight piercing through high clerestory windows.',
    palette: {
      bg: '#180a0f',
      accent: '#f59e0b',
      secondary: '#dc2626',
      text: '#fffbeb'
    },
    idealFor: 'Historiske romaner, dynastier, filosofiske verker og klassikere',
    previewMotif: 'architectural-lines'
  },
  {
    id: 'cyber-neon',
    name: 'Cyberpunk Basalt & Neonlys',
    category: 'scifi_fantasy',
    description: 'Ultramørk basalt med pulserende elektrisk fiolett og laserskarp moderne typografi.',
    badge: 'Cyberpunk',
    coverConfig: {
      accentColor: '#f43f5e',
      bgColor: '#08080c',
      fontFamily: 'sans',
      motif: 'minimalist-geometric'
    },
    artStyle: 'High-contrast cyberpunk concept art, wet asphalt reflecting neon signage, holographic displays, cybernetic silhouettes, dark noir atmosphere.',
    samplePrompt: 'Rain-soaked megacity alleyway illuminated by towering vertical neon advertisements, cyborg detective walking through steam.',
    palette: {
      bg: '#08080c',
      accent: '#f43f5e',
      secondary: '#06b6d4',
      text: '#f1f5f9'
    },
    idealFor: 'Cyberpunk, techno-thrillere, dystopier og virtuell virkelighet',
    previewMotif: 'minimalist-geometric'
  },
  {
    id: 'victorian-mystery',
    name: 'Viktoriansk Mysterium & Blekkhus',
    category: 'mystery_thriller',
    description: 'Gammelt blekkhus og messing, patinert lær og tåkelagte brosteinsgater i London.',
    badge: 'Viktoriansk',
    coverConfig: {
      accentColor: '#d97706',
      bgColor: '#120d09',
      fontFamily: 'serif',
      motif: 'botanical-filigree'
    },
    artStyle: 'Detailed Victorian woodcut engraving and sepia ink wash, gaslamp illumination, atmospheric rain-slicked cobbles, intricate hatch lines.',
    samplePrompt: 'A shadowy horse-drawn carriage speeding across Westminster Bridge at midnight, gaslights casting golden halos into thick river fog.',
    palette: {
      bg: '#120d09',
      accent: '#d97706',
      secondary: '#78350f',
      text: '#fef3c7'
    },
    idealFor: 'Sherlock-aktige mysterier, historisk krim, viktorianske hemmeligheter',
    previewMotif: 'botanical-filigree'
  },
  {
    id: 'epic-high-fantasy',
    name: 'Episk Høyland & Dragefjell',
    category: 'scifi_fantasy',
    description: 'Smaragdgrønn urskog og antikk bronse med heraldisk våpenskjold og mytisk storhet.',
    badge: 'Episk Fantasy',
    coverConfig: {
      accentColor: '#10b981',
      bgColor: '#05140f',
      fontFamily: 'cinzel',
      motif: 'celestial-crest'
    },
    artStyle: 'Epic high fantasy landscape painting, towering emerald peaks, cascading waterfalls, ancient runic stone circles, heroic cinematic scale.',
    samplePrompt: 'A majestic citadel carved directly into the sheer cliffs of misty green mountains, an ancient dragon circling the highest spire.',
    palette: {
      bg: '#05140f',
      accent: '#10b981',
      secondary: '#047857',
      text: '#ecfdf5'
    },
    idealFor: 'Høyland-fantasy, sverd & magi, alveriker og legender',
    previewMotif: 'celestial-crest'
  },
  {
    id: 'zen-minimalist',
    name: 'Japansk Zen & Blekkmaling',
    category: 'poetry_art',
    description: 'Rent kullsort og cinnabar-rødt med wabi-sabi enkelhet, romslig hvile og dyp ettertanke.',
    badge: 'Zen & Filosofi',
    coverConfig: {
      accentColor: '#ef4444',
      bgColor: '#111113',
      fontFamily: 'sans',
      motif: 'minimalist-geometric'
    },
    artStyle: 'Traditional Japanese sumi-e ink wash painting, bold expressive brushstrokes, ample negative space, delicate vermillion cinnabar seal, calm minimalism.',
    samplePrompt: 'Solitary curved pine branch on a misty mountain precipice overlooking a tranquil silent lake at dawn, crimson sun rising.',
    palette: {
      bg: '#111113',
      accent: '#ef4444',
      secondary: '#71717a',
      text: '#fafafa'
    },
    idealFor: 'Poesi, essays, meditasjon, filosofi og minimalistisk prosa',
    previewMotif: 'minimalist-geometric'
  },
  {
    id: 'nordic-nonfiction',
    name: 'Moderne Skandinavisk Sakprosa',
    category: 'fiction',
    description: 'Klar marineblå og varm safrangul med arkitektoniske rutenett for autoritative faglitterære verk.',
    badge: 'Sakprosa & Innsikt',
    coverConfig: {
      accentColor: '#facc15',
      bgColor: '#0a1324',
      fontFamily: 'sans',
      motif: 'architectural-lines'
    },
    artStyle: 'Refined modern editorial isometric graphic, clean vector textures, sophisticated data visualization motifs, clean balanced lighting.',
    samplePrompt: 'Abstract architectural structures harmonizing with natural organic curves, modern Scandinavian design, crisp clarity.',
    palette: {
      bg: '#0a1324',
      accent: '#facc15',
      secondary: '#3b82f6',
      text: '#f8fafc'
    },
    idealFor: 'Biografier, samfunnsdebatt, teknologi, ledelse og pedagogikk',
    previewMotif: 'architectural-lines'
  },
  {
    id: 'steampunk-chronicles',
    name: 'Steampunk Urverk & Damp',
    category: 'scifi_fantasy',
    description: 'Mørkt støpejern og glødende kobberurverk med tannhjul, damp og Victoriansk industrielt geni.',
    badge: 'Steampunk',
    coverConfig: {
      accentColor: '#fb923c',
      bgColor: '#130d0a',
      fontFamily: 'display',
      motif: 'architectural-lines'
    },
    artStyle: 'Steampunk technical blueprint and warm oil painting, brass gears, copper pipes, pressure gauges, glowing vacuum tubes, industrial steam.',
    samplePrompt: 'Colossal flying airship powered by ornate brass clockwork and steam propellers sailing through copper-tinted clouds over Victorian London.',
    palette: {
      bg: '#130d0a',
      accent: '#fb923c',
      secondary: '#b45309',
      text: '#ffedd5'
    },
    idealFor: 'Steampunk, mekaniske eventyr, oppfinner-historier og alternativ historie',
    previewMotif: 'architectural-lines'
  },
  {
    id: 'whimsical-fable',
    name: 'Magisk Stjernehimmel & Fabel',
    category: 'children_cozy',
    description: 'Dyp safirblå stjernebrodert himmel med glødende månestråler og fortryllende eventyrstemning.',
    badge: 'Eventyr & Magi',
    coverConfig: {
      accentColor: '#fde047',
      bgColor: '#090d1f',
      fontFamily: 'serif',
      motif: 'celestial-crest'
    },
    artStyle: 'Enchanting storybook illustration, glowing bioluminescent stardust, deep indigo night sky, whimsical golden constellations, dreamy fairytale wonder.',
    samplePrompt: 'A young stargazer standing atop a grassy hill catching falling glowing golden stars in a vintage glass jar under the Milky Way.',
    palette: {
      bg: '#090d1f',
      accent: '#fde047',
      secondary: '#60a5fa',
      text: '#eff6ff'
    },
    idealFor: 'Folkeeventyr, magisk realisme, barnebøker og mytiske fabler',
    previewMotif: 'celestial-crest'
  }
];
