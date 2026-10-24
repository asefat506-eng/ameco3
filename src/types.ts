export type UserRole = 'Citizen' | 'Administrator' | 'ResponsiblePerson' | 'Institution' | 'Publisher';

export type InvestigatorRole = 'Investigator' | 'Field Officer';
export type InvestigatorAvailability = 'Available' | 'Busy' | 'On Leave';
export type InvestigatorEmploymentStatus = 'Available' | 'Busy' | 'On Leave' | 'Inactive';
export type AccountStatus = 'Active' | 'Suspended' | 'Deactivated' | 'active' | 'suspended' | 'banned' | 'deactivated';

export interface UserProfile {
  id: string; // e.g., INV-019 or CZN-2026-00125 or ADM-001 or INST-001
  userId?: string; // MongoDB User UID / User ID
  fullName: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  role: UserRole;
  specificRole?: InvestigatorRole | string; // e.g. 'Investigator' | 'Field Officer'
  region?: string; // e.g. 'Amhara'
  zone: string; // e.g. 'East Gojjam'
  cityTown?: string; // e.g. 'Debre Markos'
  city?: string; // e.g. 'Debre Markos' (alias)
  woreda?: string;
  serviceArea?: string; // e.g. 'Debre Markos & East Gojjam Sector 1'
  address?: string;
  department?: string; // For AMECO Staff / Investigators
  specialization?: string; // e.g. "Road Accident", "Crime Investigation", "Public Safety", "Fraud", "Anti-Corruption", "Health & Medical Verification"
  employmentStatus?: InvestigatorEmploymentStatus; // 'Available' | 'Busy' | 'On Leave' | 'Inactive'
  availability?: InvestigatorAvailability | string; // 'Available' | 'Busy' | 'On Leave'
  accountStatus?: AccountStatus; // 'Active' | 'Suspended' | 'Deactivated'
  status: 'active' | 'suspended' | 'pending' | 'banned' | 'deactivated';
  activeCases?: number; // Maintained by Case Assignment System, defaults to 0
  assignedCasesCount?: number;
  forcePasswordChange?: boolean; // Set to true upon provision
  isDefaultPassword?: boolean; // Set to true upon provision
  createdBy?: string; // e.g. 'Administrator (ADM-001)'
  createdAt?: string;
  updatedAt?: string;

  avatarUrl?: string; // Optional (Not used for Citizens)
  reputationScore?: number;
  verified?: boolean;
  joinedDate?: string;
  clearanceLevel?: string;
  badgeNumber?: string;
  
  username?: string;
  password?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | string;
  dateOfBirth?: string;
  subCity?: string;
  citizenId?: string;
  lastLoginAt?: string;
  isGuest?: boolean;
  // Institution Specific Properties
  institutionName?: string;
  institutionCategory?: string; // e.g. "Public Health", "Higher Education", "Regional Agency"
  organizationType?: string; // e.g. "Public Broadcaster", "Digital Newsroom", "University Press", "Regional Agency"
  isApprovedInstitution?: boolean;
  registrationNumber?: string;
  mediaLicenseNumber?: string;
  focalPersonName?: string;
  institutionWebsite?: string;
  officialWebsite?: string;
  website?: string;
  socialChannels?: InstitutionSocialChannel[];
  accreditationDocName?: string;
  accreditationDocSize?: string;
  accreditationDocData?: string;

  // Security Recovery Questions (For Password Reset / Account Recovery)
  securityQuestion1?: string; // e.g. "What is your favourite number?"
  securityAnswer1?: string;   // e.g. "7"
  securityQuestion2?: string; // e.g. "What is your childhood nickname?"
  securityAnswer2?: string;   // e.g. "Abebe"
  securityQuestion3?: string; // e.g. "What is your favourite place or city?"
  securityAnswer3?: string;   // e.g. "Bahir Dar"

  // Professional Credentials & Qualifications
  approved?: boolean;
  qualificationLevel?: 'Bachelor Degree (BSc/BA)' | 'Master Degree (MSc/MA)' | 'Doctorate Degree (PhD)' | 'Institutional Accreditation / License' | string;
  fieldOfStudy?: string;
  cvFileName?: string;
  cvFileSize?: string;
  cvFileData?: string;
  certificateFileName?: string;
  certificateFileSize?: string;
  certificateFileData?: string;
}

export type SocialPlatform =
  | 'youtube'
  | 'facebook'
  | 'tiktok'
  | 'instagram'
  | 'telegram'
  | 'x'
  | 'website'
  | 'other';

export type ChannelVerificationStatus =
  | 'Unverified'
  | 'Pending Verification'
  | 'Verified'
  | 'Rejected';

export type MediaVerificationStatus =
  | 'Added'
  | 'Pending Verification'
  | 'Verified'
  | 'Rejected'
  | 'Removed';

export type PublicationType =
  | 'Video'
  | 'Post'
  | 'Article'
  | 'Photo'
  | 'Announcement'
  | 'Live Video'
  | 'Other';

