import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, ReportItem, Message, PriorityLevel, ReportStatus, EvidenceFile } from '../../types';
import { ChatComposer } from '../Common/ChatComposer';
import { MessageAttachment } from '../Common/MessageAttachment';
import {
  User,
  Shield,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  HelpCircle,
  LogOut,
  Trash2,
  X,
  Edit2,
  FileCheck,
  Radio,
  Download,
  Paperclip,
  Check,
  Copy,
} from 'lucide-react';
import { REGIONAL_ZONES, ETHIOPIAN_REGIONS, getRegionForZone, getZonesForRegion } from '../../data/zones';
import { RegionZoneSelector } from '../Common/RegionZoneSelector';
import { changePasswordApi } from '../../lib/api';
import { validateName } from '../../utils/nameValidation';
import { validateEmail } from '../../utils/emailValidation';
import { ValidatedNameInput } from '../Common/ValidatedNameInput';
import { FormalEmailInput } from '../Common/FormalEmailInput';
import { InternationalPhoneInput } from '../InternationalPhoneInput';
import { validateInternationalPhone } from '../../utils/phoneHelper';
import {
  evaluatePasswordStrength,
  generateStrongPassword,
  validateStrongPassword,
  validatePasswordMatch,
} from '../../utils/passwordHelper';
import { useLanguage } from '../../context/LanguageContext';

interface CitizenProfileProps {
  currentUser: UserProfile;
  reports?: ReportItem[];
  messages?: Message[];
  onSendMessage?: (reportId: string, text: string, attachment?: EvidenceFile) => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLogout?: () => void;
  onNavigateTab?: (tab: string) => void;
  onDeleteAccount?: () => void;
}

