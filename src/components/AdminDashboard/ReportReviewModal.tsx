import React, { useState, useEffect } from 'react';
import {
  ReportItem,
  PriorityLevel,
  ReportMedia,
  InstitutionSocialChannel,
  UserProfile,
} from '../../types';
import { ReportMediaSection } from '../SocialMedia/ReportMediaSection';
import { useLanguage } from '../../context/LanguageContext';
import {
  X,
  Sparkles,
  Shield,
  Lock,
  Eye,
  EyeOff,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  User,
  Calendar,
  MapPin,
  Download,
  Image as ImageIcon,
  Video,
  Mic,
  ExternalLink,
  Radio,
  Signal,
  Compass,
  Phone,
  Mail,
  Home,
  Cpu,
  Network,
  Navigation,
  AlertCircle,
  RefreshCw,
  Newspaper,
} from 'lucide-react';

interface ReportReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportItem | null;
  onUpdateReport: (updated: ReportItem) => void;
  onRevealIdentity: (reportId: string, citizenName?: string) => void;
  onOpenAssignModal: (report: ReportItem) => void;
  publishers?: UserProfile[];
  mediaList?: ReportMedia[];
  verifiedChannels?: InstitutionSocialChannel[];
  currentUser?: UserProfile;
  onAddMedia?: (media: ReportMedia) => void;
  onDeleteMedia?: (mediaId: string) => void;
  onSetPrimaryMedia?: (mediaId: string) => void;
  onVerifyMedia?: (mediaId: string, status: 'Verified' | 'Rejected', reason?: string) => void;
}

