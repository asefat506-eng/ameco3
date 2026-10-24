import React from 'react';
import { SocialPlatform } from '../../types';
import {
  Youtube,
  Facebook,
  Globe,
  Send,
  Video,
  Share2,
  Tv,
  Twitter,
  Radio,
  FileText,
  Instagram as InstagramIcon,
} from 'lucide-react';

interface PlatformIconProps {
  platform: SocialPlatform;
  className?: string;
  size?: number | string;
  withBg?: boolean;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform,
  className = 'w-4 h-4',
  size,
  withBg = false,
}) => {
  const iconProps = { className, size: size as any };

  const renderIcon = () => {
    switch (platform) {
      case 'youtube':
        return <Youtube {...iconProps} className={`${className} text-red-600 dark:text-red-500`} />;
      case 'facebook':
        return <Facebook {...iconProps} className={`${className} text-blue-600 dark:text-blue-500`} />;
      case 'tiktok':
        // Modern TikTok icon style using video/music badge
        return <Video {...iconProps} className={`${className} text-zinc-900 dark:text-zinc-100`} />;
      case 'instagram':
        return <InstagramIcon {...iconProps} className={`${className} text-pink-600 dark:text-pink-400`} />;
      case 'telegram':
        return <Send {...iconProps} className={`${className} text-sky-500 dark:text-sky-400`} />;
      case 'x':
        return <Twitter {...iconProps} className={`${className} text-slate-900 dark:text-slate-100`} />;
      case 'website':
        return <Globe {...iconProps} className={`${className} text-[#005BAC] dark:text-blue-400`} />;
      case 'other':
      default:
        return <Share2 {...iconProps} className={`${className} text-slate-500 dark:text-slate-400`} />;
    }
  };

  if (!withBg) {
    return renderIcon();
  }

  const getBgClass = () => {
    switch (platform) {
      case 'youtube':
        return 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800/80';
      case 'facebook':
        return 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/80';
      case 'tiktok':
        return 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700';
      case 'instagram':
        return 'bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800/80';
      case 'telegram':
        return 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/80';
      case 'x':
        return 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700';
      case 'website':
        return 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/80';
      case 'other':
      default:
        return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className={`p-2 rounded-xl border flex items-center justify-center shrink-0 ${getBgClass()}`}>
      {renderIcon()}
    </div>
  );
};
