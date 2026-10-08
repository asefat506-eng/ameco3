import React, { useState, useEffect } from 'react';
import { UserProfile, NotificationItem } from '../types.ts';
import { AmecoLogo } from './AmecoLogo.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { NotificationDropdown } from './NotificationDropdown.tsx';
import {
  Bell,
  LogOut,
  Menu,
  ShieldCheck,
  Radio,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications?: NotificationItem[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onSelectNotification?: (notif: NotificationItem) => void;
  onOpenSubmitModal: (type?: 'news' | 'tipoff') => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectNotification,
  onOpenSubmitModal,
  onLogout,
  onToggleSidebar,
}) => {
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { toggleTheme, isDark } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const isGuest =
    currentUser.id.startsWith('GUEST-') ||
    currentUser.fullName === 'Anonymous Guest' ||
    currentUser.isGuest;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNotificationSelect = (notif: NotificationItem) => {
    if (onMarkAsRead) {
      onMarkAsRead(notif.id);
    }
    if (onSelectNotification) {
      onSelectNotification(notif);
    } else {
      setActiveTab('notifications');
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 text-slate-900 dark:text-white ${
        scrolled
          ? 'bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-slate-200 dark:border-zinc-800 shadow-xl'
          : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-md'
      }`}
    >
      {/* Top Ticker Micro-Bar */}
      <div
        className={`h-8 overflow-hidden bg-slate-100 dark:bg-black/90 border-b border-slate-200 dark:border-zinc-800/80 px-4 py-1 text-slate-700 dark:text-zinc-300 transition-opacity duration-200 ${
          scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center space-x-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                LIVE PORTAL
              </span>
            </span>
            <span className="hidden sm:inline text-slate-400 dark:text-zinc-600">•</span>
            <span className="hidden sm:inline text-slate-700 dark:text-zinc-300 truncate max-w-md">
              {t('app.title')} — {t('app.subtitle')}
            </span>
          </div>

          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span className="text-slate-700 dark:text-zinc-300 flex items-center space-x-1">
              <Radio className="w-3 h-3 text-red-500" />
              <span>
                Role: <strong className="text-slate-900 dark:text-white">{currentUser.role}</strong>
              </span>
            </span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span className="text-slate-700 dark:text-zinc-300 font-mono text-[10px] flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>256-Bit SSL Secured</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Sidebar Menu Toggle + Brand Logo */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-navbar-menu-toggle"
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-900 dark:text-white transition-all focus:outline-none flex items-center space-x-2 border border-slate-200 dark:border-zinc-800 cursor-pointer shadow-xs"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-900 dark:text-white" />
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 hidden sm:inline">Menu</span>
            </button>

            <div
              className="cursor-pointer flex items-center space-x-2 group"
              onClick={() => setActiveTab('home')}
            >
              <AmecoLogo size="md" />
            </div>
          </div>

          {/* Right Action Tools & Profile Badge */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Language Switcher Button */}
            <button
              id="btn-language-switcher"
              onClick={toggleLanguage}
              className="px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition-all flex items-center space-x-1.5 focus:outline-none cursor-pointer"
              title={language === 'en' ? 'ለማስቀየር ወደ አማርኛ ጠቅ ያድርጉ' : 'Switch language to English'}
            >
              <Globe className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
              <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {language === 'en' ? 'EN' : 'አማ'}
              </span>
            </button>

            {/* Global Theme Toggle Button */}
            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center space-x-1 focus:outline-none shadow-xs cursor-pointer"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold text-zinc-200 hidden xl:inline ml-1">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="text-[11px] font-bold text-slate-800 hidden xl:inline ml-1">Dark</span>
                </>
              )}
            </button>

            {/* Notification Bell with Dropdown (Visible for authenticated non-guest users) */}
            {!isGuest && (
              <div className="relative">
                <button
                  id="btn-notification-bell"
                  onClick={() => setNotificationDropdownOpen((prev) => !prev)}
                  className={`relative p-2 rounded-xl transition-all border cursor-pointer ${
                    notificationDropdownOpen
                      ? 'bg-[#005BAC] text-white border-[#005BAC] ring-2 ring-[#005BAC]/30'
                      : 'bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
                  aria-label="Open notifications menu"
                >
                  <Bell className={`w-4 h-4 transition-transform duration-200 ${unreadCount > 0 ? 'text-slate-900 dark:text-white' : ''}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black rounded-full min-w-4 h-4 px-1 flex items-center justify-center border border-white dark:border-zinc-900 shadow-xs animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <NotificationDropdown
                  isOpen={notificationDropdownOpen}
                  onClose={() => setNotificationDropdownOpen(false)}
                  currentUser={currentUser}
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={(id) => {
                    if (onMarkAsRead) onMarkAsRead(id);
                  }}
                  onMarkAllAsRead={() => {
                    if (onMarkAllAsRead) onMarkAllAsRead();
                  }}
                  onNavigateToNotificationsPage={() => {
                    setActiveTab('notifications');
                  }}
                  onSelectNotification={handleNotificationSelect}
                />
              </div>
            )}

            {/* User Persona Profile Badge or Guest Login / Register */}
            {!isGuest ? (
              <button
                id="btn-my-profile-nav"
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-900 dark:text-white border px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all shadow-xs cursor-pointer ${
                  activeTab === 'profile'
                    ? 'border-slate-800 dark:border-white ring-1 ring-slate-800 dark:ring-white'
                    : 'border-slate-200 dark:border-zinc-800'
                }`}
                title={t('nav.myProfile', 'My Profile')}
              >
                <div className="w-7 h-7 rounded-full bg-[#005BAC] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  {currentUser.fullName ? currentUser.fullName.trim().charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="font-bold text-xs leading-none truncate max-w-[100px] text-slate-900 dark:text-zinc-100">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                    {currentUser.role}
                  </div>
                </div>
              </button>
            ) : (
              <button
                id="btn-guest-login-nav"
                onClick={onLogout}
                className="px-3.5 py-2 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
              >
                Login / Register
              </button>
            )}

            {/* Logout Button for logged in users */}
            {!isGuest && (
              <button
                id="btn-logout-nav"
                onClick={onLogout}
                className="p-2 text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
                title={t('nav.logout', 'Logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
