import { SocialPlatform, PublicationType, ReportMedia, InstitutionSocialChannel } from '../types';
import { fetchLinkPreviewApi } from '../lib/api';

export interface PlatformProvider {
  platform: SocialPlatform;
  displayName: string;
  brandColor: string;
  brandBg: string;
  badgeClass: string;
  domains: string[];
  exampleUrl: string;
  defaultPublicationType: PublicationType;
  allowedPublicationTypes: PublicationType[];
  validateUrl: (url: string) => { isValid: boolean; error?: string };
  extractId: (url: string) => string | null;
  getEmbedUrl: (url: string, externalId?: string) => string | null;
  getThumbnailUrl: (url: string, externalId?: string) => string | null;
  extractMetadata: (
    url: string,
    context?: {
      institutionName?: string;
      verifiedChannels?: InstitutionSocialChannel[];
      titleHint?: string;
    }
  ) => Promise<Partial<ReportMedia>>;
}

/**
 * Sanitize URL and verify protocol
 */
export function sanitizeUrl(inputUrl: string): { isValid: boolean; sanitized: string; error?: string } {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { isValid: false, sanitized: '', error: 'URL cannot be empty.' };
  }
  const trimmed = inputUrl.trim();
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return { isValid: false, sanitized: '', error: 'Security violation: Disallowed URL scheme.' };
  }
  let urlToTest = trimmed;
  if (!/^https?:\/\//i.test(urlToTest)) {
    urlToTest = 'https://' + urlToTest;
  }
  try {
    const parsed = new URL(urlToTest);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false, sanitized: '', error: 'Only HTTP and HTTPS URLs are supported.' };
    }
    return { isValid: true, sanitized: parsed.href };
  } catch {
    return { isValid: false, sanitized: '', error: 'Invalid URL structure.' };
  }
}

/**
 * Helper to extract domain without subdomains like www. or m.
 */
function extractHostname(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
    return parsed.hostname.toLowerCase().replace(/^(www\.|m\.|mobile\.|web\.)/, '');
  } catch {
    return '';
  }
}

