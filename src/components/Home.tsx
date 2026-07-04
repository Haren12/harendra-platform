/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Hero from "./Hero.js";
import { BlogPost, NewsArticle, Project, Certificate } from "../types.js";
import { 
  Flame, 
  Sparkles, 
  Layers, 
  Award, 
  Send, 
  Mail, 
  CheckCircle, 
  TrendingUp, 
  BookOpen, 
  ArrowRight,
  Code2
} from "lucide-react";

interface HomeProps {
  blogs: BlogPost[];
  news: NewsArticle[];
  projects: Project[];
  certificates: Certificate[];
  lang: "np" | "en";
  setCurrentTab: (tab: string) => void;
  onBookmarkToggle: (type: "blogs" | "news" | "projects", id: string) => void;
  isBookmarked: (type: "blogs" | "news" | "projects", id: string) => boolean;
}

export default function Home({ 
  blogs, 
  news, 
  projects, 
  certificates, 
  lang, 
  setCurrentTab,
  onBookmarkToggle,
  isBookmarked
}: HomeProps) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const featuredProject = projects[0];
  const latestNews = news.slice(0, 2);
  const trendingNews = news.slice(2, 4);
  const latestBlogs = blogs.slice(0, 2);
  const featuredCert = certificates[0];

  const coreSkills = [
    { name: "React 19 / Next.js", level: "95%" },
    { name: "TypeScript / Node.js", level: "92%" },
    { name: "PostgreSQL & Supabase", level: "88%" },
    { name: "RESTful & GraphQL APIs", level: "94%" },
    { name: "System Architecture & Security", level: "85%" },
    { name: "Docker & AWS Deployment", level: "80%" }
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }
  };

  return (
    <div className="space-y-16 pb-16 font-sans">
      {/* Hero Section */}
      <Hero lang={lang} setCurrentTab={setCurrentTab} />

      {/* Grid of Featured Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section 1: Dynamic News & Trending Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Latest News (Left 7 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                  {lang === "np" ? "ताजा मुख्य समाचार" : "Featured Tech Feed"}
                </h2>
              </div>
              <button 
                onClick={() => setCurrentTab("news")}
                className="text-xs font-mono text-cyan-400 hover:opacity-80 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{lang === "np" ? "सबै समाचार" : "View All"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestNews.map((n) => (
                <div 
                  key={n.id}
                  className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 hover:border-cyan-400/30 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded uppercase">
                        {n.category}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">{n.date}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-display font-semibold text-white tracking-tight leading-snug line-clamp-2">
                      {lang === "np" ? n.title_np : n.title_en}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {lang === "np" ? n.summary_np : n.summary_en}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab("news")}
                    className="text-xs text-cyan-400 font-mono flex items-center gap-1.5 hover:opacity-80 pt-3 border-t border-white/5 cursor-pointer"
                  >
                    <span>{lang === "np" ? "थप पढ्नुहोस्" : "Read Article"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Topics (Right 4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                {lang === "np" ? "चर्चित विषयहरू" : "Trending Streams"}
              </h2>
            </div>

            <div className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
              {trendingNews.length > 0 ? (
                trendingNews.map((tn, idx) => (
                  <div 
                    key={tn.id}
                    onClick={() => setCurrentTab("news")}
                    className="flex gap-4 items-start cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                  >
                    <span className="text-xl font-display font-bold text-cyan-500/50 font-mono">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-white tracking-tight line-clamp-2">
                        {lang === "np" ? tn.title_np : tn.title_en}
                      </h4>
                      <span className="text-[9px] font-mono text-gray-500 uppercase">{tn.category}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 font-mono text-center py-6">No trends captured.</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Featured Project & Skills Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Featured Project (Left 7/8 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                  {lang === "np" ? "विशेष परियोजना" : "Spotlight Project"}
                </h2>
              </div>
              <button 
                onClick={() => setCurrentTab("projects")}
                className="text-xs font-mono text-cyan-400 hover:opacity-80 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{lang === "np" ? "सबै परियोजनाहरू" : "Showcase Suite"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {featuredProject && (
              <div className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-cyan-500/20 hover:border-cyan-400/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                {/* Tech Accent Lines */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-400 to-blue-600"></div>

                <div className="pl-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{featuredProject.category}</span>
                    <span className="text-[10px] font-mono text-gray-500">ID: {featuredProject.id}</span>
                  </div>
                  <h3 className="text-xl font-display font-bold text-white tracking-tight">
                    {lang === "np" ? featuredProject.title_np : featuredProject.title_en}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    {lang === "np" ? featuredProject.desc_np : featuredProject.desc_en}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {featuredProject.techStack.map((tech, i) => (
                      <span key={i} className="text-[10px] bg-white/5 border border-white/10 text-gray-300 font-mono px-2.5 py-0.5 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <button
                      onClick={() => setCurrentTab("projects")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs uppercase tracking-wider rounded font-bold cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <span>Explore Case Study</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Core Technology Stack (Right 5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                {lang === "np" ? "मुख्य प्राविधिक क्षमता" : "Core Tech Matrix"}
              </h2>
            </div>

            <div className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
              {coreSkills.map((sk, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-300 font-semibold">{sk.name}</span>
                    <span className="text-cyan-400">{sk.level}</span>
                  </div>
                  <div className="h-1 bg-black/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000"
                      style={{ width: sk.level }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Latest Articles & Selected Certifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Latest Blogs */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                  {lang === "np" ? "नवीनतम ब्लग पोष्टहरू" : "Latest Insights"}
                </h2>
              </div>
              <button 
                onClick={() => setCurrentTab("blog")}
                className="text-xs font-mono text-cyan-400 hover:opacity-80 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{lang === "np" ? "सबै ब्लगहरू" : "Blog Portal"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestBlogs.map((b) => (
                <div 
                  key={b.id}
                  className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 hover:border-purple-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded uppercase">
                        {b.category}
                      </span>
                      <span className="text-gray-500">{b.date}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-display font-semibold text-white tracking-tight line-clamp-2">
                      {lang === "np" ? b.title_np : b.title_en}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {lang === "np" ? b.content_np : b.content_en}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab("blog")}
                    className="text-xs text-purple-400 font-mono flex items-center gap-1.5 hover:opacity-80 pt-3 border-t border-white/5 cursor-pointer"
                  >
                    <span>{lang === "np" ? "लेख पढ्नुहोस्" : "Open Stream"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Certificates */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                {lang === "np" ? "प्रमाणपत्र समीक्षा" : "Verified Credentials"}
              </h2>
            </div>

            {featuredCert && (
              <div className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 hover:border-amber-500/20 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between h-[210px]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase">
                    <span>{featuredCert.issuer}</span>
                    <span className="text-amber-400 font-semibold">{featuredCert.year}</span>
                  </div>
                  <h4 className="text-sm font-display font-semibold text-white leading-snug tracking-tight">
                    {lang === "np" ? featuredCert.title_np : featuredCert.title_en}
                  </h4>
                  <p className="text-[11px] font-mono text-gray-400">
                    ID: <span className="text-amber-400">{featuredCert.credentialId}</span>
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab("certificates")}
                  className="w-full text-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded font-mono text-[10px] text-amber-400 uppercase tracking-widest cursor-pointer"
                >
                  {lang === "np" ? "प्रमाणपत्रहरू र फिल्टर्स" : "Inspect Credentials"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Newsletter Section */}
        <div className="bg-gradient-to-br from-[#151922] to-[#0c0e14] border border-blue-500/20 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono tracking-widest uppercase">
                <Mail className="w-4 h-4" />
                <span>{lang === "np" ? "न्युजलेटर सदस्यता" : "ENTERPRISE TRANSMISSIONS"}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                {lang === "np" ? "नयाँ प्रविधि अपडेटहरू प्राप्त गर्नुहोस्" : "Subscribe to the Technical Dispatch"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl">
                {lang === "np" 
                  ? "हरेन्द्रको पर्सनल टेक्नोलोजी प्लेटफर्मबाट नवीनतम सफ्टवेयर वास्तुकला, एआई विकास रणनीति, र सुरक्षित एपीआई गाईडहरू सिधै तपाईंको इनबक्समा प्राप्त गर्नुहोस्।"
                  : "Receive periodic intelligence reports, systems engineering tutorials, and curated code snapshots curated by Harendra Lamsal."}
              </p>
            </div>

            <div className="md:col-span-5">
              {newsletterSubscribed ? (
                <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 p-5 rounded-xl text-center space-y-2">
                  <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold font-mono">
                    {lang === "np" ? "सफलतापूर्वक दर्ता भयो!" : "SUBSCRIPTION SEALED"}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {lang === "np" ? "नवीनतम अपडेटहरू चाँडै आउनेछन्।" : "Transmission frequency locked. Welcome aboard."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder={lang === "np" ? "तपाईंको इमेल ठेगाना" : "engineer@enterprise.io"}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 focus:border-cyan-400/50 text-white rounded-lg px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs uppercase tracking-wider font-bold px-5 py-3 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === "np" ? "दर्ता गर्नुहोस्" : "Sync"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
