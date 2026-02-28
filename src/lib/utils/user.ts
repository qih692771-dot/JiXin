import { browser } from '$app/environment';

export type UserProfile = {
  username: string;
  bio?: string;
  createdAt: string;
};

const STORAGE_KEY = 'jixin_user_profile';

export function getUserProfile(): UserProfile {
  const fallback: UserProfile = {
    username: '作者',
    createdAt: new Date().toLocaleString('zh-CN')
  };

  if (!browser) return fallback;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;
    const username = typeof parsed.username === 'string' && parsed.username.trim() ? parsed.username.trim() : fallback.username;
    const createdAt = typeof parsed.createdAt === 'string' && parsed.createdAt ? parsed.createdAt : fallback.createdAt;
    const bio = typeof parsed.bio === 'string' ? parsed.bio : undefined;
    return { username, createdAt, bio };
  } catch {
    return fallback;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (!browser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