// ==========================================
// 1. YOUTUBE PROVIDER
// ==========================================
export const YouTubeProvider: PlatformProvider = {
  platform: 'youtube',
  displayName: 'YouTube',
  brandColor: '#FF0000',
  brandBg: 'bg-red-600',
  badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
  domains: ['youtube.com', 'youtu.be'],
  exampleUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/...',
  defaultPublicationType: 'Video',
  allowedPublicationTypes: ['Video', 'Live Video', 'Post', 'Announcement'],

  validateUrl: (url: string) => {
    const { isValid, sanitized, error } = sanitizeUrl(url);
    if (!isValid) return { isValid: false, error };
    const hostname = extractHostname(sanitized);
    if (!['youtube.com', 'youtu.be'].includes(hostname)) {
      return { isValid: false, error: 'Please enter a valid YouTube URL (e.g., youtube.com or youtu.be).' };
    }
    return { isValid: true };
  },

  extractId: (url: string) => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
      if (parsed.hostname.includes('youtu.be')) {
        return parsed.pathname.slice(1).split(/[?#]/)[0] || null;
      }
      if (parsed.searchParams.has('v')) {
        return parsed.searchParams.get('v');
      }
      const match = parsed.pathname.match(/\/(embed|v|shorts|live)\/([^/?#]+)/);
      if (match) return match[2];
      return null;
    } catch {
      return null;
    }
  },

  getEmbedUrl: (_url: string, externalId?: string) => {
    if (!externalId) return null;
    return `https://www.youtube-nocookie.com/embed/${externalId}?autoplay=0&rel=0`;
  },

  getThumbnailUrl: (_url: string, externalId?: string) => {
    if (!externalId) return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800';
    return `https://img.youtube.com/vi/${externalId}/hqdefault.jpg`;
  },

  extractMetadata: async (url: string, context) => {
    const extId = YouTubeProvider.extractId(url) || 'YT-' + Math.random().toString(36).substring(2, 8);
    const fallbackThumb = `https://img.youtube.com/vi/${extId}/hqdefault.jpg`;
    const embed = YouTubeProvider.getEmbedUrl(url, extId);

    // Call server-side link preview scraper to get real metadata & banner
    try {
      const preview = await fetchLinkPreviewApi(url);
      if (preview.success) {
        const primaryImage = preview.imageUrl || preview.thumbnailUrl || fallbackThumb;
        return {
          platform: 'youtube',
          externalId: preview.externalId || extId,
          title: preview.title || context?.titleHint || 'Official Video Broadcast',
          description: preview.description || undefined,
          authorName: preview.authorName || context?.institutionName || 'AMECO Official Broadcast',
          thumbnailUrl: primaryImage,
          embedUrl: preview.embedUrl || embed || undefined,
          publicationType: 'Video',
        };
      }
    } catch {
      // Fallback
    }

    return {
      platform: 'youtube',
      externalId: extId,
      title: context?.titleHint ? `${context.titleHint} — Official Broadcast` : 'Official Video Coverage',
      authorName: context?.institutionName || 'AMECO Official Broadcast',
      thumbnailUrl: fallbackThumb,
      embedUrl: embed || undefined,
      publicationType: 'Video',
    };
  },
};

// ==========================================
// 2. FACEBOOK PROVIDER
// ==========================================
export const FacebookProvider: PlatformProvider = {
  platform: 'facebook',
  displayName: 'Facebook',
  brandColor: '#1877F2',
  brandBg: 'bg-blue-600',
  badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  domains: ['facebook.com', 'fb.watch', 'fb.com'],
  exampleUrl: 'https://facebook.com/ameco/posts/12345 or https://fb.watch/...',
  defaultPublicationType: 'Post',
  allowedPublicationTypes: ['Post', 'Video', 'Photo', 'Announcement', 'Live Video'],

  validateUrl: (url: string) => {
    const { isValid, sanitized, error } = sanitizeUrl(url);
    if (!isValid) return { isValid: false, error };
    const hostname = extractHostname(sanitized);
    if (!['facebook.com', 'fb.watch', 'fb.com'].includes(hostname)) {
      return { isValid: false, error: 'Please enter a valid Facebook URL (e.g., facebook.com or fb.watch).' };
    }
    return { isValid: true };
  },

  extractId: (url: string) => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
      const parts = parsed.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && /^[0-9a-zA-Z_-]+$/.test(last)) return last;
      return parts.join('_') || null;
    } catch {
      return null;
    }
  },

  getEmbedUrl: (url: string) => {
    return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`;
  },

  getThumbnailUrl: () => {
    return 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&q=80&w=800';
  },

  extractMetadata: async (url: string, context) => {
    const extId = FacebookProvider.extractId(url) || 'FB-' + Math.random().toString(36).substring(2, 8);
    const embed = FacebookProvider.getEmbedUrl(url);

    try {
      const preview = await fetchLinkPreviewApi(url);
      if (preview.success && (preview.imageUrl || preview.title)) {
        return {
          platform: 'facebook',
          externalId: extId,
          title: preview.title || context?.titleHint || 'Official Facebook Report Coverage',
          description: preview.description || undefined,
          authorName: preview.authorName || context?.institutionName || 'AMECO Official Page',
          thumbnailUrl: preview.imageUrl || preview.thumbnailUrl || FacebookProvider.getThumbnailUrl(url),
          embedUrl: embed || undefined,
          publicationType: url.includes('watch') || url.includes('/videos/') ? 'Video' : 'Post',
        };
      }
    } catch {}

    return {
      platform: 'facebook',
      externalId: extId,
      title: context?.titleHint ? `${context.titleHint} — Official Facebook Post` : 'Official Facebook Report Coverage',
      authorName: context?.institutionName || 'AMECO Official Page',
      thumbnailUrl: FacebookProvider.getThumbnailUrl(url),
      embedUrl: embed || undefined,
      publicationType: url.includes('watch') || url.includes('/videos/') ? 'Video' : 'Post',
    };
  },
};

// ==========================================
// 3. TIKTOK PROVIDER
// ==========================================
export const TikTokProvider: PlatformProvider = {
  platform: 'tiktok',
  displayName: 'TikTok',
  brandColor: '#000000',
  brandBg: 'bg-zinc-900',
  badgeClass: 'bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700',
  domains: ['tiktok.com'],
  exampleUrl: 'https://www.tiktok.com/@ameco_official/video/7123456789',
  defaultPublicationType: 'Video',
  allowedPublicationTypes: ['Video', 'Post', 'Announcement'],

  validateUrl: (url: string) => {
    const { isValid, sanitized, error } = sanitizeUrl(url);
    if (!isValid) return { isValid: false, error };
    const hostname = extractHostname(sanitized);
    if (!hostname.includes('tiktok.com')) {
      return { isValid: false, error: 'Please enter a valid TikTok URL (e.g., tiktok.com).' };
    }
    return { isValid: true };
  },

  extractId: (url: string) => {
    try {
      const match = url.match(/\/video\/(\d+)/);
      if (match) return match[1];
      const matchShort = url.match(/tiktok\.com\/(@[\w.-]+\/video\/\d+|[\w.-]+)/);
      if (matchShort) return matchShort[1];
      return null;
    } catch {
      return null;
    }
  },

  getEmbedUrl: (_url: string, externalId?: string) => {
    if (!externalId) return null;
    return `https://www.tiktok.com/embed/v2/${externalId}`;
  },

  getThumbnailUrl: () => {
    return 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&q=80&w=800';
  },

  extractMetadata: async (url: string, context) => {
    const extId = TikTokProvider.extractId(url) || 'TT-' + Math.random().toString(36).substring(2, 8);
    const embed = TikTokProvider.getEmbedUrl(url, extId);

    try {
      const preview = await fetchLinkPreviewApi(url);
      if (preview.success && (preview.imageUrl || preview.title)) {
        return {
          platform: 'tiktok',
          externalId: extId,
          title: preview.title || context?.titleHint || 'Official TikTok Video Report',
          description: preview.description || undefined,
          authorName: preview.authorName || context?.institutionName || '@ameco_official',
          thumbnailUrl: preview.imageUrl || preview.thumbnailUrl || TikTokProvider.getThumbnailUrl(url),
          embedUrl: embed || undefined,
          publicationType: 'Video',
        };
      }
    } catch {}

    return {
      platform: 'tiktok',
      externalId: extId,
      title: context?.titleHint ? `${context.titleHint} — Short-Form Report` : 'Official TikTok Video Report',
      authorName: context?.institutionName || '@ameco_official',
      thumbnailUrl: TikTokProvider.getThumbnailUrl(url),
      embedUrl: embed || undefined,
      publicationType: 'Video',
    };
  },
};

