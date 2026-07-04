/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BlogPost } from "../types.js";
import { BookOpen, Calendar, Eye, Clock, ShieldAlert, ArrowRight, X, Terminal, Code, Sparkles, TrendingUp } from "lucide-react";

interface BlogPortalProps {
  blogs: BlogPost[];
  lang: "np" | "en";
}

export default function BlogPortal({ blogs, lang }: BlogPortalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null);

  const categories = ["All", ...Array.from(new Set(blogs.map((b) => b.category)))];

  const filteredBlogs = selectedCategory === "All"
    ? blogs
    : blogs.filter((b) => b.category === selectedCategory);

  // Featured Post: The very first blog post
  const featuredPost = blogs[0];
  
  // Popular posts: sorted by views (excluding featuredPost)
  const popularPosts = [...blogs]
    .filter((b) => b.id !== featuredPost?.id)
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-10">
      
      {/* 1. FEATURED & POPULAR ROW */}
      {selectedCategory === "All" && blogs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Featured Post Highlight (Left 8 columns) */}
          {featuredPost && (
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 animate-spin-slow" />
                <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest">Featured Insight</h3>
              </div>

              <div className="bg-gradient-to-br from-[#121016] to-[#07080b] border border-purple-500/20 hover:border-purple-400/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
                {/* Tech Accent line */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 to-indigo-600"></div>

                <div className="pl-4 space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-gray-500 uppercase">
                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded">
                      {featuredPost.category}
                    </span>
                    <span>{featuredPost.date}</span>
                    <span>•</span>
                    <span>{featuredPost.readTime}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight leading-snug hover:text-purple-400 cursor-pointer transition-colors"
                      onClick={() => setReadingPost(featuredPost)}>
                    {lang === "np" ? featuredPost.title_np : featuredPost.title_en}
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed line-clamp-3">
                    {lang === "np" ? featuredPost.content_np : featuredPost.content_en}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {featuredPost.tags.map((tag) => (
                      <span key={tag} className="text-[9px] font-mono bg-white/5 border border-white/10 text-gray-400 px-2.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setReadingPost(featuredPost)}
                    className="flex items-center gap-1.5 text-xs text-purple-400 font-mono uppercase tracking-wider pt-4 border-t border-white/5 w-full text-left cursor-pointer"
                  >
                    <span>Read Featured Analysis</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Popular Posts list (Right 4 columns) */}
          <div className="lg:col-span-4 bg-[#111218]/40 border border-white/5 rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">Popular Transmissions</h3>
            </div>

            <div className="space-y-4">
              {popularPosts.map((post) => (
                <div 
                  key={post.id}
                  onClick={() => setReadingPost(post)}
                  className="space-y-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors border-b border-white/5 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-center text-[9px] font-mono text-gray-500">
                    <span className="text-purple-400 uppercase">{post.category}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-cyan-400" />
                      <span>{post.views} views</span>
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white tracking-tight leading-snug hover:text-purple-400 transition-colors line-clamp-2">
                    {lang === "np" ? post.title_np : post.title_en}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN GRID HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono tracking-widest uppercase mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === "np" ? "विकासकर्ता ब्लग" : "DEV WORKSPACE KNOWLEDGE"}</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            {lang === "np" ? "प्रोग्रामिङ र कोडिङ ब्लग" : "Programming Blog & Tutorials"}
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

      {/* 3. GRID OF POSTS */}
      {filteredBlogs.length === 0 ? (
        <div className="text-center p-12 bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-2xl">
          <ShieldAlert className="w-10 h-10 text-brand-purple mx-auto mb-3" />
          <p className="text-gray-400 font-mono text-sm">
            {lang === "np" ? "कुनै लेख फेला परेन।" : "No development tutorials registered in this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((b) => (
            <div
              key={b.id}
              className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 hover:border-cyan-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all"
            >
              <div className="space-y-4">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono text-gray-500 uppercase">
                  <span className="text-cyan-400">{b.category}</span>
                  <span>•</span>
                  <span>{b.readTime}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>{b.views} views</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-display font-semibold text-white tracking-tight leading-snug line-clamp-2 hover:text-cyan-400 transition-colors">
                  {lang === "np" ? b.title_np : b.title_en}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {b.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-mono bg-white/5 border border-white/10 text-cyan-400 px-1.5 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Read button & date */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-5">
                <span className="text-[10px] font-mono text-gray-500">{b.date}</span>
                <button
                  onClick={() => setReadingPost(b)}
                  className="flex items-center gap-1 text-xs text-cyan-400 font-mono uppercase tracking-wider cursor-pointer hover:opacity-85"
                >
                  <span>{lang === "np" ? "लेख पढ्नुहोस्" : "Compile"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reader Modal */}
      {readingPost && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-black/40 px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <Terminal className="w-4 h-4" />
                <span className="font-mono text-xs uppercase tracking-wider">
                  {lang === "np" ? "सक्रिय-ट्युटोरियल-कम्पाइलर" : "active-tutorial-compiler"}
                </span>
              </div>
              <button
                onClick={() => setReadingPost(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Meta details */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-gray-400 uppercase">
                <span className="bg-white/5 border border-white/10 text-cyan-400 px-2.5 py-1 rounded">
                  {readingPost.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{readingPost.date}</span>
                </span>
                <span>•</span>
                <span>{readingPost.readTime}</span>
                <span>•</span>
                <span>Author: {readingPost.author}</span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-3xl font-display font-bold text-white tracking-tight leading-snug">
                {lang === "np" ? readingPost.title_np : readingPost.title_en}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {readingPost.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono bg-white/5 border border-white/10 text-cyan-400 px-2.5 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="h-[1px] bg-gradient-to-r from-cyan-400/40 to-transparent"></div>

              {/* Main content body */}
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-4">
                {lang === "np" ? readingPost.content_np : readingPost.content_en}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-black/40 px-6 py-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
              <span>{lang === "np" ? "हरेन्द्र लाम्साल प्राविधिक मञ्च" : "Harendra Lamsal Tech Platform"}</span>
              <span>Primary: harendralamsal.name.np</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