export interface InstitutionSocialChannel {
  id: string;
  institutionId: string;
  institutionName?: string;
  platform: SocialPlatform;
  channelName: string;
  channelUrl: string;
  platformId?: string;
  handle?: string;
  verificationStatus: ChannelVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  subscriberOrFollowerCount?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ReportMedia {
  id: string;
  reportId: string;
  institutionId: string;
  institutionName?: string;
  platform: SocialPlatform;
  publicationType: PublicationType;
  url: string;
  externalId?: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  authorName?: string;
  authorId?: string;
  authorUrl?: string;
  publishedAt?: string;
  embedUrl?: string;
  duration?: string;
  verificationStatus: MediaVerificationStatus;
  verificationNote?: string;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  isPrimary?: boolean;
  viewCount?: number;
  likeCount?: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface TrendingNewsItem {
  id: string;
  title: string;
  description: string;
  category: string;
  institutionId: string;
  institutionName: string;
  publishedAt: string;
  imageUrl?: string;
  sourceUrl?: string;
  socialPlatform?: SocialPlatform | string;
  zone: string;
  isApproved: boolean;
  viewsCount?: number;
  media?: ReportMedia[];
}

export type ReportType = 'news' | 'tipoff';

export type ReportStatus =
  | 'Submitted'
  | 'Under AI Review'
  | 'Under Administrator Review'
  | 'Assigned'
  | 'Investigation in Progress'
  | 'Waiting for Citizen Response'
  | 'Investigation Completed'
  | 'Published'
  | 'Closed'
  | 'Rejected';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface EvidenceFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'doc';
  size: string;
  url: string;
}

export interface PublicStatusUpdate {
  id: string;
  timestamp: string;
  message: string;
  stage?: string;
}

export interface PublicSafeTipView {
  id: string;
  trackingCode: string;
  title: string;
  description?: string;
  category: string;
  incidentDate?: string;
  zone: string;
  woreda?: string;
  submittedDate: string;
  status: ReportStatus;
  priority?: PriorityLevel;
  publicStatusUpdates: PublicStatusUpdate[];
  isPublished?: boolean;
  publishedReport?: {
    title: string;
    summary: string;
    date: string;
  };
}

export interface AiAnalysisResult {
  suggestedCategory: string;
  priority: PriorityLevel;
  priorityReasoning: string;
  spamScore: number; // 0-100
  isSpam: boolean;
  duplicateScore: number; // 0-100
  duplicateNotes: string;
  offensiveLanguageScore: number; // 0-100
  languageDetected: string;
  aiSummary: string;
  keywords: string[];
  verificationTips: string[];
}

export interface Assignment {
  responsiblePersonId: string;
  responsiblePersonName: string;
  department: string;
  assignedAt: string;
  deadline: string;
  notes: string;
  location?: string;
  specialization?: string;
  priority?: PriorityLevel;
}

export interface ReportItem {
  id: string; // e.g., AMECO-2026-8941 or TIP-8F42K9
  type: ReportType;
  title: string;
  description: string;
  category: string;
  incidentDate: string;
  region: string;
  zone: string;
  woreda?: string;
  specificLocation: string;
  gpsCoordinates?: { lat: number; lng: number };
  
  // Citizen Identity (Hidden from Investigators by default)
  citizenId: string;
  citizenName?: string;
  citizenPhone?: string;
  citizenEmail?: string;
  citizenWoreda?: string;
  citizenAddress?: string;
  registeredDate?: string;
  
  // Guest / Anonymous Submission & Tracking Credentials
  submissionType?: 'guest' | 'citizen';
  isGuest?: boolean;
  isAnonymous?: boolean;
  trackingCode?: string;
  trackingCodeHash?: string;
  accessCodeHash?: string;
  publicStatusUpdates?: PublicStatusUpdate[];
  publishedReportId?: string;
  publishedReportTitle?: string;
  publishedReportSummary?: string;
  publishedReportDate?: string;
  publishedUrl?: string;

  guestTelemetry?: {
    ipAddress: string;
    isp: string;
    cellularTowerId?: string;
    deviceModel?: string;
    networkType?: string;
    approxLocationName?: string;
    gpsCoordinates?: { lat: number; lng: number };
  };
  
  evidence: EvidenceFile[];
  status: ReportStatus;
  priority: PriorityLevel;
  assignedTo?: Assignment;
  aiAnalysis?: AiAnalysisResult;
  investigationFindings?: string;
  institutionId?: string;
  institutionName?: string;
  assignedPublisherId?: string;
  assignedPublisherName?: string;
  publisherNotes?: string;
  media?: ReportMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  reportId: string;
  senderRole: UserRole;
  senderId: string;
  senderDisplayName: string;
  recipientId?: string;
  recipientRole?: UserRole;
  channelId?: string;
  isBroadcast?: boolean;
  priority?: 'Normal' | 'High' | 'Urgent';
  text: string;
  attachment?: EvidenceFile;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  targetId?: string;
  targetUserId?: string;
  institutionId?: string;
  reportId?: string;
  mediaId?: string;
  performedBy?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  ipAddress: string;
}

export interface NotificationItem {
  id: string;
  recipientId?: string; // Target user ID
  userId: string; // Backward compatibility alias
  recipientRole?: UserRole;
  type: 'submission' | 'assignment' | 'message' | 'status_update' | 'verification' | 'publication' | 'system';
  title: string;
  message: string;
  relatedTipId?: string;
  relatedMessageId?: string;
  isRead?: boolean;
  read: boolean; // Backward compatibility alias
  createdAt?: string;
  readAt?: string;
  timestamp: string; // Formatted timestamp for display
}

export interface Department {
  id: string;
  name: string;
  head: string;
  reportCount: number;
  description?: string;
  focusAreas?: string[];
  contactEmail?: string;
  phoneExtension?: string;
}

export interface SystemConfigItem {
  key: string;
  label: string;
  value: string;
  description: string;
  category: 'Security' | 'AI & Triage' | 'Storage' | 'Workflow' | 'Custom';
  type: 'toggle' | 'select' | 'text' | 'number';
  options?: string[];
  enabled?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: 'news' | 'tipoff';
  description?: string;
  badgeColor?: string;
  threatLevel?: 'Critical' | 'High' | 'Moderate' | 'General';
  enabled?: boolean;
}
