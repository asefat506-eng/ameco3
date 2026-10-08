import {
  getMongoDb,
  isMongoConnected,
  getUsersCollection,
  getReportsCollection,
  getMessagesCollection,
  getAuditLogsCollection,
  getNotificationsCollection,
  getDepartmentsCollection,
  getTrendingNewsCollection,
  getChannelsCollection,
  getReportMediaCollection,
  MONGODB_URI,
  MONGODB_DB_NAME,
} from './mongodb.ts';
import {
  INITIAL_USERS,
  INITIAL_REPORTS,
  INITIAL_MESSAGES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DEPARTMENTS,
  INITIAL_TRENDING_NEWS,
  INITIAL_CHANNELS,
  INITIAL_REPORT_MEDIA,
} from '../data/initialData.ts';
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
  ChannelVerificationStatus,
  MediaVerificationStatus,
} from '../types.ts';
import { hashPassword, isBcryptHash, sanitizeUser, sanitizeUsers } from '../utils/authSecurity.ts';

// In-memory runtime cache for instantaneous response and offline fallback
let memoryUsers: UserProfile[] = JSON.parse(JSON.stringify(INITIAL_USERS));
let memoryReports: ReportItem[] = JSON.parse(JSON.stringify(INITIAL_REPORTS));
let memoryMessages: Message[] = JSON.parse(JSON.stringify(INITIAL_MESSAGES));
let memoryAuditLogs: AuditLogEntry[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
let memoryNotifications: NotificationItem[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
let memoryDepartments: Department[] = JSON.parse(JSON.stringify(INITIAL_DEPARTMENTS));
let memoryTrendingNews: TrendingNewsItem[] = JSON.parse(JSON.stringify(INITIAL_TRENDING_NEWS));
let memoryChannels: InstitutionSocialChannel[] = JSON.parse(JSON.stringify(INITIAL_CHANNELS));
let memoryReportMedia: ReportMedia[] = JSON.parse(JSON.stringify(INITIAL_REPORT_MEDIA));

let isDatabaseInitialized = false;

/**
 * Determine default password for initial seed personas and ensure it is hashed
 */
async function getHashedDefaultPasswordForUser(user: Partial<UserProfile>): Promise<string> {
  if (user.password && isBcryptHash(user.password)) {
    return user.password;
  }
  let plain = user.password;
  if (!plain) {
    if (user.role === 'Administrator') {
      plain = 'admin123';
    } else if (user.role === 'Citizen') {
      plain = user.id === 'CZN-2026-00125' ? 'Abebe@123' : 'Citizen@123';
    } else {
      plain = 'password123';
    }
  }
  return await hashPassword(plain);
}

/**
 * Seed MongoDB with initial datasets if collections are empty and migrate any plain-text passwords
 */
export async function seedDatabaseIfEmpty(): Promise<void> {
  if (isDatabaseInitialized) return;
  isDatabaseInitialized = true;

  try {
    const mongoDb = await getMongoDb();
    if (!mongoDb) {
      console.log('ℹ️ [DB] Running with active memory store (MongoDB ready at ' + MONGODB_URI + ')');
      // Pre-hash in-memory users as well
      for (const u of memoryUsers) {
        if (u.password && !isBcryptHash(u.password)) {
          u.password = await hashPassword(u.password);
        } else if (!u.password) {
          u.password = await getHashedDefaultPasswordForUser(u);
        }
      }
      return;
    }

    console.log(`[MongoDB] Checking collections in database "${MONGODB_DB_NAME}"...`);

    // 1. Seed & Migrate Users Collection
    const usersCol = await getUsersCollection();
    if (usersCol) {
      const userCount = await usersCol.countDocuments({});
      if (userCount === 0) {
        console.log(`[MongoDB] Seeding initial users with secure bcrypt hashed passwords into collection...`);
        const usersToInsert = await Promise.all(
          INITIAL_USERS.map(async (u) => {
            const hashedPassword = await getHashedDefaultPasswordForUser(u);
            return {
              ...u,
              userId: u.userId || u.id,
              password: hashedPassword,
              createdAt: u.createdAt || new Date().toISOString(),
              updatedAt: u.updatedAt || new Date().toISOString(),
            };
          })
        );
        await usersCol.insertMany(usersToInsert as any);
      } else {
        // A. Sync any missing initial users
        for (const u of INITIAL_USERS) {
          const exists = await usersCol.findOne({
            $or: [{ id: u.id }, { email: u.email.toLowerCase() }],
          });
          if (!exists) {
            const hashedPassword = await getHashedDefaultPasswordForUser(u);
            await usersCol.insertOne({
              ...u,
              userId: u.userId || u.id,
              password: hashedPassword,
              createdAt: u.createdAt || new Date().toISOString(),
              updatedAt: u.updatedAt || new Date().toISOString(),
            } as any);
          }
        }

        // B. AUTOMATIC PASSWORD MIGRATION: Find any legacy plain-text passwords and hash them with bcrypt
        const allDbUsers = await usersCol.find({}).toArray();
        let migratedCount = 0;
        for (const doc of allDbUsers) {
          if (doc.password && !isBcryptHash(doc.password)) {
            const hashedPassword = await hashPassword(doc.password);
            await usersCol.updateOne(
              { _id: doc._id },
              { $set: { password: hashedPassword, updatedAt: new Date().toISOString() } }
            );
            migratedCount++;
            console.log(`[Security Migration] Converted plain-text password to bcrypt hash for user: ${doc.id} (${doc.email})`);
          } else if (!doc.password) {
            const hashedPassword = await getHashedDefaultPasswordForUser(doc);
            await usersCol.updateOne(
              { _id: doc._id },
              { $set: { password: hashedPassword, updatedAt: new Date().toISOString() } }
            );
          }
        }
        if (migratedCount > 0) {
          console.log(`[Security Migration] Successfully migrated ${migratedCount} plain-text password(s) to bcrypt hashes.`);
        }
      }
    }

    // 2. Seed Departments Collection
    const deptsCol = await getDepartmentsCollection();
    if (deptsCol) {
      const deptCount = await deptsCol.countDocuments({});
      if (deptCount === 0) {
        console.log(`[MongoDB] Seeding initial departments into collection...`);
        await deptsCol.insertMany(INITIAL_DEPARTMENTS as any);
      }
    }

    // 3. Seed Trending News Collection
    const newsCol = await getTrendingNewsCollection();
    if (newsCol) {
      const newsCount = await newsCol.countDocuments({});
      if (newsCount === 0) {
        console.log(`[MongoDB] Seeding initial trending news into collection...`);
        await newsCol.insertMany(INITIAL_TRENDING_NEWS as any);
      }
    }

    // 4. Seed Social Channels Collection
    const channelsCol = await getChannelsCollection();
    if (channelsCol) {
      const chanCount = await channelsCol.countDocuments({});
      if (chanCount === 0) {
        console.log(`[MongoDB] Seeding initial verified social channels into collection...`);
        await channelsCol.insertMany(INITIAL_CHANNELS as any);
      }
    }

    // 5. Seed Report Media Collection
    const mediaCol = await getReportMediaCollection();
    if (mediaCol) {
      const mediaCount = await mediaCol.countDocuments({});
      if (mediaCount === 0) {
        console.log(`[MongoDB] Seeding initial report media into collection...`);
        await mediaCol.insertMany(INITIAL_REPORT_MEDIA as any);
      }
    }

    // 6. Clean demo reports from reports collection if any
    const reportsCol = await getReportsCollection();
    if (reportsCol) {
      await reportsCol.deleteMany({
        id: { $in: ['AMECO-2026-8941', 'AMECO-2026-8942', 'AMECO-2026-8943', 'AMECO-2026-8944'] },
      });
    }

    console.log(`[MongoDB] Database initialized and synchronized successfully.`);
  } catch (error: any) {
    console.warn('[MongoDB] Database seeding notice:', error.message);
  }
}

// ============================
// USERS QUERIES
// ============================
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const col = await getUsersCollection();
    if (col) {
      const docs = await col.find({}).toArray();
      if (docs && docs.length > 0) {
        const mappedUsers: UserProfile[] = docs.map((doc: any) => {
          const { _id, ...cleanUser } = doc;
          return {
            ...cleanUser,
            userId: cleanUser.userId || cleanUser.id,
            status: cleanUser.status || 'active',
            reputationScore: cleanUser.reputationScore ?? 100,
            verified: cleanUser.verified ?? true,
          };
        });
        memoryUsers = mappedUsers;
        return mappedUsers;
      }
    }
  } catch (err: any) {
    console.warn('[MongoDB] Error fetching users from MongoDB:', err.message);
  }
  return [...memoryUsers];
}

