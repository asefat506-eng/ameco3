import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Language,
  getTranslation,
  translateCategory as trCategory,
  translatePriority as trPriority,
  translateStatus as trStatus,
} from '../utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  translateCategory: (cat?: string) => string;
  translatePriority: (pri?: string) => string;
  translateStatus: (stat?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ameco_language');
    if (saved === 'en' || saved === 'am') return saved;
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ameco_language', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'am' : 'en');
  };

  const t = (key: string, fallback?: string) => {
    return getTranslation(language, key, fallback);
  };

  const translateCategory = (cat?: string) => {
    return trCategory(cat, language);
  };

  const translatePriority = (pri?: string) => {
    return trPriority(pri, language);
  };

  const translateStatus = (stat?: string) => {
    return trStatus(stat, language);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        translateCategory,
        translatePriority,
        translateStatus,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
