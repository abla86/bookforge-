import { ProjectIntent, WorkPlan, StoryBible, Project, VisualCoverConfig, UserProfile, SecurityAuditEvent } from '../types';

export interface HealthCheckResponse {
  status: string;
  platform: string;
  engine?: string;
  persistence?: string;
  freeEngine?: {
    available: boolean;
    cost: number;
    description: string;
  };
}

export async function checkServerHealth(): Promise<HealthCheckResponse> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return {
      status: 'offline',
      platform: 'VELORA',
      engine: 'free-deterministic-literary-synth',
      persistence: 'local-fallback',
      freeEngine: {
        available: true,
        cost: 0,
        description: 'Innebygd kostnadsfri forfatter- og illustrasjonsmotor'
      }
    };
  }
}

export async function analyzeProjectIntent(
  idea: string,
  contentType: string = 'book',
  language: string = 'English'
): Promise<{
  title: string;
  subtitle: string;
  logline: string;
  genre: string;
  subgenre?: string;
  targetAudience: string;
  tone: string;
  targetWordCount: number;
  pacing: 'brisk' | 'measured' | 'epic' | 'contemplative';
  stylisticDirectives: string[];
  visualArtStyle: string;
  chapterCount: number;
  language: string;
}> {
  const res = await fetch('/api/orchestrator/analyze-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea, contentType, language })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to analyze project intent');
  }
  return await res.json();
}

export async function buildPlanAndBible(
  title: string,
  subtitle: string,
  rawIdea: string,
  intent: ProjectIntent,
  chapterCount: number = 5,
  language: string = 'English'
): Promise<{ plan: WorkPlan; bible: StoryBible }> {
  const res = await fetch('/api/orchestrator/build-plan-bible', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, subtitle, rawIdea, intent, chapterCount, language })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate work plan and story bible');
  }
  return await res.json();
}

export async function generateChapterProse(
  projectTitle: string,
  chapterPlan: any,
  bible: StoryBible,
  previousSummary: string = '',
  fullPremise: string = '',
  language: string = 'English'
): Promise<{ prose: string; wordCount: number; summary: string; illustrationPrompt: string }> {
  const res = await fetch('/api/orchestrator/generate-chapter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectTitle, chapterPlan, bible, previousSummary, fullPremise, language })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate chapter prose');
  }
  return await res.json();
}

export async function validateChapterProse(
  prose: string,
  chapterPlan: any,
  bible: StoryBible,
  strictness: string = 'balanced'
): Promise<{ passed: boolean; score: number; wordCount: number; feedback: string[]; repairsNeeded: string[] }> {
  const res = await fetch('/api/orchestrator/validate-chapter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prose, chapterPlan, bible, strictness })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to validate chapter prose');
  }
  return await res.json();
}

export async function generateVisualMotif(
  title: string,
  subtitle: string,
  author: string,
  genre: string
): Promise<VisualCoverConfig> {
  const res = await fetch('/api/orchestrator/generate-visual-motif', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, subtitle, author, genre })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate visual motif');
  }
  return await res.json();
}

export async function generateBookImage(
  prompt: string,
  style?: string,
  aspectRatio?: '1:1' | '3:4' | '4:3' | '16:9' | '9:16',
  context?: { title?: string; chapterNumber?: number; target?: 'cover' | 'cover_front' | 'cover_back' | 'chapter' | 'back' | 'illustration' | string }
): Promise<{ imageUrl: string; prompt: string; style: string; target: string; chapterNumber?: number }> {
  const res = await fetch('/api/orchestrator/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      style,
      aspectRatio: aspectRatio || '3:4',
      title: context?.title,
      chapterNumber: context?.chapterNumber,
      target: context?.target || 'illustration'
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate image');
  }
  return await res.json();
}

// -----------------------------------------------------------------
// USER AUTHENTICATION & PROFILE SERVICES (VELORA)
// -----------------------------------------------------------------

const SESSION_TOKEN_KEY = 'velora_session_token';
const USER_CACHE_KEY = 'velora_active_user';

export function getStoredSessionToken(): string | null {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function getStoredUser(): UserProfile | null {
  const raw = localStorage.getItem(USER_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredSessionToken();
  const user = getStoredUser();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (user?.id) {
    headers['X-User-Id'] = user.id;
  }
  return headers;
}

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  penName?: string;
  imprintName?: string;
}): Promise<{ user: UserProfile; token: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Registration failed');
  }

  localStorage.setItem(SESSION_TOKEN_KEY, body.token);
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(body.user));
  return body;
}

export async function loginUser(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Login failed');
  }

  localStorage.setItem(SESSION_TOKEN_KEY, body.token);
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(body.user));
  return body;
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  try {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const body = await res.json();
    if (body.user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(body.user));
      return body.user;
    }
    return null;
  } catch {
    return getStoredUser();
  }
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Failed to update profile');
  }

  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(body.user));
  return body.user;
}

export async function changeUserPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
  const res = await fetch('/api/auth/password', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword })
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Failed to update password');
  }

  return { success: true };
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch {
    // Ignore network error on logout
  } finally {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
  }
}

export async function fetchSecurityLogs(): Promise<SecurityAuditEvent[]> {
  try {
    const res = await fetch('/api/auth/security-logs', {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// -----------------------------------------------------------------
// USER PROJECTS API (PERSISTENCE)
// -----------------------------------------------------------------

export async function fetchUserProjects(userId: string): Promise<Project[]> {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(userId)}/projects`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function saveUserProjects(userId: string, projects: Project[]): Promise<boolean> {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(userId)}/projects`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(projects)
    });
    return res.ok;
  } catch {
    return false;
  }
}
