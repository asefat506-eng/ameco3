import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserProfile, Message, EvidenceFile } from '../../types';
import { ChatComposer } from '../Common/ChatComposer';
import { MessageAttachment } from '../Common/MessageAttachment';
import {
  Building2,
  MessageSquare,
  Send,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
  Radio,
  FileText,
  UserCheck,
  Shield,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface InstitutionAdminChatProps {
  currentUser: UserProfile;
  messages: Message[];
  onSendMessage: (
    reportIdOrChannel: string,
    text: string,
    extra?: {
      recipientId?: string;
      isBroadcast?: boolean;
      priority?: 'Normal' | 'High' | 'Urgent';
      attachment?: EvidenceFile;
    }
  ) => void;
  onNavigateToPublishNews?: () => void;
}

export const InstitutionAdminChat: React.FC<InstitutionAdminChatProps> = ({
  currentUser,
  messages,
  onSendMessage,
  onNavigateToPublishNews,
}) => {
  const [chatInput, setChatInput] = useState('');
  const [messagePriority, setMessagePriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isPublisher = currentUser.role === 'Publisher';
  const publisherDisplayName = isPublisher ? currentUser.fullName : currentUser.institutionName || currentUser.fullName;

  // Filter messages belonging to this institution and admin, plus broadcasts to institutions
  const institutionMessages = useMemo(() => {
    return messages.filter((m) => {
      const isDirectToMe = m.recipientId === currentUser.id;
      const isSentByMe = m.senderId === currentUser.id;
      const isBroadcastToInstitutions =
        m.channelId === 'broadcast-institutions' ||
        m.reportId === 'ALL_INSTITUTIONS' ||
        (m.isBroadcast && (m.recipientRole === 'Institution' || m.recipientRole === 'Publisher' || !m.recipientRole));
      const isMyChannel = m.channelId === `admin-inst-${currentUser.id}` || m.reportId === currentUser.id;

      return isDirectToMe || isSentByMe || isBroadcastToInstitutions || isMyChannel;
    });
  }, [messages, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [institutionMessages]);

  const handleSend = (e?: React.FormEvent, composerText?: string, attachment?: EvidenceFile) => {
    if (e) e.preventDefault();
    const text = (composerText ?? chatInput).trim();
    if (!text && !attachment) return;

    onSendMessage(currentUser.id, text, {
      recipientId: 'ADM-001',
      priority: messagePriority,
      attachment,
    });

    setChatInput('');
    setMessagePriority('Normal');
  };

  const insertPromptChip = (chipText: string) => {
    setChatInput((prev) => (prev ? `${prev} ${chipText}` : chipText));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-['Poppins',sans-serif] animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold">
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            <span>Direct Administrative Line</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            AMECO Editorial & Central Admin Communications
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-2xl">
            Direct, official communication channel between your {isPublisher ? 'Publisher account' : 'institution'} (
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {publisherDisplayName}
            </span>
            ) and the AMECO Central Administrative Desk.
          </p>
        </div>

        {/* Publisher Info Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-1.5 text-xs shrink-0">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 text-[11px]">Publisher Account:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{currentUser.id}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 text-[11px]">Category:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {currentUser.institutionCategory || 'Public Agency'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 text-[11px]">Publishing Status:</span>
            <span
              className={`font-mono font-bold text-[11px] ${
                currentUser.isApprovedInstitution
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {currentUser.isApprovedInstitution ? 'Authorized' : 'Pending Approval'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[580px]">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#005BAC] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  AMECO Central Administration Desk
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[9px] font-bold font-mono">
                  Official Line
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Stationed at Bahir Dar Headquarters • Response turnaround: Real-time
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Admin Online
            </span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[440px] bg-slate-50/40 dark:bg-black/20">
          {institutionMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-400 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200">
                  No Previous Correspondence
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1">
                  You can use this line to communicate directly with AMECO editors and administrators, request press release approvals, or clarify regional bulletins.
                </p>
              </div>
            </div>
          ) : (
            institutionMessages.map((msg) => {
              const isSentByMe = msg.senderId === currentUser.id;
              const isBroadcast =
                msg.isBroadcast ||
                msg.channelId === 'broadcast-institutions' ||
                msg.reportId === 'ALL_INSTITUTIONS';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl p-4 space-y-2 shadow-xs ${
                      isSentByMe
                        ? 'bg-[#005BAC] text-white rounded-tr-none'
                        : isBroadcast
                        ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100 rounded-tl-none'
                        : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-tl-none'
                    }`}
                  >
                    {/* Sender Header */}
                    <div className="flex items-center justify-between gap-3 text-[10px] font-mono">
                      <div className="flex items-center space-x-1.5">
                        {isBroadcast && <Megaphone className="w-3.5 h-3.5 text-amber-600" />}
                        <span className="font-bold opacity-90">
                          {isSentByMe
                            ? isPublisher ? 'Bruk Afrem' : 'Your Institution'
                            : isBroadcast
                            ? 'Official Multi-Agency Broadcast Directive'
                            : 'AMECO Central Administration'}
                        </span>
                      </div>

                      {msg.priority && msg.priority !== 'Normal' && (
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                            msg.priority === 'Urgent'
                              ? 'bg-red-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {msg.priority}
                        </span>
                      )}
                    </div>

                    {/* Message Body */}
                    {msg.text && <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                    <MessageAttachment attachment={msg.attachment} />

                    {/* Timestamp */}
                    <div className="flex items-center justify-end space-x-1 text-[10px] opacity-70 font-mono pt-1">
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

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-100/80 dark:bg-zinc-950/80 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="font-bold text-slate-500 text-[10px] font-mono shrink-0">Quick Notice:</span>
          <button
            onClick={() =>
              insertPromptChip(
                'Request urgent review and verification for our latest regional press bulletin.'
              )
            }
            className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 text-[11px] font-medium whitespace-nowrap cursor-pointer shrink-0"
          >
            Request Bulletin Review
          </button>
          <button
            onClick={() =>
              insertPromptChip(
                'Submitting updated institutional focal person and emergency contact details.'
              )
            }
            className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 text-[11px] font-medium whitespace-nowrap cursor-pointer shrink-0"
          >
            Update Contact Info
          </button>
          <button
            onClick={() =>
              insertPromptChip(
                'Clarification on regional health/security advisory published earlier today.'
              )
            }
            className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 text-[11px] font-medium whitespace-nowrap cursor-pointer shrink-0"
          >
            Advisory Clarification
          </button>
        </div>

        {/* Chat Input Form */}
        <ChatComposer
          onSend={(text, attachment) => handleSend(undefined, text, attachment)}
          placeholder="Type message or official inquiry to AMECO Central Administration..."
          className="border-t border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                Priority:
              </span>
              {(['Normal', 'High', 'Urgent'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setMessagePriority(p)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono transition-all cursor-pointer ${
                    messagePriority === p
                      ? p === 'Urgent'
                        ? 'bg-red-600 text-white'
                        : p === 'High'
                        ? 'bg-amber-600 text-white'
                        : 'bg-[#005BAC] text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <span className="text-[10px] font-mono text-slate-400">
              Direct to AMECO Headquarters
            </span>
          </div>

        </ChatComposer>
      </div>
    </div>
  );
};
