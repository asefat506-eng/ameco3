import {
  ReportItem,
  UserProfile,
  Message,
  AuditLogEntry,
  NotificationItem,
  Department,
  TrendingNewsItem,
  AiAnalysisResult,
  InstitutionSocialChannel,
  ReportMedia,
} from '../types.ts';

export interface BootstrapResponse {
  users: UserProfile[];
  reports: ReportItem[];
  messages: Message[];
  auditLogs: AuditLogEntry[];
  notifications: NotificationItem[];
  departments: Department[];
  trendingNews: TrendingNewsItem[];
  channels?: InstitutionSocialChannel[];
  reportMedia?: ReportMedia[];
  mediaList?: ReportMedia[];
}

export async function fetchBootstrapData(): Promise<BootstrapResponse> {
  const res = await fetch('/api/bootstrap');
  if (!res.ok) {
    throw new Error(`Failed to load data from Cloud SQL: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function saveReportApi(report: ReportItem): Promise<ReportItem> {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  if (!res.ok) {
    throw new Error('Failed to save report to database');
  }
  const json = await res.json();
  return json.report;
}

export async function deleteReportApi(reportId: string): Promise<void> {
  const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete report from database');
  }
}

export async function saveUserApi(user: UserProfile): Promise<UserProfile> {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) {
    throw new Error('Failed to save user to database');
  }
  const json = await res.json();
  return json.user;
}

export async function updateUserStatusApi(
  userId: string,
  status: 'active' | 'suspended' | 'pending' | 'banned'
): Promise<void> {
  const res = await fetch(`/api/users/${encodeURIComponent(userId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error('Failed to update user status in database');
  }
}

export async function saveMessageApi(message: Message): Promise<Message> {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!res.ok) {
    throw new Error('Failed to save message to database');
  }
  const json = await res.json();
  return json.message;
}

export async function saveAuditLogApi(entry: AuditLogEntry): Promise<AuditLogEntry> {
  try {
    const res = await fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) {
      console.warn('Could not persist audit log to server, kept in local state.');
      return entry;
    }
    const json = await res.json();
    return json.auditLog || entry;
  } catch (err) {
    console.warn('Audit log network sync skipped, kept in local state:', err);
    return entry;
  }
}

export async function fetchUserNotificationsApi(userId: string): Promise<NotificationItem[]> {
  const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch notifications');
  }
  const json = await res.json();
  return json.notifications || [];
}

export async function saveNotificationApi(notif: NotificationItem): Promise<NotificationItem> {
  const res = await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notif),
  });
  if (!res.ok) {
    throw new Error('Failed to save notification to database');
  }
  const json = await res.json();
  return json.notification;
}

export async function markNotificationReadApi(notifId: string): Promise<void> {
  const res = await fetch(`/api/notifications/${encodeURIComponent(notifId)}/read`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    throw new Error('Failed to mark notification as read');
  }
}

export async function markAllNotificationsReadApi(userId: string): Promise<void> {
  const res = await fetch('/api/notifications/mark-all-read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    throw new Error('Failed to mark all notifications as read');
  }
}

export async function deleteNotificationApi(notifId: string): Promise<void> {
  const res = await fetch(`/api/notifications/${encodeURIComponent(notifId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete notification');
  }
}

export async function saveDepartmentApi(dept: Department): Promise<Department> {
  const res = await fetch('/api/departments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dept),
  });
  if (!res.ok) {
    throw new Error('Failed to save department');
  }
  const json = await res.json();
  return json.department;
}

export async function deleteDepartmentApi(deptId: string): Promise<void> {
  const res = await fetch(`/api/departments/${encodeURIComponent(deptId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete department');
  }
}

export async function saveTrendingNewsApi(news: TrendingNewsItem): Promise<TrendingNewsItem> {
  const res = await fetch('/api/trending-news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(news),
  });
  if (!res.ok) {
    throw new Error('Failed to save trending news to database');
  }
  const json = await res.json();
  return json.trendingNews;
}

export async function triggerAiAnalysisApi(params: {
  title: string;
  description: string;
  category?: string;
  incidentDate?: string;
  location?: string;
}): Promise<AiAnalysisResult> {
  const res = await fetch('/api/ai-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('AI Analysis failed');
  }
  const json = await res.json();
  return json.analysis;
}

export async function sendOtpApi(email: string): Promise<{ success: boolean; message: string; otp?: string; expiresAt?: number }> {
  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to send OTP verification code');
  }
  return json;
}

export async function verifyOtpApi(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Invalid or expired OTP code');
  }
  return json;
}

