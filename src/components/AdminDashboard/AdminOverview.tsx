import React, { useState, useMemo } from 'react';
import { ReportItem, UserProfile, Department } from '../../types';
import {
  BarChart3,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Sparkles,
  Filter,
  Search,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Download,
  MapPin,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Video,
  Mic,
  Layers,
  Eye,
  UserPlus,
  RefreshCw,
  ExternalLink,
  Lock,
  Newspaper,
  Check
} from 'lucide-react';
import { exportReportsToCSV } from '../../utils/csvExport';
import { useLanguage } from '../../context/LanguageContext';

interface AdminOverviewProps {
  reports: ReportItem[];
  users: UserProfile[];
  departments: Department[];
  onOpenReviewModal: (report: ReportItem) => void;
  onOpenAssignModal: (report: ReportItem) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  reports,
  users,
  departments,
  onOpenReviewModal,
  onOpenAssignModal,
}) => {
  const { language, t, translateCategory, translatePriority, translateStatus } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grouped' | 'table'>('grouped');

  // Track expanded state for each zone (default: all expanded for quick viewing)
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({});

  // Metrics
  const totalReports = reports.length;
  const pendingReports = reports.filter(
    (r) => r.status === 'Submitted' || r.status === 'Under AI Review' || r.status === 'Under Administrator Review'
  ).length;
  const assignedReports = reports.filter((r) => r.status === 'Assigned' || r.status === 'Investigation in Progress').length;
  const investigationDoneReports = reports.filter((r) => r.status === 'Investigation Completed').length;
  const publishedReports = reports.filter((r) => r.status === 'Published').length;
  const completedReports = reports.filter(
    (r) => r.status === 'Investigation Completed' || r.status === 'Published' || r.status === 'Closed'
  ).length;
  const criticalReports = reports.filter((r) => r.priority === 'Critical').length;

  // List of all distinct zones present in the database
  const allZones = useMemo(() => {
    const zonesSet = new Set(reports.map((r) => r.zone).filter(Boolean));
    return Array.from(zonesSet).sort();
  }, [reports]);

  // Filtered List
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesZone = zoneFilter === 'All' || r.zone === zoneFilter;
      
      let matchesStatus = true;
      if (statusFilter === 'Pending Review' || statusFilter === 'Pending') {
        matchesStatus = r.status === 'Submitted' || r.status === 'Under AI Review' || r.status === 'Under Administrator Review';
      } else if (statusFilter === 'Assigned Cases' || statusFilter === 'Assigned') {
        matchesStatus = r.status === 'Assigned' || r.status === 'Investigation in Progress';
      } else if (statusFilter === 'Investigation Done' || statusFilter === 'Investigation Completed') {
        matchesStatus = r.status === 'Investigation Completed';
      } else if (statusFilter === 'Published' || statusFilter === 'Published Bulletins') {
        matchesStatus = r.status === 'Published';
      } else if (statusFilter === 'Completed') {
        matchesStatus = r.status === 'Investigation Completed' || r.status === 'Published' || r.status === 'Closed';
      } else if (statusFilter !== 'All') {
        matchesStatus = r.status === statusFilter;
      }

      const matchesPriority = priorityFilter === 'All' || r.priority === priorityFilter;
      const q = (searchQuery || '').toLowerCase().trim();
      const matchesQuery =
        !q ||
        (r.id || '').toLowerCase().includes(q) ||
        (r.title || '').toLowerCase().includes(q) ||
        (r.category || '').toLowerCase().includes(q) ||
        (r.zone || '').toLowerCase().includes(q) ||
        (r.woreda && (r.woreda || '').toLowerCase().includes(q)) ||
        (r.specificLocation && (r.specificLocation || '').toLowerCase().includes(q)) ||
        (r.description && (r.description || '').toLowerCase().includes(q));

      return matchesZone && matchesStatus && matchesPriority && matchesQuery;
    });
  }, [reports, zoneFilter, statusFilter, priorityFilter, searchQuery]);

  // Group filtered reports by zone
  const reportsByZone = useMemo<Record<string, ReportItem[]>>(() => {
    const map: Record<string, ReportItem[]> = {};
    filteredReports.forEach((r) => {
      const z = r.zone || 'Unassigned Zone';
      if (!map[z]) {
        map[z] = [];
      }
      map[z].push(r);
    });
    return map;
  }, [filteredReports]);

  // Regional breakdown count for top summary bar
  const regionCounts = useMemo(() => {
    return reports.reduce((acc, r) => {
      acc[r.zone] = (acc[r.zone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [reports]);

  const toggleZone = (zoneName: string) => {
    setExpandedZones((prev) => ({
      ...prev,
      [zoneName]: prev[zoneName] === undefined ? false : !prev[zoneName],
    }));
  };

  const isZoneExpanded = (zoneName: string) => {
    // Default to true (expanded) if not explicitly set to false
    return expandedZones[zoneName] !== false;
  };

  const expandAll = () => {
    const newState: Record<string, boolean> = {};
    Object.keys(reportsByZone).forEach((z) => {
      newState[z] = true;
    });
    setExpandedZones(newState);
  };

  const collapseAll = () => {
    const newState: Record<string, boolean> = {};
    Object.keys(reportsByZone).forEach((z) => {
      newState[z] = false;
    });
    setExpandedZones(newState);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <span>AMECO Central Editorial & Administration Command</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Administrator Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Regional report management system • Submissions grouped by Zone with direct evidence inspection.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          <div className="text-xs">
            <p className="font-bold text-slate-900 dark:text-white">Gemini AI Moderation</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">100% Automated Zone Classification Active</p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Submissions */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter('All');
            setPriorityFilter('All');
          }}
          className={`text-left p-4 rounded-2xl border shadow-xs space-y-1 transition-all duration-200 card-hover-lift cursor-pointer ${
            statusFilter === 'All' && priorityFilter === 'All'
              ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between opacity-90">
            <span className="text-xs font-bold">
              {language === 'am' ? 'ጠቅላላ ሪፖርቶች' : 'Total Submissions'}
            </span>
            <FileText className={`w-4 h-4 ${statusFilter === 'All' && priorityFilter === 'All' ? 'text-blue-300' : 'text-[#005BAC]'}`} />
          </div>
          <div className={`text-2xl font-extrabold ${statusFilter === 'All' && priorityFilter === 'All' ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
            {totalReports}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className={statusFilter === 'All' && priorityFilter === 'All' ? 'text-slate-300' : 'text-slate-400'}>
              {language === 'am' ? 'በሁሉም ዞኖች' : 'Across all zones'}
            </span>
            <span className={`font-bold flex items-center space-x-1 ${statusFilter === 'All' && priorityFilter === 'All' ? 'text-amber-300' : 'text-[#005BAC]'}`}>
              {statusFilter === 'All' && priorityFilter === 'All' ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>{language === 'am' ? 'ሁሉም' : 'Showing All'}</span>
                </>
              ) : (
                <span>{language === 'am' ? 'እይ' : 'Click to view'}</span>
              )}
            </span>
          </div>
        </button>

        {/* Critical Priority */}
        <button
          type="button"
          onClick={() => {
            setPriorityFilter(priorityFilter === 'Critical' ? 'All' : 'Critical');
          }}
          className={`text-left p-4 rounded-2xl border shadow-xs space-y-1 transition-all duration-200 card-hover-lift cursor-pointer ${
            priorityFilter === 'Critical'
              ? 'bg-red-600 text-white border-red-600 ring-2 ring-red-300 shadow-md'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 hover:border-red-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">
              {language === 'am' ? 'ወሳኝ ቅድሚያ' : 'Critical Priority'}
            </span>
            <AlertTriangle className={`w-4 h-4 ${priorityFilter === 'Critical' ? 'text-red-100' : 'text-red-600 dark:text-red-400'}`} />
          </div>
          <div className={`text-2xl font-extrabold ${priorityFilter === 'Critical' ? 'text-white' : 'text-red-900 dark:text-red-200'}`}>
            {criticalReports}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className={priorityFilter === 'Critical' ? 'text-red-100' : 'text-red-700 dark:text-red-400'}>
              {language === 'am' ? 'አፋጣኝ የህዝብ ተጽዕኖ' : 'Urgent public impact'}
            </span>
            <span className={`font-bold flex items-center space-x-1 ${priorityFilter === 'Critical' ? 'text-red-100' : 'text-red-800'}`}>
              {priorityFilter === 'Critical' ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>{language === 'am' ? 'ተጣርቷል' : 'Filtered'}</span>
                </>
              ) : (
                <span>{language === 'am' ? 'አጣራ' : 'Filter'}</span>
              )}
            </span>
          </div>
        </button>

        {/* Pending Review */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter(statusFilter === 'Pending Review' ? 'All' : 'Pending Review');
            setPriorityFilter('All');
          }}
          className={`text-left p-4 rounded-2xl border shadow-xs space-y-1 transition-all duration-200 card-hover-lift cursor-pointer ${
            statusFilter === 'Pending Review'
              ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-300 shadow-md'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">
              {language === 'am' ? 'በግምገማ ላይ' : 'Pending Review'}
            </span>
            <Clock className={`w-4 h-4 ${statusFilter === 'Pending Review' ? 'text-amber-100' : 'text-amber-600 dark:text-amber-400'}`} />
          </div>
          <div className={`text-2xl font-extrabold ${statusFilter === 'Pending Review' ? 'text-white' : 'text-amber-900 dark:text-amber-200'}`}>
            {pendingReports}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className={statusFilter === 'Pending Review' ? 'text-amber-100' : 'text-amber-700 dark:text-amber-400'}>
              {language === 'am' ? 'የአስተዳዳሪ እርምጃ የሚሻ' : 'Requires Admin action'}
            </span>
            <span className={`font-bold flex items-center space-x-1 ${statusFilter === 'Pending Review' ? 'text-amber-100' : 'text-amber-800'}`}>
              {statusFilter === 'Pending Review' ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>{language === 'am' ? 'ተጣርቷል' : 'Filtered'}</span>
                </>
              ) : (
                <span>{language === 'am' ? 'አጣራ' : 'Filter'}</span>
              )}
            </span>
          </div>
        </button>

        {/* Assigned Cases */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter(statusFilter === 'Assigned Cases' ? 'All' : 'Assigned Cases');
            setPriorityFilter('All');
          }}
          className={`text-left p-4 rounded-2xl border shadow-xs space-y-1 transition-all duration-200 card-hover-lift cursor-pointer ${
            statusFilter === 'Assigned Cases'
              ? 'bg-[#005BAC] text-white border-[#005BAC] ring-2 ring-blue-300 shadow-md'
              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">
              {language === 'am' ? 'የተመደቡ ጉዳዮች' : 'Assigned Cases'}
            </span>
            <UserCheck className={`w-4 h-4 ${statusFilter === 'Assigned Cases' ? 'text-blue-200' : 'text-[#005BAC] dark:text-blue-400'}`} />
          </div>
          <div className={`text-2xl font-extrabold ${statusFilter === 'Assigned Cases' ? 'text-white' : 'text-blue-900 dark:text-blue-200'}`}>
            {assignedReports}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className={statusFilter === 'Assigned Cases' ? 'text-blue-100' : 'text-blue-700 dark:text-blue-400'}>
              {language === 'am' ? 'በምርመራ ሂደት ላይ' : 'Under active investigation'}
            </span>
            <span className={`font-bold flex items-center space-x-1 ${statusFilter === 'Assigned Cases' ? 'text-blue-100' : 'text-[#005BAC]'}`}>
              {statusFilter === 'Assigned Cases' ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>{language === 'am' ? 'ተጣርቷል' : 'Filtered'}</span>
                </>
              ) : (
                <span>{language === 'am' ? 'አጣራ' : 'Filter'}</span>
              )}
            </span>
          </div>
        </button>

        {/* Completed */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter(statusFilter === 'Completed' ? 'All' : 'Completed');
            setPriorityFilter('All');
          }}
          className={`text-left p-4 rounded-2xl border shadow-xs space-y-1 transition-all duration-200 card-hover-lift cursor-pointer ${
            statusFilter === 'Completed'
              ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300 shadow-md'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">
              {language === 'am' ? 'የተጠናቀቁ' : 'Completed'}
            </span>
            <CheckCircle2 className={`w-4 h-4 ${statusFilter === 'Completed' ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'}`} />
          </div>
          <div className={`text-2xl font-extrabold ${statusFilter === 'Completed' ? 'text-white' : 'text-emerald-900 dark:text-emerald-200'}`}>
            {completedReports}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className={statusFilter === 'Completed' ? 'text-emerald-100' : 'text-emerald-700 dark:text-emerald-400'}>
              {language === 'am' ? 'የተፈቱ / የተጠናቀቁ' : 'Resolved / Done'}
            </span>
            <span className={`font-bold flex items-center space-x-1 ${statusFilter === 'Completed' ? 'text-emerald-100' : 'text-emerald-800'}`}>
              {statusFilter === 'Completed' ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>{language === 'am' ? 'ተጣርቷል' : 'Filtered'}</span>
                </>
              ) : (
                <span>{language === 'am' ? 'አጣራ' : 'Filter'}</span>
              )}
            </span>
          </div>
        </button>

        {/* Published Bulletins */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter(statusFilter === 'Published' ? 'All' : 'Published');
            setPriorityFilter('All');
          }}
          className={`text-left p-4 rounded-2xl border shadow-xs space-y-1 transition-all duration-200 card-hover-lift cursor-pointer ${
            statusFilter === 'Published'
              ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-300 shadow-md'
              : 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60 hover:border-teal-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">
              {language === 'am' ? 'የታተሙ' : 'Published'}
            </span>
            <Newspaper className={`w-4 h-4 ${statusFilter === 'Published' ? 'text-teal-100' : 'text-teal-600 dark:text-teal-400'}`} />
          </div>
          <div className={`text-2xl font-extrabold ${statusFilter === 'Published' ? 'text-white' : 'text-teal-900 dark:text-teal-200'}`}>
            {publishedReports}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className={statusFilter === 'Published' ? 'text-teal-100' : 'text-teal-700 dark:text-teal-400'}>
              Public Bulletins
            </span>
            <span className={`font-bold flex items-center space-x-1 ${statusFilter === 'Published' ? 'text-teal-100' : 'text-teal-800'}`}>
              {statusFilter === 'Published' ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Filtered</span>
                </>
              ) : (
                <span>Filter</span>
              )}
            </span>
          </div>
        </button>
      </div>

      {/* Regional Zone Summary Cards Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#005BAC]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Select Zone to Filter Submissions ({allZones.length} Regional Zones)
            </h3>
          </div>
          {zoneFilter !== 'All' && (
            <button
              onClick={() => setZoneFilter('All')}
              className="text-xs text-[#005BAC] hover:underline font-bold flex items-center space-x-1"
            >
              <span>Show All Zones ({totalReports} Reports)</span>
            </button>
          )}
        </div>

        {/* Grid of Zone Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {allZones.map((zoneName) => {
            const count = regionCounts[zoneName] || 0;
            const isSelected = zoneFilter === zoneName;
            const criticalInZone = reports.filter((r) => r.zone === zoneName && r.priority === 'Critical').length;
            const pendingInZone = reports.filter(
              (r) => r.zone === zoneName && (r.status === 'Submitted' || r.status === 'Under AI Review' || r.status === 'Under Administrator Review')
            ).length;

            return (
              <button
                key={zoneName}
                onClick={() => {
                  setZoneFilter(isSelected ? 'All' : zoneName);
                  setViewMode('grouped');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 card-hover-lift ${
                  isSelected
                    ? 'bg-[#005BAC] text-white border-[#005BAC] shadow-md ring-2 ring-blue-400'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Folder className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-[#005BAC]'}`} />
                    <span className="font-bold text-xs truncate max-w-[110px]">{zoneName}</span>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-50 text-[#005BAC] dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {count}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <span className={isSelected ? 'text-blue-100' : 'text-slate-500'}>
                    {pendingInZone > 0 ? `${pendingInZone} Pending` : 'All Reviewed'}
                  </span>
                  {criticalInZone > 0 && (
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {criticalInZone} Critical
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container for Submitted Reports Review Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        {/* Header & Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[#005BAC]" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Submitted Reports Review Queue
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Reports organized by Zone/Region for easy high-volume administration
            </p>
          </div>

          {/* View Switcher & Filters */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* View Mode Switcher */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center space-x-1.5 ${
                  viewMode === 'grouped'
                    ? 'bg-[#005BAC] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Grouped by Zone</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center space-x-1.5 ${
                  viewMode === 'table'
                    ? 'bg-[#005BAC] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Flat Table View</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports or zones..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-[#005BAC] outline-none"
              />
            </div>

            {/* Zone Filter */}
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs outline-none"
            >
              <option value="All">All Zones ({allZones.length})</option>
              {allZones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs outline-none font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Review">Pending Review ({pendingReports})</option>
              <option value="Assigned Cases">Assigned Cases ({assignedReports})</option>
              <option value="Completed">Completed ({completedReports})</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Administrator Review">Under Administrator Review</option>
              <option value="Assigned">Assigned</option>
              <option value="Investigation in Progress">Investigation in Progress</option>
              <option value="Published">Published</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Export CSV Button */}
            <button
              onClick={() => exportReportsToCSV(filteredReports, `ameco_reports_queue_${new Date().toISOString().split('T')[0]}.csv`)}
              className="px-3 py-1.5 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-lg text-xs shadow-xs flex items-center space-x-1.5 transition-transform active:scale-95"
              title="Export filtered reports queue to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Global Controls when in Grouped Mode */}
        {viewMode === 'grouped' && Object.keys(reportsByZone).length > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#005BAC]" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Displaying {Object.keys(reportsByZone).length} Zones with matching submissions ({filteredReports.length} total reports)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={expandAll}
                className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>
        )}

        {/* VIEW MODE 1: ZONE GROUPED LAYOUT (DEFAULT) */}
        {viewMode === 'grouped' && (
          <div className="space-y-4">
            {Object.keys(reportsByZone).length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 space-y-3">
                <Folder className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No reports found for the selected filters</p>
                <p className="text-xs text-slate-500">Try adjusting your search keyword, zone filter, or status criteria.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setZoneFilter('All');
                    setStatusFilter('All');
                    setPriorityFilter('All');
                  }}
                  className="px-4 py-2 bg-[#005BAC] text-white font-bold rounded-xl text-xs"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              (Object.entries(reportsByZone) as [string, ReportItem[]][]).map(([zoneName, zoneReports]) => {
                const expanded = isZoneExpanded(zoneName);
                const criticalInZone = zoneReports.filter((r) => r.priority === 'Critical').length;
                const pendingInZone = zoneReports.filter(
                  (r) => r.status === 'Submitted' || r.status === 'Under AI Review' || r.status === 'Under Administrator Review'
                ).length;

                return (
                  <div
                    key={zoneName}
                    className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden transition-all duration-200"
                  >
                    {/* Zone Accordion Header */}
                    <div
                      onClick={() => toggleZone(zoneName)}
                      className="p-4 bg-slate-50/80 dark:bg-slate-800 hover:bg-slate-100/90 dark:hover:bg-slate-700/80 cursor-pointer flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-700 transition-colors select-none"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-[#005BAC]/10 text-[#005BAC] dark:bg-blue-900/50 dark:text-blue-300 rounded-xl">
                          {expanded ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                              {zoneName}
                            </h3>
                            <span className="bg-[#005BAC] text-white text-xs font-bold font-mono px-2.5 py-0.5 rounded-full shadow-2xs">
                              {zoneReports.length} {zoneReports.length === 1 ? 'Report' : 'Reports'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Click to {expanded ? 'collapse' : 'expand'} submissions list for {zoneName}
                          </p>
                        </div>
                      </div>

                      {/* Zone Badges Summary */}
                      <div className="flex items-center space-x-2 text-xs">
                        {criticalInZone > 0 && (
                          <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 font-bold rounded-lg border border-red-200 dark:border-red-800 flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                            <span>{criticalInZone} Critical</span>
                          </span>
                        )}

                        {pendingInZone > 0 && (
                          <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-bold rounded-lg border border-amber-200 dark:border-amber-800 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>{pendingInZone} Pending Action</span>
                          </span>
                        )}

                        <div className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg">
                          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Zone Reports List */}
                    {expanded && (
                      <div className="p-4 bg-slate-50/30 dark:bg-slate-900/50 space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                        {zoneReports.map((report) => {
                          const isAssigned = Boolean(
                            report.assignedTo?.responsiblePersonId ||
                            report.assignedTo?.responsiblePersonName ||
                            report.status === 'Investigation in Progress' ||
                            report.status === 'Investigation Completed' ||
                            report.status === 'Published'
                          );

                          const imageCount = report.evidence.filter((e) => e.type === 'image').length;
                          const videoCount = report.evidence.filter((e) => e.type === 'video').length;
                          const audioCount = report.evidence.filter((e) => e.type === 'audio').length;
                          const docCount = report.evidence.filter((e) => e.type === 'pdf' || e.type === 'doc').length;

                          return (
                            <div
                              key={report.id}
                              className={`pt-3 first:pt-0 p-4 rounded-xl transition-all space-y-3 ${
                                isAssigned
                                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-400/90 dark:border-emerald-700/80 shadow-xs hover:border-emerald-500'
                                  : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-2xs hover:border-blue-400 dark:hover:border-blue-500'
                              }`}
                            >
                              {/* Assigned Lead Banner (shown when report is assigned) */}
                              {isAssigned && (
                                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/80 text-xs">
                                  <div className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-200">
                                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span className="font-bold">
                                      Assigned Lead: {report.assignedTo?.responsiblePersonName || 'AMECO Field Investigator'}
                                    </span>
                                    <span className="text-emerald-700 dark:text-emerald-300 text-[11px]">
                                      ({report.assignedTo?.department || 'Special Taskforce'})
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-mono">
                                    {report.assignedTo?.deadline && (
                                      <span>Deadline: <strong>{report.assignedTo.deadline}</strong></span>
                                    )}
                                    <span className="px-1.5 py-0.2 bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 rounded text-[10px] font-bold">
                                      ASSIGNED
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Top Bar: ID, Type, Date, Location */}
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex flex-wrap items-center gap-2 font-mono">
                                  <span className={`font-bold px-2 py-0.5 rounded border ${
                                    isAssigned
                                      ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/80 border-emerald-300 dark:border-emerald-700'
                                      : 'text-[#005BAC] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800'
                                  }`}>
                                    {report.id}
                                  </span>

                                  <span
                                    className={`text-[10px] font-sans px-2 py-0.5 rounded font-bold uppercase flex items-center space-x-1 ${
                                      report.type === 'tipoff'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    }`}
                                  >
                                    {report.type === 'tipoff' ? (
                                      <>
                                        <Lock className="w-3 h-3" />
                                        <span>Confidential Tip-Off</span>
                                      </>
                                    ) : (
                                      <>
                                        <Newspaper className="w-3 h-3" />
                                        <span>News Report</span>
                                      </>
                                    )}
                                  </span>

                                  <span className="text-slate-400 text-[11px]">
                                    Submitted: {report.createdAt}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                  <span>
                                    {report.woreda ? `${report.woreda}, ` : ''}{report.specificLocation}
                                  </span>
                                </div>
                              </div>

                              {/* Title & Description */}
                              <div>
                                <h4
                                  onClick={() => onOpenReviewModal(report)}
                                  className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-[#005BAC] dark:hover:text-blue-400 cursor-pointer transition-colors leading-snug"
                                >
                                  {report.title}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                                  {report.aiAnalysis?.aiSummary || report.description}
                                </p>
                              </div>

                              {/* Footer Meta & Action Buttons */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                                {/* Badges: Priority, Status, Evidence Types */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Priority Pill */}
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                      report.priority === 'Critical'
                                        ? 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300 border border-red-200'
                                        : report.priority === 'High'
                                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                                        : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                                    }`}
                                  >
                                    Priority: {report.priority}
                                  </span>

                                  {/* Status Pill */}
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                    isAssigned
                                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600'
                                  }`}>
                                    {report.status}
                                  </span>

                                  {/* Evidence Icons */}
                                  {report.evidence.length > 0 && (
                                    <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                                      <span className="font-bold text-slate-700 dark:text-slate-300">Evidence:</span>
                                      {imageCount > 0 && (
                                        <span className="flex items-center text-blue-600 dark:text-blue-400 font-mono text-[10px]" title={`${imageCount} Photos`}>
                                          <ImageIcon className="w-3 h-3 mr-0.5" />{imageCount}
                                        </span>
                                      )}
                                      {videoCount > 0 && (
                                        <span className="flex items-center text-purple-600 dark:text-purple-400 font-mono text-[10px]" title={`${videoCount} Videos`}>
                                          <Video className="w-3 h-3 mr-0.5" />{videoCount}
                                        </span>
                                      )}
                                      {audioCount > 0 && (
                                        <span className="flex items-center text-amber-600 dark:text-amber-400 font-mono text-[10px]" title={`${audioCount} Audio Voice Notes`}>
                                          <Mic className="w-3 h-3 mr-0.5" />{audioCount}
                                        </span>
                                      )}
                                      {docCount > 0 && (
                                        <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-mono text-[10px]" title={`${docCount} Documents`}>
                                          <FileText className="w-3 h-3 mr-0.5" />{docCount}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2 shrink-0">
                                  <button
                                    onClick={() => onOpenReviewModal(report)}
                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-[#005BAC] dark:text-blue-300 font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Review Details & Evidence</span>
                                  </button>

                                  {isAssigned ? (
                                    <button
                                      onClick={() => onOpenAssignModal(report)}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-95"
                                      title="Reassign this report to another investigator or department"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                      <span>Reassign</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => onOpenAssignModal(report)}
                                      className="px-3 py-1.5 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow-xs flex items-center space-x-1 cursor-pointer"
                                    >
                                      <UserPlus className="w-3.5 h-3.5" />
                                      <span>Assign</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* VIEW MODE 2: FLAT TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Report ID / Type</th>
                  <th className="p-3">Title & Summary</th>
                  <th className="p-3">Zone / Location</th>
                  <th className="p-3">AI Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No reports match the current search filters.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => {
                    const isAssigned = Boolean(
                      r.assignedTo?.responsiblePersonId ||
                      r.assignedTo?.responsiblePersonName ||
                      r.status === 'Investigation in Progress' ||
                      r.status === 'Investigation Completed' ||
                      r.status === 'Published'
                    );

                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors ${
                          isAssigned
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/40 border-l-4 border-l-emerald-500'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          <div className={isAssigned ? 'text-emerald-800 dark:text-emerald-300' : ''}>{r.id}</div>
                          <span
                            className={`text-[10px] font-sans px-1.5 py-0.5 rounded font-bold uppercase ${
                              r.type === 'tipoff' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {r.type === 'tipoff' ? 'Tip-Off' : 'News'}
                          </span>
                        </td>

                        <td className="p-3 max-w-xs">
                          <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{r.title}</div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{r.aiAnalysis?.aiSummary || r.description}</p>
                          {isAssigned && r.assignedTo && (
                            <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5 flex items-center space-x-1">
                              <UserCheck className="w-3 h-3 text-emerald-600 inline" />
                              <span>Lead: {r.assignedTo.responsiblePersonName} ({r.assignedTo.department || 'Desk'})</span>
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{r.zone}</div>
                          <span className="text-[10px] text-slate-400">{r.specificLocation}</span>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              r.priority === 'Critical'
                                ? 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300 border border-red-200'
                                : r.priority === 'High'
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {r.priority}
                          </span>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isAssigned
                              ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700'
                              : 'bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200'
                          }`}>
                            {r.status}
                          </span>
                        </td>

                        <td className="p-3 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => onOpenReviewModal(r)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-[#005BAC] dark:text-blue-300 font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Review & Evidence
                          </button>

                          {isAssigned ? (
                            <button
                              onClick={() => onOpenAssignModal(r)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-xs inline-flex items-center space-x-1 cursor-pointer active:scale-95"
                              title="Reassign report"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Reassign</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenAssignModal(r)}
                              className="px-2.5 py-1 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow-xs inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Assign</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
