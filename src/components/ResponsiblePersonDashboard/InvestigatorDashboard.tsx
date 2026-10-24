import React, { useRef, useState } from 'react';
import { UserProfile, ReportItem, Message, ReportStatus, EvidenceFile } from '../../types';
import { ChatComposer } from '../Common/ChatComposer';
import { MessageAttachment } from '../Common/MessageAttachment';
import {
  Shield,
  Clock,
  FileText,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Lock,
  Upload,
  Send,
  Download,
  Sparkles,
  MapPin,
  Calendar,
  Key,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { changePasswordApi } from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';

interface InvestigatorDashboardProps {
  currentUser: UserProfile;
  reports: ReportItem[];
  messages: Message[];
  onUpdateStatus: (reportId: string, status: ReportStatus, findings?: string) => void;
  onSendMessage: (reportId: string, text: string, attachment?: EvidenceFile) => void;
  onSendCaseMessage?: (reportId: string, text: string, institutionId: string, attachment?: EvidenceFile) => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  onNavigateTab?: (tab: string) => void;
}

export const InvestigatorDashboard: React.FC<InvestigatorDashboardProps> = ({
  currentUser,
  reports,
  messages,
  onUpdateStatus,
  onSendMessage,
  onSendCaseMessage,
  onUpdateProfile,
  onNavigateTab,
}) => {
  const { language, t, translateCategory, translatePriority, translateStatus } = useLanguage();
  // Business Rule 5: Responsible persons see ONLY reports assigned to them
  const assignedReports = reports.filter(
    (r) => r.assignedTo && r.assignedTo.responsiblePersonId === currentUser.id
  );

  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    assignedReports.length > 0 ? assignedReports[0].id : null
  );

  const [findingsInput, setFindingsInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const citizenChatRef = useRef<HTMLDivElement>(null);

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
        setPasswordSuccess(res.message || 'Password changed successfully!');
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

  const activeReport = reports.find((r) => r.id === selectedReportId) || assignedReports[0];
  const activeMessages = messages.filter((m) => m.reportId === activeReport?.id);

  const handleStatusChange = (status: ReportStatus) => {
    if (!activeReport) return;
    onUpdateStatus(activeReport.id, status, findingsInput);
    if (status === 'Waiting for Citizen Response') {
      window.setTimeout(() => citizenChatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeReport) return;
    onSendMessage(activeReport.id, chatInput);
    setChatInput('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Default Password Prompt Banner */}
      {currentUser.isDefaultPassword && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-700 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                Default Credentials In Use
              </h4>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                You are currently signed in with your administrator-assigned default password. Please choose a strong personal password to secure your case files.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Change Password Now</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <span>AMECO Investigative Journalism Workbench</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{currentUser.fullName}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Email: {currentUser.email || 'N/A'} • Desk: {currentUser.department || 'Investigative Unit'} • ID: {currentUser.id}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {onNavigateTab && (
            <button
              id="btn-investigator-quick-admin-chat"
              onClick={() => onNavigateTab('investigator-admin-chat')}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 border border-slate-900 dark:border-slate-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Admin Chat</span>
            </button>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-xs space-y-0.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 block flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span>Identity Protection Active</span>
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Citizens identified by Citizen ID only.
            </p>
          </div>
        </div>
      </div>

      {assignedReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Cases Currently Assigned</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently have zero active investigation assignments assigned by AMECO Administrators.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Assigned Reports List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              Assigned Investigation Cases ({assignedReports.length})
            </div>

            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
              {assignedReports.map((item) => {
                const isSelected = activeReport?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedReportId(item.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all card-hover-lift ${
                      isSelected
                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 dark:border-amber-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                        {item.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.priority === 'Critical' ? 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300'
                      }`}>
                        {item.priority}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1 mb-1">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">{item.description}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
                      <span>Citizen ID: {item.citizenId}</span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold">Due: {item.assignedTo?.deadline}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Investigation Workbench */}
          {activeReport && (
            <div className="lg:col-span-7 space-y-6">
              {/* Report Header Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-md">
                        {activeReport.id}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                        {activeReport.status}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">{activeReport.title}</h2>
                  </div>
                </div>

                {/* Privacy Badge */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Submitted by Citizen ID: <strong className="font-mono text-slate-900 dark:text-slate-100">{activeReport.citizenId}</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Identity Encrypted</span>
                </div>

                {/* AI Executive Briefing */}
                {activeReport.aiAnalysis && (
                  <div className="p-4 bg-purple-900 dark:bg-purple-950/80 text-white rounded-xl space-y-2 text-xs border border-purple-800 dark:border-purple-900">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>{language === 'am' ? 'የአይኢ (AI) አጭር መግለጫ' : 'AI Executive Briefing'}</span>
                      </span>
                      <span className="text-[10px] text-purple-200 font-mono">
                        Lang: {activeReport.aiAnalysis.languageDetected}
                      </span>
                    </div>
                    <p className="text-purple-100 leading-relaxed">{activeReport.aiAnalysis.aiSummary}</p>
                    {activeReport.aiAnalysis.verificationTips && (
                      <div className="pt-2 border-t border-purple-700/60 text-[11px] text-purple-200 space-y-1">
                        <span className="font-bold text-amber-300 block">
                          {language === 'am' ? 'የማጣሪያ እና የምርመራ ምክሮች:' : 'Verification Tips:'}
                        </span>
                        <ul className="list-disc list-inside space-y-0.5">
                          {activeReport.aiAnalysis.verificationTips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Full Description & Evidence */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">
                    {language === 'am' ? 'የቀረበው ዝርዝር መግለጫ' : 'Submitted Description'}
                  </h4>
                  <p className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed text-slate-700 dark:text-slate-200">
                    {activeReport.description}
                  </p>
                </div>

                {(activeReport.evidence || []).length > 0 && (
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">
                      {language === 'am' ? 'የማስረጃ ሰነዶች' : 'Evidence Files'} ({(activeReport.evidence || []).length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {(activeReport.evidence || []).map((ev) => (
                        <div key={ev.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
                          <span className="truncate font-medium text-slate-800 dark:text-slate-200">{ev.name}</span>
                          <a href={ev.url} target="_blank" rel="noreferrer" className="text-[#005BAC] dark:text-blue-400">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Investigation Status & Update Findings Form (FR-10) */}
                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl space-y-3 text-xs">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {language === 'am' ? 'የምርመራ ግኝቶችን እና ሁኔታን አዘምን' : 'Update Investigation Findings & Status'}
                  </h3>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {language === 'am' ? 'የምርመራ ሂደት ማስታወሻዎች / ኦፊሴላዊ ግኝቶች' : 'Investigation Progress Notes / Official Findings'}
                    </label>
                    <textarea
                      rows={3}
                      value={findingsInput}
                      onChange={(e) => setFindingsInput(e.target.value)}
                      placeholder={
                        language === 'am'
                          ? 'የተረጋገጡ ማስረጃዎችን፣ የቃለ-መጠይቅ ማጠቃለያዎችን፣ የቀበሌ መዝገብ ማረጋገጫዎችን ይመዝግቡ...'
                          : 'Document verified evidence, interview summaries, kebele registry confirmations...'
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleStatusChange('Investigation in Progress')}
                      className={`px-3.5 py-2 font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                        activeReport.status === 'Investigation in Progress'
                          ? 'bg-indigo-800 text-white ring-2 ring-indigo-300'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {activeReport.status === 'Investigation in Progress'
                        ? (language === 'am' ? 'በሂደት ላይ' : 'In Progress')
                        : (language === 'am' ? 'በሂደት ላይ አድርግ' : 'Set In Progress')}
                    </button>
                    <button
                      onClick={() => handleStatusChange('Waiting for Citizen Response')}
                      className={`px-3.5 py-2 font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                        activeReport.status === 'Waiting for Citizen Response'
                          ? 'bg-amber-800 text-white ring-2 ring-amber-300'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      {activeReport.status === 'Waiting for Citizen Response'
                        ? (language === 'am' ? 'የዜጋ ምላሽ በመጠበቅ ላይ' : 'Waiting for Citizen Response')
                        : (language === 'am' ? 'ከዜጋው መረጃ ጠይቅ' : 'Request Info from Citizen')}
                    </button>
                    <button
                      onClick={() => handleStatusChange('Investigation Completed')}
                      className={`px-4 py-2 font-bold rounded-xl shadow-xs flex items-center space-x-1 transition-colors cursor-pointer ${
                        activeReport.status === 'Investigation Completed'
                          ? 'bg-emerald-800 text-white ring-2 ring-emerald-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {activeReport.status === 'Investigation Completed'
                          ? (language === 'am' ? 'ምርመራው ተጠናቋል' : 'Investigation Completed')
                          : (language === 'am' ? 'ምርመራው መጠናቀቁን አረጋግጥ' : 'Mark Investigation Completed')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Secure Chat Thread with Citizen (FR-11) */}
              <div ref={citizenChatRef} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-[#005BAC] dark:text-blue-400" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {language === 'am'
                        ? `ከተጠቃሚው ጋር የተመሰጠረ የቀጥታ ውይይት (${activeReport.citizenId})`
                        : `Encrypted Messaging Thread with Citizen (${activeReport.citizenId})`}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                    {language === 'am' ? 'ማንነት የተጠበቀ' : 'Identity Masked'}
                  </span>
                </div>

                {/* Messages List */}
                <div className="space-y-3 max-h-64 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  {activeMessages.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No messages exchanged yet for this case.
                    </div>
                  ) : (
                    activeMessages.map((m) => {
                      const isMe = m.senderRole === 'ResponsiblePerson';
                      return (
                        <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-1 ${
                              isMe ? 'bg-slate-800 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                            }`}
                          >
                            <div className="text-[10px] opacity-80 font-bold flex items-center justify-between space-x-2">
                              <span>{m.senderDisplayName}</span>
                              <span className="font-mono">{m.timestamp}</span>
                            </div>
                            {m.text && <p className="leading-relaxed">{m.text}</p>}
                            <MessageAttachment attachment={m.attachment} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Send Chat */}
                <ChatComposer
                  onSend={(text, attachment) => onSendMessage(activeReport.id, text, attachment)}
                  placeholder="Send question or update to Citizen..."
                  className="border-t border-slate-200 p-3"
                />
              </div>

              {activeReport.institutionId && activeReport.assignedTo?.responsiblePersonId === currentUser.id && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Building2 className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Case Communication with Institution
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Send progress updates directly to the institution connected to this case.
                  </p>
                  <ChatComposer
                    onSend={(text, attachment) => onSendCaseMessage?.(activeReport.id, text, activeReport.institutionId!, attachment)}
                    placeholder="Send a case update to the institution..."
                    sendLabel="Send to Institution"
                    className="border-t border-slate-200 dark:border-slate-800 pt-2"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    {currentUser.isDefaultPassword ? 'Update Default Password' : 'Change Password'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Account: <strong className="text-slate-700 dark:text-slate-300 font-mono">{currentUser.email || currentUser.fullName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentUser.isDefaultPassword && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-xl text-xs leading-relaxed">
                <strong>First-Time Security Setup:</strong> As an authorized AMECO investigator, please replace your initial default password with a private, strong password before continuing.
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
                    placeholder="Enter current default password"
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
                    placeholder="Min 6-8+ chars"
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
                      <span className="text-slate-400">Strength:</span>
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
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isChangingPassword || !newPassword}
                  className="px-5 py-2 bg-[#005BAC] hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl shadow cursor-pointer transition-colors"
                >
                  {isChangingPassword ? 'Updating...' : 'Save & Secure Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