export async function loginUserApi(
  identifier: string,
  password: string
): Promise<{ success: boolean; user: UserProfile; isSuspended?: boolean; message?: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const json = await res.json();
  if (!res.ok) {
    if (res.status === 403 && json.isSuspended) {
      return { success: false, isSuspended: true, user: json.user, message: json.message || json.error };
    }
    throw new Error(json.error || 'Login failed. Please check credentials.');
  }
  return json;
}

export async function registerCitizenApi(params: {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  region?: string;
  zone: string;
  woreda?: string;
  securityQuestion1?: string;
  securityAnswer1?: string;
  securityQuestion2?: string;
  securityAnswer2?: string;
  securityQuestion3?: string;
  securityAnswer3?: string;
}): Promise<{ success: boolean; user: UserProfile; message: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Registration failed');
  }
  return json;
}

export async function changePasswordApi(params: {
  userId: string;
  oldPassword?: string;
  newPassword: string;
  user?: UserProfile;
}): Promise<{ success: boolean; message: string; user?: UserProfile }> {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to change password');
  }
  return json;
}

export interface SecurityQuestionItem {
  id: string;
  key: 'answer1' | 'answer2' | 'answer3' | string;
  question: string;
}

export async function requestPasswordResetApi(identifier: string): Promise<{
  success: boolean;
  message: string;
  userId?: string;
  fullName?: string;
  maskedEmail?: string;
  hasSecurityQuestions?: boolean;
  securityQuestions?: SecurityQuestionItem[];
  otpPreview?: string;
  expiresInMinutes?: number;
}> {
  const res = await fetch('/api/auth/forgot-password-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to request password reset code');
  }
  return json;
}

export async function resetPasswordWithSecurityAnswersApi(params: {
  userId?: string;
  identifier?: string;
  answer1: string;
  answer2: string;
  answer3: string;
  newPassword: string;
}): Promise<{
  success: boolean;
  message: string;
  user?: UserProfile;
}> {
  const res = await fetch('/api/auth/reset-password-security', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to reset password via security answers');
  }
  return json;
}

export async function verifySecurityAnswersApi(params: {
  userId?: string;
  identifier?: string;
  answer1: string;
  answer2: string;
  answer3: string;
}): Promise<{
  success: boolean;
  message: string;
  userId?: string;
  fullName?: string;
}> {
  const res = await fetch('/api/auth/verify-security-answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Security verification failed');
  }
  return json;
}

export async function resetPasswordWithOtpApi(params: {
  userId?: string;
  identifier?: string;
  otpCode: string;
  newPassword: string;
}): Promise<{
  success: boolean;
  message: string;
  user?: UserProfile;
}> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to reset password');
  }
  return json;
}

export async function provisionInvestigatorApi(params: {
  role: 'Investigator' | 'Field Officer';
  fullName: string;
  email: string;
  phone: string;
  region: string;
  zone: string;
  cityTown: string;
  serviceArea?: string;
  department: string;
  specialization: string;
  employmentStatus: 'Available' | 'Busy' | 'On Leave' | 'Inactive';
  availability?: 'Available' | 'Busy' | 'On Leave';
  accountStatus?: 'Active' | 'Suspended' | 'Deactivated';
  adminActorName?: string;
}): Promise<{
  success: boolean;
  message: string;
  user: UserProfile;
  temporaryPassword: string;
  credentials: {
    id: string;
    userId?: string;
    fullName: string;
    email: string;
    phone?: string;
    role?: string;
    temporaryPassword: string;
    region?: string;
    zone: string;
    cityTown?: string;
    serviceArea?: string;
    department?: string;
    specialization?: string;
    accountStatus?: string;
    availability?: string;
    forcePasswordChange?: boolean;
  };
}> {
  const res = await fetch('/api/admin/provision-investigator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to provision investigator account');
  }
  return json;
}

export async function updateInvestigatorAvailabilityApi(
  id: string,
  availability: 'Available' | 'Busy' | 'On Leave',
  adminActorName?: string
): Promise<{ success: boolean; user: UserProfile; message: string }> {
  const res = await fetch(`/api/admin/investigators/${encodeURIComponent(id)}/availability`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ availability, adminActorName }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to update investigator availability');
  }
  return json;
}

export async function updateInvestigatorAccountStatusApi(
  id: string,
  accountStatus: 'Active' | 'Suspended' | 'Deactivated',
  adminActorName?: string
): Promise<{ success: boolean; user: UserProfile; message: string }> {
  const res = await fetch(`/api/admin/investigators/${encodeURIComponent(id)}/account-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountStatus, adminActorName }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to update investigator account status');
  }
  return json;
}

export async function resetInvestigatorPasswordApi(
  id: string,
  adminActorName?: string
): Promise<{ success: boolean; temporaryPassword: string; user: UserProfile; message: string }> {
  const res = await fetch(`/api/admin/investigators/${encodeURIComponent(id)}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminActorName }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to reset investigator password');
  }
  return json;
}

