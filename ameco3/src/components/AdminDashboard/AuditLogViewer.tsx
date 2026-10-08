import React, { useState } from 'react';
import { AuditLogEntry } from '../../types';
import { ShieldCheck, Search, Clock, ShieldAlert, Eye, UserCheck, Key, Lock, Server, Download } from 'lucide-react';
import { exportAuditLogsToCSV } from '../../utils/csvExport';

interface AuditLogViewerProps {
  auditLogs: AuditLogEntry[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ auditLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const filteredLogs = auditLogs.filter((log) => {
    if (!log) return false;
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    const q = (searchQuery || '').toLowerCase();
    const matchesQuery =
      (log.actorName || '').toLowerCase().includes(q) ||
      (log.action || '').toLowerCase().includes(q) ||
      (log.details || '').toLowerCase().includes(q) ||
      (log.targetId && (log.targetId || '').toLowerCase().includes(q));

    return matchesAction && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-[#005BAC] dark:text-blue-400" />
            <span>Immutable System Audit Log Registry</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            FR-16 System Activity Auditor recording RBAC access, Citizen Identity disclosures, and administrative edits.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2">
            <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{auditLogs.length} Total Audit Records</span>
          </div>

          <button
            onClick={() => exportAuditLogsToCSV(filteredLogs, `ameco_audit_logs_${new Date().toISOString().split('T')[0]}.csv`)}
            className="px-3.5 py-1.5 bg-[#005BAC] hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-transform active:scale-95"
            title="Export filtered or all audit logs to CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by actor, report ID, details..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-[#005BAC] outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-600 dark:text-slate-300">Action Type:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs outline-none"
            >
              <option value="All">All Actions</option>
              <option value="Identity Access">Identity Access</option>
              <option value="Report Assignment">Report Assignment</option>
              <option value="Status Change">Status Change</option>
              <option value="AI Processing">AI Processing</option>
              <option value="User Login">User Login</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor / Admin</th>
                <th className="p-3">Action</th>
                <th className="p-3">Audit Details</th>
                <th className="p-3">Target ID</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    No audit records found matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {log.actorName}
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'Identity Access' ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700' :
                        log.action === 'Report Assignment' ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200' :
                        log.action === 'AI Processing' ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="p-3 max-w-md text-slate-600 dark:text-slate-300 leading-snug">
                      {log.details}
                    </td>

                    <td className="p-3 font-mono text-[10px] font-bold text-[#005BAC] dark:text-blue-400 whitespace-nowrap">
                      {log.targetId || '-'}
                    </td>

                    <td className="p-3 font-mono text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
