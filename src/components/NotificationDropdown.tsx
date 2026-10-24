import React, { useRef, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  UserCheck,
  AlertCircle,
  Newspaper,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { NotificationItem, UserProfile } from '../types.ts';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateToNotificationsPage: () => void;
  onSelectNotification: (notif: NotificationItem) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  currentUser,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateToNotificationsPage,
  onSelectNotification,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter notifications strictly for current user
  const userNotifications = notifications.filter(
    (n) => n.recipientId === currentUser.id || n.userId === currentUser.id
  );

  // Sort newest first & take top 6 for dropdown
  const recentNotifications = [...userNotifications]
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
    .slice(0, 6);

  const getIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'assignment':
        return <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'verification':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'publication':
        return <Newspaper className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'status_update':
        return <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'system':
      default:
        return <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
    <div
      ref={dropdownRef}
      id="notification-dropdown-menu"
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-fadeIn"
      style={{ transformOrigin: 'top right' }}
    >
      {/* Dropdown Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#005BAC]/10 text-[#005BAC] dark:text-blue-400 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#005BAC] text-white">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            id="btn-mark-all-read-dropdown"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAllAsRead();
            }}
            className="flex items-center space-x-1 text-[11px] font-semibold text-[#005BAC] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {recentNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No notifications yet
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              You will receive updates when incident status changes or messages arrive.
            </p>
          </div>
        ) : (
          recentNotifications.map((item) => {
            const isRead = item.isRead ?? item.read;
            return (
              <div
                key={item.id}
                id={`dropdown-notif-item-${item.id}`}
                onClick={() => {
                  onSelectNotification(item);
                  onClose();
                }}
                className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start space-x-3 ${
                  !isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${
                    !isRead
                      ? 'bg-blue-100/70 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-xs truncate ${
                        !isRead
                          ? 'font-bold text-slate-900 dark:text-white'
                          : 'font-medium text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.title}
                    </h4>
                    {!isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#005BAC] flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.timestamp || item.createdAt}</span>
                    </span>

                    {item.relatedTipId && (
                      <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 text-[9px]">
                        #{item.relatedTipId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dropdown Footer: View All Notifications */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-center">
        <button
          id="btn-view-all-notifications"
          onClick={() => {
            onNavigateToNotificationsPage();
            onClose();
          }}
          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#005BAC] dark:text-blue-400 text-xs font-bold border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center space-x-1.5 shadow-2xs"
        >
          <span>View All Notifications</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
