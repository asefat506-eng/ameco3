import { MongoClient, Db, Collection } from 'mongodb';
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

declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoDb: Db | undefined;
  var _mongoConnected: boolean | undefined;
}

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017';
const DEFAULT_DB_NAME = 'amharamedia';

export const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGO_URI;
export const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || DEFAULT_DB_NAME;

let isConnecting = false;

/**
 * Initialize and get the MongoDB Database instance
 */
export async function getMongoDb(): Promise<Db | null> {
  if (global._mongoDb && global._mongoConnected) {
    return global._mongoDb;
  }

  if (!global._mongoClient) {
    try {
      global._mongoClient = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 3000,
      });
    } catch (err: any) {
      console.warn('[MongoDB] Error creating MongoClient:', err.message);
      return null;
    }
  }

  if (!global._mongoConnected && !isConnecting) {
    isConnecting = true;
    try {
      await global._mongoClient.connect();
      global._mongoConnected = true;
      global._mongoDb = global._mongoClient.db(MONGODB_DB_NAME);
      console.log(`[MongoDB] Connected successfully to MongoDB at ${MONGODB_URI} (DB: ${MONGODB_DB_NAME})`);
    } catch (err: any) {
      global._mongoConnected = false;
      global._mongoDb = undefined;
      // Do not crash server, log informative message
      console.warn(`[MongoDB] Local MongoDB connection at ${MONGODB_URI} not reachable (${err.message}). Using resilient active storage.`);
      return null;
    } finally {
      isConnecting = false;
    }
  }

  return global._mongoDb || null;
}

export async function isMongoConnected(): Promise<boolean> {
  const db = await getMongoDb();
  return Boolean(db && global._mongoConnected);
}

// Collection Helpers
export async function getUsersCollection(): Promise<Collection<UserProfile> | null> {
  const db = await getMongoDb();
  return db ? db.collection<UserProfile>('users') : null;
}

export async function getReportsCollection(): Promise<Collection<ReportItem> | null> {
  const db = await getMongoDb();
  return db ? db.collection<ReportItem>('reports') : null;
}

export async function getMessagesCollection(): Promise<Collection<Message> | null> {
  const db = await getMongoDb();
  return db ? db.collection<Message>('messages') : null;
}

export async function getAuditLogsCollection(): Promise<Collection<AuditLogEntry> | null> {
  const db = await getMongoDb();
  return db ? db.collection<AuditLogEntry>('audit_logs') : null;
}

export async function getNotificationsCollection(): Promise<Collection<NotificationItem> | null> {
  const db = await getMongoDb();
  return db ? db.collection<NotificationItem>('notifications') : null;
}

export async function getDepartmentsCollection(): Promise<Collection<Department> | null> {
  const db = await getMongoDb();
  return db ? db.collection<Department>('departments') : null;
}

export async function getTrendingNewsCollection(): Promise<Collection<TrendingNewsItem> | null> {
  const db = await getMongoDb();
  return db ? db.collection<TrendingNewsItem>('trending_news') : null;
}

export async function getChannelsCollection(): Promise<Collection<InstitutionSocialChannel> | null> {
  const db = await getMongoDb();
  return db ? db.collection<InstitutionSocialChannel>('social_channels') : null;
}

export async function getReportMediaCollection(): Promise<Collection<ReportMedia> | null> {
  const db = await getMongoDb();
  return db ? db.collection<ReportMedia>('report_media') : null;
}
