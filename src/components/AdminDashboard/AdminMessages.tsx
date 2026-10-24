import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserProfile, ReportItem, Message, Department, EvidenceFile } from '../../types';
import { ChatComposer } from '../Common/ChatComposer';
import { MessageAttachment } from '../Common/MessageAttachment';
import {
  MessageSquare,
  Send,
  Users,
  Radio,
  Search,
  CheckCheck,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  FileText,
  Clock,
  Sparkles,
  Zap,
  Info,
  BadgeCheck,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowUpRight,
  Paperclip,
  Flame,
  CheckCircle2,
  UserCheck,
  Grid,
  ListFilter,
  ArrowLeft,
  UserPlus,
  RefreshCw,
  PhoneCall,
  Inbox,
  ShieldAlert,
} from 'lucide-react';

interface AdminMessagesProps {
  currentUser: UserProfile;
  users: UserProfile[];
  reports: ReportItem[];
  departments: Department[];
  messages: Message[];
  onSendMessage: (
    reportIdOrChannel: string,
    text: string,
    extra?: { recipientId?: string; isBroadcast?: boolean; priority?: 'Normal' | 'High' | 'Urgent'; attachment?: EvidenceFile }
  ) => void;
  onOpenReviewModal?: (report: ReportItem) => void;
  onOpenAssignModal?: (report: ReportItem) => void;
  initialSelectedInvestigatorId?: string | null;
}

