/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, Trash2, Edit, Sparkles, Globe, Calendar, RefreshCw, 
  Tag, Layers, ExternalLink, HelpCircle, Check, Eye
} from "lucide-react";
import { BlogPost, NewsArticle, Project, Certificate, Tutorial } from "../../types.js";

interface CMSContentManagersProps {
  blogs: BlogPost[];
  news: NewsArticle[];
  projects: Project[];
  certificates: Certificate[];
  tutorials: Tutorial[];
  lang: "np" | "en";
  refreshData: () => Promise<void>;
  loading: boolean;
  setLoading: (l: boolean) => void;
  showSuccess: (m: string) => void;
  showError: (m: string) => void;
  handleTranslateField: (text: string, field: any, formType: any) => Promise<string | undefined>;
}

export default function CMSContentManagers({
  blogs, news, projects, certificates, tutorials, lang,
  refreshData, loading, setLoading, showSuccess, showError, handleTranslateField
}: CMSContentManagersProps) {
  const [managerTab, setManagerTab] = useState<"blogs" | "news" | "tutorials" | "projects" | "certificates">("blogs");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: string; id: string; title?: string } | null>(null);

  // Draft States
  const [blogForm, setBlogForm] = useState({
    title_en: "", title_np: "",
    content_en: "", content_np: "",
    category: "React & Frontend", tags: "React, WebSockets", readTime: "5 min read", author: "Harendra Lamsal"
  });

  const [newsForm, setNewsForm] = useState({
    title_en: "", title_np: "",
    summary_en: "", summary_np: "",
    content_en: "", content_np: "",
    source: "Wired Tech Portal", category: "Artificial Intelligence"
  });

  const [projectForm, setProjectForm] = useState({
    title_en: "", title_np: "",
    desc_en: "", desc_np: "",
    techStack: "React, Express, Tailwind", category: "Full Stack AI",
    githubUrl: "", liveUrl: "", demoDetails: ""
  });

  const [certForm, setCertForm] = useState({
    title_en: "", title_np: "",
    issuer: "Google Cloud", date: new Date().toISOString().split("T")[0],
    credentialId: "", verificationUrl: "", platform: "Coursera", category: "Cloud Infrastructure", year: "2026"
  });

  const [tutorialForm, setTutorialForm] = useState({
    title_en: "", title_np: "",
    category: "React Tutorials",
    step1_title_en: "", step1_title_np: "",
    step1_content_en: "", step1_content_np: "",
    step1_code: "", step1_lang: "typescript",
    tags: "React, Hooks", readTime: "8 min read", author: "Harendra Lamsal", liveUrl: "", downloadUrl: ""
  });

  // Action: Deletes Trigger
  const handleDelete = (type: string, id: string, title?: string) => {
    setDeleteConfirmation({ type, id, title });
  };

  const handleApiResponse = async (res: Response, defaultMessage: string) => {
    if (!res.ok) {
      let errData;
      try {
        errData = await res.json();
      } catch {
        errData = {};
      }
      const detailedError = errData.error || errData.message || defaultMessage;
      throw new Error(detailedError);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmation) return;
    const { type, id } = deleteConfirmation;
    setLoading(true);
    try {
      const res = await fetch(`/api/${type}/${id}`, { method: "DELETE" });
      await handleApiResponse(res, "Could not delete record.");
      showSuccess("Resource removed successfully!");
      setDeleteConfirmation(null);
      await refreshData();
    } catch (err: any) {
      showError(err.message || "Failed to delete record.");
    } finally {
      setLoading(false);
    }
  };

  // Action: Add / Update Blogs
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...blogForm,
        tags: blogForm.tags.split(",").map(t => t.trim()).filter(Boolean)
      };

      const url = editingId ? `/api/blogs/${editingId}` : "/api/blogs";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await handleApiResponse(res, "Could not persist blog");
      showSuccess(editingId ? "Blog post updated successfully!" : "Blog post published successfully!");
      setShowForm(false);
      setEditingId(null);
      // Reset form
      setBlogForm({
        title_en: "", title_np: "", content_en: "", content_np: "",
        category: "React & Frontend", tags: "React, WebSockets", readTime: "5 min read", author: "Harendra Lamsal"
      });
      await refreshData();
    } catch (err: any) {
      showError(err.message || "Failed to persist blog.");
    } finally {
      setLoading(false);
    }
  };

  // Action: Add / Update News
  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/news/${editingId}` : "/api/news";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsForm),
      });

      await handleApiResponse(res, "Could not persist news");
      showSuccess(editingId ? "News article updated!" : "News article published!");
      setShowForm(false);
      setEditingId(null);
      setNewsForm({
        title_en: "", title_np: "", summary_en: "", summary_np: "", content_en: "", content_np: "",
        source: "Wired Tech Portal", category: "Artificial Intelligence"
      });
      await refreshData();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Action: Add / Update Projects
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...projectForm,
        techStack: projectForm.techStack.split(",").map(t => t.trim()).filter(Boolean)
      };
      const url = editingId ? `/api/projects/${editingId}` : "/api/projects";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await handleApiResponse(res, "Could not persist project");
      showSuccess(editingId ? "Project updated!" : "Project published to portfolio grid!");
      setShowForm(false);
      setEditingId(null);
      setProjectForm({
        title_en: "", title_np: "", desc_en: "", desc_np: "",
        techStack: "React, Express, Tailwind", category: "Full Stack AI",
        githubUrl: "", liveUrl: "", demoDetails: ""
      });
      await refreshData();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Action: Add / Update Certificates
  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/certificates/${editingId}` : "/api/certificates";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(certForm),
      });

      await handleApiResponse(res, "Could not persist certificate");
      showSuccess("Certificate successfully registered!");
      setShowForm(false);
      setEditingId(null);
      setCertForm({
        title_en: "", title_np: "", issuer: "Google Cloud", date: new Date().toISOString().split("T")[0],
        credentialId: "", verificationUrl: "", platform: "Coursera", category: "Cloud Infrastructure", year: "2026"
      });
      await refreshData();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Action: Add / Update Tutorials
  const handleTutorialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title_en: tutorialForm.title_en,
        title_np: tutorialForm.title_np,
        category: tutorialForm.category,
        steps: [
          {
            title_en: tutorialForm.step1_title_en,
            title_np: tutorialForm.step1_title_np,
            content_en: tutorialForm.step1_content_en,
            content_np: tutorialForm.step1_content_np,
            codeSnippet: tutorialForm.step1_code,
            language: tutorialForm.step1_lang
          }
        ],
        tags: tutorialForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        date: new Date().toISOString().split("T")[0],
        views: 0,
        readTime: tutorialForm.readTime,
        author: tutorialForm.author,
        liveUrl: tutorialForm.liveUrl,
        downloadUrl: tutorialForm.downloadUrl
      };

      const url = editingId ? `/api/tutorials/${editingId}` : "/api/tutorials";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await handleApiResponse(res, "Could not save tutorial");
      showSuccess("Tutorial published!");
      setShowForm(false);
      setEditingId(null);
      await refreshData();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Enter edit states
  const startEdit = (item: any) => {
    setEditingId(item.id);
    setShowForm(true);
    if (managerTab === "blogs") {
      setBlogForm({
        title_en: item.title_en, title_np: item.title_np,
        content_en: item.content_en, content_np: item.content_np,
        category: item.category, tags: item.tags?.join(", ") || "",
        readTime: item.readTime || "5 min read", author: item.author || "Harendra Lamsal"
      });
    } else if (managerTab === "news") {
      setNewsForm({
        title_en: item.title_en, title_np: item.title_np,
        summary_en: item.summary_en, summary_np: item.summary_np,
        content_en: item.content_en, content_np: item.content_np,
        source: item.source, category: item.category
      });
    } else if (managerTab === "projects") {
      setProjectForm({
        title_en: item.title_en, title_np: item.title_np,
        desc_en: item.desc_en, desc_np: item.desc_np,
        techStack: item.techStack?.join(", ") || "",
        category: item.category, githubUrl: item.githubUrl || "",
        liveUrl: item.liveUrl || "", demoDetails: item.demoDetails || ""
      });
    } else if (managerTab === "certificates") {
      setCertForm({
        title_en: item.title_en, title_np: item.title_np,
        issuer: item.issuer, date: item.date, credentialId: item.credentialId || "",
        verificationUrl: item.verificationUrl || "", platform: item.platform || "Coursera",
        category: item.category || "Cloud Infrastructure", year: item.year || "2026"
      });
    } else if (managerTab === "tutorials") {
      const s1 = item.steps?.[0] || {};
      setTutorialForm({
        title_en: item.title_en, title_np: item.title_np,
        category: item.category,
        step1_title_en: s1.title_en || "", step1_title_np: s1.title_np || "",
        step1_content_en: s1.content_en || "", step1_content_np: s1.content_np || "",
        step1_code: s1.codeSnippet || "", step1_lang: s1.language || "typescript",
        tags: item.tags?.join(", ") || "", readTime: item.readTime || "8 min read",
        author: item.author || "Harendra Lamsal", liveUrl: item.liveUrl || "", downloadUrl: item.downloadUrl || ""
      });
    }
  };

  // Helper trigger translate
  const translateFieldAction = async (text: string, field: string, formType: string) => {
    const val = await handleTranslateField(text, field, formType);
    if (val) {
      if (formType === "blog") setBlogForm(prev => ({ ...prev, [field]: val }));
      else if (formType === "news") setNewsForm(prev => ({ ...prev, [field]: val }));
      else if (formType === "project") setProjectForm(prev => ({ ...prev, [field]: val }));
      else if (formType === "cert") setCertForm(prev => ({ ...prev, [field]: val }));
      else if (formType === "tutorial") setTutorialForm(prev => ({ ...prev, [field]: val }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Filter Rail */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(["blogs", "news", "tutorials", "projects", "certificates"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setManagerTab(tab);
                setShowForm(false);
                setEditingId(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                managerTab === tab 
                  ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/10" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-gradient-to-tr from-cyan-400 to-purple-500 hover:opacity-90 text-black text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {managerTab.substring(0, managerTab.length - 1)}</span>
        </button>
      </div>

      {/* SEARCH FIELD */}
      {!showForm && (
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${managerTab} list by title or tag parameters...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0c10]/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400/30 font-mono"
          />
        </div>
      )}

      {/* CRUD DRAWERS & INPUTS */}
      {showForm && (
        <div className="bg-[#0a0c10]/70 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-widest">
              {editingId ? "Update Existing" : "Publish New"} {managerTab.substring(0, managerTab.length - 1)} Form
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="text-xs text-gray-500 hover:text-white font-mono"
            >
              [Cancel / Back]
            </button>
          </div>

          {/* Form: Blogs */}
          {managerTab === "blogs" && (
            <form onSubmit={handleBlogSubmit} className="space-y-4 text-xs font-mono text-gray-400">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Blog Title (English)</label>
                  <input
                    type="text"
                    required
                    value={blogForm.title_en}
                    onChange={(e) => setBlogForm({ ...blogForm, title_en: e.target.value })}
                    placeholder="e.g. Masterclass React 19 concurrent handshakes"
                    className="w-full bg-black/40 border border-white/10 focus:border-cyan-500/50 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase text-gray-500">Blog Title (Nepali)</label>
                    <button
                      type="button"
                      onClick={() => translateFieldAction(blogForm.title_en, "title_np", "blog")}
                      className="text-[9px] text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      Translate with AI
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={blogForm.title_np}
                    onChange={(e) => setBlogForm({ ...blogForm, title_np: e.target.value })}
                    placeholder="शीर्षक नेपालीमा"
                    className="w-full bg-black/40 border border-white/10 focus:border-cyan-500/50 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Category Tag</label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  >
                    <option value="React & Frontend">React & Frontend</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="CSS & Web Design">CSS & Web Design</option>
                    <option value="Backend Security">Backend Security</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={blogForm.tags}
                    onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                    placeholder="React, Hooks, WebDev"
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500 font-bold block mb-1 text-cyan-400">English Markdown Content Body</label>
                <textarea
                  rows={8}
                  required
                  value={blogForm.content_en}
                  onChange={(e) => setBlogForm({ ...blogForm, content_en: e.target.value })}
                  placeholder="Insert complete markdown details..."
                  className="w-full bg-black/40 border border-white/10 text-white rounded p-3 focus:outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase text-gray-500 font-bold text-purple-400">Nepali Markdown Content Body</label>
                  <button
                    type="button"
                    onClick={() => translateFieldAction(blogForm.content_en, "content_np", "blog")}
                    className="text-[9px] text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Auto-Translate English Content with AI
                  </button>
                </div>
                <textarea
                  rows={8}
                  required
                  value={blogForm.content_np}
                  onChange={(e) => setBlogForm({ ...blogForm, content_np: e.target.value })}
                  placeholder="नेपाली विवरण..."
                  className="w-full bg-black/40 border border-white/10 text-white rounded p-3 focus:outline-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-400 hover:bg-cyan-500 text-black px-4 py-2 rounded font-bold uppercase transition-all"
              >
                {editingId ? "Save Changes" : "Publish Post"}
              </button>
            </form>
          )}

          {/* Form: News */}
          {managerTab === "news" && (
            <form onSubmit={handleNewsSubmit} className="space-y-4 text-xs font-mono text-gray-400">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">News Title (English)</label>
                  <input
                    type="text"
                    required
                    value={newsForm.title_en}
                    onChange={(e) => setNewsForm({ ...newsForm, title_en: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase text-gray-500">News Title (Nepali)</label>
                    <button
                      type="button"
                      onClick={() => translateFieldAction(newsForm.title_en, "title_np", "news")}
                      className="text-[9px] text-cyan-400 hover:underline"
                    >
                      AI Translate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newsForm.title_np}
                    onChange={(e) => setNewsForm({ ...newsForm, title_np: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Summary Bullet (English)</label>
                  <input
                    type="text"
                    required
                    value={newsForm.summary_en}
                    onChange={(e) => setNewsForm({ ...newsForm, summary_en: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase text-gray-500">Summary Bullet (Nepali)</label>
                    <button
                      type="button"
                      onClick={() => translateFieldAction(newsForm.summary_en, "summary_np", "news")}
                      className="text-[9px] text-cyan-400 hover:underline"
                    >
                      AI Translate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newsForm.summary_np}
                    onChange={(e) => setNewsForm({ ...newsForm, summary_np: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">News Source Reference</label>
                  <input
                    type="text"
                    value={newsForm.source}
                    onChange={(e) => setNewsForm({ ...newsForm, source: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Category Tag</label>
                  <select
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  >
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Real-Time Systems">Real-Time Systems</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500">Full Content Article (English)</label>
                <textarea
                  rows={6}
                  required
                  value={newsForm.content_en}
                  onChange={(e) => setNewsForm({ ...newsForm, content_en: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 text-white rounded p-3 focus:outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase text-gray-500">Full Content Article (Nepali)</label>
                  <button
                    type="button"
                    onClick={() => translateFieldAction(newsForm.content_en, "content_np", "news")}
                    className="text-[9px] text-cyan-400 hover:underline"
                  >
                    Translate Content
                  </button>
                </div>
                <textarea
                  rows={6}
                  required
                  value={newsForm.content_np}
                  onChange={(e) => setNewsForm({ ...newsForm, content_np: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 text-white rounded p-3 focus:outline-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-400 hover:bg-cyan-500 text-black px-4 py-2 rounded font-bold uppercase transition-all"
              >
                {editingId ? "Save Changes" : "Publish News"}
              </button>
            </form>
          )}

          {/* Form: Projects */}
          {managerTab === "projects" && (
            <form onSubmit={handleProjectSubmit} className="space-y-4 text-xs font-mono text-gray-400">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Project Title (English)</label>
                  <input
                    type="text"
                    required
                    value={projectForm.title_en}
                    onChange={(e) => setProjectForm({ ...projectForm, title_en: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase text-gray-500">Project Title (Nepali)</label>
                    <button
                      type="button"
                      onClick={() => translateFieldAction(projectForm.title_en, "title_np", "project")}
                      className="text-[9px] text-cyan-400 hover:underline"
                    >
                      AI Translate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={projectForm.title_np}
                    onChange={(e) => setProjectForm({ ...projectForm, title_np: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Technologies (Comma Separated)</label>
                  <input
                    type="text"
                    required
                    value={projectForm.techStack}
                    onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Category Tag</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  >
                    <option value="Full Stack AI">Full Stack AI</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Cloud Systems">Cloud Systems</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Github Repository URL</label>
                  <input
                    type="text"
                    value={projectForm.githubUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Live deployment URL</label>
                  <input
                    type="text"
                    value={projectForm.liveUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500">Description Details (English)</label>
                <textarea
                  rows={4}
                  required
                  value={projectForm.desc_en}
                  onChange={(e) => setProjectForm({ ...projectForm, desc_en: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 text-white rounded p-3 focus:outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase text-gray-500">Description Details (Nepali)</label>
                  <button
                    type="button"
                    onClick={() => translateFieldAction(projectForm.desc_en, "desc_np", "project")}
                    className="text-[9px] text-cyan-400 hover:underline"
                  >
                    Translate Desc
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  value={projectForm.desc_np}
                  onChange={(e) => setProjectForm({ ...projectForm, desc_np: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 text-white rounded p-3 focus:outline-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-400 hover:bg-cyan-500 text-black px-4 py-2 rounded font-bold uppercase transition-all"
              >
                {editingId ? "Save Changes" : "Register Project"}
              </button>
            </form>
          )}

          {/* Form: Certificates */}
          {managerTab === "certificates" && (
            <form onSubmit={handleCertSubmit} className="space-y-4 text-xs font-mono text-gray-400">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Certificate Name (English)</label>
                  <input
                    type="text"
                    required
                    value={certForm.title_en}
                    onChange={(e) => setCertForm({ ...certForm, title_en: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase text-gray-500">Certificate Name (Nepali)</label>
                    <button
                      type="button"
                      onClick={() => translateFieldAction(certForm.title_en, "title_np", "cert")}
                      className="text-[9px] text-cyan-400 hover:underline"
                    >
                      Translate Name
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={certForm.title_np}
                    onChange={(e) => setCertForm({ ...certForm, title_np: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Issuer Agency</label>
                  <input
                    type="text"
                    required
                    value={certForm.issuer}
                    onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={certForm.date}
                    onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-1.5 focus:outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Credential Reference ID</label>
                  <input
                    type="text"
                    value={certForm.credentialId}
                    onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500">Verification Access URL</label>
                <input
                  type="text"
                  value={certForm.verificationUrl}
                  onChange={(e) => setCertForm({ ...certForm, verificationUrl: e.target.value })}
                  placeholder="https://coursera.org/verify/..."
                  className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-400 hover:bg-cyan-500 text-black px-4 py-2 rounded font-bold uppercase transition-all"
              >
                {editingId ? "Save Changes" : "Register Certificate"}
              </button>
            </form>
          )}

          {/* Form: Tutorials */}
          {managerTab === "tutorials" && (
            <form onSubmit={handleTutorialSubmit} className="space-y-4 text-xs font-mono text-gray-400">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500">Tutorial Title (English)</label>
                  <input
                    type="text"
                    required
                    value={tutorialForm.title_en}
                    onChange={(e) => setTutorialForm({ ...tutorialForm, title_en: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase text-gray-500">Tutorial Title (Nepali)</label>
                    <button
                      type="button"
                      onClick={() => translateFieldAction(tutorialForm.title_en, "title_np", "tutorial")}
                      className="text-[9px] text-cyan-400 hover:underline"
                    >
                      AI Translate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={tutorialForm.title_np}
                    onChange={(e) => setTutorialForm({ ...tutorialForm, title_np: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border border-white/5 p-4 rounded-xl space-y-3">
                <div className="text-[10px] uppercase font-bold text-white tracking-widest border-b border-white/5 pb-1 flex items-center justify-between">
                  <span>STEP 1 CONTENT</span>
                  <span className="text-gray-500">Required step segment</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase">Step Title (EN)</label>
                    <input
                      type="text"
                      required
                      value={tutorialForm.step1_title_en}
                      onChange={(e) => setTutorialForm({ ...tutorialForm, step1_title_en: e.target.value })}
                      className="w-full bg-black/40 border border-white/5 text-white rounded px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase">Step Title (NP)</label>
                    <input
                      type="text"
                      required
                      value={tutorialForm.step1_title_np}
                      onChange={(e) => setTutorialForm({ ...tutorialForm, step1_title_np: e.target.value })}
                      className="w-full bg-black/40 border border-white/5 text-white rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase">Step Code Snippet (Optional)</label>
                  <textarea
                    rows={4}
                    value={tutorialForm.step1_code}
                    onChange={(e) => setTutorialForm({ ...tutorialForm, step1_code: e.target.value })}
                    placeholder="// paste code block here..."
                    className="w-full bg-black/40 border border-white/5 text-white rounded p-2.5 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-400 hover:bg-cyan-500 text-black px-4 py-2 rounded font-bold uppercase transition-all"
              >
                {editingId ? "Save Changes" : "Publish Tutorial"}
              </button>
            </form>
          )}

        </div>
      )}

      {/* RENDER ACTIVE DATABASE LISTS */}
      {!showForm && (
        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-4 sm:p-6">
          <h4 className="text-xs uppercase text-gray-400 font-mono font-bold mb-4">
            Active {managerTab} datastore elements
          </h4>

          <div className="divide-y divide-white/5">
            {/* 1. Blogs list */}
            {managerTab === "blogs" && blogs.filter(b => b.title_en?.toLowerCase().includes(searchQuery.toLowerCase())).map(b => (
              <div key={b.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <div className="font-semibold text-white text-sm">{lang === "np" ? b.title_np : b.title_en}</div>
                  <div className="text-[10px] text-gray-500">
                    ID: {b.id} • Category: <span className="text-cyan-400">{b.category}</span> • Author: {b.author}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => startEdit(b)}
                    className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded cursor-pointer transition-all"
                    title="Edit Item"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete("blogs", b.id, lang === "np" ? b.title_np : b.title_en)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded cursor-pointer transition-all"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* 2. News list */}
            {managerTab === "news" && news.filter(n => n.title_en?.toLowerCase().includes(searchQuery.toLowerCase())).map(n => (
              <div key={n.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <div className="font-semibold text-white text-sm">{lang === "np" ? n.title_np : n.title_en}</div>
                  <div className="text-[10px] text-gray-500">
                    ID: {n.id} • Category: <span className="text-purple-400">{n.category}</span> • Source: {n.source}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => startEdit(n)}
                    className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded cursor-pointer transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete("news", n.id, lang === "np" ? n.title_np : n.title_en)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded cursor-pointer transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* 3. Projects list */}
            {managerTab === "projects" && projects.filter(p => p.title_en?.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
              <div key={p.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <div className="font-semibold text-white text-sm">{lang === "np" ? p.title_np : p.title_en}</div>
                  <div className="text-[10px] text-gray-500">
                    ID: {p.id} • Tech: <span className="text-amber-400">{p.techStack?.join(", ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => startEdit(p)}
                    className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded cursor-pointer transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete("projects", p.id, lang === "np" ? p.title_np : p.title_en)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded cursor-pointer transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* 4. Certificates list */}
            {managerTab === "certificates" && certificates.filter(c => c.title_en?.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
              <div key={c.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <div className="font-semibold text-white text-sm">{lang === "np" ? c.title_np : c.title_en}</div>
                  <div className="text-[10px] text-gray-500">
                    ID: {c.id} • Platform: <span className="text-cyan-400">{c.platform}</span> • Issuer: {c.issuer}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => startEdit(c)}
                    className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded cursor-pointer transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete("certificates", c.id, lang === "np" ? c.title_np : c.title_en)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded cursor-pointer transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* 5. Tutorials list */}
            {managerTab === "tutorials" && tutorials.filter(t => t.title_en?.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
              <div key={t.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <div className="font-semibold text-white text-sm">{lang === "np" ? t.title_np : t.title_en}</div>
                  <div className="text-[10px] text-gray-500">
                    ID: {t.id} • Category: <span className="text-purple-400">{t.category}</span> • Steps: {t.steps?.length}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => startEdit(t)}
                    className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded cursor-pointer transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete("tutorials", t.id, lang === "np" ? t.title_np : t.title_en)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded cursor-pointer transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border border-red-500/20 max-w-md w-full rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-mono text-xs">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Trash2 className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Confirm Permanent Deletion
                </h3>
                <p className="text-[10px] text-gray-400 font-sans">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-5">
              <div className="text-[10px] uppercase text-gray-500 mb-1">Resource Datastore:</div>
              <div className="text-white font-semibold mb-2">/api/{deleteConfirmation.type}/{deleteConfirmation.id}</div>
              
              {deleteConfirmation.title && (
                <>
                  <div className="text-[10px] uppercase text-gray-500 mb-1">Title:</div>
                  <div className="text-cyan-400 italic">"{deleteConfirmation.title}"</div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 font-semibold">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
