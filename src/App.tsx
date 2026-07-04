/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import TechBackground from "./components/TechBackground.js";
import Navbar from "./components/Navbar.js";
import Home from "./components/Home.js";
import Portfolio from "./components/Portfolio.js";
import PortfolioPortal from "./components/PortfolioPortal.js";
import NewsPortal from "./components/NewsPortal.js";
import BlogPortal from "./components/BlogPortal.js";
import TutorialsPortal from "./components/TutorialsPortal.js";
import Certificates from "./components/Certificates.js";
import AboutPortal from "./components/AboutPortal.js";
import ContactPortal from "./components/ContactPortal.js";
import CMSDashboard from "./components/CMSDashboard.js";
import AIAssistant from "./components/AIAssistant.js";

import { BlogPost, NewsArticle, Project, Certificate, CodeSnippet, Tutorial, UserSession, Comment } from "./types.js";
import { RefreshCw, Cpu, Code } from "lucide-react";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient.js";
import { initialBlogs, initialNews, initialProjects, initialCertificates, initialTutorials } from "./data/initialData.js";

export default function App() {
  // Dynamic Tab Routing based on window location pathname
  const getInitialTab = (): string => {
    if (typeof window === "undefined") return "home";
    const path = window.location.pathname.replace(/^\/|\/$/g, "").toLowerCase();
    const validTabs = ["home", "news", "blog", "tutorials", "projects", "portfolio", "certificates", "about", "contact", "cms"];
    return validTabs.includes(path) ? path : "home";
  };

  const [lang, setLang] = useState<"np" | "en">("np"); // Default language: Nepali
  const [currentTab, setCurrentTabState] = useState<string>(getInitialTab);

  // Synchronize Tab State with browser pathname
  const setCurrentTab = (tab: string) => {
    setCurrentTabState(tab);
    const newPath = tab === "home" ? "/" : `/${tab}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, "", newPath);
    }
  };

  // Keep track of browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/|\/$/g, "").toLowerCase();
      const validTabs = ["home", "news", "blog", "tutorials", "projects", "portfolio", "certificates", "about", "contact", "cms"];
      setCurrentTabState(validTabs.includes(path) ? path : "home");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Global Data Store
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // User Authentication / Simulation Session state
  const [userSession, setUserSession] = useState<UserSession>({
    role: "guest",
    name: "Guest User",
    email: "guest@harendralamsal.name.np",
    bookmarks: {
      blogs: [],
      news: [],
      tutorials: [],
      projects: []
    },
    subscribed: false
  });

  const fetchGlobalData = async () => {
    try {
      let fetchedBlogs: BlogPost[] = [];
      let fetchedNews: NewsArticle[] = [];
      let fetchedProjects: Project[] = [];
      let fetchedCertificates: Certificate[] = [];
      let fetchedTutorials: Tutorial[] = [];

      if (isSupabaseConfigured && supabase) {
        try {
          // Fetch Blogs
          const { data: blogData, error: blogErr } = await supabase
            .from("blog_posts")
            .select("*, comments(*)");
          if (!blogErr && blogData) {
            fetchedBlogs = blogData.map((b: any) => ({
              ...b,
              tags: typeof b.tags === "string" ? JSON.parse(b.tags) : b.tags || [],
              comments: b.comments || []
            }));
          }

          // Fetch News
          const { data: newsData, error: newsErr } = await supabase
            .from("news_articles")
            .select("*, comments(*)");
          if (!newsErr && newsData) {
            fetchedNews = newsData.map((n: any) => ({
              ...n,
              comments: n.comments || []
            }));
          }

          // Fetch Projects
          const { data: projectData, error: projectErr } = await supabase
            .from("projects")
            .select("*");
          if (!projectErr && projectData) {
            fetchedProjects = projectData.map((p: any) => ({
              ...p,
              techStack: typeof p.techStack === "string" ? JSON.parse(p.techStack) : p.techStack || [],
              features_en: typeof p.features_en === "string" ? JSON.parse(p.features_en) : p.features_en || [],
              features_np: typeof p.features_np === "string" ? JSON.parse(p.features_np) : p.features_np || []
            }));
          }

          // Fetch Certificates
          const { data: certData, error: certErr } = await supabase
            .from("certificates")
            .select("*");
          if (!certErr && certData) {
            fetchedCertificates = certData;
          }

          // Fetch Tutorials
          const { data: tutorialData, error: tutorialErr } = await supabase
            .from("tutorials")
            .select("*, comments(*)");
          if (!tutorialErr && tutorialData) {
            fetchedTutorials = tutorialData.map((t: any) => ({
              ...t,
              steps: typeof t.steps === "string" ? JSON.parse(t.steps) : t.steps || [],
              tags: typeof t.tags === "string" ? JSON.parse(t.tags) : t.tags || [],
              comments: t.comments || []
            }));
          }
        } catch (supabaseFetchErr) {
          console.error("Failed to query Supabase directly, falling back to local data:", supabaseFetchErr);
        }
      }

      // Merge and fallback to high-fidelity initial data if Supabase is unconfigured or empty
      setBlogs(fetchedBlogs.length > 0 ? fetchedBlogs : initialBlogs);
      setNews(fetchedNews.length > 0 ? fetchedNews : initialNews);
      setProjects(fetchedProjects.length > 0 ? fetchedProjects : initialProjects);
      setCertificates(fetchedCertificates.length > 0 ? fetchedCertificates : initialCertificates);
      setTutorials(fetchedTutorials.length > 0 ? fetchedTutorials : initialTutorials);
      setError(null);
    } catch (err: any) {
      console.error(err);
      // Ensure we always load fallback data and never show connection warning screen
      setBlogs(initialBlogs);
      setNews(initialNews);
      setProjects(initialProjects);
      setCertificates(initialCertificates);
      setTutorials(initialTutorials);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();

    // Check user session on startup
    const checkUserAndSession = async () => {
      const { supabase } = await import("./lib/supabaseClient.js");
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user) {
            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .maybeSingle();

            const role = roleData?.role;
            const isSuperAdminOrAdmin = role === "Super_Admin" || role === "Admin" || session.user.email === "harendralamsal4140@gmail.com";

            setUserSession({
              role: isSuperAdminOrAdmin ? "admin" : "registered",
              name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Authenticated User",
              email: session.user.email || "",
              bookmarks: { blogs: [], news: [], tutorials: [], projects: [] },
              subscribed: false
            });
          } else {
            // If no authenticated session exists, set guest profile. No forced redirect.
            setUserSession({
              role: "guest",
              name: "Guest User",
              email: "guest@harendralamsal.name.np",
              bookmarks: { blogs: [], news: [], tutorials: [], projects: [] },
              subscribed: false
            });
          }
        } catch (err) {
          console.error("Startup auth check failed:", err);
        }
      }
    };

    checkUserAndSession();

    // Listen for auth changes
    let authSubscription: any = null;
    const setupAuthListener = async () => {
      const { supabase } = await import("./lib/supabaseClient.js");
      if (supabase) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session && session.user) {
            try {
              const { data: roleData } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", session.user.id)
                .maybeSingle();

              const role = roleData?.role;
              const isSuperAdminOrAdmin = role === "Super_Admin" || role === "Admin" || session.user.email === "harendralamsal4140@gmail.com";

              setUserSession({
                role: isSuperAdminOrAdmin ? "admin" : "registered",
                name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Authenticated User",
                email: session.user.email || "",
                bookmarks: { blogs: [], news: [], tutorials: [], projects: [] },
                subscribed: false
              });
            } catch (err) {
              console.error("Error updating session in auth change listener:", err);
            }
          } else {
            setUserSession({
              role: "guest",
              name: "Guest User",
              email: "guest@harendralamsal.name.np",
              bookmarks: { blogs: [], news: [], tutorials: [], projects: [] },
              subscribed: false
            });
          }
        });
        authSubscription = subscription;
      }
    };

    setupAuthListener();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    const { supabase } = await import("./lib/supabaseClient.js");
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Supabase signOut error:", err);
      }
    }
    setUserSession({
      role: "guest",
      name: "Guest User",
      email: "guest@harendralamsal.name.np",
      bookmarks: { blogs: [], news: [], tutorials: [], projects: [] },
      subscribed: false
    });
    localStorage.clear();
    sessionStorage.clear();
    setCurrentTab("cms"); // Redirect to CMS/Login page
  };

  const handleBookmarkToggle = (type: "blogs" | "news" | "projects" | "tutorials", id: string) => {
    setUserSession((prev) => {
      const currentList = prev.bookmarks[type] || [];
      const updatedList = currentList.includes(id)
        ? currentList.filter((item) => item !== id)
        : [...currentList, id];
      return {
        ...prev,
        bookmarks: {
          ...prev.bookmarks,
          [type]: updatedList
        }
      };
    });
  };

  const isBookmarked = (type: "blogs" | "news" | "projects" | "tutorials", id: string) => {
    return userSession.bookmarks[type]?.includes(id) || false;
  };

  const handleAddComment = async (
    tutorialId: string,
    authorName: string,
    authorEmail: string,
    content: string
  ): Promise<Comment | null> => {
    try {
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        authorName,
        authorEmail,
        content,
        date: new Date().toISOString().split("T")[0]
      };

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("comments").insert([
          {
            tutorial_id: tutorialId,
            content: content,
            user_id: null // guest comment
          }
        ]);
        if (error) {
          console.error("Failed to insert comment into Supabase:", error);
        }
      }

      // Instantly update the local state for an ultra-responsive interface!
      setTutorials((prev) =>
        prev.map((t) => {
          if (t.id === tutorialId) {
            return {
              ...t,
              comments: [...(t.comments || []), newComment]
            };
          }
          return t;
        })
      );

      return newComment;
    } catch (err) {
      console.error("Error in handleAddComment:", err);
    }
    return null;
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden text-gray-200">
      {/* Immersive background layer */}
      <TechBackground />

      {/* Header Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        userSession={userSession}
        setUserSession={setUserSession}
        onLogout={handleLogout}
      />

      {/* Main Core View Area */}
      <main className="flex-1">
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
            <div className="text-sm font-mono text-cyan-400 uppercase tracking-widest animate-pulse">
              {lang === "np" ? "डाटाबेस जडान र बुट हुँदैछ..." : "CONNECTING TO SECURE ENGINE..."}
            </div>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto my-16 bg-red-950/20 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center space-y-4">
            <div className="text-xl font-display font-semibold">Engine Status Warning</div>
            <p className="text-xs font-mono">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchGlobalData();
              }}
              className="bg-cyan-400 hover:opacity-90 text-black px-4 py-2 rounded text-xs font-mono cursor-pointer transition-colors"
            >
              Retry Handshake
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            {currentTab === "home" && (
              <Home 
                blogs={blogs}
                news={news}
                projects={projects}
                certificates={certificates}
                lang={lang}
                setCurrentTab={setCurrentTab}
                onBookmarkToggle={handleBookmarkToggle}
                isBookmarked={isBookmarked}
              />
            )}
            {currentTab === "projects" && (
              <Portfolio projects={projects} lang={lang} />
            )}
            {currentTab === "portfolio" && (
              <PortfolioPortal lang={lang} />
            )}
            {currentTab === "news" && (
              <NewsPortal news={news} lang={lang} />
            )}
            {currentTab === "blog" && (
              <BlogPortal blogs={blogs} lang={lang} />
            )}
            {currentTab === "tutorials" && (
              <TutorialsPortal 
                tutorials={tutorials} 
                lang={lang}
                userSession={userSession}
                onBookmarkToggle={handleBookmarkToggle}
                isBookmarked={isBookmarked}
                onAddComment={handleAddComment}
              />
            )}
            {currentTab === "certificates" && (
              <Certificates certificates={certificates} lang={lang} />
            )}
            {currentTab === "about" && (
              <AboutPortal lang={lang} />
            )}
            {currentTab === "contact" && (
              <ContactPortal lang={lang} />
            )}
            {currentTab === "cms" && (
              <CMSDashboard
                blogs={blogs}
                news={news}
                projects={projects}
                certificates={certificates}
                tutorials={tutorials}
                userSession={userSession}
                setUserSession={setUserSession}
                refreshData={fetchGlobalData}
                lang={lang}
                onLogout={handleLogout}
                setCurrentTab={setCurrentTab}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Personal AI Chat Assistant */}
      <AIAssistant lang={lang} />

      {/* Unified Enterprise Footer */}
      <footer className="bg-dark-surface/60 border-t border-cyan-400/10 py-8 font-sans mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="font-display font-bold text-sm tracking-tight text-white">
                {lang === "np" ? "हरेन्द्र लाम्साल प्राविधिक मञ्च" : "Harendra Lamsal Personal Tech Platform"}
              </span>
            </div>
            <div className="text-[10px] font-mono text-gray-500">
              {lang === "np" ? "© २०२६ सर्वाधिकार सुरक्षित। हरेन्द्र लाम्साल।" : "© 2026 Harendra Lamsal. All Rights Reserved."}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
            <Code className="w-3.5 h-3.5 text-brand-purple" />
            <span>Built with React 19, TypeScript, Express, and Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