export async function updateInvestigatorProfileApi(
  id: string,
  updates: Partial<UserProfile> & { adminActorName?: string }
): Promise<{ success: boolean; user: UserProfile; message: string }> {
  const res = await fetch(`/api/admin/investigators/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to update investigator profile');
  }
  return json;
}

export async function updateUserProfileApi(
  id: string,
  updates: Partial<UserProfile> & { adminActorName?: string }
): Promise<{ success: boolean; user: UserProfile; message: string }> {
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to update user profile');
  }
  return json;
}

export async function deleteUserApi(
  id: string,
  adminActorName?: string
): Promise<{ success: boolean; message: string }> {
  const url = adminActorName
    ? `/api/users/${encodeURIComponent(id)}?adminActorName=${encodeURIComponent(adminActorName)}`
    : `/api/users/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to delete user account');
  }
  return json;
}

export async function submitSuspensionAppealApi(params: {
  userId: string;
  userEmail?: string;
  userName?: string;
  fullName?: string;
  email?: string;
  userRole?: string;
  subject?: string;
  reason?: string;
  appealReason?: string;
  appealDetails?: string;
  contactPhone?: string;
  phone?: string;
  department?: string;
  zone?: string;
}): Promise<{ success: boolean; appealId?: string; message: string }> {
  const payload = {
    userId: params.userId,
    userName: params.userName || params.fullName,
    userEmail: params.userEmail || params.email,
    userRole: params.userRole,
    subject: params.subject || params.reason || 'Account Suspension Review Request',
    appealReason: params.appealReason || params.appealDetails || params.reason || 'Account suspension review request',
    contactPhone: params.contactPhone || params.phone,
    department: params.department,
    zone: params.zone,
  };
  const res = await fetch('/api/user/suspension-appeal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to submit suspension appeal');
  }
  return json;
}

// ==========================================
// INSTITUTION SOCIAL CHANNELS API
// ==========================================
export async function fetchChannelsApi(institutionId?: string): Promise<InstitutionSocialChannel[]> {
  const url = institutionId
    ? `/api/social/channels?institutionId=${encodeURIComponent(institutionId)}`
    : '/api/social/channels';
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch social channels');
  }
  return json.channels || [];
}

export async function saveChannelApi(channel: Partial<InstitutionSocialChannel>): Promise<InstitutionSocialChannel> {
  const res = await fetch('/api/social/channels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(channel),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to save social channel');
  }
  return json.channel;
}

export async function verifyChannelApi(
  id: string,
  status: string,
  verifiedBy?: string,
  reason?: string
): Promise<InstitutionSocialChannel> {
  const res = await fetch(`/api/social/channels/${encodeURIComponent(id)}/verify`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, verifiedBy, reason }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to update channel verification');
  }
  return json.channel;
}

export async function deleteChannelApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/social/channels/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to delete channel');
  }
  return true;
}

// ==========================================
// REPORT MEDIA & PUBLICATIONS API
// ==========================================
export async function fetchReportMediaApi(reportId?: string, institutionId?: string): Promise<ReportMedia[]> {
  let url = '/api/social/media';
  const params = new URLSearchParams();
  if (reportId) params.append('reportId', reportId);
  if (institutionId) params.append('institutionId', institutionId);
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch report media');
  }
  return json.media || [];
}

export async function saveReportMediaApi(media: Partial<ReportMedia>): Promise<ReportMedia> {
  const res = await fetch('/api/social/media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(media),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to save report media');
  }
  return json.media;
}

export async function verifyReportMediaApi(
  id: string,
  status: string,
  verifiedBy?: string,
  reason?: string
): Promise<ReportMedia> {
  const res = await fetch(`/api/social/media/${encodeURIComponent(id)}/verify`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, verifiedBy, reason }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to verify report media');
  }
  return json.media;
}

export async function setPrimaryReportMediaApi(mediaId: string, reportId?: string): Promise<boolean> {
  const res = await fetch(`/api/social/media/${encodeURIComponent(mediaId)}/primary`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to set primary media');
  }
  return true;
}

export async function deleteReportMediaApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/social/media/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to delete report media');
  }
  return true;
}

export interface LinkPreviewResult {
  success: boolean;
  platform?: string;
  externalId?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  authorName?: string;
  siteName?: string;
  embedUrl?: string;
  error?: string;
}

export async function fetchLinkPreviewApi(url: string): Promise<LinkPreviewResult> {
  try {
    const res = await fetch('/api/fetch-link-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to fetch link preview',
    };
  }
}



