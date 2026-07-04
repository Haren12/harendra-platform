/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BlogPost, NewsArticle, Project, Certificate, UserSession, Tutorial } from "../types.js";
import { 
  Settings, BookOpen, Globe, Layers, Award, Terminal, MessageSquare, 
  Trash2, Plus, Sparkles, RefreshCw, Send, CheckCircle, AlertTriangle, 
  Database, Calendar, Search, Lock, User, Mail, Upload, FolderPlus, 
  Tag, Sliders, LogOut, Share2, FileText, Layout, ExternalLink, X, 
  ChevronRight, UserCheck, Bell, Copy, Download, Play, History, 
  Activity, HardDrive, Filter, ArrowUpRight, Eye, CopyCheck, Command, Check,
  Shield
} from "lucide-react";

import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";
import { 
  fallbackCategories, fallbackTags, fallbackMediaFiles, fallbackNewsletters, 
  fallbackAdvertisements, fallbackWebSettings, fallbackSystemLogs, 
  fallbackSystemBackups, fallbackAdminUsers 
} from "../data/cmsFallbackData.js";

// Sub-components
import CMSAuthScreen from "./cms/CMSAuthScreen";
import CMSDashboardOverview from "./cms/CMSDashboardOverview";
import CMSContentManagers from "./cms/CMSContentManagers";
import CMSMediaLibrary from "./cms/CMSMediaLibrary";
import CMSTaxonomies from "./cms/CMSTaxonomies";
import CMSAdminServices from "./cms/CMSAdminServices";
import CMSBackupsLogs from "./cms/CMSBackupsLogs";
import CMSSecurityCenter from "./cms/CMSSecurityCenter";
import SupabaseDBConsole from "./cms/SupabaseDBConsole";

interface CMSDashboardProps {
  blogs: BlogPost[];
  news: NewsArticle[];
  projects: Project[];
  certificates: Certificate[];
  tutorials: Tutorial[];
  refreshData: () => Promise<void>;
  lang: "np" | "en";
  userSession: UserSession;
  setUserSession: React.Dispatch<React.SetStateAction<UserSession>>;
  onLogout: () => void;
  setCurrentTab: (tab: string) => void;
}

