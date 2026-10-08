import React from 'react';
import { ReportMedia } from '../../types';
import { getPlatformProvider } from '../../utils/socialMediaProviders';
import { ExternalLink, Video, FileText, Radio, ShieldCheck } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';

interface EmbedPlayerProps {
  media: ReportMedia;
  className?: string;
}

export const EmbedPlayer: React.FC<EmbedPlayerProps> = ({ media, className = '' }) => {
  const provider = getPlatformProvider(media.platform);
  const embedUrl = media.embedUrl || (provider?.getEmbedUrl ? provider.getEmbedUrl(media.url) : null);

  if (media.platform === 'youtube' && embedUrl) {
    return (
      <div className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner ${className}`}>
        <iframe
          src={embedUrl}
          title={media.title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (media.platform === 'tiktok' && embedUrl) {
    return (
      <div className={`relative aspect-9/16 max-w-xs mx-auto w-full rounded-2xl overflow-hidden bg-black shadow-inner ${className}`}>
        <iframe
          src={embedUrl}
          title={media.title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (media.platform === 'facebook' && embedUrl) {
    return (
      <div className={`relative min-h-[380px] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 ${className}`}>
        <iframe
          src={embedUrl}
          title={media.title}
          className="w-full h-full min-h-[380px] border-0"
          scrolling="no"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (media.platform === 'telegram') {
    return (
      <div className={`p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 space-y-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <PlatformIcon platform="telegram" className="w-5 h-5" />
          <span className="text-xs font-bold text-sky-900 dark:text-sky-200">
            Official Telegram Broadcast
          </span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-mono">
          {media.description || media.title}
        </p>
        <a
          href={media.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline pt-1"
        >
          <span>Open Telegram Message</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  // Fallback interactive responsive embed card
  return (
    <div className={`p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto text-[#005BAC]">
        <PlatformIcon platform={media.platform} className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{media.title}</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{media.description || media.url}</p>
      </div>
      <a
        href={media.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#005BAC] text-white text-xs font-bold shadow-xs hover:bg-blue-800 transition-colors"
      >
        <span>View on {media.platform}</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};