export const CitizenProfile: React.FC<CitizenProfileProps> = ({
  currentUser,
  reports = [],
  messages = [],
  onSendMessage,
  onUpdateProfile,
  onLogout,
  onNavigateTab,
  onDeleteAccount,
}) => {
  const { language } = useLanguage();
  const isAm = language === 'am';

  // Modal & Tab States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState<ReportItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [tipSearchQuery, setTipSearchQuery] = useState('');
  const [tipStatusFilter, setTipStatusFilter] = useState<'All' | 'Pending' | 'Investigation' | 'Published' | 'Rejected'>('All');
  const [newMessageText, setNewMessageText] = useState('');
  const [idCopied, setIdCopied] = useState(false);

  // Edit Profile Form State
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [institutionName, setInstitutionName] = useState(currentUser?.institutionName || currentUser?.fullName || '');
  const [institutionCategory, setInstitutionCategory] = useState(currentUser?.institutionCategory || 'Public Health & Healthcare');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || currentUser?.phoneNumber || '');
  const [gender, setGender] = useState(currentUser?.gender || 'Prefer not to say');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth || '');
  const [region, setRegion] = useState(currentUser?.region || getRegionForZone(currentUser?.zone || ''));
  const [zone, setZone] = useState(currentUser?.zone || 'Addis Abeba');
  const [customZone, setCustomZone] = useState('');
  const [subCity, setSubCity] = useState(currentUser?.subCity || currentUser?.woreda || '');

  // Keep state in sync if currentUser changes or modal reopens
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setInstitutionName(currentUser.institutionName || currentUser.fullName || '');
      setInstitutionCategory(currentUser.institutionCategory || 'Public Health & Healthcare');
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || currentUser.phoneNumber || '');
      setGender(currentUser.gender || 'Prefer not to say');
      setDateOfBirth(currentUser.dateOfBirth || '');
      setRegion(currentUser.region || getRegionForZone(currentUser.zone || ''));
      setZone(currentUser.zone || 'Addis Abeba');
      setSubCity(currentUser.subCity || currentUser.woreda || '');
    }
  }, [currentUser, isEditModalOpen]);

  // Form Validation & Feedback State
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Role detection helpers
  const isAdministrator = currentUser?.role === 'Administrator';
  const isInstitution = currentUser?.role === 'Institution' || currentUser?.role === 'Publisher';
  const isInvestigator = currentUser?.role === 'ResponsiblePerson';
  const isCitizen = !isAdministrator && !isInstitution && !isInvestigator;

  // Password Update State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // ==========================================
  // REAL CALCULATED ACTIVITY STATISTICS
  // ==========================================
  const myTips = useMemo(() => {
    let locallyStoredCodes: string[] = [];
    try {
      const globalCodes = JSON.parse(localStorage.getItem('ameco_submitted_report_ids') || '[]');
      const userCodes = currentUser?.id
        ? JSON.parse(localStorage.getItem(`ameco_submissions_${currentUser.id}`) || '[]')
        : [];
      locallyStoredCodes = Array.from(new Set([...globalCodes, ...userCodes]));
    } catch {
      locallyStoredCodes = [];
    }

    return reports.filter((r) => {
      if (r.citizenId && currentUser?.id && r.citizenId.toLowerCase() === currentUser.id.toLowerCase()) return true;
      if ((r as any).submitterId && currentUser?.id && (r as any).submitterId === currentUser.id) return true;
      if (currentUser?.email && r.citizenEmail && r.citizenEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase()) return true;
      if (r.trackingCode && locallyStoredCodes.includes(r.trackingCode)) return true;
      if (r.id && locallyStoredCodes.includes(r.id)) return true;
      return false;
    });
  }, [reports, currentUser]);

  const stats = {
    total: myTips.length,
    pending: myTips.filter((r) =>
      ['Submitted', 'Under AI Review', 'Under Administrator Review'].includes(r.status)
    ).length,
    underInvestigation: myTips.filter((r) =>
      ['Assigned', 'Investigation in Progress', 'Waiting for Citizen Response'].includes(r.status)
    ).length,
    verified: myTips.filter(
      (r) =>
        r.status === 'Investigation Completed' ||
        (r.status === 'Published' && !!r.investigationFindings)
    ).length,
    published: myTips.filter((r) => r.status === 'Published').length,
    rejected: myTips.filter((r) => ['Rejected', 'Closed'].includes(r.status)).length,
  };

  // Filtered Tips for "My Tips" section
  const filteredTips = myTips.filter((tip) => {
    const matchesSearch =
      tip.title.toLowerCase().includes(tipSearchQuery.toLowerCase()) ||
      tip.id.toLowerCase().includes(tipSearchQuery.toLowerCase()) ||
      tip.category.toLowerCase().includes(tipSearchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (tipStatusFilter === 'All') return true;
    if (tipStatusFilter === 'Pending') {
      return ['Submitted', 'Under AI Review', 'Under Administrator Review'].includes(tip.status);
    }
    if (tipStatusFilter === 'Investigation') {
      return ['Assigned', 'Investigation in Progress', 'Waiting for Citizen Response'].includes(tip.status);
    }
    if (tipStatusFilter === 'Published') {
      return tip.status === 'Published';
    }
    if (tipStatusFilter === 'Rejected') {
      return ['Rejected', 'Closed'].includes(tip.status);
    }
    return true;
  });

  // Handle Copy ID
  const handleCopyCitizenId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUser.id);
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 2000);
    }
  };

  // Handle Edit Profile Submission
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    // Validate Full Name
    const nameValidation = validateName(fullName, 'Full Name');
    if (!nameValidation.isValid) {
      errors.fullName = nameValidation.error || 'Full Name must contain letters only.';
    }

    // Validate Email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error || 'Please provide a valid formal email address.';
    }

    // Validate Phone Number
    if (phone && phone.trim()) {
      const phoneValidation = validateInternationalPhone(phone);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.error || 'Invalid phone number format.';
      }
    }

    // Validate Username
    if (username && username.trim()) {
      if (username.length < 3 || username.length > 30) {
        errors.username = 'Username must be between 3 and 30 characters.';
      } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        errors.username = 'Username can only contain letters, numbers, and underscores.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const isCustom = zone.startsWith('Others') || region === 'Others...';
    const effectiveZone = isCustom ? (customZone.trim() || 'Custom Location') : zone;

    onUpdateProfile({
      fullName: fullName.trim(),
      institutionName: isInstitution ? (institutionName.trim() || fullName.trim()) : undefined,
      institutionCategory: isInstitution ? institutionCategory : undefined,
      username: username.trim() ? username.trim().toLowerCase() : undefined,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      phoneNumber: phone.trim(),
      gender: isInstitution ? undefined : gender,
      dateOfBirth: isInstitution ? undefined : dateOfBirth || undefined,
      region: region,
      zone: effectiveZone,
      city: effectiveZone,
      subCity: subCity.trim() || undefined,
      woreda: subCity.trim() || undefined,
    });

    setSavedSuccess(true);
    setIsEditModalOpen(false);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  // Handle Password Strength & Generator
  const passStrength = evaluatePasswordStrength(newPassword);
  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleGenerateProfilePassword = () => {
    const strong = generateStrongPassword();
    setNewPassword(strong);
    setConfirmPassword(strong);
    setShowNewPassword(true);
    setShowConfirmPassword(true);
    navigator.clipboard?.writeText?.(strong).catch(() => {});
    setPasswordSuccess('Recommended strong password generated and copied to clipboard.');
    setTimeout(() => setPasswordSuccess(null), 4000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    const strongCheck = validateStrongPassword(newPassword);
    if (!strongCheck.isValid) {
      setPasswordError(strongCheck.error || 'Password must meet all security requirements.');
      return;
    }

    const matchCheck = validatePasswordMatch(newPassword, confirmPassword);
    if (!matchCheck.isValid) {
      setPasswordError(matchCheck.error || 'Passwords do not match.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const res = await changePasswordApi({
        userId: currentUser.id,
        oldPassword: oldPassword || undefined,
        newPassword,
      });

      if (res.success) {
        setPasswordSuccess(res.message || 'Password updated successfully.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onUpdateProfile({ password: newPassword, isDefaultPassword: false });
        setTimeout(() => setPasswordSuccess(null), 5000);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password. Please verify current credentials.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Account Deletion Confirmation
  const handleConfirmAccountDeletion = () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      return;
    }

    if (onDeleteAccount) {
      onDeleteAccount();
    } else {
      // Mark as suspended / deactivate
      onUpdateProfile({ status: 'suspended' });
      if (onLogout) {
        onLogout();
      }
    }
    setIsDeleteModalOpen(false);
  };

  // Helper for Priority Badges
  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'High':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  // Helper for Status Badges
  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'Published':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Investigation Completed':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'Investigation in Progress':
      case 'Assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Waiting for Citizen Response':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Under AI Review':
      case 'Under Administrator Review':
      case 'Submitted':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Rejected':
      case 'Closed':
      default:
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }
  };

  // Registered Date Display
  const registrationDisplayDate =
    currentUser.joinedDate || currentUser.createdAt || '2026-01-15';
  const lastLoginDisplay =
    currentUser.lastLoginAt || 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isGuest = currentUser?.id?.startsWith('GUEST-') || currentUser?.isGuest || currentUser?.fullName === 'Anonymous Guest';

  if (isGuest) {
    return (
      <div className="max-w-3xl mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-lg animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-5 border border-amber-200 dark:border-amber-800">
          <Shield className="w-8 h-8" />
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
          {isAm ? 'እንግዳ ተጠቃሚ / ማንነቱ ያልታወቀ ክፍለ-ጊዜ' : 'Guest User / Anonymous Session'}
        </span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
          {isAm ? 'የመለያ መገለጫ ለእንግዶች አይገኝም' : 'Account Profile Unavailable for Guests'}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
          {isAm
            ? 'እንግዳ ተጠቃሚዎች ማንነታቸው ሳይታወቅ የሚጎበኙ ሲሆን የመለያ መገለጫ፣ የግል ምስክርነቶች ወይም የማሳወቂያ ሳጥን የላቸውም። ማንነቱ ያልታወቀ ጥቆማዎን ለመከታተል፣ እባክዎ ደህንነቱ የተጠበቀ የመከታተያ ኮድዎን ይጠቀሙ።'
            : 'Guest users browse anonymously and do not have an account profile, personal credentials, or notification inbox. To track your anonymous submission, please use your secure Tracking Code.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('track')}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              {isAm ? 'ስም-አልባ ጥቆማን ተከታተል' : 'Track Anonymous Tip'}
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-5 py-2.5 rounded-xl bg-[#005BAC] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              {isAm ? 'ግባ / ተመዝገብ' : 'Login / Sign Up'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 px-4 sm:px-6">
      {/* Top Header Card (Clean Journalism Style - No Banner, No Avatar Photo) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {isAdministrator
                ? (isAm ? 'የአስተዳዳሪ መገለጫ' : 'Administrator Profile')
                : isInstitution
                ? currentUser.role === 'Publisher'
                  ? (isAm ? 'የአሳታሚ መገለጫ' : 'Publisher Profile')
                  : (isAm ? 'የተቋም መገለጫ' : 'Institution Profile')
                : isInvestigator
                ? (isAm ? 'የመርማሪ መገለጫ' : 'Investigator Profile')
                : (isAm ? 'የዜጋ መገለጫ' : 'Citizen Profile')}
            </h1>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#005BAC]/10 text-[#005BAC] dark:bg-blue-950 dark:text-blue-300 border border-[#005BAC]/20">
              {isAdministrator
                ? (isAm ? 'የአሚኮ ማዕከላዊ አስተዳደር' : 'AMECO Central Administration')
                : isInstitution
                ? currentUser.role === 'Publisher'
                  ? currentUser.fullName
                  : (currentUser.institutionName || (isAm ? 'የተረጋገጠ ተቋም' : 'Verified Institution'))
                : isInvestigator
                ? (isAm ? 'የአሚኮ ምርመራ ዴስክ' : 'AMECO Investigative Desk')
                : (isAm ? 'የአሚኮ ዜጎች ጋዜጠኝነት' : 'AMECO Citizen Journalism')}
            </span>
            {currentUser.verified || isAdministrator || isInvestigator || (isInstitution && currentUser.approved) ? (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {isAdministrator
                    ? (isAm ? 'የደህንነት ፈቃድ L1' : 'Security Clearance L1')
                    : isInstitution
                    ? (isAm ? 'የተፈቀደለት የዜና አሳታሚ' : 'Approved News Publisher')
                    : isInvestigator
                    ? (isAm ? 'ፈቃድ ያለው መርማሪ' : 'Authorized Investigator')
                    : (isAm ? 'የተረጋገጠ ዜጋ' : 'Verified Citizen')}
                </span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#005BAC]" />
                <span>
                  {isInstitution
                    ? currentUser.role === 'Publisher'
                      ? (isAm ? 'የአሳታሚ ማረጋገጫ በመጠባበቅ ላይ' : 'Pending Publisher Approval')
                      : (isAm ? 'የተቋም ማረጋገጫ በመጠባበቅ ላይ' : 'Pending Institutional Approval')
                    : (isAm ? 'የተመዘገበ አካውንት' : 'Registered Account')}
                </span>
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {isAdministrator
              ? (isAm
                  ? 'የማዕከላዊ አስተዳደር መረጃዎን ያስተዳድሩ፣ የይለፍ ቃልዎን ያዘምኑ፣ የመገናኛ አድራሻዎችን ያዋቅሩ እና የኦዲት መዝገቦችን ይገምግሙ።'
                  : 'Manage your central administrative credentials, update your secure authentication password, configure contact details, and review audit trail compliance.')
              : isInstitution
              ? currentUser.role === 'Publisher'
                ? (isAm
                    ? 'የአሳታሚ መረጃዎችን ያስተዳድሩ፣ የይለፍ ቃል ያዘምኑ፣ የመገናኛ መስመሮችን ያዋቅሩ እና የህትመት ሁኔታን ይገምግሙ።'
                    : 'Manage Publisher credentials, update your secure access password, configure contact channels, and review publication status.')
                : (isAm
                    ? 'የተቋም መረጃዎችን ያስተዳድሩ፣ የተፈቀደ የይለፍ ቃል ያዘምኑ፣ የመገናኛ መስመሮችን ያዋቅሩ እና የህትመት ሁኔታን ይገምግሙ።'
                    : 'Manage institutional profile credentials, update authorized access password, configure institutional contact channels, and review publication status.')
              : isInvestigator
              ? (isAm
                  ? 'የመርማሪ መረጃዎችን ያስተዳድሩ፣ የይለፍ ቃል ያዘምኑ፣ የመስክ አድራሻዎችን ያዋቅሩ እና የምርመራ ፈቃዶችን ይገምግሙ።'
                  : 'Manage investigator credentials, update your secure access password, configure field contact details, and review case verification clearance.')
              : (isAm
                  ? 'የግል መረጃዎችን ያስተዳድሩ፣ ያቀረቧቸውን ጥቆማዎች ይገምግሙ፣ የጉዳዮችን ሂደት ይከታተሉ እና የአካውንት ደህንነትን ያዋቅሩ።'
                  : 'Manage your personal credentials, review your submitted investigative tips, monitor case progress, and configure account security settings.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setFullName(currentUser.fullName || '');
              setInstitutionName(currentUser.institutionName || currentUser.fullName || '');
              setInstitutionCategory(currentUser.institutionCategory || 'Public Health & Healthcare');
              setUsername(currentUser.username || '');
              setEmail(currentUser.email || '');
              setPhone(currentUser.phone || currentUser.phoneNumber || '');
              setGender(currentUser.gender || 'Prefer not to say');
              setDateOfBirth(currentUser.dateOfBirth || '');
              setZone(currentUser.zone || 'Bahir Dar City');
              setSubCity(currentUser.subCity || currentUser.woreda || '');
              setFormErrors({});
              setIsEditModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
          >
            <Edit2 className="w-4 h-4" />
            <span>{isAm ? 'መገለጫ አርትዕ' : 'Edit Profile'}</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>{isAm ? 'ውጣ' : 'Logout'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Success Notification */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-sm flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            {isAm
              ? 'መገለጫዎ በተሳካ ሁኔታ ተዘምኗል! ሁሉም ለውጦች በዳታቤዝ ውስጥ በደህንነት ተቀምጠዋል።'
              : 'Profile updated successfully! All changes have been securely saved to the database.'}
          </span>
        </div>
      )}

      {/* Profile Information: 3 Structured Columns (Personal/Institutional, Contact, Account) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Identity Information */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {isInstitution
                    ? currentUser.role === 'Publisher'
                      ? (isAm ? 'የአሳታሚ ዝርዝር' : 'Publisher Details')
                      : (isAm ? 'የተቋም ዝርዝር' : 'Institutional Details')
                    : isAdministrator
                    ? (isAm ? 'የአስተዳዳሪ ዝርዝር' : 'Administrator Details')
                    : isInvestigator
                    ? (isAm ? 'የመርማሪ ዝርዝር' : 'Investigator Details')
                    : (isAm ? 'የግል መረጃ' : 'Personal Information')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isInstitution
                    ? currentUser.role === 'Publisher'
                      ? (isAm ? 'የአሳታሚ ማንነት ማረጋገጫ' : 'Publisher identification')
                      : (isAm ? 'የተቋም ማንነት ማረጋገጫ' : 'Organization identification')
                    : isAdministrator || isInvestigator
                    ? (isAm ? 'የባለሙያ መለያ ማስረጃዎች' : 'Staff identity credentials')
                    : (isAm ? 'የዜጋ መለያ' : 'Citizen identification')}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              {isInstitution ? (
                <>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {currentUser.role === 'Publisher' ? (isAm ? 'የአሳታሚ ስም' : 'Publisher Name') : (isAm ? 'የተቋም ስም' : 'Institution Name')}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {currentUser.role === 'Publisher' ? currentUser.fullName : (currentUser.institutionName || currentUser.fullName || (isAm ? 'የክልል ተቋም' : 'Regional Institution'))}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'ምድብ / ዘርፍ' : 'Category / Sector'}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {currentUser.institutionCategory || (isAm ? 'የህዝብ ጤና እና ህክምና' : 'Public Health & Healthcare')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'ተወካይ መኮንን' : 'Representative Officer'}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {currentUser.fullName || (isAm ? 'ኦፊሴላዊ ተወካይ' : 'Official Representative')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'የህትመት ሁኔታ' : 'Publishing Status'}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 flex items-center space-x-1 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{currentUser.approved ? (isAm ? 'የተረጋገጠ አጋር' : 'Verified Partner') : (isAm ? 'ማረጋገጫ በሂደት ላይ' : 'Verification In Progress')}</span>
                    </span>
                  </div>
                </>
              ) : isAdministrator ? (
                <>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'ሙሉ ስም' : 'Full Name'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {(currentUser.fullName === 'Admin' || currentUser.fullName === 'Administrator')
                        ? (isAm ? 'ዋና አስተዳዳሪ' : 'Administrator')
                        : currentUser.fullName}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'የተጠቃሚ ስም' : 'Username'}
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {currentUser.username ? `@${currentUser.username}` : '@admin'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'ዲፓርትመንት / ዴስክ' : 'Department / Desk'}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {currentUser.department || (isAm ? 'ማዕከላዊ ኤዲቶሪያል እና የደህንነት አስተዳደር' : 'Central Editorial & Security Administration')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'የመዳረሻ ሚና' : 'Access Role'}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 flex items-center space-x-1 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-[#005BAC]" />
                      <span>{isAm ? 'ማዕከላዊ ኤዲቶሪያል አስተዳዳሪ' : 'Central Editorial Administrator'}</span>
                    </span>
                  </div>
                </>
              ) : isInvestigator ? (
                <>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'የመኮንኑ ስም' : 'Officer Name'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {currentUser.fullName || (isAm ? 'መርማሪ ባለሙያ' : 'Staff Investigator')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'የተጠቃሚ ስም' : 'Username'}
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {currentUser.username ? `@${currentUser.username}` : '@investigator'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'የምርመራ ዴስክ' : 'Investigation Desk'}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {currentUser.department || (isAm ? 'የአሚኮ ምርመራ ዴስክ' : 'AMECO Investigation Desk')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'የፈቃድ ደረጃ' : 'Clearance Level'}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 flex items-center space-x-1 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isAm ? 'የመስክ ማረጋገጫ መኮንን' : 'Field Verification Officer'}</span>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'ሙሉ ስም' : 'Full Name'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {currentUser.fullName || (isAm ? 'ያልተገለጸ' : 'Unspecified')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'የተጠቃሚ ስም' : 'Username'}
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {currentUser.username ? `@${currentUser.username}` : (isAm ? 'ያልተዋቀረ' : 'Not configured')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'ጾታ' : 'Gender'}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {currentUser.gender || (isAm ? 'መግለጽ አልፈልግም' : 'Prefer not to say')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                      {isAm ? 'የትውልድ ቀን' : 'Date of Birth'}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{currentUser.dateOfBirth || (isAm ? 'ያልተገለጸ' : 'Unspecified')}</span>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              {isAm ? 'በመገለጫ ቅንብሮች ሊስተካከል የሚችል' : 'Editable via profile settings'}
            </span>
          </div>
        </div>

        {/* 2. Contact Information */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {isAm ? 'የመገናኛ መረጃ' : 'Contact Information'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAm ? 'የመገናኛ መስመሮች' : 'Communication channels'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                  {isAm ? 'የስልክ ቁጥር' : 'Phone Number'}
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.phone || currentUser.phoneNumber || (isAm ? 'አልተሰጠም' : 'Not provided')}</span>
                </span>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                  {isAm ? 'የኢሜይል አድራሻ' : 'Email Address'}
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mt-0.5 break-all">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{currentUser.email || (isAm ? 'አልተሰጠም' : 'Not provided')}</span>
                </span>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                  {isAm ? 'ከተማ / የክልል ዞን' : 'City / Region Zone'}
                </span>
                <span className="text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {currentUser.city || currentUser.zone || (isAm ? 'ባሕር ዳር ልዩ ዞን' : 'Bahir Dar Special Zone')}
                  </span>
                </span>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                  {isAm ? 'ክፍለ ከተማ / ወረዳ' : 'Sub-city / Woreda'}
                </span>
                <span className="text-slate-800 dark:text-slate-200">
                  {currentUser.subCity === 'Headquarters' || currentUser.woreda === 'Headquarters'
                    ? (isAm ? 'ዋና መስሪያ ቤት' : 'Headquarters')
                    : (currentUser.subCity || currentUser.woreda || (isAdministrator ? (isAm ? 'ዋና መስሪያ ቤት' : 'Headquarters') : (isAm ? 'ያልተገለጸ' : 'Unspecified')))}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              {isAm ? 'በዳታቤዝ ውስጥ የተመሰጠረ' : 'Encrypted in database'}
            </span>
          </div>
        </div>

        {/* 3. Account Information (System Read-Only) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {isAm ? 'የአካውንት መረጃ' : 'Account Information'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAm ? 'የስርዓት ደህንነት እና የኦዲት መዝገቦች' : 'System security & audit logs'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                  {isAdministrator
                    ? (isAm ? 'የአስተዳዳሪ መለያ' : 'Admin ID')
                    : isInstitution
                    ? (isAm ? 'የተቋም መለያ' : 'Institution ID')
                    : isInvestigator
                    ? (isAm ? 'የመኮንን መለያ' : 'Officer ID')
                    : (isAm ? 'የዜጋ መለያ' : 'Citizen ID')}
                </span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#005BAC] dark:text-blue-300 font-bold font-mono text-xs border border-slate-200 dark:border-slate-700">
                    {currentUser.id}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyCitizenId}
                    title={isAm ? 'የአካውንት መለያ ቅዳ' : 'Copy Account ID'}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                  >
                    {idCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                  {isAm ? 'የአካውንት ሁኔታ' : 'Account Status'}
                </span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      currentUser.status === 'active' || !currentUser.status
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : currentUser.status === 'suspended'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    <span className="capitalize">
                      {currentUser.status === 'active' || !currentUser.status
                        ? (isAm ? 'ንቁ' : 'Active')
                        : currentUser.status === 'suspended'
                        ? (isAm ? 'የታገደ' : 'Suspended')
                        : (isAm ? 'በመጠባበቅ ላይ' : (currentUser.status || 'Active'))}
                    </span>
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                  {isAm ? 'የተመዘገበበት ቀን' : 'Registration Date'}
                </span>
                <span className="text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{registrationDisplayDate}</span>
                </span>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                  {isAm ? 'የመጨረሻ መግቢያ' : 'Last Login'}
                </span>
                <span className="text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAm ? lastLoginDisplay.replace('Today', 'ዛሬ').replace('Yesterday', 'ትናንት') : lastLoginDisplay}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{isAm ? 'የማይለወጥ የስርዓት መስክ' : 'Non-modifiable system field'}</span>
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 4. PASSWORD & ACCOUNT SECURITY */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {isAm ? 'የይለፍ ቃል እና የአካውንት ደህንነት' : 'Password & Account Security'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAm
                  ? 'የመለያ መግቢያ ይለፍ ቃልዎን ያዘምኑ እና ክፍለ-ጊዜውን ይጠብቁ'
                  : 'Update account access credentials and manage secure session authentication'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateProfilePassword}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#005BAC] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAm ? 'አስተማማኝ የይለፍ ቃል ጠቁም' : 'Recommend Strong Password'}</span>
            </button>

            {!isAdministrator && currentUser.isDefaultPassword ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isAm ? 'መደበኛ የይለፍ ቃል ነቅቷል' : 'Default Password Active'}</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isAm ? 'ደህንነቱ የተጠበቀ' : 'Secured'}</span>
              </span>
            )}
          </div>
        </div>

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

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 text-xs block">
                {isAm ? 'የአሁኑ / መደበኛ የይለፍ ቃል' : 'Current / Default Password'}
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder={isAm ? 'የአሁኑን የይለፍ ቃል ያስገቡ' : 'Enter current password'}
                  className="w-full px-3.5 py-2.5 pr-8 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 text-xs block">
                {isAm ? 'አዲስ የይለፍ ቃል *' : 'New Password *'}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isAm ? 'ጠንካራ የይለፍ ቃል ይፍጠሩ' : 'Create strong password'}
                  className="w-full px-3.5 py-2.5 pr-8 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Visualizer */}
              {newPassword && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{isAm ? 'ጥንካሬ:' : 'Strength:'}</span>
                    <span className={`font-bold ${passStrength.color}`}>
                      {isAm
                        ? passStrength.score <= 1
                          ? 'ደካማ'
                          : passStrength.score === 2
                          ? 'መካከለኛ'
                          : passStrength.score === 3
                          ? 'ጥሩ'
                          : 'በጣም ጠንካራ'
                        : passStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-all ${
                          step <= passStrength.score
                            ? passStrength.score === 1
                              ? 'bg-red-500'
                              : passStrength.score === 2
                              ? 'bg-amber-500'
                              : passStrength.score === 3
                              ? 'bg-blue-500'
                              : 'bg-emerald-500'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span className={`flex items-center space-x-1 ${passStrength.hasMinLength ? 'text-emerald-600 font-bold' : ''}`}>
                      {passStrength.hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />}
                      <span>{isAm ? '8+ ፊደላት' : '8+ Chars'}</span>
                    </span>
                    <span className={`flex items-center space-x-1 ${passStrength.hasUpper ? 'text-emerald-600 font-bold' : ''}`}>
                      {passStrength.hasUpper ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />}
                      <span>{isAm ? 'ትልቅ ፊደል (A-Z)' : 'Uppercase (A-Z)'}</span>
                    </span>
                    <span className={`flex items-center space-x-1 ${passStrength.hasNumber ? 'text-emerald-600 font-bold' : ''}`}>
                      {passStrength.hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />}
                      <span>{isAm ? 'ቁጥር (0-9)' : 'Number (0-9)'}</span>
                    </span>
                    <span className={`flex items-center space-x-1 ${passStrength.hasSpecial ? 'text-emerald-600 font-bold' : ''}`}>
                      {passStrength.hasSpecial ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />}
                      <span>{isAm ? 'ልዩ ምልክት (!@#$)' : 'Symbol (!@#$)'}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-xs block">
                  {isAm ? 'የይለፍ ቃል ያረጋግጡ *' : 'Confirm Password *'}
                </label>
                {confirmPassword && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center space-x-1 ${
                      passwordsMatch
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                        : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60'
                    }`}
                  >
                    {passwordsMatch ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{isAm ? 'ይመሳሰላል' : 'Matches'}</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 text-red-600" />
                        <span>{isAm ? 'አይመሳሰልም' : 'Mismatch'}</span>
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isAm ? 'አዲሱን የይለፍ ቃል ይድገሙ' : 'Repeat new password'}
                  className={`w-full px-3.5 py-2.5 pr-8 text-xs rounded-xl border dark:bg-slate-800 dark:text-slate-100 outline-none focus:ring-2 ${
                    confirmPassword
                      ? passwordsMatch
                        ? 'border-emerald-500 focus:ring-emerald-500'
                        : 'border-red-500 focus:ring-red-500'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-[#005BAC]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isAm
                ? 'ቢያንስ 8 ፊደላት፣ ትልቅ ፊደል (A-Z)፣ ትንሽ ፊደል (a-z)፣ ቁጥር (0-9) እና ልዩ ምልክት (!@#$) መያዝ አለበት።'
                : 'Must include 8+ characters, uppercase (A-Z), lowercase (a-z), number (0-9), and special symbol (!@#$).'}
            </p>
            <button
              type="submit"
              disabled={isUpdatingPassword || !newPassword || !confirmPassword || !passwordsMatch}
              className="px-5 py-2.5 bg-[#005BAC] hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow flex items-center space-x-2 cursor-pointer transition-colors shrink-0"
            >
              <Key className="w-3.5 h-3.5" />
              <span>
                {isUpdatingPassword
                  ? (isAm ? 'በማዘመን ላይ...' : 'Updating...')
                  : (isAm ? 'የይለፍ ቃል አዘምን' : 'Update Password')}
              </span>
            </button>
          </div>
        </form>

        {/* 9. ACCOUNT DELETION / AUDIT COMPLIANCE POLICY */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-1.5">
              {isCitizen ? (
                <>
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span className="text-rose-700 dark:text-rose-400">
                    {isAm ? 'አካውንት መሰረዝ እና የውሂብ አያያዝ' : 'Account Deletion & Data Retention'}
                  </span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-[#005BAC]" />
                  <span>
                    {isAm ? 'የደህንነት ደንብ እና ኦፊሴላዊ የስራ መልቀቂያ' : 'Security Compliance & Official Offboarding'}
                  </span>
                </>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              {isCitizen
                ? (isAm
                    ? 'የዜጋ መለያዎን በቋሚነት ያሰናክሉ። በኢትዮጵያ የሚዲያ ደንቦች መሰረት፣ የቀረቡት የምርመራ መዝገቦች ለህጋዊ እና የኦዲት ተገዢነት በደህንነት ተቀምጠው ይቀራሉ።'
                    : 'Permanently deactivate your citizen account. In compliance with Ethiopian media regulations, submitted investigation records are archived for legal and audit compliance.')
                : (isAm
                    ? 'አስተዳደራዊ፣ ተቋማዊ እና የምርመራ አካውንቶች በኢትዮጵያ ስርጭት እና ሚዲያ ቁጥጥር ደንብ የተገደቡ ናቸው። ኦፊሴላዊ አካውንቶችን በቀጥታ መሰረዝ አይቻልም፤ እባክዎ ለስራ መልቀቂያ ማዕከላዊ ኤዲቶሪያል ቦርድን ያነጋግሩ።'
                    : 'Administrative, institutional, and investigative accounts are bound by Ethiopian broadcast and media regulatory compliance. Official accounts cannot be deleted directly; please contact the Central Editorial Board for staff deprovisioning.')}
            </p>
          </div>

          {isCitizen && (
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmationText('');
                setIsDeleteModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              {isAm ? 'አካውንት ሰርዝ' : 'Delete Account'}
            </button>
          )}
        </div>
      </div>

      {/* 12. IMPORTANT PRIVACY & RBAC POLICY CARD */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-200 font-bold">
          <Shield className="w-4 h-4 text-[#005BAC]" />
          <span>
            {isAdministrator
              ? (isAm ? 'የማይለወጥ የአስተዳደራዊ ኦዲት ዋስትና' : 'Immutable Administrative Audit Guarantee')
              : isInstitution
              ? currentUser.role === 'Publisher'
                ? (isAm ? 'የአሳታሚ ዜና ህትመት እና ማረጋገጫ ዋስትና' : 'Publisher News Publishing & Verification Guarantee')
                : (isAm ? 'የተቋማዊ ዜና ህትመት እና ማረጋገጫ ዋስትና' : 'Institutional News Publishing & Verification Guarantee')
              : isInvestigator
              ? (isAm ? 'የምርመራ ቢሮ ምስጢራዊነት ፖሊሲ' : 'Investigative Bureau Confidentiality Policy')
              : (isAm ? 'ጥብቅ የግላዊነት እና የRBAC ጥበቃ ዋስትና' : 'Strict Privacy & RBAC Protection Guarantee')}
          </span>
        </div>
        <p className="leading-relaxed text-[11px]">
          {isAdministrator
            ? (isAm
                ? 'ሁሉም አስተዳደራዊ እርምጃዎች፣ የመግቢያ ሙከራዎች፣ የመረጃ ለውጦች እና የኤዲቶሪያል ማስተካከያ ክስተቶች ከኢትዮጵያ የስርጭት እና የዲጂታል ሚዲያ ህጎች ጋር በተጣጣመ መልኩ በማይለወጠው የኦዲት መዝገብ ውስጥ በምስጢር ይመዘገባሉ።'
                : 'All administrative actions, login attempts, credential changes, and editorial moderation events are cryptographically recorded in the immutable audit log for compliance with Ethiopian broadcasting and digital media laws.')
            : isInstitution
            ? currentUser.role === 'Publisher'
              ? (isAm
                  ? 'በዚህ ፖርታል በኩል የሚታተሙ የአሳታሚ ዜናዎች እና ይፋዊ መግለጫዎች ለህዝብ ከመሰራጨታቸው በፊት በዲጂታል መንገድ ይረጋገጣሉ።'
                  : 'Publisher news and official statements published via this portal are digitally verified before syndication to citizens.')
              : (isAm
                  ? 'በዚህ ፖርታል የሚታተሙ የተቋማት መግለጫዎች እና ይፋዊ ዜናዎች በመላው አማራ ክልል ለሚገኙ ዜጎች ከመሰራጨታቸው በፊት በዲጂታል መንገድ ይረጋገጣሉ።'
                  : 'Institution press releases and official statements published via this portal are digitally verified before syndication to public citizens across Amhara Region.')
            : isInvestigator
            ? (isAm
                ? 'የመርማሪ ሪፖርቶች፣ የዜጎች ምንጭ ማንነት፣ የመስክ ማስታወሻዎች እና የማስረጃ መዝገቦች በጥብቅ የተመሰጠሩ እና በክልላዊ የሚዲያ ደረጃዎች መሰረት ለተፈቀደላቸው የኤዲቶሪያል ኃላፊዎች ብቻ የተገደቡ ናቸው።'
                : 'Investigator reports, citizen source identities, field notes, and evidence logs are strictly encrypted and restricted to authorized editorial supervisors under regional media standards.')
            : (isAm
                ? 'የዜጋ መገለጫ መረጃ (ሙሉ ስም፣ ስልክ ቁጥር፣ ኢሜይል፣ የትውልድ ቀን፣ ከተማ/ወረዳ፣ የዜጋ መለያ እና የግል መርማሪ መልዕክቶችን ጨምሮ) በጥብቅ ሚስጥራዊ ነው። በአሚኮ የደህንነት ፕሮቶኮሎች መሰረት የግል ዜጎች ማንነት ከህዝባዊ የዜና ፖርታሎች የተደበቀ ሲሆን ለተፈቀደላቸው የኤዲቶሪያል ኃላፊዎች ብቻ ተደራሽ ነው።'
                : 'Citizen profile information (including full name, phone number, email address, date of birth, city/woreda, Citizen ID, and private investigator correspondence) is strictly confidential. Under AMECO security protocols, private citizen identities are masked from public news portals and accessible only to authorized editorial supervisors.')}
        </p>
      </div>

      {/* ======================================================== */}
      {/* 6. EDIT PROFILE MODAL */}
      {/* ======================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-300">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                    {isAm ? 'የመገለጫ መረጃ አርትዕ' : 'Edit Profile Information'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAm
                      ? 'የግል እና የመገናኛ ዝርዝሮችዎን በትክክለኛ ማረጋገጫ ያዘምኑ'
                      : 'Update your personal and contact details with full validation'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-5 text-xs">
              {/* Read-Only Notice for Non-Modifiable Fields */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>
                    <strong>{isAm ? 'የአካውንት መለያ' : 'Account ID'} ({currentUser.id})</strong> {isAm ? 'እና' : 'and'}{' '}
                    <strong>
                      {isAm ? 'የአካውንት ሁኔታ' : 'Account Status'} (
                      {currentUser.status === 'active' || !currentUser.status
                        ? (isAm ? 'ንቁ' : 'Active')
                        : currentUser.status === 'suspended'
                        ? (isAm ? 'የታገደ' : 'Suspended')
                        : (currentUser.status || 'Active')}
                      )
                    </strong>{' '}
                    {isAm ? 'የማይለወጡ የስርዓት መስኮች ናቸው።' : 'are non-modifiable system fields.'}
                  </span>
                </div>
              </div>

              {/* Institutional fields */}
              {isInstitution ? (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      {isAm ? 'የተቋሙ ይፋዊ ስም *' : 'Institution Official Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder={isAm ? 'ለምሳሌ፡ የአማራ የህብረተሰብ ጤና ኢንስቲትዩት' : 'e.g. Amhara Public Health Institute'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block">
                        {isAm ? 'የተቋሙ ምድብ / ዘርፍ *' : 'Institutional Category / Sector *'}
                      </label>
                      <select
                        value={institutionCategory}
                        onChange={(e) => setInstitutionCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]"
                      >
                        <option value="Public Health & Healthcare">{isAm ? 'የህዝብ ጤና እና ህክምና' : 'Public Health & Healthcare'}</option>
                        <option value="Education & Academic Affairs">{isAm ? 'ትምህርት እና አካዳሚክ ጉዳዮች' : 'Education & Academic Affairs'}</option>
                        <option value="Environmental & Forestry Protection">{isAm ? 'አካባቢ እና ደን ጥበቃ' : 'Environmental & Forestry Protection'}</option>
                        <option value="Infrastructure, Roads & Energy">{isAm ? 'መሰረተ ልማት፣ መንገዶች እና ኢነርጂ' : 'Infrastructure, Roads & Energy'}</option>
                        <option value="Agriculture & Food Security">{isAm ? 'ግብርና እና የምግብ ዋስትና' : 'Agriculture & Food Security'}</option>
                        <option value="Public Safety, Police & Justice">{isAm ? 'የህዝብ ደህንነት፣ ፖሊስ እና ፍትህ' : 'Public Safety, Police & Justice'}</option>
                        <option value="Municipal & Regional Administration">{isAm ? 'ማዘጋጃ ቤት እና የክልል አስተዳደር' : 'Municipal & Regional Administration'}</option>
                        <option value="Civic & Non-Governmental Entity">{isAm ? 'ሲቪክ እና መንግስታዊ ያልሆነ ተቋም' : 'Civic & Non-Governmental Entity'}</option>
                      </select>
                    </div>

                    <ValidatedNameInput
                      label={isAm ? 'የተፈቀደለት ተወካይ ስም' : 'Authorized Representative Name'}
                      required
                      value={fullName}
                      onChange={setFullName}
                      placeholder={isAm ? 'ለምሳሌ፡ ዶ/ር ካሳሁን አበበ' : 'e.g. Dr. Kassahun Abebe'}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* 1. Full Name */}
                  <ValidatedNameInput
                    label={
                      isAdministrator
                        ? (isAm ? 'የአስተዳዳሪ ሙሉ ስም' : 'Administrator Full Name')
                        : isInvestigator
                        ? (isAm ? 'የመኮንን ሙሉ ስም' : 'Officer Full Name')
                        : (isAm ? 'ሙሉ ስም' : 'Full Name')
                    }
                    required
                    value={fullName}
                    onChange={setFullName}
                    placeholder={isAm ? 'ለምሳሌ፡ አበበ ባልቻ' : 'e.g. Abebe Balcha'}
                  />

                  {/* 2. Username & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block">
                        {isAm ? 'የተጠቃሚ ስም (አማራጭ)' : 'Username (Optional)'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                          @
                        </span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="username"
                          className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border dark:bg-slate-800 dark:text-slate-100 outline-none focus:ring-2 ${
                            formErrors.username
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-slate-300 dark:border-slate-700 focus:ring-[#005BAC]'
                          }`}
                        />
                      </div>
                      {formErrors.username && (
                        <p className="text-red-600 dark:text-red-400 text-[11px]">{formErrors.username}</p>
                      )}
                    </div>

                    {!isAdministrator && !isInvestigator && (
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block">
                          {isAm ? 'ጾታ (አማራጭ)' : 'Gender (Optional)'}
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]"
                        >
                          <option value="Male">{isAm ? 'ወንድ' : 'Male'}</option>
                          <option value="Female">{isAm ? 'ሴት' : 'Female'}</option>
                          <option value="Other">{isAm ? 'ሌላ' : 'Other'}</option>
                          <option value="Prefer not to say">{isAm ? 'መግለጽ አልፈልግም' : 'Prefer not to say'}</option>
                        </select>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* 3. Email & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormalEmailInput
                  label={isInstitution ? (isAm ? 'የተቋም ይፋዊ ኢሜይል' : 'Official Contact Email') : (isAm ? 'የኢሜይል አድራሻ' : 'Email Address')}
                  required
                  value={email}
                  onChange={setEmail}
                  placeholder="name@domain.com"
                />

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    {isInstitution ? (isAm ? 'የተቋም ይፋዊ ስልክ' : 'Official Contact Phone') : (isAm ? 'የስልክ ቁጥር' : 'Phone Number')}
                  </label>
                  <InternationalPhoneInput
                    value={phone}
                    onChange={setPhone}
                    error={formErrors.phone}
                    placeholder="912 345 678"
                  />
                </div>
              </div>

              {/* 4. Date of Birth for Citizens */}
              {isCitizen && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    {isAm ? 'የትውልድ ቀን (አማራጭ)' : 'Date of Birth (Optional)'}
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]"
                  />
                </div>
              )}

              {/* 5. Cascading Region & Zone Combobox */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <RegionZoneSelector
                  selectedRegion={region}
                  selectedZone={zone}
                  onRegionChange={setRegion}
                  onZoneChange={setZone}
                  customZoneValue={customZone}
                  onCustomZoneChange={setCustomZone}
                  layout="grid"
                  size="md"
                />

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isInstitution
                      ? (isAm ? 'ክፍለ ከተማ / ቢሮ / ቀበሌ' : 'Sub-City / Office District / Kebele')
                      : (isAm ? 'ክፍለ ከተማ / ወረዳ / ቀበሌ (አማራጭ)' : 'Sub-city / Woreda / Kebele (Optional)')}
                  </label>
                  <input
                    type="text"
                    value={subCity}
                    onChange={(e) => setSubCity(e.target.value)}
                    placeholder={isAm ? 'ለምሳሌ፡ ወረዳ 04 ወይም ፍለገ ህይወት አካባቢ' : 'e.g. Woreda 04 or Felege Hiwot Area'}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-[#005BAC]"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                >
                  {isAm ? 'ሰርዝ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl shadow cursor-pointer transition-colors"
                >
                  {isAm ? 'የመገለጫ ለውጦችን አስቀምጥ' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. TIP DETAILS & MESSAGING MODAL */}
      {/* ======================================================== */}
      {selectedTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#005BAC] dark:text-blue-400 text-sm">
                    {selectedTip.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                      selectedTip.status
                    )}`}
                  >
                    {selectedTip.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                  {selectedTip.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTip(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs sm:text-sm">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isAm ? 'ምድብ' : 'Category'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTip.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isAm ? 'ቅድሚያ' : 'Priority'}</span>
                  <span className={`inline-block font-bold mt-0.5 ${selectedTip.priority === 'Critical' ? 'text-red-600' : 'text-blue-600'}`}>
                    {selectedTip.priority}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isAm ? 'አካባቢ / ዞን' : 'Location / Zone'}</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedTip.zone || selectedTip.region}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isAm ? 'የቀረበበት ቀን' : 'Submitted Date'}</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedTip.createdAt}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                  {isAm ? 'የጥቆማው ዝርዝር መግለጫ እና ማብራሪያ' : 'Report Description & Narrative'}
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">
                  {selectedTip.description}
                </div>
              </div>

              {/* Evidence Files */}
              {selectedTip.evidence && selectedTip.evidence.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{isAm ? `የማስረጃ ፋይሎች (${selectedTip.evidence.length})` : `Evidence Attachments (${selectedTip.evidence.length})`}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTip.evidence.map((ev, idx) => (
                      <div
                        key={ev.id || idx}
                        className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-300 font-bold uppercase text-[10px]">
                            {ev.type}
                          </span>
                          <div className="truncate">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{ev.name}</p>
                            <p className="text-[10px] text-slate-400">{ev.size || (isAm ? 'አባሪ ፋይል' : 'Attachment')}</p>
                          </div>
                        </div>

                        {ev.url && (
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 shrink-0"
                            title={isAm ? 'ማስረጃውን አውርድ/ክፈት' : 'Download/Open Evidence'}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Investigation Findings / Editorial Updates (if any) */}
              {selectedTip.investigationFindings && (
                <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1">
                  <h4 className="font-bold text-teal-900 dark:text-teal-300 text-xs flex items-center space-x-1.5">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                    <span>{isAm ? 'የአሚኮ ኤዲቶሪያል እና የምርመራ ግኝቶች' : 'AMECO Editorial & Investigation Findings'}</span>
                  </h4>
                  <p className="text-xs text-teal-800 dark:text-teal-200 leading-relaxed">
                    {selectedTip.investigationFindings}
                  </p>
                </div>
              )}

              {/* Secure Messages Thread between Citizen and Investigator */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#005BAC]" />
                  <span>{isAm ? 'ደህንነቱ የተጠበቀ የመገናኛ መስመር (ምስጢራዊ)' : 'Secure Communication Channel (Confidential)'}</span>
                </h4>

                {/* Messages Box */}
                <div className="h-44 overflow-y-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                  {messages.filter((m) => m.reportId === selectedTip.id).length === 0 ? (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                      <p>{isAm ? 'በዚህ ጉዳይ ላይ እስካሁን ምንም መልዕክት የለም።' : 'No messages yet on this case.'}</p>
                      <p className="text-[11px] mt-0.5">{isAm ? 'ምስጢራዊ ጥያቄ ወይም ተጨማሪ ማስረጃ ከዚህ በታች መላክ ይችላሉ።' : 'Send a confidential inquiry or supplementary evidence update below.'}</p>
                    </div>
                  ) : (
                    messages
                      .filter((m) => m.reportId === selectedTip.id)
                      .map((msg) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-md p-2.5 rounded-xl text-xs ${
                                isMe
                                  ? 'bg-[#005BAC] text-white rounded-br-none'
                                  : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-bl-none shadow-xs'
                              }`}
                            >
                              <p className="font-bold text-[10px] opacity-75 mb-0.5">
                                {isMe ? (isAm ? 'እርስዎ (ዜጋ)' : 'You (Citizen)') : msg.senderDisplayName || (isAm ? 'የአሚኮ መርማሪ' : 'AMECO Investigator')}
                              </p>
                              {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                              <MessageAttachment attachment={msg.attachment} />
                            </div>
                            <span className="text-[9px] text-slate-400 mt-0.5 font-mono">
                              {msg.timestamp}
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>

                {/* Send Message Input or Locked Notice */}
                {onSendMessage && (() => {
                  const isAssigned = Boolean(
                    selectedTip.assignedTo?.department ||
                    selectedTip.assignedTo?.responsiblePersonId ||
                    ['Assigned', 'Investigation in Progress', 'Waiting for Citizen Response', 'Investigation Completed', 'Published'].includes(selectedTip.status)
                  );

                  if (!isAssigned) {
                    return (
                      <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center space-x-2.5 text-xs text-amber-900 dark:text-amber-200">
                        <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="text-[11px] leading-tight">
                          {isAm
                            ? 'የውይይት መስመሩ የሚከፈተው አስተዳዳሪ ለዚህ ሪፖርት መርማሪ ከመደበ በኋላ ነው።'
                            : 'Chat channel will open after an administrator assigns an investigator to this report.'}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <ChatComposer
                      onSend={(text, attachment) => onSendMessage(selectedTip.id, text, attachment)}
                      placeholder={isAm ? 'ለመረጃ መርማሪው ሚስጥራዊ ምላሽ ወይም ዝማኔ ይጻፉ...' : 'Type a confidential update or response to the investigator...'}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. ACCOUNT DELETION CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                  {isAm ? 'የአካውንት መሰረዝን ያረጋግጡ' : 'Confirm Account Deletion'}
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                  {isAm ? 'ቋሚ እርምጃ እና የመዳረሻ መሰረዝ' : 'Permanent Action & Access Revocation'}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-200 space-y-2 leading-relaxed">
              <p>
                <strong>{isAm ? 'ማስጠንቀቂያ:' : 'Warning:'}</strong>{' '}
                {isAm
                  ? 'አካውንትዎን መሰረዝ ወዲያውኑ የመግቢያ ፈቃድዎን፣ የግል ዳሽቦርድዎን እና ቀጥተኛ የሁለትዮሽ መልዕክት መለዋወጫ መዳረሻዎን ይሰርዛል።'
                  : 'Deleting your account will immediately revoke your authentication credentials, personal dashboard, and direct two-way messaging access.'}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                <strong>{isAm ? 'የህጋዊ ኦዲት አያያዝ:' : 'Legal Audit Retention:'}</strong>{' '}
                {isAm
                  ? 'ቀደም ሲል የቀረቡ ማናቸውም የምርመራ ሪፖርቶች እና ተዛማጅ ማስረጃዎች በውሂብ አያያዝ ፖሊሲ መሰረት ለኤዲቶሪያል፣ ለጋዜጠኝነት እና ለህጋዊ ተገዢነት በደህንነት ተቀምጠው ይቀራሉ።'
                  : 'Any previously submitted investigative reports and associated evidence files will be securely preserved for editorial, journalistic, and legal compliance in accordance with data retention policies.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isAm ? (
                  <>ለማረጋገጥ <code>DELETE</code> ብለው ይተይቡ:</>
                ) : (
                  <>Type <code>DELETE</code> to confirm:</>
                )}
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                {isAm ? 'ሰርዝ' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                onClick={handleConfirmAccountDeletion}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow transition-colors cursor-pointer"
              >
                {isAm ? 'የአካውንት መሰረዝን አረጋግጥ' : 'Confirm Account Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
