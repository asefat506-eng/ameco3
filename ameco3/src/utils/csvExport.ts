import { ReportItem, AuditLogEntry } from '../types';

/**
 * Trigger a browser file download for a generated CSV string.
 */
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Helper function to double-quote and escape CSV text values.
 */
function escapeCSV(val: string | number | boolean | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export array of ReportItem objects into a formatted CSV file.
 */
export function exportReportsToCSV(reports: ReportItem[], filename = 'ameco_reports_export.csv') {
  const headers = [
    'Report ID',
    'Type',
    'Title',
    'Category',
    'Region',
    'Zone',
    'Woreda',
    'Specific Location',
    'Incident Date',
    'Priority',
    'Status',
    'Citizen ID',
    'Assigned Person',
    'Department Desk',
    'AI Summary',
    'AI Spam Score',
    'Description',
    'Created At',
    'Updated At',
  ];

  const rows = reports.map((r) => [
    escapeCSV(r.id),
    escapeCSV(r.type),
    escapeCSV(r.title),
    escapeCSV(r.category),
    escapeCSV(r.region),
    escapeCSV(r.zone),
    escapeCSV(r.woreda || ''),
    escapeCSV(r.specificLocation || ''),
    escapeCSV(r.incidentDate),
    escapeCSV(r.priority),
    escapeCSV(r.status),
    escapeCSV(r.citizenId),
    escapeCSV(r.assignedTo?.responsiblePersonName || 'Unassigned'),
    escapeCSV(r.assignedTo?.department || ''),
    escapeCSV(r.aiAnalysis?.aiSummary || ''),
    escapeCSV(r.aiAnalysis?.spamScore ?? ''),
    escapeCSV(r.description),
    escapeCSV(r.createdAt),
    escapeCSV(r.updatedAt),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  downloadCSV(filename, csvContent);
}

/**
 * Export array of AuditLogEntry objects into a formatted CSV file.
 */
export function exportAuditLogsToCSV(logs: AuditLogEntry[], filename = 'ameco_audit_logs_export.csv') {
  const headers = [
    'Log ID',
    'Timestamp',
    'Actor Name',
    'Actor Role',
    'Action',
    'Details',
    'Target ID',
    'IP Address',
  ];

  const rows = logs.map((log) => [
    escapeCSV(log.id),
    escapeCSV(log.timestamp),
    escapeCSV(log.actorName),
    escapeCSV(log.actorRole),
    escapeCSV(log.action),
    escapeCSV(log.details),
    escapeCSV(log.targetId || ''),
    escapeCSV(log.ipAddress),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  downloadCSV(filename, csvContent);
}
