/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Tutorial, Comment, UserSession } from "../types.js";
import { 
  BookOpen, 
  Search, 
  Terminal, 
  Calendar, 
  User, 
  Download, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  MessageSquare, 
  Copy, 
  Check, 
  ChevronRight, 
  ArrowLeft,
  X,
  Play
} from "lucide-react";

interface TutorialsPortalProps {
  tutorials: Tutorial[];
  lang: "np" | "en";
  userSession: UserSession;
  onBookmarkToggle: (type: "blogs" | "news" | "projects" | "tutorials", id: string) => void;
  isBookmarked: (type: "blogs" | "news" | "projects" | "tutorials", id: string) => boolean;
  onAddComment: (tutorialId: string, authorName: string, authorEmail: string, content: string) => Promise<Comment | null>;
}

export default function TutorialsPortal({
  tutorials,
  lang,
  userSession,
  onBookmarkToggle,
  isBookmarked,
  onAddComment
}: TutorialsPortalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>(" ");
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  
  // Interactive copy triggers
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [simulatingDemo, setSimulatingDemo] = useState<boolean>(false);

  // New Comment form
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const categories = [
    "All",
    "Frontend Development",
    "Backend Development",
    "React Tutorials",
    "Supabase Tutorials",
    "API Development",
    "Deployment Guides"
  ];

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const filteredTutorials = tutorials.filter((t) => {
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch = trimmedQuery === "" || 
      t.title_en.toLowerCase().includes(trimmedQuery) ||
      t.title_np.toLowerCase().includes(trimmedQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(trimmedQuery));
    return matchesCategory && matchesSearch;
  });

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = (tutId: string) => {
    setDownloading(tutId);
    setTimeout(() => {
      setDownloading(null);
      alert(lang === "np" 
        ? "डाउनलोड सुरु भयो: स्रोत कोड जिप फाइल स्थानीय स्टोरेजमा सुरक्षित गरिएको छ।" 
        : "Asset transmission complete. Project archive (.zip) downloaded successfully.");
    }, 1500);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !selectedTutorial) return;

    if (userSession.role === "guest") {
      alert(lang === "np" 
        ? "टिप्पणी गर्न कृपया आफ्नो भूमिका 'Registered' वा 'Admin' मा अपग्रेड गर्नुहोस् (Navbar को प्रयोगकर्ता मेनु मार्फत)।" 
        : "Access Denied: Please upgrade your role to Registered or Admin in the user profile menu to comment.");
      return;
    }

    setSubmittingComment(true);
    try {
      const newComm = await onAddComment(
        selectedTutorial.id,
        userSession.name || "Anonymous Developer",
        userSession.email || "dev@harendralamsal.name.np",
        commentContent
      );

      if (newComm) {
        // Optimistic UI updates
        const updatedTutorial = {
          ...selectedTutorial,
          comments: [...(selectedTutorial.comments || []), newComm]
        };
        setSelectedTutorial(updatedTutorial);
        setCommentContent("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {!selectedTutorial ? (
        // LIST VIEW
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono tracking-widest uppercase mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lang === "np" ? "ट्युटोरियल प्लेटफर्म" : "LEARNING BLUEPRINTS"}</span>
              </div>
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                {lang === "np" ? "चरण-दर-चरण सिक्नुहोस्" : "Step-by-Step Technology Guides"}
              </h2>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder={lang === "np" ? "ट्युटोरियल वा ट्याग खोज्नुहोस्..." : "Search courses or tags..."}
                value={searchQuery === " " ? "" : searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111218] border border-white/10 focus:border-cyan-400 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Categories bar */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-white/5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-white/5 text-cyan-400 border border-white/10 shadow-sm"
                    : "bg-transparent border border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredTutorials.length === 0 ? (
            <div className="text-center p-12 bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-2xl">
              <Terminal className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-mono text-sm">
                {lang === "np" ? "कुनै ट्युटोरियल फेला परेन।" : "No step-by-step guides matches your filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTutorials.map((t) => {
                const bookmarked = isBookmarked("tutorials", t.id);
                return (
                  <div
                    key={t.id}
                    className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 hover:border-cyan-500/20 rounded-2xl p-6 flex flex-col justify-between shadow-lg transition-all"
                  >
                    <div className="space-y-4">
                      {/* Meta info */}
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/10 px-2.5 py-0.5 rounded uppercase">
                          {t.category}
                        </span>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">{t.readTime}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onBookmarkToggle("tutorials", t.id);
                            }}
                            className="text-gray-400 hover:text-cyan-400 cursor-pointer p-1"
                          >
                            {bookmarked ? (
                              <BookmarkCheck className="w-4 h-4 text-cyan-400" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-display font-semibold text-white tracking-tight">
                        {lang === "np" ? t.title_np : t.title_en}
                      </h3>

                      {/* Display first step content preview */}
                      {t.steps[0] && (
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                          {lang === "np" ? t.steps[0].content_np : t.steps[0].content_en}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {t.tags.map((tag) => (
                          <span key={tag} className="text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-white/5 mt-5">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                        <User className="w-3.5 h-3.5 text-brand-purple" />
                        <span>{t.author}</span>
                      </div>

                      <button
                        onClick={() => setSelectedTutorial(t)}
                        className="flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-400 font-mono text-xs uppercase tracking-wider rounded font-bold cursor-pointer transition-all"
                      >
                        <span>Start Blueprint</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // DYNAMIC STEP BY STEP DETAILS VIEW
        <div className="space-y-8">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedTutorial(null)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white font-mono uppercase cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Listing</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onBookmarkToggle("tutorials", selectedTutorial.id)}
                className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-gray-300 hover:text-cyan-400 cursor-pointer transition-colors"
                title="Bookmark tutorial"
              >
                {isBookmarked("tutorials", selectedTutorial.id) ? (
                  <BookmarkCheck className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => handleDownload(selectedTutorial.id)}
                disabled={downloading !== null}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600 text-white font-mono text-xs uppercase tracking-wider rounded-xl font-bold cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading === selectedTutorial.id ? "Bundling..." : "Download Archives"}</span>
              </button>

              <button
                onClick={() => setSimulatingDemo(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600 text-white font-mono text-xs uppercase tracking-wider rounded-xl font-bold cursor-pointer transition-all"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate Demo</span>
              </button>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Steps stream (Left 8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-2.5 py-1 rounded">
                  {selectedTutorial.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white leading-snug tracking-tight">
                  {lang === "np" ? selectedTutorial.title_np : selectedTutorial.title_en}
                </h1>
                
                <div className="flex items-center gap-4 text-xs font-mono text-gray-500 pt-1 border-b border-white/5 pb-4">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Author: {selectedTutorial.author}</span>
                  </span>
                  <span>|</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Issued: {selectedTutorial.date}</span>
                  </span>
                  <span>|</span>
                  <span>{selectedTutorial.readTime}</span>
                </div>
              </div>

              {/* Step cards */}
              <div className="space-y-10">
                {selectedTutorial.steps.map((step, idx) => (
                  <div 
                    key={idx}
                    className="space-y-4 bg-[#0a0a0c]/60 border border-white/5 p-6 rounded-2xl relative"
                  >
                    {/* Index Counter */}
                    <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-gray-500">
                      {String(idx + 1).padStart(2, "0")}
                    </div>

                    <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight leading-snug pr-12">
                      {lang === "np" ? step.title_np : step.title_en}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                      {lang === "np" ? step.content_np : step.content_en}
                    </p>

                    {/* Step code snippet block */}
                    {step.codeSnippet && (
                      <div className="bg-black/80 rounded-xl border border-white/10 overflow-hidden font-mono text-xs">
                        <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between text-[10px] text-gray-400 uppercase">
                          <span>{step.language || "typescript"}</span>
                          <button
                            onClick={() => handleCopyCode(step.codeSnippet!, idx)}
                            className="flex items-center gap-1 cursor-pointer text-cyan-400 hover:text-white"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-gray-300 leading-relaxed">
                          <code>{step.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* COMMENT THREADS */}
              <div className="space-y-6 pt-10 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xl font-display font-bold text-white tracking-tight">
                    {lang === "np" ? "टिप्पणी समुदाय" : "Discussion Thread"}
                  </h3>
                </div>

                {/* Inline Comment submit form */}
                <form onSubmit={handleCommentSubmit} className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-3">
                  <textarea
                    rows={3}
                    required
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder={lang === "np" ? "आफ्नो टिप्पणी लेख्नुहोस् (भूमिका 'Registered' हुनुपर्छ)..." : "Specify comment feedback (Requires role Registered or Admin)..."}
                    className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/50 text-white rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-500">
                      Signed in as: <span className="text-cyan-400">{userSession.role}</span>
                    </span>
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-mono text-xs uppercase tracking-wider font-bold rounded-lg cursor-pointer transition-all"
                    >
                      {submittingComment ? "Submitting..." : "Submit Comment"}
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {(selectedTutorial.comments && selectedTutorial.comments.length > 0) ? (
                    selectedTutorial.comments.map((comm) => (
                      <div 
                        key={comm.id}
                        className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2 text-xs"
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-cyan-400 font-semibold">{comm.authorName}</span>
                          <span className="text-gray-500">{comm.date}</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed font-sans">{comm.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-mono text-gray-500 text-center py-4">No discussions recorded on this blueprint yet.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Sidebar quick jumping index map (Right 4 columns) */}
            <div className="lg:col-span-4 bg-[#111218] border border-white/10 rounded-2xl p-5 space-y-5 lg:sticky lg:top-24">
              <div className="space-y-1">
                <h4 className="text-xs font-mono text-gray-500 uppercase">Interactive Navigation</h4>
                <p className="text-sm font-display font-semibold text-white">Course Syllabus Map</p>
              </div>

              <div className="space-y-2">
                {selectedTutorial.steps.map((step, idx) => (
                  <div 
                    key={idx}
                    className="flex gap-3 items-center p-2.5 rounded-lg border border-white/5 bg-black/20 hover:border-cyan-500/20 cursor-pointer transition-all text-xs"
                  >
                    <span className="text-[10px] font-mono font-bold text-cyan-400">{String(idx+1).padStart(2, "0")}</span>
                    <span className="text-gray-300 line-clamp-1">{lang === "np" ? step.title_np : step.title_en}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/10 text-xs text-gray-400 space-y-1">
                <span className="font-bold text-cyan-400 uppercase text-[10px] tracking-wider block mb-1">Ecosystem Integration</span>
                <p>This module resides inside Harendra Lamsal's Personal Technology Platform as a secured telemetry node. Use bookmarks to save this to your account.</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SIMULATED LIVE PREVIEW MODAL */}
      {simulatingDemo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0c] border border-cyan-400/30 rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden box-glow-cyan">
            {/* Header */}
            <div className="bg-black/80 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs uppercase tracking-widest text-white/80">Simulating Runtime Environment</span>
              </div>
              <button
                onClick={() => setSimulatingDemo(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Live View Body */}
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-[#111218] border border-white/15 p-5 font-mono text-xs space-y-3">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Local Server listening: http://localhost:3000/demo-preview</span>
                </div>

                <div className="h-[200px] border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-center p-4 bg-black/40">
                  <Play className="w-8 h-8 text-cyan-400 mb-2 animate-bounce" />
                  <h4 className="text-sm font-semibold text-white tracking-tight">{lang === "np" ? "लाइभ पूर्वावलोकन सिमुलेशन" : "Reactive Code Sandbox Running"}</h4>
                  <p className="text-[11px] text-gray-400 max-w-sm mt-1">
                    {lang === "np" 
                      ? "यो ट्युटोरियलको प्रतिक्रियात्मक कम्पोनेन्ट पूर्वावलोकन सफलतापूर्वक सिमुलेट भइरहेको छ!" 
                      : "The real-time database subscription algorithm is successfully receiving mock telemetry frames on port 3000."}
                  </p>
                  
                  {/* Fake log line */}
                  <div className="mt-4 p-2.5 rounded bg-black border border-white/5 text-[10px] text-emerald-400 w-full text-left line-clamp-1">
                    &gt; [supabase-changes] Realtime sync: INSERT public.messages id=90210
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-black/60 px-6 py-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
              <span>Primary Engine: harendralamsal.name.np</span>
              <button
                onClick={() => setSimulatingDemo(false)}
                className="text-xs text-cyan-400 hover:opacity-80 font-bold uppercase cursor-pointer"
              >
                Close Sandbox
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