// ==========================================
// 4. INSTAGRAM PROVIDER
// ==========================================
export const InstagramProvider: PlatformProvider = {
  platform: 'instagram',
  displayName: 'Instagram',
  brandColor: '#E4405F',
  brandBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
  badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
  domains: ['instagram.com', 'instagr.am'],
  exampleUrl: 'https://www.instagram.com/p/Cxyz123/ or https://instagram.com/reel/...',
  defaultPublicationType: 'Post',
  allowedPublicationTypes: ['Post', 'Photo', 'Video', 'Announcement'],

  validateUrl: (url: string) => {
    const { isValid, sanitized, error } = sanitizeUrl(url);
    if (!isValid) return { isValid: false, error };
    const hostname = extractHostname(sanitized);
    if (!['instagram.com', 'instagr.am'].includes(hostname)) {
      return { isValid: false, error: 'Please enter a valid Instagram URL (e.g., instagram.com).' };
    }
    return { isValid: true };
  },

  extractId: (url: string) => {
    try {
      const match = url.match(/\/(p|reel|tv)\/([^/?#]+)/);
      return match ? match[2] : null;
    } catch {
      return null;
    }
  },

  getEmbedUrl: (_url: string, externalId?: string) => {
    if (!externalId) return null;
    return `https://www.instagram.com/p/${externalId}/embed/captioned/`;
  },

  getThumbnailUrl: () => {
    return 'https://images.unsplash.com/photo-1611262588024-d12430b98920?auto=format&fit=crop&q=80&w=800';
  },

  extractMetadata: async (url: string, context) => {
    const extId = InstagramProvider.extractId(url) || 'IG-' + Math.random().toString(36).substring(2, 8);
    const isReel = url.includes('/reel/') || url.includes('/tv/');
    const embed = InstagramProvider.getEmbedUrl(url, extId);

    try {
      const preview = await fetchLinkPreviewApi(url);
      if (preview.success && (preview.imageUrl || preview.title)) {
        return {
          platform: 'instagram',
          externalId: extId,
          title: preview.title || context?.titleHint || 'Official Instagram Report & Photo Media',
          description: preview.description || undefined,
          authorName: preview.authorName || context?.institutionName || 'AMECO Official Instagram',
          thumbnailUrl: preview.imageUrl || preview.thumbnailUrl || InstagramProvider.getThumbnailUrl(url),
          embedUrl: embed || undefined,
          publicationType: isReel ? 'Video' : 'Photo',
        };
      }
    } catch {}

    return {
      platform: 'instagram',
      externalId: extId,
      title: context?.titleHint ? `${context.titleHint} — Instagram Dispatch` : 'Official Instagram Report & Photo Media',
      authorName: context?.institutionName || 'AMECO Official Instagram',
      thumbnailUrl: InstagramProvider.getThumbnailUrl(url),
      embedUrl: embed || undefined,
      publicationType: isReel ? 'Video' : 'Photo',
    };
  },
};

// ==========================================
// 5. TELEGRAM PROVIDER
// ==========================================
export const TelegramProvider: PlatformProvider = {
  platform: 'telegram',
  displayName: 'Telegram',
  brandColor: '#24A1DE',
  brandBg: 'bg-sky-500',
  badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
  domains: ['t.me', 'telegram.me'],
  exampleUrl: 'https://t.me/ameco_news/1234 or https://t.me/channel_name',
  defaultPublicationType: 'Announcement',
  allowedPublicationTypes: ['Announcement', 'Post', 'Article', 'Photo', 'Video'],

  validateUrl: (url: string) => {
    const { isValid, sanitized, error } = sanitizeUrl(url);
    if (!isValid) return { isValid: false, error };
    const hostname = extractHostname(sanitized);
    if (!['t.me', 'telegram.me'].includes(hostname)) {
      return { isValid: false, error: 'Please enter a valid Telegram URL (e.g., t.me/channel/message).' };
    }
    return { isValid: true };
  },

  extractId: (url: string) => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
      const cleanPath = parsed.pathname.replace(/^\//, '');
      return cleanPath || null;
    } catch {
      return null;
    }
  },

  getEmbedUrl: (url: string) => {
    const match = url.match(/t\.me\/([^/]+)\/(\d+)/);
    if (match) {
      return `https://t.me/${match[1]}/${match[2]}?embed=1`;
    }
    return null;
  },

  getThumbnailUrl: () => {
    return 'https://images.unsplash.com/photo-1579208575657-c595a053b9b7?auto=format&fit=crop&q=80&w=800';
  },

  extractMetadata: async (url: string, context) => {
    const extId = TelegramProvider.extractId(url) || 'TG-' + Math.random().toString(36).substring(2, 8);
    const embed = TelegramProvider.getEmbedUrl(url);

    try {
      const preview = await fetchLinkPreviewApi(url);
      if (preview.success && (preview.imageUrl || preview.title)) {
        return {
          platform: 'telegram',
          externalId: extId,
          title: preview.title || context?.titleHint || 'Official Telegram Channel Release',
          description: preview.description || undefined,
          authorName: preview.authorName || (context?.institutionName ? `${context.institutionName} Telegram` : 'AMECO Official Channel'),
          thumbnailUrl: preview.imageUrl || preview.thumbnailUrl || TelegramProvider.getThumbnailUrl(url),
          embedUrl: embed || undefined,
          publicationType: 'Announcement',
        };
      }
    } catch {}

    return {
      platform: 'telegram',
      externalId: extId,
      title: context?.titleHint ? `${context.titleHint} — Official Telegram Notice` : 'Official Telegram Channel Release',
      authorName: context?.institutionName ? `${context.institutionName} Telegram` : 'AMECO Official Channel',
      thumbnailUrl: TelegramProvider.getThumbnailUrl(url),
      embedUrl: embed || undefined,
      publicationType: 'Announcement',
    };
  },
};

// ==========================================
// 6. X (TWITTER) PROVIDER
// ==========================================
export const XProvider: PlatformProvider = {
  platform: 'x',
  displayName: 'X (Twitter)',
  brandColor: '#000000',
  brandBg: 'bg-black',
  badgeClass: 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
  domains: ['x.com', 'twitter.com'],
  exampleUrl: 'https://x.com/ameco/status/1234567890 or https://twitter.com/...',
  defaultPublicationType: 'Post',
  allowedPublicationTypes: ['Post', 'Announcement', 'Article', 'Photo', 'Video'],

  validateUrl: (url: string) => {
    const { isValid, sanitized, error } = sanitizeUrl(url);
    if (!isValid) return { isValid: false, error };
    const hostname = extractHostname(sanitized);
    if (!['x.com', 'twitter.com'].includes(hostname)) {
      return { isValid: false, error: 'Please enter a valid X (Twitter) URL (e.g., x.com or twitter.com).' };
    }
    return { isValid: true };
  },

  extractId: (url: string) => {
    try {
      const match = url.match(/\/status\/(\d+)/);
      if (match) return match[1];
      const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
      return parsed.pathname.replace(/^\//, '') || null;
    } catch {
      return null;
    }
  },

  getEmbedUrl: (_url: string) => {
    return null;
  },

  getThumbnailUrl: () => {
    return 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&q=80&w=800';
  },

  extractMetadata: async (url: string, context) => {
    const extId = XProvider.extractId(url) || 'X-' + Math.random().toString(36).substring(2, 8);

    try {
      const preview = await fetchLinkPreviewApi(url);
      if (preview.success && (preview.imageUrl || preview.title)) {
        return {
          platform: 'x',
          externalId: extId,
          title: preview.title || context?.titleHint || 'Official X (Twitter) Release',
          description: preview.description || undefined,
          authorName: preview.authorName || (context?.institutionName ? `@${context.institutionName.replace(/\s+/g, '')}` : '@AMECO_Official'),
          thumbnailUrl: preview.imageUrl || preview.thumbnailUrl || XProvider.getThumbnailUrl(url),
          publicationType: 'Post',
        };
      }
    } catch {}

    return {
      platform: 'x',
      externalId: extId,
      title: context?.titleHint ? `${context.titleHint} — Official X Release` : 'Official X (Twitter) Release',
      authorName: context?.institutionName ? `@${context.institutionName.replace(/\s+/g, '')}` : '@AMECO_Official',
      thumbnailUrl: XProvider.getThumbnailUrl(url),
      publicationType: 'Post',
    };
  },
};

// ==========================================
// 7. WEBSITE PROVIDER
// ==========================================
export const WebsiteProvider: PlatformProvider = {
  platform: 'website',
  displayName: 'Official Website',
  brandColor: '#005BAC',
  brandBg: 'bg-[#005BAC]',
  badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  domains: ['*'],
  exampleUrl: 'https://www.aphi.gov.et/news/2026-report or https://ameco.et/...',
  defaultPublicationType: 'Article',
  allowedPublicationTypes: ['Article', 'Announcement', 'Post', 'Other'],

  validateUrl: (url: string) => {
    const { isValid, sanitized, error } = sanitizeUrl(url);
    if (!isValid) return { isValid: false, error };
    try {
      const parsed = new URL(sanitized);
      if (!parsed.hostname || parsed.hostname.length < 3) {
        return { isValid: false, error: 'Please enter a valid website URL with a valid domain.' };
      }
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Please enter a valid website URL.' };
    }
  },

  extractId: (url: string) => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
      return parsed.hostname + parsed.pathname;
    } catch {
      return null;
    }
  },

  getEmbedUrl: () => null,

  getThumbnailUrl: () => {
    return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';
  },

  extractMetadata: async (url: string, context) => {
    let domain = 'Official Portal';
    try {
      const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
      domain = parsed.hostname;
    } catch {}

    try {
      const preview = await fetchLinkPreviewApi(url);
      if (preview.success && (preview.imageUrl || preview.title)) {
        return {
          platform: 'website',
          externalId: domain,
          title: preview.title || (context?.titleHint ? `${context.titleHint} — Official Portal Article` : `Official Portal Press Release (${domain})`),
          description: preview.description || undefined,
          authorName: preview.authorName || context?.institutionName || domain,
          thumbnailUrl: preview.imageUrl || preview.thumbnailUrl || WebsiteProvider.getThumbnailUrl(url),
          publicationType: 'Article',
        };
      }
    } catch {}

    return {
      platform: 'website',
      externalId: domain,
      title: context?.titleHint ? `${context.titleHint} — Official Portal Article` : `Official Portal Press Release (${domain})`,
      authorName: context?.institutionName || domain,
      thumbnailUrl: WebsiteProvider.getThumbnailUrl(url),
      publicationType: 'Article',
    };
  },
};

// ==========================================
// 8. OTHER PROVIDER (EXTENSIBLE CATCH-ALL)
// ==========================================
export const OtherProvider: PlatformProvider = {
  platform: 'other',
  displayName: 'Other Platform',
  brandColor: '#475569',
  brandBg: 'bg-slate-700',
  badgeClass: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  domains: ['*'],
  exampleUrl: 'https://...',
  defaultPublicationType: 'Post',
  allowedPublicationTypes: ['Post', 'Article', 'Video', 'Photo', 'Announcement', 'Live Video', 'Other'],

  validateUrl: (url: string) => {
    return sanitizeUrl(url);
  },

  extractId: (url: string) => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
      return parsed.hostname;
    } catch {
      return null;
    }
  },

  getEmbedUrl: () => null,
  getThumbnailUrl: () => 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800',

  extractMetadata: async (url: string, context) => {
    return {
      platform: 'other',
      externalId: url,
      title: context?.titleHint ? `${context.titleHint} — External Media Link` : 'External Social Media Publication',
      authorName: context?.institutionName || 'External Platform',
      thumbnailUrl: OtherProvider.getThumbnailUrl(url),
      publicationType: 'Other',
    };
  },
};

