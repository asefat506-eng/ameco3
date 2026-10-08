import React, { useState } from 'react';
import {
  UserProfile,
  ReportItem,
  TrendingNewsItem,
  ReportMedia,
  InstitutionSocialChannel,
  SocialPlatform,
} from '../../types';
import { EmbedPlayer } from '../SocialMedia/EmbedPlayer';
import { PlatformIcon } from '../SocialMedia/PlatformIcon';
import { detectPlatformFromUrl } from '../../utils/socialMediaProviders';
import {
  Globe,
  Search,
  Filter,
  Calendar,
  MapPin,
  CheckCircle2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles,
  Newspaper,
  Tag,
  Radio,
  FileCheck,
  Play,
  X,
  BadgeCheck,
  Eye,
} from 'lucide-react';

interface PublishedReportsProps {
  currentUser: UserProfile;
  reports: ReportItem[];
  trendingNews?: TrendingNewsItem[];
  mediaList?: ReportMedia[];
  channels?: InstitutionSocialChannel[];
  onOpenSubmitModal: (type?: 'news' | 'tipoff') => void;
}

export const PublishedReports: React.FC<PublishedReportsProps> = ({
  currentUser,
  reports,
  trendingNews = [],
  mediaList = [],
  channels = [],
  onOpenSubmitModal,
}) => {
  const [activeView, setActiveView] = useState<'all' | 'reports' | 'bulletins'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedMediaPreview, setSelectedMediaPreview] = useState<{
    media: ReportMedia;
    title: string;
    institution?: string;
  } | null>(null);

  // Filter published reports
  const publishedList = reports.filter((r) => r.status === 'Published');

  const categories = [
    'all',
    'Infrastructure & Public Works',
    'Crime, Security & Human Rights',
    'Healthcare & Public Sanitation',
    'Financial Fraud & Corruption',
    'Agriculture, Land & Environment',
    'Education & Youth Services',
  ];

  const zones = [
    'all',
    'Central Gondar',
    'South Gondar',
    'North Wollo',
    'South Wollo',
    'North Shewa',
    'East Gojjam',
    'West Gojjam',
    'Awi',
    'Wag Hemra',
    'Oromia Special Zone',
    'Bahir Dar Special Zone',
  ];

  const filteredReports = publishedList.filter((r) => {
    if (!r) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesQuery =
      !q ||
      (r.id || '').toLowerCase().includes(q) ||
      (r.title || '').toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q) ||
      (r.investigationFindings && (r.investigationFindings || '').toLowerCase().includes(q)) ||
      (r.zone || '').toLowerCase().includes(q) ||
      (r.specificLocation && (r.specificLocation || '').toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesZone = selectedZone === 'all' || r.zone === selectedZone;

    return matchesQuery && matchesCategory && matchesZone;
  });

  const filteredBulletins = trendingNews.filter((news) => {
    if (!news) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    return (
      !q ||
      (news.title || '').toLowerCase().includes(q) ||
      (news.description || '').toLowerCase().includes(q) ||
      (news.institutionName || '').toLowerCase().includes(q) ||
      (news.category || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 text-slate-900 dark:text-white shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>AMECO Verified & Fact-Checked Journalistic Feed</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            Published Citizen Reports & Media Releases
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Explore verified citizen news stories and whistleblower investigations that have passed full AMECO editorial verification, fact-checking, and official media broadcasting across Amhara Region.
          </p>

          {/* View Filter Switcher Tabs */}
          <div className="pt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveView('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              All Publications ({filteredReports.length + filteredBulletins.length})
            </button>
            <button
              onClick={() => setActiveView('reports')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'reports'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Verified Citizen Reports ({filteredReports.length})
            </button>
            <button
              onClick={() => setActiveView('bulletins')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'bulletins'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Institutional Press Bulletins ({filteredBulletins.length})
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search published reports and bulletins..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]"
          />
        </div>

        {/* Category & Zone Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]"
          >
            <option value="all">All Categories</option>
            {categories.filter((c) => c !== 'all').map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#005BAC]"
          >
            <option value="all">All Administrative Zones</option>
            {zones.filter((z) => z !== 'all').map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Institutional Press Bulletins Section */}
      {activeView === 'bulletins' && filteredBulletins.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Institutional Press Bulletins</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Verified institutional press releases and advisories from registered regional bodies will appear here once published.
          </p>
        </div>
      )}

      {(activeView === 'all' || activeView === 'bulletins') && filteredBulletins.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Verified Institutional Press Releases & Advisories</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold font-mono">
              {filteredBulletins.length} Bulletins
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredBulletins.map((news) => {
              const attachedMedia = mediaList.filter(
                (m) => (m.reportId === news.id || m.id === news.id) && m.verificationStatus === 'Verified'
              );
              const primaryMedia = attachedMedia.find((m) => m.isPrimary) || attachedMedia[0];
              const targetSocialUrl =
                news.sourceUrl ||
                primaryMedia?.url ||
                (news.imageUrl &&
                news.imageUrl.startsWith('http') &&
                !news.imageUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i)
                  ? news.imageUrl
                  : undefined);
              const targetPlatform =
                news.socialPlatform ||
                primaryMedia?.platform ||
                (targetSocialUrl ? detectPlatformFromUrl(targetSocialUrl) : null);

              return (
                <div
                  key={news.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-all space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Cover Banner or Fallback Social Banner */}
                    {news.imageUrl ? (
                      <div
                        onClick={() => targetSocialUrl && window.open(targetSocialUrl, '_blank', 'noopener,noreferrer')}
                        className={`h-48 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative ${
                          targetSocialUrl ? 'cursor-pointer group/img' : ''
                        }`}
                      >
                        <img
                          src={news.imageUrl}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector(
                              '.image-error-fallback'
                            ) as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div
                          style={{ display: 'none' }}
                          className="image-error-fallback w-full h-full bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white p-4 flex flex-col justify-between items-start"
                        >
                          <div className="flex items-center space-x-2">
                            {targetPlatform && (
                              <PlatformIcon
                                platform={targetPlatform as SocialPlatform}
                                className="w-5 h-5"
                              />
                            )}
                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                              {news.category}
                            </span>
                          </div>
                          <span className="text-xs font-bold line-clamp-2">{news.title}</span>
                        </div>

                        {targetSocialUrl && (
                          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-sm text-white text-[11px] font-bold flex items-center space-x-1.5 border border-white/20 shadow-md">
                            {targetPlatform && (
                              <PlatformIcon
                                platform={targetPlatform as SocialPlatform}
                                className="w-3.5 h-3.5"
                              />
                            )}
                            <span>Open on {targetPlatform || 'Social Media'}</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => targetSocialUrl && window.open(targetSocialUrl, '_blank', 'noopener,noreferrer')}
                        className={`h-24 w-full rounded-xl bg-gradient-to-br from-[#005BAC]/10 via-blue-600/5 to-indigo-600/10 dark:from-blue-950/40 dark:to-slate-900 border border-blue-100 dark:border-blue-900/40 p-3.5 flex flex-col justify-between ${
                          targetSocialUrl ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            {targetPlatform ? (
                              <PlatformIcon
                                platform={targetPlatform as SocialPlatform}
                                className="w-4 h-4"
                              />
                            ) : (
                              <Radio className="w-4 h-4 text-[#005BAC]" />
                            )}
                            <span className="text-[11px] font-bold text-[#005BAC] dark:text-blue-400">
                              {news.category}
                            </span>
                          </div>
                          {targetPlatform && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase border border-slate-200 dark:border-slate-700">
                              {targetPlatform}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {news.title}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[10px]">
                        {news.category}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{news.publishedAt}</span>
                    </div>

                    <h3
                      onClick={() => targetSocialUrl && window.open(targetSocialUrl, '_blank', 'noopener,noreferrer')}
                      className={`font-extrabold text-slate-900 dark:text-white text-base leading-snug ${
                        targetSocialUrl
                          ? 'hover:text-[#005BAC] dark:hover:text-blue-400 cursor-pointer transition-colors'
                          : ''
                      }`}
                    >
                      {news.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-4">
                      {news.description}
                    </p>

                    {/* Direct Social Media Link Action Button */}
                    {targetSocialUrl && (
                      <div className="pt-2">
                        <a
                          href={targetSocialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-[#005BAC] text-[#005BAC] hover:text-white dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-[#005BAC] dark:hover:text-white border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                        >
                          {targetPlatform && (
                            <PlatformIcon
                              platform={targetPlatform as SocialPlatform}
                              className="w-4 h-4"
                            />
                          )}
                          <span>
                            {targetPlatform === 'youtube'
                              ? 'Watch Official Broadcast on YouTube'
                              : targetPlatform === 'telegram'
                              ? 'Read Full Release on Telegram'
                              : targetPlatform === 'facebook'
                              ? 'View Post on Facebook'
                              : targetPlatform === 'tiktok'
                              ? 'Watch Clip on TikTok'
                              : targetPlatform === 'instagram'
                              ? 'View Story on Instagram'
                              : targetPlatform === 'x'
                              ? 'View Thread on X'
                              : 'Open Official Social Media Link'}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
                        </a>
                      </div>
                    )}

                    {/* Attached Official Media Coverage */}
                    {attachedMedia.length > 0 && (
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <span className="text-[11px] font-bold text-[#005BAC] dark:text-blue-400 flex items-center gap-1">
                          <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                          <span>Official Broadcast & Media Coverage:</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {attachedMedia.map((m) => (
                            <div key={m.id} className="inline-flex items-center gap-1">
                              <button
                                onClick={() =>
                                  setSelectedMediaPreview({
                                    media: m,
                                    title: news.title,
                                    institution: news.institutionName,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-l-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-slate-900 dark:text-white text-xs font-bold border border-blue-200 dark:border-blue-800 cursor-pointer transition-colors shadow-xs"
                                title="Play preview in modal"
                              >
                                <PlatformIcon platform={m.platform} className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[140px]">{m.title}</span>
                                <Play className="w-3 h-3 text-[#005BAC] fill-[#005BAC]" />
                              </button>
                              <a
                                href={m.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1.5 rounded-r-xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/80 dark:hover:bg-blue-800 text-[#005BAC] dark:text-blue-300 border-y border-r border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center"
                                title={`Open ${m.platform} directly in new tab`}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span className="flex items-center space-x-1.5 font-bold text-slate-700 dark:text-zinc-300">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <span>{news.institutionName}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Official Release</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Published Reports Grid */}
      {(activeView === 'all' || activeView === 'reports') && (
        <div className="space-y-4">
          {activeView === 'all' && filteredBulletins.length > 0 && (
            <div className="pt-2 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Verified Investigative Citizen Reports</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">{filteredReports.length} Reports</span>
            </div>
          )}

          {filteredReports.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Published Reports Match Criteria</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Try adjusting your search terms or clearing the zone and category filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => {
                const attachedMedia = mediaList.filter(
                  (m) => (m.reportId === report.id || m.id === report.id) && m.verificationStatus === 'Verified'
                );
                const primaryMedia = attachedMedia.find((m) => m.isPrimary) || attachedMedia[0];
                
                // Find social URL from report fields or primary media
                const evidenceList = report.evidence || [];
                const reportSocialUrl =
                  report.publishedUrl ||
                  (report as any).sourceUrl ||
                  (report as any).socialUrl ||
                  (report as any).broadcastUrl ||
                  primaryMedia?.url ||
                  evidenceList.find((f) => f.url && f.url.startsWith('http') && !f.url.match(/\.(jpeg|jpg|gif|png|webp|svg|pdf)($|\?)/i))?.url;

                const reportPlatform =
                  primaryMedia?.platform ||
                  (reportSocialUrl ? detectPlatformFromUrl(reportSocialUrl) : null);

                // Cover image from report evidence files
                const reportImage =
                  evidenceList.find((f) => f.type === 'image' || (f.url && f.url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i)) || (f.url && f.url.startsWith('data:image')))?.url ||
                  primaryMedia?.thumbnailUrl;

                return (
                  <div
                    key={report.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-[#005BAC]/40 dark:hover:border-blue-500/40"
                  >
                    {/* Visual Card Banner on Published Report */}
                    {reportImage ? (
                      <div
                        onClick={() => {
                          if (reportSocialUrl) {
                            window.open(reportSocialUrl, '_blank', 'noopener,noreferrer');
                          } else if (primaryMedia) {
                            setSelectedMediaPreview({
                              media: primaryMedia,
                              title: report.title,
                              institution: 'Amhara Media Corporation',
                            });
                          }
                        }}
                        className={`h-44 w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden ${
                          reportSocialUrl || primaryMedia ? 'cursor-pointer group/img' : ''
                        }`}
                      >
                        <img
                          src={reportImage}
                          alt={report.title}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.report-banner-fallback') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />

                        {/* Top banner labels */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-900/80 backdrop-blur-md text-emerald-200 border border-emerald-500/40 flex items-center space-x-1 shadow-sm">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Fact-Checked & Published</span>
                          </span>

                          {reportPlatform && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white font-bold uppercase border border-white/20 flex items-center space-x-1">
                              <PlatformIcon platform={reportPlatform as SocialPlatform} className="w-3 h-3" />
                              <span>{reportPlatform}</span>
                            </span>
                          )}
                        </div>

                        {reportSocialUrl && (
                          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-[11px] font-bold flex items-center space-x-1.5 border border-white/20 shadow-md">
                            <span>Open on {reportPlatform || 'Social Media'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        )}

                        {/* Fallback container if image errors */}
                        <div
                          style={{ display: 'none' }}
                          className="report-banner-fallback w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-4 flex flex-col justify-between items-start"
                        >
                          <div className="flex items-center space-x-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-[11px] font-bold text-emerald-300">AMECO Verified Investigation</span>
                          </div>
                          <span className="text-xs font-bold line-clamp-2 text-slate-100">{report.title}</span>
                        </div>
                      </div>
                    ) : (
                      /* Header Gradient Banner for text-based reports */
                      <div
                        onClick={() => {
                          if (reportSocialUrl) {
                            window.open(reportSocialUrl, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className={`h-24 w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-3.5 text-white flex flex-col justify-between relative ${
                          reportSocialUrl ? 'cursor-pointer' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>AMECO Verified Report</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-300 flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{report.incidentDate}</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-blue-200 truncate max-w-[200px]">
                            {report.category}
                          </span>
                          {reportSocialUrl && (
                            <span className="text-[10px] font-bold text-amber-300 flex items-center space-x-1">
                              {reportPlatform && <PlatformIcon platform={reportPlatform as SocialPlatform} className="w-3 h-3" />}
                              <span>Go to Social Media</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        {/* Location & Category Badges */}
                        <div className="flex flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                            <MapPin className="w-3 h-3 text-red-500" />
                            <span>{report.zone}</span>
                          </span>
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-300 text-[11px] font-semibold border border-blue-100 dark:border-blue-900/60">
                            <Tag className="w-3 h-3 text-[#005BAC]" />
                            <span className="truncate max-w-[160px]">{report.category}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug">
                          {report.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                          {report.description}
                        </p>

                        {/* Editorial Investigation Findings */}
                        {report.investigationFindings && (
                          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs space-y-1">
                            <span className="font-bold text-[11px] text-[#005BAC] dark:text-blue-300 flex items-center space-x-1">
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Editorial Verification Summary:</span>
                            </span>
                            <p className="text-slate-700 dark:text-slate-300 line-clamp-2 text-[11px] leading-relaxed">
                              {report.investigationFindings}
                            </p>
                          </div>
                        )}

                        {/* Attached Official Media Coverage for Report */}
                        {attachedMedia.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                            <span className="text-[10px] font-bold text-[#005BAC] dark:text-blue-400 flex items-center gap-1">
                              <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                              <span>Official Broadcast Media:</span>
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {attachedMedia.map((m) => (
                                <div key={m.id} className="inline-flex items-center">
                                  <button
                                    onClick={() =>
                                      setSelectedMediaPreview({
                                        media: m,
                                        title: report.title,
                                        institution: m.authorName || 'Amhara Media Corporation',
                                      })
                                    }
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-l-lg bg-slate-100 hover:bg-blue-50 dark:bg-zinc-800 dark:hover:bg-blue-950 text-slate-800 dark:text-slate-200 text-[11px] font-bold border border-slate-200 dark:border-zinc-700 cursor-pointer transition-colors"
                                  >
                                    <PlatformIcon platform={m.platform} className="w-3 h-3" />
                                    <span className="truncate max-w-[110px]">{m.title}</span>
                                    <Play className="w-2.5 h-2.5 text-[#005BAC]" />
                                  </button>
                                  <a
                                    href={m.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-1.5 py-1 rounded-r-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-[#005BAC] dark:text-blue-200 border-y border-r border-slate-200 dark:border-zinc-700 text-[11px] flex items-center"
                                    title={`Open ${m.platform} in new tab`}
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Direct Social Media Action Link Button */}
                      {reportSocialUrl && (
                        <div className="pt-3">
                          <a
                            href={reportSocialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-[#005BAC] text-[#005BAC] hover:text-white dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-[#005BAC] dark:hover:text-white border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
                          >
                            {reportPlatform && (
                              <PlatformIcon platform={reportPlatform as SocialPlatform} className="w-3.5 h-3.5" />
                            )}
                            <span>Open Broadcast on {reportPlatform ? reportPlatform.toUpperCase() : 'Social Media'}</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="p-4 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] text-slate-400">ID: {report.id}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Broadcasted News</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* POPUP MEDIA VIEWER MODAL */}
      {selectedMediaPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={selectedMediaPreview.media.platform} className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Official {selectedMediaPreview.media.platform} Publication
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                    <BadgeCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified Source</span>
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                  {selectedMediaPreview.media.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMediaPreview(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Embedded Player */}
            <div className="py-1">
              <EmbedPlayer media={selectedMediaPreview.media} className="rounded-xl overflow-hidden shadow-md" />
            </div>

            {selectedMediaPreview.media.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                {selectedMediaPreview.media.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 font-medium">
                Related to: <strong className="text-slate-800 dark:text-white">{selectedMediaPreview.title}</strong>
              </span>
              <a
                href={selectedMediaPreview.media.url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <span>Open Original Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
