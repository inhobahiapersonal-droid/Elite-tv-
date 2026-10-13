export interface MediaItem {
  id: string;
  name: string;
  category: string;
  streamUrl: string;
  poster: string;
  backdrop: string;
  type: 'live' | 'movie' | 'series';
  description: string;
  year?: number;
  rating?: string;
  duration?: string;
  genres?: string[];
  epgCurrent?: string;
  epgNext?: string;
  channelNumber?: number;
  featured?: boolean;
  episodes?: {
    id: string;
    title: string;
    duration: string;
    streamUrl: string;
    episodeNumber: number;
    seasonNumber: number;
    thumbnail?: string;
    description?: string;
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isKids?: boolean;
}

export interface UserSession {
  username: string;
  email?: string;
  name: string;
  avatar: string;
  role: 'admin' | 'user';
  profile: UserProfile;
  loginTime: number;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface PlaylistSource {
  id: string;
  name: string;
  type: 'm3u' | 'xtream' | 'builtin';
  url?: string;
  xtreamServer?: string;
  xtreamUser?: string;
  xtreamPass?: string;
  channelCount: number;
  lastUpdated: string;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  username: string;
  password: string;
  phone?: string;
  email?: string;
  plan: 'basic' | 'premium' | 'vip' | 'teste';
  status: 'active' | 'inactive';
  createdAt: string;
  expiresAt?: string;
  notes?: string;
}
