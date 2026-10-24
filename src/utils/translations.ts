export type Language = 'en' | 'am';

export const CATEGORY_TRANSLATIONS: Record<string, { en: string; am: string }> = {
  'Public Safety': { en: 'Public Safety', am: 'የህዝብ ደህንነት' },
  'Infrastructure & Utilities': { en: 'Infrastructure & Utilities', am: 'መሰረተ ልማት እና አገልግሎቶች' },
  'Corruption & Bribery': { en: 'Corruption & Bribery', am: 'ሙስና እና ጉቦ' },
  'Corruption': { en: 'Corruption', am: 'ሙስና' },
  'Crime & Illegal Activities': { en: 'Crime & Illegal Activities', am: 'ወንጀል እና ህገ-ወጥ ድርጊት' },
  'Crime': { en: 'Crime', am: 'ወንጀል' },
  'Human Rights Violations': { en: 'Human Rights Violations', am: 'የሰብዓዊ መብቶች ጥሰት' },
  'Healthcare & Public Health': { en: 'Healthcare & Public Health', am: 'የጤና ጥበቃ እና ህዝብ ጤና' },
  'Education & Schools': { en: 'Education & Schools', am: 'ትምህርት እና ትምህርት ቤቶች' },
  'Fraud & Embezzlement': { en: 'Fraud & Embezzlement', am: 'ማጭበርበር እና የህዝብ ገንዘብ ምዝበራ' },
  'Environmental Issues': { en: 'Environmental Issues', am: 'የአካባቢ እና የተፈጥሮ ጥበቃ ጉዳዮች' },
  'Community Events & Breaking News': { en: 'Community Events & Breaking News', am: 'የማህበረሰብ ሁነቶች እና ሰበር ዜናዎች' },
  'Public Service Complaints': { en: 'Public Service Complaints', am: 'የህዝብ አገልግሎት አሰጣጥ ቅሬታዎች' },
  'Other Public Interest Matters': { en: 'Other Public Interest Matters', am: 'ሌሎች የህዝብ ጉዳዮች' },
  'General': { en: 'General Matters', am: 'ጠቅላላ የህዝብ ጉዳዮች' },
};

export const PRIORITY_TRANSLATIONS: Record<string, { en: string; am: string }> = {
  'Critical': { en: 'Critical', am: 'ወሳኝ / አሳሳቢ' },
  'High': { en: 'High', am: 'ከፍተኛ' },
  'Medium': { en: 'Medium', am: 'መካከለኛ' },
  'Low': { en: 'Low', am: 'ዝቅተኛ' },
};

export const STATUS_TRANSLATIONS: Record<string, { en: string; am: string }> = {
  'Pending': { en: 'Pending Review', am: 'በመጠባበቅ ላይ' },
  'Pending Review': { en: 'Pending Review', am: 'በመጠባበቅ ላይ' },
  'Under Review': { en: 'Under Review', am: 'በግምገማ ላይ' },
  'Reviewing': { en: 'Reviewing', am: 'በግምገማ ላይ' },
  'Investigating': { en: 'Investigating', am: 'በምርመራ ላይ' },
  'Under Investigation': { en: 'Under Investigation', am: 'በምርመራ ላይ' },
  'Verified': { en: 'Verified', am: 'የተረጋገጠ' },
  'Resolved': { en: 'Resolved', am: 'የተፈታ' },
  'Rejected': { en: 'Rejected', am: 'ውድቅ የተደረገ' },
  'Published': { en: 'Published', am: 'የታተመ' },
  'Archived': { en: 'Archived', am: 'የተመዘገበ' },
  'Flagged': { en: 'Flagged', am: 'የተጠቆመ / አጠራጣሪ' },
  'Clean': { en: 'Clean', am: 'ንጹህ / ትክክለኛ' },
};

export function translateCategory(cat: string | undefined, lang: Language): string {
  if (!cat) return lang === 'am' ? 'ጠቅላላ' : 'General';
  // Check exact key
  if (CATEGORY_TRANSLATIONS[cat]) {
    return CATEGORY_TRANSLATIONS[cat][lang];
  }
  // Check if it matches an Amharic value
  for (const entry of Object.values(CATEGORY_TRANSLATIONS)) {
    if (entry.am === cat || entry.en.toLowerCase() === cat.toLowerCase()) {
      return entry[lang];
    }
  }
  return cat;
}