export const AdminMessages: React.FC<AdminMessagesProps> = ({
  currentUser,
  users,
  reports,
  departments,
  messages,
  onSendMessage,
  onOpenReviewModal,
  onOpenAssignModal,
  initialSelectedInvestigatorId,
}) => {
  // All investigators in system
  const investigators = useMemo(() => {
    return users.filter((u) => u.role === 'ResponsiblePerson');
  }, [users]);

  // Main View Mode: 'directory' (all investigators list) or 'chat' (1-on-1 / channel chat console)
  const [viewMode, setViewMode] = useState<'directory' | 'chat'>(() => {
    return initialSelectedInvestigatorId ? 'chat' : 'directory';
  });

  // Selected Channel: 'broadcast-all' or 'inv-<id>' or 'report-<id>'
  const [selectedChannelId, setSelectedChannelId] = useState<string>(() => {
    if (initialSelectedInvestigatorId) {
      return `inv-${initialSelectedInvestigatorId}`;
    }
    return investigators.length > 0 ? `inv-${investigators[0].id}` : 'broadcast-all';
  });

  // Directory Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Busy'>('All');
  const [categoryTab, setCategoryTab] = useState<'all' | 'broadcast' | 'direct' | 'by-case'>('all');

  // Chat Input & Directives
  const [chatInput, setChatInput] = useState<string>('');
  const [messagePriority, setMessagePriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [showDossier, setShowDossier] = useState<boolean>(true);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedChannelId, viewMode]);

  // Selected Investigator if 1-on-1
  const selectedInvestigator = useMemo(() => {
    if (selectedChannelId.startsWith('inv-')) {
      const id = selectedChannelId.replace('inv-', '');
      return investigators.find((inv) => inv.id === id) || null;
    }
    return null;
  }, [selectedChannelId, investigators]);

  // Selected Case if by-case
  const selectedCaseReport = useMemo(() => {
    if (selectedChannelId.startsWith('report-')) {
      const reportId = selectedChannelId.replace('report-', '');
      return reports.find((r) => r.id === reportId) || null;
    }
    return null;
  }, [selectedChannelId, reports]);

  // Cases assigned to selected investigator
  const investigatorCases = useMemo(() => {
    if (!selectedInvestigator) return [];
    const invFullNameLower = (selectedInvestigator.fullName || '').toLowerCase();
    return reports.filter(
      (r) =>
        r.assignedTo?.responsiblePersonId === selectedInvestigator.id ||
        (r.assignedTo?.responsiblePersonName &&
          r.assignedTo.responsiblePersonName.toLowerCase().includes(invFullNameLower))
    );
  }, [selectedInvestigator, reports]);

  // Filtered investigators list
  const filteredInvestigators = useMemo(() => {
    return (investigators || []).filter((inv) => {
      if (!inv) return false;
      const matchesDept = deptFilter === 'All' || inv.department === deptFilter;
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Available' && inv.availability === 'Available') ||
        (statusFilter === 'Busy' && inv.availability !== 'Available');

      const q = (searchQuery || '').toLowerCase().trim();
      const matchesQuery =
        !q ||
        (inv.fullName || '').toLowerCase().includes(q) ||
        (inv.id || '').toLowerCase().includes(q) ||
        (inv.email || '').toLowerCase().includes(q) ||
        (inv.phone && (inv.phone || '').toLowerCase().includes(q)) ||
        (inv.department && (inv.department || '').toLowerCase().includes(q)) ||
        (inv.zone && (inv.zone || '').toLowerCase().includes(q)) ||
        (inv.woreda && (inv.woreda || '').toLowerCase().includes(q)) ||
        (inv.specialization && (inv.specialization || '').toLowerCase().includes(q)) ||
        (inv.badgeNumber && (inv.badgeNumber || '').toLowerCase().includes(q));

      return matchesDept && matchesStatus && matchesQuery;
    });
  }, [investigators, deptFilter, statusFilter, searchQuery]);

  // Filtered assigned reports for case threads
  const assignedReportsList = useMemo(() => {
    return reports.filter((r) => Boolean(r.assignedTo?.responsiblePersonId || r.assignedTo?.responsiblePersonName));
  }, [reports]);

  // Get messages for current active channel
  const activeMessages = useMemo(() => {
    if (selectedChannelId === 'broadcast-all') {
      return messages.filter(
        (m) =>
          m.isBroadcast ||
          m.reportId === 'ALL_INVESTIGATORS' ||
          m.channelId === 'broadcast-all'
      );
    }

    if (selectedChannelId.startsWith('inv-')) {
      const invId = selectedChannelId.replace('inv-', '');
      return messages.filter(
        (m) =>
          (m.recipientId === invId && m.senderRole === 'Administrator') ||
          (m.senderId === invId &&
            (m.recipientId === currentUser.id ||
              m.recipientRole === 'Administrator' ||
              m.reportId === invId)) ||
          m.channelId === `admin-inv-${invId}` ||
          m.reportId === invId
      );
    }

    if (selectedChannelId.startsWith('report-')) {
      const repId = selectedChannelId.replace('report-', '');
      return messages.filter((m) => m.reportId === repId);
    }

    return [];
  }, [messages, selectedChannelId, currentUser.id]);

  // Get latest message for an investigator
  const getLatestMessage = (invId: string) => {
    const invMsgs = messages.filter(
      (m) =>
        m.channelId === `admin-inv-${invId}` ||
        m.recipientId === invId ||
        m.senderId === invId ||
        m.reportId === invId
    );
    if (invMsgs.length === 0) return null;
    return invMsgs[invMsgs.length - 1];
  };

  // Switch to 1-on-1 chat with a specific investigator
  const handleOpenChatWithInvestigator = (invId: string) => {
    setSelectedChannelId(`inv-${invId}`);
    setViewMode('chat');
  };

  const handleSend = (e?: React.FormEvent, composerText?: string, attachment?: EvidenceFile) => {
    if (e) e.preventDefault();
    const text = (composerText ?? chatInput).trim();
    if (!text && !attachment) return;

    if (selectedChannelId === 'broadcast-all') {
      onSendMessage('ALL_INVESTIGATORS', text, {
        isBroadcast: true,
        priority: messagePriority,
        attachment,
      });
    } else if (selectedChannelId.startsWith('inv-')) {
      const invId = selectedChannelId.replace('inv-', '');
      onSendMessage(invId, text, {
        recipientId: invId,
        priority: messagePriority,
        attachment,
      });
    } else if (selectedChannelId.startsWith('report-')) {
      const repId = selectedChannelId.replace('report-', '');
      onSendMessage(repId, text, {
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
    <div className="space-y-4 pb-12">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 text-slate-900 dark:text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>AMECO Central Administration • Field Operations Command</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center space-x-2 text-slate-900 dark:text-white">
            <UserCheck className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            <span>AMECO Field Investigators & Communications Hub</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Browse all certified regional investigators, review field caseloads, and conduct direct encrypted 1-on-1 operational chats or broadcast urgent directives.
          </p>
        </div>

        {/* View Switcher & Quick Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              id="btn-view-investigator-directory"
              type="button"
              onClick={() => setViewMode('directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'directory'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All Investigators ({investigators.length})</span>
            </button>
            <button
              id="btn-view-live-chat"
              type="button"
              onClick={() => setViewMode('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'chat'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct Chat & Dispatch</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 text-center">
            <div className="px-2 border-r border-slate-200 dark:border-slate-700">
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {investigators.filter((i) => i.availability === 'Available').length}
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">On Duty</div>
            </div>
            <div className="px-2">
              <div className="text-sm font-black text-amber-600 dark:text-amber-400">{assignedReportsList.length}</div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Active Cases</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: ALL INVESTIGATORS DIRECTORY & ROSTER VIEW                          */}
      {/* ========================================================================= */}
      {viewMode === 'directory' && (
        <div className="space-y-4">
          {/* Search, Department & Status Filters Bar */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="input-search-investigators"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, badge ID, zone, specialization..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#005BAC] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
              {/* Department Dropdown */}
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:ring-2 focus:ring-[#005BAC] outline-none"
              >
                <option value="All">All Departments ({departments.length})</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('All')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'All'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  All ({investigators.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('Available')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'Available'
                      ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  Available
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('Busy')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'Busy'
                      ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  Busy
                </button>
              </div>

              {/* Broadcast Action Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedChannelId('broadcast-all');
                  setViewMode('chat');
                }}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                title="Send broadcast to all investigators"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Broadcast Alert</span>
              </button>
            </div>
          </div>

          {/* Investigators Grid */}
          {filteredInvestigators.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Investigators Found</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                No field investigators matched your search query or selected department filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDeptFilter('All');
                  setStatusFilter('All');
                }}
                className="px-3 py-1.5 bg-[#005BAC] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-800"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInvestigators.map((inv) => {
                const isAvailable = inv.availability === 'Available';
                const assignedCases = reports.filter(
                  (r) =>
                    r.assignedTo?.responsiblePersonId === inv.id ||
                    (r.assignedTo?.responsiblePersonName &&
                      r.assignedTo.responsiblePersonName.toLowerCase().includes((inv.fullName || '').toLowerCase()))
                );
                const latestMsg = getLatestMessage(inv.id);

                return (
                  <div
                    key={inv.id}
                    id={`card-investigator-${inv.id}`}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-[#005BAC] dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                  >
                    {/* Header: Photo, Name, Badge & Status */}
                    <div className="flex items-start space-x-3.5">
                      <div className="relative shrink-0">
                        <div className="w-13 h-13 rounded-2xl bg-[#005BAC] text-white flex items-center justify-center font-extrabold text-xl shadow-xs border-2 border-slate-200 dark:border-zinc-700">
                          {inv.fullName ? inv.fullName.trim().charAt(0).toUpperCase() : 'I'}
                        </div>
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                            isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          title={`Status: ${inv.availability || 'Active'}`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {inv.fullName}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shrink-0">
                            {inv.id}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-[#005BAC] dark:text-blue-400 truncate mt-0.5">
                          {inv.department || 'Investigative Desk'}
                        </p>

                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            />
                            <span>{inv.availability || 'On Duty'}</span>
                          </span>

                          <span className="text-[10px] font-mono text-slate-400">
                            {inv.clearanceLevel?.split('-')[0] || 'Level 3'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Specialization Details */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-2 text-xs">
                      <div className="flex items-center space-x-2 text-slate-700 dark:text-zinc-300">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{inv.serviceArea || `${inv.zone}, ${inv.region || 'Amhara'}`}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-slate-700 dark:text-zinc-300">
                        <BadgeCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{inv.specialization || 'General Field Verification'}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 pt-1 border-t border-slate-200 dark:border-zinc-700/60 text-[11px]">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-emerald-500" />
                          <span>{inv.phone || '+251 91 100 0000'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="w-3 h-3 text-blue-500" />
                          <span className="font-bold text-slate-900 dark:text-white">
                            {assignedCases.length} active {assignedCases.length === 1 ? 'case' : 'cases'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Latest Message Preview (if any) */}
                    {latestMsg ? (
                      <div className="px-3 py-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-zinc-300 flex items-start space-x-2">
                        <MessageSquare className="w-3.5 h-3.5 text-[#005BAC] shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-mono font-bold text-[#005BAC] dark:text-blue-300 block">
                            Recent Comms:
                          </span>
                          <p className="text-[11px] truncate mt-0.5">
                            {latestMsg.senderRole === 'Administrator' ? 'You: ' : `${inv.fullName.split(' ')[0]}: `}
                            {latestMsg.text}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800/30 border border-dashed border-slate-200 dark:border-zinc-800 text-[11px] text-slate-400 italic">
                        No previous message history. Click below to start chatting.
                      </div>
                    )}

                    {/* Primary Actions: Chat Now & Review Cases */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        id={`btn-chat-investigator-${inv.id}`}
                        type="button"
                        onClick={() => handleOpenChatWithInvestigator(inv.id)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#005BAC] hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat with {inv.fullName.split(' ')[0]}</span>
                      </button>

                      {assignedCases.length > 0 && onOpenReviewModal && (
                        <button
                          type="button"
                          onClick={() => onOpenReviewModal(assignedCases[0])}
                          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                          title={`Review case ${assignedCases[0].id}`}
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="hidden sm:inline">Case</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: LIVE 1-ON-1 & CHANNEL CHAT CONSOLE                                  */}
      {/* ========================================================================= */}
      {viewMode === 'chat' && (
        <div className="space-y-3">
          {/* Back to Directory Button & Active Status */}
          <div className="flex items-center justify-between">
            <button
              id="btn-back-to-investigators-directory"
              type="button"
              onClick={() => setViewMode('directory')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to All Investigators Directory</span>
            </button>

            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
              Active Channel: <strong className="text-slate-900 dark:text-white font-bold">{selectedInvestigator ? selectedInvestigator.fullName : selectedChannelId === 'broadcast-all' ? 'All Leads Broadcast' : selectedChannelId}</strong>
            </span>
          </div>

          {/* Main 3-Column Messaging Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[680px]">
            {/* LEFT COLUMN: Channels & Investigators Selector (4 cols) */}
            <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col h-[680px] overflow-hidden">
              {/* Channel Filters & Search */}
              <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 space-y-2.5 bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter investigators by name or zone..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#005BAC] outline-none"
                  />
                </div>

                {/* Category Filter Tabs */}
                <div className="grid grid-cols-3 gap-1 bg-slate-200/70 dark:bg-zinc-800 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setCategoryTab('all')}
                    className={`py-1 rounded-lg text-center transition-all cursor-pointer ${
                      categoryTab === 'all'
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                    }`}
                  >
                    All ({filteredInvestigators.length + 1})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryTab('direct')}
                    className={`py-1 rounded-lg text-center transition-all cursor-pointer ${
                      categoryTab === 'direct'
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                    }`}
                  >
                    1-on-1 Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryTab('by-case')}
                    className={`py-1 rounded-lg text-center transition-all cursor-pointer ${
                      categoryTab === 'by-case'
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                    }`}
                  >
                    Case Threads
                  </button>
                </div>
              </div>

              {/* Channels Scrollable List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60 p-2 space-y-1">
                {/* 1. BROADCAST DISPATCH CHANNEL (Always at top) */}
                {(categoryTab === 'all' || categoryTab === 'broadcast') && (
                  <button
                    type="button"
                    onClick={() => setSelectedChannelId('broadcast-all')}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-start space-x-3 mb-1 ${
                      selectedChannelId === 'broadcast-all'
                        ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent dark:from-amber-950/40 border-2 border-amber-500/80 shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-zinc-800/60 border border-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center space-x-1">
                          <span>Broadcast to All Leads</span>
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded font-mono">
                          ALL
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate mt-0.5">
                        Send urgent administrative dispatch to all {investigators.length} investigators
                      </p>
                    </div>
                  </button>
                )}

                {/* 2. DIRECT 1-ON-1 INVESTIGATOR CHANNELS */}
                {categoryTab !== 'by-case' && (
                  <div className="space-y-1 pt-1">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-bold">
                      Field Investigators ({filteredInvestigators.length})
                    </div>

                    {filteredInvestigators.map((inv) => {
                      const isSelected = selectedChannelId === `inv-${inv.id}`;
                      const latestMsg = getLatestMessage(inv.id);
                      const isAvailable = inv.availability === 'Available';
                      const activeCasesCount = reports.filter(
                        (r) =>
                          r.assignedTo?.responsiblePersonId === inv.id ||
                          (r.assignedTo?.responsiblePersonName &&
                            r.assignedTo.responsiblePersonName.toLowerCase().includes((inv.fullName || '').toLowerCase()))
                      ).length;

                      return (
                        <button
                          key={inv.id}
                          type="button"
                          onClick={() => setSelectedChannelId(`inv-${inv.id}`)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start space-x-2.5 ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-2 border-[#005BAC] shadow-xs'
                              : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 border border-transparent'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-full bg-[#005BAC] text-white flex items-center justify-center font-bold text-sm shadow-xs border border-slate-300 dark:border-zinc-700">
                              {inv.fullName ? inv.fullName.trim().charAt(0).toUpperCase() : 'I'}
                            </div>
                            <span
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                                isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                                {inv.fullName}
                              </span>
                              {latestMsg && (
                                <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                                  {latestMsg.timestamp.substring(11, 16) || latestMsg.timestamp}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                              <span className="truncate">{inv.department || 'Investigative Desk'}</span>
                              <span>•</span>
                              <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">
                                {activeCasesCount} {activeCasesCount === 1 ? 'case' : 'cases'}
                              </span>
                            </div>

                            {latestMsg ? (
                              <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate mt-0.5">
                                {latestMsg.senderRole === 'Administrator' ? 'You: ' : ''}
                                {latestMsg.text}
                              </p>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic mt-0.5">
                                No messages yet. Click to chat.
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. BY-CASE THREADS */}
                {(categoryTab === 'all' || categoryTab === 'by-case') && (
                  <div className="space-y-1 pt-2">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-bold">
                      Assigned Case Direct Threads ({assignedReportsList.length})
                    </div>

                    {assignedReportsList.map((r) => {
                      const isSelected = selectedChannelId === `report-${r.id}`;
                      const repMsgs = messages.filter((m) => m.reportId === r.id);
                      const lastMsg = repMsgs[repMsgs.length - 1];

                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedChannelId(`report-${r.id}`)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start space-x-2.5 ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 shadow-xs'
                              : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 border border-transparent'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 text-xs font-mono font-bold">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-zinc-100 truncate">
                                {r.id}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                {r.assignedTo?.responsiblePersonName?.split(' ')[0] || 'Assigned'}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate mt-0.5">
                              {r.title}
                            </p>
                            {lastMsg ? (
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {lastMsg.senderDisplayName}: {lastMsg.text}
                              </p>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic mt-0.5">No discussion yet</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* CENTER COLUMN: Interactive Chat Stream (5-8 cols) */}
            <div
              className={`bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col h-[680px] overflow-hidden ${
                showDossier ? 'lg:col-span-5' : 'lg:col-span-8'
              }`}
            >
              {/* Chat Header */}
              <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900">
                {selectedChannelId === 'broadcast-all' ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                          All Investigators Broadcast Channel
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                          Broadcast Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Delivered simultaneously to all {investigators.length} registered field investigators
                      </p>
                    </div>
                  </div>
                ) : selectedInvestigator ? (
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#005BAC] text-white flex items-center justify-center font-extrabold text-base border-2 border-[#005BAC] shrink-0 shadow-xs">
                      {selectedInvestigator.fullName ? selectedInvestigator.fullName.trim().charAt(0).toUpperCase() : 'I'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {selectedInvestigator.fullName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                          {selectedInvestigator.id}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 truncate">
                        <span>{selectedInvestigator.department || 'Investigative Desk'}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {selectedInvestigator.availability || 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : selectedCaseReport ? (
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                          Case Thread: {selectedCaseReport.id}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                          {selectedCaseReport.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 truncate">
                        Assigned Lead: {selectedCaseReport.assignedTo?.responsiblePersonName || 'Pending'}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Toggle Dossier Button */}
                <button
                  type="button"
                  onClick={() => setShowDossier((prev) => !prev)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1 cursor-pointer shrink-0"
                  title="Toggle Dossier / Case Details"
                >
                  <Info className="w-3.5 h-3.5 text-[#005BAC]" />
                  <span className="hidden sm:inline">{showDossier ? 'Hide Dossier' : 'View Dossier'}</span>
                </button>
              </div>

              {/* Quick Case Shortcut Banner (if chatting with an investigator who has active assigned cases) */}
              {selectedInvestigator && investigatorCases.length > 0 && (
                <div className="px-3.5 py-2 bg-blue-50/80 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/50 flex items-center justify-between gap-2 overflow-x-auto text-xs">
                  <span className="font-bold text-[#005BAC] dark:text-blue-300 shrink-0 flex items-center space-x-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Assigned Cases:</span>
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {investigatorCases.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          if (onOpenReviewModal) onOpenReviewModal(c);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-800 hover:border-blue-400 text-slate-800 dark:text-zinc-200 text-[11px] font-mono font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                        title={`Click to review case ${c.id}: ${c.title}`}
                      >
                        <span>{c.id}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-zinc-950/40">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 dark:text-zinc-300 text-xs">
                        No Direct Messages In This Channel
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 max-w-xs">
                        Use the directive prompts below or type a message to start communicating with {selectedInvestigator ? selectedInvestigator.fullName : 'the investigator'}.
                      </p>
                    </div>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe = msg.senderRole === 'Administrator';
                    const isBroadcastMsg = msg.isBroadcast;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} transition-all`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 space-y-1.5 shadow-xs ${
                            isBroadcastMsg
                              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-br-none border border-amber-400'
                              : isMe
                              ? 'bg-slate-900 text-white dark:bg-zinc-800 rounded-br-none'
                              : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-bl-none'
                          }`}
                        >
                          {/* Sender Meta */}
                          <div className="flex items-center justify-between space-x-3 text-[10px] opacity-80 border-b border-white/10 dark:border-zinc-700 pb-1 font-mono">
                            <span className="font-bold">
                              {isMe ? 'AMECO Central Administration' : msg.senderDisplayName}
                            </span>
                            <span>{msg.timestamp}</span>
                          </div>

                          {/* Priority Alert Banner if High/Urgent */}
                          {msg.priority && msg.priority !== 'Normal' && (
                            <div className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-200 border border-red-400/40">
                              <Flame className="w-3 h-3 text-red-300" />
                              <span>{msg.priority} DIRECTIVE</span>
                            </div>
                          )}

                          {/* Message Content */}
                          {msg.text && <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                          <MessageAttachment attachment={msg.attachment} />
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Directive Action Chips */}
              <div className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800/60 border-t border-slate-200 dark:border-zinc-800 flex items-center space-x-1.5 overflow-x-auto text-[10px]">
                <span className="font-bold text-slate-500 dark:text-zinc-400 shrink-0">Directives:</span>
                <button
                  type="button"
                  onClick={() => insertPromptDirective('Please prioritize on-site field verification for this zone and report back.')}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 hover:border-blue-400 text-slate-700 dark:text-zinc-200 whitespace-nowrap cursor-pointer transition-colors"
                >
                  + Field Verification Request
                </button>
                <button
                  type="button"
                  onClick={() => insertPromptDirective('Submit preliminary investigative findings before Friday 17:00 briefing.')}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 hover:border-blue-400 text-slate-700 dark:text-zinc-200 whitespace-nowrap cursor-pointer transition-colors"
                >
                  + Preliminary Findings Due
                </button>
                <button
                  type="button"
                  onClick={() => insertPromptDirective('Cross-reference citizen evidence documents with official bureau records.')}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 hover:border-blue-400 text-slate-700 dark:text-zinc-200 whitespace-nowrap cursor-pointer transition-colors"
                >
                  + Document Cross-Check
                </button>
              </div>

              {/* Chat Composer */}
              <ChatComposer
                onSend={(text, attachment) => handleSend(undefined, text, attachment)}
                placeholder={
                  selectedChannelId === 'broadcast-all'
                    ? 'Broadcast announcement to ALL investigators...'
                    : selectedInvestigator
                    ? `Message ${selectedInvestigator.fullName}...`
                    : 'Type case message or instruction...'
                }
                className="border-t border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <button
                  type="button"
                  onClick={() => setMessagePriority((prev) => (prev === 'Normal' ? 'High' : prev === 'High' ? 'Urgent' : 'Normal'))}
                  className={`rounded-lg border px-2 py-1 text-[10px] font-bold ${messagePriority === 'Urgent' ? 'border-red-600 bg-red-500 text-white' : messagePriority === 'High' ? 'border-amber-600 bg-amber-500 text-white' : 'border-slate-200 bg-slate-100 text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}
                  title="Toggle Message Priority"
                >
                  <Flame className="mr-1 inline h-3 w-3" />{messagePriority}
                </button>
              </ChatComposer>
            </div>

            {/* RIGHT COLUMN: Investigator Dossier & Action Panel (3 cols) */}
            {showDossier && (
              <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs h-[680px] overflow-y-auto p-4 space-y-4">
                {selectedInvestigator ? (
                  <>
                    <div className="text-center space-y-2 pb-3 border-b border-slate-200 dark:border-zinc-800">
                      <div className="w-16 h-16 rounded-full bg-[#005BAC] text-white flex items-center justify-center font-black text-2xl mx-auto border-2 border-[#005BAC] shadow-md">
                        {selectedInvestigator.fullName ? selectedInvestigator.fullName.trim().charAt(0).toUpperCase() : 'I'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                          {selectedInvestigator.fullName}
                        </h3>
                        <p className="text-xs text-[#005BAC] dark:text-blue-400 font-semibold">
                          {selectedInvestigator.department || 'Investigative Department'}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                          {selectedInvestigator.availability || 'Available'} • {selectedInvestigator.clearanceLevel || 'Level 3'}
                        </span>
                      </div>
                    </div>

                    {/* Contact & Clearance Info */}
                    <div className="space-y-2 text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                        Investigator Dossier
                      </span>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 space-y-2">
                        <div className="flex items-center space-x-2 text-slate-700 dark:text-zinc-300">
                          <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">{selectedInvestigator.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-700 dark:text-zinc-300">
                          <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{selectedInvestigator.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-700 dark:text-zinc-300">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="truncate">{selectedInvestigator.serviceArea || selectedInvestigator.zone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-700 dark:text-zinc-300">
                          <BadgeCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{selectedInvestigator.specialization || 'General Investigation'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Assigned Caseload */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                          Active Caseload ({investigatorCases.length})
                        </span>
                      </div>

                      {investigatorCases.length === 0 ? (
                        <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400">
                          No active cases currently assigned to this investigator.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {investigatorCases.map((caseItem) => (
                            <div
                              key={caseItem.id}
                              className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-1.5 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200">
                                  {caseItem.id}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                                  {caseItem.priority}
                                </span>
                              </div>
                              <p className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                {caseItem.title}
                              </p>
                              <div className="flex items-center justify-between pt-1 border-t border-emerald-200 dark:border-emerald-800/60 text-[10px]">
                                <span className="text-slate-500">Due: {caseItem.assignedTo?.deadline || 'Open'}</span>
                                <div className="flex items-center space-x-1">
                                  {onOpenReviewModal && (
                                    <button
                                      type="button"
                                      onClick={() => onOpenReviewModal(caseItem)}
                                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                                    >
                                      Review
                                    </button>
                                  )}
                                  <span>•</span>
                                  {onOpenAssignModal && (
                                    <button
                                      type="button"
                                      onClick={() => onOpenAssignModal(caseItem)}
                                      className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline"
                                    >
                                      Reassign
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : selectedCaseReport ? (
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Report Summary
                    </span>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 space-y-2 text-xs">
                      <div className="font-mono font-bold text-[#005BAC]">{selectedCaseReport.id}</div>
                      <h4 className="font-bold text-slate-900 dark:text-zinc-100">{selectedCaseReport.title}</h4>
                      <p className="text-slate-600 dark:text-zinc-400 line-clamp-4 leading-relaxed">
                        {selectedCaseReport.aiAnalysis?.aiSummary || selectedCaseReport.description}
                      </p>
                      <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 flex flex-col gap-2">
                        {onOpenReviewModal && (
                          <button
                            type="button"
                            onClick={() => onOpenReviewModal(selectedCaseReport)}
                            className="w-full py-2 bg-blue-50 text-[#005BAC] hover:bg-blue-100 rounded-xl font-bold text-xs flex items-center justify-center space-x-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Review Details & Evidence</span>
                          </button>
                        )}
                        {onOpenAssignModal && (
                          <button
                            type="button"
                            onClick={() => onOpenAssignModal(selectedCaseReport)}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1"
                          >
                            <span>Reassign Case</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs text-slate-400 space-y-2">
                    <Radio className="w-8 h-8 mx-auto text-amber-500" />
                    <p className="font-bold text-slate-700 dark:text-zinc-300">Central Broadcast Channel</p>
                    <p className="text-[11px] text-slate-500">
                      Select an investigator from the list to view their individual clearance dossier and active assigned cases.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