export async function upsertUser(user: UserProfile): Promise<UserProfile> {
  const nowStr = new Date().toISOString();
  
  // Look up existing user to preserve existing hashed password if not provided
  const existingIdx = memoryUsers.findIndex(
    (u) => u.id === user.id || (u.email && u.email.toLowerCase() === (user.email || '').toLowerCase())
  );
  const existingUser = existingIdx >= 0 ? memoryUsers[existingIdx] : undefined;

  let resolvedPassword = user.password;
  if (resolvedPassword && resolvedPassword.trim()) {
    if (!isBcryptHash(resolvedPassword)) {
      resolvedPassword = await hashPassword(resolvedPassword);
    }
  } else if (existingUser?.password) {
    resolvedPassword = existingUser.password;
  }

  const normalizedUser: UserProfile = {
    ...user,
    userId: user.userId || user.id,
    city: user.city || user.cityTown,
    cityTown: user.cityTown || user.city,
    password: resolvedPassword,
    updatedAt: user.updatedAt || nowStr,
    createdAt: user.createdAt || existingUser?.createdAt || nowStr,
  };

  // Sync Memory
  if (existingIdx >= 0) {
    memoryUsers[existingIdx] = { ...memoryUsers[existingIdx], ...normalizedUser };
  } else {
    memoryUsers.unshift(normalizedUser);
  }

  // Persist to MongoDB
  try {
    const col = await getUsersCollection();
    if (col) {
      await col.updateOne(
        {
          $or: [
            { id: normalizedUser.id },
            { email: (normalizedUser.email || '').toLowerCase() },
          ],
        },
        { $set: normalizedUser },
        { upsert: true }
      );
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not persist user to MongoDB:', err.message);
  }

  return normalizedUser;
}

export async function updateUserStatus(
  userId: string,
  status: 'active' | 'suspended' | 'pending' | 'banned'
): Promise<void> {
  const user = memoryUsers.find((u) => u.id === userId);
  if (user) {
    user.status = status;
    user.updatedAt = new Date().toISOString();
  }

  try {
    const col = await getUsersCollection();
    if (col) {
      await col.updateOne(
        { $or: [{ id: userId }, { userId }] },
        { $set: { status, updatedAt: new Date().toISOString() } }
      );
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not update user status in MongoDB:', err.message);
  }
}

export async function deleteUser(userId: string): Promise<void> {
  memoryUsers = memoryUsers.filter((u) => u.id !== userId);
  try {
    const col = await getUsersCollection();
    if (col) {
      await col.deleteOne({ $or: [{ id: userId }, { userId }] });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not delete user from MongoDB:', err.message);
  }
}

// ============================
// REPORTS QUERIES
// ============================
export async function getAllReports(): Promise<ReportItem[]> {
  try {
    const col = await getReportsCollection();
    if (col) {
      const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
      if (docs && docs.length > 0) {
        const mappedReports: ReportItem[] = docs.map((doc: any) => {
          const { _id, ...cleanReport } = doc;
          return {
            ...cleanReport,
            type: (cleanReport.type || 'tipoff') as ReportItem['type'],
            region: cleanReport.region || 'Amhara',
            zone: cleanReport.zone || '',
            status: cleanReport.status || 'Received',
            priority: cleanReport.priority || 'Medium',
            trackingCode: cleanReport.trackingCode || cleanReport.id,
            evidence: cleanReport.evidence || [],
            publicStatusUpdates: cleanReport.publicStatusUpdates || [],
          };
        });
        memoryReports = mappedReports;
        return mappedReports;
      }
    }
  } catch (err: any) {
    console.warn('[MongoDB] Error fetching reports from MongoDB:', err.message);
  }
  return [...memoryReports].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

export async function upsertReport(report: ReportItem): Promise<ReportItem> {
  const nowStr = new Date().toISOString();
  const normalized: ReportItem = {
    ...report,
    type: report.type || 'tipoff',
    trackingCode: report.trackingCode || report.id,
    createdAt: report.createdAt || nowStr,
    updatedAt: nowStr,
    evidence: report.evidence || [],
    publicStatusUpdates: report.publicStatusUpdates || [],
  };

  // Sync Memory
  const existingIdx = memoryReports.findIndex((r) => r.id === normalized.id);
  if (existingIdx >= 0) {
    memoryReports[existingIdx] = { ...memoryReports[existingIdx], ...normalized };
  } else {
    memoryReports.unshift(normalized);
  }

  // Persist to MongoDB
  try {
    const col = await getReportsCollection();
    if (col) {
      await col.updateOne({ id: normalized.id }, { $set: normalized }, { upsert: true });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not upsert report to MongoDB:', err.message);
  }

  return normalized;
}

export async function deleteReport(reportId: string): Promise<void> {
  memoryReports = memoryReports.filter((r) => r.id !== reportId);
  try {
    const col = await getReportsCollection();
    if (col) {
      await col.deleteOne({ id: reportId });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not delete report from MongoDB:', err.message);
  }
}

// ============================
// MESSAGES QUERIES
// ============================
export async function getAllMessages(): Promise<Message[]> {
  try {
    const col = await getMessagesCollection();
    if (col) {
      const docs = await col.find({}).sort({ timestamp: 1 }).toArray();
      if (docs && docs.length > 0) {
        const mapped = docs.map((d: any) => {
          const { _id, ...clean } = d;
          return clean as Message;
        });
        memoryMessages = mapped;
        return mapped;
      }
    }
  } catch (err: any) {
    console.warn('[MongoDB] Error fetching messages from MongoDB:', err.message);
  }
  return [...memoryMessages];
}

export async function createMessage(msg: Message): Promise<Message> {
  memoryMessages.push(msg);
  try {
    const col = await getMessagesCollection();
    if (col) {
      await col.updateOne({ id: msg.id }, { $set: msg }, { upsert: true });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not save message to MongoDB:', err.message);
  }
  return msg;
}

// ============================
// AUDIT LOGS QUERIES
// ============================
export async function getAllAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const col = await getAuditLogsCollection();
    if (col) {
      const docs = await col.find({}).sort({ timestamp: -1 }).toArray();
      if (docs && docs.length > 0) {
        const mapped = docs.map((d: any) => {
          const { _id, ...clean } = d;
          return clean as AuditLogEntry;
        });
        memoryAuditLogs = mapped;
        return mapped;
      }
    }
  } catch (err: any) {
    console.warn('[MongoDB] Error fetching audit logs from MongoDB:', err.message);
  }
  return [...memoryAuditLogs];
}

export async function createAuditLog(log: AuditLogEntry): Promise<AuditLogEntry> {
  memoryAuditLogs.unshift(log);
  try {
    const col = await getAuditLogsCollection();
    if (col) {
      await col.insertOne(log as any);
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not save audit log to MongoDB:', err.message);
  }
  return log;
}

// ============================
// NOTIFICATIONS QUERIES
// ============================
export async function getAllNotifications(): Promise<NotificationItem[]> {
  try {
    const col = await getNotificationsCollection();
    if (col) {
      const docs = await col.find({}).sort({ timestamp: -1 }).toArray();
      if (docs && docs.length > 0) {
        const mapped = docs.map((d: any) => {
          const { _id, ...clean } = d;
          return clean as NotificationItem;
        });
        memoryNotifications = mapped;
        return mapped;
      }
    }
  } catch (err: any) {
    console.warn('[MongoDB] Error fetching notifications from MongoDB:', err.message);
  }
  return [...memoryNotifications];
}

export async function createNotification(notif: NotificationItem): Promise<NotificationItem> {
  memoryNotifications.unshift(notif);
  try {
    const col = await getNotificationsCollection();
    if (col) {
      await col.updateOne({ id: notif.id }, { $set: notif }, { upsert: true });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not save notification to MongoDB:', err.message);
  }
  return notif;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const notif = memoryNotifications.find((n) => n.id === id);
  if (notif) notif.read = true;

  try {
    const col = await getNotificationsCollection();
    if (col) {
      await col.updateOne({ id }, { $set: { read: true } });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not mark notification as read in MongoDB:', err.message);
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  memoryNotifications.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });

  try {
    const col = await getNotificationsCollection();
    if (col) {
      await col.updateMany({ userId }, { $set: { read: true } });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not mark all notifications read in MongoDB:', err.message);
  }
}

export async function deleteNotificationById(id: string): Promise<void> {
  memoryNotifications = memoryNotifications.filter((n) => n.id !== id);
  try {
    const col = await getNotificationsCollection();
    if (col) {
      await col.deleteOne({ id });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not delete notification in MongoDB:', err.message);
  }
}

// ============================
// DEPARTMENTS QUERIES
// ============================
export async function getAllDepartments(): Promise<Department[]> {
  try {
    const col = await getDepartmentsCollection();
    if (col) {
      const docs = await col.find({}).toArray();
      if (docs && docs.length > 0) {
        const mapped = docs.map((d: any) => {
          const { _id, ...clean } = d;
          return clean as Department;
        });
        memoryDepartments = mapped;
        return mapped;
      }
    }
  } catch (err: any) {
    console.warn('[MongoDB] Error fetching departments from MongoDB:', err.message);
  }
  return [...memoryDepartments];
}

export async function createDepartment(dept: Department): Promise<Department> {
  const existingIdx = memoryDepartments.findIndex((d) => d.id === dept.id);
  if (existingIdx >= 0) {
    memoryDepartments[existingIdx] = { ...memoryDepartments[existingIdx], ...dept };
  } else {
    memoryDepartments.push(dept);
  }

  try {
    const col = await getDepartmentsCollection();
    if (col) {
      await col.updateOne({ id: dept.id }, { $set: dept }, { upsert: true });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not save department to MongoDB:', err.message);
  }
  return dept;
}

export async function deleteDepartment(deptId: string): Promise<void> {
  memoryDepartments = memoryDepartments.filter((d) => d.id !== deptId);
  try {
    const col = await getDepartmentsCollection();
    if (col) {
      await col.deleteOne({ id: deptId });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not delete department from MongoDB:', err.message);
  }
}

// ============================
// TRENDING NEWS QUERIES
// ============================
export async function getAllTrendingNews(): Promise<TrendingNewsItem[]> {
  try {
    const col = await getTrendingNewsCollection();
    if (col) {
      const docs = await col.find({}).sort({ publishedAt: -1 }).toArray();
      if (docs && docs.length > 0) {
        const mapped = docs.map((n: any) => {
          const { _id, ...clean } = n;
          return clean as TrendingNewsItem;
        });
        memoryTrendingNews = mapped;
        return mapped;
      }
    }
  } catch (err: any) {
    console.warn('[MongoDB] Error fetching trending news from MongoDB:', err.message);
  }
  return [...memoryTrendingNews].sort(
    (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
  );
}

export async function createTrendingNews(item: TrendingNewsItem): Promise<TrendingNewsItem> {
  memoryTrendingNews.unshift(item);
  try {
    const col = await getTrendingNewsCollection();
    if (col) {
      await col.updateOne({ id: item.id }, { $set: item }, { upsert: true });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not save trending news to MongoDB:', err.message);
  }
  return item;
}

// ============================
// INSTITUTION SOCIAL CHANNELS QUERIES
// ============================
export async function getAllChannels(): Promise<InstitutionSocialChannel[]> {
  try {
    const col = await getChannelsCollection();
    if (col) {
      const docs = await col.find({}).toArray();
      if (docs && docs.length > 0) {
        const mapped = docs.map((c: any) => {
          const { _id, ...clean } = c;
          return clean as InstitutionSocialChannel;
        });
        memoryChannels = mapped;
        return mapped;
      }
    }
  } catch (err: any) {
    console.warn('[MongoDB] Error fetching channels from MongoDB:', err.message);
  }
  return [...memoryChannels];
}

export async function getChannelsByInstitution(institutionId: string): Promise<InstitutionSocialChannel[]> {
  const all = await getAllChannels();
  return all.filter((ch) => ch.institutionId === institutionId);
}

export async function upsertChannel(channel: InstitutionSocialChannel): Promise<InstitutionSocialChannel> {
  const index = memoryChannels.findIndex((c) => c.id === channel.id);
  const updatedChannel = {
    ...channel,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    memoryChannels[index] = { ...memoryChannels[index], ...updatedChannel };
  } else {
    memoryChannels.push(updatedChannel);
  }

  try {
    const col = await getChannelsCollection();
    if (col) {
      await col.updateOne({ id: updatedChannel.id }, { $set: updatedChannel }, { upsert: true });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not upsert channel to MongoDB:', err.message);
  }
  return updatedChannel;
}

export async function updateChannelStatus(
  id: string,
  status: ChannelVerificationStatus,
  verifiedBy?: string,
  reason?: string
): Promise<InstitutionSocialChannel | null> {
  const index = memoryChannels.findIndex((c) => c.id === id);
  const now = new Date().toISOString();
  let updatedChannel: InstitutionSocialChannel | null = null;

  if (index >= 0) {
    memoryChannels[index].verificationStatus = status;
    memoryChannels[index].updatedAt = now;
    if (status === 'Verified') {
      memoryChannels[index].verifiedBy = verifiedBy || 'Administrator';
      memoryChannels[index].verifiedAt = now.split('T')[0];
      memoryChannels[index].rejectionReason = undefined;
    } else if (status === 'Rejected') {
      memoryChannels[index].rejectionReason = reason;
    }
    updatedChannel = memoryChannels[index];
  }

  try {
    const col = await getChannelsCollection();
    if (col) {
      await col.updateOne(
        { id },
        {
          $set: {
            verificationStatus: status,
            verifiedBy: status === 'Verified' ? verifiedBy || 'Administrator' : undefined,
            verifiedAt: status === 'Verified' ? now.split('T')[0] : undefined,
            rejectionReason: status === 'Rejected' ? reason : undefined,
            updatedAt: now,
          },
        }
      );
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not update channel status in MongoDB:', err.message);
  }

  return updatedChannel;
}

export async function deleteChannel(id: string): Promise<boolean> {
  memoryChannels = memoryChannels.filter((c) => c.id !== id);
  try {
    const col = await getChannelsCollection();
    if (col) {
      await col.deleteOne({ id });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not delete channel from MongoDB:', err.message);
  }
  return true;
}

// ============================
// REPORT MEDIA QUERIES
// ============================
export async function getAllReportMedia(): Promise<ReportMedia[]> {
  try {
    const col = await getReportMediaCollection();
    if (col) {
      const docs = await col.find({}).toArray();
      if (docs && docs.length > 0) {
        const mapped = docs.map((m: any) => {
          const { _id, ...clean } = m;
          return clean as ReportMedia;
        });
        memoryReportMedia = mapped;
        return mapped;
      }
    }
  } catch (err: any) {
    console.warn('[MongoDB] Error fetching report media from MongoDB:', err.message);
  }
  return [...memoryReportMedia];
}

export async function getMediaByReport(reportId: string): Promise<ReportMedia[]> {
  const all = await getAllReportMedia();
  return all.filter((m) => m.reportId === reportId);
}

export async function upsertReportMedia(media: ReportMedia): Promise<ReportMedia> {
  const index = memoryReportMedia.findIndex((m) => m.id === media.id);
  const now = new Date().toISOString();
  const normalizedMedia = {
    ...media,
    updatedAt: now,
  };

  if (index >= 0) {
    memoryReportMedia[index] = { ...memoryReportMedia[index], ...normalizedMedia };
  } else {
    memoryReportMedia.unshift(normalizedMedia);
  }

  // Also sync with memoryTrendingNews if attached
  const newsIndex = memoryTrendingNews.findIndex((n) => n.id === media.reportId);
  if (newsIndex >= 0) {
    const existing = memoryTrendingNews[newsIndex].media || [];
    const mIdx = existing.findIndex((m) => m.id === media.id);
    if (mIdx >= 0) {
      existing[mIdx] = normalizedMedia;
    } else {
      existing.push(normalizedMedia);
    }
    memoryTrendingNews[newsIndex].media = existing;
  }

  try {
    const col = await getReportMediaCollection();
    if (col) {
      await col.updateOne({ id: normalizedMedia.id }, { $set: normalizedMedia }, { upsert: true });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not upsert report media to MongoDB:', err.message);
  }

  return normalizedMedia;
}

export async function updateReportMediaStatus(
  id: string,
  status: MediaVerificationStatus,
  verifiedBy?: string,
  reason?: string
): Promise<ReportMedia | null> {
  const index = memoryReportMedia.findIndex((m) => m.id === id);
  const now = new Date().toISOString();
  let updatedMedia: ReportMedia | null = null;

  if (index >= 0) {
    memoryReportMedia[index].verificationStatus = status;
    memoryReportMedia[index].updatedAt = now;
    if (status === 'Verified') {
      memoryReportMedia[index].verifiedBy = verifiedBy || 'Administrator';
      memoryReportMedia[index].verifiedAt = now.split('T')[0];
    } else if (status === 'Rejected') {
      memoryReportMedia[index].verificationNote = reason || 'Rejected by Administrator';
    }
    updatedMedia = memoryReportMedia[index];
  }

  try {
    const col = await getReportMediaCollection();
    if (col) {
      await col.updateOne(
        { id },
        {
          $set: {
            verificationStatus: status,
            verifiedBy: status === 'Verified' ? verifiedBy || 'Administrator' : undefined,
            verifiedAt: status === 'Verified' ? now.split('T')[0] : undefined,
            verificationNote: status === 'Rejected' ? reason || 'Rejected by Administrator' : undefined,
            updatedAt: now,
          },
        }
      );
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not update report media status in MongoDB:', err.message);
  }

  return updatedMedia;
}

export async function setPrimaryReportMedia(reportId: string, mediaId: string): Promise<boolean> {
  memoryReportMedia = memoryReportMedia.map((m) => {
    if (m.reportId === reportId) {
      return { ...m, isPrimary: m.id === mediaId, updatedAt: new Date().toISOString() };
    }
    return m;
  });

  try {
    const col = await getReportMediaCollection();
    if (col) {
      await col.updateMany({ reportId }, { $set: { isPrimary: false } });
      await col.updateOne({ id: mediaId }, { $set: { isPrimary: true } });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not set primary report media in MongoDB:', err.message);
  }

  return true;
}

export async function deleteReportMedia(id: string): Promise<boolean> {
  memoryReportMedia = memoryReportMedia.filter((m) => m.id !== id);
  try {
    const col = await getReportMediaCollection();
    if (col) {
      await col.deleteOne({ id });
    }
  } catch (err: any) {
    console.warn('[MongoDB] Could not delete report media from MongoDB:', err.message);
  }
  return true;
}

/**
 * Diagnostic database status check
 */
export async function getDatabaseDiagnostics(): Promise<{
  type: string;
  connected: boolean;
  uri: string;
  database: string;
  collections: {
    users: number;
    reports: number;
    messages: number;
    notifications: number;
    departments: number;
    channels: number;
  };
}> {
  const connected = await isMongoConnected();
  const users = await getAllUsers();
  const reports = await getAllReports();
  const messages = await getAllMessages();
  const notifs = await getAllNotifications();
  const depts = await getAllDepartments();
  const channels = await getAllChannels();

  return {
    type: 'MongoDB',
    connected,
    uri: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
    database: MONGODB_DB_NAME,
    collections: {
      users: users.length,
      reports: reports.length,
      messages: messages.length,
      notifications: notifs.length,
      departments: depts.length,
      channels: channels.length,
    },
  };
}
