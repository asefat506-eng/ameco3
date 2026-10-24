import React, { useState } from 'react';
import {
  UserProfile,
  Department,
  UserRole,
  ReportItem,
  CategoryItem,
  SystemConfigItem,
} from '../../types';
import {
  INITIAL_NEWS_CATEGORIES,
  INITIAL_TIPOFF_CATEGORIES,
  INITIAL_SYSTEM_CONFIGS,
} from '../../data/initialData';
import { REGIONAL_ZONES, ETHIOPIAN_REGIONS, getZonesForRegion, getRegionForZone } from '../../data/zones';
import { RegionZoneSelector } from '../Common/RegionZoneSelector';
import { validateName, detectNameScript } from '../../utils/nameValidation';
import { validateEmail } from '../../utils/emailValidation';
import { ValidatedNameInput } from '../Common/ValidatedNameInput';
import { FormalEmailInput } from '../Common/FormalEmailInput';
import { InternationalPhoneInput } from '../InternationalPhoneInput';
import { validateInternationalPhone } from '../../utils/phoneHelper';
import {
  Users,
  Shield,
  ShieldCheck,
  UserPlus,
  UserCheck,
  Search,
  Lock,
  CheckCircle2,
  Building2,
  UserX,
  AlertTriangle,
  FileText,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Ban,
  BadgeCheck,
  Briefcase,
  X,
  SlidersHorizontal,
  Sparkles,
  LayoutGrid,
  List,
  Compass,
  KeyRound,
  RotateCcw,
  Check,
  Radio,
  Copy,
  EyeOff,
  RefreshCw,
  Key,
  Info,
  Edit,
  Trash2,
  Globe,
  Building,
  AlertOctagon,
  ShieldAlert,
  Plus,
  Tag,
  Settings,
  Sliders,
  FolderPlus,
  Layers,
  Power,
  SlidersVertical,
  Activity,
  CheckCheck,
  GraduationCap,
  Upload,
  FileCheck,
  Award,
  Download,
  ExternalLink,
} from 'lucide-react';

