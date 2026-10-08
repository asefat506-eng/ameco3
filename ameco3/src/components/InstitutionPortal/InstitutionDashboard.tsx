import React, { useState, useMemo } from 'react';
import {
  UserProfile,
  ReportItem,
  EvidenceFile,
  TrendingNewsItem,
  Message,
  InstitutionSocialChannel,
  ReportMedia,
  SocialPlatform,
} from '../../types';
import { REGIONAL_ZONES } from '../../data/zones';
import { changePasswordApi, fetchLinkPreviewApi } from '../../lib/api';
import { InstitutionAdminChat } from './InstitutionAdminChat';
import { ChatComposer } from '../Common/ChatComposer';
import { MessageAttachment } from '../Common/MessageAttachment';
import { OfficialChannelsManager } from '../SocialMedia/OfficialChannelsManager';
import { ReportMediaSection } from '../SocialMedia/ReportMediaSection';
import { PlatformIcon } from '../SocialMedia/PlatformIcon';
import {
  detectPlatformFromUrl,
  getPlatformProvider,
  sanitizeUrl,
} from '../../utils/socialMediaProviders';
import {
  Building2,
  Newspaper,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  EyeOff,
  Trash2,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  Calendar,
  MapPin,
  Tag,
  Clock,
  Briefcase,
  Lock,
  KeyRound,
  Key,
  X,
  Shield,
  MessageSquare,
  Share2,
  Radio,
  Video,
  Play,
  Globe,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  Loader2,
  RefreshCw,
  Sliders,
  Wand2,
} from 'lucide-react';

interface InstitutionDashboardProps {
  currentUser: UserProfile;
  trendingNews: TrendingNewsItem[];
  messages?: Message[];
  reports?: ReportItem[];
  channels?: InstitutionSocialChannel[];
  mediaList?: ReportMedia[];
  onSendMessage?: (
    reportIdOrChannel: string,
    text: string,
    extra?: {
      recipientId?: string;
      isBroadcast?: boolean;
      priority?: 'Normal' | 'High' | 'Urgent';
    }
  ) => void;
  onSendCaseMessage?: (reportId: string, text: string, investigatorId: string, attachment?: EvidenceFile) => void;
  onPublishNews: (news: TrendingNewsItem) => void;
  onDeleteNews: (newsId: string) => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  onSaveChannel?: (channel: InstitutionSocialChannel) => void;
  onDeleteChannel?: (channelId: string) => void;
  onAddMedia?: (media: ReportMedia) => void;
  onDeleteMedia?: (mediaId: string) => void;
  onSetPrimaryMedia?: (mediaId: string) => void;
  initialTab?: 'published' | 'create' | 'channels' | 'communications' | 'profile';
}

