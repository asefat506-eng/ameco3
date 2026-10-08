import React, { useState } from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Lock,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Send,
  Eye,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  Mail,
  Globe,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  FileSearch,
  Radio,
  FileUp,
} from 'lucide-react';

interface HelpFaqProps {
  onOpenSubmitModal: (type?: 'news' | 'tipoff') => void;
  onNavigateTab: (tab: string) => void;
}

interface FaqItem {
  id: string;
  category: 'submission' | 'privacy' | 'verification' | 'whistleblower';
  question: string;
  answer: string;
  bullets?: string[];
  importantNote?: string;
}

export const HelpFaq: React.FC<HelpFaqProps> = ({ onOpenSubmitModal, onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqIds, setOpenFaqIds] = useState<string[]>(['faq-1', 'faq-2']);

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const faqData: FaqItem[] = [
    {
      id: 'faq-1',
      category: 'submission',
      question: 'How do I submit an incident report or news tip-off to AMECO?',
      answer:
        'Submitting a report is simple and secure. Click the gold "+ Submit Incident" button anywhere in the portal to open the guided submission modal.',
      bullets: [
        'Select Report Classification: Choose between Verified News Report (credited to your Citizen profile) or Confidential Whistleblower Tip-Off (100% identity protected).',
        'Provide Headline & Details: Enter a descriptive title, incident date, and factual description of the occurrence.',
        'Specify Regional Location: Select your Zone (e.g. Central Gondar, South Wollo, North Shewa) and specific Kebele or landmark.',
        'Upload Supporting Evidence: Attach photos, audio clips, video recordings, or PDF documents as verification.',
        'Review & Submit: Your report is immediately processed by Gemini AI for triaging and assigned to a regional editor.',
      ],
    },
    {
      id: 'faq-2',
      category: 'privacy',
      question: 'How does AMECO protect my privacy and anonymity as a Whistleblower?',
      answer:
        'Privacy is our highest priority. The portal employs enterprise-grade cryptographic security to shield your identity.',
      bullets: [
        '256-Bit SSL Encryption: All transmitted data, messages, and uploaded files are encrypted end-to-end.',
        'Masked Citizen IDs: Your real name is hidden behind a randomized ID (e.g., CTZ-4892 or GUEST-1024) across all investigator workbenches.',
        'EXIF Metadata Stripping: All uploaded images and media files have GPS geolocation tags, camera serial numbers, and device metadata automatically removed before storage.',
        'Zero IP Logging on Tip-Offs: Confidential whistleblower tip-offs do not store your IP address or browser fingerprints.',
      ],
      importantNote:
        'If you select "Confidential Tip-Off", even AMECO staff cannot view your real name or personal contact details.',
    },
    {
      id: 'faq-3',
      category: 'submission',
      question: 'Can I submit a report as a Guest without creating an account?',
      answer:
        'Yes! You can select "Guest Access" on the portal login screen. You will be assigned a temporary guest session ID (e.g. GUEST-9102) and can submit urgent incidents immediately without providing a name, email, or phone number.',
    },
    {
      id: 'faq-4',
      category: 'verification',
      question: 'What happens after I submit a report? How is it verified?',
      answer:
        'Once submitted, every report enters the official AMECO Editorial & Verification Workflow:',
      bullets: [
        '1. Gemini AI Automated Triaging: Analyzes text content, assesses urgency/priority, and tags key entities and regional keywords.',
        '2. Department Allocation: Routed to the relevant regional department (e.g., Regional News, Crime & Corruption, Infrastructure, Public Safety).',
        '3. Field Investigator Verification: An assigned AMECO Responsible Person verifies the facts, cross-references evidence, and initiates field investigations.',
        '4. Editorial Review & Media Publication: Verified reports are approved by Chief Editors and published to the public AMECO news stream.',
      ],
    },
    {
      id: 'faq-5',
      category: 'verification',
      question: 'How can I track the progress of my report or talk to the investigator?',
      answer:
        'Go to the "Track My Submissions" tab in the navigation menu. There you can view live milestone progress bars (Submitted → AI Triaged → Under Investigation → Fact-Checked → Published). You can also send 256-bit encrypted messages directly to the assigned investigator.',
    },
    {
      id: 'faq-6',
      category: 'whistleblower',
      question: 'What types of evidence files can I upload?',
      answer:
        'We support JPEG/PNG photos, MP4/MOV videos, MP3/WAV audio recordings, and PDF documents. Maximum upload size per file is 50MB. Multiple files can be attached to a single report.',
    },
    {
      id: 'faq-7',
      category: 'whistleblower',
      question: 'What if I face threats or safety risks related to my report?',
      answer:
        'AMECO operates in strict accordance with Press Freedom laws and Whistleblower Protection standards in Ethiopia. If you suspect any safety risks, immediately mark your submission as "Confidential Tip-Off" and contact our Emergency Protection Hotline.',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Topics', icon: HelpCircle },
    { id: 'submission', label: 'How to Submit', icon: FileUp },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
    { id: 'verification', label: 'Verification Workflow', icon: CheckCircle2 },
    { id: 'whistleblower', label: 'Whistleblower Rights', icon: ShieldAlert },
  ];

  const filteredFaqs = faqData.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (faq.bullets && faq.bullets.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-8 pb-16 font-['Poppins',sans-serif] text-slate-800 dark:text-slate-100">
      {/* Hero Banner Header */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-10 text-slate-900 dark:text-white shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Citizen Knowledgebase & Whistleblower Guide</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            How Can We Help You Report News & Protect Your Identity?
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Find step-by-step instructions on submitting verified citizen journalism, understanding our Gemini AI triaging, and learning how AMECO safeguards whistleblower privacy with 256-bit encryption.
          </p>

          {/* Search Bar */}
          <div className="relative pt-2 max-w-2xl">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics, keywords, or privacy questions..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* 4-Step Submission Workflow Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <FileSearch className="w-5 h-5 text-[#005BAC] dark:text-blue-400" />
              <span>Simple 4-Step Incident Reporting Process</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              From your initial report submission to publication on Amhara Media Corporation channels.
            </p>
          </div>
          <button
            onClick={() => onOpenSubmitModal('tipoff')}
            className="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <Send className="w-4 h-4 text-slate-950" />
            <span>Submit Report Now</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-400 font-mono font-black text-xs flex items-center justify-center border border-blue-200 dark:border-blue-900">
              01
            </div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">1. Choose Report Type</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Select standard <strong>Verified News</strong> or <strong>Confidential Tip-Off</strong> depending on your anonymity needs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-mono font-black text-xs flex items-center justify-center border border-amber-200 dark:border-amber-900">
              02
            </div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">2. Attach Evidence</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload supporting images, video clips, or document files. Geolocation metadata is stripped automatically.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-mono font-black text-xs flex items-center justify-center border border-purple-200 dark:border-purple-900">
              03
            </div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">3. AI Triaging & Allocation</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Gemini AI categorizes your submission and routes it to the designated regional AMECO department.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-mono font-black text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-900">
              04
            </div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">4. Live Progress Tracking</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Track live investigation milestones and send encrypted messages to the assigned investigator.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Category Pills & Accordions Section */}
      <div className="space-y-6">
        {/* Category Filter Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#005BAC] text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQs Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Matching Questions Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Try adjusting your search keywords or switching category filters.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-400 shrink-0 mt-0.5">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 space-y-3 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-200">
                      <p className="leading-relaxed">{faq.answer}</p>

                      {faq.bullets && (
                        <ul className="space-y-2 pl-2">
                          {faq.bullets.map((bullet, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {faq.importantNote && (
                        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-start space-x-2.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            <strong className="font-bold">Important Protection Note:</strong> {faq.importantNote}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Security & Whistleblower Legal Shield Banner */}
      <div className="bg-white dark:bg-black p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-4 text-slate-900 dark:text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                AMECO Citizen Protection & Whistleblower Shield
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Under AMECO editorial charters and digital security protocols, citizen whistleblowers submitting tip-offs are protected with 256-bit encrypted data channels. Your personal info is never sold, disclosed, or shared with external third parties.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenSubmitModal()}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center space-x-2 transition-transform transform hover:-translate-y-0.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>Submit Report & Tip-Off</span>
            </button>
            <button
              onClick={() => onNavigateTab('track')}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Track My Submissions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Contact & Hotline Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-[#005BAC] dark:text-blue-400 font-bold">
            <PhoneCall className="w-4 h-4" />
            <span>Emergency Editorial Hotline</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            For urgent breaking news, safety incidents, or physical threats requiring immediate media attention:
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>+251 58 220 0000 / 991</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-mono">Toll-Free 24/7</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <Mail className="w-4 h-4" />
            <span>Encrypted Whistleblower Email</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Send confidential documentation or high-resolution evidence directly to our investigative unit:
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>tip-off@ameco.et</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-mono">PGP Key Verified</span>
          </div>
        </div>
      </div>

      {/* Official AMECO Social Media Contact Channels */}
      <div className="p-6 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-4 shadow-md dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Globe className="w-4 h-4 text-slate-700 dark:text-amber-400" />
              <span>Official Amhara Media Corporation Social Channels</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Follow and reach out to AMECO across our verified official social media accounts:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Facebook */}
          <a
            href="https://www.facebook.com/AmharaMediaCorporation"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-blue-950/80 border border-slate-200 dark:border-slate-800 hover:border-blue-600/60 transition-all flex items-center space-x-3 group shadow-xs cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-white dark:bg-blue-600/20 border border-slate-200 dark:border-blue-500/30 group-hover:scale-110 transition-transform shrink-0 shadow-xs">
              <svg className="w-5 h-5 fill-current text-blue-600 dark:text-blue-400" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300">Facebook</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[150px]">@AmharaMediaCorporation</div>
            </div>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/ameco.et?igsh=emZ1NXoyNWhyaWtv"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-pink-950/80 border border-slate-200 dark:border-slate-800 hover:border-pink-600/60 transition-all flex items-center space-x-3 group shadow-xs cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-white dark:bg-pink-600/20 border border-slate-200 dark:border-pink-500/30 group-hover:scale-110 transition-transform shrink-0 shadow-xs">
              <svg className="w-5 h-5 fill-current text-pink-600 dark:text-pink-400" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-300">Instagram</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[150px]">@ameco.et</div>
            </div>
          </a>

          {/* YouTube */}
          <a
            href="https://youtube.com/@amharamediacorporation?si=87Asj2M4IWZa9C0h"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-red-950/80 border border-slate-200 dark:border-slate-800 hover:border-red-600/60 transition-all flex items-center space-x-3 group shadow-xs cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-white dark:bg-red-600/20 border border-slate-200 dark:border-red-500/30 group-hover:scale-110 transition-transform shrink-0 shadow-xs">
              <svg className="w-5 h-5 fill-current text-red-600 dark:text-red-400" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-300">YouTube</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[150px]">@amharamediacorporation</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