interface UserManagementProps {
  users: UserProfile[];
  departments: Department[];
  reports?: ReportItem[];
  onAddUser: (newUser: UserProfile) => void;
  onUpdateUser?: (updatedUser: UserProfile) => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateUserStatus: (userId: string, status: 'active' | 'suspended' | 'banned') => void;
  onAddDepartment?: (newDept: Department) => void;
  onUpdateDepartment?: (updatedDept: Department) => void;
  onDeleteDepartment?: (deptId: string) => void;
  newsCategories?: CategoryItem[];
  tipoffCategories?: CategoryItem[];
  systemConfigs?: SystemConfigItem[];
  onUpdateNewsCategories?: (categories: CategoryItem[]) => void;
  onUpdateTipoffCategories?: (categories: CategoryItem[]) => void;
  onUpdateSystemConfigs?: (configs: SystemConfigItem[]) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  departments,
  reports = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onUpdateUserStatus,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  newsCategories: propNewsCategories,
  tipoffCategories: propTipoffCategories,
  systemConfigs: propSystemConfigs,
  onUpdateNewsCategories,
  onUpdateTipoffCategories,
  onUpdateSystemConfigs,
}) => {
  // Navigation Tab Group: 'investigators' | 'citizens' | 'administrators' | 'departments' | 'categories-settings'
  const [activeGroupTab, setActiveGroupTab] = useState<
    'investigators' | 'citizens' | 'administrators' | 'departments' | 'categories-settings' | 'institutions'
  >('investigators');

  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Selected User Modal States (View Info)
  const [selectedCitizen, setSelectedCitizen] = useState<UserProfile | null>(null);
  const [selectedInvestigator, setSelectedInvestigator] = useState<UserProfile | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<UserProfile | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<UserProfile | null>(null);

  // Edit and Delete User Modal States
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  // ==========================================
  // DEPARTMENT MANAGEMENT STATE
  // ==========================================
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);

  // Form states for Add/Edit Department
  const [deptFormId, setDeptFormId] = useState('');
  const [deptFormName, setDeptFormName] = useState('');
  const [deptFormHead, setDeptFormHead] = useState('');
  const [deptFormDescription, setDeptFormDescription] = useState('');
  const [deptFormFocusAreas, setDeptFormFocusAreas] = useState('');
  const [deptFormContactEmail, setDeptFormContactEmail] = useState('');
  const [deptFormPhoneExtension, setDeptFormPhoneExtension] = useState('');
  const [deptFormReportCount, setDeptFormReportCount] = useState<number>(0);

  // ==========================================
  // CATEGORIES & CONFIGURATION STATE
  // ==========================================
  const [newsCategories, setNewsCategories] = useState<CategoryItem[]>(
    propNewsCategories || INITIAL_NEWS_CATEGORIES
  );
  const [tipoffCategories, setTipoffCategories] = useState<CategoryItem[]>(
    propTipoffCategories || INITIAL_TIPOFF_CATEGORIES
  );
  const [systemConfigs, setSystemConfigs] = useState<SystemConfigItem[]>(
    propSystemConfigs || INITIAL_SYSTEM_CONFIGS
  );

  const [activeConfigSection, setActiveConfigSection] = useState<'all' | 'news' | 'tipoff' | 'system'>('all');

  // Modals for Categories
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [categoryModalType, setCategoryModalType] = useState<'news' | 'tipoff'>('news');
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);

  // Category Form State
  const [catFormName, setCatFormName] = useState('');
  const [catFormDescription, setCatFormDescription] = useState('');
  const [catFormColor, setCatFormColor] = useState('blue');
  const [catFormThreat, setCatFormThreat] = useState<'Critical' | 'High' | 'Moderate' | 'General'>('Moderate');

  // Modal for Custom System Config Parameter
  const [isAddConfigModalOpen, setIsAddConfigModalOpen] = useState(false);
  const [editingConfigItem, setEditingConfigItem] = useState<SystemConfigItem | null>(null);
  const [configFormKey, setConfigFormKey] = useState('');
  const [configFormLabel, setConfigFormLabel] = useState('');
  const [configFormValue, setConfigFormValue] = useState('');
  const [configFormDescription, setConfigFormDescription] = useState('');
  const [configFormCategory, setConfigFormCategory] = useState<
    'Security' | 'AI & Triage' | 'Storage' | 'Workflow' | 'Custom'
  >('Security');
  const [configFormType, setConfigFormType] = useState<'toggle' | 'select' | 'text' | 'number'>('toggle');
  const [configFormOptions, setConfigFormOptions] = useState('');

  // Edit User Form State
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('ResponsiblePerson');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended' | 'banned' | 'deactivated' | 'pending'>('active');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRegion, setEditRegion] = useState('Amhara Region');
  const [editZone, setEditZone] = useState('Bahir Dar Special Zone');
  const [editCustomZone, setEditCustomZone] = useState('');
  const [editWoreda, setEditWoreda] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBadgeNumber, setEditBadgeNumber] = useState('');
  const [editClearanceLevel, setEditClearanceLevel] = useState('');
  const [editVerified, setEditVerified] = useState(false);
  const [editReputationScore, setEditReputationScore] = useState<number>(90);
  const [editInstitutionCategory, setEditInstitutionCategory] = useState('');
  const [editRegistrationNumber, setEditRegistrationNumber] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editIsApprovedInstitution, setEditIsApprovedInstitution] = useState(true);
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showDetailPassword, setShowDetailPassword] = useState(false);

  // Helper to retrieve effective password for users
  const getUserEffectivePassword = (user: UserProfile): string => {
    if (user.password) return user.password;
    if (user.id === 'INST-001') return 'Aphi@2026';
    if (user.id === 'INST-002') return 'Bdu@2026';
    if (user.id === 'INST-003' || user.id === 'INST-004' || user.id === 'INST-005') return 'Ameco@2026';
    if (user.role === 'Administrator') return 'Admin@2026';
    if (user.role === 'ResponsiblePerson') return 'Investigator@2026';
    if (user.role === 'Citizen') return 'Abebe@123';
    return 'Ameco@2026';
  };

  // Open Edit Modal Helper
  const handleOpenEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setEditFullName(user.fullName || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditRole(user.role);
    setEditStatus(user.status || 'active');
    setEditDepartment(user.department || 'Anti-Corruption & Financial Crime Unit');
    setEditPassword(getUserEffectivePassword(user));
    setShowEditPassword(false);
    
    // Resolve region and zone
    const userRegion = user.region || getRegionForZone(user.zone || '');
    setEditRegion(userRegion);

    if (user.zone && (user.zone.startsWith('Others') || user.zone.includes('Custom'))) {
      setEditZone('Others... (Specify Zone/Woreda)');
      setEditCustomZone(user.zone);
    } else {
      setEditZone(user.zone || getZonesForRegion(userRegion)[0] || 'Bahir Dar Special Zone');
      setEditCustomZone('');
    }

    setEditWoreda(user.woreda || 'City Center');
    setEditAddress(user.address || '');
    setEditBadgeNumber(user.badgeNumber || '');
    setEditClearanceLevel(user.clearanceLevel || 'Level 3 - Confidential Investigator');
    setEditVerified(Boolean(user.verified));
    setEditReputationScore(user.reputationScore ?? 90);
    setEditInstitutionCategory(user.institutionCategory || 'Public Media & Civil Agency');
    setEditRegistrationNumber(user.registrationNumber || '');
    setEditWebsite(user.officialWebsite || '');
    setEditIsApprovedInstitution(user.isApprovedInstitution !== false);
  };

  // Save Edited User
  const handleSaveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const nameValidation = validateName(editFullName, 'Full Name / Organization Name');
    if (!nameValidation.isValid) {
      showToast(nameValidation.error || 'Name must contain letters only (English or Amharic).');
      return;
    }

    const emailValidation = validateEmail(editEmail);
    if (!emailValidation.isValid) {
      showToast(emailValidation.error || 'Please provide a valid formal email address');
      return;
    }

    if (editPhone && editPhone.trim()) {
      const phoneValidation = validateInternationalPhone(editPhone);
      if (!phoneValidation.isValid) {
        showToast(phoneValidation.error || 'Invalid phone format');
        return;
      }
    }

    const isCustom = editZone.startsWith('Others') || editRegion === 'Others...';
    const effectiveZone = isCustom ? (editCustomZone.trim() || 'Custom Location') : editZone;

    const updatedUser: UserProfile = {
      ...editingUser,
      fullName: editFullName.trim(),
      email: editEmail.trim().toLowerCase(),
      phone: editPhone.trim(),
      role: editRole,
      status: editStatus,
      department: editDepartment,
      region: editRegion,
      zone: effectiveZone,
      woreda: editWoreda,
      address: editAddress,
      badgeNumber: editBadgeNumber,
      clearanceLevel: editClearanceLevel,
      verified: editVerified,
      reputationScore: editReputationScore,
      institutionCategory: editInstitutionCategory,
      registrationNumber: editRegistrationNumber,
      officialWebsite: editWebsite,
      isApprovedInstitution: editIsApprovedInstitution,
      password: editPassword.trim() || getUserEffectivePassword(editingUser),
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    } else {
      onAddUser(updatedUser);
    }

    // Also update any currently open detail modal
    if (selectedCitizen?.id === updatedUser.id) setSelectedCitizen(updatedUser);
    if (selectedInvestigator?.id === updatedUser.id) setSelectedInvestigator(updatedUser);
    if (selectedInstitution?.id === updatedUser.id) setSelectedInstitution(updatedUser);
    if (selectedAdmin?.id === updatedUser.id) setSelectedAdmin(updatedUser);

    setEditingUser(null);
    showToast(`Successfully updated profile for ${updatedUser.fullName} (${updatedUser.id})`);
  };

  // Confirm Permanent Deletion
  const handleConfirmPermanentDelete = () => {
    if (!deletingUser) return;
    const deletedId = deletingUser.id;
    const deletedName = deletingUser.fullName;

    if (onDeleteUser) {
      onDeleteUser(deletedId);
    }

    // Close any open modals matching this user
    if (selectedCitizen?.id === deletedId) setSelectedCitizen(null);
    if (selectedInvestigator?.id === deletedId) setSelectedInvestigator(null);
    if (selectedInstitution?.id === deletedId) setSelectedInstitution(null);
    if (selectedAdmin?.id === deletedId) setSelectedAdmin(null);
    if (editingUser?.id === deletedId) setEditingUser(null);

    setDeletingUser(null);
    showToast(`Permanently deleted account for ${deletedName} [${deletedId}]`);
  };

  // New User Provision Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('ResponsiblePerson');
  const [department, setDepartment] = useState('Anti-Corruption & Financial Crime Unit');
  const [region, setRegion] = useState('Amhara Region');
  const [zone, setZone] = useState('Bahir Dar Special Zone');
  const [customZone, setCustomZone] = useState('');
  const [woreda, setWoreda] = useState('Bahir Dar City');
  const [address, setAddress] = useState('AMECO Regional Office, Floor 2');
  const [clearanceLevel, setClearanceLevel] = useState('Level 3 - Confidential Investigator');

  // Academic & Professional Verification Documents State
  const [qualificationLevel, setQualificationLevel] = useState<string>('Bachelor Degree (BSc/BA)');
  const [fieldOfStudy, setFieldOfStudy] = useState<string>('Law & Forensic Investigation');
  const [cvFile, setCvFile] = useState<{ name: string; size: string; dataUrl?: string } | null>(null);
  const [certificateFile, setCertificateFile] = useState<{ name: string; size: string; dataUrl?: string } | null>(null);
  const [docValidationWarning, setDocValidationWarning] = useState<string | null>(null);

  const formatUploadedFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast('CV file size must be less than 15MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCvFile({
          name: file.name,
          size: formatUploadedFileSize(file.size),
          dataUrl: reader.result as string,
        });
        setDocValidationWarning(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast('Certificate document must be less than 15MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCertificateFile({
          name: file.name,
          size: formatUploadedFileSize(file.size),
          dataUrl: reader.result as string,
        });
        setDocValidationWarning(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Institution & Media Publisher Specific Registration State
  const [organizationType, setOrganizationType] = useState<string>('Public Broadcaster (TV & Radio)');
  const [mediaLicenseNumber, setMediaLicenseNumber] = useState<string>('');
  const [officialWebsite, setOfficialWebsite] = useState<string>('');
  const [focalPersonName, setFocalPersonName] = useState<string>('');
  const [accreditationFile, setAccreditationFile] = useState<{ name: string; size: string; dataUrl?: string } | null>(null);

  const handleAccreditationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        showToast('Accreditation document size must be less than 20MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAccreditationFile({
          name: file.name,
          size: formatUploadedFileSize(file.size),
          dataUrl: reader.result as string,
        });
        setDocValidationWarning(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generated Credentials States
  const [customPassword, setCustomPassword] = useState('Ameco@Inv2026!');
  const [showPasswordInModal, setShowPasswordInModal] = useState(true);
  const [provisionedCredentialModal, setProvisionedCredentialModal] = useState<{
    user: UserProfile;
    plainPassword: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleDownloadDoc = (fileName: string, dataUrl?: string) => {
    if (dataUrl) {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Downloaded verified document: ${fileName}`);
    } else {
      showToast(`Verified clearance document: ${fileName}`);
    }
  };

  // Helper: auto-generate strong default password
  const generateDefaultPassword = (userRole: UserRole) => {
    const prefix =
      userRole === 'ResponsiblePerson'
        ? 'Ameco@Inv'
        : userRole === 'Administrator'
        ? 'Ameco@Admin'
        : 'Ameco@User';
    const randomDigits = Math.floor(100 + Math.random() * 900);
    return `${prefix}${randomDigits}!`;
  };

  const handleRegeneratePassword = () => {
    const newPass = generateDefaultPassword(role);
    setCustomPassword(newPass);
    showToast('Generated fresh strong default password');
  };

  // =========================================================
  // DEPARTMENT HANDLERS
  // =========================================================
  const handleOpenAddDeptModal = () => {
    // Generate next DEP ID
    const maxNum = departments.reduce((acc, d) => {
      const match = d.id.match(/\d+/);
      const val = match ? parseInt(match[0], 10) : 0;
      return val > acc ? val : acc;
    }, 0);
    const nextId = `DEP-${String(maxNum + 1).padStart(2, '0')}`;

    const defaultLead = investigators.length > 0 ? investigators[0].fullName : 'Senior Regional Investigator';
    setDeptFormId(nextId);
    setDeptFormName('');
    setDeptFormHead(defaultLead);
    setDeptFormDescription('');
    setDeptFormFocusAreas('');
    setDeptFormContactEmail('investigations@ameco.et');
    setDeptFormPhoneExtension('251-58-220-4000');
    setDeptFormReportCount(0);
    setIsAddDeptModalOpen(true);
  };

  const handleOpenEditDeptModal = (dept: Department) => {
    setEditingDepartment(dept);
    setDeptFormId(dept.id);
    setDeptFormName(dept.name);
    setDeptFormHead(dept.head);
    setDeptFormDescription(dept.description || '');
    setDeptFormFocusAreas(dept.focusAreas ? dept.focusAreas.join(', ') : '');
    setDeptFormContactEmail(dept.contactEmail || '');
    setDeptFormPhoneExtension(dept.phoneExtension || '');
    setDeptFormReportCount(dept.reportCount || 0);
  };

  const handleSaveDepartmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptFormName.trim()) {
      showToast('Please provide a valid Department Desk Name');
      return;
    }

    const focusAreasList = deptFormFocusAreas
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedDept: Department = {
      id: deptFormId.trim() || `DEP-${Date.now().toString().slice(-3)}`,
      name: deptFormName.trim(),
      head: deptFormHead.trim() || 'Assigned Lead Officer',
      reportCount: deptFormReportCount,
      description: deptFormDescription.trim() || undefined,
      focusAreas: focusAreasList.length > 0 ? focusAreasList : undefined,
      contactEmail: deptFormContactEmail.trim() || undefined,
      phoneExtension: deptFormPhoneExtension.trim() || undefined,
    };

    if (editingDepartment) {
      if (onUpdateDepartment) {
        onUpdateDepartment(updatedDept);
      } else if (onAddDepartment) {
        onAddDepartment(updatedDept);
      }
      showToast(`Updated Department Desk "${updatedDept.name}" [${updatedDept.id}]`);
      setEditingDepartment(null);
    } else {
      if (onAddDepartment) {
        onAddDepartment(updatedDept);
      }
      showToast(`Provisioned New Department Desk "${updatedDept.name}" [${updatedDept.id}]`);
      setIsAddDeptModalOpen(false);
    }
  };

  const handleConfirmDeleteDepartment = () => {
    if (!deletingDepartment) return;
    const targetId = deletingDepartment.id;
    const targetName = deletingDepartment.name;
    if (onDeleteDepartment) {
      onDeleteDepartment(targetId);
    }
    setDeletingDepartment(null);
    showToast(`Removed Department Desk "${targetName}" [${targetId}]`);
  };

  // =========================================================
  // CATEGORY MANAGEMENT HANDLERS
  // =========================================================
  const handleOpenAddCategoryModal = (type: 'news' | 'tipoff') => {
    setCategoryModalType(type);
    setCatFormName('');
    setCatFormDescription('');
    setCatFormColor(type === 'news' ? 'blue' : 'red');
    setCatFormThreat('Moderate');
    setEditingCategory(null);
    setIsAddCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryModalType(cat.type);
    setCatFormName(cat.name);
    setCatFormDescription(cat.description || '');
    setCatFormColor(cat.badgeColor || (cat.type === 'news' ? 'blue' : 'red'));
    setCatFormThreat(cat.threatLevel || 'Moderate');
    setIsAddCategoryModalOpen(true);
  };

  const handleSaveCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim()) {
      showToast('Please enter a category title');
      return;
    }

    if (categoryModalType === 'news') {
      const updatedList = [...newsCategories];
      if (editingCategory) {
        const idx = updatedList.findIndex((c) => c.id === editingCategory.id);
        if (idx >= 0) {
          updatedList[idx] = {
            ...updatedList[idx],
            name: catFormName.trim(),
            description: catFormDescription.trim() || undefined,
            badgeColor: catFormColor,
          };
        }
        showToast(`Updated news category "${catFormName}"`);
      } else {
        const newCat: CategoryItem = {
          id: `NCAT-${String(updatedList.length + 1).padStart(2, '0')}`,
          name: catFormName.trim(),
          type: 'news',
          description: catFormDescription.trim() || undefined,
          badgeColor: catFormColor,
          enabled: true,
        };
        updatedList.push(newCat);
        showToast(`Created news category "${catFormName}"`);
      }
      setNewsCategories(updatedList);
      if (onUpdateNewsCategories) onUpdateNewsCategories(updatedList);
    } else {
      const updatedList = [...tipoffCategories];
      if (editingCategory) {
        const idx = updatedList.findIndex((c) => c.id === editingCategory.id);
        if (idx >= 0) {
          updatedList[idx] = {
            ...updatedList[idx],
            name: catFormName.trim(),
            description: catFormDescription.trim() || undefined,
            badgeColor: catFormColor,
            threatLevel: catFormThreat,
          };
        }
        showToast(`Updated tip-off category "${catFormName}"`);
      } else {
        const newCat: CategoryItem = {
          id: `TCAT-${String(updatedList.length + 1).padStart(2, '0')}`,
          name: catFormName.trim(),
          type: 'tipoff',
          description: catFormDescription.trim() || undefined,
          badgeColor: catFormColor,
          threatLevel: catFormThreat,
          enabled: true,
        };
        updatedList.push(newCat);
        showToast(`Created tip-off category "${catFormName}"`);
      }
      setTipoffCategories(updatedList);
      if (onUpdateTipoffCategories) onUpdateTipoffCategories(updatedList);
    }

    setIsAddCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleToggleCategory = (cat: CategoryItem) => {
    if (cat.type === 'news') {
      const updated = newsCategories.map((c) => (c.id === cat.id ? { ...c, enabled: !c.enabled } : c));
      setNewsCategories(updated);
      if (onUpdateNewsCategories) onUpdateNewsCategories(updated);
      showToast(`${cat.enabled ? 'Disabled' : 'Enabled'} "${cat.name}"`);
    } else {
      const updated = tipoffCategories.map((c) => (c.id === cat.id ? { ...c, enabled: !c.enabled } : c));
      setTipoffCategories(updated);
      if (onUpdateTipoffCategories) onUpdateTipoffCategories(updated);
      showToast(`${cat.enabled ? 'Disabled' : 'Enabled'} "${cat.name}"`);
    }
  };

  const handleConfirmDeleteCategory = () => {
    if (!deletingCategory) return;
    if (deletingCategory.type === 'news') {
      const updated = newsCategories.filter((c) => c.id !== deletingCategory.id);
      setNewsCategories(updated);
      if (onUpdateNewsCategories) onUpdateNewsCategories(updated);
    } else {
      const updated = tipoffCategories.filter((c) => c.id !== deletingCategory.id);
      setTipoffCategories(updated);
      if (onUpdateTipoffCategories) onUpdateTipoffCategories(updated);
    }
    showToast(`Deleted category "${deletingCategory.name}"`);
    setDeletingCategory(null);
  };

  // =========================================================
  // SYSTEM CONFIG HANDLERS
  // =========================================================
  const handleToggleConfig = (cfg: SystemConfigItem) => {
    const updated = systemConfigs.map((c) => {
      if (c.key === cfg.key) {
        const nextEnabled = !c.enabled;
        return {
          ...c,
          enabled: nextEnabled,
          value: c.type === 'toggle' ? (nextEnabled ? 'Strict Enforced' : 'Disabled') : c.value,
        };
      }
      return c;
    });
    setSystemConfigs(updated);
    if (onUpdateSystemConfigs) onUpdateSystemConfigs(updated);
    showToast(`Updated setting: ${cfg.label}`);
  };

  const handleUpdateConfigValue = (key: string, newValue: string) => {
    const updated = systemConfigs.map((c) => (c.key === key ? { ...c, value: newValue } : c));
    setSystemConfigs(updated);
    if (onUpdateSystemConfigs) onUpdateSystemConfigs(updated);
    showToast(`Updated parameter value to: ${newValue}`);
  };

  const handleOpenAddConfigModal = () => {
    setConfigFormKey('');
    setConfigFormLabel('');
    setConfigFormValue('');
    setConfigFormDescription('');
    setConfigFormCategory('Security');
    setConfigFormType('toggle');
    setConfigFormOptions('');
    setEditingConfigItem(null);
    setIsAddConfigModalOpen(true);
  };

  const handleSaveConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configFormKey.trim() || !configFormLabel.trim()) {
      showToast('Key and Label are required');
      return;
    }

    const optionsList = configFormOptions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const formattedKey = configFormKey.trim().toUpperCase().replace(/\s+/g, '_');

    const updated = [...systemConfigs];
    const existingIdx = updated.findIndex((c) => c.key === formattedKey);

    const newConfig: SystemConfigItem = {
      key: formattedKey,
      label: configFormLabel.trim(),
      value: configFormValue.trim() || (configFormType === 'toggle' ? 'Enabled' : 'Active'),
      description: configFormDescription.trim() || 'Custom system security parameter',
      category: configFormCategory,
      type: configFormType,
      options: optionsList.length > 0 ? optionsList : undefined,
      enabled: true,
    };

    if (existingIdx >= 0) {
      updated[existingIdx] = newConfig;
      showToast(`Updated config parameter "${formattedKey}"`);
    } else {
      updated.push(newConfig);
      showToast(`Added custom config parameter "${formattedKey}"`);
    }

    setSystemConfigs(updated);
    if (onUpdateSystemConfigs) onUpdateSystemConfigs(updated);
    setIsAddConfigModalOpen(false);
  };

  const handleResetConfigsToDefault = () => {
    setNewsCategories(INITIAL_NEWS_CATEGORIES);
    setTipoffCategories(INITIAL_TIPOFF_CATEGORIES);
    setSystemConfigs(INITIAL_SYSTEM_CONFIGS);
    if (onUpdateNewsCategories) onUpdateNewsCategories(INITIAL_NEWS_CATEGORIES);
    if (onUpdateTipoffCategories) onUpdateTipoffCategories(INITIAL_TIPOFF_CATEGORIES);
    if (onUpdateSystemConfigs) onUpdateSystemConfigs(INITIAL_SYSTEM_CONFIGS);
    showToast('Reset all categories & configs to AMECO baseline standards');
  };

  // Quick Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleCopyText = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    showToast(`Copied ${fieldKey} to clipboard`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Group Users
  const investigators = users.filter((u) => u.role === 'ResponsiblePerson');
  const citizens = users.filter((u) => u.role === 'Citizen');
  const admins = users.filter((u) => u.role === 'Administrator');
  const institutions = users.filter((u) => u.role === 'Institution' || u.role === 'Publisher');
  const hasInstitutionAccounts = institutions.some((user) => user.role === 'Institution');
  const institutionGroupLabel = hasInstitutionAccounts ? 'Institutions' : 'Publishers';

  // Get active list depending on group tab
  const getCurrentGroupUsers = () => {
    if (activeGroupTab === 'investigators') return investigators;
    if (activeGroupTab === 'citizens') return citizens;
    if (activeGroupTab === 'administrators') return admins;
    if (activeGroupTab === 'institutions') return institutions;
    return users;
  };

  // Filtered Users for current group
  const filteredUsers = getCurrentGroupUsers().filter((u) => {
    if (!u) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch =
      !q ||
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.username && (u.username || '').toLowerCase().includes(q)) ||
      (u.email && (u.email || '').toLowerCase().includes(q)) ||
      (u.id && (u.id || '').toLowerCase().includes(q)) ||
      (u.phone && (u.phone || '').toLowerCase().includes(q)) ||
      (u.woreda && (u.woreda || '').toLowerCase().includes(q)) ||
      (u.zone && (u.zone || '').toLowerCase().includes(q)) ||
      (u.department && (u.department || '').toLowerCase().includes(q));

    const matchesZone =
      zoneFilter === 'All' ||
      u.zone === zoneFilter ||
      u.region === zoneFilter ||
      (u.zone && (u.zone || '').toLowerCase().includes((zoneFilter || '').toLowerCase())) ||
      (u.region && (u.region || '').toLowerCase().includes((zoneFilter || '').toLowerCase()));
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;

    return matchesSearch && matchesZone && matchesStatus;
  });

  // Calculate statistics for Active Group
  const activeInvestigatorsCount = investigators.filter((u) => u.status === 'active').length;
  const activeCitizensCount = citizens.filter((u) => u.status === 'active').length;
  const verifiedCitizensCount = citizens.filter((u) => u.verified).length;
  const suspendedCitizensCount = citizens.filter((u) => u.status === 'suspended').length;
  const bannedCitizensCount = citizens.filter((u) => u.status === 'banned').length;

  const totalAssignedCases = reports.filter(
    (r) => r.status === 'Assigned' || r.status === 'Investigation in Progress'
  ).length;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();

    const nameValidation = validateName(fullName, 'Full Name');
    if (!nameValidation.isValid) {
      showToast(nameValidation.error || 'Name must contain letters only');
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      showToast(emailValidation.error || 'Please enter a valid formal email address');
      return;
    }

    if (phone && phone.trim()) {
      const phoneValidation = validateInternationalPhone(phone);
      if (!phoneValidation.isValid) {
        showToast(phoneValidation.error || 'Invalid international phone format');
        return;
      }
    }

    // Enforce CV and Degree/Masters/PhD Certificate requirement ONLY for Staff (Investigators & Admins)
    if (role === 'ResponsiblePerson' || role === 'Administrator') {
      if (!cvFile || !certificateFile) {
        setDocValidationWarning(
          `Staff vetting mandate: Both Curriculum Vitae (CV) and Degree / Masters / PhD Certificate must be uploaded to provision this ${
            role === 'ResponsiblePerson' ? 'Investigator' : 'Administrator'
          } account.`
        );
        showToast('Please upload both CV and Degree/Masters/PhD Certificate');
        return;
      }
    }

    // For Media Agencies / Institutions: Vetting requires License Number and Official Website
    if (role === 'Institution') {
      if (!mediaLicenseNumber.trim()) {
        setDocValidationWarning('Media accreditation mandate: Operating License / Registration Number is required.');
        showToast('Please enter Media License / Registration Number');
        return;
      }
      if (!officialWebsite.trim()) {
        setDocValidationWarning('Media accreditation mandate: Official Website / Portal URL is required.');
        showToast('Please enter Official Website URL');
        return;
      }
    }

    const newId =
      (role === 'Citizen' ? 'CZN-2026-' : role === 'Administrator' ? 'ADM-' : role === 'Institution' ? 'INST-' : 'INV-') +
      Math.floor(1000 + Math.random() * 9000);

    const effectivePassword = (customPassword && customPassword.trim()) || generateDefaultPassword(role);
    const isCustom = zone.startsWith('Others') || region === 'Others...';
    const effectiveZone = isCustom ? (customZone.trim() || 'Custom Location') : zone;

    const newUser: UserProfile = {
      id: newId,
      password: effectivePassword,
      isDefaultPassword: true,
      fullName: fullName || '',
      email: (email || '').trim().toLowerCase(),
      phone,
      role: role === 'Institution' ? 'Publisher' : role,
      region: region || 'Amhara Region',
      zone: effectiveZone,
      woreda,
      address,
      department: role === 'Institution' ? organizationType : (role !== 'Citizen' ? department : undefined),
      avatarUrl: `https://images.unsplash.com/photo-${
        role === 'Citizen'
          ? '1534528741775-53994a69daeb'
          : role === 'Institution'
          ? '1585829365295-ab7cd400c167'
          : '1500648767791-00dcc994a43e'
      }?auto=format&fit=crop&q=80&w=200`,
      status: 'active',
      verified: true,
      // Institution & Publisher Specific Properties
      isApprovedInstitution: role === 'Institution' ? true : undefined,
      institutionName: role === 'Institution' ? fullName : undefined,
      organizationType: role === 'Institution' ? organizationType : undefined,
      institutionCategory: role === 'Institution' ? organizationType : undefined,
      mediaLicenseNumber: role === 'Institution' ? mediaLicenseNumber.trim() : undefined,
      registrationNumber: role === 'Institution' ? mediaLicenseNumber.trim() : undefined,
      officialWebsite: role === 'Institution' ? officialWebsite.trim() : undefined,
      website: role === 'Institution' ? officialWebsite.trim() : undefined,
      focalPersonName: role === 'Institution' ? (focalPersonName.trim() || fullName) : undefined,
      accreditationDocName: role === 'Institution' && accreditationFile ? accreditationFile.name : undefined,
      accreditationDocSize: role === 'Institution' && accreditationFile ? accreditationFile.size : undefined,
      accreditationDocData: role === 'Institution' && accreditationFile ? accreditationFile.dataUrl : undefined,
      joinedDate: new Date().toISOString().split('T')[0],
      assignedCasesCount: role === 'ResponsiblePerson' ? 0 : undefined,
      clearanceLevel: role !== 'Citizen' && role !== 'Institution' ? clearanceLevel : undefined,
      badgeNumber: role !== 'Citizen' ? `AMECO-${(role === 'Institution' ? 'PUB' : role.substring(0, 3)).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}` : undefined,
      reputationScore: role === 'Citizen' ? 95 : 99,
      // Academic & Professional Verification Documents (Investigators & Admins)
      qualificationLevel: role !== 'Citizen' && role !== 'Institution' ? qualificationLevel : undefined,
      fieldOfStudy: role !== 'Citizen' && role !== 'Institution' ? fieldOfStudy : undefined,
      cvFileName: cvFile ? cvFile.name : undefined,
      cvFileSize: cvFile ? cvFile.size : undefined,
      cvFileData: cvFile ? cvFile.dataUrl : undefined,
      certificateFileName: certificateFile ? certificateFile.name : undefined,
      certificateFileSize: certificateFile ? certificateFile.size : undefined,
      certificateFileData: certificateFile ? certificateFile.dataUrl : undefined,
    };

    onAddUser(newUser);
    setShowAddUserModal(false);
    setProvisionedCredentialModal({ user: newUser, plainPassword: effectivePassword });
    showToast(`Successfully created ${role === 'Institution' ? 'Publisher' : role} account for ${fullName} (${newId})`);

    setFullName('');
    setEmail('');
    setPhone('');
    setCustomZone('');
    setCvFile(null);
    setCertificateFile(null);
    setAccreditationFile(null);
    setMediaLicenseNumber('');
    setOfficialWebsite('');
    setFocalPersonName('');
    setDocValidationWarning(null);
    setCustomPassword(generateDefaultPassword(role));
  };

  // Status Action Helper
  const handleToggleStatus = (user: UserProfile, targetStatus: 'active' | 'suspended' | 'banned') => {
    onUpdateUserStatus(user.id, targetStatus);
    showToast(`Updated ${user.fullName} account status to "${targetStatus.toUpperCase()}"`);
    if (selectedCitizen && selectedCitizen.id === user.id) {
      setSelectedCitizen({ ...selectedCitizen, status: targetStatus });
    }
    if (selectedInvestigator && selectedInvestigator.id === user.id) {
      setSelectedInvestigator({ ...selectedInvestigator, status: targetStatus });
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 card-hover-lift">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#005BAC] dark:text-blue-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>User Accounts & RBAC Governance</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  High Scale Multi-Role Management
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage registered Citizens, AMECO Investigative Field Officers, Administrators, and Department Desks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Group Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs font-bold">
          {/* Investigators Group Button */}
          <button
            onClick={() => setActiveGroupTab('investigators')}
            className={`p-3.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              activeGroupTab === 'investigators'
                ? 'bg-[#005BAC] text-white shadow-md'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className={`w-4 h-4 ${activeGroupTab === 'investigators' ? 'text-amber-300' : 'text-[#005BAC]'}`} />
              <div className="text-left">
                <div className="leading-tight">Investigators</div>
                <div className={`text-[10px] font-normal ${activeGroupTab === 'investigators' ? 'text-blue-100' : 'text-slate-400'}`}>
                  Staff Officers
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeGroupTab === 'investigators'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {investigators.length}
            </span>
          </button>

          {/* Registered Citizens Group Button */}
          <button
            onClick={() => setActiveGroupTab('citizens')}
            className={`p-3.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              activeGroupTab === 'citizens'
                ? 'bg-[#005BAC] text-white shadow-md'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Users className={`w-4 h-4 ${activeGroupTab === 'citizens' ? 'text-emerald-300' : 'text-emerald-600'}`} />
              <div className="text-left">
                <div className="leading-tight">Citizens</div>
                <div className={`text-[10px] font-normal ${activeGroupTab === 'citizens' ? 'text-blue-100' : 'text-slate-400'}`}>
                  Public Accounts
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeGroupTab === 'citizens'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {citizens.length}
            </span>
          </button>

          {/* Institutions Group Button */}
          <button
            onClick={() => setActiveGroupTab('institutions')}
            className={`p-3.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              activeGroupTab === 'institutions'
                ? 'bg-[#005BAC] text-white shadow-md'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Radio className={`w-4 h-4 ${activeGroupTab === 'institutions' ? 'text-cyan-300' : 'text-[#005BAC]'}`} />
              <div className="text-left">
                <div className="leading-tight">{institutionGroupLabel}</div>
                <div className={`text-[10px] font-normal ${activeGroupTab === 'institutions' ? 'text-blue-100' : 'text-slate-400'}`}>
                  News Publishers
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeGroupTab === 'institutions'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {institutions.length}
            </span>
          </button>

          {/* System Administrators Group Button */}
          <button
            onClick={() => setActiveGroupTab('administrators')}
            className={`p-3.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              activeGroupTab === 'administrators'
                ? 'bg-[#005BAC] text-white shadow-md'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Shield className={`w-4 h-4 ${activeGroupTab === 'administrators' ? 'text-red-300' : 'text-red-600'}`} />
              <div className="text-left">
                <div className="leading-tight">Admins</div>
                <div className={`text-[10px] font-normal ${activeGroupTab === 'administrators' ? 'text-blue-100' : 'text-slate-400'}`}>
                  Root Editorial
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeGroupTab === 'administrators'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {admins.length}
            </span>
          </button>

          {/* Department Desks Tab */}
          <button
            onClick={() => setActiveGroupTab('departments')}
            className={`p-3.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              activeGroupTab === 'departments'
                ? 'bg-[#005BAC] text-white shadow-md'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Building2 className={`w-4 h-4 ${activeGroupTab === 'departments' ? 'text-amber-300' : 'text-purple-600'}`} />
              <div className="text-left">
                <div className="leading-tight">Department Desks</div>
                <div className={`text-[10px] font-normal ${activeGroupTab === 'departments' ? 'text-blue-100' : 'text-slate-400'}`}>
                  AMECO Units ({departments.length})
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeGroupTab === 'departments'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {departments.length}
            </span>
          </button>

          {/* Categories & System Settings Tab */}
          <button
            onClick={() => setActiveGroupTab('categories-settings')}
            className={`p-3.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              activeGroupTab === 'categories-settings'
                ? 'bg-[#005BAC] text-white shadow-md'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <SlidersHorizontal className={`w-4 h-4 ${activeGroupTab === 'categories-settings' ? 'text-cyan-300' : 'text-cyan-600'}`} />
              <div className="text-left">
                <div className="leading-tight">Categories & Config</div>
                <div className={`text-[10px] font-normal ${activeGroupTab === 'categories-settings' ? 'text-blue-100' : 'text-slate-400'}`}>
                  FR-18 System Settings
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeGroupTab === 'categories-settings'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {newsCategories.length + tipoffCategories.length + systemConfigs.length}
            </span>
          </button>
        </div>
      </div>

      {/* Group Summary Statistics Banner */}
      {activeGroupTab === 'investigators' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Active Investigators</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 block font-mono">
              {activeInvestigatorsCount}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
              100% Regional Coverage
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Department Desks</span>
            <span className="text-2xl font-extrabold text-[#005BAC] dark:text-blue-400 mt-1 block font-mono">
              {departments.length}
            </span>
            <span className="text-[10px] text-slate-500 block">Assigned Lead Officers</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Active Assigned Cases</span>
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 block font-mono">
              {totalAssignedCases}
            </span>
            <span className="text-[10px] text-slate-500 block">Under Active Investigation</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Security Clearances</span>
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block font-mono">
              Level 3-4
            </span>
            <span className="text-[10px] text-slate-500 block">Confidential Protection</span>
          </div>
        </div>
      )}

      {activeGroupTab === 'citizens' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Total Registered Citizens</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 block font-mono">
              {citizens.length}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
              Scalable for 10,000+ Users
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Verified Accounts</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
              {verifiedCitizensCount}
            </span>
            <span className="text-[10px] text-slate-500 block">Identity Badge Confirmed</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Active Accounts</span>
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block font-mono">
              {activeCitizensCount}
            </span>
            <span className="text-[10px] text-slate-500 block">Can File Tip-offs</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Suspended / Banned</span>
            <span className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1 block font-mono">
              {suspendedCitizensCount + bannedCitizensCount}
            </span>
            <span className="text-[10px] text-slate-500 block">Restricted Access</span>
          </div>
        </div>
      )}

      {/* Controls & Filter Bar (Only for User Groups, not Department list) */}
      {activeGroupTab !== 'departments' && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeGroupTab} by name, ID, phone, woreda...`}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-[#005BAC] outline-none transition-all"
            />
          </div>

          {/* Filter Dropdowns & Context-Specific Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Context-Specific Registration Buttons */}
            {activeGroupTab === 'investigators' && (
              <button
                type="button"
                onClick={() => {
                  setRole('ResponsiblePerson');
                  setCustomPassword(generateDefaultPassword('ResponsiblePerson'));
                  setShowAddUserModal(true);
                }}
                className="bg-[#005BAC] hover:bg-blue-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs flex items-center space-x-1.5 transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register New Investigator</span>
              </button>
            )}

            {activeGroupTab === 'institutions' && (
              <button
                type="button"
                onClick={() => {
                  setRole('Institution');
                  setCustomPassword(generateDefaultPassword('Institution'));
                  setShowAddUserModal(true);
                }}
                className="bg-[#005BAC] hover:bg-blue-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs flex items-center space-x-1.5 transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register New Institution</span>
              </button>
            )}

            {activeGroupTab === 'administrators' && (
              <button
                type="button"
                onClick={() => {
                  setRole('Administrator');
                  setCustomPassword(generateDefaultPassword('Administrator'));
                  setShowAddUserModal(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs flex items-center space-x-1.5 transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Administrator</span>
              </button>
            )}

            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Regions & Zones</option>
                {REGIONAL_ZONES.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
                <option value="banned">Banned Only</option>
              </select>
            </div>

            {/* Grid vs Table View Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-xs text-[#005BAC] dark:text-blue-300' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-xs text-[#005BAC] dark:text-blue-300' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT VIEWS */}

      {/* 1. INVESTIGATORS TAB */}
      {activeGroupTab === 'investigators' && (
        <div>
          {filteredUsers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <ShieldCheck className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Investigators Found</h3>
              <p className="text-xs text-slate-400">Try clearing your search query or zone filters.</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Investigators Grid Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((inv) => {
                const assignedCases = reports.filter(
                  (r) => r.assignedTo?.responsiblePersonId === inv.id
                );

                return (
                  <div
                    key={inv.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all card-hover-lift flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-[#005BAC] text-white flex items-center justify-center font-extrabold text-lg shadow-xs shrink-0 border-2 border-slate-200 dark:border-slate-700">
                            {inv.fullName ? inv.fullName.trim().charAt(0).toUpperCase() : 'I'}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                              <span>{inv.fullName}</span>
                              <BadgeCheck className="w-4 h-4 text-[#005BAC]" />
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-[#005BAC] dark:text-blue-400 font-semibold block truncate max-w-[150px]">
                                {inv.email}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 block">
                                Badge: {inv.badgeNumber || inv.id}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              inv.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : inv.status === 'suspended'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {inv.status}
                          </span>
                          {inv.isDefaultPassword ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-1">
                              <Key className="w-2.5 h-2.5" />
                              <span>Default Password</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Custom Password</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Department Desk & Clearance */}
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                          <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-[#005BAC]" /> Department Desk
                          </span>
                          <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-[#005BAC] dark:text-blue-300 font-bold px-2 py-0.5 rounded font-mono">
                            {assignedCases.length} Active Cases
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {inv.department || 'General Investigation Unit'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span>{inv.zone} {inv.woreda ? `(${inv.woreda})` : ''}</span>
                        </p>
                      </div>

                      {/* Contacts */}
                      <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 pt-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px] truncate">{inv.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px]">{inv.phone || '+251 91 000 0000'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 text-xs flex-wrap">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setSelectedInvestigator(inv)}
                          className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-[#005BAC] dark:text-blue-300 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                          title="View Investigator Dossier & Assigned Cases"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Dossier</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(inv)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                          title="Update Profile & Department Desk"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                          <span>Edit</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-1">
                        {inv.status === 'active' ? (
                          <button
                            onClick={() => handleToggleStatus(inv, 'suspended')}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                            title="Suspend Investigator Access"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(inv, 'active')}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Reactivate
                          </button>
                        )}

                        <button
                          onClick={() => setDeletingUser(inv)}
                          className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                          title="Delete Account Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Investigators Table View */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3.5">Investigator Officer</th>
                      <th className="p-3.5">Department Desk</th>
                      <th className="p-3.5">Zone / Woreda</th>
                      <th className="p-3.5">Contact Details</th>
                      <th className="p-3.5">Active Cases</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.map((inv) => {
                      const caseCount = reports.filter(
                        (r) => r.assignedTo?.responsiblePersonId === inv.id
                      ).length;

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-[#005BAC] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                                {inv.fullName ? inv.fullName.trim().charAt(0).toUpperCase() : 'I'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                                  <span>{inv.fullName}</span>
                                  <BadgeCheck className="w-3.5 h-3.5 text-[#005BAC]" />
                                </div>
                                <span className="font-mono text-[10px] text-slate-400">{inv.badgeNumber || inv.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                            {inv.department || 'General Desk'}
                          </td>

                          <td className="p-3.5 font-medium text-slate-600 dark:text-slate-400">
                            {inv.zone}
                          </td>

                          <td className="p-3.5">
                            <div>{inv.email}</div>
                            <span className="text-[10px] text-slate-400 font-mono">{inv.phone}</span>
                          </td>

                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-100 dark:bg-blue-950 text-[#005BAC] dark:text-blue-300 text-[10px]">
                              {caseCount} Cases
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {inv.status}
                            </span>
                          </td>

                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedInvestigator(inv)}
                              className="px-2 py-1 bg-blue-50 text-[#005BAC] font-bold rounded text-[11px] hover:bg-blue-100 transition-colors"
                              title="View Details"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(inv)}
                              className="px-2 py-1 bg-slate-100 text-slate-700 font-bold rounded text-[11px] hover:bg-slate-200 transition-colors"
                              title="Edit Profile"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(inv, inv.status === 'active' ? 'suspended' : 'active')}
                              className="px-2 py-1 bg-amber-50 text-amber-800 font-bold rounded text-[11px] hover:bg-amber-100 transition-colors"
                            >
                              {inv.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              onClick={() => setDeletingUser(inv)}
                              className="px-2 py-1 bg-red-50 text-red-700 font-bold rounded text-[11px] hover:bg-red-100 transition-colors"
                              title="Delete Permanently"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. REGISTERED CITIZENS TAB */}
      {activeGroupTab === 'citizens' && (
        <div className="space-y-4">
          {/* Informational Banner on Scalability & Security */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-xl text-emerald-800 dark:text-emerald-200 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-emerald-900 dark:text-emerald-100">
                  Citizen Accounts Directory & Public Identity Records
                </p>
                <p className="text-emerald-700 dark:text-emerald-300 text-[11px]">
                  Showing {filteredUsers.length} registered citizens. Click any citizen profile to inspect full personal address, woreda, phone contact, and submitted tip-off histories.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <span className="text-[10px] font-mono bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold px-2.5 py-1 rounded-lg">
                Verified Database Security
              </span>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Citizens Found</h3>
              <p className="text-xs text-slate-400">Try adjusting your search criteria or zone filters.</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Citizens Grid Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((czn) => {
                const submittedCount = reports.filter((r) => r.citizenId === czn.id).length;

                return (
                  <div
                    key={czn.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all card-hover-lift flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-[#005BAC] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                            {czn.fullName ? czn.fullName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'CZ'}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                              <span>{czn.fullName}</span>
                              {czn.verified && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              )}
                            </h3>
                            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 block">
                              Citizen ID: {czn.id}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            czn.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : czn.status === 'suspended'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {czn.status}
                        </span>
                      </div>

                      {/* Location & Address Box */}
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#005BAC]" /> Saved Residence
                          </span>
                          <span className="text-[10px] font-bold font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded">
                            {submittedCount} Submissions
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {czn.woreda || 'Bahir Dar Zuria Woreda'}, {czn.zone}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {czn.address || 'Registered Amhara Citizen Residence'}
                        </p>
                      </div>

                      {/* Contact Info */}
                      <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px] truncate">{czn.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px]">{czn.phone || '+251 91 000 0000'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Joined: {czn.joinedDate || '2025-11-10'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 text-xs flex-wrap">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setSelectedCitizen(czn)}
                          className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                          title="View Personal Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(czn)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                          title="Update Profile"
                        >
                          <Edit className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Edit</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-1">
                        {czn.status === 'active' ? (
                          <button
                            onClick={() => handleToggleStatus(czn, 'suspended')}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                            title="Suspend Citizen Account"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(czn, 'active')}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Reactivate
                          </button>
                        )}

                        <button
                          onClick={() => setDeletingUser(czn)}
                          className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                          title="Delete Account Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Citizens Table View */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3.5">Citizen Profile</th>
                      <th className="p-3.5">Verified Identity</th>
                      <th className="p-3.5">Woreda / Zone Location</th>
                      <th className="p-3.5">Contact Phone & Email</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.map((czn) => (
                      <tr key={czn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-[#005BAC] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                              {czn.fullName ? czn.fullName.trim().charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">{czn.fullName}</div>
                              <span className="font-mono text-[10px] text-slate-400">{czn.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit ${
                              czn.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{czn.verified ? 'Verified Citizen' : 'Unverified'}</span>
                          </span>
                        </td>

                        <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                          {czn.woreda || 'Bahir Dar Zuria'}, {czn.zone}
                        </td>

                        <td className="p-3.5">
                          <div>{czn.email}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{czn.phone}</span>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              czn.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : czn.status === 'suspended'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {czn.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedCitizen(czn)}
                            className="px-2 py-1 bg-emerald-50 text-emerald-800 font-bold rounded text-[11px] hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="View Info"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(czn)}
                            className="px-2 py-1 bg-slate-100 text-slate-700 font-bold rounded text-[11px] hover:bg-slate-200 transition-colors cursor-pointer"
                            title="Edit Profile"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(czn, czn.status === 'active' ? 'suspended' : 'active')}
                            className="px-2.5 py-1 bg-amber-50 text-amber-800 font-bold rounded text-[11px] hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            {czn.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => setDeletingUser(czn)}
                            className="px-2 py-1 bg-red-50 text-red-700 font-bold rounded text-[11px] hover:bg-red-100 transition-colors cursor-pointer"
                            title="Delete Permanently"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* INSTITUTIONS TAB */}
      {activeGroupTab === 'institutions' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#005BAC] text-white rounded-xl shrink-0">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-blue-900 dark:text-blue-100">
                  Approved {hasInstitutionAccounts ? 'Institutional Accounts' : 'Publisher Accounts'} & Trending News Publishers
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-[11px]">
                  Administrators create and manage official {hasInstitutionAccounts ? 'institution' : 'publisher'} accounts. Only approved accounts can broadcast verified trending news bulletins to citizens.
                </p>
              </div>
            </div>
          </div>

          {institutions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Radio className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No {institutionGroupLabel} Registered</h3>
              <p className="text-xs text-slate-400">Click below to provision an official institutional publisher account.</p>
              <button
                type="button"
                onClick={() => {
                  setRole('Institution');
                  setCustomPassword(generateDefaultPassword('Institution'));
                  setShowAddUserModal(true);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer mt-2"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register New Institution</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {institutions.map((inst) => {
                const isApproved = inst.isApprovedInstitution !== false;

                return (
                  <div
                    key={inst.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#005BAC] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                            <Radio className="w-5 h-5 text-amber-300" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                              <span>{inst.fullName}</span>
                              {isApproved && (
                                <BadgeCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              )}
                            </h3>
                            <span className="font-mono text-[11px] text-slate-500 block">
                              ID: {inst.id}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold uppercase">
                          <span>Category</span>
                          <span>{inst.registrationNumber || 'REG-AMECO-2026'}</span>
                        </div>
                        <p className="font-bold text-[#005BAC] dark:text-blue-300">
                          {inst.institutionCategory || 'Public Media & Civil Agency'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Zone: <strong className="text-slate-800 dark:text-slate-200">{inst.zone}</strong>
                        </p>
                      </div>

                      <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        <div>Email: {inst.email}</div>
                        <div>Phone: {inst.phone || '+251 91 000 0000'}</div>
                        {inst.focalPersonName && (
                          <div>Contact: <span className="text-slate-800 dark:text-slate-200 font-semibold">{inst.focalPersonName}</span></div>
                        )}
                        {(inst.officialWebsite || inst.website) && (
                          <div className="truncate">
                            Web: <a href={inst.officialWebsite || inst.website} target="_blank" rel="noreferrer" className="text-[#005BAC] dark:text-blue-400 hover:underline font-sans">{inst.officialWebsite || inst.website}</a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 text-xs flex-wrap">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setSelectedInstitution(inst)}
                          className="px-2.5 py-1.5 bg-blue-50 text-[#005BAC] hover:bg-blue-100 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                          title="View Info"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Info</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(inst)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                          <span>Edit</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            const updated = !isApproved;
                            onAddUser({ ...inst, isApprovedInstitution: updated });
                            showToast(`${updated ? 'Approved' : 'Revoked approval for'} ${inst.fullName}`);
                          }}
                          className={`px-2 py-1 font-bold rounded-xl text-[11px] flex items-center space-x-1 transition-colors cursor-pointer ${
                            isApproved
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          <span>{isApproved ? 'Revoke' : 'Approve'}</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(inst, inst.status === 'active' ? 'suspended' : 'active')}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-[11px] cursor-pointer"
                        >
                          {inst.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>

                        <button
                          onClick={() => setDeletingUser(inst)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          title="Delete Account Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. SYSTEM ADMINISTRATORS TAB */}
      {activeGroupTab === 'administrators' && (
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-2xl border border-red-200 dark:border-red-800 text-xs flex items-center space-x-3">
            <Shield className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="font-bold text-red-900 dark:text-red-200">
                System Root Administration Officers
              </p>
              <p className="text-red-800 dark:text-red-300 text-[11px]">
                Administrators hold root access over system workflows, audit logs, identity unmasking, and department assignments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {admins.map((adm) => (
              <div
                key={adm.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-extrabold text-lg shadow-xs border-2 border-red-200 dark:border-red-800 shrink-0">
                    {adm.fullName ? adm.fullName.trim().charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                      <span>{adm.fullName}</span>
                      <Shield className="w-4 h-4 text-red-600" />
                    </h3>
                    <span className="font-mono text-[11px] text-slate-500">{adm.badgeNumber || adm.id}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <p className="font-bold text-slate-900 dark:text-slate-100">{adm.department || 'AMECO Executive Board'}</p>
                  <p className="text-slate-500 text-[11px]">{adm.email} | {adm.phone}</p>
                  <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase pt-1">
                    Clearance: {adm.clearanceLevel || 'Level 5 - Root Admin'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs flex-wrap">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setSelectedAdmin(adm)}
                      className="px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Info</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(adm)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-red-600" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleStatus(adm, adm.status === 'active' ? 'suspended' : 'active')}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      {adm.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>

                    <button
                      onClick={() => setDeletingUser(adm)}
                      className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                      title="Delete Account Permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DEPARTMENT DESKS TAB */}
      {activeGroupTab === 'departments' && (
        <div className="space-y-6">
          {/* Header & Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-[#005BAC]" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  AMECO Specialized Department Desks
                </h3>
                <span className="bg-blue-100 dark:bg-blue-950 text-[#005BAC] dark:text-blue-300 font-mono text-xs font-bold px-2 py-0.5 rounded-full">
                  {departments.length} Units Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize investigative jurisdictional units, designate lead officers, and route incoming tip-offs.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search desk name, ID, or lead..."
                  value={departmentSearch}
                  onChange={(e) => setDepartmentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#005BAC] text-slate-900 dark:text-slate-100"
                />
                {departmentSearch && (
                  <button
                    onClick={() => setDepartmentSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={handleOpenAddDeptModal}
                className="px-4 py-2 bg-[#005BAC] hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer transition-all hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Department Desk</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Active Department Desks</span>
              <span className="text-2xl font-extrabold text-[#005BAC] dark:text-blue-400 mt-1 block font-mono">
                {departments.length}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                100% Operational
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Total Reports Handled</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 block font-mono">
                {departments.reduce((acc, d) => acc + (d.reportCount || 0), 0)}
              </span>
              <span className="text-[10px] text-slate-500 block">Across all units</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Designated Lead Officers</span>
              <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 block font-mono">
                {new Set(departments.map((d) => d.head)).size}
              </span>
              <span className="text-[10px] text-slate-500 block">Assigned Investigators</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Regional Authority</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 block font-mono">
                AMECO-HQ
              </span>
              <span className="text-[10px] text-slate-500 block">Bahir Dar Central</span>
            </div>
          </div>

          {/* Department Desks Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments
              .filter((d) => {
                const q = (departmentSearch || '').toLowerCase().trim();
                if (!q) return true;
                return (
                  (d.name || '').toLowerCase().includes(q) ||
                  (d.id || '').toLowerCase().includes(q) ||
                  (d.head || '').toLowerCase().includes(q) ||
                  (d.description && (d.description || '').toLowerCase().includes(q)) ||
                  (d.focusAreas && d.focusAreas.some((f) => (f || '').toLowerCase().includes(q)))
                );
              })
              .map((d) => (
                <div
                  key={d.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 card-hover-lift flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Card Top Pill */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <span className="font-mono text-xs font-bold text-[#005BAC] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200/60 dark:border-blue-800/60">
                        {d.id}
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{d.reportCount || 0} Reports</span>
                      </span>
                    </div>

                    {/* Department Title */}
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-[#005BAC] shrink-0 mt-0.5" />
                        <span>{d.name}</span>
                      </h3>
                      {d.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                          {d.description}
                        </p>
                      )}
                    </div>

                    {/* Desk Lead & Contact Details */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px] font-semibold">Desk Lead Officer:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{d.head}</span>
                      </div>
                      {d.contactEmail && (
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Email:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                            {d.contactEmail}
                          </span>
                        </div>
                      )}
                      {d.phoneExtension && (
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Phone / Ext:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300">{d.phoneExtension}</span>
                        </div>
                      )}
                    </div>

                    {/* Focus Areas Tags */}
                    {d.focusAreas && d.focusAreas.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Jurisdiction & Focus Areas
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {d.focusAreas.map((focus, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-blue-50/70 dark:bg-blue-950/40 text-[#005BAC] dark:text-blue-300 text-[10px] font-semibold rounded-md border border-blue-100 dark:border-blue-900/60"
                            >
                              {focus}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditDeptModal(d)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#005BAC] hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Desk</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingDepartment(d)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 5. CATEGORIES & SYSTEM SETTINGS TAB */}
      {activeGroupTab === 'categories-settings' && (
        <div className="space-y-6">
          {/* Header & Sub-Navigation */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#005BAC]" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    System Categories & Operational Configuration (FR-18)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage citizen news topics, confidential tip-off threat categories, and regional security governance parameters.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetConfigsToDefault}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fullConfigBlob = {
                      newsCategories,
                      tipoffCategories,
                      systemConfigs,
                      exportedAt: new Date().toISOString(),
                    };
                    navigator.clipboard.writeText(JSON.stringify(fullConfigBlob, null, 2));
                    showToast('Exported system configuration to clipboard (JSON)');
                  }}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* Navigation Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveConfigSection('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeConfigSection === 'all'
                    ? 'bg-[#005BAC] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Configuration ({newsCategories.length + tipoffCategories.length + systemConfigs.length})
              </button>
              <button
                onClick={() => setActiveConfigSection('news')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeConfigSection === 'news'
                    ? 'bg-[#005BAC] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Public News Categories ({newsCategories.length})
              </button>
              <button
                onClick={() => setActiveConfigSection('tipoff')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeConfigSection === 'tipoff'
                    ? 'bg-[#005BAC] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Tip-Off Categories ({tipoffCategories.length})
              </button>
              <button
                onClick={() => setActiveConfigSection('system')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeConfigSection === 'system'
                    ? 'bg-[#005BAC] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                System Security & Governance ({systemConfigs.length})
              </button>
            </div>
          </div>

          {/* Configuration Panels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. PUBLIC NEWS CATEGORIES PANEL */}
            {(activeConfigSection === 'all' || activeConfigSection === 'news') && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-600" />
                      <span>Public News Categories</span>
                    </h3>
                    <p className="text-xs text-slate-500">Categories for community articles and broadcasts.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAddCategoryModal('news')}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-[#005BAC] dark:text-blue-300 font-bold text-xs rounded-xl border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add News Category</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {newsCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        cat.enabled !== false
                          ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                          : 'bg-slate-100/60 dark:bg-slate-800/20 border-slate-200/40 opacity-60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-bold text-xs flex items-center gap-1 ${
                              cat.badgeColor === 'emerald'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : cat.badgeColor === 'amber'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                : cat.badgeColor === 'red'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                                : cat.badgeColor === 'purple'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                                : cat.badgeColor === 'cyan'
                                ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300'
                                : cat.badgeColor === 'indigo'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                                : 'bg-blue-100 text-[#005BAC] dark:bg-blue-950/80 dark:text-blue-300'
                            }`}
                          >
                            <Tag className="w-3 h-3" />
                            <span>{cat.name}</span>
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{cat.id}</span>
                        </div>
                        {cat.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-1">{cat.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(cat)}
                          title={cat.enabled !== false ? 'Disable Category' : 'Enable Category'}
                          className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            cat.enabled !== false
                              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                              : 'text-slate-400 bg-slate-200/60 dark:bg-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditCategoryModal(cat)}
                          className="p-1.5 text-slate-500 hover:text-[#005BAC] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg cursor-pointer transition-colors"
                          title="Edit Category"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCategory(cat)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. CONFIDENTIAL TIP-OFF CATEGORIES PANEL */}
            {(activeConfigSection === 'all' || activeConfigSection === 'tipoff') && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                      <span>Confidential Tip-Off Categories</span>
                    </h3>
                    <p className="text-xs text-slate-500">Security violations and whistleblower threat classification.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAddCategoryModal('tipoff')}
                    className="px-3 py-1.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-700 dark:text-red-300 font-bold text-xs rounded-xl border border-red-200/60 dark:border-red-800/60 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Tip-Off Category</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {tipoffCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        cat.enabled !== false
                          ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                          : 'bg-slate-100/60 dark:bg-slate-800/20 border-slate-200/40 opacity-60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{cat.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              cat.threatLevel === 'Critical'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                : cat.threatLevel === 'High'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                                : cat.threatLevel === 'Moderate'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {cat.threatLevel || 'General'}
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{cat.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(cat)}
                          title={cat.enabled !== false ? 'Disable Category' : 'Enable Category'}
                          className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            cat.enabled !== false
                              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                              : 'text-slate-400 bg-slate-200/60 dark:bg-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditCategoryModal(cat)}
                          className="p-1.5 text-slate-500 hover:text-[#005BAC] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg cursor-pointer transition-colors"
                          title="Edit Category"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCategory(cat)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. SYSTEM SECURITY & GOVERNANCE CONFIGURATION PANEL */}
            {(activeConfigSection === 'all' || activeConfigSection === 'system') && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 lg:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <span>System Security & Operational Parameters</span>
                    </h3>
                    <p className="text-xs text-slate-500">Live configuration for RBAC, storage limits, and SLA rules.</p>
                  </div>
                  <button
                    onClick={handleOpenAddConfigModal}
                    className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-200/60 dark:border-amber-800/60 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Parameter</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {systemConfigs.map((cfg) => (
                    <div
                      key={cfg.key}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                              {cfg.label}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 block">{cfg.key}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded shrink-0">
                            {cfg.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {cfg.description}
                        </p>
                      </div>

                      {/* Interactive Control Row */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
                        {cfg.type === 'toggle' ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="font-mono font-bold text-[11px] text-slate-700 dark:text-slate-300">
                              {cfg.value}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleConfig(cfg)}
                              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                                cfg.enabled !== false
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>{cfg.enabled !== false ? 'Active' : 'Disabled'}</span>
                            </button>
                          </div>
                        ) : cfg.type === 'select' && cfg.options ? (
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="text-[11px] text-slate-500 shrink-0">Current Value:</span>
                            <select
                              value={cfg.value}
                              onChange={(e) => handleUpdateConfigValue(cfg.key, e.target.value)}
                              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-[#005BAC] dark:text-blue-300 cursor-pointer"
                            >
                              {cfg.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="text-[11px] text-slate-500 shrink-0">Value:</span>
                            <input
                              type="text"
                              value={cfg.value}
                              onChange={(e) => handleUpdateConfigValue(cfg.key, e.target.value)}
                              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-[#005BAC] dark:text-blue-300 flex-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CITIZEN PERSONAL DETAILS MODAL */}
      {/* ========================================================= */}
      {selectedCitizen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden space-y-0 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 p-6 text-white flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl border-2 border-emerald-400 shadow-md shrink-0">
                  {selectedCitizen.fullName ? selectedCitizen.fullName.trim().charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-extrabold text-white">{selectedCitizen.fullName}</h2>
                    {selectedCitizen.verified && (
                      <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Citizen</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-mono">System ID: {selectedCitizen.id}</p>
                  <p className="text-[11px] text-emerald-300 font-semibold">
                    Amhara Citizen Journalist Account Profile
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCitizen(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-200">
              {/* Account Status Alert Bar */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Account Governance Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                      selectedCitizen.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : selectedCitizen.status === 'suspended'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {selectedCitizen.status}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedCitizen.status === 'active' ? (
                    <button
                      onClick={() => handleToggleStatus(selectedCitizen, 'suspended')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      Suspend Account
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(selectedCitizen, 'active')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      Reactivate Account
                    </button>
                  )}

                  <button
                    onClick={() =>
                      handleToggleStatus(
                        selectedCitizen,
                        selectedCitizen.status === 'banned' ? 'active' : 'banned'
                      )
                    }
                    className={`px-3 py-1.5 font-bold rounded-xl text-xs transition-colors cursor-pointer ${
                      selectedCitizen.status === 'banned'
                        ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {selectedCitizen.status === 'banned' ? 'Unban Account' : 'Ban Citizen'}
                  </button>
                </div>
              </div>

              {/* Personal Details Grid */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#005BAC]" />
                  <span>Personal Identity Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#005BAC]" /> Full Name
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm block">
                      {selectedCitizen.fullName}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#005BAC]" /> Email Address
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
                      {selectedCitizen.email}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#005BAC]" /> Phone Contact
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
                      {selectedCitizen.phone || '+251 91 823 4567'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#005BAC]" /> Woreda & Zone
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      {selectedCitizen.woreda || 'Bahir Dar Zuria'}, {selectedCitizen.zone}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Compass className="w-3 h-3 text-[#005BAC]" /> Saved Kebele Address
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      {selectedCitizen.address || 'Kebele 14, Near Lake Tana'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#005BAC]" /> Joined Portal Date
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 block">
                      {selectedCitizen.joinedDate || '2025-11-10'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submitted Tip-Offs History */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Submitted Tip-Offs & News Reports History</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">
                    {reports.filter((r) => r.citizenId === selectedCitizen.id).length} Filed Reports
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {reports.filter((r) => r.citizenId === selectedCitizen.id).length === 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl text-center text-slate-400 text-xs">
                      No reports filed by this citizen yet.
                    </div>
                  ) : (
                    reports
                      .filter((r) => r.citizenId === selectedCitizen.id)
                      .map((r) => (
                        <div
                          key={r.id}
                          className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>{r.title}</span>
                              <span className="text-[10px] font-mono text-slate-400">[{r.id}]</span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              Submitted {r.createdAt} | {r.zone}
                            </span>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#005BAC] dark:bg-blue-950 dark:text-blue-300 font-mono">
                            {r.status}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const updatedVerified = !selectedCitizen.verified;
                    setSelectedCitizen({ ...selectedCitizen, verified: updatedVerified });
                    showToast(
                      `Updated verification badge for ${selectedCitizen.fullName} to ${
                        updatedVerified ? 'VERIFIED' : 'UNVERIFIED'
                      }`
                    );
                  }}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {selectedCitizen.verified ? 'Revoke Verified Badge' : 'Grant Verified Badge'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedCitizen)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setDeletingUser(selectedCitizen)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Permanently</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCitizen(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold rounded-xl text-xs hover:opacity-90 cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* INVESTIGATOR DOSSIER MODAL */}
      {/* ========================================================= */}
      {selectedInvestigator && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden space-y-0 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 p-6 text-white flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-[#005BAC] text-white flex items-center justify-center font-black text-2xl border-2 border-blue-400 shadow-md shrink-0">
                  {selectedInvestigator.fullName ? selectedInvestigator.fullName.trim().charAt(0).toUpperCase() : 'I'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-extrabold text-white">{selectedInvestigator.fullName}</h2>
                    <span className="bg-blue-500/30 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/40">
                      Investigative Officer
                    </span>
                  </div>
                  <p className="text-xs text-blue-200 font-mono">
                    Badge Number: {selectedInvestigator.badgeNumber || selectedInvestigator.id}
                  </p>
                  <p className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{selectedInvestigator.clearanceLevel || 'Level 3 - Confidential Whistleblower Clearance'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInvestigator(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-200">
              {/* Official Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-[#005BAC]" /> Assigned Unit Desk
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs block">
                    {selectedInvestigator.department || 'Anti-Corruption Unit'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#005BAC]" /> AMECO Email
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
                    {selectedInvestigator.email}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#005BAC]" /> Phone Line
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
                    {selectedInvestigator.phone || '+251 91 400 9988'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#005BAC]" /> Primary Regional Zone
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {selectedInvestigator.zone}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#005BAC]" /> Commission Date
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 block">
                    {selectedInvestigator.joinedDate || '2023-04-12'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Account Status
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
                    {selectedInvestigator.status}
                  </span>
                </div>
              </div>

              {/* Academic & Professional Credentials Dossier */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-slate-50 dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-slate-900/60 p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      Verified Academic & Professional Credentials
                    </span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                    <BadgeCheck className="w-3 h-3 text-emerald-600" />
                    <span>Vetted & Verified</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Qualification Degree Level
                    </span>
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 text-xs">
                      {selectedInvestigator.qualificationLevel || 'Master Degree (MSc/MA)'}
                    </span>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Discipline / Field of Study
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {selectedInvestigator.fieldOfStudy || 'Law & Forensic Investigation'}
                    </span>
                  </div>
                </div>

                {/* Attached Document Files */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-2 truncate mr-2">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                          {selectedInvestigator.cvFileName || 'Official_Curriculum_Vitae.pdf'}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedInvestigator.cvFileSize || '1.8 MB'} • Curriculum Vitae
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadDoc(
                          selectedInvestigator.cvFileName || 'Official_Curriculum_Vitae.pdf',
                          selectedInvestigator.cvFileData
                        )
                      }
                      className="p-1.5 text-[#005BAC] hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg cursor-pointer transition-colors shrink-0"
                      title="Download / View CV"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-2 truncate mr-2">
                      <Award className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                          {selectedInvestigator.certificateFileName || 'Degree_Master_PhD_Certificate.pdf'}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedInvestigator.certificateFileSize || '2.4 MB'} • Degree Certificate
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadDoc(
                          selectedInvestigator.certificateFileName || 'Degree_Master_PhD_Certificate.pdf',
                          selectedInvestigator.certificateFileData
                        )
                      }
                      className="p-1.5 text-[#005BAC] hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg cursor-pointer transition-colors shrink-0"
                      title="Download / View Certificate"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Assigned Active Cases Workload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#005BAC]" />
                    <span>Assigned Active Investigation Cases</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">
                    {reports.filter((r) => r.assignedTo?.responsiblePersonId === selectedInvestigator.id).length} Active Cases
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {reports.filter((r) => r.assignedTo?.responsiblePersonId === selectedInvestigator.id).length === 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl text-center text-slate-400 text-xs">
                      No active cases assigned to this investigator at this moment.
                    </div>
                  ) : (
                    reports
                      .filter((r) => r.assignedTo?.responsiblePersonId === selectedInvestigator.id)
                      .map((r) => (
                        <div
                          key={r.id}
                          className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>{r.title}</span>
                              <span className="text-[10px] font-mono text-slate-400">[{r.id}]</span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              Priority: <strong className="text-amber-600">{r.priority}</strong> | Deadline: {r.assignedTo?.deadline || 'In Progress'}
                            </span>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-mono">
                            {r.status}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center space-x-2">
                {selectedInvestigator.status === 'active' ? (
                  <button
                    onClick={() => handleToggleStatus(selectedInvestigator, 'suspended')}
                    className="px-3.5 py-2 bg-amber-500 text-slate-900 font-bold rounded-xl text-xs hover:bg-amber-600 transition-colors cursor-pointer"
                  >
                    Suspend Officer Access
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleStatus(selectedInvestigator, 'active')}
                    className="px-3.5 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Reactivate Officer Access
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedInvestigator)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setDeletingUser(selectedInvestigator)}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Permanently</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInvestigator(null)}
                  className="px-5 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold rounded-xl text-xs hover:opacity-90 cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* INSTITUTION DETAILS MODAL */}
      {/* ========================================================= */}
      {selectedInstitution && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden space-y-0 animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 p-6 text-white flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-[#005BAC] text-white flex items-center justify-center font-black text-2xl border-2 border-amber-300 shadow-md shrink-0">
                  <Building2 className="w-8 h-8 text-amber-300" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-extrabold text-white">{selectedInstitution.fullName}</h2>
                    {selectedInstitution.isApprovedInstitution !== false && (
                      <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Approved Publisher</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-blue-200 font-mono">Institution ID: {selectedInstitution.id}</p>
                  <p className="text-[11px] text-amber-300 font-semibold">
                    {selectedInstitution.institutionCategory || 'Public Media & Civil Agency'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInstitution(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Building className="w-3 h-3 text-[#005BAC]" /> Registration No.
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
                    {selectedInstitution.registrationNumber || 'REG-AMECO-2026'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#005BAC]" /> Official Email
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
                    {selectedInstitution.email}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#005BAC]" /> Official Phone
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
                    {selectedInstitution.phone || '+251 91 000 0000'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#005BAC]" /> Jurisdiction Zone
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {selectedInstitution.zone}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#005BAC]" /> Official Portal
                  </span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 block truncate">
                    {selectedInstitution.officialWebsite || 'https://ameco.gov.et'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Account Status
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
                    {selectedInstitution.status}
                  </span>
                </div>
              </div>

              {/* Academic & Accreditation Credentials Dossier */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-slate-50 dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-slate-900/60 p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      Verified Institution License & Lead Officer Credentials
                    </span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                    <BadgeCheck className="w-3 h-3 text-emerald-600" />
                    <span>Accredited</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Accreditation / Degree Level
                    </span>
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 text-xs">
                      {selectedInstitution.qualificationLevel || 'Master Degree / Institutional Charter'}
                    </span>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Field of Mandate / Specialization
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {selectedInstitution.fieldOfStudy || 'Public Governance & Civil Law'}
                    </span>
                  </div>
                </div>

                {/* Attached Document Files */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-2 truncate mr-2">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                          {selectedInstitution.cvFileName || 'Institutional_Charter_Lead_CV.pdf'}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedInstitution.cvFileSize || '2.1 MB'} • Officer CV / Dossier
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadDoc(
                          selectedInstitution.cvFileName || 'Institutional_Charter_Lead_CV.pdf',
                          selectedInstitution.cvFileData
                        )
                      }
                      className="p-1.5 text-[#005BAC] hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg cursor-pointer transition-colors shrink-0"
                      title="Download / View CV"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-2 truncate mr-2">
                      <Award className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                          {selectedInstitution.certificateFileName || 'Accreditation_Certificate_License.pdf'}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedInstitution.certificateFileSize || '3.2 MB'} • Accreditation Certificate
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadDoc(
                          selectedInstitution.certificateFileName || 'Accreditation_Certificate_License.pdf',
                          selectedInstitution.certificateFileData
                        )
                      }
                      className="p-1.5 text-[#005BAC] hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg cursor-pointer transition-colors shrink-0"
                      title="Download / View Certificate"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const isApproved = selectedInstitution.isApprovedInstitution !== false;
                    const updated = !isApproved;
                    onAddUser({ ...selectedInstitution, isApprovedInstitution: updated });
                    setSelectedInstitution({ ...selectedInstitution, isApprovedInstitution: updated });
                    showToast(`${updated ? 'Approved' : 'Revoked approval for'} ${selectedInstitution.fullName}`);
                  }}
                  className={`px-3 py-1.5 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors cursor-pointer ${
                    selectedInstitution.isApprovedInstitution !== false
                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {selectedInstitution.isApprovedInstitution !== false
                      ? 'Revoke Publishing'
                      : 'Approve Institution'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedInstitution)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setDeletingUser(selectedInstitution)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Permanently</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInstitution(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold rounded-xl text-xs hover:opacity-90 cursor-pointer"
                >
                  Close Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADMINISTRATOR DETAILS MODAL */}
      {/* ========================================================= */}
      {selectedAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden space-y-0 animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-900 via-slate-900 to-slate-950 p-6 text-white flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-2xl border-2 border-red-400 shadow-md shrink-0">
                  {selectedAdmin.fullName ? selectedAdmin.fullName.trim().charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-extrabold text-white">{selectedAdmin.fullName}</h2>
                    <span className="bg-red-500/30 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-400/40 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>Root Admin</span>
                    </span>
                  </div>
                  <p className="text-xs text-red-200 font-mono">Admin ID: {selectedAdmin.id}</p>
                  <p className="text-[11px] text-red-300 font-semibold">
                    {selectedAdmin.clearanceLevel || 'Level 5 - Root System Administrator'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAdmin(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-red-600" /> Executive Unit
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    {selectedAdmin.department || 'AMECO Executive Board'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Mail className="w-3 h-3 text-red-600" /> System Email
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
                    {selectedAdmin.email}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-red-600" /> Phone Contact
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono block">
                    {selectedAdmin.phone || '+251 91 100 2233'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-600" /> Administrative Hub
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {selectedAdmin.zone || 'Bahir Dar Headquarters'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Status
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
                    {selectedAdmin.status}
                  </span>
                </div>
              </div>

              {/* Academic & Executive Credentials Dossier */}
              <div className="bg-gradient-to-br from-red-50/70 via-rose-50/50 to-slate-50 dark:from-red-950/30 dark:via-slate-900/40 dark:to-slate-900/60 p-4 rounded-2xl border border-red-200/80 dark:border-red-900/50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-red-100 dark:border-red-900/40">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      Verified Academic & Administrator Qualifications
                    </span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                    <BadgeCheck className="w-3 h-3 text-emerald-600" />
                    <span>Executive Vetted</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-red-100 dark:border-red-900/30">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Qualification Degree Level
                    </span>
                    <span className="font-bold text-red-900 dark:text-red-200 text-xs">
                      {selectedAdmin.qualificationLevel || 'Doctorate Degree (PhD) / Master of Science'}
                    </span>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-red-100 dark:border-red-900/30">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Discipline / Field of Expertise
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {selectedAdmin.fieldOfStudy || 'Computer Science & Cyber Systems Security'}
                    </span>
                  </div>
                </div>

                {/* Attached Document Files */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-2 truncate mr-2">
                      <FileText className="w-4 h-4 text-red-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                          {selectedAdmin.cvFileName || 'Administrator_Executive_CV.pdf'}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedAdmin.cvFileSize || '2.3 MB'} • Curriculum Vitae
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadDoc(
                          selectedAdmin.cvFileName || 'Administrator_Executive_CV.pdf',
                          selectedAdmin.cvFileData
                        )
                      }
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg cursor-pointer transition-colors shrink-0"
                      title="Download / View CV"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-2 truncate mr-2">
                      <Award className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                          {selectedAdmin.certificateFileName || 'Doctorate_PhD_Certificate.pdf'}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedAdmin.certificateFileSize || '3.5 MB'} • PhD Degree Certificate
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadDoc(
                          selectedAdmin.certificateFileName || 'Doctorate_PhD_Certificate.pdf',
                          selectedAdmin.certificateFileData
                        )
                      }
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg cursor-pointer transition-colors shrink-0"
                      title="Download / View Certificate"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedAdmin)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-red-600" />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedAdmin, selectedAdmin.status === 'active' ? 'suspended' : 'active')}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {selectedAdmin.status === 'active' ? 'Suspend Admin Access' : 'Reactivate Admin Access'}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setDeletingUser(selectedAdmin)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Permanently</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAdmin(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold rounded-xl text-xs hover:opacity-90 cursor-pointer"
                >
                  Close Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT USER PROFILE MODAL */}
      {/* ========================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-[#005BAC] dark:text-blue-400 rounded-2xl">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Update Account Profile
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    User ID: {editingUser.id} ({editingUser.role})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedUser} className="space-y-3.5 text-xs">
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ValidatedNameInput
                  label="Full Name / Organization"
                  required
                  value={editFullName}
                  onChange={setEditFullName}
                  placeholder="Enter full name"
                />

                <FormalEmailInput
                  label="Email Address"
                  required
                  value={editEmail}
                  onChange={setEditEmail}
                  placeholder="Enter formal email address"
                />
              </div>

              {/* Phone & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <InternationalPhoneInput
                    value={editPhone}
                    onChange={setEditPhone}
                    label="Phone Number"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Account Status *
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-bold text-xs"
                  >
                    <option value="active">Active (Normal Access)</option>
                    <option value="suspended">Suspended (Login Blocked with Appeal Form)</option>
                    <option value="banned">Banned (Permanent Revocation)</option>
                  </select>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  System Role *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-bold text-xs"
                >
                  <option value="ResponsiblePerson">AMECO Investigator / Field Officer</option>
                  <option value="Citizen">Registered Citizen Whistleblower</option>
                  <option value="Institution">Registered Institution / Agency</option>
                  <option value="Administrator">System Administrator</option>
                </select>
              </div>

              {/* Region and Zone Selection */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <RegionZoneSelector
                  selectedRegion={editRegion}
                  selectedZone={editZone}
                  onRegionChange={setEditRegion}
                  onZoneChange={setEditZone}
                  customZoneValue={editCustomZone}
                  onCustomZoneChange={setEditCustomZone}
                  size="sm"
                />
              </div>

              {/* Role-Specific Fields */}
              {editRole === 'ResponsiblePerson' && (
                <div className="space-y-3 p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/60">
                  <span className="font-bold text-[#005BAC] dark:text-blue-300 text-xs block">
                    Investigator Officer Credentials
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Department Desk
                      </label>
                      <select
                        value={editDepartment}
                        onChange={(e) => setEditDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 outline-none text-xs"
                      >
                        {departments && departments.length > 0 ? (
                          departments.map((dept) => (
                            <option key={dept.id} value={dept.name}>
                              {dept.name} ({dept.id})
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Anti-Corruption & Financial Crime Unit">Anti-Corruption & Financial Crime Unit</option>
                            <option value="Public Health & Social Welfare Desk">Public Health & Social Welfare Desk</option>
                            <option value="Infrastructure & Environmental Watch">Infrastructure & Environmental Watch</option>
                            <option value="Human Rights & Legal Affairs Bureau">Human Rights & Legal Affairs Bureau</option>
                            <option value="Breaking News & Crisis Response Desk">Breaking News & Crisis Response Desk</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Badge Number
                      </label>
                      <input
                        type="text"
                        value={editBadgeNumber}
                        onChange={(e) => setEditBadgeNumber(e.target.value)}
                        placeholder="e.g. AM-INV-204"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Clearance Level
                    </label>
                    <input
                      type="text"
                      value={editClearanceLevel}
                      onChange={(e) => setEditClearanceLevel(e.target.value)}
                      placeholder="Level 3 - Confidential Whistleblower Clearance"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none text-xs"
                    />
                  </div>
                </div>
              )}

              {editRole === 'Citizen' && (
                <div className="space-y-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/60">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs block">
                    Citizen Address & Verification
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Woreda
                      </label>
                      <input
                        type="text"
                        value={editWoreda}
                        onChange={(e) => setEditWoreda(e.target.value)}
                        placeholder="e.g. Bahir Dar Zuria Woreda"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Kebele Address
                      </label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="e.g. Kebele 14, Near Lake Tana"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={editVerified}
                        onChange={(e) => setEditVerified(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                      />
                      <span>Verified Citizen Whistleblower Badge</span>
                    </label>
                  </div>
                </div>
              )}

              {editRole === 'Institution' && (
                <div className="space-y-3 p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/60">
                  <span className="font-bold text-[#005BAC] dark:text-blue-300 text-xs block">
                    Institution Details & Publishing License
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Institution Category
                      </label>
                      <input
                        type="text"
                        value={editInstitutionCategory}
                        onChange={(e) => setEditInstitutionCategory(e.target.value)}
                        placeholder="e.g. Public Media & Civil Agency"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        value={editRegistrationNumber}
                        onChange={(e) => setEditRegistrationNumber(e.target.value)}
                        placeholder="REG-AMECO-2026"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={editIsApprovedInstitution}
                        onChange={(e) => setEditIsApprovedInstitution(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                      />
                      <span>Approved Official Publisher (Allowed to broadcast news)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE USER CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-red-200 dark:border-red-900/80 max-w-md w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start space-x-3.5">
              <div className="p-3 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-2xl shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Permanently Delete User Account?
                </h3>
                <p className="text-xs text-slate-500">
                  This action is permanent and cannot be reversed.
                </p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-2xl border border-red-200/80 dark:border-red-900/60 text-xs space-y-2 text-red-900 dark:text-red-200">
              <div className="flex items-center justify-between font-mono">
                <span className="text-red-700 dark:text-red-300 font-semibold">User:</span>
                <span className="font-bold">{deletingUser.fullName}</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-red-700 dark:text-red-300 font-semibold">Role:</span>
                <span className="font-bold">{deletingUser.role}</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-red-700 dark:text-red-300 font-semibold">Email:</span>
                <span>{deletingUser.email}</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-red-700 dark:text-red-300 font-semibold">ID:</span>
                <span>{deletingUser.id}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Deleting this account will permanently remove their credentials and authentication rights across the AMECO Whistleblower System.
            </p>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROVISION NEW USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-[#005BAC]" />
                <span>
                  {role === 'ResponsiblePerson'
                    ? 'Register New Investigator'
                    : role === 'Institution'
                    ? 'Register Media Agency / Newsroom Publisher'
                    : role === 'Administrator'
                    ? 'Register System Administrator'
                    : 'Register User Account'}
                </span>
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              {/* 1. Account Role Selector */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />
                  <span>Account Role</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setRole(newRole);
                      setCustomPassword(generateDefaultPassword(newRole));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs outline-none focus:ring-2 focus:ring-[#005BAC]/30 transition-colors shadow-2xs cursor-pointer"
                  >
                    <option value="ResponsiblePerson">AMECO Investigator / Field Officer</option>
                    <option value="Institution">Official Media Outlet / Newsroom Publisher</option>
                    <option value="Administrator">System Administrator (Root Editorial)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ValidatedNameInput
                  label={role === 'Institution' ? "Media Outlet / Organization Name" : "Full Name"}
                  required
                  value={fullName}
                  onChange={setFullName}
                  placeholder={role === 'Institution' ? "e.g. Walta Media, BDU Press, APHI" : "Enter full name"}
                />

                <FormalEmailInput
                  label={role === 'Institution' ? "Editorial / Contact Email Address" : "Email Address"}
                  required
                  value={email}
                  onChange={setEmail}
                  placeholder={role === 'Institution' ? "e.g. news@walta.et or press@bdu.edu.et" : "Enter email (e.g. officer@ameco.et)"}
                />
              </div>

              <div className={role === 'Institution' ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : ""}>
                <div>
                  <InternationalPhoneInput
                    value={phone}
                    onChange={setPhone}
                    required
                    label={role === 'Institution' ? "Media Desk Phone Number" : "Phone Number"}
                  />
                </div>

                {role === 'Institution' && (
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />
                      <span>Focal Person / Liaison Officer *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={focalPersonName}
                      onChange={(e) => setFocalPersonName(e.target.value)}
                      placeholder="e.g. Senior Editor Solomon Worku"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-xs outline-none focus:ring-2 focus:ring-[#005BAC]/30 transition-colors shadow-2xs"
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Region & Zone Cascading Combobox */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <RegionZoneSelector
                  selectedRegion={region}
                  selectedZone={zone}
                  onRegionChange={setRegion}
                  onZoneChange={setZone}
                  customZoneValue={customZone}
                  onCustomZoneChange={setCustomZone}
                  size="sm"
                />
              </div>

              {/* Department vs Organization Sector */}
              {role === 'Institution' ? (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />
                    <span>Media Classification & Newsroom Sector</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-xs outline-none focus:ring-2 focus:ring-[#005BAC]/30 transition-colors shadow-2xs cursor-pointer"
                  >
                    <option value="Public Broadcaster (TV & Radio)">Public Broadcaster (TV & Radio - ቴሌቪዥንና ሬዲዮ)</option>
                    <option value="Digital Newsroom & Web Portal">Digital Newsroom & Web Portal (ድረ-ገጽና ማህበራዊ ሚዲያ)</option>
                    <option value="University Press & Academic Desk">University Press & Academic Research (የዩኒቨርሲቲ ፕሬስ)</option>
                    <option value="Regional Public Health Agency">Regional Public Health & Emergency Agency (የጤናና ድንገተኛ ተቋም)</option>
                    <option value="Independent Press & Media House">Independent Press & Media House (ገለልተኛ የሚዲያ ተቋም)</option>
                    <option value="Civic & Municipal Information Desk">Civic & Municipal Information Desk (የከተማና ማዘጋጃ ቤት ዴስክ)</option>
                  </select>
                </div>
              ) : role !== 'Citizen' ? (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />
                    <span>AMECO Department Desk</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-xs outline-none focus:ring-2 focus:ring-[#005BAC]/30 transition-colors shadow-2xs cursor-pointer"
                    >
                      {departments && departments.length > 0 ? (
                        departments.map((dept) => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name} ({dept.id})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Anti-Corruption & Financial Crime Unit">Anti-Corruption & Financial Crime Desk</option>
                          <option value="Public Health & Social Welfare Desk">Public Health & Social Welfare Desk</option>
                          <option value="Infrastructure & Environmental Watch">Infrastructure & Environmental Watch</option>
                          <option value="Human Rights & Legal Affairs Bureau">Human Rights & Legal Affairs Bureau</option>
                          <option value="Breaking News & Crisis Response Desk">Breaking News & Crisis Response Desk</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Woreda</label>
                    <input
                      type="text"
                      value={woreda}
                      onChange={(e) => setWoreda(e.target.value)}
                      placeholder="e.g. Bahir Dar Zuria Woreda"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kebele / Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Kebele 14, House #402"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* MEDIA ACCREDITATION & LEGAL CREDENTIALS (FOR INSTITUTIONS / PUBLISHERS) */}
              {role === 'Institution' && (
                <div className="p-3.5 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-slate-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900/60 rounded-xl border border-blue-200/90 dark:border-blue-800/60 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-blue-100 dark:border-blue-900/50">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#005BAC] dark:text-blue-400" />
                      <span>Media Accreditation & Legal Registration Credentials</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      Verified Publisher Desk
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Media License / Registration No. *
                      </label>
                      <input
                        type="text"
                        required
                        value={mediaLicenseNumber}
                        onChange={(e) => setMediaLicenseNumber(e.target.value)}
                        placeholder="e.g. EBA-LIC-2026/042 or REG-ETH-994"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Official Website / Portal URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={officialWebsite}
                        onChange={(e) => setOfficialWebsite(e.target.value)}
                        placeholder="e.g. https://walta.et or https://press.bdu.edu.et"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none text-xs"
                      />
                    </div>
                  </div>

                  {/* Optional Accreditation / Press License Document */}
                  <div className="pt-1">
                    <div className="p-2.5 rounded-xl border border-dashed border-blue-300 dark:border-blue-700/80 bg-white/70 dark:bg-slate-900/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[#005BAC]" />
                          <span>Media Accreditation Document / Operating License (Optional)</span>
                        </label>
                        {accreditationFile && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Attached
                          </span>
                        )}
                      </div>

                      {accreditationFile ? (
                        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                          <div className="truncate pr-2">
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                              {accreditationFile.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{accreditationFile.size}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAccreditationFile(null)}
                            className="flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/60 dark:hover:bg-red-900/80 dark:text-red-400 rounded-lg text-[10px] font-bold border border-red-200 dark:border-red-800 transition-colors cursor-pointer"
                            title="Delete attached file"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 cursor-pointer transition-colors text-center">
                          <Upload className="w-4 h-4 text-[#005BAC] mb-1" />
                          <span className="text-[11px] font-bold text-[#005BAC] dark:text-blue-400">
                            Upload Accreditation / License Certificate (PDF, JPG, PNG)
                          </span>
                          <span className="text-[9px] text-slate-400">Official license or registration certificate</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            onChange={handleAccreditationChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {docValidationWarning && (
                    <div className="p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-1.5 text-[11px] text-red-700 dark:text-red-300">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                      <span>{docValidationWarning}</span>
                    </div>
                  )}
                </div>
              )}

              {/* REQUIRED QUALIFICATIONS & VETTING DOCUMENTS (CV + DEGREE) ONLY FOR INVESTIGATORS & ADMINS */}
              {(role === 'ResponsiblePerson' || role === 'Administrator') && (
                <div className="p-3.5 bg-gradient-to-br from-indigo-50/80 via-blue-50/60 to-slate-50 dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-slate-900/60 rounded-xl border border-indigo-200/90 dark:border-indigo-800/60 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-indigo-100 dark:border-indigo-900/50">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Academic Qualifications & Verified Credentials *</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      Mandatory Vetting
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Qualification Level *
                      </label>
                      <select
                        value={qualificationLevel}
                        onChange={(e) => setQualificationLevel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-semibold text-xs"
                      >
                        <option value="Bachelor Degree (BSc/BA)">Bachelor Degree (BSc / BA)</option>
                        <option value="Master Degree (MSc/MA)">Master Degree (MSc / MA)</option>
                        <option value="Doctorate Degree (PhD)">Doctorate Degree (PhD)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Field of Study / Discipline *
                      </label>
                      <input
                        type="text"
                        required
                        value={fieldOfStudy}
                        onChange={(e) => setFieldOfStudy(e.target.value)}
                        placeholder="e.g. Law & Forensic Criminology"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none text-xs"
                      />
                    </div>
                  </div>

                  {/* Document Uploads Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* CV / Resume Upload */}
                    <div className="p-2.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700/80 bg-white/70 dark:bg-slate-900/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Curriculum Vitae (CV) *</span>
                        </label>
                        {cvFile && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Attached
                          </span>
                        )}
                      </div>

                      {cvFile ? (
                        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                          <div className="truncate pr-2">
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                              {cvFile.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{cvFile.size}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCvFile(null)}
                            className="flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/60 dark:hover:bg-red-900/80 dark:text-red-400 rounded-lg text-[10px] font-bold border border-red-200 dark:border-red-800 transition-colors cursor-pointer"
                            title="Delete uploaded CV file"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 cursor-pointer transition-colors text-center">
                          <Upload className="w-4 h-4 text-indigo-500 mb-1" />
                          <span className="text-[11px] font-bold text-[#005BAC] dark:text-blue-400">
                            Upload CV (PDF, DOCX)
                          </span>
                          <span className="text-[9px] text-slate-400">Max 15MB file</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleCvChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Degree / Masters / PhD Certificate Upload */}
                    <div className="p-2.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700/80 bg-white/70 dark:bg-slate-900/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>Degree / Masters / PhD Certificate *</span>
                        </label>
                        {certificateFile && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Attached
                          </span>
                        )}
                      </div>

                      {certificateFile ? (
                        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                          <div className="truncate pr-2">
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                              {certificateFile.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{certificateFile.size}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCertificateFile(null)}
                            className="flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/60 dark:hover:bg-red-900/80 dark:text-red-400 rounded-lg text-[10px] font-bold border border-red-200 dark:border-red-800 transition-colors cursor-pointer"
                            title="Delete uploaded Certificate file"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 cursor-pointer transition-colors text-center">
                          <Award className="w-4 h-4 text-amber-500 mb-1" />
                          <span className="text-[11px] font-bold text-[#005BAC] dark:text-blue-400">
                            Upload Certificate (PDF, JPG)
                          </span>
                          <span className="text-[9px] text-slate-400">Degree, Masters or PhD document</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleCertificateChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {docValidationWarning && (
                    <div className="p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-1.5 text-[11px] text-red-700 dark:text-red-300">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                      <span>{docValidationWarning}</span>
                    </div>
                  )}
                </div>
              )}

              {/* System Generated Default Password Section */}
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />
                    <span>System-Generated Default Password</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRegeneratePassword}
                    className="text-[11px] font-bold text-[#005BAC] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate Password</span>
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                    Default Initial Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordInModal ? 'text' : 'password'}
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 font-mono text-xs font-semibold outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPasswordInModal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 leading-snug">
                  <Info className="w-3.5 h-3.5 text-[#005BAC] shrink-0 mt-0.5" />
                  <span>
                    The officer will sign in using their <strong>Email</strong> and this <strong>Default Password</strong>, and will be prompted to update their password upon login.
                  </span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROVISIONED CREDENTIALS HANDOVER DOSSIER MODAL */}
      {provisionedCredentialModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Account Provisioned Successfully!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Default login credentials have been generated and securely saved for{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {provisionedCredentialModal.user.fullName}
                </strong>
                .
              </p>
            </div>

            {/* Handover Card */}
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 font-semibold">Account Role:</span>
                <span className="font-bold text-[#005BAC] dark:text-blue-300">
                  {provisionedCredentialModal.user.role === 'ResponsiblePerson'
                    ? 'Investigator / Field Officer'
                    : provisionedCredentialModal.user.role}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Login Email
                </span>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm truncate max-w-[280px]">
                    {provisionedCredentialModal.user.email}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(provisionedCredentialModal.user.email, 'Login Email')
                    }
                    className="p-1.5 text-slate-500 hover:text-[#005BAC] hover:bg-blue-50 dark:hover:bg-blue-950 rounded-md cursor-pointer transition-colors shrink-0"
                    title="Copy Email"
                  >
                    {copiedField === 'Login Email' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Default Initial Password
                </span>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                    {provisionedCredentialModal.plainPassword}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(provisionedCredentialModal.plainPassword, 'Password')
                    }
                    className="p-1.5 text-slate-500 hover:text-[#005BAC] hover:bg-blue-50 dark:hover:bg-blue-950 rounded-md cursor-pointer transition-colors"
                    title="Copy Password"
                  >
                    {copiedField === 'Password' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Attached Vetting Documents Summary */}
              {provisionedCredentialModal.user.qualificationLevel && (
                <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-lg border border-indigo-200/80 dark:border-indigo-800/60 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-indigo-900 dark:text-indigo-200">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{provisionedCredentialModal.user.qualificationLevel}</span>
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                      {provisionedCredentialModal.user.fieldOfStudy}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-indigo-100 dark:border-indigo-900/50 text-[10px] text-slate-600 dark:text-slate-300">
                    {provisionedCredentialModal.user.cvFileName && (
                      <span className="flex items-center gap-1 bg-white/80 dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                        <FileCheck className="w-3 h-3 text-emerald-600" /> CV: {provisionedCredentialModal.user.cvFileName}
                      </span>
                    )}
                    {provisionedCredentialModal.user.certificateFileName && (
                      <span className="flex items-center gap-1 bg-white/80 dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                        <Award className="w-3 h-3 text-amber-600" /> Cert: {provisionedCredentialModal.user.certificateFileName}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="p-2.5 bg-amber-50/80 dark:bg-amber-950/40 rounded-lg border border-amber-200/80 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
                <strong>Next Step:</strong> The officer can log in immediately using their <strong>Email</strong> and this <strong>Default Password</strong>, and then change their password to a private password of their choice in their profile settings.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  const fullDossier = `AMECO Account Handover\nOfficer: ${provisionedCredentialModal.user.fullName}\nRole: ${provisionedCredentialModal.user.role}\nDepartment: ${provisionedCredentialModal.user.department || 'General Desk'}\nLogin Email: ${provisionedCredentialModal.user.email}\nDefault Password: ${provisionedCredentialModal.plainPassword}\n\nPlease sign in with your email and change your password in your settings.`;
                  handleCopyText(fullDossier, 'Full Handover Info');
                }}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedField === 'Full Handover Info' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy Full Handover Info</span>
              </button>

              <button
                type="button"
                onClick={() => setProvisionedCredentialModal(null)}
                className="px-5 py-2.5 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT DEPARTMENT DESK MODAL */}
      {/* ========================================================= */}
      {(isAddDeptModalOpen || editingDepartment !== null) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-[#005BAC] dark:text-blue-400 rounded-2xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {editingDepartment ? 'Edit Department Desk' : 'Create New Department Desk'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingDepartment ? `Updating desk ${editingDepartment.id}` : 'AMECO Specialized Regional Investigative Unit'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddDeptModalOpen(false);
                  setEditingDepartment(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartmentSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Desk Identifier / Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DEP-07 or FIN-CRIME"
                    value={deptFormId}
                    onChange={(e) => setDeptFormId(e.target.value.toUpperCase())}
                    disabled={!!editingDepartment}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-mono font-bold text-xs disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Department Desk Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Environmental Offenses & Mining Desk"
                    value={deptFormName}
                    onChange={(e) => setDeptFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-semibold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Lead Investigator / Desk Head *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commander Tadesse Haile"
                    value={deptFormHead}
                    onChange={(e) => setDeptFormHead(e.target.value)}
                    list="investigator-lead-options"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-semibold text-xs"
                  />
                  <datalist id="investigator-lead-options">
                    {investigators.map((inv) => (
                      <option key={inv.id} value={inv.fullName}>
                        {inv.fullName} ({inv.department || 'Investigator'})
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Desk Mission & Jurisdictional Mandate
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of offenses handled and investigation scope..."
                  value={deptFormDescription}
                  onChange={(e) => setDeptFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Focus Areas & Sub-Topics (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Illegal Forestry, River Pollution, Mining Licensure"
                  value={deptFormFocusAreas}
                  onChange={(e) => setDeptFormFocusAreas(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="desk@ameco.et"
                    value={deptFormContactEmail}
                    onChange={(e) => setDeptFormContactEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone Extension
                  </label>
                  <input
                    type="text"
                    placeholder="+251 58 220 0000 ext 401"
                    value={deptFormPhoneExtension}
                    onChange={(e) => setDeptFormPhoneExtension(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddDeptModalOpen(false);
                    setEditingDepartment(null);
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingDepartment ? 'Save Changes' : 'Create Desk'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE DEPARTMENT CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deletingDepartment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95">
            <div className="p-3 bg-red-100 dark:bg-red-950 text-red-600 rounded-2xl w-fit">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Confirm Deletion of Department Desk
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <strong className="text-slate-800 dark:text-slate-200">{deletingDepartment.name}</strong> ({deletingDepartment.id})? Assigned investigators will be re-routed to the General Investigative Desk.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeletingDepartment(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDepartment}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5 transition-all text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT CATEGORY MODAL */}
      {/* ========================================================= */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-2xl ${categoryModalType === 'news' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950' : 'bg-red-50 text-red-600 dark:bg-red-950'}`}>
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {editingCategory ? 'Edit Category' : categoryModalType === 'news' ? 'Add Public News Category' : 'Add Tip-Off Category'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {categoryModalType === 'news' ? 'Public citizen news taxonomy' : 'Whistleblower confidential routing taxonomy'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddCategoryModalOpen(false);
                  setEditingCategory(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategorySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Category Kind *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryModalType('news')}
                    className={`py-2 px-3 rounded-xl font-bold border text-xs cursor-pointer transition-colors ${
                      categoryModalType === 'news'
                        ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-300 text-[#005BAC] dark:text-blue-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600'
                    }`}
                  >
                    Public News Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryModalType('tipoff')}
                    className={`py-2 px-3 rounded-xl font-bold border text-xs cursor-pointer transition-colors ${
                      categoryModalType === 'tipoff'
                        ? 'bg-red-50 dark:bg-red-950/80 border-red-300 text-red-700 dark:text-red-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600'
                    }`}
                  >
                    Confidential Tip-Off Category
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infrastructure & Utilities or Land Grab"
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-semibold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description / Classification Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe which incidents or news items belong under this category..."
                  value={catFormDescription}
                  onChange={(e) => setCatFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none text-xs"
                />
              </div>

              {categoryModalType === 'news' ? (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Badge Color Theme
                  </label>
                  <select
                    value={catFormColor}
                    onChange={(e) => setCatFormColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-semibold text-xs"
                  >
                    <option value="blue">Blue (Standard Information)</option>
                    <option value="emerald">Emerald (Health / Ecology)</option>
                    <option value="amber">Amber (Alerts / Notices)</option>
                    <option value="purple">Purple (Education / Culture)</option>
                    <option value="cyan">Cyan (Technology / Infrastructure)</option>
                    <option value="red">Red (Critical Updates)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Default Threat / Severity Level
                  </label>
                  <select
                    value={catFormThreat}
                    onChange={(e) => setCatFormThreat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-bold text-xs"
                  >
                    <option value="Critical">Critical (Immediate Action Required)</option>
                    <option value="High">High (Severe Impact)</option>
                    <option value="Moderate">Moderate (Standard Investigative Priority)</option>
                    <option value="General">General (Informational & Regulatory)</option>
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCategoryModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCategory ? 'Save Category' : 'Add Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CATEGORY CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95">
            <div className="p-3 bg-red-100 dark:bg-red-950 text-red-600 rounded-2xl w-fit">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Confirm Category Deletion
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove category <strong className="text-slate-800 dark:text-slate-200">{deletingCategory.name}</strong>?
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5 transition-all text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD SYSTEM CONFIG PARAMETER MODAL */}
      {/* ========================================================= */}
      {isAddConfigModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-2xl">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Add System Parameter (FR-18)
                  </h3>
                  <p className="text-xs text-slate-500">Configure custom operational or security threshold</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddConfigModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfigSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Parameter Key *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. auto_archive_days"
                    value={configFormKey}
                    onChange={(e) => setConfigFormKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Category Domain *
                  </label>
                  <select
                    value={configFormCategory}
                    onChange={(e) => setConfigFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-bold text-xs"
                  >
                    <option value="Security">Security & Privacy</option>
                    <option value="Storage">Storage & Media</option>
                    <option value="AI & Triage">AI & Automation</option>
                    <option value="Workflow">Workflow & Operations</option>
                    <option value="Custom">Custom Domain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Human-Readable Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Case Auto-Archive Inactivity Threshold"
                  value={configFormLabel}
                  onChange={(e) => setConfigFormLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-semibold text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Control Type *
                  </label>
                  <select
                    value={configFormType}
                    onChange={(e) => setConfigFormType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-semibold text-xs"
                  >
                    <option value="text">Text / String Value</option>
                    <option value="toggle">Boolean Switch / Enforced</option>
                    <option value="select">Dropdown Options</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Initial Value *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 90 Days or ENABLED"
                    value={configFormValue}
                    onChange={(e) => setConfigFormValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none font-semibold text-xs"
                  />
                </div>
              </div>

              {configFormType === 'select' && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Dropdown Options (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="30 Days, 60 Days, 90 Days, 180 Days"
                    value={configFormOptions}
                    onChange={(e) => setConfigFormOptions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none text-xs"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Parameter Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain the functional impact of this setting..."
                  value={configFormDescription}
                  onChange={(e) => setConfigFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddConfigModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Parameter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
