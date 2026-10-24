import { Pool } from 'pg';
import {
  UserProfile,
  ReportItem,
  Message,
  AuditLogEntry,
  NotificationItem,
  Department,
  TrendingNewsItem,
  InstitutionSocialChannel,
  ReportMedia,
} from '../types.ts';
import { createPool, isPostgresDbConfigured } from './index.ts';

let isTablesInitialized = false;

/**
 * Returns true if PostgreSQL connection pool is configured
 */
export function isPostgresAvailable(): boolean {
  return isPostgresDbConfigured();
}

/**
 * Get active PostgreSQL pool
 */
export function getPostgresPool(): Pool | null {
  return createPool();
}

/**
 * Initialize all tables in PostgreSQL if not already present
 */
export async function initializePostgresTables(): Promise<boolean> {
  if (isTablesInitialized) return true;
  const pool = getPostgresPool();
  if (!pool) return false;

  const ddl = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Citizen',
      status TEXT NOT NULL DEFAULT 'active',
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL DEFAULT 'tipoff',
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      citizen_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Submitted',
      priority TEXT NOT NULL DEFAULT 'Medium',
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      recipient_id TEXT,
      type TEXT NOT NULL,
      read BOOLEAN DEFAULT false,
      timestamp TEXT NOT NULL,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      head TEXT NOT NULL,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trending_news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      institution_id TEXT NOT NULL,
      published_at TEXT NOT NULL,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS institution_social_channels (
      id TEXT PRIMARY KEY,
      institution_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      channel_name TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'Pending Verification',
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS report_media (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      institution_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      title TEXT NOT NULL,
      is_primary BOOLEAN DEFAULT false,
      data JSONB NOT NULL
    );
  `;

  try {
    await pool.query(ddl);
    isTablesInitialized = true;
    console.log('[PostgreSQL] Connected and verified all tables in Cloud PostgreSQL (Neon).');
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] Table initialization warning:', err.message);
    return false;
  }
}

// ============================
// USERS
// ============================
export async function pgGetAllUsers(): Promise<UserProfile[] | null> {
  const pool = getPostgresPool();
  if (!pool) return null;
  try {
    const res = await pool.query('SELECT data FROM users');
    if (res.rows && res.rows.length > 0) {
      return res.rows.map((r) => r.data as UserProfile);
    }
    return [];
  } catch (err: any) {
    console.warn('[PostgreSQL] pgGetAllUsers warning:', err.message);
    return null;
  }
}

export async function pgUpsertUser(user: UserProfile): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query(
      `INSERT INTO users (id, email, full_name, role, status, data)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         status = EXCLUDED.status,
         data = EXCLUDED.data`,
      [user.id, user.email, user.fullName, user.role, user.status, JSON.stringify(user)]
    );
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgUpsertUser warning:', err.message);
    return false;
  }
}

export async function pgUpdateUserStatus(userId: string, status: string): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query(
      `UPDATE users SET status = $1, data = jsonb_set(data, '{status}', to_jsonb($1::text)) WHERE id = $2`,
      [status, userId]
    );
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgUpdateUserStatus warning:', err.message);
    return false;
  }
}

export async function pgDeleteUser(userId: string): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgDeleteUser warning:', err.message);
    return false;
  }
}

// ============================
// REPORTS
// ============================
export async function pgGetAllReports(): Promise<ReportItem[] | null> {
  const pool = getPostgresPool();
  if (!pool) return null;
  try {
    const res = await pool.query('SELECT data FROM reports');
    if (res.rows && res.rows.length > 0) {
      return res.rows.map((r) => r.data as ReportItem);
    }
    return [];
  } catch (err: any) {
    console.warn('[PostgreSQL] pgGetAllReports warning:', err.message);
    return null;
  }
}

export async function pgUpsertReport(report: ReportItem): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query(
      `INSERT INTO reports (id, type, title, category, citizen_id, status, priority, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         type = EXCLUDED.type,
         title = EXCLUDED.title,
         category = EXCLUDED.category,
         citizen_id = EXCLUDED.citizen_id,
         status = EXCLUDED.status,
         priority = EXCLUDED.priority,
         data = EXCLUDED.data`,
      [
        report.id,
        report.type || 'tipoff',
        report.title,
        report.category,
        report.citizenId,
        report.status,
        report.priority,
        JSON.stringify(report),
      ]
    );
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgUpsertReport warning:', err.message);
    return false;
  }
}

export async function pgDeleteReport(reportId: string): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query('DELETE FROM reports WHERE id = $1', [reportId]);
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgDeleteReport warning:', err.message);
    return false;
  }
}

// ============================
// MESSAGES
// ============================
export async function pgGetAllMessages(): Promise<Message[] | null> {
  const pool = getPostgresPool();
  if (!pool) return null;
  try {
    const res = await pool.query('SELECT data FROM messages ORDER BY timestamp ASC');
    if (res.rows && res.rows.length > 0) {
      return res.rows.map((r) => r.data as Message);
    }
    return [];
  } catch (err: any) {
    console.warn('[PostgreSQL] pgGetAllMessages warning:', err.message);
    return null;
  }
}

export async function pgCreateMessage(msg: Message): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query(
      `INSERT INTO messages (id, report_id, sender_id, sender_role, timestamp, data)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      [msg.id, msg.reportId, msg.senderId, msg.senderRole, msg.timestamp, JSON.stringify(msg)]
    );
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgCreateMessage warning:', err.message);
    return false;
  }
}

