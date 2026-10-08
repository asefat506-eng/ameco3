import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserProfile, ReportItem, Message, Department, EvidenceFile } from '../../types';
import { ChatComposer } from '../Common/ChatComposer';
import { MessageAttachment } from '../Common/MessageAttachment';
import { useLanguage } from '../../context/LanguageContext';
import {
  MessageSquare,
  Send,
  Radio,
  Search,
  CheckCheck,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
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
  Filter,
  FileText,
  AlertTriangle,
  RefreshCw,
  PhoneCall,
  ShieldAlert,
  ChevronRight,
  Megaphone,
} from 'lucide-react';

interface InvestigatorAdminChatProps {
  currentUser: UserProfile;
  reports: ReportItem[];
  messages: Message[];
  departments?: Department[];
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
  onNavigateToCase?: (reportId: string) => void;
}

export const InvestigatorAdminChat: React.FC<InvestigatorAdminChatProps> = ({
  currentUser,
  reports,
  messages,
  departments = [],
  onSendMessage,
  onNavigateToCase,
}) => {
  const { t, language } = useLanguage();

  // Active channel: 'direct-admin' (1-on-1 with Central Admin) or 'broadcasts' (HQ announcements)
  const [activeChannel, setActiveChannel] = useState<'direct-admin' | 'broadcasts'>('direct-admin');

  // Input states
  const [inputText, setInputText] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [referencedReportId, setReferencedReportId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Auto-scroll ref
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Investigator's assigned cases
  const assignedCases = useMemo(() => {
    return reports.filter(
      (r) =>
        r.assignedTo?.responsiblePersonId === currentUser.id ||
        (r.assignedTo?.responsiblePersonName &&
          r.assignedTo.responsiblePersonName.toLowerCase().includes(currentUser.fullName.toLowerCase()))
    );
  }, [reports, currentUser]);

  // Direct 1-on-1 messages between this Investigator and Central Admin
  const directAdminMessages = useMemo(() => {
    return messages.filter((m) => {
      // Messages sent to this investigator by Admin
      const isFromAdminToMe =
        (m.recipientId === currentUser.id || m.channelId === `admin-inv-${currentUser.id}`) &&
        m.senderRole === 'Administrator' &&
        !m.isBroadcast;

      // Messages sent by this investigator to Admin / Central channel
      const isFromMeToAdmin =
        m.senderId === currentUser.id &&
        (m.recipientRole === 'Administrator' ||
          m.recipientId === 'ADM-001' ||
          m.channelId === `admin-inv-${currentUser.id}` ||
          m.channelId === 'admin-chat' ||
          m.reportId === currentUser.id);

      return isFromAdminToMe || isFromMeToAdmin;
    });
  }, [messages, currentUser.id]);

  // Broadcast directives from HQ
  const broadcastMessages = useMemo(() => {
    return messages.filter(
      (m) => m.isBroadcast || m.reportId === 'ALL_INVESTIGATORS' || m.channelId === 'broadcast-all'
    );
  }, [messages]);

  // Active message list based on current channel
  const currentMessages = useMemo(() => {
    const list = activeChannel === 'direct-admin' ? directAdminMessages : broadcastMessages;
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (m) =>
        m.text.toLowerCase().includes(q) ||
        (m.senderDisplayName && m.senderDisplayName.toLowerCase().includes(q)) ||
        (m.reportId && m.reportId.toLowerCase().includes(q))
    );
  }, [activeChannel, directAdminMessages, broadcastMessages, searchQuery]);

  // Auto scroll to bottom on new messages or channel switch
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, activeChannel]);

  // Handle send message
  const handleSend = (e?: React.FormEvent, composerText?: string, attachment?: EvidenceFile) => {
    if (e) e.preventDefault();
    const text = (composerText ?? inputText).trim();
    if (!text && !attachment) return;

    let fullMessageText = text;
    if (referencedReportId) {
      fullMessageText = `[Ref Case: ${referencedReportId}] ${text}`;
    }

    onSendMessage(`admin-inv-${currentUser.id}`, fullMessageText, {
      recipientId: 'ADM-001',
      priority: selectedPriority,
      reportId: referencedReportId || currentUser.id,
      attachment,
    });

    setInputText('');
    setReferencedReportId('');
    setSelectedPriority('Normal');
  };

  // Quick Response Snippets for Investigators
  const quickResponses = [
    { label: 'On Scene', text: 'Confirmed. I have arrived at the scene and initiated on-site investigation.' },
    { label: 'Evidence Collected', text: 'Preliminary photographic and witness evidence has been documented and secured.' },
    { label: 'Witness Interviewed', text: 'Conducted first witness interview. Preparing investigative summary statement.' },
    { label: 'Request HQ Guidance', text: 'Requesting supervisory directive from central command regarding this incident.' },
    { label: 'Case Report Complete', text: 'Investigation report finalized and uploaded for editorial review and verification.' },
  ];

  const handleQuickResponse = (text: string) => {
    setInputText((prev) => (prev ? `${prev} ${text}` : text));
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 text-slate-900 dark:text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>AMECO Operations Command • Encrypted Officer Dispatch</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center space-x-2 text-slate-900 dark:text-white">
            <MessageSquare className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            <span>HQ Admin & Dispatcher Communications</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Real-time direct communication channel with Central Editorial Administration & Operations Desk. Report field updates, request directives, and respond to headquarters.
          </p>
        </div>

        {/* Status Indicators & Security Pill */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <span className="text-slate-900 dark:text-white font-bold block leading-none">HQ Online</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Central Desk ADM-001</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-mono text-[11px] font-bold">256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Chat Console + Right Operational Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Chat Window & Controls */}
        <div className="lg:col-span-2 flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[600px] max-h-[750px]">
          {/* Chat Header: Channel Switcher & Search */}
          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Channel Tabs */}
            <div className="flex items-center bg-slate-200 dark:bg-zinc-800 p-1 rounded-xl">
              <button
                id="btn-tab-direct-admin"
                type="button"
                onClick={() => setActiveChannel('direct-admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeChannel === 'direct-admin'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Direct Admin Chat</span>
                {directAdminMessages.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold">
                    {directAdminMessages.length}
                  </span>
                )}
              </button>

              <button
                id="btn-tab-broadcasts"
                type="button"
                onClick={() => setActiveChannel('broadcasts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeChannel === 'broadcasts'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5 text-blue-500" />
                <span>HQ Directives & Broadcasts</span>
                {broadcastMessages.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono font-bold">
                    {broadcastMessages.length}
                  </span>
                )}
              </button>
            </div>

            {/* Message Filter / Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 w-full sm:w-48"
              />
            </div>
          </div>

          {/* Messages Feed Viewport */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-black/20">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-zinc-500 my-auto">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 border border-amber-200 dark:border-amber-900/40">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                  {activeChannel === 'direct-admin'
                    ? 'No Direct Messages Yet'
                    : 'No Broadcast Directives Found'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm">
                  {activeChannel === 'direct-admin'
                    ? 'Use the composer below to submit a field update or request guidance directly from Central Editorial & Operations.'
                    : 'Official announcements and regional alert broadcasts issued by Central Administration will be displayed here.'}
                </p>
              </div>
            ) : (
              currentMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const isAdmin = msg.senderRole === 'Administrator';
                const isUrgent = msg.priority === 'Urgent';
                const isHigh = msg.priority === 'High';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} transition-all`}
                  >
                    {/* Sender Label & Meta */}
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 dark:text-zinc-400 mb-1 px-1">
                      <span className="font-bold text-slate-700 dark:text-zinc-300">
                        {isMe ? 'You (Field Officer)' : msg.senderDisplayName || 'AMECO Central Admin'}
                      </span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>

                      {isUrgent && (
                        <span className="px-1.5 py-0.2 rounded font-mono font-black text-[9px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center space-x-0.5">
                          <Flame className="w-2.5 h-2.5" />
                          <span>URGENT</span>
                        </span>
                      )}
                      {isHigh && (
                        <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          HIGH PRIORITY
                        </span>
                      )}
                      {msg.isBroadcast && (
                        <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center space-x-0.5">
                          <Megaphone className="w-2.5 h-2.5" />
                          <span>BROADCAST</span>
                        </span>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-amber-600 text-white rounded-tr-none'
                          : isAdmin
                          ? 'bg-slate-900 text-white dark:bg-zinc-800 rounded-tl-none border border-slate-800 dark:border-zinc-700'
                          : 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {msg.text && <p className="whitespace-pre-wrap select-text">{msg.text}</p>}
                      <MessageAttachment attachment={msg.attachment} />
                    </div>

                    {/* Footer receipt */}
                    {isMe && (
                      <div className="flex items-center space-x-1 text-[9px] text-slate-400 mt-0.5 px-1">
                        <CheckCheck className="w-3 h-3 text-amber-600" />
                        <span>Delivered to Central Admin</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Response Shortcuts */}
          {activeChannel === 'direct-admin' && (
            <div className="p-2.5 bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 overflow-x-auto">
              <div className="flex items-center space-x-1.5 text-nowrap min-w-max">
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 font-bold px-1 flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Quick Responses:</span>
                </span>
                {quickResponses.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickResponse(qr.text)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 dark:hover:bg-amber-950/40 dark:hover:text-amber-200 transition-colors font-medium cursor-pointer shadow-2xs"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Composer Footer */}
          <ChatComposer
            onSend={(text, attachment) => handleSend(undefined, text, attachment)}
            placeholder="Type operational response, field status, or question to Central Admin..."
            sendLabel="Send Response"
            className="border-t border-slate-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* Context Attachment Options: Case Reference + Priority Level */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <label className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium flex items-center space-x-1">
                  <Briefcase className="w-3 h-3 text-amber-500" />
                  <span>Case Ref:</span>
                </label>
                <select
                  value={referencedReportId}
                  onChange={(e) => setReferencedReportId(e.target.value)}
                  className="px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">-- No specific case --</option>
                  {assignedCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.title.substring(0, 28)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Select */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">Priority:</span>
                {(['Normal', 'High', 'Urgent'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPriority(p)}
                    className={`px-2 py-0.8 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      selectedPriority === p
                        ? p === 'Urgent'
                          ? 'bg-red-600 text-white'
                          : p === 'High'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-900 text-white dark:bg-white dark:text-black'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

          </ChatComposer>
        </div>

        {/* Right Col: Operations Command Info & Officer Assignment Dossier */}
        <div className="space-y-4">
          {/* Operations Command Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3.5">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-[#005BAC]/10 text-[#005BAC] dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                  Central Editorial & Operations Desk
                </h3>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                  Headquarters Dispatch: ADM-001
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <span>Direct Hotline:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">+251 58 220 0000</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <span>Operating Desk:</span>
                <span className="font-bold text-slate-900 dark:text-white">Regional News & Security</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <span>Response SLA:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Priority Triage (&lt;15m)</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Field Security Protocol</span>
              </div>
              <p className="text-[10px] leading-tight text-amber-800 dark:text-amber-300">
                All communications sent over this terminal are securely logged for administrative audit compliance and investigative integrity.
              </p>
            </div>
          </div>

          {/* Assigned Cases Quick List */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Briefcase className="w-4 h-4 text-amber-500" />
                <span>Your Active Cases ({assignedCases.length})</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400 font-bold">Caseload</span>
            </div>

            {assignedCases.length === 0 ? (
              <div className="text-center py-6 text-slate-400 dark:text-zinc-500 text-xs">
                No active cases currently assigned.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {assignedCases.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 hover:border-amber-400 dark:hover:border-amber-600 transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-[10px]">
                        {c.id}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                          c.status === 'Investigation in Progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : c.status === 'Investigation Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <p className="font-medium text-slate-900 dark:text-white truncate">{c.title}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 pt-0.5">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                        <span>{c.zone || 'Amhara'}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setReferencedReportId(c.id);
                          setInputText((prev) => (prev ? `${prev} Regarding Case ${c.id}: ` : `Regarding Case ${c.id}: `));
                        }}
                        className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                      >
                        Link in Chat →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
