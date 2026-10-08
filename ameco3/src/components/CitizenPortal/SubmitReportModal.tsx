import React, { useState, useEffect } from 'react';
import { UserProfile, ReportItem, ReportType, EvidenceFile, AiAnalysisResult } from '../../types';
import { REGIONAL_ZONES, ETHIOPIAN_REGIONS, getZonesForRegion } from '../../data/zones';
import { RegionZoneSelector } from '../Common/RegionZoneSelector';
import { generateTrackingCode, generateSecretAccessCode, sha256Hex } from '../../lib/security';
import {
  Upload,
  X,
  Shield,
  Lock,
  FileText,
  Sparkles,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Check,
  Loader2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Compass,
  Trash2,
} from 'lucide-react';

interface SubmitReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  initialType?: 'news' | 'tipoff';
  onSubmitReport: (newReport: Omit<ReportItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTrackTip?: (trackingCode: string, accessCode: string) => void;
}

export const SubmitReportModal: React.FC<SubmitReportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialType = 'news',
  onSubmitReport,
  onTrackTip,
}) => {
  const isGuestUser =
    currentUser?.id?.startsWith('GUEST-') ||
    currentUser?.fullName === 'Anonymous Guest' ||
    currentUser?.isGuest;

  const [isAnonymous, setIsAnonymous] = useState(isGuestUser);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Public Safety');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [region, setRegion] = useState('Amhara Region');
  const [zone, setZone] = useState('Bahir Dar Special Zone');
  const [customZone, setCustomZone] = useState('');
  const [woreda, setWoreda] = useState('Bahir Dar Zuria');
  const [specificLocation, setSpecificLocation] = useState('');

  // Evidence upload simulation state
  const [evidenceList, setEvidenceList] = useState<EvidenceFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // AI pre-analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPreview, setAiPreview] = useState<AiAnalysisResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Confirmation State for Submissions
  const [submissionResult, setSubmissionResult] = useState<{
    reportId: string;
    trackingCode: string;
    title: string;
    category: string;
    zone: string;
    isAnonymous: boolean;
  } | null>(null);
  const [copiedReportId, setCopiedReportId] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setIsAnonymous(isGuestUser);
      setCategory('Public Safety');
      setSubmissionResult(null);
      setCopiedReportId(false);
      setCopiedAll(false);
    }
  }, [isOpen, isGuestUser]);

  // Step completion status logic for visual progress indicator
  const isStep1Done = Boolean(category);
  const isStep2Done = Boolean(
    (title || '').trim().length >= 3 &&
    (description || '').trim().length >= 3 &&
    (description || '').trim().length <= 100
  );
  const isStep3Done = Boolean(incidentDate && zone && (specificLocation || '').trim().length >= 2);
  const isStep4Done = Boolean(evidenceList.length > 0 || aiPreview);

  const steps = [
    { id: 1, name: 'Report Mode & Category', isDone: isStep1Done, req: 'Required' },
    { id: 2, name: 'Title & Details', isDone: isStep2Done, req: 'Required' },
    { id: 3, name: 'Location & Date', isDone: isStep3Done, req: 'Required' },
    { id: 4, name: 'Evidence & AI', isDone: isStep4Done, req: 'Optional' },
  ];

  const completedStepsCount = steps.filter((s) => s.isDone).length;
  const progressPercentage = Math.round((completedStepsCount / steps.length) * 100);

  const categoriesList = [
    'Public Safety',
    'Infrastructure & Utilities',
    'Corruption & Bribery',
    'Crime & Illegal Activities',
    'Human Rights Violations',
    'Healthcare & Public Health',
    'Education & Schools',
    'Fraud & Embezzlement',
    'Environmental Issues',
    'Community Events & Breaking News',
    'Public Service Complaints',
    'Other Public Interest Matters',
  ];

  // Trigger AI Analysis via Server API
  const handleTriggerAiAnalysis = async () => {
    if (!title.trim() || !description.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          incidentDate,
          location: `${specificLocation}, ${zone}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAiPreview(data.analysis);
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simulate evidence attachment
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setTimeout(() => {
      const file = files[0];
      let fileType: EvidenceFile['type'] = 'doc';
      if (file.type.startsWith('image/')) fileType = 'image';
      else if (file.type.startsWith('video/')) fileType = 'video';
      else if (file.type.startsWith('audio/')) fileType = 'audio';
      else if (file.type.includes('pdf')) fileType = 'pdf';

      const newEvidence: EvidenceFile = {
        id: 'EV-' + Math.floor(Math.random() * 10000),
        name: file.name,
        type: fileType,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        url: URL.createObjectURL(file),
      };

      setEvidenceList((prev) => [...prev, newEvidence]);
      setUploading(false);
    }, 800);
  };

  const handleCopyReportId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReportId(true);
    setTimeout(() => setCopiedReportId(false), 2000);
  };

  const handleCopySlip = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const trimmedLoc = specificLocation.trim();

    if (!trimmedTitle || !trimmedDesc || !trimmedLoc) {
      alert('Please fill in all required fields (Title, Description, and Specific Location).');
      return;
    }

    if (trimmedDesc.length < 3) {
      alert('Description must be at least 3 characters long.');
      return;
    }

    if (trimmedDesc.length > 100) {
      alert('Description cannot exceed 100 characters maximum.');
      return;
    }

    setIsSubmitting(true);

    // If AI preview hasn't been triggered yet, do a quick fetch
    let finalAiResult = aiPreview;
    if (!finalAiResult) {
      try {
        const res = await fetch('/api/ai-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            category,
            incidentDate,
            location: `${specificLocation}, ${zone}`,
          }),
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && data.success && data.analysis) {
            finalAiResult = data.analysis;
          }
        }
      } catch (err) {
        console.warn('AI pre-analysis fetch notice:', err);
      }
    }

    const isAnonymousSubmission = isGuestUser || isAnonymous;

    // Generate only clean Report ID e.g. AMECO-2026-XXXX
    const reportId = generateTrackingCode();

    try {
      const finalZone = zone === 'Others...' && customZone && customZone.trim() ? `Others: ${customZone.trim()}` : zone;
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

      const isTipoffCategory = [
        'Corruption & Bribery',
        'Corruption',
        'Crime & Illegal Activities',
        'Crime',
        'Human Rights Violations',
        'Fraud & Embezzlement',
        'Illegal Activities',
        'Environmental Crimes',
      ].includes(category);

      const finalType: ReportType = isAnonymous || isTipoffCategory ? 'tipoff' : 'news';

      const newReport: Omit<ReportItem, 'id' | 'createdAt' | 'updatedAt'> = {
        type: finalType,
        title,
        description,
        category,
        incidentDate,
        region,
        zone: finalZone,
        woreda,
        specificLocation,
        // Link to citizen ID or guest
        citizenId: isGuestUser ? 'GUEST-ANONYMOUS' : (currentUser?.id || 'CZN-GUEST'),
        citizenName: isAnonymous ? 'Anonymous Whistleblower' : (currentUser?.fullName || 'Citizen'),
        citizenPhone: isAnonymous ? '' : (currentUser?.phone || currentUser?.phoneNumber || ''),
        citizenEmail: isAnonymous ? '' : (currentUser?.email || ''),
        citizenWoreda: currentUser?.woreda || woreda,
        citizenAddress: currentUser?.address || specificLocation,
        registeredDate: currentUser?.joinedDate || nowStr.split(' ')[0],
        isGuest: isGuestUser,
        isAnonymous: isAnonymous,
        submissionType: isGuestUser ? 'guest' : 'citizen',
        trackingCode: reportId,
        publicStatusUpdates: [
          {
            id: 'PSU-' + Math.floor(1000 + Math.random() * 9000),
            timestamp: nowStr,
            message: 'Your report has been received securely and queued for AMECO editorial triage.',
            stage: 'Submitted',
          },
        ],
        evidence: evidenceList,
        status: 'Submitted',
        priority: finalAiResult?.priority || 'Medium',
        aiAnalysis: finalAiResult || undefined,
      };

      // Call parent submit handler to register in state & Cloud SQL & localStorage
      onSubmitReport(newReport);

      // Display the generated Report ID confirmation screen
      setSubmissionResult({
        reportId,
        trackingCode: reportId,
        title,
        category,
        zone: finalZone,
        isAnonymous: isAnonymousSubmission,
      });
    } catch (err) {
      console.error('Report submission failed:', err);
      alert('An error occurred during submission. Please check your network connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // If Submission Confirmation View is Active (Generated Report ID):
  if (submissionResult) {
    const slipText = `--- AMECO SUBMISSION RECEIPT ---\nReport ID: ${submissionResult.reportId}\nTitle: ${submissionResult.title}\nCategory: ${submissionResult.category}\nLocation: ${submissionResult.zone}\nStatus: Submitted (Editorial Review)\nPermanent Storage: Stored under "My Submissions"\nTracking: Use Report ID "${submissionResult.reportId}" on the Track Reports tab.`;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 max-w-xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-zinc-100">
          {/* Header */}
          <div className="bg-slate-900 dark:bg-black text-white p-6 flex items-center space-x-4 border-b border-slate-800">
            <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider font-bold border border-emerald-500/30">
                  Submission Successful
                </span>
                <span className="text-zinc-400 text-xs font-medium">Permanently Recorded</span>
              </div>
              <h2 className="text-xl font-black mt-1 text-white">Report ID Generated!</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Saved permanently in <strong>My Submissions</strong>
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Generated Report ID Hero Card */}
            <div className="p-4 sm:p-5 bg-blue-50/80 dark:bg-blue-950/40 border-2 border-[#005BAC]/40 dark:border-blue-700/60 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-zinc-100 flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-[#005BAC] dark:text-blue-400" />
                  <span>Your Generated Report ID</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-[#005BAC] dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded">
                  Permanent Key
                </span>
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-3.5 rounded-xl border border-blue-200 dark:border-blue-900 shadow-inner">
                <span className="font-mono text-2xl font-black tracking-wider text-[#005BAC] dark:text-blue-400 select-all">
                  {submissionResult.reportId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyReportId(submissionResult.reportId)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center space-x-1.5 border border-slate-300 dark:border-zinc-700 transition-colors cursor-pointer"
                >
                  {copiedReportId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReportId ? 'Copied!' : 'Copy ID'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-normal pt-1">
                This report is saved permanently in your <strong>"My Submissions"</strong> dashboard. You can track this report at any time using only this <strong>Report ID</strong>.
              </p>
            </div>

            {/* Submission Summary Details */}
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Report Title:</span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 truncate max-w-[240px]">
                  {submissionResult.title}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Category & Location:</span>
                <span className="font-medium text-slate-700 dark:text-zinc-300">
                  {submissionResult.category} • {submissionResult.zone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Status:</span>
                <span className="inline-flex items-center space-x-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Submitted (In Editorial Triage)</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopySlip(slipText)}
                className="flex-1 py-2.5 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 border border-slate-300 dark:border-zinc-700 transition-colors cursor-pointer"
              >
                {copiedAll ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600 dark:text-zinc-400" />}
                <span>{copiedAll ? 'Receipt Copied!' : 'Copy Summary Slip'}</span>
              </button>

              {onTrackTip && (
                <button
                  type="button"
                  onClick={() => {
                    onTrackTip(submissionResult.reportId, '');
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-3 bg-[#005BAC] hover:bg-blue-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-amber-300" />
                  <span>Track Report Now</span>
                </button>
              )}
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300 underline cursor-pointer"
              >
                Done, view My Submissions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="bg-[#005BAC] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-800 rounded-xl">
              <FileText className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                Submit News Report & Confidential Tip-Off
              </h2>
              <p className="text-xs text-blue-100">Amhara Media Corporation Citizen Journalism & Secure Whistleblower Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-blue-200 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Visual Progress Indicator Bar */}
        <div className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 font-bold">
              <span className="text-slate-700 dark:text-slate-300">Completion Progress:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold transition-colors ${
                  progressPercentage === 100
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                    : 'bg-blue-100 dark:bg-blue-900/60 text-[#005BAC] dark:text-blue-300 border border-blue-200'
                }`}
              >
                {progressPercentage}% Completed
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {completedStepsCount} of {steps.length} Steps Completed
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercentage === 100 ? 'bg-emerald-500' : 'bg-[#005BAC]'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Anonymous Toggle Callout */}
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Shield className="w-5 h-5 text-[#005BAC] dark:text-blue-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {isGuestUser ? 'Anonymous Guest Whistleblower Mode Active' : 'Confidential Anonymous Submission'}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Generates unique Tracking Code & Secret Access Code for secure follow-up.
                </p>
              </div>
            </div>
            {!isGuestUser && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-[#005BAC] focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Submit Anonymously</span>
              </label>
            )}
          </div>

          {/* Step 1: Submission Mode & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Submission Mode <span className="text-red-500">*</span>
              </label>
              <div className="w-full py-2.5 px-3.5 text-xs font-bold rounded-xl border bg-blue-50 dark:bg-blue-950/40 text-[#005BAC] dark:text-blue-300 border-blue-200 dark:border-blue-800 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-[#005BAC] dark:text-blue-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">News Report & Tip-Off</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#005BAC] text-white">
                  Unified Mode
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-[#005BAC]"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Title & Details */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Headline / Report Title <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">{title.length}/100</span>
              </div>
              <input
                type="text"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary headline of what happened"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-[#005BAC]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                  <span>Detailed Description</span>
                  <span className="text-red-500">*</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-1">(3 – 100 characters)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[11px] font-mono font-semibold ${
                      description.length > 0 && description.length < 3
                        ? 'text-amber-500'
                        : description.length >= 100
                        ? 'text-red-500'
                        : 'text-slate-400 dark:text-zinc-400'
                    }`}
                  >
                    {description.length}/100
                  </span>
                  <button
                    type="button"
                    onClick={handleTriggerAiAnalysis}
                    disabled={isAnalyzing || !title.trim() || !description.trim() || description.length < 3}
                    className="text-[11px] text-[#005BAC] dark:text-blue-400 hover:underline flex items-center space-x-1 disabled:opacity-40 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isAnalyzing ? 'Analyzing AI...' : 'Pre-check with AI'}</span>
                  </button>
                </div>
              </div>
              <textarea
                required
                rows={4}
                minLength={3}
                maxLength={100}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide factual details (min 3, max 100 characters)..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none transition-all ${
                  description.length > 0 && description.length < 3
                    ? 'border-amber-500 ring-1 ring-amber-500/20'
                    : description.length >= 100
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-slate-300 dark:border-slate-700 focus:border-[#005BAC]'
                }`}
              />
              {/* Notice when description is wrong length */}
              {description.length > 0 && description.length < 3 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Description must be at least 3 characters long ({description.length}/3 entered).</span>
                </p>
              )}
              {description.length >= 100 && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 font-medium flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Maximum limit of 100 characters reached.</span>
                </p>
              )}
            </div>

            {/* AI Preview Card if active */}
            {aiPreview && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl space-y-1 text-xs">
                <div className="flex items-center space-x-1.5 text-purple-900 dark:text-purple-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>AI Pre-Analysis Rating: Priority {aiPreview.priority}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">{aiPreview.aiSummary}</p>
              </div>
            )}
          </div>

          {/* Step 3: Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Incident Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            {/* Dynamic Region and Zone Cascading Combobox */}
            <div className="md:col-span-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <RegionZoneSelector
                selectedRegion={region}
                selectedZone={zone}
                onRegionChange={setRegion}
                onZoneChange={setZone}
                customZoneValue={customZone}
                onCustomZoneChange={setCustomZone}
                size="sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Specific Location / Kebele / Landmark <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={specificLocation}
                onChange={(e) => setSpecificLocation(e.target.value)}
                placeholder="e.g. Kebele 04, near Central Market"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Evidence Upload (Photos, Audio, Video, PDF - Max 100MB)</span>
              <span className="text-[11px] text-slate-400 font-normal">Optional</span>
            </label>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#005BAC] rounded-xl p-4 text-center bg-slate-50 dark:bg-slate-800/50 transition-colors relative">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {uploading ? 'Processing & Validating Upload...' : 'Click or Drag files here to attach evidence'}
              </p>
            </div>

            {/* Evidence items list with prominent Delete action */}
            {evidenceList.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 px-1">
                  <span>Attached Evidence ({evidenceList.length})</span>
                  <button
                    type="button"
                    onClick={() => setEvidenceList([])}
                    className="text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer text-[10px] font-bold"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete All Files</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {evidenceList.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900/40 rounded-xl flex items-center justify-between text-xs transition-all shadow-sm"
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate pr-1">
                          <p className="truncate text-slate-800 dark:text-slate-200 font-semibold text-xs">{ev.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{ev.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEvidenceList((prev) => prev.filter((e) => e.id !== ev.id))}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/50 dark:hover:bg-red-900/80 dark:text-red-400 text-[11px] font-bold transition-colors cursor-pointer ml-2 shrink-0 border border-red-200 dark:border-red-800/80 shadow-xs active:scale-95"
                        title="Delete this uploaded file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Action Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md transition-transform active:scale-95 flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              <span>Submit to AMECO</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
