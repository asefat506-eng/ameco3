import React, { useState, useMemo } from 'react';
import { UserProfile, ReportItem, TrendingNewsItem, NotificationItem } from '../../types';
import {
  FileText,
  Shield,
  Eye,
  Lock,
  Radio,
  MapPin,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Building2,
  Bell,
  CheckCheck,
  MessageSquare,
  UserCheck,
  AlertCircle,
  Newspaper,
  ArrowRight,
  Clock,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface CitizenHomeProps {
  currentUser: UserProfile;
  reports: ReportItem[];
  trendingNews?: TrendingNewsItem[];
  notifications?: NotificationItem[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onOpenSubmitModal: (type?: 'news' | 'tipoff') => void;
  onNavigateTab: (tab: string, reportId?: string) => void;
  onSelectNotification?: (notif: NotificationItem) => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({
  currentUser,
  reports,
  trendingNews = [],
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onOpenSubmitModal,
  onNavigateTab,
  onSelectNotification,
}) => {
  const userSubmissions = useMemo(() => {
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

  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'status_update' | 'message'>('all');

  const isGuest =
    currentUser.id.startsWith('GUEST-') ||
    currentUser.fullName === 'Anonymous Guest' ||
    currentUser.isGuest;

  // Filter notifications belonging to the current user
  const userNotifications = useMemo(() => {
    return notifications.filter(
      (n) => n.recipientId === currentUser.id || n.userId === currentUser.id
    );
  }, [notifications, currentUser.id]);

  const citizenUnreadCount = useMemo(() => {
    return userNotifications.filter((n) => !(n.isRead ?? n.read)).length;
  }, [userNotifications]);

  const filteredNotifications = useMemo(() => {
    return userNotifications.filter((n) => {
      const isRead = n.isRead ?? n.read;
      if (notificationFilter === 'unread') return !isRead;
      if (notificationFilter === 'status_update') return n.type === 'status_update' || n.type === 'assignment' || n.type === 'verification';
      if (notificationFilter === 'message') return n.type === 'message';
      return true;
    });
  }, [userNotifications, notificationFilter]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'assignment':
        return <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'verification':
        return <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'publication':
        return <Newspaper className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'status_update':
        return <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'system':
      default:
        return <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (onMarkAsRead && !(item.isRead ?? item.read)) {
      onMarkAsRead(item.id);
    }

    if (item.type === 'message') {
      onNavigateTab('messages', item.relatedTipId);
    } else if (item.relatedTipId) {
      onNavigateTab('track', item.relatedTipId);
    } else {
      onNavigateTab('notifications');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Notification Quick Alert Banner for Registered Citizens */}
      {!isGuest && citizenUnreadCount > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-blue-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full text-white">
                  Case Alert
                </span>
                <span className="text-xs font-mono font-bold text-blue-100">
                  {citizenUnreadCount} New Notification{citizenUnreadCount > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                {userNotifications.find((n) => !(n.isRead ?? n.read))?.title || 'You have updates regarding your confidential tip-off'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onMarkAllAsRead && (
              <button
                onClick={onMarkAllAsRead}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-colors border border-white/20 flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab('notifications')}
              className="px-3.5 py-1.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold shadow transition-all flex items-center space-x-1.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Hero / Portal Header - White in Light Mode, Black in Dark Mode */}
      <div className="relative overflow-hidden bg-white dark:bg-black rounded-3xl p-6 sm:p-10 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 shadow-lg dark:shadow-2xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-slate-100 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-slate-100 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-zinc-200">
            <Shield className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-300" />
            <span>Encrypted Identity Protection (RBAC)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            Amhara Media Corporation Citizen Journalism & Secure Tip-Off Portal
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
            Welcome, <span className="font-bold text-slate-900 dark:text-white">{currentUser.fullName}</span> (Citizen ID: <code className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-mono text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700">{currentUser.id}</code>). Report public-interest incidents, corruption, infrastructure emergencies, or community news directly to AMECO editors with optional complete identity confidentiality.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onOpenSubmitModal('news')}
              className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-extrabold px-5 py-2.5 rounded-xl shadow-md flex items-center space-x-2.5 transition-transform active:scale-95 text-sm cursor-pointer"
            >
              <FileText className="w-4 h-4 text-white dark:text-black" />
              <span>Submit News Report & Confidential Tip-Off</span>
            </button>

            <button
              onClick={() => onNavigateTab('track')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-white font-medium px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center space-x-2 text-sm cursor-pointer transition-colors"
            >
              <Eye className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
              <span>Track Submissions ({userSubmissions.length})</span>
            </button>

            {!isGuest && (
              <button
                onClick={() => onNavigateTab('notifications')}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-white font-medium px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center space-x-2 text-sm relative cursor-pointer transition-colors"
              >
                <Bell className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
                <span>Notifications</span>
                {citizenUnreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#005BAC] text-white text-[10px] font-bold rounded-full">
                    {citizenUnreadCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => onNavigateTab('faq')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center space-x-2 text-sm backdrop-blur-sm cursor-pointer transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
              <span>Help & Privacy Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Citizen Notifications & Case Activity Feed Section */}
      {!isGuest && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                    Notifications & Case Updates
                  </h2>
                  {citizenUnreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#005BAC] text-white">
                      {citizenUnreadCount} unread
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Live notifications regarding editorial triage, desk assignments, and confidential investigator messages
                </p>
              </div>
            </div>

            {/* Notification Filter Pills & Global Action */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-slate-200 dark:border-zinc-700/80 text-xs">
                <button
                  onClick={() => setNotificationFilter('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    notificationFilter === 'all'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  All ({userNotifications.length})
                </button>
                <button
                  onClick={() => setNotificationFilter('unread')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    notificationFilter === 'unread'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  Unread ({citizenUnreadCount})
                </button>
                <button
                  onClick={() => setNotificationFilter('status_update')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    notificationFilter === 'status_update'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  Case Status
                </button>
                <button
                  onClick={() => setNotificationFilter('message')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    notificationFilter === 'message'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  Messages
                </button>
              </div>

              {citizenUnreadCount > 0 && onMarkAllAsRead && (
                <button
                  onClick={onMarkAllAsRead}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-700 flex items-center space-x-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-[#005BAC]" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications Feed Cards */}
          {filteredNotifications.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 dark:bg-zinc-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
              <Bell className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                No notifications found
              </p>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                {notificationFilter === 'unread'
                  ? 'All notifications have been read.'
                  : 'You have no notifications matching this category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredNotifications.slice(0, 4).map((item) => {
                const isRead = item.isRead ?? item.read;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      !isRead
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 shadow-xs hover:border-blue-300'
                        : 'bg-slate-50/70 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 shadow-xs border border-slate-200 dark:border-zinc-700">
                            {getNotificationIcon(item.type)}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 block line-clamp-1">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{item.timestamp}</span>
                            </span>
                          </div>
                        </div>

                        {!isRead ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#005BAC] ring-4 ring-blue-100 dark:ring-blue-950 shrink-0 mt-1" />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Read</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-zinc-800/80 text-xs">
                      {item.relatedTipId ? (
                        <span className="font-mono text-[10px] font-bold text-[#005BAC] dark:text-blue-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                          {item.relatedTipId}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">System Alert</span>
                      )}

                      <div className="flex items-center space-x-2">
                        {onMarkAsRead && !isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(item.id);
                            }}
                            className="text-[10px] text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium"
                          >
                            Mark read
                          </button>
                        )}
                        <span className="text-[11px] font-bold text-[#005BAC] dark:text-blue-400 flex items-center space-x-0.5 group">
                          <span>{item.type === 'message' ? 'Open Chat' : 'Track Case'}</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {userNotifications.length > 4 && (
            <div className="pt-2 text-center border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => onNavigateTab('notifications')}
                className="text-xs font-bold text-[#005BAC] dark:text-blue-400 hover:underline inline-flex items-center space-x-1"
              >
                <span>View All {userNotifications.length} Notifications & Full Archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Core Capabilities & Privacy Guarantee */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-start space-x-4 card-hover-lift">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl shrink-0 border border-zinc-200 dark:border-zinc-700">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Identity Privacy Assurance</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
              Your personal name and contact info are visible ONLY to authorized AMECO Administrators by default. Assigned investigators identify you by Citizen ID only.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-start space-x-4 card-hover-lift">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl shrink-0 border border-zinc-200 dark:border-zinc-700">
            <Building2 className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Verified Institutional Bulletins</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
              Receive official press releases, public health alerts, and educational notices directly from accredited regional government bodies and universities.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-start space-x-4 card-hover-lift">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl shrink-0 border border-zinc-200 dark:border-zinc-700">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Direct Status Tracking</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
              Track your case in real time through 9 workflow milestones and communicate directly with assigned AMECO journalists via secure in-app messaging.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-zinc-400" />
          <span>Frequently Asked Questions (FAQ)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-zinc-300">
          <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200/80 dark:border-zinc-800">
            <h4 className="font-bold text-slate-900 dark:text-zinc-100 mb-1">Is my identity protected when submitting a tip-off?</h4>
            <p>Yes. By business rule, your personal identity (name, phone, email) is encrypted and visible ONLY to AMECO Administrators. Assigned investigators only see your unique Citizen ID (e.g. CZN-2026-00125).</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200/80 dark:border-zinc-800">
            <h4 className="font-bold text-slate-900 dark:text-zinc-100 mb-1">What formats of evidence can I upload?</h4>
            <p>You can attach JPG, PNG images, MP4 videos, MP3 audio recordings, and PDF or DOCX documents up to 100MB per file.</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200/80 dark:border-zinc-800">
            <h4 className="font-bold text-slate-900 dark:text-zinc-100 mb-1">How does AI processing assist my submission?</h4>
            <p>AI automatically analyzes text for category matching, spam filter, priority prediction, and executive summarization to help editors quickly assign investigators.</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200/80 dark:border-zinc-800">
            <h4 className="font-bold text-slate-900 dark:text-zinc-100 mb-1">How do I communicate with the investigator?</h4>
            <p>You can use the built-in encrypted-feeling messaging tab inside "My Reports & Tracking" to send clarifications and receive investigation progress updates safely.</p>
          </div>
        </div>
      </div>
    </div>
  );
};


