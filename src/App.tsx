import React, { useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  ReportItem,
  Department,
  Message,
  EvidenceFile,
  AuditLogEntry,
  NotificationItem,
  ReportStatus,
  PriorityLevel,
  TrendingNewsItem,
  InstitutionSocialChannel,
  ReportMedia,
  ChannelVerificationStatus,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_REPORTS,
  INITIAL_MESSAGES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TRENDING_NEWS,
  INITIAL_CHANNELS,
  INITIAL_REPORT_MEDIA,
} from './data/initialData';
import {
  fetchBootstrapData,
  saveReportApi,
  saveUserApi,
  updateUserStatusApi,
  updateUserProfileApi,
  deleteUserApi,
  saveMessageApi,
  saveAuditLogApi,
  saveNotificationApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
  saveTrendingNewsApi,
  fetchChannelsApi,
  saveChannelApi,
  verifyChannelApi,
  deleteChannelApi,
  fetchReportMediaApi,
  saveReportMediaApi,
  verifyReportMediaApi,
  setPrimaryReportMediaApi,
  deleteReportMediaApi,
} from './lib/api';

import { Navbar } from './components/Navbar';
import { SidebarNav } from './components/SidebarNav';
import { AmecoLogo } from './components/AmecoLogo';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LoginPage } from './components/Auth/LoginPage';

import { CitizenHome } from './components/CitizenPortal/CitizenHome';
import { SubmitReportModal } from './components/CitizenPortal/SubmitReportModal';
import { MySubmissions } from './components/CitizenPortal/MySubmissions';
import { TrackReports } from './components/CitizenPortal/TrackReports';
import { CitizenMessages } from './components/CitizenPortal/CitizenMessages';
import { PublishedReports } from './components/CitizenPortal/PublishedReports';
import { CitizenProfile } from './components/CitizenPortal/CitizenProfile';
import { HelpFaq } from './components/CitizenPortal/HelpFaq';

import { NotificationsPage } from './components/Notifications/NotificationsPage';

import { AdminOverview } from './components/AdminDashboard/AdminOverview';
import { AdminMessages } from './components/AdminDashboard/AdminMessages';
import { ReportReviewModal } from './components/AdminDashboard/ReportReviewModal';
import { AssignmentModal } from './components/AdminDashboard/AssignmentModal';
import { UserManagement } from './components/AdminDashboard/UserManagement';
import { AnalyticsReports } from './components/AdminDashboard/AnalyticsReports';
import { AuditLogViewer } from './components/AdminDashboard/AuditLogViewer';

import { InvestigatorDashboard } from './components/ResponsiblePersonDashboard/InvestigatorDashboard';
import { InvestigatorAdminChat } from './components/ResponsiblePersonDashboard/InvestigatorAdminChat';
import { AdminInstitutions } from './components/AdminDashboard/AdminInstitutions';
import { InstitutionDashboard } from './components/InstitutionPortal/InstitutionDashboard';
import { InstitutionAdminChat } from './components/InstitutionPortal/InstitutionAdminChat';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

