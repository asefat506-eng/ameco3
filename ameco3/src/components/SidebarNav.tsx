import React from 'react';
import { UserProfile } from '../types.ts';
import { AmecoLogo } from './AmecoLogo.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  FileText,
  LogOut,
  X,
  ShieldCheck,
  UserCheck,
  Home,
  BarChart3,
  Users,
  Lock,
  Briefcase,
  Building2,
  Sun,
  Moon,
  ChevronRight,
  Globe,
  HelpCircle,
  Radio,
  PlusCircle,
  MessageSquare,
  Newspaper,
  Compass,
  Bell,
  CheckCircle2,
  LogIn,
} from 'lucide-react';

interface SidebarNavProps {
  currentUser: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenSubmitModal: (type?: 'news' | 'tipoff') => void;
  unreadCount?: number;
  onLogout: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onOpenSubmitModal,
  unreadCount = 0,
  onLogout,
}) => {
  const { toggleTheme, isDark } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  if (!isOpen) return null;

  const isGuest =
    currentUser.id.startsWith('GUEST-') ||
    currentUser.fullName === 'Anonymous Guest' ||
    currentUser.isGuest;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-xs sm:max-w-sm bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300">
          {/* Sidebar Top Header */}
          <div>
            <div className="p-4 bg-slate-100 dark:bg-black flex items-center justify-between border-b border-slate-200 dark:border-zinc-800">
              <AmecoLogo size="sm" />
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-200 dark:bg-zinc-900 hover:bg-slate-300 dark:hover:bg-zinc-800 text-slate-900 dark:text-white transition-colors border border-slate-300 dark:border-zinc-800"
                title="Close Navigation Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Persona Card */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center space-x-3">
                {isGuest ? (
                  <div className="w-11 h-11 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    GST
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#005BAC] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    {currentUser.fullName
                      ? currentUser.fullName.trim().charAt(0).toUpperCase()
                      : 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {currentUser.fullName}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700">
                      {isGuest ? 'Guest User' : currentUser.role}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono truncate">
                      {currentUser.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
              {/* 1. GUEST USER MENU */}
              {isGuest && (
                <div className="space-y-1.5">
                  <span className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold block mb-2">
                    Guest Navigation
                  </span>

                  <button
                    onClick={() => {
                      setActiveTab('home');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'home'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Home className="w-4 h-4" />
                      <span>{t('nav.dashboard', 'Dashboard')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenSubmitModal('tipoff');
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                  >
                    <div className="flex items-center space-x-2.5">
                      <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Submit Anonymous Tip</span>
                    </div>
                    <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 bg-emerald-200/70 dark:bg-emerald-800/80 rounded">
                      Secure
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('track');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'track'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Compass className="w-4 h-4" />
                      <span>Track Anonymous Tip</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('published-reports');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'published-reports'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Newspaper className="w-4 h-4" />
                      <span>{t('nav.publishedReports', 'Published Reports')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('faq');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'faq'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>{t('nav.helpFaq', 'Help & FAQ')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </div>
              )}

              {/* 2. REGISTERED CITIZEN MENU */}
              {currentUser.role === 'Citizen' && !isGuest && (
                <div className="space-y-1.5">
                  <span className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold block mb-2">
                    Citizen Navigation
                  </span>

                  {/* 1. Dashboard */}
                  <button
                    onClick={() => {
                      setActiveTab('home');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'home'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Home className="w-4 h-4" />
                      <span>{t('nav.dashboard', 'Dashboard')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* 2. Submit Incident */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSubmitModal('tipoff');
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                  >
                    <div className="flex items-center space-x-2.5">
                      <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('nav.submitIncident', 'Submit Incident')}</span>
                    </div>
                    <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 bg-emerald-200/70 dark:bg-emerald-800/80 rounded">
                      New
                    </span>
                  </button>

                  {/* 3. My Submissions */}
                  <button
                    onClick={() => {
                      setActiveTab('my-submissions');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'my-submissions'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <FileText className="w-4 h-4" />
                      <span>{t('nav.mySubmissions', 'My Submissions')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* 4. Track Submission */}
                  <button
                    onClick={() => {
                      setActiveTab('track');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'track'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Compass className="w-4 h-4" />
                      <span>{t('nav.trackSubmission', 'Track Submission')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* 5. Messages */}
                  <button
                    onClick={() => {
                      setActiveTab('messages');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'messages'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>{t('nav.messages', 'Messages')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* 6. Notifications */}
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'notifications'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Bell className="w-4 h-4" />
                      <span>{t('nav.notifications', 'Notifications')}</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#005BAC] text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* 7. My Profile */}
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'profile'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <UserCheck className="w-4 h-4" />
                      <span>{t('nav.myProfile', 'My Profile')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* 8. Published Reports */}
                  <button
                    onClick={() => {
                      setActiveTab('published-reports');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'published-reports'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Newspaper className="w-4 h-4" />
                      <span>{t('nav.publishedReports', 'Published Reports')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* 9. Help & FAQ */}
                  <button
                    onClick={() => {
                      setActiveTab('faq');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'faq'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>{t('nav.helpFaq', 'Help & FAQ')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </div>
              )}

              {/* 3. INVESTIGATOR MENU */}
              {currentUser.role === 'ResponsiblePerson' && (
                <div className="space-y-1.5">
                  <span className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold block mb-2">
                    Investigator Console
                  </span>

                  <button
                    onClick={() => {
                      setActiveTab('investigator');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'investigator'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-md'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Briefcase className="w-4 h-4" />
                      <span>Dashboard & Assigned Tips</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* Admin Chat */}
                  <button
                    id="btn-investigator-nav-admin-chat"
                    onClick={() => {
                      setActiveTab('investigator-admin-chat');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'investigator-admin-chat'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-md'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <MessageSquare className="w-4 h-4 text-amber-500" />
                      <span>{t('nav.adminChat', 'Admin Chat')}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      Live
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'notifications'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-md'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#005BAC] text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('published-reports');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'published-reports'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-md'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Newspaper className="w-4 h-4" />
                      <span>Published Reports</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('faq');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'faq'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-md'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>Help & Protocol FAQ</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    id="btn-investigator-nav-profile"
                    onClick={() => {
                      setActiveTab('profile');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'profile'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-md'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <UserCheck className="w-4 h-4" />
                      <span>{t('nav.myProfile', 'Profile')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </div>
              )}

              {/* 4. ADMINISTRATOR MENU */}
              {currentUser.role === 'Administrator' && (
                <div className="space-y-1.5">
                  <span className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold block mb-2">
                    Administrator Controls
                  </span>

                  <button
                    id="btn-admin-nav-overview"
                    onClick={() => {
                      setActiveTab('admin-overview');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'admin-overview'
                        ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-white font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <BarChart3 className="w-4 h-4" />
                      <span>Dashboard & Tip Review</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    id="btn-admin-nav-investigators"
                    onClick={() => {
                      setActiveTab('investigators');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'investigators' || activeTab === 'admin-messages'
                        ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-white font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <UserCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      <span>Investigators</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-mono">
                        Directory & Chat
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </button>

                  <button
                    id="btn-admin-nav-institutions"
                    onClick={() => {
                      setActiveTab('institutions');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'institutions' || activeTab === 'institutions-management' || activeTab === 'admin-institutions'
                        ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-white font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Building2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      <span>Publishers</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono">
                        Directory & Chat
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </button>

                  <button
                    id="btn-admin-nav-users"
                    onClick={() => {
                      setActiveTab('users-management');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'users-management'
                        ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-white font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Users className="w-4 h-4" />
                      <span>Users & RBAC Controls</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'notifications'
                        ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-white font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#005BAC] text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('published-reports');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'published-reports'
                        ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-white font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Newspaper className="w-4 h-4" />
                      <span>Published Reports</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('analytics');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'analytics'
                        ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-white font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <BarChart3 className="w-4 h-4" />
                      <span>Reports & Analytics</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('audit-logs');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'audit-logs'
                        ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-white font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Lock className="w-4 h-4" />
                      <span>Immutable Audit Logs</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    id="btn-admin-nav-profile"
                    onClick={() => {
                      setActiveTab('profile');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'profile'
                        ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-white font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <UserCheck className="w-4 h-4" />
                      <span>Profile</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </div>
              )}

              {/* 5. INSTITUTION PORTAL */}
              {(currentUser.role === 'Institution' || currentUser.role === 'Publisher') && (
                <div className="space-y-1.5">
                  <span className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold block mb-2">
                      {currentUser.role === 'Publisher' ? 'Publisher Portal' : 'Institution Portal'}
                  </span>

                  <button
                    id="btn-institution-nav-portal"
                    onClick={() => {
                      setActiveTab('institution-portal');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'institution-portal'
                        ? 'bg-[#005BAC] text-white font-bold shadow-md'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Radio className="w-4 h-4" />
                      <span>Publish Trending News</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    id="btn-institution-nav-admin-chat"
                    onClick={() => {
                      setActiveTab('institution-admin-chat');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'institution-admin-chat'
                        ? 'bg-[#005BAC] text-white font-bold shadow-md'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span>Admin Communications</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-mono">
                        Direct Line
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('published-reports');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'published-reports'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-md'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Newspaper className="w-4 h-4" />
                      <span>Published Reports</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    id="btn-institution-nav-profile"
                    onClick={() => {
                      setActiveTab('profile');
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTab === 'profile'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-md'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <UserCheck className="w-4 h-4" />
                      <span>Profile</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Bottom Toolbar with Login / Logout */}
          <div className="p-4 bg-slate-100 dark:bg-black border-t border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="py-2 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <Globe className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
                <span>{language === 'en' ? 'English' : 'አማርኛ'}</span>
              </button>

              {/* Theme Switcher */}
              <button
                onClick={toggleTheme}
                className="py-2 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-center space-x-1.5 shadow-xs"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                <span>{isDark ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            {/* Login or Logout */}
            {isGuest ? (
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#005BAC] hover:bg-blue-800 text-white text-xs font-extrabold flex items-center justify-center space-x-2 transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Login / Sign Up</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold flex items-center justify-center space-x-2 transition-colors shadow-sm"
                title={t('nav.logout', 'Logout')}
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.logout', 'Logout')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
