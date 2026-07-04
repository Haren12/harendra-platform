/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { NewsArticle } from "../types.js";
import { Globe, Calendar, User, ArrowRight, ShieldAlert, X, Terminal, Flame, Zap, TrendingUp } from "lucide-react";

interface NewsPortalProps {
  news: NewsArticle[];
  lang: "np" | "en";
}

export default function NewsPortal({ news, lang }: NewsPortalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);

  const categories = ["All", ...Array.from(new Set(news.map((n) => n.category)))];

  const filteredNews = selectedCategory === "All"
    ? news
    : news.filter((n) => n.category === selectedCategory);

  const breakingNews = news[0];
  const trendingNews = news.slice(1, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-8">
      
      {/* 1. BREAKING NEWS BANNER */}
      {breakingNews && (
        <div className="bg-gradient-to-r from-[#1d1b16] via-[#111218] to-[#07080b] border border-amber-500/20 rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden shadow-lg animate-pulse">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-500 to-yellow-600"></div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-amber-500 text-black font-mono text-[10px] font-bold uppercase rounded-lg tracking-widest flex items-center gap-1 shrink-0">
              <Zap className="w-3.5 h-3.5" />
              <span>{lang === "np" ? "ताजा खबर" : "BREAKING TELEMETRY"}</span>
            </div>
            
            <p 
              onClick={() => setReadingArticle(breakingNews)}
              className="text-xs sm:text-sm font-semibold text-white tracking-tight cursor-pointer hover:text-amber-400 line-clamp-1 transition-colors"
            >
              {lang === "np" ? breakingNews.title_np : breakingNews.title_en}
            </p>
          </div>

          <button
            onClick={() => setReadingArticle(breakingNews)}
            className="text-xs font-mono text-amber-400 hover:opacity-80 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>{lang === "np" ? "अहिले हेर्नुहोस्" : "Sync Stream"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. SECTION TITLE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono tracking-widest uppercase mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === "np" ? "प्रविधि समाचार पोर्टल" : "ENTERPRISE NEWS TELEMETRY"}</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">
            {lang === "np" ? "नवीनतम प्रविधि समाचार" : "Modern Tech News Portal"}
          </h2>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-white/5 text-cyan-400 border border-white/10 shadow-sm"
                  : "bg-transparent border border-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. GRID CONTENT: NEWS ARTICLES LIST + TRENDING COLUMN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main News stream (Left 8/9 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {filteredNews.length === 0 ? (
            <div className="text-center p-12 bg-[#111218] border border-white/10 rounded-2xl">
              <ShieldAlert className="w-10 h-10 text-brand-purple mx-auto mb-3" />
              <p className="text-gray-400 font-mono text-sm">
                {lang === "np" ? "कुनै समाचार फिड फेला परेन।" : "No news telemetries captured in this category."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNews.map((n) => (
                <div
                  key={n.id}
                  className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 hover:border-cyan-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-gray-500 uppercase">
                      <span className="bg-white/5 border border-white/10 text-cyan-400 px-2 py-0.5 rounded">
                        {n.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{n.date}</span>
                      </span>
                      <span>|</span>
                      <span>{n.source}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-display font-semibold text-white tracking-tight leading-snug line-clamp-2">
                      {lang === "np" ? n.title_np : n.title_en}
                    </h3>

                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {lang === "np" ? n.summary_np : n.summary_en}
                    </p>
                  </div>

                  <button
                    onClick={() => setReadingArticle(n)}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono tracking-wider uppercase mt-5 cursor-pointer hover:opacity-80 pt-3 border-t border-white/5 w-full text-left"
                  >
                    <span>{lang === "np" ? "पूर्ण समाचार पढ्नुहोस्" : "Read Full Stream"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending Column (Right 4 Columns) */}
        <div className="lg:col-span-4 bg-[#111218]/40 border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">Trending Feeds</h3>
          </div>

          <div className="space-y-4">
            {trendingNews.map((tn, idx) => (
              <div 
                key={tn.id}
                onClick={() => setReadingArticle(tn)}
                className="flex gap-4 items-start cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors border-b border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-lg font-display font-bold text-cyan-500/30 font-mono">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-white tracking-tight leading-snug line-clamp-2 hover:text-cyan-400 transition-colors">
                    {lang === "np" ? tn.title_np : tn.title_en}
                  </h4>
                  <span className="text-[9px] font-mono text-gray-500 uppercase">{tn.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Reader Modal */}
      {readingArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-black/40 px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <Terminal className="w-4 h-4" />
                <span className="font-mono text-xs uppercase tracking-wider">
                  {lang === "np" ? "समाचार-प्रवाह-सक्रिय" : "news-stream-active"}
                </span>
              </div>
              <button
                onClick={() => setReadingArticle(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Meta information */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-gray-400 uppercase">
                <span className="bg-white/5 border border-white/10 text-cyan-400 px-2.5 py-1 rounded">
                  {readingArticle.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{readingArticle.date}</span>
                </span>
                <span>|</span>
                <span>{readingArticle.source}</span>
              </div>

              {/* Headline */}
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight leading-snug">
                {lang === "np" ? readingArticle.title_np : readingArticle.title_en}
              </h1>

              {/* Line break */}
              <div className="h-[1px] bg-gradient-to-r from-cyan-400/40 to-transparent"></div>

              {/* Content body */}
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-4">
                {lang === "np" ? readingArticle.content_np : readingArticle.content_en}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-black/40 px-6 py-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
              <span>{lang === "np" ? "हरेन्द्र लाम्साल प्रविधि मञ्च" : "Harendra Lamsal Tech Platform"}</span>
              <span>Primary: harendralamsal.name.np</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
