import React, { useState, useMemo } from 'react';
import { UserProfile, ReportItem, PriorityLevel, ReportStatus } from '../../types';
import {
  FileText,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building2,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Copy,
  Check,
} from 'lucide-react';

interface MySubmissionsProps {
  currentUser: UserProfile;
  reports: ReportItem[];
  onOpenSubmitModal: (type?: 'news' | 'tipoff') => void;
  onNavigateTab?: (tab: string, reportId?: string) => void;
  onTrackReport?: (reportId: string) => void;
  onOpenChat?: (reportId: string) => void;
}

export const MySubmissions: React.FC<MySubmissionsProps> = ({
  currentUser,
  reports,
  onOpenSubmitModal,
  onNavigateTab,
  onTrackReport,
  onOpenChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'news' | 'tipoff'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTrackNo = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter citizen's own submissions accurately with permanent local cache fallback
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

    // Combine state reports with local storage reports to ensure permanent persistence
    const reportMap = new Map<string, ReportItem>();
    reports.forEach((r) => reportMap.set(r.id, r));
    localReportObjects.forEach((lr) => {
      if (!reportMap.has(lr.id)) {
        reportMap.set(lr.id, lr);
      }
    });

    const allCombined = Array.from(reportMap.values());

    return allCombined.filter((r) => {
      // 1. Direct citizen ID match (case-insensitive)
      if (r.citizenId && currentUser?.id && r.citizenId.toLowerCase() === currentUser.id.toLowerCase()) {
        return true;
      }
      // 2. Submitter ID match
      if ((r as any).submitterId && currentUser?.id && (r as any).submitterId === currentUser.id) {
        return true;
      }
      // 3. Email match (for registered citizens)
      if (
        currentUser?.email &&
        r.citizenEmail &&
        r.citizenEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
      ) {
        return true;
      }
      // 4. Phone match (for registered citizens)
      const userPhoneClean = (currentUser?.phone || currentUser?.phoneNumber || '').replace(/\D/g, '');
      const reportPhoneClean = (r.citizenPhone || '').replace(/\D/g, '');
      if (userPhoneClean && reportPhoneClean && userPhoneClean.length >= 7 && userPhoneClean === reportPhoneClean) {
        return true;
      }
      // 5. If this submission was created in this browser session or linked by Report ID / tracking code
      if (r.trackingCode && locallyStoredCodes.includes(r.trackingCode)) {
        return true;
      }
      if (r.id && locallyStoredCodes.includes(r.id)) {
        return true;
      }
      return false;
    });
  }, [reports, currentUser]);

  // Computed statistics
  const stats = {
    total: citizenReports.length,
    pending: citizenReports.filter((r) =>
      ['Submitted', 'Under AI Review', 'Under Administrator Review'].includes(r.status)
    ).length,
    underInvestigation: citizenReports.filter((r) =>
      ['Assigned', 'Investigation in Progress', 'Waiting for Citizen Response'].includes(r.status)
    ).length,
    verified: citizenReports.filter(
      (r) => r.status === 'Investigation Completed' || (r.status === 'Published' && r.investigationFindings)
    ).length,
    published: citizenReports.filter((r) => r.status === 'Published').length,
    rejected: citizenReports.filter((r) => ['Rejected', 'Closed'].includes(r.status)).length,
  };

  const filteredReports = citizenReports.filter((r) => {
    if (!r) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesQuery =
      !q ||
      (r.id || '').toLowerCase().includes(q) ||
      (r.title || '').toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q) ||
      (r.zone || '').toLowerCase().includes(q) ||
      (r.specificLocation && (r.specificLocation || '').toLowerCase().includes(q));

    const matchesType = typeFilter === 'all' || r.type === typeFilter;

    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = ['Submitted', 'Under AI Review', 'Under Administrator Review'].includes(r.status);
    } else if (statusFilter === 'investigation') {
      matchesStatus = ['Assigned', 'Investigation in Progress', 'Waiting for Citizen Response'].includes(r.status);
    } else if (statusFilter === 'published') {
      matchesStatus = r.status === 'Published';
    } else if (statusFilter === 'completed') {
      matchesStatus = r.status === 'Investigation Completed';
    } else if (statusFilter === 'rejected') {
      matchesStatus = ['Rejected', 'Closed'].includes(r.status);
    }

    return matchesQuery && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: ReportStatus) => {
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

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800';
      case 'High':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-300">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              My Submissions
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Review all news reports and confidential tip-offs submitted under Citizen ID{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[#005BAC] dark:text-blue-300 font-bold">
              {currentUser.id}
            </code>
            . Monitor editorial review, investigation assignments, and status transitions.
          </p>
        </div>

        <button
          onClick={() => onOpenSubmitModal()}
          className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-extrabold px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-2 text-xs sm:text-sm transition-transform active:scale-95 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>+ Submit Report & Tip-Off</span>
        </button>
      </div>

      {/* Real-time Status Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-white border-slate-900 shadow-md font-bold'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-900 dark:text-slate-100'
          }`}
        >
          <span className="text-2xl font-black block">{stats.total}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">All Submissions</span>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md font-bold'
              : 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/50 hover:border-amber-300 text-amber-800 dark:text-amber-300'
          }`}
        >
          <span className="text-2xl font-black block">{stats.pending}</span>
          <span className="text-[11px] opacity-80 mt-1 block">Pending Review</span>
        </button>

        <button
          onClick={() => setStatusFilter('investigation')}
          className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
            statusFilter === 'investigation'
              ? 'bg-[#005BAC] text-white border-[#005BAC] shadow-md font-bold'
              : 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/50 hover:border-blue-300 text-blue-800 dark:text-blue-300'
          }`}
        >
          <span className="text-2xl font-black block">{stats.underInvestigation}</span>
          <span className="text-[11px] opacity-80 mt-1 block">In Investigation</span>
        </button>

        <button
          onClick={() => setStatusFilter('completed')}
          className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-teal-600 text-white border-teal-600 shadow-md font-bold'
              : 'bg-white dark:bg-slate-900 border-teal-200 dark:border-teal-900/50 hover:border-teal-300 text-teal-800 dark:text-teal-300'
          }`}
        >
          <span className="text-2xl font-black block">{stats.verified}</span>
          <span className="text-[11px] opacity-80 mt-1 block">Verified / Completed</span>
        </button>

        <button
          onClick={() => setStatusFilter('published')}
          className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
            statusFilter === 'published'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
              : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-300 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          <span className="text-2xl font-black block">{stats.published}</span>
          <span className="text-[11px] opacity-80 mt-1 block">Published News</span>
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
            statusFilter === 'rejected'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md font-bold'
              : 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50 hover:border-rose-300 text-rose-800 dark:text-rose-300'
          }`}
        >
          <span className="text-2xl font-black block">{stats.rejected}</span>
          <span className="text-[11px] opacity-80 mt-1 block">Closed / Rejected</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Report ID, title, zone, or keyword..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('news')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                typeFilter === 'news'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              News Reports
            </button>
            <button
              onClick={() => setTypeFilter('tipoff')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                typeFilter === 'tipoff'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tip-Offs
            </button>
          </div>
        </div>
      </div>

      {/* Submissions List Grid */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Submissions Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {citizenReports.length === 0
              ? 'You have not submitted any incident reports or tip-offs yet. Use the button below to file your first report.'
              : 'No submissions match your active filter or search query. Try clearing filters.'}
          </p>
          <button
            onClick={() => onOpenSubmitModal('news')}
            className="px-4 py-2 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow transition-transform active:scale-95 inline-flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Submit Report Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCopyTrackNo(report.id)}
                      title="Click to copy Report ID"
                      className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#005BAC] dark:text-blue-300 border border-slate-200 dark:border-slate-700 hover:border-[#005BAC] flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <span className="text-[10px] text-slate-400 font-sans">Report ID:</span>
                      <span>{report.id}</span>
                      {copiedId === report.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                      )}
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {report.type === 'tipoff' ? 'Confidential Tip' : 'News Report'}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(report.status)}`}>
                    {report.status}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug">
                    {report.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mt-1.5">
                    {report.description}
                  </p>
                </div>

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <div className="flex items-center space-x-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{report.specificLocation}, {report.zone}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{report.incidentDate}</span>
                  </div>
                </div>

                {/* Assignment / Department Info if Assigned */}
                {report.assignedTo && (
                  <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs flex items-center justify-between text-blue-900 dark:text-blue-200">
                    <div className="flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#005BAC]" />
                      <span className="font-bold">Desk: {report.assignedTo.department}</span>
                    </div>
                    <span className="font-mono text-[10px] opacity-80">Deadline: {report.assignedTo.deadline}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                  <span>{report.evidence.length} Attachments</span>
                  <span>•</span>
                  <span className={`font-bold ${report.priority === 'Critical' ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                    {report.priority} Priority
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (onTrackReport) onTrackReport(report.id);
                      else if (onNavigateTab) onNavigateTab('track', report.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold flex items-center space-x-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Track</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenChat) onOpenChat(report.id);
                      else if (onNavigateTab) onNavigateTab('messages', report.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#005BAC] hover:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Messages</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