export default function CMSDashboard({
  blogs, news, projects, certificates, tutorials, refreshData, lang, userSession, setUserSession, onLogout, setCurrentTab
}: CMSDashboardProps) {
  
  // Tab states
  type SubTab = "dashboard" | "content" | "media" | "taxonomies" | "services" | "backups-logs" | "security" | "database";
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("dashboard");

  // Secondary dynamic collections loaded from `/api/data`
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [webSettings, setWebSettings] = useState<any>({
    siteName: "Harendra Lamsal technology platform",
    logoUrl: "",
    contactEmail: "harendralamsal4140@gmail.com",
    footerLine: "© 2026 Harendra Lamsal. All Rights Reserved."
  });
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [systemBackups, setSystemBackups] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);

  // CMS state UI
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info" | "purple";
  } | null>(null);

  // Command palette state
  const [showPalette, setShowPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // Fetch all secondary dynamic collections
  const fetchSecondaryCMSData = async () => {
    try {
      let fetchedCategories: any[] = [];
      let fetchedTags: any[] = [];
      let fetchedMediaFiles: any[] = [];
      let fetchedNewsletters: any[] = [];
      let fetchedAdvertisements: any[] = [];
      let fetchedWebSettings: any = null;
      let fetchedSystemLogs: any[] = [];
      let fetchedSystemBackups: any[] = [];
      let fetchedAdminUsers: any[] = [];

      if (isSupabaseConfigured && supabase) {
        try {
          // Fetch categories
          const { data: catData } = await supabase.from("categories").select("*");
          if (catData) fetchedCategories = catData;

          // Fetch tags
          const { data: tagData } = await supabase.from("tags").select("*");
          if (tagData) fetchedTags = tagData;

          // Fetch media files
          const { data: mediaData } = await supabase.from("media_library").select("*");
          if (mediaData) fetchedMediaFiles = mediaData;

          // Fetch newsletters
          const { data: newsData } = await supabase.from("newsletter_subscribers").select("*");
          if (newsData) fetchedNewsletters = newsData;

          // Fetch advertisements
          const { data: adData } = await supabase.from("advertisements").select("*");
          if (adData) fetchedAdvertisements = adData;

          // Fetch website settings
          const { data: settingsData } = await supabase.from("website_settings").select("*").maybeSingle();
          if (settingsData) fetchedWebSettings = settingsData;

          // Fetch system logs
          const { data: logData } = await supabase.from("activity_logs").select("*");
          if (logData) fetchedSystemLogs = logData;

          // Fetch system backups
          const { data: backupData } = await supabase.from("backups").select("*");
          if (backupData) fetchedSystemBackups = backupData;

          // Fetch admin users
          const { data: userData } = await supabase.from("users").select("*");
          if (userData) fetchedAdminUsers = userData;
        } catch (supabaseErr) {
          console.error("Failed to query secondary data from Supabase directly:", supabaseErr);
        }
      }

      setCategories(fetchedCategories.length > 0 ? fetchedCategories : fallbackCategories);
      setTags(fetchedTags.length > 0 ? fetchedTags : fallbackTags);
      setMediaFiles(fetchedMediaFiles.length > 0 ? fetchedMediaFiles : fallbackMediaFiles);
      setNewsletters(fetchedNewsletters.length > 0 ? fetchedNewsletters : fallbackNewsletters);
      setAdvertisements(fetchedAdvertisements.length > 0 ? fetchedAdvertisements : fallbackAdvertisements);
      setWebSettings(fetchedWebSettings ? fetchedWebSettings : fallbackWebSettings);
      setSystemLogs(fetchedSystemLogs.length > 0 ? fetchedSystemLogs : fallbackSystemLogs);
      setSystemBackups(fetchedSystemBackups.length > 0 ? fetchedSystemBackups : fallbackSystemBackups);
      setAdminUsers(fetchedAdminUsers.length > 0 ? fetchedAdminUsers : fallbackAdminUsers);
    } catch (err) {
      console.error("Error in fetchSecondaryCMSData:", err);
      // Fallback under any unexpected top-level error
      setCategories(fallbackCategories);
      setTags(fallbackTags);
      setMediaFiles(fallbackMediaFiles);
      setNewsletters(fallbackNewsletters);
      setAdvertisements(fallbackAdvertisements);
      setWebSettings(fallbackWebSettings);
      setSystemLogs(fallbackSystemLogs);
      setSystemBackups(fallbackSystemBackups);
      setAdminUsers(fallbackAdminUsers);
    } finally {
      // Collate comments directly from the props passed from App.tsx
      const collatedComments: any[] = [];
      
      if (Array.isArray(tutorials)) {
        tutorials.forEach(t => {
          if (t.comments) {
            t.comments.forEach(c => {
              collatedComments.push({
                ...c,
                itemId: t.id,
                itemType: "tutorials",
                parentTitle: t.title_en || t.title_np,
                tutorialId: t.id
              });
            });
          }
        });
      }

      if (Array.isArray(blogs)) {
        blogs.forEach(b => {
          if (b.comments) {
            b.comments.forEach(c => {
              collatedComments.push({
                ...c,
                itemId: b.id,
                itemType: "blogs",
                parentTitle: b.title_en || b.title_np,
                tutorialId: b.id
              });
            });
          }
        });
      }

      if (Array.isArray(news)) {
        news.forEach(n => {
          if (n.comments) {
            n.comments.forEach(c => {
              collatedComments.push({
                ...c,
                itemId: n.id,
                itemType: "news",
                parentTitle: n.title_en || n.title_np,
                tutorialId: n.id
              });
            });
          }
        });
      }

      setComments(collatedComments);
    }
  };

  useEffect(() => {
    if (userSession.role === "admin") {
      fetchSecondaryCMSData();
    }
  }, [userSession.role]);

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K or CTRL+K toggles palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowPalette(prev => !prev);
      }
      
      // ALT shortcuts for tabs
      if (e.altKey) {
        if (e.key === "d") { e.preventDefault(); setActiveSubTab("dashboard"); }
        if (e.key === "c") { e.preventDefault(); setActiveSubTab("content"); }
        if (e.key === "m") { e.preventDefault(); setActiveSubTab("media"); }
        if (e.key === "t") { e.preventDefault(); setActiveSubTab("taxonomies"); }
        if (e.key === "s") { e.preventDefault(); setActiveSubTab("services"); }
        if (e.key === "l") { e.preventDefault(); setActiveSubTab("backups-logs"); }
        if (e.key === "p") { e.preventDefault(); setActiveSubTab("security"); }
        if (e.key === "u") { e.preventDefault(); setActiveSubTab("database"); }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Post Operations handlers
  const handleTranslateField = async (sourceText: string, targetField: string, formType: string): Promise<string | undefined> => {
    if (!sourceText.trim()) return;
    try {
      const res = await fetch("/api/gemini/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText, targetLang: "np" }),
      });
      if (!res.ok) throw new Error("Translation request failed");
      const data = await res.json();
      showSuccess("AI localized content translated successfully!");
      return data.translated;
    } catch (err) {
      showError("Field translation failed. Enter text manually.");
      return undefined;
    }
  };

  // Media Handlers
  const handleMediaUpload = async (payload: any) => {
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showSuccess("Asset ingested successfully!");
        fetchSecondaryCMSData();
      }
    } catch (err) {
      showError("Failed to upload media.");
    }
  };

  const handleMediaRename = async (id: string, newName: string) => {
    try {
      const res = await fetch(`/api/media/${id}/rename`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName })
      });
      if (res.ok) {
        showSuccess("Asset renamed successfully!");
        fetchSecondaryCMSData();
      }
    } catch (err) {
      showError("Failed to rename media.");
    }
  };

  const handleMediaDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        showSuccess("Asset removed successfully!");
        fetchSecondaryCMSData();
      }
    } catch (err) {
      showError("Failed to delete media.");
    }
  };

  // Taxonomy Handlers
  const handleAddCategory = async (cat: any) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cat)
      });
      if (res.ok) {
        showSuccess("Category saved!");
        fetchSecondaryCMSData();
      }
    } catch (err) {
      showError("Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setConfirmModal({
      title: "Confirm Delete Category",
      message: "Are you sure you want to permanently delete this category? This might affect existing blogs/news targeting this category.",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
          if (res.ok) {
            showSuccess("Category deleted.");
            fetchSecondaryCMSData();
          }
        } catch (err) {
          showError("Failed to delete category");
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  const handleAddTag = async (tag: any) => {
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tag)
      });
      if (res.ok) {
        showSuccess("Tag saved!");
        fetchSecondaryCMSData();
      }
    } catch (err) {
      showError("Failed to add tag");
    }
  };

  const handleDeleteTag = async (id: string) => {
    setConfirmModal({
      title: "Confirm Delete Tag",
      message: "Are you sure you want to permanently delete this tag? This might remove it from existing items.",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
          if (res.ok) {
            showSuccess("Tag deleted.");
            fetchSecondaryCMSData();
          }
        } catch (err) {
          showError("Failed to delete tag");
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  const handleMergeTags = async (sourceId: string, targetId: string) => {
    try {
      const res = await fetch("/api/tags/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId, targetId })
      });
      if (res.ok) {
        showSuccess("Tags merged successfully!");
        fetchSecondaryCMSData();
      } else {
        throw new Error("Merge failed");
      }
    } catch (err) {
      showError("Failed to merge tags");
    }
  };

  // Service Handlers
  const handleAddSubscribers = async (emails: string[]) => {
    try {
      const res = await fetch("/api/newsletter/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails })
      });
      if (res.ok) {
        fetchSecondaryCMSData();
      }
    } catch (err) {
      showError("Failed to import newsletter list");
    }
  };

  const handleToggleAd = async (id: string) => {
    try {
      const res = await fetch(`/api/advertisements/${id}/toggle`, { method: "PUT" });
      if (res.ok) {
        fetchSecondaryCMSData();
      }
    } catch (err) {
      showError("Failed to toggle advertisement slot");
    }
  };

  const handleUpdateAd = async (id: string, payload: any) => {
    try {
      const res = await fetch(`/api/advertisements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchSecondaryCMSData();
      }
    } catch (err) {
      showError("Failed to update advertisement");
    }
  };

  const handleUpdateSettings = async (payload: any) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchSecondaryCMSData();
      }
    } catch (err) {
      showError("Failed to update brand settings");
    }
  };

  // Backup & Logs Handlers
  const handleGenerateBackup = async () => {
    try {
      const res = await fetch("/api/backups", { method: "POST" });
      if (res.ok) {
        showSuccess("Database backup snapshot successfully archived!");
        fetchSecondaryCMSData();
      }
    } catch (err) {
      showError("Failed to generate backup");
    }
  };

  const handleRestoreBackup = async (id: string) => {
    try {
      const res = await fetch(`/api/backups/${id}/restore`, { method: "POST" });
      if (res.ok) {
        showSuccess("Database successfully rollbacked! Handshake synchronized.");
        await refreshData();
        await fetchSecondaryCMSData();
      }
    } catch (err) {
      showError("Failed to restore backup snapshot");
    }
  };

  const handleModerateComment = async (id: string, action: "approve" | "reject" | "pin" | "reply" | "delete", payload?: any) => {
    try {
      // Find the comment in our state list to retrieve its parent itemId and itemType
      const commentObj = comments.find(c => c.id === id);
      if (!commentObj) {
        showError("Comment not found in local cache.");
        return;
      }

      const { itemId, itemType } = commentObj;
      if (!itemId || !itemType) {
        showError("Invalid comment parameters.");
        return;
      }

      // Pin is toggled based on the current state in the database
      let finalAction: string = action;
      if (action === "pin") {
        finalAction = commentObj.pinned ? "unpin" : "pin";
      }

      const res = await fetch("/api/comments/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: finalAction,
          itemType,
          itemId,
          commentId: id,
          replyContent: payload?.reply
        })
      });

      if (res.ok) {
        showSuccess(`Comment action: [${finalAction.toUpperCase()}] applied successfully!`);
        await fetchSecondaryCMSData();
      } else {
        const errData = await res.json().catch(() => ({}));
        showError(errData.error || "Failed to apply comment action.");
      }
    } catch (err) {
      showError("Failed to apply comment action.");
    }
  };

  const handleUpdateUserRole = async (id: string, role: string, permissions: any) => {
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, permissions })
      });
      if (res.ok) {
        fetchSecondaryCMSData();
      }
    } catch (err) {
      showError("Failed to modify user access privileges.");
    }
  };

  // Hard Reset Database Seeding
  const handleHardReset = () => {
    setConfirmModal({
      title: "Confirm Database Hard Reset",
      message: "WARNING: This will permanently delete any custom content added (blogs, news, tutorials, media) and restore Harendra Lamsal's initial seeded professional assets. Proceed?",
      variant: "purple",
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/reset", { method: "POST" });
          if (!res.ok) throw new Error("Server refused reset request");
          showSuccess("Database seeding successfully initialized.");
          await refreshData();
          await fetchSecondaryCMSData();
        } catch (err: any) {
          showError(err.message || "Failed to seed database.");
        } finally {
          setLoading(false);
          setConfirmModal(null);
        }
      }
    });
  };

  const handleLogout = () => {
    onLogout();
    showSuccess("Security gateway sessions cleared. Logged out.");
  };

  // Command palette navigation items
  const paletteItems = [
    { label: "Overview Metrics Dashboard", action: () => { setActiveSubTab("dashboard"); setShowPalette(false); } },
    { label: "Blogs & News Articles CRUD Drawer", action: () => { setActiveSubTab("content"); setShowPalette(false); } },
    { label: "Cloud Media Library & Assets", action: () => { setActiveSubTab("media"); setShowPalette(false); } },
    { label: "Unlimited Nested Categories & Tags Manager", action: () => { setActiveSubTab("taxonomies"); setShowPalette(false); } },
    { label: "Newsletter campaigns & Email Composers", action: () => { setActiveSubTab("services"); setShowPalette(false); } },
    { label: "Monetization scheduler & Advertisement configs", action: () => { setActiveSubTab("services"); setShowPalette(false); } },
    { label: "Access Privilege security Matrix & Backups center", action: () => { setActiveSubTab("backups-logs"); setShowPalette(false); } },
    { label: "Trigger Database Seeding Hard Reset", action: () => { handleHardReset(); setShowPalette(false); } },
  ];

  const filteredPalette = paletteItems.filter(item => item.label.toLowerCase().includes(paletteQuery.toLowerCase()));

  // Render Authentication screen if not authenticated
  if (userSession.role !== "admin") {
    return <CMSAuthScreen setUserSession={setUserSession} lang={lang} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
      {/* Toast notifications */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950/90 backdrop-blur-md border border-emerald-500/20 text-emerald-400 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 font-mono text-xs">
          <CheckCircle className="w-4 h-4 animate-bounce" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-950/90 backdrop-blur-md border border-red-500/20 text-red-400 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 font-mono text-xs">
          <AlertTriangle className="w-4 h-4 animate-pulse" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Command Palette Overlay Modal */}
      {showPalette && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-24 px-4" onClick={() => setShowPalette(false)}>
          <div className="w-full max-w-lg bg-[#0a0c10] border border-cyan-400/20 rounded-2xl p-4 shadow-2xl space-y-4 font-mono text-xs text-gray-400" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Command className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Type parameter or module name to search jump..."
                className="w-full bg-transparent focus:outline-none text-white text-xs"
              />
              <button onClick={() => setShowPalette(false)} className="text-[10px] text-gray-500 hover:text-white">
                [Esc]
              </button>
            </div>
            <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
              {filteredPalette.length > 0 ? filteredPalette.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-cyan-400/10 hover:text-cyan-400 transition-all flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )) : (
                <div className="text-center py-4 text-gray-500">No matching system indexes found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-[10px] bg-cyan-400/10 text-cyan-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
              Enterprise Dashboard
            </span>
            <span className="text-[10px] bg-purple-500/10 text-purple-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
              Role: Admin (Master Override)
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            <span>{webSettings.siteName}</span>
            <Settings className="w-5 h-5 text-gray-500 animate-spin" style={{ animationDuration: "12s" }} />
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Welcome, <span className="text-white font-bold">{userSession.name}</span> • Secure administration channels active.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Command Palette Trigger */}
          <button
            onClick={() => setShowPalette(true)}
            className="px-3.5 py-2.5 bg-black/40 hover:bg-white/5 border border-white/5 hover:border-cyan-400/20 text-gray-400 rounded-xl text-xs font-mono flex items-center gap-2 cursor-pointer transition-all"
          >
            <Command className="w-3.5 h-3.5 text-cyan-400" />
            <span>Search Modules...</span>
            <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500">Ctrl+K</span>
          </button>

          {/* Hard Reset database seeding */}
          <button
            onClick={handleHardReset}
            className="px-3.5 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 border border-purple-500/20 hover:border-purple-500/30 rounded-xl text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all"
            title="Perform seeded reset"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "6s" }} />
            <span>Reseed</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-3.5 py-2.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main CMS Split Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column navigation drawer */}
        <aside className="lg:col-span-1 space-y-2 font-mono text-xs">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest px-3 mb-2 font-bold">
            Administrative Modules
          </div>
          
          {(["dashboard", "content", "media", "taxonomies", "services", "backups-logs", "security", "database"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-between font-bold ${
                activeSubTab === tab 
                  ? "bg-gradient-to-r from-cyan-400/20 to-purple-500/5 text-cyan-400 border-l-2 border-cyan-400 font-bold" 
                  : "text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {tab === "dashboard" && <Sliders className="w-4 h-4 text-cyan-400" />}
                {tab === "content" && <FileText className="w-4 h-4 text-purple-400" />}
                {tab === "media" && <Upload className="w-4 h-4 text-cyan-400" />}
                {tab === "taxonomies" && <Layers className="w-4 h-4 text-amber-400" />}
                {tab === "services" && <Mail className="w-4 h-4 text-emerald-400" />}
                {tab === "backups-logs" && <Activity className="w-4 h-4 text-cyan-400" />}
                {tab === "security" && <Shield className="w-4 h-4 text-red-400 animate-pulse" />}
                {tab === "database" && <Database className="w-4 h-4 text-cyan-400" />}
                <span className="capitalize">
                  {tab === "backups-logs" ? "Backups & Moderation" : tab === "security" ? "Security Center" : tab === "database" ? "Supabase DB" : tab}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </button>
          ))}

          <div className="p-4 bg-[#0a0c10]/40 border border-white/5 rounded-2xl mt-6 space-y-2.5">
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Alt Keyboard Navigation</div>
            <div className="space-y-1.5 text-[9px] text-gray-400">
              <div><span className="text-white font-bold">[Alt+D]</span> Overview</div>
              <div><span className="text-white font-bold">[Alt+C]</span> Articles</div>
              <div><span className="text-white font-bold">[Alt+M]</span> Media</div>
              <div><span className="text-white font-bold">[Alt+T]</span> Taxonomies</div>
              <div><span className="text-white font-bold">[Alt+S]</span> Campaigns</div>
              <div><span className="text-white font-bold">[Alt+L]</span> Backups</div>
              <div><span className="text-white font-bold">[Alt+P]</span> Security</div>
              <div><span className="text-white font-bold">[Alt+U]</span> Supabase DB</div>
            </div>
          </div>
        </aside>

        {/* Right main dynamic views container */}
        <section className="lg:col-span-3">
          {activeSubTab === "dashboard" && (
            <CMSDashboardOverview
              stats={{
                totalBlogs: blogs.length,
                totalNews: news.length,
                totalProjects: projects.length,
                totalCerts: certificates.length,
                totalSubs: newsletters.length,
                totalUsers: adminUsers.length
              }}
              logs={systemLogs}
              onTriggerBackup={handleGenerateBackup}
              lang={lang}
              setActiveSubTab={setActiveSubTab}
            />
          )}

          {activeSubTab === "content" && (
            <CMSContentManagers
              blogs={blogs}
              news={news}
              projects={projects}
              certificates={certificates}
              tutorials={tutorials}
              lang={lang}
              refreshData={refreshData}
              loading={loading}
              setLoading={setLoading}
              showSuccess={showSuccess}
              showError={showError}
              handleTranslateField={handleTranslateField}
            />
          )}

          {activeSubTab === "media" && (
            <CMSMediaLibrary
              mediaFiles={mediaFiles}
              onUpload={handleMediaUpload}
              onRename={handleMediaRename}
              onDelete={handleMediaDelete}
              lang={lang}
            />
          )}

          {activeSubTab === "taxonomies" && (
            <CMSTaxonomies
              categories={categories}
              tags={tags}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddTag={handleAddTag}
              onDeleteTag={handleDeleteTag}
              onMergeTags={handleMergeTags}
              lang={lang}
            />
          )}

          {activeSubTab === "services" && (
            <CMSAdminServices
              subscribers={newsletters}
              onAddSubscribers={handleAddSubscribers}
              advertisements={advertisements}
              onToggleAd={handleToggleAd}
              onUpdateAd={handleUpdateAd}
              settings={webSettings}
              onUpdateSettings={handleUpdateSettings}
              lang={lang}
            />
          )}

          {activeSubTab === "backups-logs" && (
            <CMSBackupsLogs
              comments={comments}
              onModerateComment={handleModerateComment}
              users={adminUsers}
              onUpdateUserRole={handleUpdateUserRole}
              backups={systemBackups}
              onGenerateBackup={handleGenerateBackup}
              onRestoreBackup={handleRestoreBackup}
              logs={systemLogs}
              lang={lang}
            />
          )}

          {activeSubTab === "security" && (
            <CMSSecurityCenter
              lang={lang}
              adminEmail={userSession.email}
            />
          )}

          {activeSubTab === "database" && (
            <SupabaseDBConsole
              lang={lang}
            />
          )}
        </section>

      </div>

      {/* Reusable Custom Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`bg-[#0f1115] border ${confirmModal.variant === "purple" ? "border-purple-500/20" : "border-red-500/20"} max-w-md w-full rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-mono text-xs`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${confirmModal.variant === "purple" ? "bg-purple-500/10 text-purple-400" : "bg-red-500/10 text-red-400"}`}>
                {confirmModal.variant === "purple" ? (
                  <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: "4s" }} />
                ) : (
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  {confirmModal.title}
                </h3>
                <p className="text-[10px] text-gray-400 font-sans">Verification handshake required.</p>
              </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-5 text-gray-300 leading-relaxed font-sans text-xs">
              {confirmModal.message}
            </div>

            <div className="flex items-center justify-end gap-3 font-semibold font-mono">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 text-white rounded-lg transition-all cursor-pointer ${
                  confirmModal.variant === "purple"
                    ? "bg-purple-600 hover:bg-purple-500"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                PROCEED
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
