import React from 'react';
import { UserProfile, UserRole } from '../types';
import { UserCheck, Shield, ShieldCheck, User, Sparkles, Check, X } from 'lucide-react';

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#005BAC] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-800 rounded-lg">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Interactive Persona & Role Switcher</h3>
              <p className="text-xs text-blue-100">Test SRS Workflows across Citizen, Admin & Investigator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            Select a verified demo persona below to immediately access role-specific dashboards, permission constraints, and identity privacy controls specified in the SRS.
          </p>

          <div className="space-y-3">
            {users.map((user) => {
              const isSelected = user.id === currentUser.id;
              
              let roleBadgeColor = 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
              let icon = <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
              
              if (user.role === 'Administrator') {
                roleBadgeColor = 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
                icon = <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400" />;
              } else if (user.role === 'ResponsiblePerson') {
                roleBadgeColor = 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800';
                icon = <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
              }

              return (
                <div
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[#005BAC] bg-blue-50/60 dark:bg-blue-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#005BAC] text-white flex items-center justify-center font-extrabold text-lg border-2 border-white dark:border-slate-800 shadow-sm shrink-0">
                      {user.fullName ? user.fullName.trim().charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{user.fullName}</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        ID: {user.id} {user.department ? `• ${user.department}` : `• ${user.zone}`}
                      </p>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="p-1.5 bg-[#005BAC] text-white rounded-full">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
