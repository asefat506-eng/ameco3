/**
 * International Phone Helper & Validation
 * Supports Ethiopia (+251) and countries worldwide conforming to ITU-T E.164 standard.
 */

export interface CountryCodeItem {
  code: string; // ISO 2-letter
  name: string; // Country name
  dialCode: string; // e.g. "+251"
  flag?: string; // Country ISO code tag
  formatPlaceholder: string;
  minLength: number; // National significant number min digits
  maxLength: number; // National significant number max digits
  regex?: RegExp; // Optional country-specific regex
}

export const POPULAR_COUNTRIES: CountryCodeItem[] = [
  {
    code: 'ET',
    name: 'Ethiopia (ኢትዮጵያ)',
    dialCode: '+251',
    flag: 'ET',
    formatPlaceholder: '91 234 5678',
    minLength: 9,
    maxLength: 9,
    regex: /^[79]\d{8}$/,
  },
  {
    code: 'US',
    name: 'United States & Canada',
    dialCode: '+1',
    flag: 'US',
    formatPlaceholder: '(202) 555-0143',
    minLength: 10,
    maxLength: 10,
    regex: /^\d{10}$/,
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    flag: 'GB',
    formatPlaceholder: '7911 123456',
    minLength: 10,
    maxLength: 11,
    regex: /^\d{10,11}$/,
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dialCode: '+966',
    flag: 'SA',
    formatPlaceholder: '50 123 4567',
    minLength: 9,
    maxLength: 9,
    regex: /^5\d{8}$/,
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    flag: 'AE',
    formatPlaceholder: '50 123 4567',
    minLength: 9,
    maxLength: 9,
    regex: /^5\d{8}$/,
  },
  {
    code: 'SD',
    name: 'Sudan',
    dialCode: '+249',
    flag: 'SD',
    formatPlaceholder: '91 234 5678',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'ER',
    name: 'Eritrea',
    dialCode: '+291',
    flag: 'ER',
    formatPlaceholder: '7 123456',
    minLength: 7,
    maxLength: 7,
  },
  {
    code: 'DJ',
    name: 'Djibouti',
    dialCode: '+253',
    flag: 'DJ',
    formatPlaceholder: '77 12 34 56',
    minLength: 8,
    maxLength: 8,
  },
  {
    code: 'KE',
    name: 'Kenya',
    dialCode: '+254',
    flag: 'KE',
    formatPlaceholder: '712 345678',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'SO',
    name: 'Somalia',
    dialCode: '+252',
    flag: 'SO',
    formatPlaceholder: '61 2345678',
    minLength: 8,
    maxLength: 9,
  },
  {
    code: 'EG',
    name: 'Egypt',
    dialCode: '+20',
    flag: 'EG',
    formatPlaceholder: '10 1234 5678',
    minLength: 10,
    maxLength: 10,
  },
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    flag: 'DE',
    formatPlaceholder: '151 2345678',
    minLength: 10,
    maxLength: 11,
  },
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    flag: 'FR',
    formatPlaceholder: '6 12 34 56 78',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'IT',
    name: 'Italy',
    dialCode: '+39',
    flag: 'IT',
    formatPlaceholder: '312 345 6789',
    minLength: 9,
    maxLength: 10,
  },
  {
    code: 'SE',
    name: 'Sweden',
    dialCode: '+46',
    flag: 'SE',
    formatPlaceholder: '70 123 45 67',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'NO',
    name: 'Norway',
    dialCode: '+47',
    flag: 'NO',
    formatPlaceholder: '412 34 567',
    minLength: 8,
    maxLength: 8,
  },
  {
    code: 'NL',
    name: 'Netherlands',
    dialCode: '+31',
    flag: 'NL',
    formatPlaceholder: '6 12345678',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'CH',
    name: 'Switzerland',
    dialCode: '+41',
    flag: 'CH',
    formatPlaceholder: '78 123 45 67',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    flag: 'AU',
    formatPlaceholder: '412 345 678',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'ZA',
    name: 'South Africa',
    dialCode: '+27',
    flag: 'ZA',
    formatPlaceholder: '71 234 5678',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'NG',
    name: 'Nigeria',
    dialCode: '+234',
    flag: 'NG',
    formatPlaceholder: '802 123 4567',
    minLength: 10,
    maxLength: 10,
  },
  {
    code: 'UG',
    name: 'Uganda',
    dialCode: '+256',
    flag: 'UG',
    formatPlaceholder: '772 123456',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'RW',
    name: 'Rwanda',
    dialCode: '+250',
    flag: 'RW',
    formatPlaceholder: '788 123 456',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'QA',
    name: 'Qatar',
    dialCode: '+974',
    flag: 'QA',
    formatPlaceholder: '3312 3456',
    minLength: 8,
    maxLength: 8,
  },
  {
    code: 'KW',
    name: 'Kuwait',
    dialCode: '+965',
    flag: 'KW',
    formatPlaceholder: '9123 4567',
    minLength: 8,
    maxLength: 8,
  },
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    flag: 'IN',
    formatPlaceholder: '98765 43210',
    minLength: 10,
    maxLength: 10,
  },
  {
    code: 'CN',
    name: 'China',
    dialCode: '+86',
    flag: 'CN',
    formatPlaceholder: '138 1234 5678',
    minLength: 11,
    maxLength: 11,
  },
  {
    code: 'TR',
    name: 'Turkey',
    dialCode: '+90',
    flag: 'TR',
    formatPlaceholder: '532 123 45 67',
    minLength: 10,
    maxLength: 10,
  },
  {
    code: 'IL',
    name: 'Israel',
    dialCode: '+972',
    flag: 'IL',
    formatPlaceholder: '50 123 4567',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'BR',
    name: 'Brazil',
    dialCode: '+55',
    flag: 'BR',
    formatPlaceholder: '11 91234-5678',
    minLength: 10,
    maxLength: 11,
  },
  {
    code: 'OTHER',
    name: 'Other International (Custom)',
    dialCode: '+',
    flag: 'INTL',
    formatPlaceholder: 'Country & Number',
    minLength: 6,
    maxLength: 15,
  },
];

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formattedNumber?: string;
  country?: CountryCodeItem;
}