export const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({
  currentUser,
  trendingNews,
  messages = [],
  reports = [],
  channels = [],
  mediaList = [],
  onSendMessage,
  onSendCaseMessage,
  onPublishNews,
  onDeleteNews,
  onUpdateProfile,
  onSaveChannel,
  onDeleteChannel,
  onAddMedia,
  onDeleteMedia,
  onSetPrimaryMedia,
  initialTab = 'published',
}) => {
  const [activeTab, setActiveTab] = useState<'published' | 'create' | 'channels' | 'communications' | 'profile'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNewsForMedia, setSelectedNewsForMedia] = useState<TrendingNewsItem | null>(null);

  // Password Change Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(currentUser.isDefaultPassword || false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Password strength check
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200 text-slate-400' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500 text-red-700' };
    if (score <= 3) return { score, label: 'Moderate', color: 'bg-amber-500 text-amber-700' };
    return { score, label: 'Strong', color: 'bg-emerald-500 text-emerald-700' };
  };

  const passStrength = getPasswordStrength(newPassword);

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await changePasswordApi({
        userId: currentUser.id,
        oldPassword: oldPassword ? oldPassword.trim() : undefined,
        newPassword: newPassword.trim(),
        user: currentUser,
      });

      if (res.success) {
        setPasswordSuccess(res.message || 'Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (res.user) {
          onUpdateProfile?.(res.user);
        } else {
          onUpdateProfile?.({ password: newPassword.trim(), isDefaultPassword: false });
        }
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess(null);
        }, 1800);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password. Please check your current password and try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Form states for publishing new trending news
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Public Health');
  const [description, setDescription] = useState('');
  const [zone, setZone] = useState(currentUser.zone || 'Bahir Dar Special Zone');
  const [imageUrl, setImageUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Banner auto-fetch from social media state
  const [isFetchingBanner, setIsFetchingBanner] = useState(false);
  const [fetchedBannerInfo, setFetchedBannerInfo] = useState<{
    imageUrl?: string;
    title?: string;
    description?: string;
    authorName?: string;
    platform?: string;
  } | null>(null);

  // Regional Banner Photo Presets
  const REGIONAL_BANNER_PRESETS = [
    {
      category: 'Public Health',
      label: 'Health & Medical',
      url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200',
    },
    {
      category: 'Agriculture',
      label: 'Agriculture & Harvest',
      url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200',
    },
    {
      category: 'Infrastructure',
      label: 'Infrastructure & Roads',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&q=80&w=1200',
    },
    {
      category: 'Education & Innovation',
      label: 'Education & University',
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
    },
    {
      category: 'Environment & Water',
      label: 'Water & Lake Tana',
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
    },
    {
      category: 'Public Safety',
      label: 'Public Safety & Advisory',
      url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=1200',
    },
  ];

  // Auto fetch banner from URL
  const handleAutoFetchBanner = async (targetUrl?: string) => {
    const rawUrl = targetUrl || sourceUrl || imageUrl;
    if (!rawUrl || !rawUrl.trim()) return;

    try {
      setIsFetchingBanner(true);
      const data = await fetchLinkPreviewApi(rawUrl.trim());
      if (data) {
        setFetchedBannerInfo({
          imageUrl: data.imageUrl,
          title: data.title,
          description: data.description,
          authorName: data.authorName,
          platform: data.platform,
        });

        // If an image URL was found, auto-set it if none exists
        if (data.imageUrl && !imageUrl) {
          setImageUrl(data.imageUrl);
        }
        // If headline is empty, auto-fill it
        if (data.title && !title) {
          setTitle(data.title);
        }
        // If description is empty, auto-fill it
        if (data.description && !description) {
          setDescription(data.description);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch real banner from URL:', e);
    } finally {
      setIsFetchingBanner(false);
    }
  };

  // Handle local photo upload
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Photo file size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-detect social media platform from entered sourceUrl or imageUrl
  const detectedPlatform = useMemo(() => {
    if (sourceUrl && sourceUrl.trim()) {
      return detectPlatformFromUrl(sourceUrl.trim());
    }
    if (imageUrl && imageUrl.trim()) {
      const lower = imageUrl.toLowerCase();
      if (
        lower.includes('youtube.com') ||
        lower.includes('youtu.be') ||
        lower.includes('facebook.com') ||
        lower.includes('fb.watch') ||
        lower.includes('tiktok.com') ||
        lower.includes('instagram.com') ||
        lower.includes('t.me') ||
        lower.includes('twitter.com') ||
        lower.includes('x.com')
      ) {
        return detectPlatformFromUrl(imageUrl.trim());
      }
    }
    return null;
  }, [sourceUrl, imageUrl]);

  const isApproved = currentUser.isApprovedInstitution ?? currentUser.verified ?? true;
  const isPublisher = currentUser.role === 'Publisher';
  const publisherDisplayName = isPublisher ? currentUser.fullName : currentUser.institutionName || currentUser.fullName;

  // Filter news published by this institution
  const myNewsList = trendingNews.filter(
    (item) => item.institutionId === currentUser.id || item.institutionName === (currentUser.institutionName || currentUser.fullName)
  );

  const myChannels = channels.filter(
    (item) => item.institutionId === currentUser.id || item.institutionName === (currentUser.institutionName || currentUser.fullName)
  );

  const institutionCases = useMemo(() => {
    const completedStatuses = ['Investigation Completed', 'Published', 'Closed'];
    const matchingCases = reports.filter(
      (report) =>
        report.institutionId === currentUser.id ||
        report.institutionName === (currentUser.institutionName || currentUser.fullName)
    );

    // Publisher accounts review completed cases from the central investigation queue.
    if (isPublisher) {
      return reports.filter((report) => completedStatuses.includes(report.status));
    }

    return matchingCases;
  }, [reports, currentUser.id, currentUser.institutionName, currentUser.fullName, isPublisher]);

  const completedInstitutionCases = useMemo(
    () => institutionCases.filter((report) => ['Investigation Completed', 'Published', 'Closed'].includes(report.status)),
    [institutionCases]
  );

  const filteredNews = myNewsList.filter(
    (item) =>
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    let finalSourceUrl = sourceUrl.trim();
    let finalImageUrl = imageUrl.trim();

    // If user entered a social media URL into the image field
    if (!finalSourceUrl && finalImageUrl) {
      const lower = finalImageUrl.toLowerCase();
      if (
        lower.includes('youtube.com') ||
        lower.includes('youtu.be') ||
        lower.includes('facebook.com') ||
        lower.includes('fb.watch') ||
        lower.includes('tiktok.com') ||
        lower.includes('instagram.com') ||
        lower.includes('t.me') ||
        lower.includes('twitter.com') ||
        lower.includes('x.com')
      ) {
        finalSourceUrl = finalImageUrl;
        finalImageUrl = '';
      }
    }

    const finalPlatform = detectedPlatform || (finalSourceUrl ? detectPlatformFromUrl(finalSourceUrl) : undefined);

    // Auto-derive YouTube thumbnail if imageUrl is empty
    if (!finalImageUrl && finalSourceUrl) {
      if (finalPlatform === 'youtube') {
        const prov = getPlatformProvider('youtube');
        const vid = prov.extractId(finalSourceUrl);
        if (vid) {
          finalImageUrl = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
        }
      }
    }

    const newsId = 'NEWS-' + Math.floor(10000 + Math.random() * 90000);

    // Generate attached media item if sourceUrl is present
    const autoMedia: ReportMedia[] = [];
    if (finalSourceUrl) {
      const plat = (finalPlatform || 'website') as SocialPlatform;
      const mediaId = 'MEDIA-' + Math.floor(10000 + Math.random() * 90000);
      const newMedia: ReportMedia = {
        id: mediaId,
        reportId: newsId,
        institutionId: currentUser.id,
        institutionName: currentUser.institutionName || currentUser.fullName,
        platform: plat,
        publicationType: plat === 'youtube' || plat === 'tiktok' ? 'Video' : 'Post',
        url: finalSourceUrl,
        title: title.trim(),
        description: description.slice(0, 140),
        thumbnailUrl: finalImageUrl || undefined,
        publishedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        verificationStatus: 'Verified',
        isPrimary: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.id,
      };
      autoMedia.push(newMedia);
      if (onAddMedia) {
        onAddMedia(newMedia);
      }
    }

    const newNewsItem: TrendingNewsItem = {
      id: newsId,
      title: title.trim(),
      description: description.trim(),
      category,
      institutionId: currentUser.id,
      institutionName: currentUser.institutionName || currentUser.fullName,
      publishedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      imageUrl: finalImageUrl || undefined,
      sourceUrl: finalSourceUrl || undefined,
      socialPlatform: finalPlatform || undefined,
      zone,
      isApproved: true,
      viewsCount: 1,
      media: autoMedia.length > 0 ? autoMedia : undefined,
    };

    onPublishNews(newNewsItem);
    setSuccessMsg('Trending news published successfully with direct social media linkage!');
    setTitle('');
    setDescription('');
    setImageUrl('');
    setSourceUrl('');

    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('published');
    }, 1800);
  };

  return (
    <div className="space-y-6 pb-12 font-['Poppins',sans-serif]">
      {/* First-Time Password Security Banner */}
      {currentUser.isDefaultPassword && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/70 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm block">First-Time Security Setup Required</span>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                Your Publisher account is currently active with a system default password. Please update to a private, strong password before continuing.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 shrink-0"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Change Password Now</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
            <Building2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>{isPublisher ? 'Publisher Portal' : 'Institution Portal'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {publisherDisplayName}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono pt-1">
            <span className="flex items-center space-x-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser.institutionCategory || 'Regional Agency'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser.zone}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isPublisher ? 'Verified Publisher Account' : 'Verified Institution Account'}</span>
            </span>
          </div>
        </div>

        {/* Status Badge & Actions */}
        <div className="relative z-10 flex flex-col items-start md:items-end space-y-2 shrink-0">
          <div className="flex items-center gap-2">
            {isApproved ? (
              <div className="px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>News Publishing Enabled</span>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center space-x-2 shadow-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Pending Admin Approval</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('create')}
            disabled={!isApproved}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-lg transition-transform active:scale-95 ${
              isApproved
                ? 'bg-white hover:bg-slate-100 text-black cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#005BAC]" />
            <span>Publish Trending News</span>
          </button>
        </div>
      </div>

      {/* Account Approval Warning Banner if Not Approved */}
      {!isApproved && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-center space-x-3 shadow-md">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <span className="font-bold block text-sm">Account Pending Admin Approval</span>
            <p className="text-amber-700 dark:text-amber-300">
              Your {isPublisher ? 'Publisher account' : 'institutional account'} is currently under Administrator verification. Once approved by AMECO Editorial Administrators, you will be able to publish trending news and official bulletins directly to citizens.
            </p>
          </div>
        </div>
      )}

      {/* Tabs Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'published'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>My Published Bulletins ({myNewsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            disabled={!isApproved}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create & Publish News</span>
          </button>

          <button
            id="tab-btn-official-channels"
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'channels'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Share2 className="w-4 h-4 text-emerald-500" />
            <span>Official Channels ({myChannels.length})</span>
          </button>

          <button
            id="tab-btn-institution-admin-chat"
            onClick={() => setActiveTab('communications')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'communications'
                ? 'bg-[#005BAC] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Admin Communications Desk</span>
          </button>
        </div>

        {activeTab === 'published' && (
          <div className="relative hidden sm:block w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search news..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#005BAC]"
            />
          </div>
        )}
      </div>

      {/* TAB 1: MY PUBLISHED NEWS */}
      {activeTab === 'published' && (
        <div className="space-y-4">
          {institutionCases.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-500" />
                    {isPublisher ? 'Completed Cases for Review' : 'Assigned Investigation Cases'} ({institutionCases.length})
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isPublisher ? 'Review completed investigations and communicate directly with the assigned investigator. Assignment and reassignment are managed by AMECO administrators.' : 'Review case progress and communicate directly with the assigned investigator. Assignment and reassignment are managed by AMECO administrators.'}
                  </p>
                </div>
                {completedInstitutionCases.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                    {completedInstitutionCases.length} Completed
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {institutionCases.map((caseItem) => {
                  const caseMessages = messages.filter((message) => message.reportId === caseItem.id);
                  return (
                    <div key={caseItem.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-zinc-950/40 p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-[#005BAC] dark:text-blue-300">{caseItem.id}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{caseItem.status}</span>
                          </div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{caseItem.title}</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Investigator: {caseItem.assignedTo?.responsiblePersonName || 'Pending assignment'}
                          </p>
                          {['Investigation Completed', 'Published', 'Closed'].includes(caseItem.status) && (
                            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Completed Case Review</span>
                              </div>
                              <p className="mt-1.5 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                                {caseItem.investigationFindings || 'The investigator marked this case complete. No additional findings were provided.'}
                              </p>
                              <div className="mt-3 border-t border-emerald-200/80 pt-3 dark:border-emerald-900/60">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                  Registered Identity
                                </div>
                                {caseItem.isAnonymous || caseItem.isGuest ? (
                                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                                    Protected anonymous or guest submission. Personal identity is not available.
                                  </p>
                                ) : (
                                  <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                                    <span><strong>Citizen ID:</strong> {caseItem.citizenId || 'Not provided'}</span>
                                  </div>
                                )}
                              </div>
                              <div className="mt-3 border-t border-emerald-200/80 pt-3 dark:border-emerald-900/60">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                  Case Location
                                </div>
                                <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                                  <span><strong>Region:</strong> {caseItem.region || 'Not provided'}</span>
                                  <span><strong>Zone:</strong> {caseItem.zone || 'Not provided'}</span>
                                  <span><strong>Woreda:</strong> {caseItem.woreda || 'Not provided'}</span>
                                  <span><strong>Specific Place:</strong> {caseItem.specificLocation || 'Not provided'}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                          Updated {caseItem.updatedAt}
                        </span>
                      </div>

                      {caseItem.assignedTo?.responsiblePersonId && (
                        <>
                          <div className="max-h-40 overflow-y-auto space-y-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3">
                            {caseMessages.length === 0 ? (
                              <p className="text-xs text-slate-400 text-center py-2">No case messages yet.</p>
                            ) : (
                              caseMessages.map((message) => (
                                <div key={message.id} className={`flex flex-col ${message.senderId === currentUser.id ? 'items-end' : 'items-start'}`}>
                                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${message.senderId === currentUser.id ? 'bg-[#005BAC] text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100'}`}>
                                    <div className="text-[10px] opacity-75 mb-1">{message.senderDisplayName} · {message.timestamp}</div>
                                    <p className="whitespace-pre-wrap">{message.text}</p>
                                    <MessageAttachment attachment={message.attachment} />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <ChatComposer
                            onSend={(text, attachment) => onSendCaseMessage?.(caseItem.id, text, caseItem.assignedTo!.responsiblePersonId, attachment)}
                            placeholder={`Message ${caseItem.assignedTo.responsiblePersonName} about this case...`}
                            sendLabel="Send to Investigator"
                            className="border-t border-slate-200 dark:border-zinc-800 pt-2"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {filteredNews.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <Newspaper className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Published News Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {isPublisher ? 'You have not published any trending news bulletins yet. Click "Create & Publish News" to publish your first public release.' : 'Your institution has not published any trending news bulletins yet. Click "Create & Publish News" to publish your first public release.'}
              </p>
              {isApproved && (
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-[#005BAC] hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-transform active:scale-95"
                >
                  Publish First News Post
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNews.map((news) => {
                const attachedMedia = mediaList.filter((m) => m.reportId === news.id || m.id === news.id);
                const primaryMedia = attachedMedia.find((m) => m.isPrimary) || attachedMedia[0];
                const targetSocialUrl =
                  news.sourceUrl ||
                  primaryMedia?.url ||
                  (news.imageUrl &&
                  news.imageUrl.startsWith('http') &&
                  !news.imageUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i)
                    ? news.imageUrl
                    : undefined);
                const targetPlatform =
                  news.socialPlatform ||
                  primaryMedia?.platform ||
                  (targetSocialUrl ? detectPlatformFromUrl(targetSocialUrl) : null);

                return (
                  <div
                    key={news.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3 p-5">
                      {/* Cover Image or Social Media Banner with Error Fallback */}
                      {news.imageUrl ? (
                        <div
                          onClick={() => targetSocialUrl && window.open(targetSocialUrl, '_blank', 'noopener,noreferrer')}
                          className={`h-44 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative ${
                            targetSocialUrl ? 'cursor-pointer group/img' : ''
                          }`}
                        >
                          <img
                            src={news.imageUrl}
                            alt={news.title}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // On broken image, hide the broken img and reveal fallback banner
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement?.querySelector(
                                '.image-error-fallback'
                              ) as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div
                            style={{ display: 'none' }}
                            className="image-error-fallback w-full h-full bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white p-4 flex flex-col justify-between items-start"
                          >
                            <div className="flex items-center space-x-2">
                              {targetPlatform && (
                                <PlatformIcon
                                  platform={targetPlatform as SocialPlatform}
                                  className="w-5 h-5"
                                />
                              )}
                              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                                {news.category}
                              </span>
                            </div>
                            <span className="text-xs font-bold line-clamp-2">{news.title}</span>
                          </div>

                          {targetSocialUrl && (
                            <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold flex items-center space-x-1 border border-white/20">
                              {targetPlatform && (
                                <PlatformIcon
                                  platform={targetPlatform as SocialPlatform}
                                  className="w-3 h-3"
                                />
                              )}
                              <span>Click to open post</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => targetSocialUrl && window.open(targetSocialUrl, '_blank', 'noopener,noreferrer')}
                          className={`h-24 w-full rounded-xl bg-gradient-to-br from-[#005BAC]/10 via-blue-600/5 to-indigo-600/10 dark:from-blue-950/40 dark:to-slate-900 border border-blue-100 dark:border-blue-900/40 p-3.5 flex flex-col justify-between ${
                            targetSocialUrl ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              {targetPlatform ? (
                                <PlatformIcon
                                  platform={targetPlatform as SocialPlatform}
                                  className="w-4 h-4"
                                />
                              ) : (
                                <Radio className="w-4 h-4 text-[#005BAC]" />
                              )}
                              <span className="text-[11px] font-bold text-[#005BAC] dark:text-blue-400">
                                {news.category}
                              </span>
                            </div>
                            {targetPlatform && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase border border-slate-200 dark:border-slate-700">
                                {targetPlatform}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {news.title}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-[#005BAC] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold">
                          {news.category}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{news.publishedAt}</span>
                        </span>
                      </div>

                      <h3
                        onClick={() => targetSocialUrl && window.open(targetSocialUrl, '_blank', 'noopener,noreferrer')}
                        className={`text-sm font-bold text-slate-900 dark:text-white leading-snug ${
                          targetSocialUrl ? 'hover:text-[#005BAC] dark:hover:text-blue-400 cursor-pointer transition-colors' : ''
                        }`}
                      >
                        {news.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {news.description}
                      </p>

                      {/* Attached Media Previews */}
                      {attachedMedia.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400">Attached Media & Links:</span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {attachedMedia.map((m) => (
                              <a
                                key={m.id}
                                href={m.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[11px] text-slate-800 dark:text-slate-200 font-medium border border-blue-100 dark:border-zinc-700 transition-colors shadow-2xs"
                                title={`Open ${m.platform} link in new tab`}
                              >
                                <PlatformIcon platform={m.platform} className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[120px]">{m.title}</span>
                                {m.isPrimary && <span className="text-[9px] text-amber-500 font-bold">★</span>}
                                <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        {targetSocialUrl ? (
                          <a
                            href={targetSocialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs transition-transform active:scale-95 text-xs"
                          >
                            {targetPlatform && (
                              <PlatformIcon
                                platform={targetPlatform as SocialPlatform}
                                className="w-3.5 h-3.5"
                              />
                            )}
                            <span>
                              {targetPlatform === 'youtube'
                                ? 'Watch on YouTube'
                                : targetPlatform === 'telegram'
                                ? 'Open Telegram'
                                : targetPlatform === 'facebook'
                                ? 'View Facebook'
                                : targetPlatform === 'tiktok'
                                ? 'Watch on TikTok'
                                : targetPlatform === 'instagram'
                                ? 'View Instagram'
                                : targetPlatform === 'x'
                                ? 'View on X'
                                : 'Open Social Media Link'}
                            </span>
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                          </a>
                        ) : null}

                        <button
                          onClick={() => setSelectedNewsForMedia(news)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#005BAC] dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 font-bold rounded-xl flex items-center space-x-1 cursor-pointer transition-colors text-xs"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{targetSocialUrl ? 'Manage Media' : 'Attach Media'}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => onDeleteNews(news.id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Unpublish</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: OFFICIAL SOCIAL MEDIA CHANNELS */}
      {activeTab === 'channels' && (
        <div className="space-y-4">
          <OfficialChannelsManager
            institution={currentUser}
            channels={myChannels}
            currentUser={currentUser}
            isAdmin={false}
            onSaveChannel={(ch) => onSaveChannel?.(ch)}
            onDeleteChannel={(id) => onDeleteChannel?.(id)}
          />
        </div>
      )}

      {/* TAB 2: CREATE & PUBLISH NEWS */}
      {activeTab === 'create' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl max-w-3xl space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
                <span>{isPublisher ? 'Publish Trending News' : 'Publish Institutional Trending News'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              News items published here will be displayed immediately to regional citizens on the Citizens Portal and link directly to your official social media posts/videos.
            </p>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitNews} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">News Headline / Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isPublisher ? 'e.g., Bruk Afrem Releases a Seasonal Health Advisory...' : 'e.g., Amhara Public Health Institute Releases Seasonal Health Advisory...'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">News Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC]"
                >
                  <option value="Public Health">Public Health & Disease Control</option>
                  <option value="Education & Innovation">Education & Research</option>
                  <option value="Environment & Water">Environment & Water Resources</option>
                  <option value="Infrastructure">Infrastructure & Energy</option>
                  <option value="Public Safety">Public Safety & Advisories</option>
                  <option value="Agriculture">Agriculture & Food Security</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Target Zone / Region *</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC]"
                >
                  {REGIONAL_ZONES.map((z) => (
                    <option key={z.value} value={z.value}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Social Media Link Field with Live Detector & Banner Extractor */}
            <div className="space-y-3 p-4 bg-blue-50/70 dark:bg-slate-800/80 rounded-2xl border border-blue-200 dark:border-slate-700">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 text-xs">
                  <LinkIcon className="w-4 h-4 text-[#005BAC] dark:text-blue-400" />
                  <span>Official Social Media Post / Video Link (Optional)</span>
                </label>
                {detectedPlatform && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#005BAC] text-white shadow-xs">
                    <PlatformIcon platform={detectedPlatform} className="w-3 h-3 text-white" />
                    <span className="capitalize">{detectedPlatform} link detected</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    onBlur={() => {
                      if (sourceUrl && !imageUrl) {
                        handleAutoFetchBanner(sourceUrl);
                      }
                    }}
                    placeholder="https://youtube.com/watch?v=... or https://t.me/... or https://facebook.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] text-xs font-mono"
                  />
                  {sourceUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setSourceUrl('');
                        setFetchedBannerInfo(null);
                      }}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!sourceUrl || isFetchingBanner}
                  onClick={() => handleAutoFetchBanner(sourceUrl)}
                  className="px-3.5 py-2.5 bg-[#005BAC] hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                  title="Extract real banner photo and post metadata from URL"
                >
                  {isFetchingBanner ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>{isFetchingBanner ? 'Extracting...' : 'Fetch Banner & Info'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                When citizens click on this news card or the "Watch / Open on Social Media" button, they will be navigated directly to your social media post.
              </p>

              {/* Preset quick buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-400 font-bold">Quick Examples:</span>
                {[
                  { label: 'YouTube', domain: 'https://youtube.com/watch?v=' },
                  { label: 'Telegram', domain: 'https://t.me/' },
                  { label: 'Facebook', domain: 'https://facebook.com/' },
                  { label: 'TikTok', domain: 'https://tiktok.com/@' },
                  { label: 'X', domain: 'https://x.com/' },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      if (!sourceUrl) setSourceUrl(p.domain);
                    }}
                    className="px-2 py-0.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-md text-[10px] font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Extracted Banner & Metadata Live Preview Box */}
              {fetchedBannerInfo && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Extracted Real Social Media Banner & Info</span>
                    </span>
                    {fetchedBannerInfo.platform && (
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 rounded text-[#005BAC] dark:text-blue-300">
                        {fetchedBannerInfo.platform}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    {fetchedBannerInfo.imageUrl && (
                      <div className="w-full sm:w-36 h-24 rounded-lg overflow-hidden relative shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <img
                          src={fetchedBannerInfo.imageUrl}
                          alt="Extracted banner"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-1 text-xs">
                      {fetchedBannerInfo.title && (
                        <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                          {fetchedBannerInfo.title}
                        </p>
                      )}
                      {fetchedBannerInfo.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {fetchedBannerInfo.description}
                        </p>
                      )}
                      {fetchedBannerInfo.authorName && (
                        <p className="text-[10px] text-slate-400">
                          Channel / Author: <strong>{fetchedBannerInfo.authorName}</strong>
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        {fetchedBannerInfo.imageUrl && imageUrl !== fetchedBannerInfo.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setImageUrl(fetchedBannerInfo.imageUrl!)}
                            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-[#005BAC] dark:text-blue-300 text-[10px] font-bold rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Use as Cover Image
                          </button>
                        )}
                        {fetchedBannerInfo.title && title !== fetchedBannerInfo.title && (
                          <button
                            type="button"
                            onClick={() => setTitle(fetchedBannerInfo.title!)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            Use Title
                          </button>
                        )}
                        {fetchedBannerInfo.description && description !== fetchedBannerInfo.description && (
                          <button
                            type="button"
                            onClick={() => setDescription(fetchedBannerInfo.description!)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            Use Body Text
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cover Banner Image with Upload & Presets */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
                  <ImageIcon className="w-4 h-4 text-[#005BAC] dark:text-blue-400" />
                  <span>Cover Banner Photo / Image</span>
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-[11px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Image</span>
                  </button>
                )}
              </div>

              {/* Image Input + Upload Button */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste direct photo URL (https://...)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] text-xs font-mono"
                />

                <label className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />
                  <span>Upload Photo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Regional Photo Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold">Or Select Regional Topic Photo Preset:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {REGIONAL_BANNER_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        imageUrl === preset.url
                          ? 'border-[#005BAC] bg-blue-50 dark:bg-blue-950/70 text-[#005BAC] dark:text-blue-300 ring-2 ring-[#005BAC]/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[11px] font-bold block truncate">{preset.label}</span>
                        <span className="text-[9px] text-slate-400 block truncate">{preset.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Image Preview */}
              {imageUrl && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1.5">Banner Image Preview:</span>
                  <div className="h-44 w-full rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-700 shadow-sm group">
                    <img
                      src={imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                        {category} • {zone}
                      </span>
                      <p className="font-bold text-sm line-clamp-1">{title || 'Your Headline Here'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">News Release Body / Description *</label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed information regarding the official announcement..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] leading-relaxed"
              ></textarea>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('published')}
                className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#005BAC] hover:bg-blue-800 text-white font-extrabold rounded-xl shadow-lg flex items-center space-x-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Publish to Citizens Portal</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ADMIN COMMUNICATIONS / DIRECT CHAT DESK */}
      {activeTab === 'communications' && (
        <div>
          <InstitutionAdminChat
            currentUser={currentUser}
            messages={messages}
            onSendMessage={onSendMessage || (() => {})}
            onNavigateToPublishNews={() => setActiveTab('create')}
          />
        </div>
      )}

      {/* CHANGE PASSWORD MODAL FOR INSTITUTION */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95 font-['Poppins',sans-serif]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    {currentUser.isDefaultPassword ? 'Update Default Password' : 'Change Account Password'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isPublisher ? 'Publisher' : 'Institution'}: <strong className="text-slate-700 dark:text-slate-300 font-mono">{publisherDisplayName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentUser.isDefaultPassword && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-xl text-xs leading-relaxed">
                <strong>First-Time Security Setup:</strong> As a verified regional {isPublisher ? 'Publisher' : 'institution'} partner, please replace your initial default password with a secure, private password before continuing.
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Current / Default Password *
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current / default password"
                    className="w-full px-3.5 py-2.5 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  New Private Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6-8+ characters"
                    className="w-full px-3.5 py-2.5 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Password Strength:</span>
                      <span className={`font-bold ${passStrength.color}`}>{passStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full transition-all ${
                          passStrength.score >= 1 ? passStrength.color.split(' ')[0] : 'bg-transparent'
                        }`}
                        style={{ width: `${(passStrength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                {!currentUser.isDefaultPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isChangingPassword || !newPassword}
                  className="px-5 py-2 bg-[#005BAC] hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl shadow cursor-pointer transition-colors"
                >
                  {isChangingPassword ? 'Saving Password...' : 'Save & Secure Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDIA MANAGEMENT MODAL FOR SELECTED NEWS BULLETIN */}
      {selectedNewsForMedia && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-[#005BAC] dark:text-blue-400">Media Publications Manager</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                  {selectedNewsForMedia.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNewsForMedia(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <ReportMediaSection
              reportId={selectedNewsForMedia.id}
              reportTitle={selectedNewsForMedia.title}
              institutionId={currentUser.id}
              institutionName={currentUser.institutionName || currentUser.fullName}
              mediaList={mediaList.filter((m) => m.reportId === selectedNewsForMedia.id || m.id === selectedNewsForMedia.id)}
              verifiedChannels={myChannels}
              currentUser={currentUser}
              canManage={true}
              isAdmin={currentUser.role === 'Administrator'}
              onAddMedia={onAddMedia}
              onDeleteMedia={onDeleteMedia}
              onSetPrimaryMedia={onSetPrimaryMedia}
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNewsForMedia(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-200 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
