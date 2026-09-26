export type ContentType =
  | 'book'
  | 'picture_book'
  | 'children_book'
  | 'magazine'
  | 'screenplay'
  | 'comic'
  | 'educational'
  | 'report';

export interface ContentTypeDefinition {
  id: ContentType;
  name: string;
  badge: string;
  description: string;
  icon: string;
  unitName: string; // e.g., "Chapters", "Pages", "Scenes", "Articles"
  defaultCount: number;
  targetWordCountRange: string;
  outputFormats: string[];
}

export interface ProjectIntent {
  genre: string;
  subgenre?: string;
  targetAudience: string;
  tone: string;
  targetWordCount: number;
  language: string;
  pacing: 'brisk' | 'measured' | 'epic' | 'contemplative';
  stylisticDirectives: string[];
  visualArtStyle: string;
  logline: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'deuteragonist' | 'supporting' | 'mentor';
  archetype: string;
  personality: string;
  physicalAppearance: string;
  coreMotivation: string;
  internalConflict: string;
  voiceAndDiction: string;
}

export interface WorldRule {
  id: string;
  category: 'setting' | 'lore' | 'social_order' | 'technology_magic' | 'atmosphere';
  name: string;
  description: string;
  narrativeSignificance: string;
}

export interface TimelineEvent {
  id: string;
  order: number;
  timeframe: string;
  event: string;
  consequences: string;
}

export interface StoryBible {
  characters: CharacterProfile[];
  worldBuilding: WorldRule[];
  timeline: TimelineEvent[];
  thematicPillars: string[];
  narrativeRules: string[];
  continuityChecklist: string[];
}

export interface ChapterPlan {
  chapterNumber: number;
  title: string;
  povCharacter: string;
  setting: string;
  dramaticObjective: string;
  plotBeats: string[];
  estimatedWords: number;
}

export interface WorkPlan {
  premise: string;
  centralConflict: string;
  threeActBreakdown: {
    act: string;
    focus: string;
    climaxEvent: string;
  }[];
  chaptersPlan: ChapterPlan[];
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  povCharacter: string;
  summary: string;
  prose: string;
  wordCount: number;
  status: 'pending' | 'queued' | 'generating' | 'validating' | 'completed' | 'failed';
  qualityScore?: number;
  qualityFeedback?: string[];
  continuityNotes?: string[];
  illustrationPrompt?: string;
  illustrationUrl?: string;
  illustrationCaption?: string;
  generatedAt?: string;
}

export interface VisualCoverConfig {
  title: string;
  subtitle: string;
  author: string;
  accentColor: string;
  bgColor: string;
  fontFamily: 'serif' | 'sans' | 'display' | 'cinzel';
  motif: 'minimalist-geometric' | 'celestial-crest' | 'botanical-filigree' | 'architectural-lines' | 'abstract-landscape' | 'mythic-emblem';
  backCoverBlurb: string;
  spineWidthMm: number;
  barcodeText?: string;
  coverImageUrl?: string;
  backCoverImageUrl?: string;
  templateThemeId?: string;
  showArtworkOnCover?: boolean;
}

export interface VisualAsset {
  id: string;
  type: 'cover_front' | 'cover_back' | 'cover_wrap' | 'illustration';
  chapterNumber?: number;
  title: string;
  prompt: string;
  style: string;
  svgData?: string;
  imageUrl?: string;
  placementDescription: string;
}

export interface BookTemplate {
  id: string;
  name: string;
  category: 'fiction' | 'scifi_fantasy' | 'mystery_thriller' | 'classical' | 'children_cozy' | 'poetry_art';
  description: string;
  badge: string;
  coverConfig: Partial<VisualCoverConfig>;
  artStyle: string;
  samplePrompt: string;
  palette: { bg: string; accent: string; secondary: string; text: string };
  idealFor: string;
  previewMotif: VisualCoverConfig['motif'];
}

export interface ProductionLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  stage: string;
  message: string;
  details?: string;
}

export interface ProductionJob {
  id: string;
  projectId: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  currentStage: 'intent' | 'planning' | 'bible' | 'chapters' | 'visuals' | 'quality' | 'assembly' | 'publish';
  progressPercentage: number;
  activeWorkers: number;
  concurrencyLimit: number;
  startedAt?: string;
  completedAt?: string;
  logs: ProductionLog[];
  metrics: {
    totalChapters: number;
    completedChapters: number;
    totalWords: number;
    tokensEstimated: number;
    averageQualityScore: number;
  };
}

export interface UserPreferences {
  defaultContentType: ContentType;
  defaultGenre: string;
  defaultTargetWordCount: number;
  defaultPacing: 'brisk' | 'measured' | 'epic' | 'contemplative';
  defaultVisualArtStyle: string;
  defaultLanguage: string;
  autoSave: boolean;
  orchestratorWorkers: number;
  qualityGateStrictness: 'balanced' | 'strict' | 'relaxed';
  themeAccent: 'amber' | 'emerald' | 'cyan' | 'rose';
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  penName: string;
  bio?: string;
  imprintName?: string;
  avatarUrl?: string;
  role: 'creator' | 'editor' | 'publisher' | 'admin';
  preferences: UserPreferences;
  stats: {
    totalProjects: number;
    completedProjects: number;
    totalAuthoredWords: number;
    estimatedTokensUsed: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  userId?: string;
  action: string;
  ipAddress?: string;
  status: 'success' | 'failure' | 'denied';
  details?: string;
}

export interface Project {
  id: string;
  userId?: string;
  title: string;
  subtitle?: string;
  author: string;
  contentType: ContentType;
  rawIdea: string;
  intent: ProjectIntent;
  plan: WorkPlan;
  bible: StoryBible;
  chapters: Chapter[];
  coverConfig: VisualCoverConfig;
  visualAssets: VisualAsset[];
  createdAt: string;
  updatedAt: string;
  version: number;
  isCompleted: boolean;
  status?: 'draft' | 'planning' | 'in_production' | 'in_review' | 'completed' | 'published';
}

export interface PlatformConfig {
  brandName: string;
  activeModule: 'dashboard' | 'create' | 'write' | 'visual' | 'forge' | 'publish' | 'library' | 'control';
  modelId: string;
  orchestratorWorkers: number;
  qualityGateStrictness: 'balanced' | 'strict' | 'relaxed';
  autoRepairChapters: boolean;
}