/**
 * Find country definition from a given full phone string or dial code
 */
export function findCountryFromPhone(phone?: string | null): CountryCodeItem {
  if (!phone || typeof phone !== 'string') {
    return POPULAR_COUNTRIES[0]; // Default to Ethiopia
  }
  const clean = phone.trim().replace(/[^\d+]/g, '');
  if (!clean.startsWith('+')) {
    return POPULAR_COUNTRIES[0]; // Default to Ethiopia
  }

  // Sort countries with longer dial codes first (e.g. +251, +254 before +1)
  const sorted = [...POPULAR_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sorted) {
    if (c.code !== 'OTHER' && clean.startsWith(c.dialCode)) {
      return c;
    }
  }

  return POPULAR_COUNTRIES.find((c) => c.code === 'OTHER') || POPULAR_COUNTRIES[0];
}

/**
 * Validate phone number supporting both Ethiopia and any global international country
 */
export function validateInternationalPhone(phone?: string | null): PhoneValidationResult {
  const trimmed = typeof phone === 'string' ? phone.trim() : '';

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Phone number is required. / የስልክ ቁጥር ያስፈልጋል።',
    };
  }

  // Remove spaces, hyphens, parentheses
  const cleanDigits = trimmed.replace(/[\s\-\(\)\.]/g, '');

  if (!cleanDigits.startsWith('+')) {
    return {
      isValid: false,
      error: 'Phone number must start with international "+" country code (e.g., +251 for Ethiopia, +1 for US, +44 for UK).',
    };
  }

  // Digits only after the plus
  const digitsOnly = cleanDigits.slice(1);
  if (!/^\d+$/.test(digitsOnly)) {
    return {
      isValid: false,
      error: 'Phone number must contain only numeric digits after the "+" symbol.',
    };
  }

  // ITU-T E.164 standard limits total digits (excluding +) to max 15, min 7
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return {
      isValid: false,
      error: 'Invalid phone number length. International numbers must be between 7 and 15 digits including country code.',
    };
  }

  const country = findCountryFromPhone(cleanDigits);

  // If specific country matched (like Ethiopia +251)
  if (country && country.code === 'ET') {
    const nationalDigits = cleanDigits.slice(country.dialCode.length);
    if (!country.regex?.test(nationalDigits)) {
      return {
        isValid: false,
        error: 'Invalid Ethiopian phone format. Must be +251 followed by 9 digits starting with 7 or 9 (e.g., +251 91 234 5678).',
        country,
      };
    }
  } else if (country && country.code !== 'OTHER') {
    const nationalDigits = cleanDigits.slice(country.dialCode.length);
    if (nationalDigits.length < country.minLength || nationalDigits.length > country.maxLength) {
      return {
        isValid: false,
        error: `Invalid number length for ${country.name}. Expected ${country.minLength}${
          country.minLength !== country.maxLength ? `-${country.maxLength}` : ''
        } digits after ${country.dialCode}.`,
        country,
      };
    }
  }

  return {
    isValid: true,
    formattedNumber: cleanDigits,
    country,
  };
}