// ============================
// AUDIT LOGS
// ============================
export async function pgGetAllAuditLogs(): Promise<AuditLogEntry[] | null> {
  const pool = getPostgresPool();
  if (!pool) return null;
  try {
    const res = await pool.query('SELECT data FROM audit_logs ORDER BY timestamp DESC');
    if (res.rows && res.rows.length > 0) {
      return res.rows.map((r) => r.data as AuditLogEntry);
    }
    return [];
  } catch (err: any) {
    console.warn('[PostgreSQL] pgGetAllAuditLogs warning:', err.message);
    return null;
  }
}

export async function pgCreateAuditLog(log: AuditLogEntry): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query(
      `INSERT INTO audit_logs (id, timestamp, actor_name, actor_role, action, data)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      [log.id, log.timestamp, log.actorName, log.actorRole, log.action, JSON.stringify(log)]
    );
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgCreateAuditLog warning:', err.message);
    return false;
  }
}

// ============================
// NOTIFICATIONS
// ============================
export async function pgGetAllNotifications(): Promise<NotificationItem[] | null> {
  const pool = getPostgresPool();
  if (!pool) return null;
  try {
    const res = await pool.query('SELECT data FROM notifications ORDER BY timestamp DESC');
    if (res.rows && res.rows.length > 0) {
      return res.rows.map((r) => r.data as NotificationItem);
    }
    return [];
  } catch (err: any) {
    console.warn('[PostgreSQL] pgGetAllNotifications warning:', err.message);
    return null;
  }
}

export async function pgCreateNotification(notif: NotificationItem): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query(
      `INSERT INTO notifications (id, user_id, recipient_id, type, read, timestamp, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, read = EXCLUDED.read`,
      [
        notif.id,
        notif.userId,
        notif.recipientId || null,
        notif.type,
        Boolean(notif.read || notif.isRead),
        notif.timestamp,
        JSON.stringify(notif),
      ]
    );
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgCreateNotification warning:', err.message);
    return false;
  }
}

export async function pgMarkNotificationAsRead(id: string): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query(
      `UPDATE notifications SET read = true, data = jsonb_set(jsonb_set(data, '{read}', 'true'::jsonb), '{isRead}', 'true'::jsonb) WHERE id = $1`,
      [id]
    );
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgMarkNotificationAsRead warning:', err.message);
    return false;
  }
}

export async function pgMarkAllNotificationsAsRead(userId?: string): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    if (userId) {
      await pool.query(
        `UPDATE notifications SET read = true, data = jsonb_set(jsonb_set(data, '{read}', 'true'::jsonb), '{isRead}', 'true'::jsonb) WHERE user_id = $1 OR recipient_id = $1`,
        [userId]
      );
    } else {
      await pool.query(
        `UPDATE notifications SET read = true, data = jsonb_set(jsonb_set(data, '{read}', 'true'::jsonb), '{isRead}', 'true'::jsonb)`
      );
    }
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgMarkAllNotificationsAsRead warning:', err.message);
    return false;
  }
}

export async function pgDeleteNotification(id: string): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgDeleteNotification warning:', err.message);
    return false;
  }
}

// ============================
// DEPARTMENTS
// ============================
export async function pgGetAllDepartments(): Promise<Department[] | null> {
  const pool = getPostgresPool();
  if (!pool) return null;
  try {
    const res = await pool.query('SELECT data FROM departments');
    if (res.rows && res.rows.length > 0) {
      return res.rows.map((r) => r.data as Department);
    }
    return [];
  } catch (err: any) {
    console.warn('[PostgreSQL] pgGetAllDepartments warning:', err.message);
    return null;
  }
}

export async function pgCreateDepartment(dept: Department): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query(
      `INSERT INTO departments (id, name, head, data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, head = EXCLUDED.head, data = EXCLUDED.data`,
      [dept.id, dept.name, dept.head, JSON.stringify(dept)]
    );
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgCreateDepartment warning:', err.message);
    return false;
  }
}

export async function pgDeleteDepartment(id: string): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query('DELETE FROM departments WHERE id = $1', [id]);
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgDeleteDepartment warning:', err.message);
    return false;
  }
}

// ============================
// TRENDING NEWS
// ============================
export async function pgGetAllTrendingNews(): Promise<TrendingNewsItem[] | null> {
  const pool = getPostgresPool();
  if (!pool) return null;
  try {
    const res = await pool.query('SELECT data FROM trending_news');
    if (res.rows && res.rows.length > 0) {
      return res.rows.map((r) => r.data as TrendingNewsItem);
    }
    return [];
  } catch (err: any) {
    console.warn('[PostgreSQL] pgGetAllTrendingNews warning:', err.message);
    return null;
  }
}

export async function pgCreateTrendingNews(news: TrendingNewsItem): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query(
      `INSERT INTO trending_news (id, title, category, institution_id, published_at, data)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      [news.id, news.title, news.category, news.institutionId, news.publishedAt, JSON.stringify(news)]
    );
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgCreateTrendingNews warning:', err.message);
    return false;
  }
}

