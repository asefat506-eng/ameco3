import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, ReportItem, Message, PublicSafeTipView } from '../../types.ts';
import { EvidenceFile } from '../../types.ts';
import { sanitizePublicTipView } from '../../lib/security.ts';
import { ChatComposer } from '../Common/ChatComposer';
import { MessageAttachment } from '../Common/MessageAttachment';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileText,
  Eye,
  Shield,
  ShieldCheck,
  Lock,
  Send,
  Sparkles,
  CheckCircle,
  Compass,
  RefreshCw,
  Copy,
  Check,
  Building2,
  ArrowRight,
} from 'lucide-react';

interface TrackReportsProps {
  currentUser: UserProfile;
  reports: ReportItem[];
  messages: Message[];
  onSendMessage: (reportId: string, text: string, attachment?: EvidenceFile) => void;
  initialSelectedReportId?: string | null;
  initialAccessCode?: string | null;
}

export const TrackReports: React.FC<TrackReportsProps> = ({
  currentUser,
  reports,
  messages,
  onSendMessage,
  initialSelectedReportId,
}) => {
  const isGuest =
    currentUser.id.startsWith('GUEST-') ||
    currentUser.fullName === 'Anonymous Guest' ||
    currentUser.isGuest;

  // Search input state for Report ID
  const [reportIdInput, setReportIdInput] = useState(initialSelectedReportId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitLocked, setRateLimitLocked] = useState(false);

  // Active tracked report state
  const [trackedReport, setTrackedReport] = useState<ReportItem | PublicSafeTipView | null>(null);

  // Copied alert state
  const [copiedId, setCopiedId] = useState(false);

  // Chat message input for the currently tracked report
  const [chatInput, setChatInput] = useState('');

  // Permanent submissions filtered for this user/session
  const citizenReports = useMemo(() => {
    let locallyStoredCodes: string[] = [];
    let localReportObjects: ReportItem[] = [];
    try {
      const globalCodes = JSON.parse(localStorage.getItem('ameco_submitted_report_ids') || '[]');
      const userCodes = currentUser?.id
        ? JSON.parse(localStorage.getItem(`ameco_submissions_${currentUser.id}`) || '[]')
        : [];
      locallyStoredCodes = Array.from(new Set([...globalCodes, ...userCodes]));
      localReportObjects = JSON.parse(localStorage.getItem('ameco_local_reports') || '[]');
    } catch {
      locallyStoredCodes = [];
      localReportObjects = [];
    }

    const reportMap = new Map<string, ReportItem>();
    reports.forEach((r) => reportMap.set(r.id, r));
    localReportObjects.forEach((lr) => {
      if (!reportMap.has(lr.id)) {
        reportMap.set(lr.id, lr);
      }
    });

    const allCombined = Array.from(reportMap.values());

    return allCombined.filter((r) => {
      if (r.citizenId && currentUser?.id && r.citizenId.toLowerCase() === currentUser.id.toLowerCase()) return true;
      if (currentUser?.email && r.citizenEmail && r.citizenEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase()) return true;
      if (r.trackingCode && locallyStoredCodes.includes(r.trackingCode)) return true;
      if (r.id && locallyStoredCodes.includes(r.id)) return true;
      return false;
    });
  }, [reports, currentUser]);

  // Messages for active tracked report
  const activeMessages = useMemo(() => {
    if (!trackedReport) return [];
    return messages.filter((m) => m.reportId === trackedReport.id || m.reportId === trackedReport.trackingCode);
  }, [messages, trackedReport]);

  const workflowStages = [
    { key: 'Submitted', label: 'Received & Queued' },
    { key: 'Under AI Review', label: 'AI Fact-Check Triage' },
    { key: 'Under Administrator Review', label: 'Editorial Assessment' },
    { key: 'Assigned', label: 'Investigative Desk Assigned' },
    { key: 'Investigation in Progress', label: 'Field Investigation Active' },
    { key: 'Investigation Completed', label: 'Verified & Concluded' },
    { key: 'Published', label: 'Published Bulletin' },
  ];

  const getActiveStageIndex = (currentStatus: string) => {
    const idx = workflowStages.findIndex((s) => s.key === currentStatus);
    return idx >= 0 ? idx : 0;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Investigation Completed':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-800';
      case 'Investigation in Progress':
      case 'Assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'Waiting for Citizen Response':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'Under AI Review':
      case 'Under Administrator Review':
      case 'Submitted':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Rejected':
      case 'Closed':
      default:
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    }
  };

  // Perform tracking lookup by Report ID
  const handleTrackById = async (targetId: string) => {
    const cleanId = targetId.trim().toUpperCase();
    if (!cleanId) {
      setErrorMessage('Please enter a valid Report ID (e.g. AMECO-2026-8941).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Check local state & local storage reports
      let localReportObjects: ReportItem[] = [];
      try {
        localReportObjects = JSON.parse(localStorage.getItem('ameco_local_reports') || '[]');
      } catch {
        localReportObjects = [];
      }

      const allSearchable = [...reports, ...localReportObjects];
      const matched = allSearchable.find((r) => {
        return (
          (r.id && r.id.trim().toUpperCase() === cleanId) ||
          (r.trackingCode && r.trackingCode.trim().toUpperCase() === cleanId)
        );
      });

      if (matched) {
        setTrackedReport(matched);
        setReportIdInput(matched.id);
        setIsLoading(false);
        return;
      }

      // 2. Try server-side lookup
      const response = await fetch('/api/guest/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: cleanId }),
      });

      if (response.status === 429) {
        setRateLimitLocked(true);
        setErrorMessage('Too many tracking attempts. Please wait a moment before trying again.');
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.tip) {
          setTrackedReport(result.tip);
          setReportIdInput(result.tip.id);
          setIsLoading(false);
          return;
        }
      }

      setErrorMessage(`Report ID "${cleanId}" was not found. Please verify the ID and try again.`);
    } catch (err) {
      console.warn('Track lookup network notice:', err);
      setErrorMessage('Unable to look up report. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-track on mount if initial report ID is provided or default to first report
  useEffect(() => {
    if (initialSelectedReportId) {
      setReportIdInput(initialSelectedReportId);
      handleTrackById(initialSelectedReportId);
    } else if (citizenReports.length > 0 && !trackedReport) {
      handleTrackById(citizenReports[0].id);
    }
  }, [initialSelectedReportId]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrackById(reportIdInput);
  };

  const handleCopyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !trackedReport) return;
    onSendMessage(trackedReport.id, chatInput);
    setChatInput('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Track Incident Report
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Monitor real-time editorial reviews, investigative assignments, and case outcomes by entering your <strong>Report ID</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Encrypted Tracking Registry</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Track progress at any time using your Report ID</span>
          </div>
        </div>
      </div>

      {/* Main Track Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={reportIdInput}
              onChange={(e) => setReportIdInput(e.target.value.toUpperCase())}
              placeholder="Enter Report ID (e.g. AMECO-2026-8941)..."
              className="w-full pl-12 pr-4 py-3 text-sm font-mono font-bold tracking-wide rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 uppercase focus:ring-2 focus:ring-[#005BAC] outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || rateLimitLocked}
            className="px-6 py-3 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
            <span>{isLoading ? 'Searching...' : 'Track Report'}</span>
          </button>
        </form>

        {/* Quick Clickable Suggestions / Saved Submissions */}
        {citizenReports.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">Your Submissions:</span>
            {citizenReports.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setReportIdInput(item.id);
                  handleTrackById(item.id);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                  trackedReport?.id === item.id
                    ? 'bg-[#005BAC] text-white border-[#005BAC]'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-[#005BAC] dark:text-blue-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {item.id}
              </button>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-300 flex items-start space-x-3 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Main Track Details Section */}
      {trackedReport ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Submissions Sidebar (if user has submissions) */}
          {citizenReports.length > 0 && (
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  My Submissions ({citizenReports.length})
                </span>
                <span className="text-[11px] text-slate-400">Stored Permanently</span>
              </div>

              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                {citizenReports.map((item) => {
                  const isSelected = trackedReport?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleTrackById(item.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border-[#005BAC] shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {item.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{item.incidentDate || item.createdAt}</span>
                        </span>
                        <span className="truncate max-w-[120px]">{item.zone}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right / Main Content Column */}
          <div className={citizenReports.length > 0 ? 'lg:col-span-8 space-y-6' : 'lg:col-span-12 space-y-6'}>
            {/* Tracked Report Overview Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                    <button
                      type="button"
                      onClick={() => handleCopyId(trackedReport.id)}
                      className="font-mono text-xs font-bold text-[#005BAC] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-900 flex items-center space-x-1.5 cursor-pointer hover:border-[#005BAC] transition-colors"
                      title="Click to copy Report ID"
                    >
                      <span>Report ID: {trackedReport.id}</span>
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    </button>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(trackedReport.status)}`}>
                      {trackedReport.status}
                    </span>

                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {trackedReport.category}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                    {trackedReport.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => handleTrackById(trackedReport.id)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Status</span>
                </button>
              </div>

              {/* Progress Stepper Timeline */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-[#005BAC] dark:text-blue-400" />
                    <span>Investigation & Editorial Workflow</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Step {getActiveStageIndex(trackedReport.status) + 1} of {workflowStages.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
                  {workflowStages.map((stage, idx) => {
                    const currentIdx = getActiveStageIndex(trackedReport.status);
                    const isCompleted = idx < currentIdx || trackedReport.status === 'Published' || trackedReport.status === 'Investigation Completed';
                    const isCurrent = idx === currentIdx;

                    return (
                      <div
                        key={stage.key}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-blue-50 dark:bg-blue-950/80 border-[#005BAC] dark:border-blue-500 shadow-xs'
                            : isCompleted
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                        }`}
                      >
                        <span className="text-[10px] font-mono font-bold block mb-0.5">0{idx + 1}</span>
                        <span className="text-[11px] font-bold leading-tight line-clamp-2">{stage.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Report Description & Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Incident Description
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    {trackedReport.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Regional Zone</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{trackedReport.zone}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Incident Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{trackedReport.incidentDate}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Priority Level</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{trackedReport.priority}</span>
                  </div>
                </div>

                {/* Assigned Desk if available */}
                {(trackedReport as ReportItem).assignedTo && (
                  <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-[#005BAC]" />
                      <span className="font-bold">
                        Assigned Unit: {(trackedReport as ReportItem).assignedTo?.department}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] opacity-80">
                      Target Deadline: {(trackedReport as ReportItem).assignedTo?.deadline}
                    </span>
                  </div>
                )}
              </div>

              {/* Public Status Updates Log */}
              {trackedReport.publicStatusUpdates && trackedReport.publicStatusUpdates.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Editorial & Investigation Updates
                  </h4>
                  <div className="space-y-2.5">
                    {trackedReport.publicStatusUpdates.map((update, uIdx) => (
                      <div
                        key={update.id || uIdx}
                        className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-bold text-[#005BAC] dark:text-blue-400">{update.stage}</span>
                          <span className="font-mono">{update.timestamp}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{update.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Secure Chat with Editorial & Investigative Team - Opens after assigned by admin */}
              {(() => {
                const isAssigned = Boolean(
                  (trackedReport as ReportItem).assignedTo?.department ||
                  (trackedReport as ReportItem).assignedTo?.responsiblePersonId ||
                  ['Assigned', 'Investigation in Progress', 'Waiting for Citizen Response', 'Investigation Completed', 'Published'].includes(trackedReport.status)
                );
                const assignedDepartment = (trackedReport as ReportItem).assignedTo?.department || 'Assigned Investigative Desk';

                return (
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-[#005BAC] dark:text-blue-400" />
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          Direct Inquiries for Report {trackedReport.id}
                        </h4>
                      </div>
                      {isAssigned ? (
                        <span className="text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 w-fit">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Assigned ({assignedDepartment}) — Chat Open</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 w-fit">
                          <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Chat Opens After Investigator Assigned</span>
                        </span>
                      )}
                    </div>

                    {/* Messages list */}
                    <div className="space-y-3 max-h-56 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      {activeMessages.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                          {isAssigned
                            ? 'No messages logged yet. You can now chat directly with the assigned investigator below.'
                            : 'This report is currently queued for editorial review. Once an administrator assigns an investigator, direct messaging will unlock here.'}
                        </div>
                      ) : (
                        activeMessages.map((m) => {
                          const isMe = m.senderRole === 'Citizen';
                          return (
                            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                              <div
                                className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-1 ${
                                  isMe
                                    ? 'bg-[#005BAC] text-white rounded-br-none'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-xs'
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

                    {/* Chat compose input or pending assignment notice */}
                    {isAssigned ? (
                      <ChatComposer
                        onSend={(text, attachment) => onSendMessage(trackedReport.id, text, attachment)}
                        placeholder={`Message assigned investigator (${assignedDepartment})...`}
                        className="border-t border-slate-100 p-3 dark:border-slate-800"
                      />
                    ) : (
                      <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl flex items-start space-x-3 text-xs text-amber-900 dark:text-amber-200">
                        <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold block">Chat Channel Pending Administrator Assignment</span>
                          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                            Direct communication with the investigator will be opened automatically after the editorial administrator reviews your report and assigns an investigator or responsible department.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State Prompt */
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Enter a Report ID to Track</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Enter the Report ID generated during submission (e.g. <code>AMECO-2026-8941</code>) in the search bar above to see complete live workflow progression and editorial findings.
          </p>
        </div>
      )}
    </div>
  );
};
