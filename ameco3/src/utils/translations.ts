export type Language = 'en' | 'am';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Branding & Header
    'app.title': 'Amhara Media Corporation',
    'app.subtitle': 'Citizen Journalism & Whistleblower Intelligence Portal',
    
    // Nav Tabs
    'nav.dashboard': 'Dashboard',
    'nav.submitIncident': 'Submit Incident',
    'nav.mySubmissions': 'My Submissions',
    'nav.trackSubmission': 'Track Submission',
    'nav.messages': 'Messages',
    'nav.myProfile': 'My Profile',
    'nav.publishedReports': 'Published Reports',
    'nav.helpFaq': 'Help & FAQ',
    'nav.home': 'Dashboard',
    'nav.track': 'Track Submission',
    'nav.faq': 'Help & FAQ',
    'nav.adminChat': 'Admin Chat',
    'nav.investigator': 'Investigator Workbench',
    'nav.admin': 'Admin Console',
    'nav.adminOverview': 'System Overview',
    'nav.users': 'User Management',
    'nav.analytics': 'Analytics & AI Insights',
    'nav.audit': 'Audit Logs',
    'nav.submitReport': '+ Submit Incident',
    'nav.switchPersona': 'Switch Role',
    'nav.logout': 'Sign Out',
    'nav.language': 'Language',
    'nav.english': 'English',
    'nav.amharic': 'አማርኛ',

    // Role Names
    'role.citizen': 'Citizen Journalist',
    'role.responsiblePerson': 'AMECO Investigator',
    'role.admin': 'System Administrator',
    'role.guest': 'Anonymous Guest',

    // Login / Auth
    'auth.welcome': 'Welcome to AMECO Portal',
    'auth.subtitle': 'Empowering Regional Voice & Truth in Reporting',
    'auth.login': 'Sign In',
    'auth.guestAccess': 'Continue as Guest',
    'auth.register': 'Sign Up',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.nameHint': 'Supports English and Amharic text only',
    'auth.email': 'Email Address',
    'auth.phone': 'Phone Number',
    'auth.phoneHint': 'Supports Ethiopian and international phone numbers',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.confirmPasswordHint': 'Ensure password confirmation is identical and meets strong security policies',
    'auth.selectPersona': 'Quick Login Persona',

    // Citizen Home & Submission
    'home.heroTitle': 'Empowering Amhara Citizens with Truth & Transparency',
    'home.heroDesc': 'Submit verified news, breaking incidents, or anonymous whistleblower tips. Powered by AI triaging and 256-bit encryption.',
    'home.submitNews': 'Submit Verified News',
    'home.submitTipoff': 'Submit Confidential Tip',
    'home.submitReport': 'Submit News Report & Confidential Tip-Off',
    'home.trackSubmissions': 'Track Submissions',
    'home.helpPrivacy': 'Help & Privacy Guide',
    'home.recentReports': 'Recent Verified Reports',
    'home.allCategories': 'All Categories',

    // Help & FAQ
    'faq.title': 'How Can We Help You Report News & Protect Your Identity?',
    'faq.subtitle': 'Find step-by-step instructions on submitting verified citizen journalism and understanding whistleblower privacy.',
    'faq.searchPlaceholder': 'Search help topics, keywords, or privacy questions...',

    // Common Actions
    'common.search': 'Search...',
    'common.filter': 'Filter',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.status': 'Status',
    'common.actions': 'Actions',
  },
  am: {
    // Branding & Header
    'app.title': 'አማራ ሚዲያ ኮርፖሬሽን',
    'app.subtitle': 'የዜጎች ጋዜጠኝነት እና ጥቆማ መረብ',

    // Nav Tabs
    'nav.dashboard': 'ዳሽቦርድ',
    'nav.submitIncident': 'ክስተት ሪፖርት አድርግ',
    'nav.mySubmissions': 'የእኔ ሪፖርቶች',
    'nav.trackSubmission': 'ሪፖርት ተከታተል',
    'nav.messages': 'መልዕክቶች',
    'nav.myProfile': 'የእኔ መገለጫ',
    'nav.publishedReports': 'የታተሙ ሪፖርቶች',
    'nav.helpFaq': 'እርዳታ እና ጥያቄዎች',
    'nav.home': 'ዳሽቦርድ',
    'nav.track': 'የላኳቸውን ሪፖርቶች ተከታተል',
    'nav.faq': 'እርዳታ እና ጥያቄዎች',
    'nav.adminChat': 'የአስተዳዳሪ ውይይት',
    'nav.investigator': 'የመርማሪዎች ዳሽቦርድ',
    'nav.admin': 'የአስተዳዳሪ ሰሌዳ',
    'nav.adminOverview': 'አጠቃላይ እይታ',
    'nav.users': 'የተጠቃሚዎች አስተዳደር',
    'nav.analytics': 'ትንታኔ እና AI መረጃ',
    'nav.audit': 'የቁጥጥር መዝገቦች',
    'nav.submitReport': '+ አዲስ ሪፖርት ላክ',
    'nav.switchPersona': 'ሚና ቀይር',
    'nav.logout': 'ውጣ',
    'nav.language': 'ቋንቋ',
    'nav.english': 'English',
    'nav.amharic': 'አማርኛ',

    // Role Names
    'role.citizen': 'ዜጋ ጋዜጠኛ',
    'role.responsiblePerson': 'የአሚኮ መርማሪ',
    'role.admin': 'የስርዓት አስተዳዳሪ',
    'role.guest': 'ያልተመዘገበ እንግዳ',

    // Login / Auth
    'auth.welcome': 'እንኳን ወደ አሚኮ ፖርታል በደህና መጡ',
    'auth.subtitle': 'የክልሉን ድምፅ እና እውነት ማጠናከር',
    'auth.login': 'ግቡ',
    'auth.guestAccess': 'በእንግዳነት ቀጥል',
    'auth.register': 'አዲስ መለያ ፍጠር',
    'auth.firstName': 'የመጀመሪያ ስም',
    'auth.lastName': 'የአባት ስም',
    'auth.nameHint': 'በእንግሊዝኛ እና በአማርኛ ፊደላት ብቻ ይደግፋል',
    'auth.email': 'ኢሜይል አድራሻ',
    'auth.phone': 'ስልክ ቁጥር',
    'auth.phoneHint': 'የኢትዮጵያ እና ዓለም አቀፍ የስልክ ቁጥሮችን ይደግፋል',
    'auth.password': 'የይለፍ ቃል',
    'auth.confirmPassword': 'የይለፍ ቃል ማረጋገጫ',
    'auth.confirmPasswordHint': 'የይለፍ ቃሉ ጠንካራ እና ትክክለኛ መሆኑን ያረጋግጡ',
    'auth.selectPersona': 'በፍጥነት ለመግባት ሚና ይምረጡ',

    // Citizen Home & Submission
    'home.heroTitle': 'የአማራ ዜጎችን በእውነት እና ግልጽነት ማበቃት',
    'home.heroDesc': 'የተረጋገጡ ዜናዎችን፣ የአደጋ ጊዜ ክስተቶችን ወይም ሚስጥራዊ ጥቆማዎችን ይላኩ። በAI ማጣሪያ እና በ256-ቢት ምስጠራ የተጠበቀ።',
    'home.submitNews': 'የተረጋገጠ ዜና ላክ',
    'home.submitTipoff': 'ሚስጥራዊ ጥቆማ ላክ',
    'home.submitReport': 'ዜና ወይም ሚስጥራዊ ጥቆማ ይላኩ',
    'home.trackSubmissions': 'የተላኩትን ተከታተል',
    'home.helpPrivacy': 'እርዳታ እና የግላዊነት መመሪያ',
    'home.recentReports': 'በቅርብ የተረጋገጡ ሪፖርቶች',
    'home.allCategories': 'ሁሉም ምድቦች',

    // Help & FAQ
    'faq.title': 'እንዴት ልንረዳዎ እንችላለን?',
    'faq.subtitle': 'የዜጎች ጋዜጠኝነት ሪፖርት እንዴት እንደሚላክ እና የጥቆማ አቅራቢዎች ግላዊነት እንዴት እንደሚጠበቅ ይወቁ።',
    'faq.searchPlaceholder': 'የእርዳታ ርዕሶችን፣ ቃላትን ወይም የግላዊነት ጥያቄዎችን ይፈልጉ...',

    // Common Actions
    'common.search': 'ፈልግ...',
    'common.filter': 'አጣራ',
    'common.close': 'ዝጋ',
    'common.back': 'ተመለስ',
    'common.status': 'ሁኔታ',
    'common.actions': 'እርምጃዎች',
  },
};

export function getTranslation(lang: Language, key: string, fallback?: string): string {
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  if (translations['en'][key]) {
    return translations['en'][key];
  }
  return fallback || key;
}
