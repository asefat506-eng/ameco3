import React from 'react';
import { NotificationItem } from '../types';
import { Bell, Check, Trash2, X, AlertCircle, Info, MessageSquare, ShieldAlert } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearNotifications,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-[#005BAC] text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-amber-300" />
              <h2 className="font-bold text-base">AMECO System Notifications</h2>
            </div>
            <button onClick={onClose} className="p-1 text-blue-200 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls */}
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span>{notifications.filter((n) => !n.read).length} unread</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={onMarkAllAsRead}
                className="hover:text-[#005BAC] dark:hover:text-blue-400 font-medium flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
              <button
                onClick={onClearNotifications}
                className="hover:text-red-600 dark:hover:text-red-400 font-medium flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No notifications at this time.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    n.read
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
                      : 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2.5">
                      {n.type === 'submission' && <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />}
                      {n.type === 'message' && <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />}
                      {n.type === 'status_update' && <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />}
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100">{n.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1.5 block">{n.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            AMECO Secure Tip-Off Notification Engine
          </div>
        </div>
      </div>
    </div>
  );
};
