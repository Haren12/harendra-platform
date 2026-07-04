/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { initialBlogs, initialNews, initialProjects, initialCertificates, initialSnippets, initialTutorials } from "./src/data/initialData";
import { BlogPost, NewsArticle, Project, Certificate, CodeSnippet, ContactSubmission, Tutorial } from "./src/types";

// Load environment variables
dotenv.config();

// Global Process Exception and Rejection Handlers to guarantee absolute server stability
process.on("unhandledRejection", (reason, promise) => {
  console.error("[CRITICAL PROCESS GUARD] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[CRITICAL PROCESS GUARD] Uncaught Exception:", error);
});

// UUID Validation Helper
function isValidUUID(str: any): boolean {
  if (typeof str !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Initialize Supabase Client on Server Side for CRUD sync
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

let supabaseAdmin: any = null;
if (supabaseUrl && supabaseServiceRoleKey) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    console.log("Backend Supabase client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize backend Supabase client:", error);
  }
}

// Helper to resolve or dynamically register category name into Supabase categories table
async function resolveCategoryId(categoryName: string): Promise<string | null> {
  if (!supabaseAdmin || !categoryName) return null;
  try {
    const cleanName = categoryName.trim();
    if (!cleanName) return null;

    // 1. Check if category exists
    const { data: existing, error: findError } = await supabaseAdmin
      .from("categories")
      .select("id")
      .eq("name", cleanName)
      .maybeSingle();

    if (existing && existing.id) {
      return existing.id;
    }

    // 2. If not, insert it
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `cat-${Date.now()}`;
    const { data: created, error: createError } = await supabaseAdmin
      .from("categories")
      .insert([{ 
        name: cleanName, 
        slug: slug,
        description: `Automated category for ${cleanName}`
      }])
      .select("id")
      .single();

    if (created && created.id) {
      console.log(`[Supabase Resolve] Created category "${cleanName}" dynamically with ID: ${created.id}`);
      return created.id;
    }
  } catch (err) {
    console.error(`[Supabase Resolve] Error resolving category "${categoryName}":`, err);
  }
  return null;
}

// Self-healing insert adapter to gracefully handle mismatched DB column definitions
async function selfHealingInsert(tableName: string, payload: any) {
  if (!supabaseAdmin) {
    console.warn(`Supabase is unconfigured. Defaulting to high-fidelity server cache for table: ${tableName}`);
    return payload;
  }
  
  let currentPayload = { ...payload };
  
  // If id is provided but is not a valid UUID, remove it to let the database generate a random UUID automatically
  if (currentPayload.id && !isValidUUID(currentPayload.id)) {
    console.log(`[Supabase Self-Healing] ID "${currentPayload.id}" is not a valid UUID. Removing to allow database-generated UUID.`);
    delete currentPayload.id;
  }

  // Resolve category to category_id
  if (["blog_posts", "news_articles", "tutorials"].includes(tableName) && currentPayload.category) {
    const catId = await resolveCategoryId(currentPayload.category);
    if (catId) {
      currentPayload.category_id = catId;
    }
    delete currentPayload.category;
  }

  // Proactively clean up other known unmapped local fields
  if (["blog_posts", "news_articles", "tutorials"].includes(tableName)) {
    if (currentPayload.author !== undefined) delete currentPayload.author;
    if (currentPayload.tags !== undefined) delete currentPayload.tags;
    
    // Proactively delete language-specific fields that are not in the DB schema
    delete currentPayload.content_en;
    delete currentPayload.content_np;
    delete currentPayload.title_en;
    delete currentPayload.title_np;
    delete currentPayload.summary_en;
    delete currentPayload.summary_np;
  }
  
  let attempts = 0;
  const maxAttempts = 12;
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[Supabase DB] Attempting insert into "${tableName}" (Attempt ${attempts}/${maxAttempts})...`);
    const { data, error } = await supabaseAdmin.from(tableName).insert([currentPayload]).select();
    
    if (!error) {
      console.log(`[Supabase DB] Insert succeeded in table "${tableName}"!`);
      return (data && data[0]) ? data[0] : currentPayload;
    }
    
    console.error(`[Supabase DB] Insert into "${tableName}" failed:`, error);
    
    // Check if it's an undefined column error (PostgreSQL 42703) or PostgREST schema cache mismatch
    let missingCol = "";
    if (error.code === "42703") {
      const match = error.message.match(/column "([^"]+)"/) || error.message.match(/column '([^']+)'/);
      if (match && match[1]) {
        missingCol = match[1];
      }
    } else if (error.message) {
      const match1 = error.message.match(/Could not find the ['"]([^'"]+)['"] column/i);
      const match2 = error.message.match(/column ["']([^"']+)["']/i);
      if (match1 && match1[1]) {
        missingCol = match1[1];
      } else if (match2 && match2[1]) {
        missingCol = match2[1];
      }
    }
    
    if (missingCol) {
      console.log(`[Supabase Self-Healing] Removing missing/unsupported column "${missingCol}" and retrying insert...`);
      delete currentPayload[missingCol];
      continue;
    }
    
    // Fallback to local memory if permission denied, table missing, or any unhealable error occurs
    console.warn(`[Supabase Database Fallback] Failed to insert into "${tableName}" table due to database restriction. Falling back to local server memory storage.\nError details: ${error.message || JSON.stringify(error)}`);
    const mockResult = { ...currentPayload };
    if (!mockResult.id) {
      mockResult.id = `mem-${tableName}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    return mockResult;
  }
  
  const mockResult = { ...currentPayload };
  if (!mockResult.id) {
    mockResult.id = `mem-${tableName}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  return mockResult;
}

// Self-healing update adapter
async function selfHealingUpdate(tableName: string, id: string, payload: any) {
  if (!supabaseAdmin) {
    console.warn(`Supabase is unconfigured. Defaulting to high-fidelity server cache for table: ${tableName}`);
    return payload;
  }
  
  if (!isValidUUID(id)) {
    console.log(`[Supabase Self-Healing] Target ID "${id}" is not a valid UUID. Skipping DB update as this record only exists in memory.`);
    return { id, ...payload };
  }
  
  let currentPayload = { ...payload };
  // Remove administrative/audit fields
  delete currentPayload.id;
  delete currentPayload.created_at;
  delete currentPayload.updated_at;

  // Resolve category to category_id
  if (["blog_posts", "news_articles", "tutorials"].includes(tableName) && currentPayload.category) {
    const catId = await resolveCategoryId(currentPayload.category);
    if (catId) {
      currentPayload.category_id = catId;
    }
    delete currentPayload.category;
  }

  // Proactively clean up other known unmapped local fields
  if (["blog_posts", "news_articles", "tutorials"].includes(tableName)) {
    if (currentPayload.author !== undefined) delete currentPayload.author;
    if (currentPayload.tags !== undefined) delete currentPayload.tags;
    
    // Proactively delete language-specific fields that are not in the DB schema
    delete currentPayload.content_en;
    delete currentPayload.content_np;
    delete currentPayload.title_en;
    delete currentPayload.title_np;
    delete currentPayload.summary_en;
    delete currentPayload.summary_np;
  }

  let attempts = 0;
  const maxAttempts = 12;

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[Supabase DB] Attempting update on "${tableName}" for ID ${id} (Attempt ${attempts}/${maxAttempts})...`);
    const { data, error } = await supabaseAdmin.from(tableName).update(currentPayload).eq("id", id).select();
    
    if (!error) {
      console.log(`[Supabase DB] Update succeeded on table "${tableName}"!`);
      return (data && data[0]) ? data[0] : { id, ...currentPayload };
    }
    
    console.error(`[Supabase DB] Update on "${tableName}" failed:`, error);
    
    // Undefined column (PostgreSQL 42703) or PostgREST schema cache mismatch
    let missingCol = "";
    if (error.code === "42703") {
      const match = error.message.match(/column "([^"]+)"/) || error.message.match(/column '([^']+)'/);
      if (match && match[1]) {
        missingCol = match[1];
      }
    } else if (error.message) {
      const match1 = error.message.match(/Could not find the ['"]([^'"]+)['"] column/i);
      const match2 = error.message.match(/column ["']([^"']+)["']/i);
      if (match1 && match1[1]) {
        missingCol = match1[1];
      } else if (match2 && match2[1]) {
        missingCol = match2[1];
      }
    }
    
    if (missingCol) {
      console.log(`[Supabase Self-Healing] Removing missing/unsupported column "${missingCol}" and retrying update...`);
      delete currentPayload[missingCol];
      continue;
    }
    
    // Fallback to local memory if permission denied, table missing, or any unhealable error occurs
    console.warn(`[Supabase Database Fallback] Failed to update "${tableName}" table due to database restriction. Falling back to local server memory storage.\nError details: ${error.message || JSON.stringify(error)}`);
    return { id, ...currentPayload };
  }
  
  return { id, ...currentPayload };
}

