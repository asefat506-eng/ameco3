import React, { useState, useMemo, useEffect } from 'react';
import { ReportItem, UserProfile, Department, PriorityLevel } from '../../types';
import {
  UserCheck,
  Calendar,
  FileText,
  X,
  Check,
  Shield,
  ShieldCheck,
  MapPin,
  Briefcase,
  AlertCircle,
  Clock,
  Users,
  Search,
  Building2,
  SlidersHorizontal,
  Flame,
  Lock,
  RefreshCw,
  Filter,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportItem | null;
  responsiblePersons: UserProfile[];
  departments: Department[];
  reports?: ReportItem[];
  onAssignReport: (
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
  ) => void;
}

// Amhara regional zone adjacency graph for intelligent nearby ranking
const ZONE_ADJACENCY: Record<string, string[]> = {
  'East Gojjam': ['West Gojjam', 'South Gondar', 'North Shewa', 'Awi Zone', 'Bahir Dar City'],
  'West Gojjam': ['East Gojjam', 'Awi Zone', 'Bahir Dar City', 'South Gondar', 'Central Gondar'],
  'Bahir Dar City': ['West Gojjam', 'South Gondar', 'Central Gondar', 'Awi Zone', 'East Gojjam'],
  'Bahir Dar Special Zone': ['West Gojjam', 'South Gondar', 'Central Gondar', 'Awi Zone', 'East Gojjam'],
  'North Gondar': ['Central Gondar', 'West Gondar', 'Wag Hemra'],
  'Central Gondar': ['North Gondar', 'South Gondar', 'West Gondar', 'Bahir Dar City', 'West Gojjam'],
  'South Gondar': ['Central Gondar', 'North Wollo', 'South Wollo', 'East Gojjam', 'West Gojjam', 'Bahir Dar City'],
  'West Gondar': ['North Gondar', 'Central Gondar'],
  'South Wollo': ['North Wollo', 'North Shewa', 'Oromia Special Zone', 'South Gondar'],
  'North Wollo': ['South Wollo', 'Wag Hemra', 'South Gondar'],
  'North Shewa': ['South Wollo', 'Oromia Special Zone', 'East Gojjam'],
  'Awi Zone': ['West Gojjam', 'East Gojjam', 'Bahir Dar City'],
  'Wag Hemra': ['North Wollo', 'North Gondar', 'Central Gondar'],
  'Oromia Special Zone': ['South Wollo', 'North Shewa'],
};