const isInstitutionPortalRole = (role: UserProfile['role']) => role === 'Institution' || role === 'Publisher';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  // Auth state: Default false so initial open displays Login/Register landing page
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // State initialization - loaded with initial datasets + cached custom users
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem('ameco_custom_users');
      if (stored) {
        const customUsers = JSON.parse(stored);
        if (Array.isArray(customUsers) && customUsers.length > 0) {
          const ids = new Set(customUsers.map((u: any) => u.id));
          return [...customUsers, ...INITIAL_USERS.filter((u) => !ids.has(u.id))];
        }
      }
    } catch {}
    return INITIAL_USERS;
  });
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]); // Default Citizen fallback
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [trendingNews, setTrendingNews] = useState<TrendingNewsItem[]>(INITIAL_TRENDING_NEWS);
  const [channels, setChannels] = useState<InstitutionSocialChannel[]>(INITIAL_CHANNELS);
  const [mediaList, setMediaList] = useState<ReportMedia[]>(INITIAL_REPORT_MEDIA);

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('home');

  // Sidebar Drawer state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Modals state
  const [submitReportModalOpen, setSubmitReportModalOpen] = useState<boolean>(false);
  const [submitType, setSubmitType] = useState<'news' | 'tipoff'>('news');

  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [selectedReviewReport, setSelectedReviewReport] = useState<ReportItem | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [selectedAssignReport, setSelectedAssignReport] = useState<ReportItem | null>(null);

  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState<boolean>(false);
  const [selectedTrackReportId, setSelectedTrackReportId] = useState<string | null>(null);
  const [selectedTrackAccessCode, setSelectedTrackAccessCode] = useState<string | null>(null);
  const [selectedMessageReportId, setSelectedMessageReportId] = useState<string | null>(null);

  const isGuest =
    currentUser.id.startsWith('GUEST-') ||
    currentUser.fullName === 'Anonymous Guest' ||
    currentUser.isGuest;

  // Load persistent live data from Cloud SQL on mount
  useEffect(() => {
    let isMounted = true;
    fetchBootstrapData()
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.users && data.users.length > 0) {
          let mergedUsers = [...data.users];
          try {
            const stored = localStorage.getItem('ameco_custom_users');
            if (stored) {
              const customUsers = JSON.parse(stored);
              if (Array.isArray(customUsers)) {
                for (const cu of customUsers) {
                  if (
                    !mergedUsers.some(
                      (u) =>
                        u.id === cu.id ||
                        (u.email && cu.email && u.email.toLowerCase() === cu.email.toLowerCase())
                    )
                  ) {
                    mergedUsers.unshift(cu);
                  }
                }
              }
            }
          } catch {}
          setUsers(mergedUsers);
          setCurrentUser((prev) => {
            const match = mergedUsers.find((u) => u.id === prev.id);
            return match || mergedUsers[0] || prev;
          });
        }
        if (data.reports) setReports(data.reports);
        if (data.messages) setMessages(data.messages);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.notifications) setNotifications(data.notifications);
        if (data.departments) setDepartments(data.departments);
        if (data.trendingNews) setTrendingNews(data.trendingNews);
        if (data.channels) setChannels(data.channels);
        if (data.mediaList) setMediaList(data.mediaList);
      })
      .catch((err) => {
        console.warn('Could not bootstrap from Cloud SQL API (using fallback state):', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Social Channel Handlers
  const handleSaveChannel = async (channel: InstitutionSocialChannel) => {
    setChannels((prev) => {
      const idx = prev.findIndex((c) => c.id === channel.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = channel;
        return next;
      }
      return [channel, ...prev];
    });
    try {
      await saveChannelApi(channel);
    } catch (e) {
      console.error('Error saving channel to API:', e);
    }
  };

  const handleVerifyChannel = async (
    channelId: string,
    status: ChannelVerificationStatus,
    reason?: string
  ) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId
          ? {
              ...c,
              verificationStatus: status,
              rejectionReason: reason || c.rejectionReason,
              verifiedAt: status === 'Verified' ? new Date().toISOString() : c.verifiedAt,
              verifiedBy: status === 'Verified' ? currentUser.fullName : c.verifiedBy,
            }
          : c
      )
    );
    try {
      await verifyChannelApi(channelId, status, reason);
    } catch (e) {
      console.error('Error verifying channel in API:', e);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    setChannels((prev) => prev.filter((c) => c.id !== channelId));
    try {
      await deleteChannelApi(channelId);
    } catch (e) {
      console.error('Error deleting channel in API:', e);
    }
  };

  // Report Media Handlers
  const handleAddMedia = async (media: ReportMedia) => {
    setMediaList((prev) => {
      const idx = prev.findIndex((m) => m.id === media.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = media;
        return next;
      }
      return [media, ...prev];
    });
    try {
      await saveReportMediaApi(media);
    } catch (e) {
      console.error('Error saving media to API:', e);
    }
  };

  const handleVerifyMedia = async (
    mediaId: string,
    status: 'Verified' | 'Rejected',
    reason?: string
  ) => {
    setMediaList((prev) =>
      prev.map((m) =>
        m.id === mediaId
          ? {
              ...m,
              verificationStatus: status,
              rejectionReason: reason || m.rejectionReason,
              verifiedAt: status === 'Verified' ? new Date().toISOString() : m.verifiedAt,
              verifiedBy: status === 'Verified' ? currentUser.fullName : m.verifiedBy,
            }
          : m
      )
    );
    try {
      await verifyReportMediaApi(mediaId, status, reason);
    } catch (e) {
      console.error('Error verifying media in API:', e);
    }
  };

  const handleSetPrimaryMedia = async (mediaId: string) => {
    const target = mediaList.find((m) => m.id === mediaId);
    if (!target) return;
    setMediaList((prev) =>
      prev.map((m) =>
        m.reportId === target.reportId ? { ...m, isPrimary: m.id === mediaId } : m
      )
    );
    try {
      await setPrimaryReportMediaApi(mediaId);
    } catch (e) {
      console.error('Error setting primary media in API:', e);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== mediaId));
    try {
      await deleteReportMediaApi(mediaId);
    } catch (e) {
      console.error('Error deleting media in API:', e);
    }
  };

  // Filter notifications belonging to the current user (Guests get none)
  const userNotifications = useMemo(() => {
    if (isGuest) return [];
    return notifications.filter(
      (n) => n.recipientId === currentUser.id || n.userId === currentUser.id
    );
  }, [notifications, currentUser.id, isGuest]);

  const unreadCount = useMemo(() => {
    return userNotifications.filter((n) => !(n.isRead ?? n.read)).length;
  }, [userNotifications]);

  // Handle Login
  const handleLoginSuccess = (user: UserProfile) => {
    const authenticatedUser = user.role === 'Administrator'
      ? { ...user, isDefaultPassword: false }
      : user;
    setCurrentUser(authenticatedUser);
    setIsAuthenticated(true);
    if (authenticatedUser.role === 'Administrator') {
      setActiveTab('admin-overview');
    } else if (authenticatedUser.role === 'ResponsiblePerson') {
      setActiveTab('investigator');
    } else if (isInstitutionPortalRole(authenticatedUser.role)) {
      setActiveTab('institution-portal');
    } else {
      setActiveTab('home');
    }

    if (authenticatedUser.role === 'Administrator' && user.isDefaultPassword) {
      saveUserApi(authenticatedUser).catch((err) =>
        console.error('Error clearing administrator default-password flag:', err)
      );
    }

    // Add Audit Log Entry
    const newLog: AuditLogEntry = {
      id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: `${authenticatedUser.fullName} (${authenticatedUser.role})`,
      actorRole: authenticatedUser.role,
      action: 'User Authentication',
      details: `User logged into portal as ${authenticatedUser.fullName} [${authenticatedUser.id}]`,
      ipAddress: '197.156.88.12',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    saveAuditLogApi(newLog).catch(() => {});
  };

  // Trending News Handlers
  const handlePublishNews = (news: TrendingNewsItem) => {
    setTrendingNews((prev) => [news, ...prev]);
    saveTrendingNewsApi(news).catch((err) => console.error('Error saving news to Cloud SQL:', err));

    const auditEntry: AuditLogEntry = {
      id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: `${currentUser.fullName} (Institution)`,
      actorRole: 'Institution',
      action: 'Trending News Publication',
      details: `Published institutional bulletin "${news.title}" for ${news.zone}`,
      targetId: news.id,
      ipAddress: '197.156.88.12',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
    saveAuditLogApi(auditEntry).catch(() => {});
  };

  const handleDeleteNews = (newsId: string) => {
    setTrendingNews((prev) => prev.filter((n) => n.id !== newsId));
  };

  // Handle Guest Access
  const handleGuestAccess = () => {
    const guestUser: UserProfile = {
      id: 'GUEST-' + Math.floor(1000 + Math.random() * 9000),
      fullName: 'Anonymous Guest',
      role: 'Citizen',
      email: 'guest@ameco.et',
      phoneNumber: '+251 90 000 0000',
      zone: 'Central Gondar',
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      reputationScore: 50,
      isGuest: true,
    };
    setCurrentUser(guestUser);
    setIsAuthenticated(true);
    setActiveTab('home');
  };

  // Handle Register New User
  const handleRegisterUser = (newUser: UserProfile) => {
    setUsers((prev) => {
      const idx = prev.findIndex(
        (u) => u.id === newUser.id || (u.email && u.email.toLowerCase() === newUser.email.toLowerCase())
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...newUser };
        return updated;
      }
      return [newUser, ...prev];
    });

    try {
      const stored = localStorage.getItem('ameco_custom_users');
      const parsed = stored ? JSON.parse(stored) : [];
      const updated = [
        newUser,
        ...parsed.filter((u: any) => u.id !== newUser.id && u.email?.toLowerCase() !== newUser.email?.toLowerCase()),
      ];
      localStorage.setItem('ameco_custom_users', JSON.stringify(updated));
    } catch {}

    saveUserApi(newUser).catch((err) => console.error('Error saving registered user to Cloud SQL:', err));
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Notification Mark / Delete Handlers
  const handleMarkNotificationAsRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true, isRead: true } : n))
    );
    markNotificationReadApi(notifId).catch((err) =>
      console.error('Error marking notification read in Cloud SQL:', err)
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.userId === currentUser.id || n.recipientId === currentUser.id
          ? { ...n, read: true, isRead: true }
          : n
      )
    );
    markAllNotificationsReadApi(currentUser.id).catch((err) =>
      console.error('Error marking all notifications read in Cloud SQL:', err)
    );
  };

  const handleDeleteNotification = (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    deleteNotificationApi(notifId).catch((err) =>
      console.error('Error deleting notification in Cloud SQL:', err)
    );
  };

  const handleSelectNotification = (notif: NotificationItem) => {
    handleMarkNotificationAsRead(notif.id);

    const isInstitution = isInstitutionPortalRole(currentUser.role);
    const isInvestigator = currentUser.role === 'ResponsiblePerson';
    const isAdmin = currentUser.role === 'Administrator';

    // 1. Message Notifications
    if (notif.type === 'message') {
      if (isInstitution) {
        setActiveTab('institution-admin-chat');
        return;
      }
      if (isInvestigator) {
        setActiveTab('investigator-admin-chat');
        return;
      }
      if (isAdmin) {
        if (
          notif.relatedTipId &&
          (notif.relatedTipId.startsWith('INST-') ||
            users.some((u) => u.id === notif.relatedTipId && isInstitutionPortalRole(u.role)))
        ) {
          setActiveTab('institutions');
        } else {
          setActiveTab('admin-messages');
        }
        return;
      }
      // Citizen messages
      if (notif.relatedTipId) setSelectedMessageReportId(notif.relatedTipId);
      setActiveTab('messages');
      return;
    }

    // 2. Assignment & Publication Notifications
    if (notif.type === 'assignment' || notif.type === 'publication') {
      if (isInstitution) {
        setActiveTab('institution-portal');
        return;
      }
      if (isInvestigator) {
        setActiveTab('investigator');
        return;
      }
      if (isAdmin) {
        if (notif.relatedTipId) {
          const r = reports.find((item) => item.id === notif.relatedTipId);
          if (r) handleOpenReviewModal(r);
          else setActiveTab('admin-overview');
        } else {
          setActiveTab('admin-overview');
        }
        return;
      }
      // Citizen tracking
      if (notif.relatedTipId) setSelectedTrackReportId(notif.relatedTipId);
      setActiveTab('track');
      return;
    }

    // 3. Status updates or general tip-off events
    if (isInstitution) {
      setActiveTab('institution-portal');
    } else if (isInvestigator) {
      setActiveTab('investigator');
    } else if (isAdmin) {
      if (notif.relatedTipId) {
        const r = reports.find((item) => item.id === notif.relatedTipId);
        if (r) handleOpenReviewModal(r);
        else setActiveTab('admin-overview');
      } else {
        setActiveTab('admin-overview');
      }
    } else {
      if (notif.relatedTipId) setSelectedTrackReportId(notif.relatedTipId);
      setActiveTab('track');
    }
  };

  // Submit New Report
  const handleSubmitReport = (newReportData: Omit<ReportItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const reportId = 'AMECO-2026-' + Math.floor(1000 + Math.random() * 9000);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const fullReport: ReportItem = {
      ...newReportData,
      id: reportId,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    // Save report state and persist to Cloud SQL
    setReports((prev) => [fullReport, ...prev]);
    saveReportApi(fullReport).catch((err) => console.error('Error saving report to Cloud SQL:', err));

    // Persist submission IDs and tracking codes to local storage
    try {
      const code = fullReport.trackingCode || fullReport.id;
      const globalSaved = JSON.parse(localStorage.getItem('ameco_submitted_report_ids') || '[]');
      if (!globalSaved.includes(code)) globalSaved.unshift(code);
      localStorage.setItem('ameco_submitted_report_ids', JSON.stringify(globalSaved));

      if (currentUser?.id) {
        const userKey = `ameco_submissions_${currentUser.id}`;
        const userSaved = JSON.parse(localStorage.getItem(userKey) || '[]');
        if (!userSaved.includes(code)) userSaved.unshift(code);
        localStorage.setItem(userKey, JSON.stringify(userSaved));
      }
    } catch {
      // Storage safe
    }

    // Audit Log
    const auditEntry: AuditLogEntry = {
      id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: `${currentUser?.fullName || 'Anonymous Citizen'} (${currentUser?.role || 'Citizen'})`,
      actorRole: currentUser?.role || 'Citizen',
      action: 'Report Submission',
      details: `Submitted ${fullReport.type === 'tipoff' ? 'Confidential Tip-Off' : 'News Report'} titled "${fullReport.title}". Passed Gemini AI moderation.`,
      targetId: reportId,
      ipAddress: '197.156.88.12',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
    saveAuditLogApi(auditEntry).catch(() => {});

    // Notification to Citizen (only if not an anonymous guest without an account)
    if (!isGuest && currentUser.id) {
      const citizenNotif: NotificationItem = {
        id: 'NOTIF-' + Math.floor(100 + Math.random() * 900),
        recipientId: currentUser.id,
        userId: currentUser.id,
        title: 'Submission Received',
        message: `Your report ${reportId} has been submitted successfully and received by AMECO Editors.`,
        timestamp: nowStr,
        read: false,
        isRead: false,
        type: 'submission',
        relatedTipId: reportId,
      };
      setNotifications((prev) => [citizenNotif, ...prev]);
      saveNotificationApi(citizenNotif).catch((err) => console.error('Error saving notification:', err));
    }

    // Notification to Admin ADM-001
    const adminNotif: NotificationItem = {
      id: 'NOTIF-' + Math.floor(100 + Math.random() * 900),
      recipientId: 'ADM-001',
      userId: 'ADM-001',
      title: 'New Citizen Submission',
      message: `New ${fullReport.type} report ${reportId} submitted in ${fullReport.zone}.`,
      timestamp: nowStr,
      read: false,
      isRead: false,
      type: 'submission',
      relatedTipId: reportId,
    };

    setNotifications((prev) => [adminNotif, ...prev]);
    saveNotificationApi(adminNotif).catch((err) => console.error('Error saving notification:', err));
  };

  // Assign Report
  const handleAssignReport = (
    reportId: string,
    assignment: {
      responsiblePersonId: string;
      responsiblePersonName: string;
      department: string;
      priority: PriorityLevel;
      deadline: string;
      notes: string;
      location?: string;
      specialization?: string;
    }
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const targetReport = reports.find((r) => r.id === reportId);
    if (targetReport) {
      const updatedReport: ReportItem = {
        ...targetReport,
        status: 'Assigned',
        priority: assignment.priority,
        assignedTo: {
          responsiblePersonId: assignment.responsiblePersonId,
          responsiblePersonName: assignment.responsiblePersonName,
          department: assignment.department,
          assignedAt: nowStr,
          deadline: assignment.deadline,
          notes: assignment.notes,
          location: assignment.location,
          specialization: assignment.specialization,
          priority: assignment.priority,
        },
        updatedAt: nowStr,
      };

      setReports((prev) => prev.map((r) => (r.id === reportId ? updatedReport : r)));
      saveReportApi(updatedReport).catch((err) => console.warn('Note on Cloud SQL sync:', err));
    }

    // Audit Log
    const auditEntry: AuditLogEntry = {
      id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: `${currentUser.fullName} (Admin)`,
      actorRole: 'Administrator',
      action: 'Report Assignment',
      details: `Assigned report ${reportId} to ${assignment.responsiblePersonName} [${assignment.responsiblePersonId}] (${assignment.department}). Deadline: ${assignment.deadline}.`,
      targetId: reportId,
      ipAddress: '197.156.88.12',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
    saveAuditLogApi(auditEntry).catch(() => {});

    // Notify assigned investigator
    const invNotif: NotificationItem = {
      id: 'NOTIF-' + Math.floor(100 + Math.random() * 900),
      recipientId: assignment.responsiblePersonId,
      userId: assignment.responsiblePersonId,
      title: 'New Case Assigned',
      message: `You have been assigned case ${reportId} (${targetReport?.title || 'Tip'}). Deadline: ${assignment.deadline}`,
      timestamp: nowStr,
      read: false,
      isRead: false,
      type: 'assignment',
      relatedTipId: reportId,
    };
    setNotifications((prev) => [invNotif, ...prev]);
    saveNotificationApi(invNotif).catch((err) => console.warn('Note on notification sync:', err));

    // Notify citizen if registered
    if (targetReport?.citizenId && !targetReport?.isAnonymous) {
      const citizenNotif: NotificationItem = {
        id: 'NOTIF-' + Math.floor(100 + Math.random() * 900),
        recipientId: targetReport.citizenId,
        userId: targetReport.citizenId,
        title: 'Report Status Update',
        message: `Your report ${reportId} has been assigned to AMECO ${assignment.department}.`,
        timestamp: nowStr,
        read: false,
        isRead: false,
        type: 'status_update',
        relatedTipId: reportId,
      };
      setNotifications((prev) => [citizenNotif, ...prev]);
      saveNotificationApi(citizenNotif).catch((err) => console.warn('Note on notification sync:', err));
    }
  };

  // Reveal Identity Action (Admin)
  const handleRevealIdentity = (reportId: string, citizenName?: string) => {
    const auditEntry: AuditLogEntry = {
      id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: `${currentUser.fullName} (Admin)`,
      actorRole: 'Administrator',
      action: 'Identity Access',
      details: `Unlocked Citizen personal identity details (${citizenName || 'Citizen'}) for Report ${reportId} under official RBAC review rules.`,
      targetId: reportId,
      ipAddress: '197.156.88.12',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  // Update Report (Admin Review)
  const handleUpdateReport = (updated: ReportItem) => {
    const prevReport = reports.find((r) => r.id === updated.id);
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    saveReportApi(updated).catch((err) => console.error('Error updating report in Cloud SQL:', err));

    // Status change notification
    if (prevReport && prevReport.status !== updated.status && updated.citizenId && !updated.isAnonymous) {
      const czNotif: NotificationItem = {
        id: 'NOTIF-' + Math.floor(100 + Math.random() * 900),
        recipientId: updated.citizenId,
        userId: updated.citizenId,
        title: `Tip Status: ${updated.status}`,
        message: `Your report "${updated.title}" (${updated.id}) is now marked as "${updated.status}".`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        read: false,
        isRead: false,
        type: 'status_update',
        relatedTipId: updated.id,
      };
      setNotifications((prev) => [czNotif, ...prev]);
      saveNotificationApi(czNotif).catch((err) => console.error('Error saving status update notification:', err));
    }

    const auditEntry: AuditLogEntry = {
      id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: `${currentUser.fullName}`,
      actorRole: currentUser.role,
      action: 'Status Change',
      details: `Updated report ${updated.id} status to "${updated.status}" and priority to "${updated.priority}".`,
      targetId: updated.id,
      ipAddress: '197.156.88.12',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
    saveAuditLogApi(auditEntry).catch(() => {});
  };

  // Send Chat Message
  const handleSendMessage = (
    reportIdOrChannel: string,
    text: string,
    extra?: {
      recipientId?: string;
      isBroadcast?: boolean;
      priority?: 'Normal' | 'High' | 'Urgent';
      reportId?: string;
      attachment?: EvidenceFile;
    }
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let senderDisplayName = `${currentUser.fullName}`;
    if (currentUser.role === 'Citizen') {
      senderDisplayName = `Citizen ${currentUser.id}`;
    } else if (currentUser.role === 'ResponsiblePerson') {
      senderDisplayName = `AMECO Investigator (${currentUser.department || 'Unit'})`;
    } else if (isInstitutionPortalRole(currentUser.role)) {
      senderDisplayName = isInstitutionPortalRole(currentUser.role)
        ? `${currentUser.fullName} (Publisher)`
        : `${currentUser.institutionName || currentUser.fullName} (${currentUser.institutionCategory || 'Agency'})`;
    } else if (currentUser.role === 'Administrator') {
      senderDisplayName = `${currentUser.fullName} (Administrator)`;
    }

    const isBroadcastInvestigators = reportIdOrChannel === 'ALL_INVESTIGATORS' || (extra?.isBroadcast && reportIdOrChannel.includes('inv'));
    const isBroadcastInstitutions = reportIdOrChannel === 'ALL_INSTITUTIONS' || extra?.recipientId === 'ALL_INSTITUTIONS';
    const isBroadcast = extra?.isBroadcast || isBroadcastInvestigators || isBroadcastInstitutions;

    const isInvestigatorSendingToAdmin =
      currentUser.role === 'ResponsiblePerson' &&
      (reportIdOrChannel.startsWith('admin-') || extra?.recipientId === 'ADM-001' || !extra?.recipientId);

    const isInstitutionSendingToAdmin =
      isInstitutionPortalRole(currentUser.role) &&
      (reportIdOrChannel.startsWith('admin-') || extra?.recipientId === 'ADM-001' || !extra?.recipientId);

    const isCaseConversation = Boolean(extra?.reportId && extra?.recipientId && !isBroadcast);

    let recipientId = isBroadcast
      ? undefined
      : isInvestigatorSendingToAdmin || isInstitutionSendingToAdmin
      ? 'ADM-001'
      : extra?.recipientId || (reportIdOrChannel.startsWith('INV-') || reportIdOrChannel.startsWith('INST-') ? reportIdOrChannel : undefined);

    let channelId = reportIdOrChannel;
    if (isBroadcastInstitutions) {
      channelId = 'broadcast-institutions';
    } else if (isBroadcastInvestigators) {
      channelId = 'broadcast-all';
    } else if (isCaseConversation) {
      channelId = `case-${extra!.reportId}`;
    } else if (currentUser.role === 'ResponsiblePerson') {
      channelId = `admin-inv-${currentUser.id}`;
    } else if (isInstitutionPortalRole(currentUser.role)) {
      channelId = `admin-inst-${currentUser.id}`;
    } else if (recipientId?.startsWith('INST-') || (users.find((u) => u.id === recipientId)?.role && isInstitutionPortalRole(users.find((u) => u.id === recipientId)!.role))) {
      channelId = `admin-inst-${recipientId}`;
    } else if (recipientId?.startsWith('INV-') || users.find((u) => u.id === recipientId)?.role === 'ResponsiblePerson') {
      channelId = `admin-inv-${recipientId}`;
    }

    const targetUser = recipientId ? users.find((u) => u.id === recipientId) : null;
    const recipientRole = isBroadcast
      ? undefined
      : (isInvestigatorSendingToAdmin || isInstitutionSendingToAdmin)
      ? 'Administrator'
      : targetUser?.role || (recipientId?.startsWith('INST-') ? 'Institution' : recipientId?.startsWith('INV-') ? 'ResponsiblePerson' : undefined);

    const newMsg: Message = {
      id: 'MSG-' + Math.floor(100 + Math.random() * 900),
      reportId: extra?.reportId || reportIdOrChannel,
      channelId,
      senderRole: currentUser.role,
      senderId: currentUser.id,
      senderDisplayName,
      recipientId,
      recipientRole,
      isBroadcast,
      priority: extra?.priority || 'Normal',
      text,
      attachment: extra?.attachment,
      timestamp: nowStr,
    };

    setMessages((prev) => [...prev, newMsg]);
    saveMessageApi(newMsg).catch((err) => console.error('Error saving message to Cloud SQL:', err));

    if (isBroadcastInstitutions) {
      const instUsers = users.filter((u) => isInstitutionPortalRole(u.role));
      instUsers.forEach((inst) => {
        const bNotif: NotificationItem = {
          id: 'NOTIF-' + Math.floor(100 + Math.random() * 900),
          recipientId: inst.id,
          userId: inst.id,
          title: extra?.priority === 'Urgent' ? 'Urgent Admin Directive' : 'Central Admin Notice',
          message: `Official Notice from AMECO: "${text.substring(0, 50)}..."`,
          timestamp: nowStr,
          read: false,
          isRead: false,
          type: 'message',
        };
        setNotifications((prev) => [bNotif, ...prev]);
        saveNotificationApi(bNotif).catch((err) => console.error('Error saving notification:', err));
      });
    } else if (isBroadcastInvestigators || (isBroadcast && !isBroadcastInstitutions)) {
      const invUsers = users.filter((u) => u.role === 'ResponsiblePerson');
      invUsers.forEach((inv) => {
        const bNotif: NotificationItem = {
          id: 'NOTIF-' + Math.floor(100 + Math.random() * 900),
          recipientId: inv.id,
          userId: inv.id,
          title: extra?.priority === 'Urgent' ? 'Urgent Directive' : 'Admin Broadcast',
          message: `Admin Broadcast: "${text.substring(0, 50)}..."`,
          timestamp: nowStr,
          read: false,
          isRead: false,
          type: 'message',
        };
        setNotifications((prev) => [bNotif, ...prev]);
        saveNotificationApi(bNotif).catch((err) => console.error('Error saving notification:', err));
      });
    } else if (isInstitutionPortalRole(currentUser.role) && (recipientId === 'ADM-001' || isInstitutionSendingToAdmin)) {
      const admNotif: NotificationItem = {
        id: 'NOTIF-' + Math.floor(100 + Math.random() * 900),
        recipientId: 'ADM-001',
        userId: 'ADM-001',
        title: extra?.priority === 'Urgent' ? 'Urgent Message from Institution' : 'Message from Partner Institution',
        message: `${currentUser.institutionName || currentUser.fullName} (${currentUser.institutionCategory || 'Agency'}): "${text.substring(0, 50)}..."`,
        timestamp: nowStr,
        read: false,
        isRead: false,
        type: 'message',
        relatedTipId: currentUser.id,
      };
      setNotifications((prev) => [admNotif, ...prev]);
      saveNotificationApi(admNotif).catch((err) => console.error('Error saving message notification:', err));
    } else if (currentUser.role === 'ResponsiblePerson' && (recipientId === 'ADM-001' || isInvestigatorSendingToAdmin)) {
      const admNotif: NotificationItem = {
        id: 'NOTIF-' + Math.floor(100 + Math.random() * 900),
        recipientId: 'ADM-001',
        userId: 'ADM-001',
        title: extra?.priority === 'Urgent' ? 'Urgent Officer Message' : 'Message from Investigator',
        message: `${currentUser.fullName} (${currentUser.department || 'Field Officer'}): "${text.substring(0, 50)}..."`,
        timestamp: nowStr,
        read: false,
        isRead: false,
        type: 'message',
        relatedTipId: extra?.reportId || currentUser.id,
      };
      setNotifications((prev) => [admNotif, ...prev]);
      saveNotificationApi(admNotif).catch((err) => console.error('Error saving message notification:', err));
    } else if (recipientId) {
      const directNotif: NotificationItem = {
        id: 'NOTIF-' + Math.floor(100 + Math.random() * 900),
        recipientId,
        userId: recipientId,
        title: extra?.priority === 'Urgent' ? 'Urgent Message from Admin' : 'Message from Central Admin',
        message: `Admin ${currentUser.fullName}: "${text.substring(0, 45)}..."`,
        timestamp: nowStr,
        read: false,
        isRead: false,
        type: 'message',
      };
      setNotifications((prev) => [directNotif, ...prev]);
      saveNotificationApi(directNotif).catch((err) => console.error('Error saving message notification:', err));
    } else {
      const targetReport = reports.find((r) => r.id === reportIdOrChannel);
      let targetRecipientId = '';
      if (currentUser.role === 'Citizen') {
        targetRecipientId = targetReport?.assignedTo?.responsiblePersonId || 'ADM-001';
      } else {
        targetRecipientId = targetReport?.citizenId || '';
      }

      if (targetRecipientId && !targetRecipientId.startsWith('GUEST-')) {
        const msgNotif: NotificationItem = {
          id: 'NOTIF-' + Math.floor(100 + Math.random() * 900),
          recipientId: targetRecipientId,
          userId: targetRecipientId,
          title: 'New Secure Message',
          message: `New message received on report ${reportIdOrChannel}: "${text.substring(0, 40)}..."`,
          timestamp: nowStr,
          read: false,
          isRead: false,
          type: 'message',
          relatedTipId: reportIdOrChannel,
        };
        setNotifications((prev) => [msgNotif, ...prev]);
        saveNotificationApi(msgNotif).catch((err) => console.error('Error saving message notification:', err));
      }
    }
  };

  // Add user account
  const handleAddUser = (newUser: UserProfile) => {
    setUsers((prev) => [newUser, ...prev]);
    saveUserApi(newUser).catch((err) => console.error('Error adding user to Cloud SQL:', err));
  };

  // Update user profile details
  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    updateUserProfileApi(updatedUser.id, updatedUser).catch((err) =>
      console.error('Error updating user profile in Cloud SQL:', err)
    );

    // Audit Log Entry
    const auditEntry: AuditLogEntry = {
      id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: `${currentUser.fullName} (Admin)`,
      actorRole: 'Administrator',
      action: 'User Profile Updated',
      details: `Administrator updated profile details for ${updatedUser.fullName} [${updatedUser.id}] (${updatedUser.role}).`,
      targetId: updatedUser.id,
      ipAddress: '197.156.88.12',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
    saveAuditLogApi(auditEntry).catch(() => {});
  };

  // Delete user account permanently
  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    deleteUserApi(userId).catch((err) => console.error('Error deleting user from Cloud SQL:', err));

    // Audit Log Entry
    const auditEntry: AuditLogEntry = {
      id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: `${currentUser.fullName} (Admin)`,
      actorRole: 'Administrator',
      action: 'Permanent Account Deletion',
      details: `Permanently deleted account for ${targetUser?.fullName || userId} [${userId}] (${targetUser?.role || 'User'}).`,
      targetId: userId,
      ipAddress: '197.156.88.12',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
    saveAuditLogApi(auditEntry).catch(() => {});
  };

  // Update user status (active, suspended, banned)
  const handleUpdateUserStatus = (userId: string, status: 'active' | 'suspended' | 'banned') => {
    const targetUser = users.find((u) => u.id === userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
    updateUserStatusApi(userId, status).catch((err) => console.error('Error updating user status in Cloud SQL:', err));

    // Audit Log Entry
    const auditEntry: AuditLogEntry = {
      id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: `${currentUser.fullName} (Admin)`,
      actorRole: 'Administrator',
      action: 'Account Access Management',
      details: `Changed access status for ${targetUser?.fullName || userId} [${userId}] (${targetUser?.role}) to "${status.toUpperCase()}".`,
      targetId: userId,
      ipAddress: '197.156.88.12',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
    saveAuditLogApi(auditEntry).catch(() => {});
  };

  // Open review modal
  const handleOpenReviewModal = (report: ReportItem) => {
    setSelectedReviewReport(report);
    setReviewModalOpen(true);
  };

  // Open assign modal
  const handleOpenAssignModal = (report: ReportItem) => {
    setSelectedAssignReport(report);
    setAssignModalOpen(true);
  };

  const responsiblePersons = users.filter((u) => u.role === 'ResponsiblePerson');
  const displayUsers = users.length > 0 ? users : INITIAL_USERS;

  // IF NOT AUTHENTICATED: Display Login / Register Landing Page
  if (!isAuthenticated) {
    return (
      <LoginPage
        users={displayUsers}
        onLoginSuccess={handleLoginSuccess}
        onGuestAccess={handleGuestAccess}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-black dark:text-slate-100 transition-colors duration-200 font-['Poppins',sans-serif] flex flex-col selection:bg-[#005BAC] selection:text-white">
      {/* Top Navigation Bar with Notification Bell & Dropdown */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={userNotifications}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onSelectNotification={handleSelectNotification}
        onOpenSubmitModal={() => setSubmitReportModalOpen(true)}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      {/* Slide-Out Navigation Sidebar Drawer */}
      <SidebarNav
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSubmitModal={() => setSubmitReportModalOpen(true)}
        unreadCount={unreadCount}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Citizen Portal Views */}
        {activeTab === 'home' && (
          <CitizenHome
            currentUser={currentUser}
            reports={reports}
            trendingNews={trendingNews}
            notifications={userNotifications}
            unreadCount={unreadCount}
            onMarkAsRead={handleMarkNotificationAsRead}
            onMarkAllAsRead={handleMarkAllNotificationsAsRead}
            onSelectNotification={handleSelectNotification}
            onOpenSubmitModal={() => setSubmitReportModalOpen(true)}
            onNavigateTab={(tab, reportId) => {
              if (tab === 'track' && reportId) {
                setSelectedTrackReportId(reportId);
              } else if (tab === 'messages' && reportId) {
                setSelectedMessageReportId(reportId);
              }
              setActiveTab(tab);
            }}
          />
        )}

        {activeTab === 'my-submissions' && (
          <MySubmissions
            currentUser={currentUser}
            reports={reports}
            onOpenSubmitModal={() => setSubmitReportModalOpen(true)}
            onNavigateTab={(tab, reportId) => {
              if (tab === 'track' && reportId) {
                setSelectedTrackReportId(reportId);
              } else if (tab === 'messages' && reportId) {
                setSelectedMessageReportId(reportId);
              }
              setActiveTab(tab);
            }}
            onTrackReport={(reportId) => {
              setSelectedTrackReportId(reportId);
              setActiveTab('track');
            }}
            onOpenChat={(reportId) => {
              setSelectedMessageReportId(reportId);
              setActiveTab('messages');
            }}
          />
        )}

        {activeTab === 'track' && (
          <TrackReports
            currentUser={currentUser}
            reports={reports}
            messages={messages}
            onSendMessage={(reportId, text, attachment) => handleSendMessage(reportId, text, { attachment })}
            initialSelectedReportId={selectedTrackReportId}
            initialAccessCode={selectedTrackAccessCode}
          />
        )}

        {activeTab === 'messages' && (
          isInstitutionPortalRole(currentUser.role) ? (
            <InstitutionAdminChat
              currentUser={currentUser}
              messages={messages}
              onSendMessage={handleSendMessage}
              onNavigateToPublishNews={() => setActiveTab('institution-portal')}
            />
          ) : currentUser.role === 'ResponsiblePerson' ? (
            <InvestigatorAdminChat
              currentUser={currentUser}
              reports={reports}
              messages={messages}
              departments={departments}
              onSendMessage={handleSendMessage}
              onNavigateToCase={(_reportId) => {
                setActiveTab('investigator');
              }}
            />
          ) : currentUser.role === 'Administrator' ? (
            <AdminMessages
              currentUser={currentUser}
              messages={messages}
              reports={reports}
              users={users}
              departments={departments}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <CitizenMessages
              currentUser={currentUser}
              reports={reports}
              messages={messages}
              onSendMessage={(reportId, text, attachment) => handleSendMessage(reportId, text, { attachment })}
              initialSelectedReportId={selectedMessageReportId}
            />
          )
        )}

        {/* Notifications View for Registered Citizen, Investigator, and Admin */}
        {activeTab === 'notifications' && (
          <NotificationsPage
            currentUser={currentUser}
            notifications={notifications}
            onMarkAsRead={handleMarkNotificationAsRead}
            onMarkAllAsRead={handleMarkAllNotificationsAsRead}
            onDeleteNotification={handleDeleteNotification}
            onNavigateToTip={(tipId) => {
              if (currentUser.role === 'Administrator') {
                const r = reports.find((item) => item.id === tipId);
                if (r) handleOpenReviewModal(r);
                else setActiveTab('admin-overview');
              } else if (currentUser.role === 'ResponsiblePerson') {
                setActiveTab('investigator');
              } else if (isInstitutionPortalRole(currentUser.role)) {
                setActiveTab('institution-portal');
              } else {
                setSelectedTrackReportId(tipId);
                setActiveTab('track');
              }
            }}
            onNavigateToMessages={(tipId) => {
              if (currentUser.role === 'ResponsiblePerson') {
                setActiveTab('investigator-admin-chat');
              } else if (isInstitutionPortalRole(currentUser.role)) {
                setActiveTab('institution-admin-chat');
              } else if (currentUser.role === 'Administrator') {
                if (tipId && (tipId.startsWith('INST-') || users.some((u) => u.id === tipId && u.role === 'Institution'))) {
                  setActiveTab('institutions');
                } else {
                  setActiveTab('admin-messages');
                }
              } else {
                if (tipId) setSelectedMessageReportId(tipId);
                setActiveTab('messages');
              }
            }}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'published-reports' && (
          <PublishedReports
            currentUser={currentUser}
            reports={reports}
            trendingNews={trendingNews}
            mediaList={mediaList}
            channels={channels}
            onOpenSubmitModal={() => setSubmitReportModalOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <CitizenProfile
            currentUser={currentUser}
            reports={reports}
            messages={messages}
            onSendMessage={(reportId, text, attachment) => handleSendMessage(reportId, text, { attachment })}
            onLogout={handleLogout}
            onNavigateTab={setActiveTab}
            onUpdateProfile={(updated) => {
              const fullUser = { ...currentUser, ...updated };
              setCurrentUser(fullUser);
              setUsers((prev) => prev.map((u) => (u.id === fullUser.id ? fullUser : u)));
              saveUserApi(fullUser).catch((err) => console.error('Error saving profile to Cloud SQL:', err));
            }}
          />
        )}

        {activeTab === 'faq' && (
          <HelpFaq
            onOpenSubmitModal={() => setSubmitReportModalOpen(true)}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Administrator Dashboard Views */}
        {activeTab === 'admin-overview' && (
          <AdminOverview
            reports={reports}
            users={displayUsers}
            departments={departments}
            onOpenReviewModal={handleOpenReviewModal}
            onOpenAssignModal={handleOpenAssignModal}
          />
        )}

        {(activeTab === 'investigators' || activeTab === 'admin-messages') && (
          <AdminMessages
            currentUser={currentUser}
            users={displayUsers}
            reports={reports}
            departments={departments}
            messages={messages}
            onSendMessage={handleSendMessage}
            onOpenReviewModal={handleOpenReviewModal}
            onOpenAssignModal={handleOpenAssignModal}
          />
        )}

        {(activeTab === 'institutions' || activeTab === 'institutions-management' || activeTab === 'admin-institutions') && (
          <AdminInstitutions
            currentUser={currentUser}
            users={displayUsers}
            messages={messages}
            trendingNews={trendingNews}
            channels={channels}
            onSendMessage={handleSendMessage}
            onUpdateUser={handleUpdateUser}
            onUpdateUserStatus={handleUpdateUserStatus}
            onSaveChannel={handleSaveChannel}
            onVerifyChannel={handleVerifyChannel}
            onDeleteChannel={handleDeleteChannel}
          />
        )}

        {activeTab === 'users-management' && (
          <UserManagement
            users={displayUsers}
            departments={departments}
            reports={reports}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onUpdateUserStatus={handleUpdateUserStatus}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsReports reports={reports} departments={departments} users={displayUsers} />
        )}

        {activeTab === 'audit-logs' && <AuditLogViewer auditLogs={auditLogs} />}

        {/* Responsible Person / Investigator Workbench */}
        {activeTab === 'investigator' && (
          <InvestigatorDashboard
            currentUser={currentUser}
            reports={reports}
            messages={messages}
            onUpdateProfile={(updated) => {
              const fullUser = { ...currentUser, ...updated };
              setCurrentUser(fullUser);
              setUsers((prev) => prev.map((u) => (u.id === fullUser.id ? fullUser : u)));
              saveUserApi(fullUser).catch((err) => console.error('Error saving investigator profile to Cloud SQL:', err));
            }}
            onUpdateStatus={(reportId, status, findings) => {
              const target = reports.find((r) => r.id === reportId);
              if (target) {
                const updated: ReportItem = {
                  ...target,
                  status,
                  investigationFindings: findings || target.investigationFindings,
                  updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                };
                setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
                saveReportApi(updated).catch((err) =>
                  console.error('Error saving updated investigator report to Cloud SQL:', err)
                );

                // Notify citizen if registered
                if (target.citizenId && !target.isAnonymous) {
                  const czNotif: NotificationItem = {
                    id: 'NOTIF-' + Math.floor(100 + Math.random() * 900),
                    recipientId: target.citizenId,
                    userId: target.citizenId,
                    title: `Investigation Update: ${status}`,
                    message: `Investigator has updated your report ${reportId} to "${status}".`,
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                    read: false,
                    isRead: false,
                    type: 'status_update',
                    relatedTipId: reportId,
                  };
                  setNotifications((prev) => [czNotif, ...prev]);
                  saveNotificationApi(czNotif).catch((err) =>
                    console.error('Error saving investigator status notification:', err)
                  );
                }

                // Notify Admin
                const admNotif: NotificationItem = {
                  id: 'NOTIF-' + Math.floor(100 + Math.random() * 900),
                  recipientId: 'ADM-001',
                  userId: 'ADM-001',
                  title: 'Investigator Case Update',
                  message: `${currentUser.fullName} updated case ${reportId} to "${status}".`,
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                  read: false,
                  isRead: false,
                  type: 'status_update',
                  relatedTipId: reportId,
                };
                setNotifications((prev) => [admNotif, ...prev]);
                saveNotificationApi(admNotif).catch((err) =>
                  console.error('Error saving admin notification:', err)
                );
              }
            }}
            onSendMessage={(reportId, text, attachment) => handleSendMessage(reportId, text, { attachment })}
            onSendCaseMessage={(reportId, text, institutionId, attachment) =>
              handleSendMessage(reportId, text, {
                recipientId: institutionId,
                reportId,
                attachment,
              })
            }
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Responsible Person / Investigator Admin Chat */}
        {activeTab === 'investigator-admin-chat' && (
          <InvestigatorAdminChat
            currentUser={currentUser}
            reports={reports}
            messages={messages}
            departments={departments}
            onSendMessage={handleSendMessage}
            onNavigateToCase={(_reportId) => {
              setActiveTab('investigator');
            }}
          />
        )}

        {/* Institution Portal View */}
        {activeTab === 'institution-portal' && (
          <InstitutionDashboard
            currentUser={currentUser}
            trendingNews={trendingNews}
            reports={reports}
            messages={messages}
            channels={channels}
            mediaList={mediaList}
            onSendMessage={handleSendMessage}
            onUpdateReport={handleUpdateReport}
            onSendCaseMessage={(reportId, text, investigatorId, attachment) =>
              handleSendMessage(reportId, text, {
                recipientId: investigatorId,
                reportId,
                attachment,
              })
            }
            onPublishNews={handlePublishNews}
            onDeleteNews={handleDeleteNews}
            onSaveChannel={handleSaveChannel}
            onDeleteChannel={handleDeleteChannel}
            onAddMedia={handleAddMedia}
            onDeleteMedia={handleDeleteMedia}
            onSetPrimaryMedia={handleSetPrimaryMedia}
            onUpdateProfile={(updated) => {
              const fullUser = { ...currentUser, ...updated };
              setCurrentUser(fullUser);
              setUsers((prev) => prev.map((u) => (u.id === fullUser.id ? fullUser : u)));
              saveUserApi(fullUser).catch((err) =>
                console.error('Error saving institution profile to Cloud SQL:', err)
              );
            }}
          />
        )}

        {/* Institution Direct Chat with Central Administration */}
        {activeTab === 'institution-admin-chat' && (
          <InstitutionAdminChat
            currentUser={currentUser}
            messages={messages}
            onSendMessage={handleSendMessage}
            onNavigateToPublishNews={() => setActiveTab('institution-portal')}
          />
        )}
      </main>

      {/* Footer with Social Contact Links */}
      <footer className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 text-xs py-8 border-t border-slate-200 dark:border-slate-800 no-print mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-center sm:text-left">
            <AmecoLogo size="sm" showSubtitle={false} />
            <span className="font-semibold text-slate-900 dark:text-slate-300">Amhara Media Corporation</span>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-600">|</span>
            <span className="text-slate-600 dark:text-slate-400 text-[11px]">
              Official Citizen Journalism & Tip-off Gateway
            </span>
          </div>

          {/* Official AMECO Social Contact Links */}
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-bold hidden lg:inline">
              Connect with AMECO:
            </span>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/AmharaMediaCorporation"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:border-blue-300 dark:hover:border-blue-700/60 text-slate-800 dark:text-slate-200 transition-all group shadow-xs"
              title="Follow AMECO on Facebook"
            >
              <svg className="w-4 h-4 fill-current text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-300">Facebook</span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/ameco.et?igsh=emZ1NXoyNWhyaWtv"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-pink-950/60 hover:border-pink-700/60 text-slate-200 transition-all group"
              title="Follow AMECO on Instagram"
            >
              <svg className="w-4 h-4 fill-current text-pink-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-xs font-bold text-slate-200 group-hover:text-pink-300">Instagram</span>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com/@amharamediacorporation?si=87Asj2M4IWZa9C0h"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-red-950/60 hover:border-red-700/60 text-slate-200 transition-all group"
              title="Subscribe to AMECO YouTube Channel"
            >
              <svg className="w-4 h-4 fill-current text-red-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="text-xs font-bold text-slate-200 group-hover:text-red-300">YouTube</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}

      <SubmitReportModal
        isOpen={submitReportModalOpen}
        onClose={() => setSubmitReportModalOpen(false)}
        currentUser={currentUser}
        initialType={submitType}
        onSubmitReport={handleSubmitReport}
        onTrackTip={(trackingCode, accessCode) => {
          setSelectedTrackReportId(trackingCode);
          setSelectedTrackAccessCode(accessCode);
          setActiveTab('track');
        }}
      />

      <ReportReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        report={selectedReviewReport}
        onUpdateReport={handleUpdateReport}
        onRevealIdentity={handleRevealIdentity}
        onOpenAssignModal={handleOpenAssignModal}
        publishers={displayUsers.filter((u) => u.role === 'Publisher' || u.role === 'Institution')}
        mediaList={mediaList}
        verifiedChannels={channels.filter((c) => c.verificationStatus === 'Verified')}
        currentUser={currentUser}
        onAddMedia={handleAddMedia}
        onDeleteMedia={handleDeleteMedia}
        onSetPrimaryMedia={handleSetPrimaryMedia}
        onVerifyMedia={handleVerifyMedia}
      />

      <AssignmentModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        report={selectedAssignReport}
        responsiblePersons={
          responsiblePersons.length > 0
            ? responsiblePersons
            : displayUsers.filter((u) => u.role === 'ResponsiblePerson')
        }
        departments={departments}
        reports={reports}
        onAssignReport={handleAssignReport}
      />

      {currentUser.role !== 'Citizen' && (
        <NotificationDrawer
          isOpen={notificationDrawerOpen}
          onClose={() => setNotificationDrawerOpen(false)}
          notifications={userNotifications}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onClearNotifications={() => {
            setNotifications((prev) =>
              prev.filter(
                (n) => n.userId !== currentUser.id && n.recipientId !== currentUser.id
              )
            );
          }}
        />
      )}
    </div>
  );
}
