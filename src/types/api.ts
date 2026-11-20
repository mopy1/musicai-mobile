export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  credit_balance: number;
  role: string;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterResponse extends AuthTokens {
  user: UserProfile;
}

export interface CreditPlan {
  id: number;
  slug: string;
  name: string;
  credits_per_month: number;
  price_usd: string | number;
  stripe_price_id: string;
  features: string[];
  is_active: boolean;
}

export interface BalanceResponse {
  balance: number;
  plan: CreditPlan | null;
}

export interface Tag {
  id: string | number;
  name: string;
  category: string;
  emoji: string;
}

export interface CommunitySong {
  id: string;
  title: string;
  description: string | null;
  thumbnail_s3_key: string | null;
  thumbnail_url?: string | null;
  tags: Tag[];
  play_count: number;
  like_count: number;
  user_name: string;
  is_liked: boolean;
  created_at: string;
}

export interface CommunityFeedResponse {
  results: CommunitySong[];
  count: number;
  page: number;
  has_next: boolean;
}

export interface CommunityStats {
  public_songs: number;
  active_users: number;
  plays_today: number;
}

export type SongStatus = 'queued' | 'processing' | 'ready' | 'error' | 'failed';
export type SongSourceType = 'generated' | 'uploaded' | 'hummed';

export interface LibrarySong {
  id: string;
  title: string;
  status: SongStatus;
  source_type: SongSourceType;
  audio_duration: number | null;
  audio_s3_key: string | null;
  thumbnail_s3_key: string | null;
  thumbnail_url: string | null;
  tags: Tag[];
  is_public: boolean;
  created_at: string;
}

export interface SongDetail {
  id: string;
  title: string;
  description: string | null;
  prompt: string | null;
  lyrics: string | null;
  described_lyrics: string | null;
  lyrics_source: string | null;
  lyrics_timestamps: unknown;
  instrumental: boolean;
  guidance_scale: number;
  infer_step: number;
  audio_duration: number | null;
  seed: number | null;
  audio_s3_key: string | null;
  thumbnail_s3_key: string | null;
  status: SongStatus;
  source_type: SongSourceType;
  is_public: boolean;
  play_count: number;
  like_count: number;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface SongGeneratePayload {
  title: string;
  description?: string | null;
  prompt?: string | null;
  lyrics?: string | null;
  described_lyrics?: string | null;
  instrumental?: boolean;
  vocal_type?: 'male' | 'female' | 'auto';
  language?: 'es' | 'en';
  guidance_scale?: number;
  infer_step?: number;
  audio_duration?: number;
}

export interface SongGenerateResponse {
  job_id: string;
  song_id: string;
  status: string;
}

export interface GenerationJob {
  id: string;
  status: SongStatus;
  song_id: string | null;
  title: string;
  song_title: string;
  error_message: string | null;
  created_at: string;
}

export type {
  FaceSwapCreateResponse,
  FaceSwapJob,
  FaceSwapJobStatus,
  FaceSwapTemplate,
} from './faceswap';

export type NotificationType =
  | 'song_ready' | 'song_published' | 'stem_ready' | 'faceswap_ready'
  | 'mix_ready' | 'karaoke_ready' | 'translation_ready' | 'humming_ready'
  | 'credit_grant' | 'system';

export interface AppNotification {
  id: number;
  type: NotificationType | string;
  title: string;
  message: string;
  reference_id: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  results: AppNotification[];
  unread_count: number;
}

export interface UrlResponse {
  url: string;
}

export interface LikeToggleResponse {
  liked: boolean;
  like_count: number;
}