// Location options for selection
const COMMON_LOCATIONS = [
  { name: 'Debre Markos', zone: 'East Gojjam', label: 'Debre Markos (East Gojjam)' },
  { name: 'Bahir Dar City', zone: 'Bahir Dar City', label: 'Bahir Dar City (Metropolitan)' },
  { name: 'Gondar City', zone: 'North Gondar', label: 'Gondar City (North Gondar)' },
  { name: 'Dessie', zone: 'South Wollo', label: 'Dessie / Kombolcha (South Wollo)' },
  { name: 'Debre Birhan', zone: 'North Shewa', label: 'Debre Birhan (North Shewa)' },
  { name: 'Finote Selam', zone: 'West Gojjam', label: 'Finote Selam (West Gojjam)' },
  { name: 'Debre Tabor', zone: 'South Gondar', label: 'Debre Tabor (South Gondar)' },
  { name: 'Injibara', zone: 'Awi Zone', label: 'Injibara / Chagni (Awi Zone)' },
  { name: 'Woldiya', zone: 'North Wollo', label: 'Woldiya (North Wollo)' },
  { name: 'Sekota', zone: 'Wag Hemra', label: 'Sekota (Wag Hemra)' },
  { name: 'Metema', zone: 'West Gondar', label: 'Metema (West Gondar)' },
  { name: 'Kemise', zone: 'Oromia Special Zone', label: 'Kemise (Oromia Special Zone)' },
  { name: 'East Gojjam', zone: 'East Gojjam', label: 'East Gojjam Zone' },
  { name: 'West Gojjam', zone: 'West Gojjam', label: 'West Gojjam Zone' },
  { name: 'North Gondar', zone: 'North Gondar', label: 'North Gondar Zone' },
  { name: 'Central Gondar', zone: 'Central Gondar', label: 'Central Gondar Zone' },
  { name: 'South Gondar', zone: 'South Gondar', label: 'South Gondar Zone' },
  { name: 'South Wollo', zone: 'South Wollo', label: 'South Wollo Zone' },
  { name: 'North Wollo', zone: 'North Wollo', label: 'North Wollo Zone' },
  { name: 'North Shewa', zone: 'North Shewa', label: 'North Shewa Zone' },
  { name: 'Awi Zone', zone: 'Awi Zone', label: 'Awi Zone' },
  { name: 'Wag Hemra', zone: 'Wag Hemra', label: 'Wag Hemra Zone' },
];

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  report,
  responsiblePersons,
  departments,
  reports = [],
  onAssignReport,
}) => {
  // Extract initial location from report
  const initialLocation = useMemo(() => {
    if (!report) return 'Debre Markos';
    if (report.woreda && report.woreda.toLowerCase().includes('debre markos')) return 'Debre Markos';
    if (report.specificLocation && report.specificLocation.toLowerCase().includes('debre markos')) return 'Debre Markos';
    if (report.zone && report.zone.toLowerCase().includes('east gojjam')) return 'Debre Markos';
    if (report.zone && report.zone.toLowerCase().includes('bahir dar')) return 'Bahir Dar City';
    if (report.zone && report.zone.toLowerCase().includes('gondar')) return 'Gondar City';
    if (report.zone && report.zone.toLowerCase().includes('wollo')) return 'Dessie';
    if (report.zone && report.zone.toLowerCase().includes('shewa')) return 'Debre Birhan';
    return report.zone || 'Debre Markos';
  }, [report]);

  // 1. Filter States: Name Search, Department Combo Box, Location, and Location Scope
  const [nameSearch, setNameSearch] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation);
  const [locationScope, setLocationScope] = useState<'station' | 'all'>('station');
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [locationSearch, setLocationSearch] = useState<string>('');

  // Selected Investigator State
  const [selectedInvestigatorId, setSelectedInvestigatorId] = useState<string>('');

  // Priority and Deadline state
  const [priority, setPriority] = useState<PriorityLevel>(report?.priority || 'High');

  const getDefaultDeadline = (p: PriorityLevel) => {
    const days = p === 'Critical' ? 2 : p === 'High' ? 7 : p === 'Medium' ? 14 : 30;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  };

  const [deadline, setDeadline] = useState<string>(() => getDefaultDeadline(report?.priority || 'High'));
  const [notes, setNotes] = useState<string>('');

  const isAlreadyAssigned = useMemo(() => {
    return Boolean(report?.assignedTo?.responsiblePersonId || report?.assignedTo?.responsiblePersonName);
  }, [report]);

  // Sync state when report changes
  useEffect(() => {
    if (report) {
      if (report.assignedTo?.location) {
        setSelectedLocation(report.assignedTo.location);
      } else {
        setSelectedLocation(initialLocation);
      }

      if (report.assignedTo?.responsiblePersonId) {
        setSelectedInvestigatorId(report.assignedTo.responsiblePersonId);
      } else {
        setSelectedInvestigatorId('');
      }

      setPriority(report.assignedTo?.priority || report.priority || 'High');
      setDeadline(report.assignedTo?.deadline || getDefaultDeadline(report.priority || 'High'));
      setNotes(report.assignedTo?.notes || '');
      setNameSearch('');
      setSelectedDepartment('ALL');
      setLocationScope('station');
    }
  }, [report, initialLocation]);

  // Helper to normalize strings for comparison with absolute null-safety
  const normalize = (str: any) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  // Helper to check if investigator is located in or serves the target location
  const isInvestigatorInLocation = (inv: UserProfile, targetLoc: string) => {
    const normTarget = normalize(targetLoc);
    const invCity = normalize(inv?.city || inv?.cityTown);
    const invWoreda = normalize(inv?.woreda);
    const invZone = normalize(inv?.zone);
    const invServiceArea = normalize(inv?.serviceArea);
    const invAddress = normalize(inv?.address);

    if (invCity && (invCity.includes(normTarget) || normTarget.includes(invCity))) return true;
    if (invWoreda && (invWoreda.includes(normTarget) || normTarget.includes(invWoreda))) return true;
    if (invZone && (invZone.includes(normTarget) || normTarget.includes(invZone))) return true;
    if (invServiceArea && (invServiceArea.includes(normTarget) || normTarget.includes(invServiceArea))) return true;
    if (invAddress && (invAddress.includes(normTarget) || normTarget.includes(invAddress))) return true;

    if (normTarget.includes('debremarkos') && (invZone.includes('eastgojjam') || invCity.includes('debremarkos'))) return true;
    if (normTarget.includes('eastgojjam') && (invCity.includes('debremarkos') || invZone.includes('eastgojjam'))) return true;
    if (normTarget.includes('bahirdar') && (invZone.includes('bahirdar') || invCity.includes('bahirdar'))) return true;
    if (normTarget.includes('gondar') && (invZone.includes('gondar') || invCity.includes('gondar'))) return true;
    if (normTarget.includes('dessie') && (invZone.includes('southwollo') || invCity.includes('dessie'))) return true;
    if (normTarget.includes('debrebirhan') && (invZone.includes('northshewa') || invCity.includes('debrebirhan'))) return true;

    return false;
  };

  // Active cases count
  const getInvestigatorActiveCases = (inv: UserProfile) => {
    if (!inv) return 0;
    if (typeof inv.activeCases === 'number') return inv.activeCases;
    if (typeof inv.assignedCasesCount === 'number') return inv.assignedCasesCount;
    return reports.filter(
      (r) =>
        r.assignedTo?.responsiblePersonId === inv.id &&
        (r.status === 'Assigned' || r.status === 'Investigation in Progress')
    ).length;
  };

  // Availability badge
  const getInvestigatorAvailability = (inv: UserProfile) => {
    if (!inv) return 'Available';
    if (inv.availability) return inv.availability;
    if (inv.status === 'suspended' || inv.status === 'banned') return 'On Leave';
    const cases = getInvestigatorActiveCases(inv);
    if (cases >= 6) return 'Busy';
    return 'Available';
  };

  const getInvestigatorDepartment = (inv: UserProfile) => {
    return inv?.department || 'General Investigation Unit';
  };

  const getInvestigatorSpecialization = (inv: UserProfile) => {
    if (!inv) return 'General Case Investigation';
    if (inv.specialization) return inv.specialization;
    const deptLower = (inv.department || '').toLowerCase();
    if (deptLower.includes('corruption')) return 'Public Procurement & Anti-Corruption';
    if (deptLower.includes('safety')) return 'Accident Investigation & Public Safety';
    if (deptLower.includes('health')) return 'Public Health & Medical Verification';
    if (deptLower.includes('human rights') || deptLower.includes('legal'))
      return 'Human Rights & Legal Verification';
    if (deptLower.includes('environment')) return 'Environmental Crimes & Land Integrity';
    return 'General Case Investigation';
  };

  // Distinct department list for combo box
  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    departments.forEach((d) => {
      if (d?.name) set.add(d.name);
    });
    responsiblePersons.forEach((p) => {
      if (p?.department) set.add(p.department);
    });
    return Array.from(set).sort();
  }, [departments, responsiblePersons]);

  // Filtered & Ranked Investigator Candidates
  const filteredInvestigators = useMemo(() => {
    const reportCategoryNorm = normalize(report?.category || '');

    return (responsiblePersons || [])
      .filter((inv) => {
        if (!inv) return false;
        // 1. Search by Name / Badge / Email
        if (nameSearch.trim()) {
          const q = (nameSearch || '').toLowerCase().trim();
          const matchesName = (inv.fullName || '').toLowerCase().includes(q);
          const matchesBadge = (inv.badgeNumber || inv.id || '').toLowerCase().includes(q);
          const matchesEmail = (inv.email || '').toLowerCase().includes(q);
          const matchesSpec = (inv.specialization || '').toLowerCase().includes(q);
          if (!matchesName && !matchesBadge && !matchesEmail && !matchesSpec) {
            return false;
          }
        }

        // 2. Department Combo Box Filter
        if (selectedDepartment !== 'ALL') {
          const invDept = getInvestigatorDepartment(inv);
          if ((invDept || '').toLowerCase() !== (selectedDepartment || '').toLowerCase()) {
            return false;
          }
        }

        // 3. Location Scope Filter (Only when not explicitly searching by name across all)
        if (locationScope === 'station' && !nameSearch.trim()) {
          const inLoc = isInvestigatorInLocation(inv, selectedLocation);
          if (!inLoc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort priority:
        // 1. In target location first
        const aInLoc = isInvestigatorInLocation(a, selectedLocation) ? 0 : 1;
        const bInLoc = isInvestigatorInLocation(b, selectedLocation) ? 0 : 1;
        if (aInLoc !== bInLoc) return aInLoc - bInLoc;

        // 2. Availability (Available > Busy > On Leave)
        const aAvail = getInvestigatorAvailability(a);
        const bAvail = getInvestigatorAvailability(b);
        const availScore = (av: string) => (av === 'Available' ? 0 : av === 'Busy' ? 1 : 2);
        if (availScore(aAvail) !== availScore(bAvail)) return availScore(aAvail) - availScore(bAvail);

        // 3. Specialization match
        const aSpec = normalize(getInvestigatorSpecialization(a));
        const bSpec = normalize(getInvestigatorSpecialization(b));
        const aMatch = aSpec.includes(reportCategoryNorm) || reportCategoryNorm.includes(aSpec) ? 0 : 1;
        const bMatch = bSpec.includes(reportCategoryNorm) || reportCategoryNorm.includes(bSpec) ? 0 : 1;
        if (aMatch !== bMatch) return aMatch - bMatch;

        // 4. Active workload (fewer active cases first)
        return getInvestigatorActiveCases(a) - getInvestigatorActiveCases(b);
      });
  }, [responsiblePersons, nameSearch, selectedDepartment, locationScope, selectedLocation, report?.category]);

  // Auto-select top candidate if current selection is invalid or empty
  useEffect(() => {
    if (filteredInvestigators.length > 0) {
      const exists = filteredInvestigators.some((i) => i.id === selectedInvestigatorId);
      if (!exists) {
        setSelectedInvestigatorId(filteredInvestigators[0].id);
      }
    } else {
      setSelectedInvestigatorId('');
    }
  }, [filteredInvestigators, selectedInvestigatorId]);

  // Selected investigator profile
  const selectedInvestigator = useMemo(() => {
    return responsiblePersons.find((p) => p.id === selectedInvestigatorId) || null;
  }, [responsiblePersons, selectedInvestigatorId]);

  // Quick Preset Deadlines
  const handleSetDeadlinePreset = (days: number) => {
    const targetDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDeadline(targetDate);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestigator) return;

    onAssignReport(report.id, {
      responsiblePersonId: selectedInvestigator.id,
      responsiblePersonName: selectedInvestigator.fullName,
      department: getInvestigatorDepartment(selectedInvestigator),
      priority,
      deadline,
      notes,
      location: selectedLocation,
      specialization: getInvestigatorSpecialization(selectedInvestigator),
    });

    onClose();
  };

  const filteredLocationOptions = useMemo(() => {
    if (!locationSearch.trim()) return COMMON_LOCATIONS;
    const q = locationSearch.toLowerCase();
    return COMMON_LOCATIONS.filter((l) => l.name.toLowerCase().includes(q) || l.label.toLowerCase().includes(q));
  }, [locationSearch]);

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md text-white ${
          isAlreadyAssigned
            ? 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-[#005BAC]'
            : 'bg-[#005BAC]'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-black/20 rounded-xl shadow-inner border border-white/20">
              {isAlreadyAssigned ? (
                <RefreshCw className="w-5 h-5 text-amber-300 animate-spin-slow" />
              ) : (
                <UserCheck className="w-5 h-5 text-amber-300" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  {isAlreadyAssigned ? 'Reassign Investigation Unit' : 'Assign Investigation Unit'}
                </h2>
                <span className="px-2 py-0.5 bg-black/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-amber-300/30">
                  {isAlreadyAssigned ? 'Case Reassignment' : 'Dispatch Console'}
                </span>
              </div>
              <p className="text-xs text-blue-100/90">
                {isAlreadyAssigned
                  ? `Currently assigned to ${report.assignedTo?.responsiblePersonName || 'Lead'}. Select new investigator or updated directives below.`
                  : 'Search by investigator name or department desk to assign field lead.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs">
          
          {/* Target Incident Brief Card (Simplified) */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 min-w-0">
              <span className="font-mono font-bold text-[#005BAC] dark:text-blue-400 text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 rounded border border-blue-200 dark:border-blue-800/60 shrink-0">
                {report.id}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                  {report.title}
                </p>
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400">
                  <span>{report.category}</span>
                  <span>•</span>
                  <span>{report.zone || 'Amhara'}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center space-x-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg border border-emerald-200 dark:border-emerald-800/60 text-[10px]">
              <Shield className="w-3 h-3" />
              <span>Whistleblower</span>
            </div>
          </div>

          {/* SIMPLIFIED SEARCH & FILTER CONTROLS BAR */}
          <div className="p-3 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />
                <span>Search & Filter Field Investigators</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {filteredInvestigators.length} matching officer{filteredInvestigators.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Filter Inputs Grid: 1. Name Search | 2. Department Combo Box | 3. Location Select */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              
              {/* 1. Investigator Name Search */}
              <div className="sm:col-span-5 relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  id="input-search-investigator-name"
                  type="text"
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  placeholder="Search investigator name..."
                  className="w-full pl-8.5 pr-7 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#005BAC]"
                />
                {nameSearch && (
                  <button
                    type="button"
                    onClick={() => setNameSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 2. Department Desk Combo Box (Select) */}
              <div className="sm:col-span-4 relative">
                <Building2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                <select
                  id="select-investigator-department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full pl-8.5 pr-7 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-[#005BAC] appearance-none cursor-pointer"
                >
                  <option value="ALL">All Department Desks</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>

              {/* 3. Location Scope Selector / Toggle */}
              <div className="sm:col-span-3 relative">
                <button
                  type="button"
                  onClick={() => setShowLocationPicker((prev) => !prev)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium flex items-center justify-between hover:border-[#005BAC] transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#005BAC] shrink-0" />
                    <span className="truncate">{locationScope === 'all' ? 'All Locations' : selectedLocation}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                </button>

                {/* Location Picker Dropdown */}
                {showLocationPicker && (
                  <div className="absolute z-30 top-full right-0 mt-1 w-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-2.5 space-y-1.5 animate-in fade-in zoom-in-95">
                    <div className="flex items-center space-x-1 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLocationScope('station');
                          setShowLocationPicker(false);
                        }}
                        className={`flex-1 py-1 px-2 text-[10px] rounded font-bold transition-colors cursor-pointer ${
                          locationScope === 'station'
                            ? 'bg-[#005BAC] text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Stationed Locally
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLocationScope('all');
                          setShowLocationPicker(false);
                        }}
                        className={`flex-1 py-1 px-2 text-[10px] rounded font-bold transition-colors cursor-pointer ${
                          locationScope === 'all'
                            ? 'bg-[#005BAC] text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        All Regions
                      </button>
                    </div>

                    <div className="relative pt-1">
                      <Search className="w-3 h-3 absolute left-2.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        placeholder="Search city/town..."
                        className="w-full pl-7 pr-2 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                      {filteredLocationOptions.map((loc) => (
                        <button
                          key={loc.name + loc.zone}
                          type="button"
                          onClick={() => {
                            setSelectedLocation(loc.name);
                            setLocationScope('station');
                            setShowLocationPicker(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded text-[11px] flex items-center justify-between cursor-pointer ${
                            (selectedLocation || '').toLowerCase() === (loc.name || '').toLowerCase()
                              ? 'bg-blue-50 dark:bg-blue-950 text-[#005BAC] font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="truncate">{loc.label}</span>
                          {(selectedLocation || '').toLowerCase() === (loc.name || '').toLowerCase() && (
                            <Check className="w-3 h-3 text-[#005BAC]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* INVESTIGATORS LIST (SIMPLIFIED & CLEAN) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-[#005BAC] dark:text-blue-400" />
                <span>Select Lead Investigator</span>
              </label>
              {(nameSearch || selectedDepartment !== 'ALL' || locationScope === 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setNameSearch('');
                    setSelectedDepartment('ALL');
                    setLocationScope('station');
                  }}
                  className="text-[10px] text-[#005BAC] dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {filteredInvestigators.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  No investigators match your current filters.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Try clearing the search query, selecting "All Department Desks", or switching to "All Regions".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setNameSearch('');
                    setSelectedDepartment('ALL');
                    setLocationScope('all');
                  }}
                  className="px-3 py-1.5 bg-[#005BAC] text-white rounded-lg font-bold text-xs hover:bg-blue-700 cursor-pointer inline-block"
                >
                  View All Regional Investigators
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-0.5">
                {filteredInvestigators.map((inv, idx) => {
                  const isSelected = selectedInvestigatorId === inv.id;
                  const activeCases = getInvestigatorActiveCases(inv);
                  const availability = getInvestigatorAvailability(inv);
                  const department = getInvestigatorDepartment(inv);
                  const inTargetLocation = isInvestigatorInLocation(inv, selectedLocation);

                  return (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedInvestigatorId(inv.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'border-[#005BAC] dark:border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 ring-2 ring-[#005BAC]/30 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {/* Top row: Name + Availability */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isSelected
                                ? 'bg-[#005BAC] text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                              {inv.fullName}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">
                              {inv.badgeNumber || inv.id}
                            </p>
                          </div>
                        </div>

                        {/* Availability Pill */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center space-x-1 ${
                            availability === 'Available'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : availability === 'Busy'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              availability === 'Available'
                                ? 'bg-emerald-500'
                                : availability === 'Busy'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span>{availability}</span>
                        </span>
                      </div>

                      {/* Middle row: Department & Station */}
                      <div className="text-[11px] space-y-0.5">
                        <div className="text-slate-700 dark:text-slate-300 font-medium truncate">
                          {department}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center space-x-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {inv.city || inv.cityTown || inv.zone || 'Amhara'}
                              {inTargetLocation && ' (Stationed)'}
                            </span>
                          </span>
                          <span className="font-mono font-bold shrink-0 ml-1">
                            {activeCases} active case{activeCases === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>

                      {/* Selected check */}
                      {isSelected && (
                        <div className="pt-1 border-t border-blue-200 dark:border-blue-800/60 flex items-center justify-between text-[#005BAC] dark:text-blue-400 text-[10px] font-bold">
                          <span>Selected Assignee</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STREAMLINED SELECTED INVESTIGATOR PROFILE (COMPACT & UNCLUTTERED) */}
          {selectedInvestigator && (
            <div className="p-3 bg-gradient-to-r from-blue-50/90 to-indigo-50/70 dark:from-slate-800/90 dark:to-slate-800/60 rounded-xl border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#005BAC] text-white flex items-center justify-center font-extrabold text-base shrink-0 shadow-xs">
                  {selectedInvestigator.fullName ? selectedInvestigator.fullName.trim().charAt(0).toUpperCase() : 'I'}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      {selectedInvestigator.fullName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {selectedInvestigator.badgeNumber || selectedInvestigator.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                    {getInvestigatorDepartment(selectedInvestigator)} •{' '}
                    <span className="text-[#005BAC] dark:text-blue-400 font-semibold">
                      {getInvestigatorSpecialization(selectedInvestigator)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0 text-[11px] border-t sm:border-t-0 pt-2 sm:pt-0 border-blue-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 text-[10px] block">Location</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedInvestigator.city || selectedInvestigator.cityTown || selectedInvestigator.zone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Active Workload</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                    {getInvestigatorActiveCases(selectedInvestigator)} Cases
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PRIORITY LEVEL & DEADLINE (SIDE BY SIDE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* Priority Selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>Priority Level *</span>
              </label>

              <div className="grid grid-cols-4 gap-1.5">
                {(['Critical', 'High', 'Medium', 'Low'] as PriorityLevel[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPriority(p);
                      setDeadline(getDefaultDeadline(p));
                    }}
                    className={`py-1.5 px-1 text-center rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      priority === p
                        ? p === 'Critical'
                          ? 'bg-red-600 text-white shadow-xs'
                          : p === 'High'
                          ? 'bg-orange-600 text-white shadow-xs'
                          : p === 'Medium'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline Configuration */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />
                  <span>Investigation Deadline *</span>
                </label>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleSetDeadlinePreset(2)}
                    className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded font-semibold"
                  >
                    48h
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDeadlinePreset(7)}
                    className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded font-semibold"
                  >
                    7d
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDeadlinePreset(14)}
                    className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded font-semibold"
                  >
                    14d
                  </button>
                </div>
              </div>

              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium outline-none focus:ring-2 focus:ring-[#005BAC]"
              />
            </div>
          </div>

          {/* DIRECTIVES & EDITORIAL NOTES (COMPACT) */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />
              <span>Investigation Directives & Dispatch Notes (Optional)</span>
            </label>

            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Conduct discrete on-site interviews with witnesses. Cross-reference municipal invoices & serial numbers."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC] text-xs"
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-[11px]">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="hidden sm:inline">Protected by End-to-End Encryption</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-dispatch-assignment"
                type="submit"
                disabled={!selectedInvestigator}
                className={`px-5 py-2 font-bold rounded-xl shadow-md flex items-center space-x-2 text-xs transition-all cursor-pointer ${
                  selectedInvestigator
                    ? isAlreadyAssigned
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                      : 'bg-[#005BAC] hover:bg-blue-800 text-white active:scale-95'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isAlreadyAssigned ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
                    <span>Confirm Reassignment</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-amber-300" />
                    <span>Confirm & Dispatch Unit</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
