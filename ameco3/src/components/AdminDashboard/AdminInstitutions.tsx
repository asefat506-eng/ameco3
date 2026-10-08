import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  UserProfile,
  Message,
  TrendingNewsItem,
  InstitutionSocialChannel,
  ChannelVerificationStatus,
  EvidenceFile,
} from '../../types';
import { ChatComposer } from '../Common/ChatComposer';
import { MessageAttachment } from '../Common/MessageAttachment';
import { REGIONAL_ZONES } from '../../data/zones';
import { OfficialChannelsManager } from '../SocialMedia/OfficialChannelsManager';
import { PlatformIcon } from '../SocialMedia/PlatformIcon';
import {
  Building2,
  MessageSquare,
  Send,
  Search,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Radio,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Globe,
  PlusCircle,
  FileText,
  Clock,
  Sparkles,
  Zap,
  Tag,
  Briefcase,
  Users,
  ChevronRight,
  Filter,
  CheckCheck,
  Flame,
  UserCheck,
  BadgeCheck,
  Layers,
  ArrowUpRight,
  Info,
  SlidersHorizontal,
  ChevronDown,
  Megaphone,
  Share2,
  X,
} from 'lucide-react';

interface AdminInstitutionsProps {
  currentUser: UserProfile;
  users: UserProfile[];
  messages: Message[];
  trendingNews: TrendingNewsItem[];
  channels?: InstitutionSocialChannel[];
  onSendMessage: (
    reportIdOrChannel: string,
    text: string,
    extra?: {
      recipientId?: string;
      isBroadcast?: boolean;
      priority?: 'Normal' | 'High' | 'Urgent';
      reportId?: string;
      attachment?: EvidenceFile;
    }
  ) => void;
  onUpdateUser?: (updated: UserProfile) => void;
  onUpdateUserStatus?: (userId: string, status: 'active' | 'suspended' | 'banned') => void;
  onSaveChannel?: (channel: InstitutionSocialChannel) => void;
  onVerifyChannel?: (channelId: string, status: ChannelVerificationStatus, reason?: string) => void;
  onDeleteChannel?: (channelId: string) => void;
  initialSelectedInstitutionId?: string | null;
}

