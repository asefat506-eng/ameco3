import React, { useState, useEffect } from 'react';
import { UserProfile, ReportItem, Message } from '../../types';
import { EvidenceFile } from '../../types';
import { ChatComposer } from '../Common/ChatComposer';
import { MessageAttachment } from '../Common/MessageAttachment';
import {
  MessageSquare,
  Send,
  Lock,
  Shield,
  Search,
  CheckCircle2,
  Clock,
  User,
  Building2,
  Calendar,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface CitizenMessagesProps {
  currentUser: UserProfile;
  reports: ReportItem[];
  messages: Message[];
  onSendMessage: (reportId: string, text: string, attachment?: EvidenceFile) => void;
  initialSelectedReportId?: string | null;
  onOpenSubmitModal?: (type?: 'news' | 'tipoff') => void;
}

export const CitizenMessages: React.FC<CitizenMessagesProps> = ({
  currentUser,
  reports,
  messages,
  onSendMessage,
  initialSelectedReportId,
  onOpenSubmitModal,
}) => {
  const citizenReports = reports.filter(
    (r) => r.citizenId === currentUser.id || r.assignedPublisherId === currentUser.id
  );

  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    initialSelectedReportId || (citizenReports.length > 0 ? citizenReports[0].id : null)
  );
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialSelectedReportId) {
      setSelectedReportId(initialSelectedReportId);
    } else if (!selectedReportId && citizenReports.length > 0) {
      setSelectedReportId(citizenReports[0].id);
    }
  }, [initialSelectedReportId, citizenReports]);

  const activeReport = citizenReports.find((r) => r.id === selectedReportId) || citizenReports[0];
  const activeMessages = messages.filter((m) => m.reportId === activeReport?.id);

  const filteredReports = citizenReports.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.assignedTo?.department && r.assignedTo.department.toLowerCase().includes(q))
    );
  });

  const isAssigned = Boolean(
    activeReport?.assignedTo?.department ||
    activeReport?.assignedTo?.responsiblePersonId ||
    (activeReport && ['Assigned', 'Investigation in Progress', 'Waiting for Citizen Response', 'Investigation Completed', 'Published'].includes(activeReport.status))
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeReport || !isAssigned) return;
    onSendMessage(activeReport.id, inputText.trim());
    setInputText('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {currentUser.role === 'Publisher' || currentUser.role === 'Institution'
                ? 'Case & Editorial Messages'
                : 'Investigator Messages'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Encrypted, direct communication channel between you and assigned AMECO regional editors and investigators. Your identity remains protected behind {currentUser.role === 'Citizen' ? 'Citizen ID' : 'Account ID'}{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[#005BAC] dark:text-blue-300 font-bold">
              {currentUser.id}
            </code>
            .
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold shrink-0">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>256-Bit SSL Encrypted Channel</span>
        </div>
      </div>

      {citizenReports.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {currentUser.role === 'Publisher' || currentUser.role === 'Institution'
              ? 'No Assigned Case Reports Yet'
              : 'No Active Case Messages'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {currentUser.role === 'Publisher' || currentUser.role === 'Institution'
              ? 'When Central Administration assigns verified investigative findings to your newsroom desk, you can communicate directly here or through the Direct Line Admin Communications tab.'
              : 'Once you submit an incident report or tip-off, you can communicate directly with assigned AMECO investigators through this encrypted workbench.'}
          </p>
          {onOpenSubmitModal && currentUser.role === 'Citizen' && (
            <button
              onClick={() => onOpenSubmitModal('tipoff')}
              className="px-4 py-2 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow transition-transform active:scale-95 inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit First Report</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Cases / Reports List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                My Cases ({filteredReports.length})
              </span>
              <span className="text-[11px] text-slate-400">Select case to chat</span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case title or ID..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]"
              />
            </div>

            {/* Reports List */}
            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {filteredReports.map((item) => {
                const isSelected = activeReport?.id === item.id;
                const caseMsgs = messages.filter((m) => m.reportId === item.id);
                const lastMsg = caseMsgs[caseMsgs.length - 1];

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedReportId(item.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-[#005BAC] shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {item.id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1 mb-1">
                      {item.title}
                    </h4>

                    {lastMsg ? (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                        {lastMsg.senderDisplayName}: "{lastMsg.text}"
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                        No messages yet. Click to start discussion.
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>{item.assignedTo?.department || 'Editorial Desk'}</span>
                      <span>{caseMsgs.length} message(s)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chat Window */}
          {activeReport && (
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px] overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#005BAC] dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                      {activeReport.id}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {activeReport.assignedTo ? activeReport.assignedTo.department : 'General Editorial Desk'}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                    {activeReport.title}
                  </h3>
                </div>

                <div className="text-right hidden sm:block">
                  {isAssigned ? (
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-end space-x-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Investigator Active</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 flex items-center justify-end space-x-1 font-bold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Pending Assignment</span>
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">Citizen {currentUser.id}</span>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-slate-50/30 dark:bg-slate-950/20">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      {isAssigned ? 'Start the Discussion' : 'Chat Awaiting Assignment'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                      {isAssigned
                        ? 'Send a message or extra information to the assigned AMECO journalist. Your name and phone remain protected.'
                        : 'This case is currently under initial editorial triage. The direct chat channel will automatically open once an administrator assigns an investigator.'}
                    </p>
                  </div>
                ) : (
                  activeMessages.map((m) => {
                    const isMe = m.senderRole === 'Citizen';
                    return (
                      <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1 ${
                            isMe
                              ? 'bg-[#005BAC] text-white rounded-br-xs shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between space-x-3 text-[10px] opacity-85 font-semibold">
                            <span>{m.senderDisplayName}</span>
                            <span className="font-mono">{m.timestamp}</span>
                          </div>
                          {m.text && <p className="leading-relaxed break-words">{m.text}</p>}
                          <MessageAttachment attachment={m.attachment} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Compose Input or Pending Notice */}
              {isAssigned ? (
                <ChatComposer
                  onSend={(text, attachment) => onSendMessage(activeReport.id, text, attachment)}
                  placeholder="Type an encrypted message or clarification..."
                  className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              ) : (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-amber-50/60 dark:bg-amber-950/30 flex items-center space-x-3 text-xs text-amber-900 dark:text-amber-200">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Direct chat locked:</strong> This channel will be opened once the administrator reviews and assigns an investigator or editorial unit to this report.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