export function translatePriority(priority: string | undefined, lang: Language): string {
  if (!priority) return lang === 'am' ? 'መካከለኛ' : 'Medium';
  if (PRIORITY_TRANSLATIONS[priority]) {
    return PRIORITY_TRANSLATIONS[priority][lang];
  }
  for (const entry of Object.values(PRIORITY_TRANSLATIONS)) {
    if (entry.am === priority || entry.en.toLowerCase() === priority.toLowerCase()) {
      return entry[lang];
    }
  }
  return priority;
}

export function translateStatus(status: string | undefined, lang: Language): string {
  if (!status) return lang === 'am' ? 'በመጠባበቅ ላይ' : 'Pending';
  if (STATUS_TRANSLATIONS[status]) {
    return STATUS_TRANSLATIONS[status][lang];
  }
  for (const entry of Object.values(STATUS_TRANSLATIONS)) {
    if (entry.am === status || entry.en.toLowerCase() === status.toLowerCase()) {
      return entry[lang];
    }
  }
  return status;
}

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Branding & Header
    'app.title': 'Amhara Media Corporation',
    'app.subtitle': 'Citizen Journalism & Whistleblower Intelligence Portal',
    'app.livePortal': 'LIVE PORTAL',
    'app.menu': 'Menu',
    
    // Nav Tabs
    'nav.dashboard': 'Dashboard',
    'nav.submitIncident': '+ Submit Report / Tip',
    'nav.mySubmissions': 'My Submissions',
    'nav.trackSubmission': 'Track Submission',
    'nav.messages': 'Messages',
    'nav.myProfile': 'My Profile',
    'nav.publishedReports': 'Published News Bulletins',
    'nav.helpFaq': 'Help & FAQ',
    'nav.home': 'Dashboard',
    'nav.track': 'Track Reports',
    'nav.faq': 'Help & FAQ',
    'nav.adminChat': 'Admin Chat',
    'nav.investigator': 'Investigator Workbench',
    'nav.admin': 'Admin Console',
    'nav.adminOverview': 'System Overview',
    'nav.users': 'User Management',
    'nav.analytics': 'Analytics & AI Insights',
    'nav.audit': 'Audit Logs',
    'nav.institutions': 'Regional Institutions & Media',
    'nav.submitReport': '+ Submit News Report & Tip',
    'nav.switchPersona': 'Switch Role',
    'nav.logout': 'Sign Out',
    'nav.login': 'Sign In / Register',
    'nav.language': 'Language',
    'nav.english': 'English',
    'nav.amharic': 'አማርኛ',

    // Role Names
    'role.citizen': 'Citizen Journalist',
    'role.responsiblePerson': 'AMECO Investigator',
    'role.admin': 'System Administrator',
    'role.institution': 'Regional Media / Publisher',
    'role.publisher': 'Regional Media / Publisher',
    'role.guest': 'Anonymous Guest Whistleblower',

    // Login / Auth
    'auth.welcome': 'Welcome to AMECO Portal',
    'auth.subtitle': 'Empowering Regional Voice & Truth in Reporting',
    'auth.login': 'Sign In',
    'auth.guestAccess': 'Continue as Anonymous Guest',
    'auth.register': 'Create New Account',
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

    // Submit Report Modal
    'submit.modalTitle': 'Submit News Report & Confidential Tip-Off',
    'submit.modalSubtitle': 'Amhara Media Corporation Citizen Journalism & Secure Whistleblower Gateway',
    'submit.completionProgress': 'Completion Progress:',
    'submit.stepsCompleted': 'Steps Completed',
    'submit.step1': 'Report Mode & Category',
    'submit.step2': 'Title & Details',
    'submit.step3': 'Location & Date',
    'submit.step4': 'Evidence & AI Pre-Check',
    'submit.anonymousGuestNotice': 'Anonymous Guest Whistleblower Mode Active',
    'submit.confidentialNotice': 'Confidential Anonymous Submission',
    'submit.anonymousHint': 'Generates unique Report ID & permanent encryption for secure follow-up.',
    'submit.submitAnonymously': 'Submit Anonymously',
    'submit.submissionMode': 'Submission Mode',
    'submit.unifiedMode': 'News Report & Tip-Off',
    'submit.category': 'Category',
    'submit.headline': 'Headline / Report Title',
    'submit.headlinePlaceholder': 'Brief summary headline of what happened',
    'submit.description': 'Detailed Description',
    'submit.descPlaceholder': 'Provide factual details (min 3, max 1000 characters)...',
    'submit.descMinWarning': 'Description must be at least 3 characters long',
    'submit.descMaxWarning': 'Maximum limit of 1000 characters reached.',
    'submit.preCheckBtn': 'Pre-check with AI',
    'submit.analyzingAi': 'Analyzing with AI...',
    'submit.incidentDate': 'Incident Date',
    'submit.specificLocation': 'Specific Location / Kebele / Landmark',
    'submit.locPlaceholder': 'e.g. Kebele 04, near Central Market',
    'submit.evidenceTitle': 'Evidence Upload (Photos, Audio, Video, PDF - Max 100MB)',
    'submit.uploadPrompt': 'Click or Drag files here to attach evidence',
    'submit.uploading': 'Processing & Validating Upload...',
    'submit.submitBtn': 'Submit Report to AMECO',
    'submit.submittingBtn': 'Submitting to AMECO...',
    'submit.cancel': 'Cancel',
    'submit.required': 'Required',
    'submit.optional': 'Optional',
    'submit.successTitle': 'Report ID Generated!',
    'submit.successDesc': 'Saved permanently in "My Submissions"',
    'submit.copyId': 'Copy ID',
    'submit.copied': 'Copied!',
    'submit.trackNow': 'Track Report Now',
    'submit.done': 'Done, view My Submissions',

    // AI Assessment Modal & Review
    'ai.assessmentTitle': 'Gemini AI Automated Assessment Results',
    'ai.preAnalysisRating': 'AI Pre-Analysis Rating: Priority',
    'ai.executiveSummary': 'AI Executive Summary:',
    'ai.predictedPriority': 'Predicted Priority',
    'ai.spamScore': 'Spam Score',
    'ai.duplicateScore': 'Duplicate Score',
    'ai.categoryMatch': 'Category Match',
    'ai.offensiveScore': 'Offensive Score',
    'ai.verificationGuidance': 'Investigator Verification Guidance:',
    'ai.languageDetected': 'Language Detected:',
    'ai.flagged': '(Flagged)',
    'ai.clean': '(Clean)',
    'ai.noAnalysis': 'No AI analysis record generated for this submission.',
    'ai.keywords': 'Extracted Topics & Tags:',

    // Admin & Review Modal
    'review.title': 'Administrator Review & Verification',
    'review.subtitle': 'AMECO Central Editorial Assessment',
    'review.citizenStatus': 'Citizen Identity Status',
    'review.revealIdentity': 'Reveal Personal Identity (Audit Logged)',
    'review.identityUnlocked': 'Identity Unlocked',
    'review.updateStatus': 'Update Status',
    'review.assignInvestigator': 'Assign Investigator',
    'review.assignPublisher': 'Assign to Media Publisher',

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
    'common.priority': 'Priority',
    'common.category': 'Category',
    'common.location': 'Location',
    'common.date': 'Date',
    'common.actions': 'Actions',
    'common.details': 'Details',
    'common.view': 'View',
  },
  am: {
    // Branding & Header
    'app.title': 'አማራ ሚዲያ ኮርፖሬሽን',
    'app.subtitle': 'የዜጎች ጋዜጠኝነት እና ጥቆማ መረብ',
    'app.livePortal': 'የቀጥታ ስርጭት መድረክ',
    'app.menu': 'ማውጫ',

    // Nav Tabs
    'nav.dashboard': 'ዳሽቦርድ',
    'nav.submitIncident': '+ ሪፖርት / ጥቆማ ላክ',
    'nav.mySubmissions': 'የእኔ ሪፖርቶች',
    'nav.trackSubmission': 'ሪፖርት ተከታተል',
    'nav.messages': 'መልዕክቶች',
    'nav.myProfile': 'የእኔ መገለጫ',
    'nav.publishedReports': 'የታተሙ ይፋዊ ዜናዎች',
    'nav.helpFaq': 'እርዳታ እና ጥያቄዎች',
    'nav.home': 'ዳሽቦርድ',
    'nav.track': 'የላኳቸውን ሪፖርቶች ተከታተል',
    'nav.faq': 'እርዳታ እና ጥያቄዎች',
    'nav.adminChat': 'የአስተዳዳሪ ውይይት',
    'nav.investigator': 'የመርማሪዎች የስራ ገፅ',
    'nav.admin': 'የአስተዳዳሪ ሰሌዳ',
    'nav.adminOverview': 'አጠቃላይ የስርዓት እይታ',
    'nav.users': 'የተጠቃሚዎች አስተዳደር',
    'nav.analytics': 'ትንታኔ እና AI መረጃ',
    'nav.audit': 'የቁጥጥር መዝገቦች',
    'nav.institutions': 'የክልል ተቋማት እና ሚዲያዎች',
    'nav.submitReport': '+ አዲስ ዜና ወይም ጥቆማ ላክ',
    'nav.switchPersona': 'ሚና ቀይር',
    'nav.logout': 'ውጣ',
    'nav.login': 'ግባ / ተመዝገብ',
    'nav.language': 'ቋንቋ',
    'nav.english': 'English',
    'nav.amharic': 'አማርኛ',

    // Role Names
    'role.citizen': 'ዜጋ ጋዜጠኛ',
    'role.responsiblePerson': 'የአሚኮ መርማሪ',
    'role.admin': 'የስርዓት አስተዳዳሪ',
    'role.institution': 'የክልል ተቋም / አሳታሚ',
    'role.publisher': 'የክልል ሚዲያ / አሳታሚ',
    'role.guest': 'ያልተመዘገበ ሚስጥራዊ እንግዳ',

    // Login / Auth
    'auth.welcome': 'እንኳን ወደ አሚኮ ፖርታል በደህና መጡ',
    'auth.subtitle': 'የክልሉን ድምፅ እና እውነት ማጠናከር',
    'auth.login': 'ግባ',
    'auth.guestAccess': 'በሚስጥራዊ እንግዳነት ቀጥል',
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

    // Submit Report Modal
    'submit.modalTitle': 'የዜና ሪፖርት ወይም ሚስጥራዊ ጥቆማ ማቅረቢያ',
    'submit.modalSubtitle': 'የአማራ ሚዲያ ኮርፖሬሽን የዜጎች ጋዜጠኝነት እና አስተማማኝ የጥቆማ መግቢያ',
    'submit.completionProgress': 'የቅጽ አሞላል ሂደት፡',
    'submit.stepsCompleted': 'ደረጃዎች ተጠናቀዋል',
    'submit.step1': 'የጥቆማ አይነት እና ምድብ',
    'submit.step2': 'ርዕስ እና ዝርዝር መረጃ',
    'submit.step3': 'ቦታ እና የተከሰተበት ቀን',
    'submit.step4': 'ማስረጃ እና የAI ቅድመ-ግምገማ',
    'submit.anonymousGuestNotice': 'የሚስጥራዊ እንግዳ ጥቆማ አቀራረብ ሁነታ ነቅቷል',
    'submit.confidentialNotice': 'ሚስጥራዊ እና ደህንነቱ የተጠበቀ ጥቆማ',
    'submit.anonymousHint': 'ለቀጣይ ክትትል የሚሆን ልዩ መለያ ቁጥር (Report ID) እና ምስጠራ ያመነጫል።',
    'submit.submitAnonymously': 'በሚስጥር/ያለ ማንነት ላክ',
    'submit.submissionMode': 'የማቅረቢያ ሁነታ',
    'submit.unifiedMode': 'የዜና ሪፖርት እና ሚስጥራዊ ጥቆማ',
    'submit.category': 'የጉዳዩ ምድብ',
    'submit.headline': 'ዋና ርዕስ / የጉዳዩ መጠሪያ',
    'submit.headlinePlaceholder': 'ስለተፈጠረው ክስተት አጭር ገላጭ ርዕስ',
    'submit.description': 'ዝርዝር ማብራሪያ',
    'submit.descPlaceholder': 'ትክክለኛ እና እውነተኛ ዝርዝሮችን ያስገቡ (ከ3 እስከ 1000 ፊደላት)...',
    'submit.descMinWarning': 'ዝርዝር ማብራሪያ ቢያንስ 3 ፊደላት ሊኖሩት ይገባል',
    'submit.descMaxWarning': 'ከፍተኛው የ1000 ፊደላት ገደብ ላይ ደርሰዋል።',
    'submit.preCheckBtn': 'በAI ይገምግሙ',
    'submit.analyzingAi': 'በAI እየተተነተነ ነው...',
    'submit.incidentDate': 'የተከሰተበት ቀን',
    'submit.specificLocation': 'ልዩ ቦታ / ቀበሌ / የመለያ ስፍራ',
    'submit.locPlaceholder': 'ለምሳሌ፡ ቀበሌ 04፣ ከማዕከላዊ ገበያው አጠገብ',
    'submit.evidenceTitle': 'የማስረጃ ፋይል ጫን (ፎቶ፣ ድምፅ፣ ቪዲዮ፣ ፒዲኤፍ - እስከ 100MB)',
    'submit.uploadPrompt': 'ማስረጃ ለማያያዝ እዚህ ጠቅ ያድርጉ ወይም ፋይሎችን ጎትተው ያስቀምጡ',
    'submit.uploading': 'ፋይሉ እየተመረመረ እና እየተጫነ ነው...',
    'submit.submitBtn': 'ሪፖርቱን ወደ አሚኮ ላክ',
    'submit.submittingBtn': 'ወደ አሚኮ በመላክ ላይ ነው...',
    'submit.cancel': 'ሰርዝ',
    'submit.required': 'አስፈላጊ',
    'submit.optional': 'አማራጭ',
    'submit.successTitle': 'የሪፖርት መለያ ቁጥር ተፈጥሯል!',
    'submit.successDesc': 'በ"የእኔ ሪፖርቶች" ውስጥ በቋሚነት ተቀምጧል',
    'submit.copyId': 'መለያ ቁጥር ቅዳ',
    'submit.copied': 'ተቀድቷል!',
    'submit.trackNow': 'አሁን ሪፖርቱን ተከታተል',
    'submit.done': 'ተጠናቋል፣ የእኔ ሪፖርቶችን እይ',

    // AI Assessment Modal & Review
    'ai.assessmentTitle': 'የጄሚኒ AI አውቶማቲክ ግምገማ ውጤቶች',
    'ai.preAnalysisRating': 'የAI ቅድመ-ግምገማ ደረጃ፡ ቅድሚያ',
    'ai.executiveSummary': 'የAI ዋና ማጠቃለያ፡',
    'ai.predictedPriority': 'የተገመተ ቅድሚያ ደረጃ',
    'ai.spamScore': 'የስፓም / ማጭበርበር ስጋት',
    'ai.duplicateScore': 'ተመሳሳይነት ስጋት',
    'ai.categoryMatch': 'የተገመተ ምድብ',
    'ai.offensiveScore': 'አጸያፊ ይዘት ስጋት',
    'ai.verificationGuidance': 'ለመደበኛ መርማሪዎች የቀረበ የማጣሪያ መመሪያ፡',
    'ai.languageDetected': 'የተገኘ ቋንቋ፡',
    'ai.flagged': '(አጠራጣሪ)',
    'ai.clean': '(ንጹህ/እውነተኛ)',
    'ai.noAnalysis': 'ለዚህ ሪፖርት የተዘጋጀ የAI ግምገማ የለም።',
    'ai.keywords': 'የተለዩ ቁልፍ ቃላት እና መለያዎች፡',

    // Admin & Review Modal
    'review.title': 'የአስተዳዳሪ ግምገማ እና ማረጋገጫ',
    'review.subtitle': 'የአሚኮ ማዕከላዊ የይዘት ግምገማ',
    'review.citizenStatus': 'የጥቆማ አቅራቢው ማንነት ሁኔታ',
    'review.revealIdentity': 'የግል ማንነትን አሳይ (በቁጥጥር መዝገብ ይመዘገባል)',
    'review.identityUnlocked': 'ማንነት ተከፍቷል',
    'review.updateStatus': 'ሁኔታ ቀይር',
    'review.assignInvestigator': 'መርማሪ መድብ',
    'review.assignPublisher': 'ለሚዲያ አሳታሚ አስተላልፍ',

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
    'common.priority': 'ቅድሚያ',
    'common.category': 'ምድብ',
    'common.location': 'ቦታ',
    'common.date': 'ቀን',
    'common.actions': 'እርምጃዎች',
    'common.details': 'ዝርዝር መረጃ',
    'common.view': 'ተመልከት',
  },
};

export function getTranslation(lang: Language, key: string, fallback?: string): string {
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  if (translations['en'] && translations['en'][key]) {
    return translations['en'][key];
  }
  return fallback || key;
}
