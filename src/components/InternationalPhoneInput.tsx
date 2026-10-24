import React, { useState, useEffect, useRef } from 'react';
import {
  POPULAR_COUNTRIES,
  CountryCodeItem,
  findCountryFromPhone,
  validateInternationalPhone,
} from '../utils/phoneHelper';
import { ChevronDown, Globe, Search, Check, Phone } from 'lucide-react';

interface InternationalPhoneInputProps {
  value: string;
  onChange: (fullPhone: string) => void;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string | null;
  id?: string;
}

export const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  label = 'Phone Number',
  placeholder,
  className = '',
  error,
  id,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCodeItem>(() => findCountryFromPhone(value));
  const [localNumber, setLocalNumber] = useState<string>(() => {
    if (!value) return '';
    const clean = value.replace(/[\s\-\(\)]/g, '');
    const c = findCountryFromPhone(value);
    if (c.code !== 'OTHER' && clean.startsWith(c.dialCode)) {
      return clean.slice(c.dialCode.length);
    }
    return clean.startsWith('+') ? clean.slice(1) : clean;
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => {
    if (!value) {
      setLocalNumber('');
      return;
    }
    const clean = value.replace(/[\s\-\(\)]/g, '');
    const c = findCountryFromPhone(value);
    setSelectedCountry(c);
    if (c.code !== 'OTHER' && clean.startsWith(c.dialCode)) {
      setLocalNumber(clean.slice(c.dialCode.length));
    } else if (clean.startsWith('+')) {
      setLocalNumber(clean.slice(1));
    } else {
      setLocalNumber(clean);
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountryChange = (country: CountryCodeItem) => {
    setSelectedCountry(country);
    setDropdownOpen(false);
    setSearchQuery('');

    if (country.code === 'OTHER') {
      onChange(localNumber.startsWith('+') ? localNumber : `+${localNumber}`);
    } else {
      let cleanLocal = localNumber.replace(/^[0+]+/, '');
      if (country.code === 'ET' && cleanLocal.startsWith('0')) {
        cleanLocal = cleanLocal.slice(1);
      }
      const maxDigits = country.maxLength || 15;
      const truncated = cleanLocal.slice(0, maxDigits);
      setLocalNumber(truncated);
      const full = truncated ? `${country.dialCode}${truncated}` : '';
      onChange(full);
    }
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    // Allow digits, spaces, and hyphens
    const filtered = input.replace(/[^\d\s\-+]/g, '');

    if (selectedCountry.code === 'OTHER') {
      const formatted = filtered.startsWith('+') ? filtered : `+${filtered}`;
      setLocalNumber(filtered);
      onChange(formatted);
      return;
    }

    // Strip leading 0 if someone enters 091...
    let clean = filtered.replace(/[^\d]/g, '');
    if (selectedCountry.code === 'ET' && clean.startsWith('0')) {
      clean = clean.slice(1);
    }

    // Enforce country-specific maximum digit limit
    const maxDigits = selectedCountry.maxLength || 15;
    const truncated = clean.slice(0, maxDigits);

    setLocalNumber(truncated);
    onChange(truncated ? `${selectedCountry.dialCode}${truncated}` : '');
  };

  const filteredCountries = POPULAR_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`space-y-1 ${className}`} id={id}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center space-x-1.5 text-xs">
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            <span>{label} {required && <span className="text-red-500">*</span>}</span>
          </label>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
            {selectedCountry.dialCode} ({selectedCountry.code} • {selectedCountry.name.split(' ')[0]})
          </span>
        </div>
      )}

      <div className="relative flex items-center">
        {/* Country Code Picker Dropdown Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-1.5 px-3 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-r-0 border-slate-300 dark:border-zinc-700 rounded-l-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none transition-colors"
            title="Select Country Calling Code"
          >
            <span className="px-1 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-zinc-700 font-mono text-slate-800 dark:text-zinc-200 leading-none">
              {selectedCountry.code}
            </span>
            <span className="font-mono">{selectedCountry.dialCode}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 dark:text-zinc-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-72 max-h-72 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country or code..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs outline-none text-slate-800 dark:text-white"
                    autoFocus
                  />
                </div>
              </div>

              <div className="overflow-y-auto flex-1 divide-y divide-slate-50 dark:divide-zinc-800/50">
                {filteredCountries.map((c) => {
                  const isSelected = selectedCountry.code === c.code;
                  return (
                    <button
                      key={c.code + c.dialCode}
                      type="button"
                      onClick={() => handleCountryChange(c)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors ${
                        isSelected ? 'bg-blue-50/70 dark:bg-zinc-800 font-bold text-[#005BAC] dark:text-blue-400' : 'text-slate-700 dark:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 shrink-0">
                          {c.code}
                        </span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0 ml-2 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                        <span>{c.dialCode}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />}
                      </div>
                    </button>
                  );
                })}

                {filteredCountries.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No country matches "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* National / International Phone Input */}
        <div className="relative flex-1">
          <input
            type="tel"
            required={required}
            disabled={disabled}
            value={localNumber}
            maxLength={selectedCountry.maxLength || 15}
            onChange={handleNumberInput}
            placeholder={placeholder || selectedCountry.formatPlaceholder}
            className="w-full pl-3.5 pr-14 py-2.5 rounded-r-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-zinc-400 font-mono text-xs"
          />
          {selectedCountry.code !== 'OTHER' && (
            <span className="absolute right-3 top-3 text-[10px] font-mono text-slate-400 dark:text-zinc-500 pointer-events-none select-none">
              {localNumber.length}/{selectedCountry.maxLength}
            </span>
          )}
        </div>
      </div>

      {error ? (
        <p className="text-[11px] text-red-500 dark:text-red-400">{error}</p>
      ) : (
        <p className="text-[10px] text-slate-500 dark:text-zinc-400">
          International format supported. Example: {selectedCountry.dialCode} {selectedCountry.formatPlaceholder}
        </p>
      )}
    </div>
  );
};