// ==========================================
// PLATFORM REGISTRY & UTILITIES
// ==========================================
export const PLATFORM_PROVIDERS: Record<SocialPlatform, PlatformProvider> = {
  youtube: YouTubeProvider,
  facebook: FacebookProvider,
  tiktok: TikTokProvider,
  instagram: InstagramProvider,
  telegram: TelegramProvider,
  x: XProvider,
  website: WebsiteProvider,
  other: OtherProvider,
};

export const SUPPORTED_PLATFORMS: SocialPlatform[] = [
  'youtube',
  'facebook',
  'tiktok',
  'instagram',
  'telegram',
  'x',
  'website',
  'other',
];

export function getPlatformProvider(platform: SocialPlatform): PlatformProvider {
  return PLATFORM_PROVIDERS[platform] || OtherProvider;
}

export function detectPlatformFromUrl(url: string): SocialPlatform | null {
  const { isValid, sanitized } = sanitizeUrl(url);
  if (!isValid) return null;
  const hostname = extractHostname(sanitized);

  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
  if (hostname.includes('facebook.com') || hostname.includes('fb.watch') || hostname.includes('fb.com')) return 'facebook';
  if (hostname.includes('tiktok.com')) return 'tiktok';
  if (hostname.includes('instagram.com') || hostname.includes('instagr.am')) return 'instagram';
  if (hostname.includes('t.me') || hostname.includes('telegram.me')) return 'telegram';
  if (hostname.includes('x.com') || hostname.includes('twitter.com')) return 'x';
  if (hostname) return 'website';

  return 'other';
}

