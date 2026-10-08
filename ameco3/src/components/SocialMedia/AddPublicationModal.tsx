import React, { useState, useEffect } from 'react';
import {
  SocialPlatform,
  PublicationType,
  ReportMedia,
  InstitutionSocialChannel,
  UserProfile,
} from '../../types';
import {
  SUPPORTED_PLATFORMS,
  getPlatformProvider,
  validatePlatformUrl,
  detectPlatformFromUrl,
  matchChannelVerification,
} from '../../utils/socialMediaProviders';
import { PlatformIcon } from './PlatformIcon';
import {
  X,
  Plus,
  Sparkles,
  Link,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Star,
  CheckCircle2,
  Globe,
  Video,
  FileText,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  Upload,
  Trash2,
} from 'lucide-react';

interface AddPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle?: string;
  institutionId: string;
  institutionName?: string;
  verifiedChannels?: InstitutionSocialChannel[];
  currentUser?: UserProfile;
  onAddMedia: (media: ReportMedia) => void;
}

export const AddPublicationModal: React.FC<AddPublicationModalProps> = ({
  isOpen,
  onClose,
  reportId,
  reportTitle,
  institutionId,
  institutionName,
  verifiedChannels = [],
  currentUser,
  onAddMedia,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('youtube');
  const [url, setUrl] = useState('');
  const [publicationType, setPublicationType] = useState<PublicationType>('Video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [authorName, setAuthorName] = useState(institutionName || '');
  const [isPrimary, setIsPrimary] = useState(false);

  const [urlError, setUrlError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [matchedChannelInfo, setMatchedChannelInfo] = useState<{
    isVerified: boolean;
    channel?: InstitutionSocialChannel;
    note?: string;
  } | null>(null);

  const provider = getPlatformProvider(selectedPlatform);

  // Auto-switch default publication type when platform changes
  useEffect(() => {
    setPublicationType(provider.defaultPublicationType);
    setUrlError(null);
  }, [selectedPlatform, provider]);

  // Handle URL change with auto-platform detection & validation
  const handleUrlChange = async (inputUrl: string) => {
    setUrl(inputUrl);
    if (!inputUrl.trim()) {
      setUrlError(null);
      setMatchedChannelInfo(null);
      return;
    }

    // Auto-detect platform if it doesn't match current selection
    const detected = detectPlatformFromUrl(inputUrl);
    if (detected && detected !== selectedPlatform) {
      setSelectedPlatform(detected);
    }

    const validation = validatePlatformUrl(detected || selectedPlatform, inputUrl);
    if (!validation.isValid) {
      setUrlError(validation.error || 'Invalid platform URL');
      setMatchedChannelInfo(null);
    } else {
      setUrlError(null);
      // Check channel verification match
      const match = matchChannelVerification(
        detected || selectedPlatform,
        inputUrl,
        verifiedChannels
      );
      setMatchedChannelInfo(match);
    }
  };

  // Trigger Metadata Extraction
  const handleExtractMetadata = async () => {
    if (!url.trim()) return;
    const validation = validatePlatformUrl(selectedPlatform, url);
    if (!validation.isValid) {
      setUrlError(validation.error || 'Please enter a valid URL');
      return;
    }

    setIsExtracting(true);
    try {
      const meta = await provider.extractMetadata(url, {
        institutionName,
        verifiedChannels,
        titleHint: reportTitle,
      });

      if (meta.title && !title) setTitle(meta.title);
      if (meta.description && !description) setDescription(meta.description);
      if (meta.thumbnailUrl && !thumbnailUrl) setThumbnailUrl(meta.thumbnailUrl);
      if (meta.authorName && !authorName) setAuthorName(meta.authorName);
      if (meta.publicationType) setPublicationType(meta.publicationType);

      const match = matchChannelVerification(selectedPlatform, url, verifiedChannels);
      setMatchedChannelInfo(match);
    } catch (err) {
      console.warn('Metadata extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validatePlatformUrl(selectedPlatform, url);
    if (!validation.isValid) {
      setUrlError(validation.error || 'Please enter a valid URL for the selected platform.');
      return;
    }

    const extId = provider.extractId(url) || `${selectedPlatform.toUpperCase()}-${Date.now()}`;
    const embedUrl = provider.getEmbedUrl(url, extId);
    const thumb = thumbnailUrl || provider.getThumbnailUrl(url, extId) || undefined;

    const verificationMatch = matchChannelVerification(
      selectedPlatform,
      url,
      verifiedChannels
    );

    const newMedia: ReportMedia = {
      id: `MEDIA-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reportId,
      institutionId,
      institutionName: institutionName || 'Official Institution',
      platform: selectedPlatform,
      publicationType,
      url: url.trim(),
      externalId: extId,
      title: title.trim() || `${provider.displayName} Coverage: ${reportTitle || 'Official Report'}`,
      description: description.trim() || undefined,
      thumbnailUrl: thumb,
      authorName: authorName.trim() || institutionName || 'Official Channel',
      publishedAt: new Date().toISOString().split('T')[0],
      embedUrl: embedUrl || undefined,
      verificationStatus: verificationMatch.isVerified ? 'Verified' : 'Pending Verification',
      verificationNote: verificationMatch.note,
      isPrimary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.id,
    };

    onAddMedia(newMedia);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100 my-8">
        {/* Header */}
        <div className="bg-[#005BAC] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-800 rounded-xl">
              <Link className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Add Social Media & Video Publication</h3>
              <p className="text-xs text-blue-100">
                Attach official coverage across YouTube, Facebook, TikTok, Telegram, X & Web
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-blue-200 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Target Report Context */}
          {reportTitle && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Attaching Media to Report:</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">{reportTitle}</p>
            </div>
          )}

          {/* Platform Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Social Media Platform <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUPPORTED_PLATFORMS.map((plat) => {
                const platProv = getPlatformProvider(plat);
                const isSelected = selectedPlatform === plat;
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setSelectedPlatform(plat)}
                    className={`p-2.5 rounded-xl border flex items-center space-x-2 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#005BAC] bg-blue-50/80 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-300 shadow-2xs ring-1 ring-[#005BAC]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <PlatformIcon platform={plat} className="w-4 h-4 shrink-0" />
                    <span className="truncate">{platProv.displayName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Post/Video URL Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {provider.displayName} Post or Video URL <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleExtractMetadata}
                disabled={isExtracting || !url.trim()}
                className="text-[11px] text-[#005BAC] dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isExtracting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-amber-500" />
                )}
                <span>Auto-Detect Metadata</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onBlur={handleExtractMetadata}
                placeholder={provider.exampleUrl}
                className={`w-full p-3 pl-10 text-xs rounded-xl border ${
                  urlError
                    ? 'border-red-500 bg-red-50/30 text-red-900 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-[#005BAC]'
                } outline-none focus:ring-2 font-mono`}
              />
              <div className="absolute left-3 top-3.5">
                <PlatformIcon platform={selectedPlatform} className="w-4 h-4" />
              </div>
            </div>

            {urlError && (
              <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>{urlError}</span>
              </p>
            )}

            {/* Official Channel Verification Matching Notice */}
            {matchedChannelInfo && !urlError && (
              <div
                className={`mt-2 p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                  matchedChannelInfo.isVerified
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                }`}
              >
                {matchedChannelInfo.isVerified ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {matchedChannelInfo.isVerified
                      ? 'Verified Official Channel Match'
                      : 'Pending Administrator Verification'}
                  </p>
                  <p className="text-[11px] opacity-90">
                    {matchedChannelInfo.note ||
                      (matchedChannelInfo.isVerified
                        ? `Linked to verified ${provider.displayName} channel (${matchedChannelInfo.channel?.channelName})`
                        : "This publication is not from the Institution's verified official account. Administrator verification is required.")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Publication Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Publication Type <span className="text-red-500">*</span>
              </label>
              <select
                value={publicationType}
                onChange={(e) => setPublicationType(e.target.value as PublicationType)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-[#005BAC] font-medium"
              >
                {provider.allowedPublicationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Author / Channel Display Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={institutionName || 'Official Channel Name'}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-[#005BAC]"
              />
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Publication Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Press Briefing on Regional Health Initiatives"
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-[#005BAC]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Description / Caption Summary
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this video or social post covers..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-[#005BAC]"
            />
          </div>

          {/* Thumbnail Image URL & File Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Thumbnail Image / Banner Photo (Optional)
              </label>
              {thumbnailUrl && (
                <button
                  type="button"
                  onClick={() => setThumbnailUrl('')}
                  className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or auto-detected banner"
                className="flex-1 p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-[#005BAC] font-mono text-[11px]"
              />

              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      if (evt.target?.result) {
                        setThumbnailUrl(evt.target.result as string);
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {thumbnailUrl && (
              <div className="h-32 w-full rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-700 shadow-2xs">
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                  Banner Preview
                </div>
              </div>
            )}
          </div>

          {/* Primary Publication Toggle */}
          <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Star className={`w-4 h-4 ${isPrimary ? 'text-amber-500 fill-amber-500' : 'text-amber-600'}`} />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Mark as Primary Publication
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Displays as the featured media player on the public report page.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              id="isPrimaryCheck"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(urlError) || !url.trim()}
              className="px-5 py-2.5 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Attach Media Publication</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