export const AdminInstitutions: React.FC<AdminInstitutionsProps> = ({
  currentUser,
  users,
  messages,
  trendingNews,
  channels = [],
  onSendMessage,
  onUpdateUser,
  onUpdateUserStatus,
  onSaveChannel,
  onVerifyChannel,
  onDeleteChannel,
  initialSelectedInstitutionId,
}) => {
  // All registered institutions
  const institutions = useMemo(() => {
    return users.filter((u) => u.role === 'Institution' || u.role === 'Publisher');
  }, [users]);
  const hasInstitutionAccounts = institutions.some((user) => user.role === 'Institution');
  const directoryAccountLabel = hasInstitutionAccounts ? 'Institution' : 'Publisher';
  const getAccountDisplayName = (user: UserProfile) =>
    user.role === 'Publisher' ? user.fullName : user.institutionName || user.fullName;

  // Main View Mode: 'directory' (all institutions list) or 'chat' (1-on-1 / broadcast chat)
  const [viewMode, setViewMode] = useState<'directory' | 'chat'>(() => {
    return initialSelectedInstitutionId ? 'chat' : 'directory';
  });

  // Selected Channel: 'broadcast-institutions' or 'inst-<id>'
  const [selectedChannelId, setSelectedChannelId] = useState<string>(() => {
    if (initialSelectedInstitutionId) {
      return `inst-${initialSelectedInstitutionId}`;
    }
    return institutions.length > 0 ? `inst-${institutions[0].id}` : 'broadcast-institutions';
  });

  // Directory Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');

  // Chat Input & Priority
  const [chatInput, setChatInput] = useState<string>('');
  const [messagePriority, setMessagePriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [showDossier, setShowDossier] = useState<boolean>(true);

  // Selected Institution for details modal
  const [dossierInstitution, setDossierInstitution] = useState<UserProfile | null>(null);

  // Auto-scroll ref for chat messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedChannelId, viewMode]);

  // Selected Institution if in 1-on-1 channel
  const selectedInstitution = useMemo(() => {
    if (selectedChannelId.startsWith('inst-')) {
      const id = selectedChannelId.replace('inst-', '');
      return institutions.find((inst) => inst.id === id) || null;
    }
    return null;
  }, [selectedChannelId, institutions]);

  // Categories extracted from institutions list
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    institutions.forEach((inst) => {
      if (inst.institutionCategory) set.add(inst.institutionCategory);
    });
    return Array.from(set);
  }, [institutions]);

  // Filtered institutions
  const filteredInstitutions = useMemo(() => {
    return institutions.filter((inst) => {
      const matchesCategory =
        categoryFilter === 'All' || inst.institutionCategory === categoryFilter;
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'active' && (inst.status === 'active' || !inst.status)) ||
        (statusFilter === 'pending' && inst.status === 'pending') ||
        (statusFilter === 'approved' && inst.isApprovedInstitution) ||
        (statusFilter === 'suspended' && inst.status === 'suspended');
      const matchesZone =
        zoneFilter === 'All' ||
        inst.zone === zoneFilter ||
        inst.region === zoneFilter ||
        (inst.zone && inst.zone.toLowerCase().includes(zoneFilter.toLowerCase())) ||
        (inst.region && inst.region.toLowerCase().includes(zoneFilter.toLowerCase()));

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        inst.fullName.toLowerCase().includes(q) ||
        (inst.institutionName && inst.institutionName.toLowerCase().includes(q)) ||
        inst.id.toLowerCase().includes(q) ||
        inst.email.toLowerCase().includes(q) ||
        (inst.phone && inst.phone.toLowerCase().includes(q)) ||
        (inst.registrationNumber && inst.registrationNumber.toLowerCase().includes(q)) ||
        (inst.zone && inst.zone.toLowerCase().includes(q));

      return matchesCategory && matchesStatus && matchesZone && matchesQuery;
    });
  }, [institutions, categoryFilter, statusFilter, zoneFilter, searchQuery]);

  // Get messages for current active channel
  const activeMessages = useMemo(() => {
    if (selectedChannelId === 'broadcast-institutions') {
      return messages.filter(
        (m) =>
          m.channelId === 'broadcast-institutions' ||
          m.reportId === 'ALL_INSTITUTIONS' ||
          (m.isBroadcast && (m.recipientRole === 'Institution' || m.recipientRole === 'Publisher'))
      );
    }

    if (selectedChannelId.startsWith('inst-')) {
      const instId = selectedChannelId.replace('inst-', '');
      return messages.filter(
        (m) =>
          (m.recipientId === instId && (m.senderRole === 'Administrator' || m.senderId === currentUser.id)) ||
          (m.senderId === instId && (m.recipientId === 'ADM-001' || m.recipientRole === 'Administrator' || m.reportId === instId)) ||
          m.channelId === `admin-inst-${instId}` ||
          m.reportId === instId
      );
    }

    return [];
  }, [messages, selectedChannelId, currentUser.id]);

  // Get latest message for an institution
  const getLatestMessage = (instId: string) => {
    const instMsgs = messages.filter(
      (m) =>
        m.channelId === `admin-inst-${instId}` ||
        m.recipientId === instId ||
        m.senderId === instId ||
        m.reportId === instId
    );
    if (instMsgs.length === 0) return null;
    return instMsgs[instMsgs.length - 1];
  };

  // Switch to chat mode with specific institution
  const handleOpenChatWithInstitution = (instId: string) => {
    setSelectedChannelId(`inst-${instId}`);
    setViewMode('chat');
  };

  // Toggle publishing approval for institution
  const handleTogglePublishingApproval = (inst: UserProfile) => {
    if (!onUpdateUser) return;
    const updated: UserProfile = {
      ...inst,
      isApprovedInstitution: !inst.isApprovedInstitution,
      verified: true,
      status: 'active',
      updatedAt: new Date().toISOString(),
    };
    onUpdateUser(updated);

    // Send automated system notification message to institution
    const approvalText = updated.isApprovedInstitution
      ? `Official Notice: Your institution account (${inst.institutionName || inst.fullName}) has been APPROVED by AMECO Central Administration for publishing verified regional news and public bulletins.`
      : `Official Notice: Your news publishing authorization has been placed on hold pending administrative review.`;

    onSendMessage(inst.id, approvalText, {
      recipientId: inst.id,
      priority: 'High',
    });
  };

  // Send message
  const handleSend = (e?: React.FormEvent, composerText?: string, attachment?: EvidenceFile) => {
    if (e) e.preventDefault();
    const text = (composerText ?? chatInput).trim();
    if (!text && !attachment) return;

    if (selectedChannelId === 'broadcast-institutions') {
      onSendMessage('ALL_INSTITUTIONS', text, {
        isBroadcast: true,
        priority: messagePriority,
        attachment,
      });
    } else if (selectedChannelId.startsWith('inst-')) {
      const instId = selectedChannelId.replace('inst-', '');
      onSendMessage(instId, text, {
        recipientId: instId,
        priority: messagePriority,
        attachment,
      });
    }

    setChatInput('');
    setMessagePriority('Normal');
  };

  const insertPromptDirective = (directive: string) => {
    setChatInput((prev) => (prev ? `${prev} ${directive}` : directive));
  };

  return (
    <div className="space-y-6 pb-16 font-['Poppins',sans-serif] animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Partner Agency & {directoryAccountLabel} Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {directoryAccountLabel} Network & Official Communications
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-2xl">
              Directory of verified public bureaus, universities, healthcare centers, and regional agencies across Amhara Region with dedicated 1-on-1 administrative communication lines.
            </p>
          </div>

          {/* Mode Switcher & Broadcast Trigger */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-2xl flex items-center border border-slate-200 dark:border-zinc-700">
              <button
                id="btn-admin-inst-view-directory"
                onClick={() => setViewMode('directory')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                  viewMode === 'directory'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{directoryAccountLabel} Directory ({institutions.length})</span>
              </button>
              <button
                id="btn-admin-inst-view-chat"
                onClick={() => setViewMode('chat')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                  viewMode === 'chat'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>Communications Desk</span>
              </button>
            </div>

            <button
              id="btn-admin-inst-broadcast"
              onClick={() => {
                setSelectedChannelId('broadcast-institutions');
                setViewMode('chat');
              }}
              className="px-4 py-2.5 bg-[#005BAC] hover:bg-blue-800 text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>Broadcast Notice</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold block">
              Total {directoryAccountLabel}s
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-slate-900 dark:text-white">{institutions.length}</span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">Agencies</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
            <span className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-bold block">
              Publishing Authorized
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                {institutions.filter((i) => i.isApprovedInstitution).length}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">Approved</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
            <span className="text-[10px] font-mono uppercase text-amber-700 dark:text-amber-400 font-bold block">
              Pending Review
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-amber-700 dark:text-amber-300">
                {institutions.filter((i) => !i.isApprovedInstitution || i.status === 'pending').length}
              </span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">Verification</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40">
            <span className="text-[10px] font-mono uppercase text-blue-700 dark:text-blue-400 font-bold block">
              Published Bulletins
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-blue-700 dark:text-blue-300">{trendingNews.length}</span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">Live Articles</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DIRECTORY VIEW MODE                                                    */}
      {/* ========================================================================= */}
      {viewMode === 'directory' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-institution-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search institutions by name, registration #, zone, email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Categories</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="approved">Publishing Authorized</option>
                <option value="pending">Pending Approval</option>
                <option value="active">Active Accounts</option>
                <option value="suspended">Suspended</option>
              </select>

              {/* Zone Filter */}
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Regions & Cities</option>
                {REGIONAL_ZONES.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Institutions Grid */}
          {filteredInstitutions.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Building2 className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-700" />
              <h3 className="font-bold text-base text-slate-800 dark:text-zinc-200">No institutions found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No registered institution matches your search filters. Try clearing or expanding your search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInstitutions.map((inst) => {
                const isApproved = inst.isApprovedInstitution ?? inst.verified ?? true;
                const publishedCount = trendingNews.filter(
                  (n) => n.institutionId === inst.id || n.institutionName === (inst.institutionName || inst.fullName)
                ).length;
                const lastMsg = getLatestMessage(inst.id);

                return (
                  <div
                    key={inst.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Card Top Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#005BAC] dark:text-blue-400 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                              {inst.id}
                            </span>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                              {getAccountDisplayName(inst)}
                            </h3>
                          </div>
                        </div>

                        {isApproved ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold font-mono shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Authorized</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[10px] font-bold font-mono shrink-0 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Pending</span>
                          </span>
                        )}
                      </div>

                      {/* Institution Metadata */}
                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span className="text-[11px] text-slate-400">Category:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {inst.institutionCategory || 'Public Agency'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span className="text-[11px] text-slate-400">Zone / Locality:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{inst.zone}</span>
                          </span>
                        </div>

                        {inst.registrationNumber && (
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span className="text-[11px] text-slate-400">Registration #:</span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                              {inst.registrationNumber}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span className="text-[11px] text-slate-400">Contact Email:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] truncate max-w-[170px]">
                            {inst.email}
                          </span>
                        </div>

                        {inst.phone && (
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span className="text-[11px] text-slate-400">Phone:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                              {inst.phone}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1">
                          <span className="text-[11px] text-slate-400">Published News:</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {publishedCount} bulletins
                          </span>
                        </div>

                        {/* Connected Social Media Channels */}
                        {(() => {
                          const instChannels = channels.filter(
                            (c) => c.institutionId === inst.id || c.institutionName === (inst.institutionName || inst.fullName)
                          );
                          if (instChannels.length === 0) return null;
                          return (
                            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Share2 className="w-3 h-3 text-[#005BAC]" />
                                <span>Official Channels:</span>
                              </span>
                              <div className="flex items-center gap-1">
                                {instChannels.map((c) => (
                                  <div
                                    key={c.id}
                                    title={`${c.platform.toUpperCase()}: ${c.channelName} (${c.verificationStatus})`}
                                    className={`p-1 rounded-md border flex items-center justify-center ${
                                      c.verificationStatus === 'Verified'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/50 dark:border-emerald-800'
                                        : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-zinc-800 dark:border-zinc-700'
                                    }`}
                                  >
                                    <PlatformIcon platform={c.platform} className="w-3.5 h-3.5" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Latest Message Preview */}
                      {lastMsg && (
                        <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200/70 dark:border-zinc-800/80 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                            <span className="font-bold text-slate-600 dark:text-slate-300">
                              {lastMsg.senderRole === 'Administrator' ? 'You' : directoryAccountLabel}:
                            </span>
                            <span>{lastMsg.timestamp}</span>
                          </div>
                          <p className="text-slate-700 dark:text-zinc-300 line-clamp-1 italic">
                            "{lastMsg.text}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          id={`btn-open-chat-${inst.id}`}
                          onClick={() => handleOpenChatWithInstitution(inst.id)}
                          className="py-2 px-3 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                          <span>Direct Chat</span>
                        </button>

                        <button
                          id={`btn-view-dossier-${inst.id}`}
                          onClick={() => setDossierInstitution(inst)}
                          className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5 text-blue-500" />
                          <span>Dossier</span>
                        </button>
                      </div>

                      {/* Toggle Approval Button */}
                      <button
                        id={`btn-toggle-approval-${inst.id}`}
                        onClick={() => handleTogglePublishingApproval(inst)}
                        className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold border transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                          isApproved
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                            : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-emerald-100 hover:text-emerald-800'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isApproved ? 'Revoke Publishing Permission' : 'Authorize News Publishing'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COMMUNICATIONS DESK (LIVE CHAT MODE)                                   */}
      {/* ========================================================================= */}
      {viewMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Channel Selector List */}
          <div className="lg:col-span-4 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Official Agency Channels
              </span>
              <button
                onClick={() => setViewMode('directory')}
                className="text-[11px] font-bold text-[#005BAC] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Directory</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Broadcast Option */}
            <button
              id="btn-select-broadcast-institutions"
              onClick={() => setSelectedChannelId('broadcast-institutions')}
              className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between border cursor-pointer ${
                selectedChannelId === 'broadcast-institutions'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-[#005BAC] dark:border-blue-700 text-slate-900 dark:text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-none">Broadcast to All {directoryAccountLabel}s</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    All {institutions.length} partner agencies
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                ALL
              </span>
            </button>

            {/* Institution Channels List */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {institutions.map((inst) => {
                const isSelected = selectedChannelId === `inst-${inst.id}`;
                const lastMsg = getLatestMessage(inst.id);

                return (
                  <button
                    key={inst.id}
                    id={`btn-channel-inst-${inst.id}`}
                    onClick={() => setSelectedChannelId(`inst-${inst.id}`)}
                    className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-800 dark:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-400 border border-blue-100 dark:border-blue-900'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-xs truncate">
                            {getAccountDisplayName(inst)}
                          </h4>
                        </div>
                        <p
                          className={`text-[10px] truncate mt-0.5 ${
                            isSelected ? 'text-white/80 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {lastMsg ? lastMsg.text : inst.zone}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span
                        className={`text-[9px] font-mono font-bold block ${
                          isSelected ? 'text-white/70 dark:text-slate-600' : 'text-slate-400'
                        }`}
                      >
                        {inst.id}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Active Chat Conversation */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[580px]">
              {/* Chat Header */}
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-[#005BAC] dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
                    {selectedChannelId === 'broadcast-institutions' ? (
                      <Megaphone className="w-5 h-5" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {selectedChannelId === 'broadcast-institutions'
                          ? 'Broadcast Notice to All Partner Institutions'
                          : selectedInstitution?.institutionName || selectedInstitution?.fullName || 'Institution Channel'}
                      </h2>
                      {selectedInstitution?.isApprovedInstitution && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold font-mono">
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {selectedInstitution ? (
                        <>
                          <span>{selectedInstitution.id}</span>
                          <span>•</span>
                          <span>{selectedInstitution.institutionCategory || 'Agency'}</span>
                          <span>•</span>
                          <span>{selectedInstitution.zone}</span>
                        </>
                      ) : (
                        <span>Official Multi-Agency Broadcast Protocol</span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedInstitution && (
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setDossierInstitution(selectedInstitution)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center space-x-1 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-blue-500" />
                      <span>Dossier</span>
                    </button>
                    <button
                      onClick={() => handleTogglePublishingApproval(selectedInstitution)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        selectedInstitution.isApprovedInstitution
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {selectedInstitution.isApprovedInstitution ? 'Authorized' : 'Approve'}
                    </button>
                  </div>
                )}
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[420px] bg-slate-50/40 dark:bg-black/20">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-400 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200">
                        Official Communication Channel Initialized
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1">
                        Send official administrative directives, request bulletins verification, or initiate correspondence with this institutional partner.
                      </p>
                    </div>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isAdminSender = msg.senderRole === 'Administrator' || msg.senderId === currentUser.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdminSender ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-3xl p-4 space-y-2 shadow-xs ${
                            isAdminSender
                              ? 'bg-slate-900 dark:bg-zinc-800 text-white rounded-tr-none'
                              : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-tl-none'
                          }`}
                        >
                          {/* Sender identity & Priority Tag */}
                          <div className="flex items-center justify-between gap-3 text-[10px] font-mono">
                            <span className="font-bold opacity-80">
                              {isAdminSender
                                ? 'AMECO Central Administration'
                                : selectedInstitution?.institutionName || msg.senderDisplayName || 'Institution'}
                            </span>
                            {msg.priority && msg.priority !== 'Normal' && (
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                                  msg.priority === 'Urgent'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-amber-500 text-white'
                                }`}
                              >
                                {msg.priority} Notice
                              </span>
                            )}
                          </div>

                          {/* Message Text */}
                          {msg.text && <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                          <MessageAttachment attachment={msg.attachment} />

                          {/* Timestamp */}
                          <div className="flex items-center justify-end space-x-1 text-[10px] opacity-60 font-mono pt-1">
                            <Clock className="w-3 h-3" />
                            <span>{msg.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Institutional Directives (Prompt Chips) */}
              <div className="px-4 py-2 bg-slate-100/70 dark:bg-zinc-950/80 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="font-bold text-slate-500 text-[10px] font-mono shrink-0">Directives:</span>
                <button
                  onClick={() =>
                    insertPromptDirective(
                      'Request official agency verification on incoming citizen report.'
                    )
                  }
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 text-[11px] font-medium whitespace-nowrap cursor-pointer shrink-0"
                >
                  Verify Report
                </button>
                <button
                  onClick={() =>
                    insertPromptDirective(
                      'Please share official press release / bulletin document with AMECO editorial desk.'
                    )
                  }
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 text-[11px] font-medium whitespace-nowrap cursor-pointer shrink-0"
                >
                  Request Press Release
                </button>
                <button
                  onClick={() =>
                    insertPromptDirective(
                      'Official focal person contact update requested for this reporting period.'
                    )
                  }
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 text-[11px] font-medium whitespace-nowrap cursor-pointer shrink-0"
                >
                  Update Focal Person
                </button>
              </div>

              {/* Chat Input & Controls */}
              <ChatComposer
                onSend={(text, attachment) => handleSend(undefined, text, attachment)}
                placeholder={`Type official communication to ${selectedChannelId === 'broadcast-institutions' ? 'all institutions' : selectedInstitution?.institutionName || 'this agency'}...`}
                className="border-t border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      Message Priority:
                    </span>
                    {(['Normal', 'High', 'Urgent'] as const).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setMessagePriority(p)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono transition-all cursor-pointer ${
                          messagePriority === p
                            ? p === 'Urgent'
                              ? 'bg-red-600 text-white shadow-xs'
                              : p === 'High'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    Logged to Official Audit Trail
                  </span>
                </div>

              </ChatComposer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSTITUTION DOSSIER & CHANNELS MODAL                                      */}
      {/* ========================================================================= */}
      {dossierInstitution && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-[#005BAC] dark:text-blue-400 flex items-center justify-center font-bold text-xl">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400">{dossierInstitution.id}</span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {dossierInstitution.institutionName || dossierInstitution.fullName}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setDossierInstitution(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-zinc-800/50">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {dossierInstitution.institutionCategory || 'Regional Agency'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-zinc-800/50">
                <span className="text-slate-500">Registration ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {dossierInstitution.registrationNumber || 'GOV-REG-PENDING'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-zinc-800/50">
                <span className="text-slate-500">Official Email:</span>
                <span className="font-mono text-slate-900 dark:text-white">{dossierInstitution.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-zinc-800/50">
                <span className="text-slate-500">Phone Number:</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {dossierInstitution.phone || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-zinc-800/50">
                <span className="text-slate-500">Regional Zone:</span>
                <span className="font-medium text-slate-900 dark:text-white">{dossierInstitution.zone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-zinc-800/50">
                <span className="text-slate-500">Official Website:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  {dossierInstitution.institutionWebsite || dossierInstitution.officialWebsite || 'https://ameco.org'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Publishing Status:</span>
                <span
                  className={`font-bold font-mono ${
                    dossierInstitution.isApprovedInstitution
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {dossierInstitution.isApprovedInstitution ? 'Authorized' : 'Pending Authorization'}
                </span>
              </div>
            </div>

            {/* Official Social Media Channels Management Component */}
            <div className="pt-2">
              <OfficialChannelsManager
                institution={dossierInstitution}
                channels={channels.filter(
                  (c) =>
                    c.institutionId === dossierInstitution.id ||
                    c.institutionName === (dossierInstitution.institutionName || dossierInstitution.fullName)
                )}
                currentUser={currentUser}
                isAdmin={true}
                onSaveChannel={(ch) => onSaveChannel?.(ch)}
                onDeleteChannel={(id) => onDeleteChannel?.(id)}
                onVerifyChannel={(id, status, reason) => onVerifyChannel?.(id, status, reason)}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  const id = dossierInstitution.id;
                  setDossierInstitution(null);
                  handleOpenChatWithInstitution(id);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#005BAC] hover:bg-blue-800 text-white font-bold text-xs flex items-center space-x-2 shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Direct Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
