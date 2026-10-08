import React, { useState } from 'react';
import { ReportMedia, UserProfile } from '../../types';
import { PlatformIcon } from './PlatformIcon';
import { getPlatformProvider } from '../../utils/socialMediaProviders';
import {
  ExternalLink,
  Play,
  CheckCircle2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Star,
  Trash2,
  Eye,
  EyeOff,
  Video,
  FileText,
  Radio,
  Image as ImageIcon,
  Share2,
  XCircle,
} from 'lucide-react';

interface MediaPreviewCardProps {
  media: ReportMedia;
  currentUser?: UserProfile;
  canManage?: boolean; // Can institution user or admin edit/delete
  isAdmin?: boolean;
  onSetPrimary?: (mediaId: string) => void;
  onDelete?: (mediaId: string) => void;
  onVerify?: (mediaId: string, status: 'Verified' | 'Rejected', reason?: string) => void;
  isCompact?: boolean;
}

export const MediaPreviewCard: React.FC<MediaPreviewCardProps> = ({
  media,
  currentUser,
  canManage = false,
  isAdmin = false,
  onSetPrimary,
  onDelete,
  onVerify,
  isCompact = false,
}) => {
  const [showEmbed, setShowEmbed] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const provider = getPlatformProvider(media.platform);

  const getStatusBadge = () => {
    switch (media.verificationStatus) {
      case 'Verified':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Verified Official Account</span>
          </span>
        );
      case 'Pending Verification':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Pending Admin Verification</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <XCircle className="w-3 h-3 text-red-600 dark:text-red-400 shrink-0" />
            <span>Verification Rejected</span>
          </span>
        );
      case 'Added':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span>Linked</span>
          </span>
        );
    }
  };

  const getActionLabel = () => {
    switch (media.platform) {
      case 'youtube':
        return 'Watch on YouTube';
      case 'facebook':
        return 'View on Facebook';
      case 'tiktok':
        return 'Watch on TikTok';
      case 'instagram':
        return 'View on Instagram';
      case 'telegram':
        return 'Open in Telegram';
      case 'x':
        return 'View on X (Twitter)';
      case 'website':
        return 'Read Official Article';
      case 'other':
      default:
        return 'View on Platform';
    }
  };

  const canEmbed = Boolean(media.embedUrl);

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border ${
        media.isPrimary
          ? 'border-amber-400 dark:border-amber-500/80 shadow-md ring-1 ring-amber-400/30'
          : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
      } overflow-hidden transition-all flex flex-col justify-between`}
    >
      <div>
        {/* Primary Banner Header if marked as primary */}
        {media.isPrimary && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1.5 text-white flex items-center justify-between text-xs font-bold shadow-xs">
            <div className="flex items-center space-x-1.5">
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>PRIMARY OFFICIAL PUBLICATION</span>
            </div>
            <span className="text-[10px] font-mono opacity-90">Featured Broadcast</span>
          </div>
        )}

        {/* Thumbnail / Embedded Media Section */}
        <div className="relative aspect-video w-full bg-slate-950 overflow-hidden group">
          {showEmbed && canEmbed ? (
            <iframe
              src={media.embedUrl}
              title={media.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full relative">
              <img
                src={
                  media.thumbnailUrl ||
                  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800'
                }
                alt={media.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-xs font-bold border border-white/10">
                    <PlatformIcon platform={media.platform} className="w-3.5 h-3.5" />
                    <span>{provider.displayName}</span>
                  </div>

                  <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-mono text-zinc-300 border border-white/10">
                    {media.publicationType}
                  </span>
                </div>

                {canEmbed ? (
                  <button
                    onClick={() => setShowEmbed(true)}
                    className="self-center p-3.5 rounded-full bg-[#005BAC]/90 hover:bg-[#005BAC] text-white shadow-xl transform group-hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
                    title="Play Embedded Media"
                  >
                    <Play className="w-6 h-6 fill-white translate-x-0.5" />
                  </button>
                ) : (
                  <div className="self-center"></div>
                )}

                <div className="flex items-center justify-between text-white text-[11px]">
                  <span className="font-mono text-zinc-300">
                    {media.publishedAt || 'Published via Official Channel'}
                  </span>
                  {canEmbed && (
                    <span className="text-[10px] text-zinc-300 flex items-center gap-1 font-mono">
                      <Play className="w-3 h-3 fill-zinc-300" /> Click to play
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5">
              <PlatformIcon platform={media.platform} className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                {media.authorName || 'Official Channel'}
              </span>
            </div>
            {getStatusBadge()}
          </div>

          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
            {media.title}
          </h4>

          {media.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {media.description}
            </p>
          )}

          {/* Non-verified notice if pending verification */}
          {media.verificationStatus === 'Pending Verification' && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {media.verificationNote ||
                  "This publication is not from the Institution's verified official account. Administrator verification is required."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          {canEmbed && showEmbed && (
            <button
              onClick={() => setShowEmbed(false)}
              className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 cursor-pointer font-bold"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Close Player</span>
            </button>
          )}

          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
          >
            <span>{getActionLabel()}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>

        {/* Management Controls for Institution Owner / Admin */}
        {(canManage || isAdmin) && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              {onSetPrimary && (
                <button
                  onClick={() => onSetPrimary(media.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition-colors text-[11px] ${
                    media.isPrimary
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={media.isPrimary ? 'Unmark Primary Publication' : 'Set as Primary Publication'}
                >
                  <Star className={`w-3 h-3 ${media.isPrimary ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{media.isPrimary ? 'Primary' : 'Set Primary'}</span>
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => {
                    if (confirm(`Remove this ${provider.displayName} publication?`)) {
                      onDelete(media.id);
                    }
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg cursor-pointer transition-colors"
                  title="Remove Publication"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Admin Verification Controls */}
            {isAdmin && onVerify && (
              <div className="flex items-center space-x-1.5">
                {media.verificationStatus !== 'Verified' && (
                  <button
                    onClick={() => onVerify(media.id, 'Verified')}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Approve Media</span>
                  </button>
                )}

                {media.verificationStatus !== 'Rejected' && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Reason Modal for Admin */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-5 space-y-3 animate-in zoom-in-95">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Reject Media Publication</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide an administrative rationale for rejecting this social media reference.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Unverified third-party account / Broken media reference"
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onVerify?.(media.id, 'Rejected', rejectReason);
                  setShowRejectModal(false);
                }}
                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