export const ReportReviewModal: React.FC<ReportReviewModalProps> = ({
  isOpen,
  onClose,
  report,
  onUpdateReport,
  onRevealIdentity,
  onOpenAssignModal,
  publishers = [],
  mediaList = [],
  verifiedChannels = [],
  currentUser,
  onAddMedia,
  onDeleteMedia,
  onSetPrimaryMedia,
  onVerifyMedia,
}) => {
  const { language, t, translateCategory, translatePriority, translateStatus } = useLanguage();

  const [identityRevealed, setIdentityRevealed] = useState(false);
  const [editedCategory, setEditedCategory] = useState(report?.category || 'Public Safety');
  const [editedPriority, setEditedPriority] = useState<PriorityLevel>(report?.priority || 'Medium');

  // Guest Triangulation Simulation state
  const [isTriangulating, setIsTriangulating] = useState(false);
  const [triangulationComplete, setTriangulationComplete] = useState(false);
  const [triangulationStep, setTriangulationStep] = useState(0);

  // Sync state whenever report changes
  useEffect(() => {
    if (report) {
      setEditedCategory(report.category);
      setEditedPriority(report.priority);
      setIdentityRevealed(false);
      setIsTriangulating(false);
      setTriangulationComplete(false);
      setTriangulationStep(0);
    }
  }, [report]);

  const isGuestSubmitter =
    report?.isGuest ||
    report?.citizenId?.startsWith('GUEST') ||
    report?.citizenName === 'Anonymous Guest Whistleblower' ||
    report?.citizenName === 'Anonymous Guest';

  const handleReveal = () => {
    if (!report) return;
    setIdentityRevealed(true);
    onRevealIdentity(report.id, report.citizenName);
  };

  const handleRunTriangulation = () => {
    setIsTriangulating(true);
    setTriangulationStep(1);
    setTimeout(() => setTriangulationStep(2), 900);
    setTimeout(() => setTriangulationStep(3), 1800);
    setTimeout(() => {
      setIsTriangulating(false);
      setTriangulationComplete(true);
    }, 2600);
  };

  // Publisher Assignment state
  const [showPublisherAssignModal, setShowPublisherAssignModal] = useState(false);
  const [selectedPublisherId, setSelectedPublisherId] = useState('');
  const [publisherEditorialNotes, setPublisherEditorialNotes] = useState('');

  const handleStatusChange = (newStatus: ReportItem['status']) => {
    if (!report) return;
    const updated: ReportItem = {
      ...report,
      category: editedCategory,
      priority: editedPriority,
      status: newStatus,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    onUpdateReport(updated);
    onClose();
  };

  const handleAssignToPublisher = () => {
    if (!report) return;
    const effectivePubId = selectedPublisherId || publishers[0]?.id || 'INST-002';
    const pub = publishers.find((p) => p.id === effectivePubId);
    const pubName = pub ? pub.fullName || pub.institutionName || 'Newsroom Publisher' : 'Yohannes Getachew (BDU Press)';
    const updated: ReportItem = {
      ...report,
      assignedPublisherId: effectivePubId,
      assignedPublisherName: pubName,
      publisherNotes: publisherEditorialNotes.trim() || 'Please draft, verify, and broadcast an official news bulletin for this investigative case.',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    onUpdateReport(updated);
    setShowPublisherAssignModal(false);
    onClose();
  };

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="bg-[#005BAC] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-800 rounded-xl font-mono text-amber-300 font-bold text-xs">
              {report.id}
            </div>
            <div>
              <h2 className="text-base font-bold">{t('review.title', 'Administrator Review & Verification')}</h2>
              <p className="text-xs text-blue-100">{t('review.subtitle', 'AMECO Central Editorial Assessment')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-blue-200 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Title & Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                report.type === 'tipoff' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              }`}>
                {report.type === 'tipoff'
                  ? (language === 'am' ? 'ሚስጥራዊ ጥቆማ' : 'Confidential Tip-Off')
                  : (language === 'am' ? 'የዜና ሪፖርት' : 'News Submission')}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {t('common.date', 'Date')}: {report.incidentDate}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {t('common.status', 'Status')}: {translateStatus(report.status)}
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">{report.title}</h1>
          </div>

          {/* Submitter Personal Identity & Guest Location Telemetry Section */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-xl ${isGuestSubmitter ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' : 'bg-blue-100 dark:bg-blue-950/80 text-[#005BAC] dark:text-blue-300'}`}>
                  {isGuestSubmitter ? <Compass className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{isGuestSubmitter ? 'Guest Whistleblower Telemetry & Location' : 'Registered Citizen Profile Identity'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                      isGuestSubmitter ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {isGuestSubmitter ? 'Anonymous Guest Mode' : 'Verified Registered Account'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    System Submitter Reference: {report.citizenId}
                  </p>
                </div>
              </div>

              {!isGuestSubmitter && (
                <div>
                  {!identityRevealed ? (
                    <button
                      onClick={handleReveal}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Unmask Registered Identity (Audit Logged)</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Identity Unlocked & Verified</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* REGISTERED CITIZEN DETAILS */}
            {!isGuestSubmitter && (
              <div>
                {identityRevealed ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <User className="w-3 h-3 text-[#005BAC]" /> Full Name
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm block">
                          {report.citizenName || 'Abebe Kebede Tadesse'}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#005BAC]" /> Email Address
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
                          {report.citizenEmail || 'abebe.kebede@example.com'}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#005BAC]" /> Phone Number
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
                          {report.citizenPhone || '+251 91 823 4567'}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#005BAC]" /> Registered Woreda / Zone
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {report.citizenWoreda || report.woreda || 'Bahir Dar Zuria'}, {report.zone}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Home className="w-3 h-3 text-[#005BAC]" /> Saved Residence
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {report.citizenAddress || 'Kebele 14, Near Tana Lake, House #402'}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#005BAC]" /> Account Registered Date
                        </span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 block">
                          {report.registeredDate || '2025-11-10'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/70 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-800/50 text-xs space-y-1">
                    <p className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>Citizen Registration Profile Masked by Security Rules</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      This citizen submitted this report from a registered account with saved Name, Email, and Phone number. Click <strong>"Unmask Registered Identity"</strong> above to inspect their saved registration record.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* GUEST SUBMITTER LOCATION & FORENSIC TELEMETRY */}
            {isGuestSubmitter && (
              <div className="space-y-3">
                <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                  <p className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Guest Mode Submission — No Registered Account</span>
                  </p>
                  <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                    The citizen submitted as a Guest without creating a personal account profile. Network and cellular location telemetry were logged to assist official investigators in locating the source of the report.
                  </p>
                </div>

                {/* Network & Location Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" /> Incident / Geo Location
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      {report.specificLocation}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {report.woreda ? `${report.woreda}, ` : ''}{report.zone}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Signal className="w-3 h-3 text-purple-500" /> Cell Tower Sector ID
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
                      {report.guestTelemetry?.cellularTowerId || `BDR-CELL-${report.zone.substring(0,3).toUpperCase()}-402`}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Ethio Telecom Regional Antenna
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Network className="w-3 h-3 text-blue-500" /> Gateway IP & ISP
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
                      {report.guestTelemetry?.ipAddress || '196.188.42.109'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {report.guestTelemetry?.networkType || '4G LTE Mobile Gateway'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-emerald-500" /> Device Fingerprint
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {report.guestTelemetry?.deviceModel || 'Android 14 / Chrome Mobile'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-amber-500" /> Submitting GPS Coordinates
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
                      {report.gpsCoordinates
                        ? `${report.gpsCoordinates.lat}° N, ${report.gpsCoordinates.lng}° E`
                        : '11.5936° N, 37.3908° E'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Radio className="w-3 h-3 text-indigo-500" /> Triangulation Accuracy
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                      ~25m Precision Radius
                    </span>
                  </div>
                </div>

                {/* Interactive Future Method Location Triangulation Tool */}
                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                        Future Location Method: AI Signal & Tower Triangulation
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
                      Investigator Method Preview
                    </span>
                  </div>

                  {!triangulationComplete && !isTriangulating && (
                    <button
                      type="button"
                      onClick={handleRunTriangulation}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
                    >
                      <Radio className="w-4 h-4" />
                      <span>Initiate Cellular Signal & IP Forensic Location Triangulation</span>
                    </button>
                  )}

                  {isTriangulating && (
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-800/80 space-y-2 text-xs">
                      <div className="flex items-center space-x-2 text-blue-300 font-mono font-bold">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
                        <span>Running Multi-Tower RSSI Signal Hops...</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-amber-400 h-full transition-all duration-700"
                          style={{ width: `${(triangulationStep / 3) * 100}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {triangulationStep === 1 && 'Querying Ethio Telecom regional cell tower RSSI logs...'}
                        {triangulationStep === 2 && `Correlating sector antenna nodes near ${report.zone}...`}
                        {triangulationStep === 3 && 'Locking pinpoint GPS coordinates & confidence radius...'}
                      </p>
                    </div>
                  )}

                  {triangulationComplete && (
                    <div className="bg-emerald-950/80 p-3.5 rounded-xl border border-emerald-600 text-xs space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Forensic Location Triangulated Successfully!</span>
                        </span>
                        <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded text-emerald-200 font-mono">
                          Confidence: 98.4%
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-emerald-100 bg-black/40 p-2.5 rounded-lg">
                        <div>
                          <span className="text-emerald-400 block text-[9px] uppercase">Pinpoint Location:</span>
                          <span>{report.specificLocation} ({report.zone})</span>
                        </div>
                        <div>
                          <span className="text-emerald-400 block text-[9px] uppercase">Radar Coordinates:</span>
                          <span>{report.gpsCoordinates ? `${report.gpsCoordinates.lat}° N, ${report.gpsCoordinates.lng}° E` : '11.5936° N, 37.3908° E'}</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-emerald-200/90 leading-relaxed flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Signal locked to primary cell tower. The investigator team can use these precise coordinates to locate the origin point of the anonymous tip-off.</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Cards (FR-07) */}
          {report.aiAnalysis ? (
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-purple-700/60 pb-2">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>{t('ai.assessmentTitle', 'Gemini AI Automated Assessment Results')}</span>
                </div>
                <span className="text-[10px] text-purple-200 font-mono">
                  {t('ai.languageDetected', 'Language Detected:')} {report.aiAnalysis.languageDetected}
                </span>
              </div>

              <div className="text-xs text-purple-100 leading-relaxed bg-purple-950/60 p-3 rounded-xl border border-purple-700">
                <p className="font-bold text-white mb-1">{t('ai.executiveSummary', 'AI Executive Summary:')}</p>
                <p>{report.aiAnalysis.aiSummary}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-purple-950/60 p-3 rounded-xl border border-purple-700">
                  <span className="text-purple-300 text-[10px] block uppercase font-bold">
                    {t('ai.predictedPriority', 'Predicted Priority')}
                  </span>
                  <span className="text-amber-300 font-bold text-sm">
                    {translatePriority(report.aiAnalysis.priority)}
                  </span>
                  <p className="text-[10px] text-purple-200 mt-1">{report.aiAnalysis.priorityReasoning}</p>
                </div>

                <div className="bg-purple-950/60 p-3 rounded-xl border border-purple-700">
                  <span className="text-purple-300 text-[10px] block uppercase font-bold">
                    {t('ai.spamScore', 'Spam Score')}
                  </span>
                  <span className={`font-bold text-sm ${report.aiAnalysis.spamScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {report.aiAnalysis.spamScore} / 100 {report.aiAnalysis.isSpam ? t('ai.flagged', '(Flagged)') : t('ai.clean', '(Clean)')}
                  </span>
                  <p className="text-[10px] text-purple-200 mt-1">
                    {t('ai.duplicateScore', 'Duplicate Score')}: {report.aiAnalysis.duplicateScore}%
                  </p>
                </div>

                <div className="bg-purple-950/60 p-3 rounded-xl border border-purple-700">
                  <span className="text-purple-300 text-[10px] block uppercase font-bold">
                    {t('ai.categoryMatch', 'Category Match')}
                  </span>
                  <span className="text-white font-bold text-sm">
                    {translateCategory(report.aiAnalysis.suggestedCategory)}
                  </span>
                  <p className="text-[10px] text-purple-200 mt-1">
                    {t('ai.offensiveScore', 'Offensive Score')}: {report.aiAnalysis.offensiveLanguageScore}%
                  </p>
                </div>
              </div>

              {report.aiAnalysis.verificationTips && report.aiAnalysis.verificationTips.length > 0 && (
                <div className="text-xs bg-purple-950/40 p-3 rounded-xl border border-purple-800 space-y-1">
                  <span className="font-bold text-amber-300 block text-[11px]">
                    {t('ai.verificationGuidance', 'Investigator Verification Guidance:')}
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-purple-200">
                    {report.aiAnalysis.verificationTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-xs text-slate-500 dark:text-slate-400">
              {t('ai.noAnalysis', 'No AI analysis record generated for this submission.')}
            </div>
          )}

          {/* Citizen Identity Protection Control (FR-12) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[#005BAC]" />
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Citizen Identity Status</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Citizen ID: {report.citizenId}</p>
                </div>
              </div>

              {!identityRevealed ? (
                <button
                  onClick={handleReveal}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Reveal Personal Identity (Audit Logged)</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300 flex items-center space-x-1">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Identity Unlocked</span>
                </span>
              )}
            </div>

            {identityRevealed ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Full Name:</span>
                  <span className="font-bold text-slate-900">{report.citizenName || 'Abebe Kebede Tadesse'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone Number:</span>
                  <span className="font-bold text-slate-900">{report.citizenPhone || '+251 91 823 4567'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Email Address:</span>
                  <span className="font-bold text-slate-900">{report.citizenEmail || 'abebe.kebede@example.com'}</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80 flex items-start space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>Personal information is hidden under default RBAC security rules. Unlocking will log your Administrator account ID and timestamp in the immutable Audit Log.</span>
              </p>
            )}
          </div>

          {/* Full Description & Evidence */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Report Details</h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {report.description}
            </p>

            {/* Evidence Attachments */}
            {report.evidence.length > 0 && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>Uploaded Evidence Files</span>
                    <span className="bg-[#005BAC] text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                      {report.evidence.length}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.evidence.map((ev) => (
                    <div key={ev.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                      {/* Header label & file type icon */}
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                        <div className="flex items-center space-x-2 truncate">
                          {ev.type === 'image' && <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />}
                          {ev.type === 'video' && <Video className="w-4 h-4 text-purple-600 shrink-0" />}
                          {ev.type === 'audio' && <Mic className="w-4 h-4 text-amber-600 shrink-0" />}
                          {(ev.type === 'pdf' || ev.type === 'doc') && <FileText className="w-4 h-4 text-emerald-600 shrink-0" />}
                          <span className="truncate font-mono">{ev.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{ev.size}</span>
                      </div>

                      {/* Interactive Media Player based on type */}
                      {ev.type === 'image' && (
                        <div className="relative group overflow-hidden rounded-lg border border-slate-100 bg-slate-900">
                          <img
                            src={ev.url}
                            alt={ev.name}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>View Full Resolution Image</span>
                          </a>
                        </div>
                      )}

                      {ev.type === 'video' && (
                        <div className="rounded-lg overflow-hidden border border-slate-200 bg-black">
                          <video
                            src={ev.url}
                            controls
                            className="w-full max-h-48 object-contain rounded-lg"
                            poster="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=600"
                          >
                            Your browser does not support HTML5 video playback.
                          </video>
                        </div>
                      )}

                      {ev.type === 'audio' && (
                        <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1.5">
                          <div className="flex items-center space-x-2 text-[11px] font-bold text-amber-900">
                            <Mic className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                            <span>Audio Recording / Voice Tip-Off</span>
                          </div>
                          <audio controls src={ev.url} className="w-full h-8" />
                        </div>
                      )}

                      {(ev.type === 'pdf' || ev.type === 'doc') && (
                        <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                          <span className="text-slate-600 text-[11px]">Official document / receipt file</span>
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#005BAC] font-bold rounded flex items-center space-x-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download PDF</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Social Media Publications & Official Media Section */}
          <div className="pt-1">
            <ReportMediaSection
              reportId={report.id}
              reportTitle={report.title}
              institutionId={report.assignedTo?.department || 'INST-AMECO-001'}
              institutionName="Amhara Media Corporation"
              mediaList={mediaList.filter((m) => m.reportId === report.id || (!m.reportId && m.id === report.id))}
              verifiedChannels={verifiedChannels}
              currentUser={currentUser}
              canManage={true}
              isAdmin={true}
              onAddMedia={onAddMedia}
              onDeleteMedia={onDeleteMedia}
              onSetPrimaryMedia={onSetPrimaryMedia}
              onVerifyMedia={onVerifyMedia}
            />
          </div>

          {/* Edit Category & Priority Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-100 dark:bg-zinc-800/90 p-4 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-zinc-100 block">
                {language === 'am' ? 'ይፋዊ ምድብ ቀይር' : 'Edit Official Category'}
              </label>
              <input
                type="text"
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value)}
                placeholder={language === 'am' ? 'ይፋዊ ምድብ ያስገቡ...' : 'Enter official category...'}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-400 outline-none focus:border-[#005BAC] dark:focus:border-blue-500 font-semibold transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-zinc-100 block">
                {language === 'am' ? 'የቅድሚያ ደረጃ ቀይር' : 'Override Priority Level'}
              </label>
              <select
                value={editedPriority}
                onChange={(e) => setEditedPriority(e.target.value as PriorityLevel)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 outline-none focus:border-[#005BAC] dark:focus:border-blue-500 font-semibold transition-colors cursor-pointer"
              >
                <option value="Critical" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">{translatePriority('Critical')}</option>
                <option value="High" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">{translatePriority('High')}</option>
                <option value="Medium" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">{translatePriority('Medium')}</option>
                <option value="Low" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">{translatePriority('Low')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStatusChange('Rejected')}
              className="px-3.5 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-950/80 dark:hover:bg-red-900 text-red-800 dark:text-red-300 font-bold rounded-xl flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>{language === 'am' ? 'ውድቅ አድርግ' : 'Reject Submission'}</span>
            </button>
            <button
              onClick={() => handleStatusChange('Waiting for Citizen Response')}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold rounded-xl cursor-pointer transition-colors"
            >
              {language === 'am' ? 'ተጨማሪ መረጃ ጠይቅ' : 'Request Info'}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {report.status !== 'Published' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPublisherId(report.assignedPublisherId || publishers[0]?.id || 'INST-002');
                    setPublisherEditorialNotes(report.publisherNotes || '');
                    setShowPublisherAssignModal(true);
                  }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow flex items-center space-x-1.5 cursor-pointer transition-all"
                  title="Forward verified findings to Newsroom Publisher for journalistic broadcasting"
                >
                  <Newspaper className="w-4 h-4" />
                  <span>
                    {report.assignedPublisherId
                      ? (language === 'am' ? 'አሳታሚ ቀይር' : 'Reassign Publisher')
                      : (language === 'am' ? 'ለሚዲያ አሳታሚ መድብ' : 'Assign to Publisher')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange('Published')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow flex items-center space-x-1.5 cursor-pointer transition-all"
                  title="Publish as Official News Bulletin (Step 07)"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'am' ? 'አጽድቅና አትም' : 'Approve & Publish'}</span>
                </button>
              </>
            )}
            <button
              onClick={() => {
                onOpenAssignModal(report);
                onClose();
              }}
              className={`px-5 py-2.5 text-white font-bold rounded-xl shadow flex items-center space-x-2 cursor-pointer transition-all ${
                report.assignedTo?.responsiblePersonId || report.status === 'Assigned'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-[#005BAC] hover:bg-blue-800'
              }`}
            >
              {report.assignedTo?.responsiblePersonId || report.status === 'Assigned' ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>{language === 'am' ? 'መርማሪ ቀይር' : 'Reassign Responsible Person'}</span>
                </>
              ) : (
                <>
                  <span>{language === 'am' ? 'የአሚኮ መርማሪ መድብ' : 'Assign Responsible Person'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal: Forward to Newsroom Publisher */}
        {showPublisherAssignModal && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Assign to Newsroom Publisher
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Forward case {report.id} to media journalist / publisher desk
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPublisherAssignModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-200 block">
                    Select Publisher / Media Partner *
                  </label>
                  <select
                    value={selectedPublisherId}
                    onChange={(e) => setSelectedPublisherId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {publishers.length > 0 ? (
                      publishers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName || p.institutionName} ({p.role || 'Publisher'} - {p.zone})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="INST-002">Yohannes Getachew (BDU Press - Bahir Dar)</option>
                        <option value="INST-001">Dr. Belayneh Mengistu (APHI Liaison)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-200 block">
                    Editorial Instructions / Broadcast Direction
                  </label>
                  <textarea
                    rows={3}
                    value={publisherEditorialNotes}
                    onChange={(e) => setPublisherEditorialNotes(e.target.value)}
                    placeholder="e.g. Please draft headline and prepare TV & Web news bulletin covering the hospital investigation findings..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-200 flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    The selected publisher will receive the case, inspect findings & evidence, and draft the news story for public broadcast.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowPublisherAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignToPublisher}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
                >
                  Confirm Forwarding
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
