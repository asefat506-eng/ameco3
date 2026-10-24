import React, { useState } from 'react';
import {
  InstitutionSocialChannel,
  SocialPlatform,
  UserProfile,
  ChannelVerificationStatus,
} from '../../types';
import {
  SUPPORTED_PLATFORMS,
  getPlatformProvider,
  validatePlatformUrl,
} from '../../utils/socialMediaProviders';
import { PlatformIcon } from './PlatformIcon';
import {
  Plus,
  ShieldCheck,
  Clock,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Edit3,
  CheckCircle2,
  Send,
  X,
  Globe,
  Radio,
  Sparkles,
} from 'lucide-react';

interface OfficialChannelsManagerProps {
  institution: UserProfile;
  channels: InstitutionSocialChannel[];
  currentUser: UserProfile;
  isAdmin?: boolean;
  onSaveChannel: (channel: InstitutionSocialChannel) => void;
  onDeleteChannel: (channelId: string) => void;
  onVerifyChannel?: (channelId: string, status: ChannelVerificationStatus, reason?: string) => void;
}

export const OfficialChannelsManager: React.FC<OfficialChannelsManagerProps> = ({
  institution,
  channels,
  currentUser,
  isAdmin = false,
  onSaveChannel,
  onDeleteChannel,
  onVerifyChannel,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<InstitutionSocialChannel | null>(null);

  // Form State
  const [platform, setPlatform] = useState<SocialPlatform>('youtube');
  const [channelName, setChannelName] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [handle, setHandle] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [subscriberCount, setSubscriberCount] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  // Admin reject modal state
  const [rejectingChannelId, setRejectingChannelId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const canEdit =
    isAdmin ||
    currentUser.role === 'Administrator' ||
    currentUser.id === institution.id;

  const handleOpenAdd = () => {
    setEditingChannel(null);
    setPlatform('youtube');
    setChannelName(institution.institutionName ? `${institution.institutionName} Official` : '');
    setChannelUrl('');
    setHandle('');
    setPlatformId('');
    setSubscriberCount('');
    setUrlError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (ch: InstitutionSocialChannel) => {
    setEditingChannel(ch);
    setPlatform(ch.platform);
    setChannelName(ch.channelName);
    setChannelUrl(ch.channelUrl);
    setHandle(ch.handle || '');
    setPlatformId(ch.platformId || '');
    setSubscriberCount(ch.subscriberOrFollowerCount || '');
    setUrlError(null);
    setShowAddModal(true);
  };

  const handleUrlChange = (inputUrl: string) => {
    setChannelUrl(inputUrl);
    if (!inputUrl.trim()) {
      setUrlError(null);
      return;
    }
    const validation = validatePlatformUrl(platform, inputUrl);
    if (!validation.isValid) {
      setUrlError(validation.error || 'Invalid URL');
    } else {
      setUrlError(null);
      // Auto-extract platform ID / handle
      const prov = getPlatformProvider(platform);
      const extId = prov.extractId(inputUrl);
      if (extId && !platformId) {
        setPlatformId(extId);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePlatformUrl(platform, channelUrl);
    if (!validation.isValid) {
      setUrlError(validation.error || 'Please enter a valid channel URL');
      return;
    }

    const provider = getPlatformProvider(platform);
    const extId = platformId || provider.extractId(channelUrl) || undefined;

    const channelPayload: InstitutionSocialChannel = {
      id: editingChannel?.id || `CH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      institutionId: institution.id,
      institutionName: institution.institutionName || institution.fullName,
      platform,
      channelName: channelName.trim(),
      channelUrl: channelUrl.trim(),
      platformId: extId,
      handle: handle.trim() || undefined,
      verificationStatus: editingChannel?.verificationStatus || (isAdmin ? 'Verified' : 'Pending Verification'),
      subscriberOrFollowerCount: subscriberCount.trim() || undefined,
      verifiedBy: isAdmin ? currentUser.fullName : editingChannel?.verifiedBy,
      verifiedAt: isAdmin ? new Date().toISOString().split('T')[0] : editingChannel?.verifiedAt,
      createdAt: editingChannel?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveChannel(channelPayload);
    setShowAddModal(false);
  };

  const getVerificationBadge = (status: ChannelVerificationStatus) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Verified Official</span>
          </span>
        );
      case 'Pending Verification':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Pending Review</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <span>Rejected</span>
          </span>
        );
      case 'Unverified':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span>Unverified</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Radio className="w-5 h-5 text-[#005BAC]" />
            <span>Official Media & Social Channels</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registered channels used for cross-platform public report verification and media syndication.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#005BAC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Official Channel</span>
          </button>
        )}
      </div>

      {/* Channels Grid / List */}
      {channels.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <Globe className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Official Channels Connected
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Connect official YouTube, Facebook, TikTok, Telegram, Instagram, or X channels to allow automatic media verification.
          </p>
          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Connect First Channel</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((ch) => {
            const provider = getPlatformProvider(ch.platform);
            return (
              <div
                key={ch.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <PlatformIcon platform={ch.platform} withBg className="w-5 h-5" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                            {ch.channelName}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          {provider.displayName} {ch.handle ? `• ${ch.handle}` : ''}
                        </p>
                      </div>
                    </div>
                    {getVerificationBadge(ch.verificationStatus)}
                  </div>

                  {/* Channel URL link */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 mb-3 flex items-center justify-between text-xs">
                    <a
                      href={ch.channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#005BAC] dark:text-blue-400 font-mono text-[11px] truncate hover:underline flex items-center gap-1.5"
                    >
                      <span className="truncate">{ch.channelUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                    </a>
                  </div>

                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
                    {ch.subscriberOrFollowerCount && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {ch.subscriberOrFollowerCount} Followers/Subscribers
                      </span>
                    )}
                    {ch.verifiedAt && (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified on {ch.verifiedAt}
                      </span>
                    )}
                    {ch.rejectionReason && ch.verificationStatus === 'Rejected' && (
                      <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Reason: {ch.rejectionReason}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {canEdit && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(ch)}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                          title="Edit Channel"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove official channel ${ch.channelName}?`)) {
                              onDeleteChannel(ch.id);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg cursor-pointer transition-colors"
                          title="Delete Channel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Admin Verification Controls */}
                  {isAdmin && onVerifyChannel && (
                    <div className="flex items-center space-x-2">
                      {ch.verificationStatus !== 'Verified' && (
                        <button
                          onClick={() => onVerifyChannel(ch.id, 'Verified')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve Channel</span>
                        </button>
                      )}

                      {ch.verificationStatus !== 'Rejected' && (
                        <button
                          onClick={() => {
                            setRejectingChannelId(ch.id);
                            setRejectionReason('');
                          }}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Channel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">
            <div className="bg-[#005BAC] text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-800 rounded-xl">
                  <Radio className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingChannel ? 'Edit Official Channel' : 'Connect Official Channel'}
                  </h3>
                  <p className="text-xs text-blue-100">{institution.institutionName || 'Institution'} Profile</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-blue-200 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Platform Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Platform <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SUPPORTED_PLATFORMS.map((plat) => {
                    const pProv = getPlatformProvider(plat);
                    return (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => {
                          setPlatform(plat);
                          setUrlError(null);
                        }}
                        className={`p-2 rounded-xl border flex items-center space-x-1.5 text-xs font-bold cursor-pointer ${
                          platform === plat
                            ? 'border-[#005BAC] bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-300 ring-1 ring-[#005BAC]'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <PlatformIcon platform={plat} className="w-3.5 h-3.5" />
                        <span className="truncate">{pProv.displayName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Channel / Page Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Official Channel / Page Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="e.g. Amhara Media Corporation (AMECO) Official"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-[#005BAC]"
                />
              </div>

              {/* Channel URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Channel / Profile URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={channelUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder={getPlatformProvider(platform).exampleUrl}
                  className={`w-full p-2.5 text-xs rounded-xl border font-mono ${
                    urlError
                      ? 'border-red-500 bg-red-50/30'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                  } outline-none focus:ring-2 focus:ring-[#005BAC]`}
                />
                {urlError && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{urlError}</span>
                  </p>
                )}
              </div>

              {/* Handle and Platform ID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Handle (e.g. @ameco)
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@ameco_news"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-[#005BAC]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Followers / Subscribers
                  </label>
                  <input
                    type="text"
                    value={subscriberCount}
                    onChange={(e) => setSubscriberCount(e.target.value)}
                    placeholder="e.g. 1.2M or 450K"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-[#005BAC]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(urlError) || !channelUrl.trim() || !channelName.trim()}
                  className="px-5 py-2.5 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {editingChannel ? 'Save Channel' : 'Register Official Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Rejection Modal */}
      {rejectingChannelId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-5 space-y-3 animate-in zoom-in-95">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Reject Official Channel</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide an administrative rationale for rejecting this channel registration.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Could not verify institution ownership of this page / Invalid credentials"
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingChannelId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onVerifyChannel && rejectingChannelId) {
                    onVerifyChannel(rejectingChannelId, 'Rejected', rejectionReason);
                  }
                  setRejectingChannelId(null);
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
