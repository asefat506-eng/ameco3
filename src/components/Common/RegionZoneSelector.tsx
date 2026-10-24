import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapPin, ChevronDown, Check, Search, Globe, Building2, AlertCircle } from 'lucide-react';
import { ETHIOPIAN_REGIONS, REGION_ZONES_MAP, getZonesForRegion } from '../../data/zones';

interface RegionZoneSelectorProps {
  selectedRegion: string;
  selectedZone: string;
  onRegionChange: (region: string) => void;
  onZoneChange: (zone: string) => void;
  customZoneValue?: string;
  onCustomZoneChange?: (val: string) => void;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'grid' | 'stack';
  regionLabel?: string;
  zoneLabel?: string;
  showCustomZoneInput?: boolean;
  disabled?: boolean;
  className?: string;
}

export const RegionZoneSelector: React.FC<RegionZoneSelectorProps> = ({
  selectedRegion,
  selectedZone,
  onRegionChange,
  onZoneChange,
  customZoneValue = '',
  onCustomZoneChange,
  required = true,
  size = 'md',
  layout = 'grid',
  regionLabel = 'National Region / City Administration',
  zoneLabel = 'Administrative Zone / Sub-City',
  showCustomZoneInput = true,
  disabled = false,
  className = '',
}) => {
  const [zoneSearch, setZoneSearch] = useState('');
  const [isZoneComboOpen, setIsZoneComboOpen] = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);

  // Available zones for current selected region
  const availableZones = useMemo(() => {
    return getZonesForRegion(selectedRegion || 'Amhara Region');
  }, [selectedRegion]);

  // Filtered zones based on combo search
  const filteredZones = useMemo(() => {
    if (!zoneSearch.trim()) return availableZones;
    return availableZones.filter((z) =>
      z.toLowerCase().includes(zoneSearch.toLowerCase())
    );
  }, [availableZones, zoneSearch]);

  // Handle outside click to close combobox
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(event.target as Node)) {
        setIsZoneComboOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When region changes, if the current zone doesn't belong to the new region, auto-select the first zone
  const handleRegionSelect = (newRegion: string) => {
    onRegionChange(newRegion);
    const newZones = getZonesForRegion(newRegion);
    if (!newZones.includes(selectedZone)) {
      onZoneChange(newZones[0] || 'Others...');
    }
  };

  const isOthersSelected =
    selectedZone.startsWith('Others') ||
    selectedZone.includes('Specify') ||
    selectedRegion === 'Others...';

  const pyClass = size === 'sm' ? 'py-1.5 px-2.5 text-xs' : size === 'lg' ? 'py-3 px-4 text-sm' : 'py-2 px-3 text-xs sm:text-sm';

  return (
    <div className={`space-y-3 ${className}`}>
      <div className={layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}>
        {/* 1. REGION SELECTION */}
        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />
              <span>{regionLabel}</span>
              {required && <span className="text-red-500">*</span>}
            </span>
          </label>
          <div className="relative">
            <select
              disabled={disabled}
              value={selectedRegion}
              onChange={(e) => handleRegionSelect(e.target.value)}
              className={`w-full ${pyClass} rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]/30 font-medium transition-colors`}
            >
              {ETHIOPIAN_REGIONS.map((reg) => (
                <option key={reg.value} value={reg.value}>
                  {reg.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. ZONE COMBOBOX (DYNAMICALLY POPULATED BASED ON REGION) */}
        <div className="relative" ref={comboRef}>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{zoneLabel}</span>
              {required && <span className="text-red-500">*</span>}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              {availableZones.length} {selectedRegion.includes('Addis') || selectedRegion.includes('Dire') ? 'Sub-cities' : 'Zones'}
            </span>
          </label>

          {/* Combobox Trigger Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsZoneComboOpen(!isZoneComboOpen)}
            className={`w-full ${pyClass} rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-left text-slate-900 dark:text-slate-100 flex items-center justify-between outline-none focus:ring-2 focus:ring-emerald-500/30 transition-colors shadow-xs`}
          >
            <div className="flex items-center space-x-2 truncate pr-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold truncate">
                {selectedZone || 'Select Zone / Sub-City'}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                isZoneComboOpen ? 'rotate-180 text-emerald-600' : ''
              }`}
            />
          </button>

          {/* Combobox Dropdown Menu */}
          {isZoneComboOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {/* Search Bar inside combo box */}
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder={`Search ${selectedRegion.replace('Region', '').trim()} zones...`}
                    value={zoneSearch}
                    onChange={(e) => setZoneSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Zones List */}
              <div className="max-h-56 overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
                {filteredZones.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No matching zones found. Select "Others..." to type custom.
                  </div>
                ) : (
                  filteredZones.map((zoneName) => {
                    const isSelected = selectedZone === zoneName;
                    const isOtherItem = zoneName.startsWith('Others');
                    return (
                      <button
                        key={zoneName}
                        type="button"
                        onClick={() => {
                          onZoneChange(zoneName);
                          setIsZoneComboOpen(false);
                          setZoneSearch('');
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                            : isOtherItem
                            ? 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{zoneName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer hint */}
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Region: {selectedRegion}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {filteredZones.length} available
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. SPECIFIC CUSTOM LOCATION INPUT (when "Others..." or custom is active) */}
      {showCustomZoneInput && isOthersSelected && onCustomZoneChange && (
        <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-1 animate-in fade-in duration-200">
          <label className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Specify Custom Location, Woreda, Sub-City, or Diaspora City *</span>
          </label>
          <input
            type="text"
            required
            value={customZoneValue}
            onChange={(e) => onCustomZoneChange(e.target.value)}
            placeholder="e.g. Adama Center, Hawassa Tabor Sub-city, Gambella Itang, or Washington DC"
            className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      )}
    </div>
  );
};