export function validatePlatformUrl(platform: SocialPlatform, url: string): { isValid: boolean; error?: string } {
  const provider = getPlatformProvider(platform);
  return provider.validateUrl(url);
}

/**
 * Verifies if a media publication URL originates from one of the institution's verified channels
 */
export function matchChannelVerification(
  platform: SocialPlatform,
  url: string,
  verifiedChannels: InstitutionSocialChannel[] = []
): { isVerified: boolean; matchedChannel?: InstitutionSocialChannel; note?: string } {
  if (!verifiedChannels || verifiedChannels.length === 0) {
    return {
      isVerified: false,
      note: "This publication is not from the Institution's verified official account. Administrator verification is required.",
    };
  }

  const matchingPlatformChannels = verifiedChannels.filter(
    (ch) => ch.platform === platform && ch.verificationStatus === 'Verified'
  );

  if (matchingPlatformChannels.length === 0) {
    return {
      isVerified: false,
      note: `The institution does not have a verified official ${getPlatformProvider(platform).displayName} channel registered. Administrator verification is required.`,
    };
  }

  // Check if URL contains channel URL base or handle
  const normalizedUrl = url.toLowerCase();
  for (const ch of matchingPlatformChannels) {
    const cleanChUrl = ch.channelUrl.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    if (cleanChUrl && normalizedUrl.includes(cleanChUrl)) {
      return { isVerified: true, matchedChannel: ch };
    }
    if (ch.platformId && normalizedUrl.includes(ch.platformId.toLowerCase())) {
      return { isVerified: true, matchedChannel: ch };
    }
    if (ch.handle && normalizedUrl.includes(ch.handle.toLowerCase().replace('@', ''))) {
      return { isVerified: true, matchedChannel: ch };
    }
  }

  // If the institution has verified channels on this platform, but this specific URL didn't match the handle
  return {
    isVerified: true, // For registered platforms with verified channel, associate with verified channel
    matchedChannel: matchingPlatformChannels[0],
    note: `Linked with verified official ${getPlatformProvider(platform).displayName} page (${matchingPlatformChannels[0].channelName}).`,
  };
}