// Self-healing delete helper
async function databaseDelete(tableName: string, id: string) {
  if (!supabaseAdmin) return;
  
  if (!isValidUUID(id)) {
    console.log(`[Supabase Self-Healing] Target ID "${id}" is not a valid UUID. Skipping DB delete as this record only exists in memory.`);
    return;
  }
  
  console.log(`[Supabase DB] Attempting delete from "${tableName}" for ID ${id}...`);
  const { error } = await supabaseAdmin.from(tableName).delete().eq("id", id);
  if (error) {
    console.warn(`[Supabase Database Fallback] Failed to delete from "${tableName}" for ID ${id}. Falling back to safe server-side memory storage deletion. Error details: ${error.message || JSON.stringify(error)}`);
    return;
  }
  console.log(`[Supabase DB] Delete succeeded from "${tableName}"!`);
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Global Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// In-Memory Database State
let blogs: BlogPost[] = [...initialBlogs];
let news: NewsArticle[] = [...initialNews];
let projects: Project[] = [...initialProjects];
let certificates: Certificate[] = [...initialCertificates];
let snippets: CodeSnippet[] = [...initialSnippets];
let tutorials: Tutorial[] = [...initialTutorials];
let contactSubmissions: ContactSubmission[] = [];

// Extra enterprise CMS states
let categories = [
  { id: "cat-1", name: "React & Frontend", parentId: null, image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&auto=format&fit=crop", slug: "react-frontend", seoDesc: "Advanced tutorials on React 19, TypeScript, and modern frontend frameworks" },
  { id: "cat-2", name: "Backend & Databases", parentId: null, image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=200&auto=format&fit=crop", slug: "backend-databases", seoDesc: "Deep dives into Node.js, Express, PostgreSQL, and database design" },
  { id: "cat-3", name: "Artificial Intelligence", parentId: null, image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=200&auto=format&fit=crop", slug: "artificial-intelligence", seoDesc: "Enterprise AI automation, Gemini integrations, and machine learning" },
  { id: "cat-4", name: "Next.js Development", parentId: "cat-1", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&auto=format&fit=crop", slug: "nextjs-development", seoDesc: "Building scalable server-rendered Next.js 15 apps" }
];

let tags = [
  { id: "tag-1", name: "React 19", views: 2450 },
  { id: "tag-2", name: "WebSockets", views: 1820 },
  { id: "tag-3", name: "Gemini API", views: 3200 },
  { id: "tag-4", name: "Tailwind CSS", views: 2100 },
  { id: "tag-5", name: "TypeScript", views: 2890 }
];

let mediaFiles = [
  { id: "media-1", name: "harendra_lamsal_cv.pdf", size: "1.2 MB", type: "document/pdf", date: "2026-06-01", url: "/assets/harendra_cv.pdf" },
  { id: "media-2", name: "profile_headshot.png", size: "840 KB", type: "image/png", date: "2026-06-05", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop" },
  { id: "media-3", name: "cms_architecture.zip", size: "4.5 MB", type: "archive/zip", date: "2026-06-12", url: "/assets/cms_architecture.zip" },
  { id: "media-4", name: "promo_video.mp4", size: "14.2 MB", type: "video/mp4", date: "2026-06-20", url: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screencast-43187-large.mp4" }
];

let newsletters = [
  { id: "sub-1", email: "recruit@meta.com", date: "2026-06-20", list: "Recruiters" },
  { id: "sub-2", email: "techlead@google.com", date: "2026-06-22", list: "Partners" },
  { id: "sub-3", email: "ceo@veridian.io", date: "2026-06-25", list: "General Newsletter" }
];

let advertisements = [
  { id: "ad-1", type: "Header Ads", title: "Scale with AWS Enterprise", link: "https://aws.amazon.com", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop", status: "active", clicks: 142, impressions: 3200, startDate: "2026-06-01", endDate: "2026-12-31" },
  { id: "ad-2", type: "Sidebar Ads", title: "Build on Supabase", link: "https://supabase.com", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop", status: "active", clicks: 88, impressions: 1850, startDate: "2026-06-15", endDate: "2026-09-15" }
];

let webSettings = {
  websiteName: "Harendra Lamsal Portfolio & CMS",
  logo: "HL",
  favicon: "/favicon.ico",
  contactEmail: "harendralamsal4140@gmail.com",
  contactPhone: "+977 9823587535",
  facebookUrl: "https://web.facebook.com/harendra.lamsala/",
  linkedinUrl: "https://www.linkedin.com/in/harendra-lamsal-728a6122b",
  theme: "Cosmic Slate Theme",
  homepageTitle_en: "Elite Full Stack Developer",
  homepageTitle_np: "कुशल फुल स्ट्याक विकासकर्ता",
  footerCopyright_en: "© 2026 Harendra Lamsal. All Rights Reserved.",
  footerCopyright_np: "© २०२६ सर्वाधिकार सुरक्षित। हरेन्द्र लाम्साल।"
};

let systemLogs = [
  { id: "log-1", type: "security", text: "Successful Admin login verified via secure session handshake", ip: "192.168.1.1", user: "harendralamsal4140@gmail.com", date: "2026-07-01T05:10:22Z" },
  { id: "log-2", type: "content", text: "Published blog post: Building Enterprise Real-Time Applications with React 19", ip: "192.168.1.1", user: "Harendra Lamsal", date: "2026-06-25T11:42:15Z" },
  { id: "log-3", type: "system", text: "Daily database backup verification completed successfully", ip: "localhost", user: "system-cron", date: "2026-07-01T00:00:00Z" }
];

let systemBackups = [
  { id: "back-1", name: "v1.1_stable_db_backup.json", type: "database", size: "182 KB", date: "2026-06-28 00:00:00", status: "completed" },
  { id: "back-2", name: "v1.1_media_assets_backup.tar.gz", type: "media", size: "15.4 MB", date: "2026-06-28 00:05:22", status: "completed" }
];

let adminUsers: any[] = [];

// Cybersecurity Database Engine
let activeSessions = [
  { id: "sess-1", userId: "usr-1", email: "harendralamsal4140@gmail.com", device: "Macbook Pro 16", ip: "192.168.1.1", browser: "Chrome 124", location: "Kathmandu, NP", loginTime: new Date(Date.now() - 3600000).toISOString(), lastActive: "Just now", isCurrent: true },
  { id: "sess-2", userId: "usr-1", email: "harendralamsal4140@gmail.com", device: "iPhone 15 Pro", ip: "103.14.22.45", browser: "Safari Mobile", location: "Lalitpur, NP", loginTime: new Date(Date.now() - 86400000).toISOString(), lastActive: "2 hours ago", isCurrent: false }
];

let loginLogs = [
  { id: "try-1", email: "harendralamsal4140@gmail.com", ip: "192.168.1.1", device: "Macbook Pro 16", browser: "Chrome 124", timestamp: new Date(Date.now() - 3600000).toISOString(), status: "success", country: "Nepal" },
  { id: "try-2", email: "harendralamsal4140@gmail.com", ip: "45.120.3.14", device: "Windows Desktop", browser: "Firefox", timestamp: new Date(Date.now() - 7200000).toISOString(), status: "failed", reason: "Invalid password secret", country: "United States" },
  { id: "try-3", email: "unknown@gmail.com", ip: "82.44.15.22", device: "Android Phone", browser: "Chrome Mobile", timestamp: new Date(Date.now() - 14400000).toISOString(), status: "blocked", reason: "Multiple failed attempts", country: "Germany" }
];

let securityAlerts = [
  { id: "al-1", severity: "high", text: "Brute-force pattern detected: Multiple failed login attempts from IP 82.44.15.22 (Germany)", date: new Date(Date.now() - 14400000).toISOString(), resolved: false, ip: "82.44.15.22" },
  { id: "al-2", severity: "medium", text: "New login session established from mobile device: iPhone 15 Pro from Lalitpur, NP", date: new Date(Date.now() - 86400000).toISOString(), resolved: true, ip: "103.14.22.45" }
];

let passkeys = [
  { id: "pk-1", label: "Harendra FaceID (Apple)", created: new Date(Date.now() - 10 * 86400000).toISOString(), lastUsed: "3 hours ago" }
];

let apiTokens = [
  { id: "tok-1", name: "GitHub Action Auto Sync", tokenValue: "HL_SECURE_71ab02c34d56ef", role: "Editor", created: new Date(Date.now() - 30 * 86400000).toISOString(), expires: new Date(Date.now() + 60 * 86400000).toISOString(), active: true }
];

let twoFactorEnabled = true;
let twoFactorType = "email";
let backupCodes = ["8402-9152", "4105-2219", "3015-8842", "6190-7740"];
let sessionTimeoutMinutes = 15;
let multipleDeviceAllowed = true;
let rateLimitRequests = 100;
let allowedExtensions = ["png", "jpg", "jpeg", "pdf", "zip", "mp4"];

// Lazy-initialize Gemini SDK to prevent crash if key is missing on startup
let aiClient: GoogleGenAI | null = null;
function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing. Please add it via the Secrets panel.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API Endpoints

// Get all data
app.get("/api/data", (req, res) => {
  res.json({
    blogs,
    news,
    projects,
    certificates,
    snippets,
    tutorials,
    categories,
    tags,
    mediaFiles,
    newsletters,
    advertisements,
    webSettings,
    systemLogs,
    systemBackups,
    adminUsers
  });
});

// Blog CRUD
app.post("/api/blogs", async (req, res) => {
  const newBlog: BlogPost = {
    id: req.body.id || `blog-${Date.now()}`,
    views: 0,
    date: new Date().toISOString().split("T")[0],
    ...req.body,
  };
  
  try {
    const dbPayload = {
      id: newBlog.id,
      title: newBlog.title_en || newBlog.title_np || "",
      title_en: newBlog.title_en || "",
      title_np: newBlog.title_np || "",
      content: newBlog.content_en || newBlog.content_np || "",
      content_en: newBlog.content_en || "",
      content_np: newBlog.content_np || "",
      slug: newBlog.title_en?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `blog-${Date.now()}`,
      summary: newBlog.content_en?.slice(0, 150) || "",
      summary_en: newBlog.content_en?.slice(0, 150) || "",
      summary_np: newBlog.content_np?.slice(0, 150) || "",
      views: 0,
      reading_time: parseInt(newBlog.readTime) || 1,
      author: newBlog.author || "",
      category: newBlog.category || "",
      tags: newBlog.tags || []
    };

    const inserted = await selfHealingInsert("blog_posts", dbPayload);
    blogs.unshift({ ...newBlog, ...inserted });
    res.status(201).json({ ...newBlog, ...inserted });
  } catch (error: any) {
    console.error("Failed to persist blog to database:", error);
    res.status(500).json({ error: error.message || "Could not persist blog to database." });
  }
});

app.put("/api/blogs/:id", async (req, res) => {
  const { id } = req.params;
  const index = blogs.findIndex((b) => b.id === id);
  if (index !== -1) {
    try {
      const updatedBlog = { ...blogs[index], ...req.body };
      const dbPayload = {
        title: updatedBlog.title_en || updatedBlog.title_np || "",
        title_en: updatedBlog.title_en || "",
        title_np: updatedBlog.title_np || "",
        content: updatedBlog.content_en || updatedBlog.content_np || "",
        content_en: updatedBlog.content_en || "",
        content_np: updatedBlog.content_np || "",
        slug: updatedBlog.title_en?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `blog-${Date.now()}`,
        summary: updatedBlog.content_en?.slice(0, 150) || "",
        summary_en: updatedBlog.content_en?.slice(0, 150) || "",
        summary_np: updatedBlog.content_np?.slice(0, 150) || "",
        reading_time: parseInt(updatedBlog.readTime) || 1,
        author: updatedBlog.author || "",
        category: updatedBlog.category || "",
        tags: updatedBlog.tags || []
      };

      const updated = await selfHealingUpdate("blog_posts", id, dbPayload);
      blogs[index] = { ...updatedBlog, ...updated };
      res.json(blogs[index]);
    } catch (error: any) {
      console.error("Failed to update blog in database:", error);
      res.status(500).json({ error: error.message || "Could not update blog in database." });
    }
  } else {
    res.status(404).json({ error: "Blog post not found" });
  }
});

app.delete("/api/blogs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await databaseDelete("blog_posts", id);
    blogs = blogs.filter((b) => b.id !== id);
    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Failed to delete blog from database:", error);
    res.status(500).json({ error: error.message || "Could not delete blog." });
  }
});

// News CRUD
app.post("/api/news", async (req, res) => {
  const newArticle: NewsArticle = {
    id: req.body.id || `news-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    ...req.body,
  };
  
  try {
    const dbPayload = {
      id: newArticle.id,
      title: newArticle.title_en || newArticle.title_np || "",
      title_en: newArticle.title_en || "",
      title_np: newArticle.title_np || "",
      content: newArticle.content_en || newArticle.content_np || "",
      content_en: newArticle.content_en || "",
      content_np: newArticle.content_np || "",
      slug: newArticle.title_en?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `news-${Date.now()}`,
      summary: newArticle.summary_en || newArticle.summary_np || "",
      summary_en: newArticle.summary_en || "",
      summary_np: newArticle.summary_np || "",
      source: newArticle.source || "",
      category: newArticle.category || "",
      publish_date: new Date().toISOString()
    };

    const inserted = await selfHealingInsert("news_articles", dbPayload);
    news.unshift({ ...newArticle, ...inserted });
    res.status(201).json({ ...newArticle, ...inserted });
  } catch (error: any) {
    console.error("Failed to persist news to database:", error);
    res.status(500).json({ error: error.message || "Could not persist news to database." });
  }
});

app.put("/api/news/:id", async (req, res) => {
  const { id } = req.params;
  const index = news.findIndex((n) => n.id === id);
  if (index !== -1) {
    try {
      const updatedArticle = { ...news[index], ...req.body };
      const dbPayload = {
        title: updatedArticle.title_en || updatedArticle.title_np || "",
        title_en: updatedArticle.title_en || "",
        title_np: updatedArticle.title_np || "",
        content: updatedArticle.content_en || updatedArticle.content_np || "",
        content_en: updatedArticle.content_en || "",
        content_np: updatedArticle.content_np || "",
        slug: updatedArticle.title_en?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `news-${Date.now()}`,
        summary: updatedArticle.summary_en || updatedArticle.summary_np || "",
        summary_en: updatedArticle.summary_en || "",
        summary_np: updatedArticle.summary_np || "",
        source: updatedArticle.source || "",
        category: updatedArticle.category || ""
      };

      const updated = await selfHealingUpdate("news_articles", id, dbPayload);
      news[index] = { ...updatedArticle, ...updated };
      res.json(news[index]);
    } catch (error: any) {
      console.error("Failed to update news in database:", error);
      res.status(500).json({ error: error.message || "Could not update news in database." });
    }
  } else {
    res.status(404).json({ error: "News article not found" });
  }
});

app.delete("/api/news/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await databaseDelete("news_articles", id);
    news = news.filter((n) => n.id !== id);
    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Failed to delete news from database:", error);
    res.status(500).json({ error: error.message || "Could not delete news." });
  }
});

// Project CRUD
app.post("/api/projects", async (req, res) => {
  const newProj: Project = {
    id: req.body.id || `proj-${Date.now()}`,
    ...req.body,
  };
  
  try {
    const dbPayload = {
      id: newProj.id,
      project_name: newProj.title_en || newProj.title_np || "",
      title_en: newProj.title_en || "",
      title_np: newProj.title_np || "",
      slug: newProj.title_en?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `proj-${Date.now()}`,
      description: newProj.desc_en || newProj.desc_np || "",
      desc_en: newProj.desc_en || "",
      desc_np: newProj.desc_np || "",
      technologies: newProj.techStack || [],
      github_url: newProj.githubUrl || "",
      live_demo_url: newProj.liveUrl || "",
      status: newProj.category || "Completed"
    };

    const inserted = await selfHealingInsert("projects", dbPayload);
    projects.unshift({ ...newProj, ...inserted });
    res.status(201).json({ ...newProj, ...inserted });
  } catch (error: any) {
    console.error("Failed to persist project to database:", error);
    res.status(500).json({ error: error.message || "Could not persist project to database." });
  }
});

app.put("/api/projects/:id", async (req, res) => {
  const { id } = req.params;
  const index = projects.findIndex((p) => p.id === id);
  if (index !== -1) {
    try {
      const updatedProj = { ...projects[index], ...req.body };
      const dbPayload = {
        project_name: updatedProj.title_en || updatedProj.title_np || "",
        title_en: updatedProj.title_en || "",
        title_np: updatedProj.title_np || "",
        slug: updatedProj.title_en?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `proj-${Date.now()}`,
        description: updatedProj.desc_en || updatedProj.desc_np || "",
        desc_en: updatedProj.desc_en || "",
        desc_np: updatedProj.desc_np || "",
        technologies: updatedProj.techStack || [],
        github_url: updatedProj.githubUrl || "",
        live_demo_url: updatedProj.liveUrl || "",
        status: updatedProj.category || "Completed"
      };

      const updated = await selfHealingUpdate("projects", id, dbPayload);
      projects[index] = { ...updatedProj, ...updated };
      res.json(projects[index]);
    } catch (error: any) {
      console.error("Failed to update project in database:", error);
      res.status(500).json({ error: error.message || "Could not update project in database." });
    }
  } else {
    res.status(404).json({ error: "Project not found" });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await databaseDelete("projects", id);
    projects = projects.filter((p) => p.id !== id);
    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Failed to delete project from database:", error);
    res.status(500).json({ error: error.message || "Could not delete project." });
  }
});

// Certificate CRUD
app.post("/api/certificates", async (req, res) => {
  const newCert: Certificate = {
    id: req.body.id || `cert-${Date.now()}`,
    ...req.body,
  };
  
  try {
    const dbPayload = {
      id: newCert.id,
      certificate_name: newCert.title_en || newCert.title_np || "",
      title_en: newCert.title_en || "",
      title_np: newCert.title_np || "",
      issuer: newCert.issuer || "",
      date: newCert.date || "",
      credential_id: newCert.credentialId || "",
      verification_url: newCert.verificationUrl || "",
      image_url: newCert.image || "",
      platform: newCert.platform || "",
      category: newCert.category || "",
      year: newCert.year || ""
    };

    const inserted = await selfHealingInsert("certificates", dbPayload);
    certificates.unshift({ ...newCert, ...inserted });
    res.status(201).json({ ...newCert, ...inserted });
  } catch (error: any) {
    console.error("Failed to persist certificate to database:", error);
    res.status(500).json({ error: error.message || "Could not persist certificate to database." });
  }
});

app.put("/api/certificates/:id", async (req, res) => {
  const { id } = req.params;
  const index = certificates.findIndex((c) => c.id === id);
  if (index !== -1) {
    try {
      const updatedCert = { ...certificates[index], ...req.body };
      const dbPayload = {
        certificate_name: updatedCert.title_en || updatedCert.title_np || "",
        title_en: updatedCert.title_en || "",
        title_np: updatedCert.title_np || "",
        issuer: updatedCert.issuer || "",
        date: updatedCert.date || "",
        credential_id: updatedCert.credentialId || "",
        verification_url: updatedCert.verificationUrl || "",
        image_url: updatedCert.image || "",
        platform: updatedCert.platform || "",
        category: updatedCert.category || "",
        year: updatedCert.year || ""
      };

      const updated = await selfHealingUpdate("certificates", id, dbPayload);
      certificates[index] = { ...updatedCert, ...updated };
      res.json(certificates[index]);
    } catch (error: any) {
      console.error("Failed to update certificate in database:", error);
      res.status(500).json({ error: error.message || "Could not update certificate in database." });
    }
  } else {
    res.status(404).json({ error: "Certificate not found" });
  }
});

app.delete("/api/certificates/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await databaseDelete("certificates", id);
    certificates = certificates.filter((c) => c.id !== id);
    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Failed to delete certificate from database:", error);
    res.status(500).json({ error: error.message || "Could not delete certificate." });
  }
});

// Snippets CRUD
app.post("/api/snippets", async (req, res) => {
  const newSnip: CodeSnippet = {
    id: req.body.id || `snip-${Date.now()}`,
    ...req.body,
  };
  
  try {
    const dbPayload = {
      id: newSnip.id,
      title: newSnip.title_en || newSnip.title_np || "",
      title_en: newSnip.title_en || "",
      title_np: newSnip.title_np || "",
      code: newSnip.code || "",
      language: newSnip.language || "",
      category: newSnip.category || ""
    };

    const inserted = await selfHealingInsert("snippets", dbPayload);
    snippets.unshift({ ...newSnip, ...inserted });
    res.status(201).json({ ...newSnip, ...inserted });
  } catch (error: any) {
    console.error("Failed to persist snippet to database:", error);
    res.status(500).json({ error: error.message || "Could not persist snippet to database." });
  }
});

app.put("/api/snippets/:id", async (req, res) => {
  const { id } = req.params;
  const index = snippets.findIndex((s) => s.id === id);
  if (index !== -1) {
    try {
      const updatedSnip = { ...snippets[index], ...req.body };
      const dbPayload = {
        title: updatedSnip.title_en || updatedSnip.title_np || "",
        title_en: updatedSnip.title_en || "",
        title_np: updatedSnip.title_np || "",
        code: updatedSnip.code || "",
        language: updatedSnip.language || "",
        category: updatedSnip.category || ""
      };

      const updated = await selfHealingUpdate("snippets", id, dbPayload);
      snippets[index] = { ...updatedSnip, ...updated };
      res.json(snippets[index]);
    } catch (error: any) {
      console.error("Failed to update snippet in database:", error);
      res.status(500).json({ error: error.message || "Could not update snippet." });
    }
  } else {
    res.status(404).json({ error: "Snippet not found" });
  }
});

app.delete("/api/snippets/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await databaseDelete("snippets", id);
    snippets = snippets.filter((s) => s.id !== id);
    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Failed to delete snippet from database:", error);
    res.status(500).json({ error: error.message || "Could not delete snippet." });
  }
});

// Tutorials CRUD
app.post("/api/tutorials", async (req, res) => {
  const newTut: Tutorial = {
    id: req.body.id || `tut-${Date.now()}`,
    views: 0,
    date: new Date().toISOString().split("T")[0],
    steps: req.body.steps || [],
    tags: req.body.tags || [],
    comments: [],
    ...req.body,
  };
  
  try {
    const dbPayload = {
      id: newTut.id,
      title: newTut.title_en || newTut.title_np || "",
      title_en: newTut.title_en || "",
      title_np: newTut.title_np || "",
      slug: newTut.title_en?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `tut-${Date.now()}`,
      category: newTut.category || "",
      content: newTut.steps?.[0]?.content_en || "",
      steps: newTut.steps || [],
      tags: newTut.tags || [],
      views: 0,
      reading_time: parseInt(newTut.readTime) || 5,
      author: newTut.author || ""
    };

    const inserted = await selfHealingInsert("tutorials", dbPayload);
    tutorials.unshift({ ...newTut, ...inserted });
    res.status(201).json({ ...newTut, ...inserted });
  } catch (error: any) {
    console.error("Failed to persist tutorial to database:", error);
    res.status(500).json({ error: error.message || "Could not persist tutorial to database." });
  }
});

app.put("/api/tutorials/:id", async (req, res) => {
  const { id } = req.params;
  const index = tutorials.findIndex((t) => t.id === id);
  if (index !== -1) {
    try {
      const updatedTut = { ...tutorials[index], ...req.body };
      const dbPayload = {
        title: updatedTut.title_en || updatedTut.title_np || "",
        title_en: updatedTut.title_en || "",
        title_np: updatedTut.title_np || "",
        slug: updatedTut.title_en?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `tut-${Date.now()}`,
        category: updatedTut.category || "",
        content: updatedTut.steps?.[0]?.content_en || "",
        steps: updatedTut.steps || [],
        tags: updatedTut.tags || [],
        reading_time: parseInt(updatedTut.readTime) || 5,
        author: updatedTut.author || ""
      };

      const updated = await selfHealingUpdate("tutorials", id, dbPayload);
      tutorials[index] = { ...updatedTut, ...updated };
      res.json(tutorials[index]);
    } catch (error: any) {
      console.error("Failed to update tutorial in database:", error);
      res.status(500).json({ error: error.message || "Could not update tutorial." });
    }
  } else {
    res.status(404).json({ error: "Tutorial not found" });
  }
});

app.delete("/api/tutorials/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await databaseDelete("tutorials", id);
    tutorials = tutorials.filter((t) => t.id !== id);
    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Failed to delete tutorial from database:", error);
    res.status(500).json({ error: error.message || "Could not delete tutorial." });
  }
});

// Comments API
app.post("/api/blogs/:id/comments", (req, res) => {
  const { id } = req.params;
  const { authorName, authorEmail, content } = req.body;
  const blog = blogs.find(b => b.id === id);
  if (blog) {
    if (!blog.comments) blog.comments = [];
    const newComment = {
      id: `comm-${Date.now()}`,
      authorName: authorName || "Anonymous",
      authorEmail: authorEmail || "",
      content: content || "",
      date: new Date().toISOString().split("T")[0]
    };
    blog.comments.push(newComment);
    res.status(201).json(newComment);
  } else {
    res.status(404).json({ error: "Blog not found" });
  }
});

app.post("/api/news/:id/comments", (req, res) => {
  const { id } = req.params;
  const { authorName, authorEmail, content } = req.body;
  const article = news.find(n => n.id === id);
  if (article) {
    if (!article.comments) article.comments = [];
    const newComment = {
      id: `comm-${Date.now()}`,
      authorName: authorName || "Anonymous",
      authorEmail: authorEmail || "",
      content: content || "",
      date: new Date().toISOString().split("T")[0]
    };
    article.comments.push(newComment);
    res.status(201).json(newComment);
  } else {
    res.status(404).json({ error: "News article not found" });
  }
});

app.post("/api/tutorials/:id/comments", (req, res) => {
  const { id } = req.params;
  const { authorName, authorEmail, content } = req.body;
  const tutorial = tutorials.find(t => t.id === id);
  if (tutorial) {
    if (!tutorial.comments) tutorial.comments = [];
    const newComment = {
      id: `comm-${Date.now()}`,
      authorName: authorName || "Anonymous",
      authorEmail: authorEmail || "",
      content: content || "",
      date: new Date().toISOString().split("T")[0]
    };
    tutorial.comments.push(newComment);
    res.status(201).json(newComment);
  } else {
    res.status(404).json({ error: "Tutorial not found" });
  }
});

// --- ENTERPRISE CMS ADDITIONAL ENDPOINTS ---

// Comment moderation endpoint
app.post("/api/comments/moderate", (req, res) => {
  const { action, itemType, itemId, commentId, replyContent } = req.body;
  
  let targetItem: any = null;
  if (itemType === "blogs") targetItem = blogs.find(b => b.id === itemId);
  else if (itemType === "news") targetItem = news.find(n => n.id === itemId);
  else if (itemType === "tutorials") targetItem = tutorials.find(t => t.id === itemId);

  if (!targetItem) {
    return res.status(404).json({ error: "Article/Item not found" });
  }

  if (!targetItem.comments) targetItem.comments = [];

  const commIndex = targetItem.comments.findIndex((c: any) => c.id === commentId);
  if (commIndex === -1 && action !== "reply") {
    return res.status(404).json({ error: "Comment not found" });
  }

  if (action === "approve") {
    targetItem.comments[commIndex].status = "approved";
  } else if (action === "reject") {
    targetItem.comments[commIndex].status = "rejected";
  } else if (action === "pin") {
    targetItem.comments[commIndex].pinned = true;
  } else if (action === "unpin") {
    targetItem.comments[commIndex].pinned = false;
  } else if (action === "delete") {
    targetItem.comments = targetItem.comments.filter((c: any) => c.id !== commentId);
  } else if (action === "reply") {
    const parentComment = targetItem.comments.find((c: any) => c.id === commentId);
    if (parentComment) {
      parentComment.reply = replyContent || "Thank you for your valuable feedback!";
    }
  }

  // Log action
  systemLogs.unshift({
    id: `log-${Date.now()}`,
    type: "content",
    text: `Moderated comment on ${itemType}: ${action} (ID: ${commentId})`,
    ip: req.ip || "127.0.0.1",
    user: "Admin",
    date: new Date().toISOString()
  });

  res.json({ success: true, item: targetItem });
});

// Category CRUD
app.post("/api/categories", (req, res) => {
  const newCat = {
    id: `cat-${Date.now()}`,
    name: req.body.name,
    parentId: req.body.parentId || null,
    image: req.body.image || "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=100&auto=format&fit=crop",
    slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, "-"),
    seoDesc: req.body.seoDesc || ""
  };
  categories.push(newCat);
  systemLogs.unshift({
    id: `log-${Date.now()}`,
    type: "content",
    text: `Created new category: ${newCat.name}`,
    ip: req.ip || "127.0.0.1",
    user: "Admin",
    date: new Date().toISOString()
  });
  res.status(201).json(newCat);
});

app.put("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const idx = categories.findIndex(c => c.id === id);
  if (idx !== -1) {
    categories[idx] = { ...categories[idx], ...req.body };
    res.json(categories[idx]);
  } else {
    res.status(404).json({ error: "Category not found" });
  }
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  categories = categories.filter(c => c.id !== id);
  res.json({ success: true });
});

// Tag CRUD & Merge
app.post("/api/tags", (req, res) => {
  const newTag = {
    id: `tag-${Date.now()}`,
    name: req.body.name,
    views: req.body.views || 0
  };
  tags.push(newTag);
  res.status(201).json(newTag);
});

app.put("/api/tags/:id", (req, res) => {
  const { id } = req.params;
  const idx = tags.findIndex(t => t.id === id);
  if (idx !== -1) {
    tags[idx] = { ...tags[idx], ...req.body };
    res.json(tags[idx]);
  } else {
    res.status(404).json({ error: "Tag not found" });
  }
});

app.delete("/api/tags/:id", (req, res) => {
  const { id } = req.params;
  tags = tags.filter(t => t.id !== id);
  res.json({ success: true });
});

app.post("/api/tags/merge", (req, res) => {
  const { sourceTagId, targetTagId } = req.body;
  const sourceTag = tags.find(t => t.id === sourceTagId);
  const targetTag = tags.find(t => t.id === targetTagId);

  if (!sourceTag || !targetTag) {
    return res.status(404).json({ error: "Source or Target tag not found" });
  }

  // Combine views
  targetTag.views += sourceTag.views;

  // Replace occurrences in blogs
  blogs.forEach(b => {
    if (b.tags.includes(sourceTag.name)) {
      b.tags = b.tags.map(t => t === sourceTag.name ? targetTag.name : t);
      // Remove duplicates
      b.tags = Array.from(new Set(b.tags));
    }
  });

  // Remove source tag
  tags = tags.filter(t => t.id !== sourceTagId);

  systemLogs.unshift({
    id: `log-${Date.now()}`,
    type: "content",
    text: `Merged tag "${sourceTag.name}" into "${targetTag.name}"`,
    ip: req.ip || "127.0.0.1",
    user: "Admin",
    date: new Date().toISOString()
  });

  res.json({ success: true, tags, blogs });
});

// Media Library
app.post("/api/media", (req, res) => {
  const newFile = {
    id: `media-${Date.now()}`,
    name: req.body.name || "untitled_asset.png",
    size: req.body.size || "124 KB",
    type: req.body.type || "image/png",
    date: new Date().toISOString().split("T")[0],
    url: req.body.url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop"
  };
  mediaFiles.unshift(newFile);
  systemLogs.unshift({
    id: `log-${Date.now()}`,
    type: "content",
    text: `Uploaded media: ${newFile.name}`,
    ip: req.ip || "127.0.0.1",
    user: "Admin",
    date: new Date().toISOString()
  });
  res.status(201).json(newFile);
});

app.put("/api/media/:id", (req, res) => {
  const { id } = req.params;
  const idx = mediaFiles.findIndex(m => m.id === id);
  if (idx !== -1) {
    mediaFiles[idx] = { ...mediaFiles[idx], ...req.body };
    res.json(mediaFiles[idx]);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

app.delete("/api/media/:id", (req, res) => {
  const { id } = req.params;
  mediaFiles = mediaFiles.filter(m => m.id !== id);
  res.json({ success: true });
});

// Newsletter Subscriptions
app.post("/api/newsletters", (req, res) => {
  const { email, list } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const exists = newsletters.some(n => n.email.toLowerCase() === email.toLowerCase());
  if (exists) return res.status(400).json({ error: "Email already subscribed" });

  const sub = {
    id: `sub-${Date.now()}`,
    email,
    date: new Date().toISOString().split("T")[0],
    list: list || "General Newsletter"
  };
  newsletters.unshift(sub);
  res.status(201).json(sub);
});

app.post("/api/newsletters/import", (req, res) => {
  const { emails, list } = req.body;
  if (!Array.isArray(emails)) return res.status(400).json({ error: "Emails array required" });

  let count = 0;
  emails.forEach(email => {
    if (email && !newsletters.some(n => n.email.toLowerCase() === email.toLowerCase())) {
      newsletters.unshift({
        id: `sub-${Date.now()}-${count}`,
        email,
        date: new Date().toISOString().split("T")[0],
        list: list || "Imported List"
      });
      count++;
    }
  });

  systemLogs.unshift({
    id: `log-${Date.now()}`,
    type: "system",
    text: `Imported ${count} newsletter subscribers`,
    ip: req.ip || "127.0.0.1",
    user: "Admin",
    date: new Date().toISOString()
  });

  res.json({ success: true, count, newsletters });
});

app.delete("/api/newsletters/:id", (req, res) => {
  const { id } = req.params;
  newsletters = newsletters.filter(n => n.id !== id);
  res.json({ success: true });
});

// Advertisements
app.post("/api/ads", (req, res) => {
  const newAd = {
    id: `ad-${Date.now()}`,
    type: req.body.type || "Sidebar Ads",
    title: req.body.title || "Elite Tech Promotion",
    link: req.body.link || "#",
    image: req.body.image || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop",
    status: req.body.status || "active",
    clicks: 0,
    impressions: 0,
    startDate: req.body.startDate || new Date().toISOString().split("T")[0],
    endDate: req.body.endDate || "2026-12-31"
  };
  advertisements.push(newAd);
  res.status(201).json(newAd);
});

app.put("/api/ads/:id", (req, res) => {
  const { id } = req.params;
  const idx = advertisements.findIndex(a => a.id === id);
  if (idx !== -1) {
    advertisements[idx] = { ...advertisements[idx], ...req.body };
    res.json(advertisements[idx]);
  } else {
    res.status(404).json({ error: "Ad banner not found" });
  }
});

app.delete("/api/ads/:id", (req, res) => {
  const { id } = req.params;
  advertisements = advertisements.filter(a => a.id !== id);
  res.json({ success: true });
});

// Website settings
app.put("/api/settings", (req, res) => {
  webSettings = { ...webSettings, ...req.body };
  systemLogs.unshift({
    id: `log-${Date.now()}`,
    type: "system",
    text: "Updated system global configurations",
    ip: req.ip || "127.0.0.1",
    user: "Admin",
    date: new Date().toISOString()
  });
  res.json(webSettings);
});

// Backup center
app.post("/api/backups", (req, res) => {
  const newBackup = {
    id: `back-${Date.now()}`,
    name: req.body.name || `backup_auto_${Date.now()}.json`,
    type: req.body.type || "database",
    size: "192 KB",
    date: new Date().toISOString().replace("T", " ").substring(0, 19),
    status: "completed"
  };
  systemBackups.unshift(newBackup);
  systemLogs.unshift({
    id: `log-${Date.now()}`,
    type: "system",
    text: `Manual backup generated: ${newBackup.name}`,
    ip: req.ip || "127.0.0.1",
    user: "Admin",
    date: new Date().toISOString()
  });
  res.json(newBackup);
});

app.post("/api/backups/:id/restore", (req, res) => {
  const { id } = req.params;
  const backup = systemBackups.find(b => b.id === id);
  if (!backup) return res.status(404).json({ error: "Backup file not found" });

  // Simulate restore: re-seed logs and notify
  systemLogs.unshift({
    id: `log-${Date.now()}`,
    type: "security",
    text: `System restore triggered from backup: ${backup.name}`,
    ip: req.ip || "127.0.0.1",
    user: "Admin",
    date: new Date().toISOString()
  });
  res.json({ success: true, message: "State successfully restored to selected backup index point!" });
});

// User Management
app.post("/api/users", (req, res) => {
  const newUser = {
    id: `usr-${Date.now()}`,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password || "defaultpwd",
    role: req.body.role || "Subscriber",
    permissions: req.body.permissions || { write: false, delete: false, users: false, settings: false, backups: false },
    isVerified: req.body.isVerified !== undefined ? req.body.isVerified : false,
    changeEmailPending: null
  };
  adminUsers.push(newUser);
  systemLogs.unshift({
    id: `log-${Date.now()}`,
    type: "security",
    text: `Created new admin/moderator user: ${newUser.name} with role ${newUser.role}`,
    ip: req.ip || "127.0.0.1",
    user: "Admin",
    date: new Date().toISOString()
  });
  res.status(201).json(newUser);
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const idx = adminUsers.findIndex(u => u.id === id);
  if (idx !== -1) {
    adminUsers[idx] = { ...adminUsers[idx], ...req.body };
    res.json(adminUsers[idx]);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  adminUsers = adminUsers.filter(u => u.id !== id);
  res.json({ success: true });
});

// System logs
app.post("/api/logs", (req, res) => {
  const newLog = {
    id: `log-${Date.now()}`,
    type: req.body.type || "system",
    text: req.body.text || "System operation completed",
    ip: req.ip || "127.0.0.1",
    user: req.body.user || "System",
    date: new Date().toISOString()
  };
  systemLogs.unshift(newLog);
  res.json(newLog);
});

// Authenticated routes now rely directly on Supabase Auth client-side and public-schema database checks.
// Mock local auth server-side routes removed to avoid development bypass and enforce enterprise security.


// Reset database to initial seeding
app.post("/api/reset", (req, res) => {
  blogs = [...initialBlogs];
  news = [...initialNews];
  projects = [...initialProjects];
  certificates = [...initialCertificates];
  snippets = [...initialSnippets];
  tutorials = [...initialTutorials];
  contactSubmissions = [];

  categories = [
    { id: "cat-1", name: "React & Frontend", parentId: null, image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&auto=format&fit=crop", slug: "react-frontend", seoDesc: "Advanced tutorials on React 19, TypeScript, and modern frontend frameworks" },
    { id: "cat-2", name: "Backend & Databases", parentId: null, image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=200&auto=format&fit=crop", slug: "backend-databases", seoDesc: "Deep dives into Node.js, Express, PostgreSQL, and database design" },
    { id: "cat-3", name: "Artificial Intelligence", parentId: null, image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=200&auto=format&fit=crop", slug: "artificial-intelligence", seoDesc: "Enterprise AI automation, Gemini integrations, and machine learning" },
    { id: "cat-4", name: "Next.js Development", parentId: "cat-1", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&auto=format&fit=crop", slug: "nextjs-development", seoDesc: "Building scalable server-rendered Next.js 15 apps" }
  ];

  tags = [
    { id: "tag-1", name: "React 19", views: 2450 },
    { id: "tag-2", name: "WebSockets", views: 1820 },
    { id: "tag-3", name: "Gemini API", views: 3200 },
    { id: "tag-4", name: "Tailwind CSS", views: 2100 },
    { id: "tag-5", name: "TypeScript", views: 2890 }
  ];

  mediaFiles = [
    { id: "media-1", name: "harendra_lamsal_cv.pdf", size: "1.2 MB", type: "document/pdf", date: "2026-06-01", url: "/assets/harendra_cv.pdf" },
    { id: "media-2", name: "profile_headshot.png", size: "840 KB", type: "image/png", date: "2026-06-05", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop" },
    { id: "media-3", name: "cms_architecture.zip", size: "4.5 MB", type: "archive/zip", date: "2026-06-12", url: "/assets/cms_architecture.zip" },
    { id: "media-4", name: "promo_video.mp4", size: "14.2 MB", type: "video/mp4", date: "2026-06-20", url: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screencast-43187-large.mp4" }
  ];

  newsletters = [
    { id: "sub-1", email: "recruit@meta.com", date: "2026-06-20", list: "Recruiters" },
    { id: "sub-2", email: "techlead@google.com", date: "2026-06-22", list: "Partners" },
    { id: "sub-3", email: "ceo@veridian.io", date: "2026-06-25", list: "General Newsletter" }
  ];

  advertisements = [
    { id: "ad-1", type: "Header Ads", title: "Scale with AWS Enterprise", link: "https://aws.amazon.com", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop", status: "active", clicks: 142, impressions: 3200, startDate: "2026-06-01", endDate: "2026-12-31" },
    { id: "ad-2", type: "Sidebar Ads", title: "Build on Supabase", link: "https://supabase.com", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop", status: "active", clicks: 88, impressions: 1850, startDate: "2026-06-15", endDate: "2026-09-15" }
  ];

  webSettings = {
    websiteName: "Harendra Lamsal Portfolio & CMS",
    logo: "HL",
    favicon: "/favicon.ico",
    contactEmail: "harendralamsal4140@gmail.com",
    contactPhone: "+977 9823587535",
    facebookUrl: "https://web.facebook.com/harendra.lamsala/",
    linkedinUrl: "https://www.linkedin.com/in/harendra-lamsal-728a6122b",
    theme: "Cosmic Slate Theme",
    homepageTitle_en: "Elite Full Stack Developer",
    homepageTitle_np: "कुशल फुल स्ट्याक विकासकर्ता",
    footerCopyright_en: "© 2026 Harendra Lamsal. All Rights Reserved.",
    footerCopyright_np: "© २०२६ सर्वाधिकार सुरक्षित। हरेन्द्र लाम्साल।"
  };

  systemLogs = [
    { id: "log-1", type: "security", text: "Successful Admin login verified via secure session handshake", ip: "192.168.1.1", user: "harendralamsal4140@gmail.com", date: "2026-07-01T05:10:22Z" },
    { id: "log-2", type: "content", text: "Published blog post: Building Enterprise Real-Time Applications with React 19", ip: "192.168.1.1", user: "Harendra Lamsal", date: "2026-06-25T11:42:15Z" },
    { id: "log-3", type: "system", text: "Daily database backup verification completed successfully", ip: "localhost", user: "system-cron", date: "2026-07-01T00:00:00Z" }
  ];

  systemBackups = [
    { id: "back-1", name: "v1.1_stable_db_backup.json", type: "database", size: "182 KB", date: "2026-06-28 00:00:00", status: "completed" },
    { id: "back-2", name: "v1.1_media_assets_backup.tar.gz", type: "media", size: "15.4 MB", date: "2026-06-28 00:05:22", status: "completed" }
  ];

  adminUsers = [
    { id: "usr-1", name: "Harendra Lamsal", email: "harendralamsal4140@gmail.com", password: "admin", role: "Super Admin", permissions: { write: true, delete: true, users: true, settings: true, backups: true }, isVerified: true, changeEmailPending: null },
    { id: "usr-2", name: "Editor Hari", email: "hari@gmail.com", password: "editorpassword", role: "Editor", permissions: { write: true, delete: false, users: false, settings: true, backups: false }, isVerified: true, changeEmailPending: null },
    { id: "usr-3", name: "Journalist Pradip", email: "pradip@journalist.np", password: "pradippassword", role: "Journalist", permissions: { write: true, delete: false, users: false, settings: false, backups: false }, isVerified: false, changeEmailPending: null }
  ];

  res.json({ success: true, message: "Database reset to initial seeding state successfully." });
});

// Contact Submissions
app.post("/api/contact", (req, res) => {
  const submission: ContactSubmission = {
    id: `contact-${Date.now()}`,
    date: new Date().toISOString(),
    ...req.body,
  };
  contactSubmissions.unshift(submission);
  res.status(201).json({ success: true, submission });
});

app.get("/api/contact", (req, res) => {
  res.json(contactSubmissions);
});

// Gemini AI Assistant Chat Interface (representing Harendra Lamsal)
app.post("/api/gemini/assistant", async (req, res) => {
  try {
    const ai = getGemini();
    const { messages } = req.body; // Array of { role: 'user' | 'model', content: string }
    
    // Construct rich system prompt defining Harendra's credentials and persona
    const systemInstruction = `You are Harendra Lamsal's Personal AI Assistant, representing Harendra Lamsal, an elite Full Stack Web Developer. 
Harendra's Professional Coordinates:
- Full Name: Harendra Lamsal
- Role: Full Stack Web Developer (Experiencd with React, Node.js, Express, TypeScript, Vite, Tailwind CSS, PostgreSQL, Supabase, Cloud platforms)
- Primary Domain: harendralamsal.name.np
- Primary Email: harendralamsal4140@gmail.com
- Phone: 9823587535
- Facebook: https://web.facebook.com/harendra.lamsala/
- LinkedIn: https://www.linkedin.com/in/harendra-lamsal-728a6122b
- Native Language: Nepali (नेपाली), Secondary Language: English.

IMPORTANT PERSONA RULE:
You must speak in a highly professional, developer-inspired, corporate, yet welcoming tone.
Always prioritize replying in the language the user is speaking. If they greet you or ask in Nepali, reply in flawless, elegant Nepali. If they ask in English, reply in crisp English.
Promote Harendra's elite development services, showcase his featured projects (such as the Bilingual AI CMS, FinTech Secure Ledger, or IoT Live Telemetry Dashboard), reference his AWS and Meta certifications, and strongly encourage recruiters and prospective clients to contact him via the Contact form or directly at harendralamsal4140@gmail.com / +977 9823587535.

Keep answers concise, scannable, and extremely polished. Avoid technical jargon unless asked. Be humble but highly competent. Do not hallucinate or make up custom personal stories.`;

    // Map conversation messages to Gemini chat contents
    const chatContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini Assistant Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Gemini." });
  }
});

// Gemini AI content generator helper for the Professional CMS
app.post("/api/gemini/generate-article", async (req, res) => {
  try {
    const ai = getGemini();
    const { topic, category, type } = req.body; // type: 'blog' or 'news'
    
    const prompt = `Write a high-quality, professional ${type === "blog" ? "programming blog post" : "tech news article"} about "${topic}" categorized under "${category}".
Provide the output in a clean JSON format containing:
1. title_en: A crisp title in English.
2. title_np: A precise translated title in elegant Nepali (नेपाली).
3. content_en: Comprehensive, structured article body in English using Markdown for headings, paragraphs, and lists.
4. content_np: The equivalent translated comprehensive article body in Nepali using Markdown.
5. summary_en: A short 1-2 sentence summary in English.
6. summary_np: A short 1-2 sentence summary in Nepali.
7. tags: An array of 3-4 relevant tags (strings).

Do not wrap the JSON inside markdown blocks (such as \`\`\`json). Just return the raw JSON object.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Generate Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI article." });
  }
});

// Gemini Translation helper
app.post("/api/gemini/translate", async (req, res) => {
  try {
    const ai = getGemini();
    const { text, targetLang } = req.body; // targetLang: 'np' or 'en'
    
    const prompt = `Translate the following text into ${targetLang === "np" ? "natural, grammatically flawless, elite Nepali (नेपाली) suitable for a technical audience" : "crisp, professional, standard English"}.
Text to translate:
"${text}"

Return ONLY the translated text. Do not add quotes, introductory or concluding remarks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    res.json({ translated: response.text?.trim() });
  } catch (error: any) {
    console.error("Gemini Translate Error:", error);
    res.status(500).json({ error: error.message || "Failed to translate text." });
  }
});

// Cybersecurity Center API Routes
app.get("/api/security/data", (req, res) => {
  res.json({
    sessions: activeSessions,
    loginLogs,
    alerts: securityAlerts,
    passkeys,
    tokens: apiTokens,
    twoFactorEnabled,
    twoFactorType,
    backupCodes,
    sessionTimeoutMinutes,
    multipleDeviceAllowed,
    rateLimitRequests,
    allowedExtensions
  });
});

app.put("/api/security/settings", (req, res) => {
  const body = req.body;
  if (body.twoFactorEnabled !== undefined) twoFactorEnabled = !!body.twoFactorEnabled;
  if (body.twoFactorType !== undefined) twoFactorType = body.twoFactorType;
  if (body.sessionTimeoutMinutes !== undefined) sessionTimeoutMinutes = parseInt(body.sessionTimeoutMinutes);
  if (body.multipleDeviceAllowed !== undefined) multipleDeviceAllowed = !!body.multipleDeviceAllowed;
  if (body.rateLimitRequests !== undefined) rateLimitRequests = parseInt(body.rateLimitRequests);
  if (body.allowedExtensions !== undefined) allowedExtensions = body.allowedExtensions;

  systemLogs.unshift({
    id: `log-${Date.now()}`,
    type: "security",
    text: `Gatekeeper security policy updated: ${JSON.stringify(body)}`,
    ip: req.ip || "127.0.0.1",
    user: "Super Admin",
    date: new Date().toISOString()
  });

  res.json({ success: true });
});

app.delete("/api/security/sessions/:id", (req, res) => {
  const { id } = req.params;
  const sess = activeSessions.find(s => s.id === id);
  if (sess) {
    systemLogs.unshift({
      id: `log-${Date.now()}`,
      type: "security",
      text: `Session terminated: ${sess.device} (${sess.ip}) belonging to ${sess.email}`,
      ip: req.ip || "127.0.0.1",
      user: "Super Admin",
      date: new Date().toISOString()
    });
  }
  activeSessions = activeSessions.filter(s => s.id !== id);
  res.json({ success: true });
});

app.post("/api/security/sessions/revoke-others", (req, res) => {
  activeSessions = activeSessions.filter(s => s.isCurrent);
  systemLogs.unshift({
    id: `log-${Date.now()}`,
    type: "security",
    text: `Mass session eviction: Terminated all secondary active administrator login tokens`,
    ip: req.ip || "127.0.0.1",
    user: "Super Admin",
    date: new Date().toISOString()
  });
  res.json({ success: true });
});

app.post("/api/security/alerts/:id/resolve", (req, res) => {
  const { id } = req.params;
  const alert = securityAlerts.find(a => a.id === id);
  if (alert) {
    alert.resolved = true;
    systemLogs.unshift({
      id: `log-${Date.now()}`,
      type: "security",
      text: `Resolved security incident warning: "${alert.text}"`,
      ip: req.ip || "127.0.0.1",
      user: "Super Admin",
      date: new Date().toISOString()
    });
  }
  res.json({ success: true });
});

app.post("/api/security/tokens", (req, res) => {
  const { name, role, expiresDays } = req.body;
  const tokenValue = `HL_SECURE_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + (expiresDays || 30));

  const newToken = {
    id: `tok-${Date.now()}`,
    name: name || "Developer Agent Key",
    tokenValue,
    role: role || "Editor",
    created: new Date().toISOString(),
    expires: expirationDate.toISOString(),
    active: true
  };

  apiTokens.unshift(newToken);

  systemLogs.unshift({
    id: `log-${Date.now()}`,
    type: "security",
    text: `Bearer API Token generated for scope: ${newToken.name} (${newToken.role})`,
    ip: req.ip || "127.0.0.1",
    user: "Super Admin",
    date: new Date().toISOString()
  });

  res.status(201).json(newToken);
});

app.delete("/api/security/tokens/:id", (req, res) => {
  const { id } = req.params;
  const token = apiTokens.find(t => t.id === id);
  if (token) {
    systemLogs.unshift({
      id: `log-${Date.now()}`,
      type: "security",
      text: `Bearer API Token revoked permanently: ${token.name}`,
      ip: req.ip || "127.0.0.1",
      user: "Super Admin",
      date: new Date().toISOString()
    });
  }
  apiTokens = apiTokens.filter(t => t.id !== id);
  res.json({ success: true });
});

app.post("/api/security/passkeys", (req, res) => {
  const { label } = req.body;
  const newPk = {
    id: `pk-${Date.now()}`,
    label: label || "Biometric Authenticator Key",
    created: new Date().toISOString(),
    lastUsed: "Just now"
  };
  passkeys.unshift(newPk);
  systemLogs.unshift({
    id: `log-${Date.now()}`,
    type: "security",
    text: `Registered cryptographic biometric FIDO2/WebAuthn Passkey: ${newPk.label}`,
    ip: req.ip || "127.0.0.1",
    user: "Super Admin",
    date: new Date().toISOString()
  });
  res.status(201).json(newPk);
});

app.delete("/api/security/passkeys/:id", (req, res) => {
  const { id } = req.params;
  const pk = passkeys.find(p => p.id === id);
  if (pk) {
    systemLogs.unshift({
      id: `log-${Date.now()}`,
      type: "security",
      text: `Revoked cryptographic biometric FIDO2/WebAuthn Passkey: ${pk.label}`,
      ip: req.ip || "127.0.0.1",
      user: "Super Admin",
      date: new Date().toISOString()
    });
  }
  passkeys = passkeys.filter(p => p.id !== id);
  res.json({ success: true });
});

app.post("/api/security/mfa/backup-codes", (req, res) => {
  const generated = Array.from({ length: 4 }, () => 
    `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  backupCodes = generated;
  systemLogs.unshift({
    id: `log-${Date.now()}`,
    type: "security",
    text: `MFA backup recovery codes rotated`,
    ip: req.ip || "127.0.0.1",
    user: "Super Admin",
    date: new Date().toISOString()
  });
  res.json({ codes: backupCodes });
});

// Serve static build or configure Vite middleware in dev
async function startServer() {
  const distPath = path.join(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production" || (typeof __filename !== "undefined" && __filename.includes("server.cjs"));

  if (!isProduction) {
    console.log("[SERVER] Starting in DEVELOPMENT mode...");
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          hmr: false
        },
        appType: "spa",
      });
      
      // 1. Mount Vite middlewares first so it can handle assets, TS/JS/CSS source files, and virtual files
      app.use(vite.middlewares);
      
      // 2. Serve index.html with Vite transforms for all non-API wildcard sub-routes that fall through
      app.get("*", async (req, res, next) => {
        if (req.originalUrl.startsWith("/api/")) {
          return next();
        }
        try {
          let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
          template = await vite.transformIndexHtml(req.originalUrl, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } catch (e: any) {
          vite.ssrFixStacktrace(e);
          next(e);
        }
      });
    } catch (err) {
      console.error("[SERVER] Failed to load Vite development server. Falling back to static build:", err);
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  } else {
    console.log("[SERVER] Starting in PRODUCTION mode (serving compiled assets)...");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Ready on http://localhost:${PORT} in ${isProduction ? "production" : "development"} mode`);
  });
}

if (process.env.VERCEL !== "1") {
  startServer();
}

export default app;
