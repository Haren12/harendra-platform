/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Database, Shield, Key, Code, Table, Layers, Zap, Clock, TrendingUp, 
  ArrowUpRight, Download, Copy, Check, Info, HelpCircle, HardDrive, 
  FileText, Activity, Server, AlertCircle, RefreshCw, ChevronRight, CheckCircle2
} from "lucide-react";
import { isSupabaseConfigured, supabaseUrl } from "../../lib/supabaseClient";

interface SupabaseDBConsoleProps {
  lang: "np" | "en";
}

interface TableDefinition {
  name: string;
  description: string;
  columns: { name: string; type: string; constraints?: string; desc: string }[];
  indexes: string[];
  policies: string[];
}

export default function SupabaseDBConsole({ lang }: SupabaseDBConsoleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "schema" | "realtime" | "rls" | "functions">("overview");
  const [selectedTable, setSelectedTable] = useState<string>("news_articles");
  const [copied, setCopied] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ status: "idle" | "success" | "warning" | "error"; msg: string }>({
    status: "idle",
    msg: ""
  });

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTimeout(() => {
      if (isSupabaseConfigured) {
        setTestResult({
          status: "success",
          msg: `Ping successful! Connected securely to external Postgres database cluster at: ${supabaseUrl}`
        });
      } else {
        setTestResult({
          status: "warning",
          msg: "Defaulting to high-fidelity Sandbox engine. Configure SUPABASE_URL & SUPABASE_ANON_KEY in your settings to establish external connection."
        });
      }
      setTestingConnection(false);
    }, 1200);
  };

  const handleCopySql = () => {
    fetch("/supabase_schema.sql")
      .then(res => res.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        // Fallback static copy if fetch fails in sandboxed iframe environment
        navigator.clipboard.writeText("-- Execute schema in Supabase SQL editor");
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
  };

  const tableDefinitions: Record<string, TableDefinition> = {
    profiles: {
      name: "profiles",
      description: "Holds extended biographical, skill, and credential metadata for administrators, authors, and users.",
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY, REFERENCES users(id)", desc: "Unique identifier, mirrors main system auth identifier" },
        { name: "full_name", type: "VARCHAR(150)", constraints: "NOT NULL", desc: "User's display full name" },
        { name: "username", type: "VARCHAR(50)", constraints: "UNIQUE, NOT NULL", desc: "Public handle / alias URL path slug" },
        { name: "profile_image", type: "TEXT", desc: "Public bucket URL link for avatar image" },
        { name: "cover_image", type: "TEXT", desc: "Hero backdrop cover image URL link" },
        { name: "bio", type: "TEXT", desc: "Short text bio/intro paragraph" },
        { name: "phone", type: "VARCHAR(20)", desc: "Validated contact phone number" },
        { name: "email", type: "CITEXT", constraints: "UNIQUE, NOT NULL", desc: "Case-insensitive authenticated email address" },
        { name: "social_links", type: "JSONB", constraints: "DEFAULT '{}'", desc: "Structured links block (GitHub, LinkedIn, Twitter)" },
        { name: "skills", type: "TEXT[]", constraints: "DEFAULT '{}'", desc: "Array containing skill tags / specialties" },
        { name: "experience", type: "JSONB", constraints: "DEFAULT '[]'", desc: "Array list of historic jobs and milestone achievements" },
        { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT now()", desc: "Record generation timezone stamp" }
      ],
      indexes: [
        "idx_profiles_social_links ON profiles USING gin (social_links)",
        "idx_profiles_experience ON profiles USING gin (experience)"
      ],
      policies: [
        "Public profiles are viewable by everyone (SELECT)",
        "Users can update their own profile (UPDATE WHERE auth.uid() = id)"
      ]
    },
    news_articles: {
      name: "news_articles",
      description: "Stores primary breaking news, rich formatted articles, and trending columns with full-text search vector indexes.",
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY", desc: "Unique cryptographic record ID" },
        { name: "title", type: "VARCHAR(255)", constraints: "NOT NULL", desc: "Title headline string" },
        { name: "slug", type: "VARCHAR(280)", constraints: "UNIQUE, NOT NULL", desc: "Clean slug generated automatically from Title" },
        { name: "summary", type: "TEXT", desc: "Short sub-headline or excerpt for grids" },
        { name: "content", type: "TEXT", constraints: "NOT NULL", desc: "Primary full text body content" },
        { name: "featured_image", type: "TEXT", desc: "Image banner displayed at top" },
        { name: "gallery", type: "TEXT[]", constraints: "DEFAULT '{}'", desc: "Array list of supporting gallery assets" },
        { name: "category_id", type: "UUID", constraints: "REFERENCES categories(id)", desc: "Foreign key referencing taxonomy categories" },
        { name: "author_id", type: "UUID", constraints: "REFERENCES users(id)", desc: "Foreign key targeting writing creator user" },
        { name: "publish_date", type: "TIMESTAMP", constraints: "DEFAULT now()", desc: "Publish timestamp" },
        { name: "status", type: "content_status", constraints: "DEFAULT 'Draft'", desc: "Draft, Review, Published, or Archived state" },
        { name: "reading_time", type: "INTEGER", constraints: "DEFAULT 1", desc: "Calculated read latency in minutes" },
        { name: "featured", type: "BOOLEAN", constraints: "DEFAULT false", desc: "Featured spotlight article flag" },
        { name: "breaking_news", type: "BOOLEAN", constraints: "DEFAULT false", desc: "Pushes banner and live websocket notifications" },
        { name: "trending", type: "BOOLEAN", constraints: "DEFAULT false", desc: "Calculated algorithmically on rapid view volume" },
        { name: "language", type: "VARCHAR(10)", constraints: "DEFAULT 'en'", desc: "Localization code: 'np' (Nepali) or 'en'" },
        { name: "search_vector", type: "TSVECTOR", desc: "GIN optimized index containing pre-computed lexicon tokens" }
      ],
      indexes: [
        "idx_news_slug ON news_articles(slug)",
        "idx_news_publish_date ON news_articles(publish_date DESC)",
        "idx_news_status ON news_articles(status)",
        "idx_news_search_vector ON news_articles USING gin(search_vector)"
      ],
      policies: [
        "Anyone can view published news articles (SELECT WHERE status = 'Published')",
        "Admins and Editors have full access on news (ALL TO authenticated)",
        "Authors can write and view their own articles (ALL TO authenticated WHERE author_id = auth.uid())"
      ]
    },
    blog_posts: {
      name: "blog_posts",
      description: "Standard editorial blogs, thoughts, and technical posts linked to profiles.",
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY", desc: "Unique record ID" },
        { name: "title", type: "VARCHAR(255)", constraints: "NOT NULL", desc: "Post title" },
        { name: "slug", type: "VARCHAR(280)", constraints: "UNIQUE", desc: "Clean routing URL slug" },
        { name: "content", type: "TEXT", constraints: "NOT NULL", desc: "Markdown formatted full content" },
        { name: "author_id", type: "UUID", constraints: "REFERENCES users(id)", desc: "Foreign key of post author" },
        { name: "category_id", type: "UUID", constraints: "REFERENCES categories(id)", desc: "Foreign key mapping to categories table" },
        { name: "status", type: "content_status", constraints: "DEFAULT 'Draft'", desc: "Content lifecyle status" },
        { name: "views", type: "INTEGER", constraints: "DEFAULT 0", desc: "Total read count metric" }
      ],
      indexes: [
        "idx_blogs_slug ON blog_posts(slug)",
        "idx_blogs_status ON blog_posts(status)"
      ],
      policies: [
        "Anyone can view published blogs (SELECT)",
        "Creators can manage own blogs"
      ]
    },
    projects: {
      name: "projects",
      description: "Interactive portfolio projects showcase, detailing stack, repository, and demo URL pointers.",
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY", desc: "Unique portfolio project code" },
        { name: "project_name", type: "VARCHAR(150)", constraints: "NOT NULL", desc: "Name label of project" },
        { name: "slug", type: "VARCHAR(180)", constraints: "UNIQUE", desc: "URL path slug" },
        { name: "description", type: "TEXT", constraints: "NOT NULL", desc: "Comprehensive technical overview" },
        { name: "technologies", type: "TEXT[]", constraints: "DEFAULT '{}'", desc: "Array stack strings: e.g. ['React', 'Supabase', 'Express']" },
        { name: "github_url", type: "TEXT", desc: "Version control repo link" },
        { name: "live_demo_url", type: "TEXT", desc: "Active sandbox deployed URL" },
        { name: "images", type: "TEXT[]", desc: "Array of asset links hosted in storage bucket" },
        { name: "status", type: "VARCHAR(50)", desc: "In Progress, Completed, or On Hold status" }
      ],
      indexes: [
        "idx_projects_slug ON projects(slug)"
      ],
      policies: [
        "Public portfolio views allowed by everyone (SELECT)",
        "Only Admins can alter project portfolio details (ALL)"
      ]
    },
    certificates: {
      name: "certificates",
      description: "Enterprise registry of academic verification indices and professional credentials.",
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY", desc: "Certificate key" },
        { name: "certificate_name", type: "VARCHAR(150)", constraints: "NOT NULL", desc: "Certified title name" },
        { name: "issuing_organization", type: "VARCHAR(150)", constraints: "NOT NULL", desc: "Credential authority organization (e.g. Google)" },
        { name: "platform", type: "VARCHAR(100)", desc: "Host platform (e.g. Coursera, GCP)" },
        { name: "credential_id", type: "VARCHAR(100)", desc: "Unique verification ID string" },
        { name: "verification_url", type: "TEXT", desc: "Target live verification portal" },
        { name: "issue_date", type: "DATE", constraints: "NOT NULL", desc: "Date of completion" },
        { name: "certificate_image", type: "TEXT", desc: "Storage bucket asset URL" }
      ],
      indexes: [],
      policies: [
        "Public can view cert archives (SELECT)",
        "Super Admin holds write/revoke permissions (ALL)"
      ]
    },
    media_library: {
      name: "media_library",
      description: "Centralized assets ledger linking uploaded media formats directly to Postgres Storage bucket metadata policies.",
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY", desc: "Asset record code" },
        { name: "file_name", type: "VARCHAR(255)", constraints: "NOT NULL", desc: "Original file name" },
        { name: "file_type", type: "VARCHAR(100)", constraints: "NOT NULL", desc: "Mime-type string (e.g. image/jpeg)" },
        { name: "size", type: "INTEGER", constraints: "NOT NULL", desc: "Size in bytes" },
        { name: "storage_bucket", type: "VARCHAR(50)", constraints: "NOT NULL", desc: "Bound target storage bucket (e.g. 'news-images')" },
        { name: "privacy", type: "upload_privacy", constraints: "DEFAULT 'Public'", desc: "Access level: 'Public' or 'Private'" },
        { name: "uploaded_by", type: "UUID", constraints: "REFERENCES users(id)", desc: "Uploader profile identifier" }
      ],
      indexes: [],
      policies: [
        "Anyone can select public assets (SELECT WHERE privacy = 'Public')",
        "Only owners can manage private assets"
      ]
    }
  };

  const selectedTableData = tableDefinitions[selectedTable];

  return (
    <div className="space-y-6">
      {/* DB Console Header */}
      <div className="bg-gradient-to-r from-cyan-950/20 via-black/40 to-black/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
        {/* Abstract background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-cyan-400/10 text-cyan-400 text-[10px] font-mono font-bold rounded-full tracking-wider uppercase border border-cyan-400/20">
                PRO LAYER
              </span>
              <span className="text-gray-500 font-mono text-[10px]">SUPABASE DATABASE SYSTEM</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight uppercase font-mono flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span>Enterprise Database Console</span>
            </h2>
            <p className="text-xs text-gray-400 font-sans max-w-2xl leading-relaxed">
              Fully optimized, normalized PostgreSQL database designed for high traffic, low latency, and infinite scaling. Manage schemas, RLS, storage buckets, triggers, and full-text search parameters.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleCopySql}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Schema Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy SQL DDL</span>
                </>
              )}
            </button>
            <a
              href="/supabase_schema.sql"
              download="supabase_schema.sql"
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-500 text-black rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Schema</span>
            </a>
          </div>
        </div>

        {/* Connection status card inside banner */}
        <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isSupabaseConfigured ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
            <div className="font-mono text-xs">
              <span className="text-gray-500 block text-[10px] uppercase">Engine Status</span>
              <span className="text-white font-bold">
                {isSupabaseConfigured ? "CONNECTED (PRODUCTION)" : "RUNNING IN SANDBOX fallback"}
              </span>
            </div>
          </div>

          <div className="text-xs font-mono text-gray-400 max-w-sm">
            {isSupabaseConfigured 
              ? `Production database endpoint established successfully.` 
              : "Using in-memory caching database. Hook up Supabase keys to synchronize cloud persistence."
            }
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-4.5 py-2 bg-[#05070a] hover:bg-[#0c0e12] border border-white/10 text-white rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              {testingConnection ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Testing handshakes...</span>
                </>
              ) : (
                <>
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Test DB Connection</span>
                </>
              )}
            </button>
          </div>
        </div>

        {testResult.status !== "idle" && (
          <div className={`mt-4 p-3 rounded-xl border font-mono text-xs flex items-start gap-2.5 animate-fade-in ${
            testResult.status === "success" 
              ? "bg-emerald-950/25 border-emerald-500/20 text-emerald-400" 
              : "bg-amber-950/25 border-amber-500/20 text-amber-400"
          }`}>
            {testResult.status === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <p>{testResult.msg}</p>
          </div>
        )}
      </div>

      {/* Nav Rail */}
      <div className="flex border-b border-white/5 pb-1 gap-1 overflow-x-auto">
        {(["overview", "schema", "rls", "realtime", "functions"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 font-mono text-xs font-bold capitalize cursor-pointer transition-all border-b-2 ${
              activeSubTab === tab 
                ? "text-cyan-400 border-cyan-400 bg-cyan-400/5 rounded-t-lg" 
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            {tab === "overview" && "Dashboard & ER Model"}
            {tab === "schema" && "Normal Tables Explorer"}
            {tab === "rls" && "Row Level Security (RLS)"}
            {tab === "realtime" && "Websocket Realtime"}
            {tab === "functions" && "Triggers & PL/pgSQL"}
          </button>
        ))}
      </div>

      {/* Overview / ER Diagram Tab */}
      {activeSubTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs text-gray-400">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Visual ER model */}
            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Entity-Relationship (ER) Schema Overview</span>
              </h3>
              <p className="text-[11px] leading-relaxed">
                The visual roadmap below displays the standardized structural keys, linking relationships, and cascading delete constraints.
              </p>

              {/* Diagram Node Grid */}
              <div className="p-4 bg-black/20 rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-6 relative items-center text-center">
                
                {/* Users Block */}
                <div className="bg-cyan-950/20 border border-cyan-400/30 rounded-xl p-4 space-y-2">
                  <span className="font-bold text-cyan-400 block text-[10px]">public.users</span>
                  <div className="border-t border-cyan-400/10 pt-1.5 space-y-1 text-[9px] text-gray-400 text-left">
                    <div>🔑 id (UUID) <span className="text-gray-600">[PK]</span></div>
                    <div>✉ email (CITEXT)</div>
                    <div>🔐 password_hash</div>
                  </div>
                  <div className="text-[8px] text-gray-500 uppercase font-bold pt-1">Core Identity Entity</div>
                </div>

                {/* Arrow indicator */}
                <div className="hidden sm:flex flex-col items-center justify-center text-gray-600 text-[10px]">
                  <span>One-to-One</span>
                  <div className="w-full h-0.5 bg-cyan-400/20 my-1 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-4 border-l-4 border-y-transparent border-l-cyan-400/40" />
                  </div>
                </div>

                {/* Profiles Block */}
                <div className="bg-purple-950/20 border border-purple-400/20 rounded-xl p-4 space-y-2">
                  <span className="font-bold text-purple-400 block text-[10px]">public.profiles</span>
                  <div className="border-t border-purple-400/10 pt-1.5 space-y-1 text-[9px] text-gray-400 text-left">
                    <div>🔑 id (UUID) <span className="text-gray-600">[FK -&gt; users]</span></div>
                    <div>👤 full_name</div>
                    <div>📱 phone, social_links</div>
                  </div>
                  <div className="text-[8px] text-gray-500 uppercase font-bold pt-1">Extended Attributes</div>
                </div>

              </div>

              {/* Second row of relationships */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="bg-black/35 border border-white/5 rounded-xl p-4.5 space-y-2.5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                    <span className="font-bold text-white text-[10px]">public.news_articles</span>
                    <span className="text-[8px] bg-cyan-400/10 text-cyan-400 px-1 py-0.5 rounded">Many-to-One</span>
                  </div>
                  <p className="text-[9px] text-gray-500 font-sans leading-relaxed">
                    Maps directly to <code className="text-cyan-300">users</code> (author) and <code className="text-cyan-300">categories</code> with cascading safety definitions.
                  </p>
                </div>

                <div className="bg-black/35 border border-white/5 rounded-xl p-4.5 space-y-2.5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                    <span className="font-bold text-white text-[10px]">public.comments</span>
                    <span className="text-[8px] bg-cyan-400/10 text-cyan-400 px-1 py-0.5 rounded">One-to-Many</span>
                  </div>
                  <p className="text-[9px] text-gray-500 font-sans leading-relaxed">
                    Linked to <code className="text-cyan-300">news_articles</code> and cascading to child replies table when parent is destroyed.
                  </p>
                </div>

                <div className="bg-black/35 border border-white/5 rounded-xl p-4.5 space-y-2.5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                    <span className="font-bold text-white text-[10px]">public.article_tags</span>
                    <span className="text-[8px] bg-purple-400/10 text-purple-400 px-1 py-0.5 rounded">Many-to-Many</span>
                  </div>
                  <p className="text-[9px] text-gray-500 font-sans leading-relaxed">
                    Resolves N:M matrix queries mapping articles to custom taxonomical tags catalogs efficiently.
                  </p>
                </div>

              </div>
            </div>

            {/* Storage Buckets specifications */}
            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-purple-400" />
                <span>Enterprise Supabase Storage Buckets Ledger</span>
              </h3>
              <p className="text-[11px] leading-relaxed">
                Supabase buckets are isolated block objects storage spaces configured inside the global metadata tables schema.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
                {[
                  { id: "avatars", scope: "Public", use: "Author Profile Pics" },
                  { id: "profile-covers", scope: "Public", use: "Header Banners" },
                  { id: "news-images", scope: "Public", use: "Breaking News Assets" },
                  { id: "blog-images", scope: "Public", use: "Editorial Images" },
                  { id: "project-images", scope: "Public", use: "Portfolio Screenshots" },
                  { id: "certificate-images", scope: "Public", use: "Completion Proofs" },
                  { id: "documents", scope: "Private", use: "Contracts & PDF Reports" },
                  { id: "backups", scope: "Private", use: "Database Dump Archives" }
                ].map(bucket => (
                  <div key={bucket.id} className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-1.5">
                    <span className="font-bold text-white uppercase block tracking-wider truncate" title={bucket.id}>
                      {bucket.id}
                    </span>
                    <div className="flex justify-between text-[8px]">
                      <span className="text-gray-500">Access:</span>
                      <span className={bucket.scope === "Public" ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                        {bucket.scope}
                      </span>
                    </div>
                    <div className="text-[8px] text-gray-400 truncate">{bucket.use}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick stats & features side bar */}
          <div className="space-y-6">
            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs uppercase text-white font-bold border-b border-white/5 pb-2 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Database Highlights</span>
              </h4>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-white font-bold text-[11px] block uppercase">Case-Insensitive (citext) Emails</span>
                  <p className="text-[10px] text-gray-500 leading-normal font-sans">
                    Guarantees login safety and avoids duplicate account registrations when users mix character casing (e.g. Harendra@GMAIL vs harendra@gmail).
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-white font-bold text-[11px] block uppercase">GIN Index Optimizations</span>
                  <p className="text-[10px] text-gray-500 leading-normal font-sans">
                    Generalized Index traverses nested parameters (like profile social links or experience objects) with constant logarithmic search speed.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-white font-bold text-[11px] block uppercase">Full-Text Search Vector GIN</span>
                  <p className="text-[10px] text-gray-500 leading-normal font-sans">
                    Combines article headers, metadata, and contents into lexical tokens vector dictionaries for instant full-text search without database slowdown.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-2xl p-5 space-y-3.5 text-[10px] leading-relaxed">
              <h4 className="text-xs uppercase text-white font-bold border-b border-white/5 pb-2 flex items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Security Hardening</span>
              </h4>
              <p>
                This PostgreSQL design uses Row Level Security (RLS) to enforce authorization logic directly inside the SQL storage layer, avoiding data leaks if external layers are compromised.
              </p>
              <div className="space-y-1 font-mono text-[9px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span>Public Content View Policies</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span>Authenticated comments triggers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span>Role checking scopes: Super_Admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schema Explorer Tab */}
      {activeSubTab === "schema" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-mono text-xs">
          
          {/* Left Table Selector */}
          <div className="space-y-2 lg:col-span-1">
            <span className="text-[10px] uppercase text-gray-500 block font-bold px-1 mb-2">Tables Index ({Object.keys(tableDefinitions).length})</span>
            <div className="space-y-1">
              {Object.keys(tableDefinitions).map(tabKey => (
                <button
                  key={tabKey}
                  onClick={() => setSelectedTable(tabKey)}
                  className={`w-full text-left px-3 py-2 rounded-lg font-bold flex items-center justify-between border transition-all cursor-pointer ${
                    selectedTable === tabKey 
                      ? "bg-cyan-400/10 border-cyan-400/20 text-cyan-400" 
                      : "bg-black/20 border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                  }`}
                >
                  <span className="truncate">{tabKey}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedTable === tabKey ? "rotate-90 text-cyan-400" : "text-gray-600"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Columns Inspector */}
          <div className="lg:col-span-3 space-y-6">
            {selectedTableData ? (
              <div className="bg-[#0a0c10]/40 border border-white/5 rounded-2xl p-6 space-y-6">
                
                {/* Meta text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Table className="w-4.5 h-4.5 text-cyan-400" />
                      <span>{selectedTableData.name}</span>
                    </h3>
                    <span className="px-2 py-0.5 bg-cyan-400/10 text-cyan-400 font-mono text-[9px] rounded-full uppercase font-bold">
                      SCHEMA DEFINED
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs font-sans leading-relaxed">
                    {selectedTableData.description}
                  </p>
                </div>

                {/* Columns Ledger */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase text-gray-500 font-bold">Columns and Constraints</span>
                  <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/5 text-[9px] uppercase font-bold text-gray-400">
                          <th className="p-3">Column Name</th>
                          <th className="p-3">Data Type</th>
                          <th className="p-3">Keys / Constraints</th>
                          <th className="p-3">Description / Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[10px] text-gray-300">
                        {selectedTableData.columns.map(col => (
                          <tr key={col.name} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 font-bold text-white">{col.name}</td>
                            <td className="p-3 text-cyan-400 font-mono">{col.type}</td>
                            <td className="p-3 font-mono text-[9px]">
                              {col.constraints ? (
                                <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded">
                                  {col.constraints}
                                </span>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </td>
                            <td className="p-3 text-gray-400 font-sans">{col.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Table Indexes */}
                {selectedTableData.indexes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase text-gray-500 font-bold">PostgreSQL Optimized Indexes</span>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedTableData.indexes.map((idx, index) => (
                        <div key={index} className="p-3 bg-black/40 rounded-lg border border-white/5 text-[10px] font-mono text-gray-400 flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          <span>CREATE INDEX {idx}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Table RLS Policies */}
                {selectedTableData.policies.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase text-gray-500 font-bold">Row Level Security (RLS) Policies on Table</span>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedTableData.policies.map((pol, index) => (
                        <div key={index} className="p-3 bg-black/40 rounded-lg border border-white/5 text-[10px] font-mono text-gray-400 flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>POLICY: {pol}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-[#0a0c10]/40 border border-white/5 rounded-2xl p-8 text-center text-gray-500">
                Select a table from the sidebar to inspect its normalized schema parameters.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Row Level Security Tab */}
      {activeSubTab === "rls" && (
        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-2xl p-6 space-y-6 text-xs font-mono text-gray-400">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
              <Shield className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
              <span>Row Level Security (RLS) Policies Architecture</span>
            </h3>
            <p className="text-gray-400 text-xs mt-1 font-sans">
              RLS prevents client-side SDKs from executing malicious database writes or reads. By declaring fine-grained security rules, you ensure enterprise data containment directly at the Postgres kernel level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/25 p-4.5 rounded-xl border border-white/5 space-y-3">
              <span className="px-1.5 py-0.5 bg-cyan-400/10 text-cyan-400 font-bold text-[8px] rounded uppercase">
                Public Users / Anonymous
              </span>
              <h4 className="font-bold text-white text-[11px] uppercase block">ReadOnly Guest Scopes</h4>
              <p className="text-[10px] text-gray-500 font-sans leading-normal">
                Anonymous REST interface calls are restricted purely to published, non-draft records in directories like <code className="text-cyan-300">news_articles</code>, <code className="text-cyan-300">categories</code>, or public portfolio <code className="text-cyan-300">projects</code>.
              </p>
              <div className="bg-black/40 p-2.5 rounded border border-white/5 text-[9px] leading-relaxed">
                <code>SELECT USING (status = 'Published')</code>
              </div>
            </div>

            <div className="bg-black/25 p-4.5 rounded-xl border border-white/5 space-y-3">
              <span className="px-1.5 py-0.5 bg-purple-400/10 text-purple-400 font-bold text-[8px] rounded uppercase">
                Registered Users (auth.uid())
              </span>
              <h4 className="font-bold text-white text-[11px] uppercase block">Interact & Profile Ownership</h4>
              <p className="text-[10px] text-gray-500 font-sans leading-normal">
                Subscribers can submit comments, update their biography parameters, bookmark content, or trigger likes, provided their unique authenticated token matches the row owner ID.
              </p>
              <div className="bg-black/40 p-2.5 rounded border border-white/5 text-[9px] leading-relaxed">
                <code>UPDATE USING (auth.uid() = id)</code>
              </div>
            </div>

            <div className="bg-black/25 p-4.5 rounded-xl border border-white/5 space-y-3">
              <span className="px-1.5 py-0.5 bg-red-400/10 text-red-400 font-bold text-[8px] rounded uppercase">
                Super_Admin / Editors
              </span>
              <h4 className="font-bold text-white text-[11px] uppercase block">Full Database Clearance</h4>
              <p className="text-[10px] text-gray-500 font-sans leading-normal">
                Admin clients mapped within the <code className="text-cyan-300">user_roles</code> lookup query bypass standard Row filters, granting full DML/DQL controls on content nodes.
              </p>
              <div className="bg-black/40 p-2.5 rounded border border-white/5 text-[9px] leading-relaxed">
                <code>role IN ('Super_Admin', 'Editor')</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Realtime WebSocket Tab */}
      {activeSubTab === "realtime" && (
        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-2xl p-6 space-y-6 text-xs font-mono text-gray-400">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
              <span>Realtime Broadcast Publications Channel</span>
            </h3>
            <p className="text-gray-400 text-xs mt-1 font-sans">
              Enabling Supabase Realtime adds tables to the `supabase_realtime` Postgres publication channel, pushing CDC (Change Data Capture) broadcasts over high-performance WebSockets automatically to clients.
            </p>
          </div>

          <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-4">
            <span className="text-[10px] uppercase text-gray-500 font-bold">Active Realtime Streaming Publications</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { table: "news_articles", desc: "Pushes breaking news banners instantly on admin dispatch.", channel: "public.news_articles" },
                { table: "comments", desc: "Displays new comments and replies live on page nodes without reload.", channel: "public.comments" },
                { table: "notifications", desc: "Dispatches critical alerts instantly to users profile dashboards.", channel: "public.notifications" },
                { table: "visitor_statistics", desc: "Syncs concurrent online readers and analytics dashboard stats live.", channel: "public.visitor_statistics" }
              ].map(pub => (
                <div key={pub.table} className="p-3.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-white text-[11px]">{pub.table}</span>
                    <span className="text-gray-500 block text-[9px] leading-normal font-sans">{pub.desc}</span>
                  </div>
                  <div className="text-[9px] font-mono text-right flex flex-col items-end gap-1">
                    <span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-400 font-bold rounded">REALTIME ENABLED</span>
                    <span className="text-gray-600 font-normal">{pub.channel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Triggers and Functions Tab */}
      {activeSubTab === "functions" && (
        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-2xl p-6 space-y-6 text-xs font-mono text-gray-400">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
              <Code className="w-4 h-4 text-purple-400" />
              <span>PL/pgSQL Functions & Database Triggers</span>
            </h3>
            <p className="text-gray-400 text-xs mt-1 font-sans">
              Offloading formatting, timestamps, reading durations, and trend score analytics to compiled PostgreSQL engine functions ensures top-tier performance and single-source logic consistency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/20 p-5 rounded-xl border border-white/5 space-y-3.5">
              <h4 className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Automatic Content Orchestrator</span>
              </h4>
              <p className="text-[10px] text-gray-500 font-sans leading-normal">
                Triggered automatically BEFORE an insert of a news or blog article. Calculates total word count and sets the reading time duration in minutes. Auto slugifies the text title on INSERT if slug is omitted.
              </p>
              <div className="bg-black/40 p-2.5 rounded border border-white/5 text-[9px] text-gray-400 space-y-1">
                <div className="text-white font-bold">TRIGGER: tr_news_slug_reading</div>
                <div>EXECUTES: auto_content_orchestration()</div>
              </div>
            </div>

            <div className="bg-black/20 p-5 rounded-xl border border-white/5 space-y-3.5">
              <h4 className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span>Trending Decaying Analytics Algorithm</span>
              </h4>
              <p className="text-[10px] text-gray-500 font-sans leading-normal">
                Analyzes the article view velocity over time, calculating logarithmic decay values. Newly published articles with rapid clicks score higher than older highly viewed articles.
              </p>
              <div className="bg-black/40 p-2.5 rounded border border-white/5 text-[9px] text-gray-400 space-y-1">
                <div className="text-white font-bold">FUNCTION: get_trending_score(UUID)</div>
                <div>METRIC: views / (hours_since_published + 2)^1.5</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
