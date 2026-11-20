export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'https://musicai-sw.duckdns.org/api'
).replace(/\/+$/, '');

export const ENDPOINTS = {
  auth: {
    login: '/auth/login/',
    register: '/auth/register/',
    refresh: '/auth/refresh/',
    me: '/auth/me/',
    logout: '/auth/logout/',
    changePassword: '/auth/change-password/',
    fcmToken: '/auth/fcm-token/',
  },
  credits: {
    balance: '/credits/balance/',
    plans: '/credits/plans/',
    transactions: '/credits/transactions/',
  },
  songs: {
    generate: '/songs/generate/',
    upload: '/songs/upload/',
    jobs: '/songs/jobs/',
    jobDetail: (id: string) => `/songs/jobs/${id}/`,
    library: '/songs/library/',
    tags: '/songs/tags/',
    detail: (id: string) => `/songs/${id}/`,
    playUrl: (id: string) => `/songs/${id}/play-url/`,
    thumbnailUrl: (id: string) => `/songs/${id}/thumbnail-url/`,
    like: (id: string) => `/songs/${id}/like/`,
  },
  community: {
    feed: '/community/feed/',
    trending: '/community/trending/',
    stats: '/community/stats/',
    like: (id: string) => `/community/songs/${id}/like/`,
    play: (id: string) => `/community/songs/${id}/play/`,
  },
  faceswap: {
    templates: '/faceswap/templates/',
    jobs: '/faceswap/jobs/',
    jobDetail: (id: string) => `/faceswap/jobs/${id}/`,
    resultUrl: (id: string, download = false) =>
      `/faceswap/jobs/${id}/result-url/${download ? '?download=1' : ''}`,
  },
  notifications: {
    list: '/notifications/',
    markRead: (id: number) => `/notifications/${id}/read/`,
    markAllRead: '/notifications/read-all/',
  },
} as const;
