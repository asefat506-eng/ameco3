import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  UserCheck,
  AlertCircle,
  Newspaper,
  CheckCheck,
  Trash2,
  Search,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { NotificationItem, UserProfile } from '../../types.ts';

interface NotificationsPageProps {
  currentUser: UserProfile;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification?: (id: string) => void;
  onNavigateToTip?: (tipId: string) => void;
  onNavigateToMessages?: (tipId?: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  currentUser,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNavigateToTip,
  onNavigateToMessages,
  onNavigateTab,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter notifications belonging to the current user
  const userNotifications = useMemo(() => {
    return notifications.filter(
      (n) => n.recipientId === currentUser.id || n.userId === currentUser.id
    );
  }, [notifications, currentUser.id]);

  const unreadCount = useMemo(() => {
    return userNotifications.filter((n) => !(n.isRead ?? n.read)).length;
  }, [userNotifications]);

  const filteredNotifications = useMemo(() => {
    return userNotifications.filter((n) => {
      const isRead = n.isRead ?? n.read;
      // Tab filter
      if (filterType === 'unread' && isRead) return false;
      if (filterType === 'read' && !isRead) return false;
      if (filterType !== 'all' && filterType !== 'unread' && filterType !== 'read' && n.type !== filterType) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesMessage = n.message.toLowerCase().includes(query);
        const matchesTip = n.relatedTipId ? n.relatedTipId.toLowerCase().includes(query) : false;
        return matchesTitle || matchesMessage || matchesTip;
      }

      return true;
    });
  }, [userNotifications, filterType, searchQuery]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'assignment':
        return <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'verification':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'publication':
        return <Newspaper className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'status_update':
        return <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'system':
      default:
        return <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!(item.isRead ?? item.read)) {
      onMarkAsRead(item.id);
    }

    if (item.type === 'message' && onNavigateToMessages) {
      onNavigateToMessages(item.relatedTipId);
    } else if (item.relatedTipId && onNavigateToTip) {
      onNavigateToTip(item.relatedTipId);
    } else if (onNavigateTab) {
      if (currentUser.role === 'Administrator') {
        onNavigateTab('admin-overview');
      } else if (currentUser.role === 'ResponsiblePerson') {
        onNavigateTab('investigator');
      } else {
        onNavigateTab('my-submissions');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#005BAC] dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#005BAC] text-white">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time updates regarding incident submissions, assignments, editorial reviews, and messages.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                id="btn-mark-all-read-page"
                onClick={onMarkAllAsRead}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-[#005BAC] dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-800 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs scrollbar-none">
            {[
              { id: 'all', label: 'All', count: userNotifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'submission', label: 'Submissions' },
              { id: 'assignment', label: 'Assignments' },
              { id: 'status_update', label: 'Status Updates' },
              { id: 'message', label: 'Messages' },
              { id: 'verification', label: 'Verifications' },
              { id: 'publication', label: 'Publications' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`filter-tab-${tab.id}`}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  filterType === tab.id
                    ? 'bg-[#005BAC] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      filterType === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="notification-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005BAC] dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Bell className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No notifications found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `No notifications match "${searchQuery}". Try clearing your search or filter.`
                : filterType === 'unread'
                ? "You're all caught up! No unread notifications at this time."
                : 'You have not received any notifications in this category yet.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isRead = notif.isRead ?? notif.read;
            return (
              <div
                key={notif.id}
                id={`notification-card-${notif.id}`}
                className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 transition-all hover:shadow-md cursor-pointer ${
                  !isRead
                    ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border ${
                        !isRead
                          ? 'bg-blue-100/60 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h4
                          className={`text-sm ${
                            !isRead
                              ? 'font-bold text-slate-900 dark:text-white'
                              : 'font-semibold text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {notif.title}
                        </h4>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#005BAC] flex-shrink-0" />
                        )}
                        {notif.relatedTipId && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <span>#{notif.relatedTipId}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center space-x-3 mt-3 text-[11px] text-slate-400 dark:text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{notif.timestamp || notif.createdAt}</span>
                        </span>
                        <span>•</span>
                        <span className="capitalize">{notif.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions right */}
                  <div
                    className="flex items-center space-x-2 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!isRead ? (
                      <button
                        id={`btn-mark-read-${notif.id}`}
                        onClick={() => onMarkAsRead(notif.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#005BAC] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5">
                        Read
                      </span>
                    )}

                    {onDeleteNotification && (
                      <button
                        id={`btn-delete-notif-${notif.id}`}
                        onClick={() => onDeleteNotification(notif.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      id={`btn-open-notif-${notif.id}`}
                      onClick={() => handleNotificationClick(notif)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Open related incident"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Privacy Notice */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
        <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span>
          <strong>Security Notice:</strong> All notifications are cryptographically secured and bound strictly to your authenticated session. No private case details are ever exposed across user accounts.
        </span>
      </div>
    </div>
  );
};