// ============================
// SOCIAL CHANNELS
// ============================
export async function pgGetAllChannels(): Promise<InstitutionSocialChannel[] | null> {
  const pool = getPostgresPool();
  if (!pool) return null;
  try {
    const res = await pool.query('SELECT data FROM institution_social_channels');
    if (res.rows && res.rows.length > 0) {
      return res.rows.map((r) => r.data as InstitutionSocialChannel);
    }
    return [];
  } catch (err: any) {
    console.warn('[PostgreSQL] pgGetAllChannels warning:', err.message);
    return null;
  }
}

export async function pgUpsertChannel(channel: InstitutionSocialChannel): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query(
      `INSERT INTO institution_social_channels (id, institution_id, platform, channel_name, verification_status, data)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         institution_id = EXCLUDED.institution_id,
         platform = EXCLUDED.platform,
         channel_name = EXCLUDED.channel_name,
         verification_status = EXCLUDED.verification_status,
         data = EXCLUDED.data`,
      [
        channel.id,
        channel.institutionId,
        channel.platform,
        channel.channelName,
        channel.verificationStatus,
        JSON.stringify(channel),
      ]
    );
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgUpsertChannel warning:', err.message);
    return false;
  }
}

export async function pgDeleteChannel(id: string): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query('DELETE FROM institution_social_channels WHERE id = $1', [id]);
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgDeleteChannel warning:', err.message);
    return false;
  }
}

// ============================
// REPORT MEDIA
// ============================
export async function pgGetAllReportMedia(): Promise<ReportMedia[] | null> {
  const pool = getPostgresPool();
  if (!pool) return null;
  try {
    const res = await pool.query('SELECT data FROM report_media');
    if (res.rows && res.rows.length > 0) {
      return res.rows.map((r) => r.data as ReportMedia);
    }
    return [];
  } catch (err: any) {
    console.warn('[PostgreSQL] pgGetAllReportMedia warning:', err.message);
    return null;
  }
}

export async function pgUpsertReportMedia(media: ReportMedia): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query(
      `INSERT INTO report_media (id, report_id, institution_id, platform, title, is_primary, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         report_id = EXCLUDED.report_id,
         institution_id = EXCLUDED.institution_id,
         platform = EXCLUDED.platform,
         title = EXCLUDED.title,
         is_primary = EXCLUDED.is_primary,
         data = EXCLUDED.data`,
      [
        media.id,
        media.reportId,
        media.institutionId,
        media.platform,
        media.title,
        Boolean(media.isPrimary),
        JSON.stringify(media),
      ]
    );
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgUpsertReportMedia warning:', err.message);
    return false;
  }
}

export async function pgDeleteReportMedia(id: string): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  try {
    await pool.query('DELETE FROM report_media WHERE id = $1', [id]);
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] pgDeleteReportMedia warning:', err.message);
    return false;
  }
}
