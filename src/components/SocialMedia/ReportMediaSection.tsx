import React, { useState, useMemo } from 'react';
import {
  ReportMedia,
  InstitutionSocialChannel,
  UserProfile,
  SocialPlatform,
} from '../../types';
import { MediaPreviewCard } from './MediaPreviewCard';
import { AddPublicationModal } from './AddPublicationModal';
import { PlatformIcon } from './PlatformIcon';
import { getPlatformProvider } from '../../utils/socialMediaProviders';
import {
  Plus,
  Radio,
  Star,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Share2,
  Video,
  ShieldCheck,
} from 'lucide-react';

interface ReportMediaSectionProps {
  reportId: string;
  reportTitle?: string;
  institutionId?: string;
  institutionName?: string;
  mediaList?: ReportMedia[];
  verifiedChannels?: InstitutionSocialChannel[];
  currentUser?: UserProfile;
  canManage?: boolean;
  isAdmin?: boolean;
  onAddMedia?: (media: ReportMedia) => void;
  onDeleteMedia?: (mediaId: string) => void;
  onSetPrimaryMedia?: (mediaId: string) => void;
  onVerifyMedia?: (mediaId: string, status: 'Verified' | 'Rejected', reason?: string) => void;
  isPublicView?: boolean;
}

export const ReportMediaSection: React.FC<ReportMediaSectionProps> = ({
  reportId,
  reportTitle,
  institutionId = 'INST-AMECO-001',
  institutionName = 'Amhara Media Corporation',
  mediaList = [],
  verifiedChannels = [],
  currentUser,
  canManage = false,
  isAdmin = false,
  onAddMedia,
  onDeleteMedia,
  onSetPrimaryMedia,
  onVerifyMedia,
  isPublicView = false,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>('all');

  // Filter media for public view: Only show Verified or Added media (hide rejected)
  const displayableMedia = useMemo(() => {
    let list = mediaList || [];
    if (isPublicView) {
      list = list.filter((m) => m.verificationStatus !== 'Rejected');
    }
    if (selectedPlatformFilter !== 'all') {
      list = list.filter((m) => m.platform === selectedPlatformFilter);
    }
    return list;
  }, [mediaList, isPublicView, selectedPlatformFilter]);

  // Primary Media (if any)
  const primaryMedia = useMemo(() => {
    const primary = (mediaList || []).find((m) => m.isPrimary);
    if (primary) return primary;
    // If no primary explicitly marked, first verified video or first media
    return (mediaList || []).find((m) => m.publicationType === 'Video') || (mediaList || [])[0] || null;
  }, [mediaList]);

  // Other media (excluding primary for special display on public view)
  const otherMedia = useMemo(() => {
    if (!primaryMedia) return displayableMedia;
    return displayableMedia.filter((m) => m.id !== primaryMedia.id);
  }, [displayableMedia, primaryMedia]);

  // Available platforms with counts
  const availablePlatforms = useMemo(() => {
    const counts: Record<string, number> = {};
    (mediaList || []).forEach((m) => {
      counts[m.platform] = (counts[m.platform] || 0) + 1;
    });
    return counts;
  }, [mediaList]);

  // If public view and no media exists, do NOT render empty container
  if (isPublicView && (!mediaList || mediaList.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2.5">
            <Radio className="w-5 h-5 text-[#005BAC]" />
            <span>Official Media Coverage & Social Publications</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-100 dark:bg-blue-950 text-[#005BAC] dark:text-blue-300">
              {mediaList.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-platform broadcasts, video reports, and verified social publications from {institutionName}.
          </p>
        </div>

        {canManage && onAddMedia && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-[#005BAC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Social Media Publication</span>
          </button>
        )}
      </div>

      {/* Platform Filter Tabs (Only show if multiple platforms exist) */}
      {Object.keys(availablePlatforms).length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-fit">
          <button
            onClick={() => setSelectedPlatformFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedPlatformFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-[#005BAC] dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Platforms ({mediaList.length})
          </button>

          {Object.entries(availablePlatforms).map(([plat, count]) => {
            const prov = getPlatformProvider(plat as SocialPlatform);
            return (
              <button
                key={plat}
                onClick={() => setSelectedPlatformFilter(plat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  selectedPlatformFilter === plat
                    ? 'bg-white dark:bg-slate-900 text-[#005BAC] dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <PlatformIcon platform={plat as SocialPlatform} className="w-3.5 h-3.5" />
                <span>{prov.displayName}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Media Content */}
      {mediaList.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <Share2 className="w-9 h-9 text-slate-400 mx-auto mb-2.5" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No Social Media Publications Attached Yet
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Attach YouTube broadcasts, Facebook posts, TikTok videos, Telegram notices, or X releases related to this report.
          </p>
          {canManage && onAddMedia && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Attach First Publication</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Primary Featured Media in Public View */}
          {primaryMedia && selectedPlatformFilter === 'all' && (
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>Featured Primary Media</span>
              </div>
              <div className="max-w-2xl">
                <MediaPreviewCard
                  media={primaryMedia}
                  currentUser={currentUser}
                  canManage={canManage}
                  isAdmin={isAdmin}
                  onSetPrimary={onSetPrimaryMedia}
                  onDelete={onDeleteMedia}
                  onVerify={onVerifyMedia}
                />
              </div>
            </div>
          )}

          {/* Other Media Grid */}
          {(selectedPlatformFilter === 'all' ? otherMedia : displayableMedia).length > 0 && (
            <div className="space-y-3">
              {primaryMedia && selectedPlatformFilter === 'all' && (
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Additional Official Publications & Channels ({otherMedia.length})
                </h4>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(selectedPlatformFilter === 'all' ? otherMedia : displayableMedia).map((m) => (
                  <MediaPreviewCard
                    key={m.id}
                    media={m}
                    currentUser={currentUser}
                    canManage={canManage}
                    isAdmin={isAdmin}
                    onSetPrimary={onSetPrimaryMedia}
                    onDelete={onDeleteMedia}
                    onVerify={onVerifyMedia}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Publication Modal */}
      {isAddModalOpen && onAddMedia && (
        <AddPublicationModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          reportId={reportId}
          reportTitle={reportTitle}
          institutionId={institutionId}
          institutionName={institutionName}
          verifiedChannels={verifiedChannels}
          currentUser={currentUser}
          onAddMedia={onAddMedia}
        />
      )}
    </div>
  );
};
