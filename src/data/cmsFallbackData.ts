/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import harendraLogo from "../assets/images/harendra_logo_1783010888262.jpg";

export const fallbackCategories = [
  { id: "cat-1", name: "React & Frontend", parentId: null, image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&auto=format&fit=crop", slug: "react-frontend", seoDesc: "Advanced tutorials on React 19, TypeScript, and modern frontend frameworks" },
  { id: "cat-2", name: "Backend & Databases", parentId: null, image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=200&auto=format&fit=crop", slug: "backend-databases", seoDesc: "Deep dives into Node.js, Express, PostgreSQL, and database design" },
  { id: "cat-3", name: "Artificial Intelligence", parentId: null, image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=200&auto=format&fit=crop", slug: "artificial-intelligence", seoDesc: "Enterprise AI automation, Gemini integrations, and machine learning" },
  { id: "cat-4", name: "Next.js Development", parentId: "cat-1", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&auto=format&fit=crop", slug: "nextjs-development", seoDesc: "Building scalable server-rendered Next.js 15 apps" }
];

export const fallbackTags = [
  { id: "tag-1", name: "React 19", views: 2450 },
  { id: "tag-2", name: "WebSockets", views: 1820 },
  { id: "tag-3", name: "Gemini API", views: 3200 },
  { id: "tag-4", name: "Tailwind CSS", views: 2100 },
  { id: "tag-5", name: "TypeScript", views: 2890 }
];

export const fallbackMediaFiles = [
  { id: "media-1", name: "harendra_lamsal_cv.pdf", size: "1.2 MB", type: "document/pdf", date: "2026-06-01", url: "/assets/harendra_cv.pdf" },
  { id: "media-2", name: "profile_headshot.png", size: "840 KB", type: "image/png", date: "2026-06-05", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop" },
  { id: "media-3", name: "cms_architecture.zip", size: "4.5 MB", type: "archive/zip", date: "2026-06-12", url: "/assets/cms_architecture.zip" },
  { id: "media-4", name: "promo_video.mp4", size: "14.2 MB", type: "video/mp4", date: "2026-06-20", url: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screencast-43187-large.mp4" }
];

export const fallbackNewsletters = [
  { id: "news-1", email: "harendralamsal4140@gmail.com", date: "2026-06-30T10:00:00Z", status: "subscribed" },
  { id: "news-2", email: "developer@harendralamsal.name.np", date: "2026-06-28T14:15:22Z", status: "subscribed" },
  { id: "news-3", email: "visitor@guest.com", date: "2026-07-01T08:30:12Z", status: "unsubscribed" }
];

export const fallbackAdvertisements = [
  { id: "ad-1", type: "Main Banner", title: "Scale with Vercel Edge", link: "https://vercel.com", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop", status: "active", clicks: 142, impressions: 3200, startDate: "2026-06-01", endDate: "2026-08-31" },
  { id: "ad-2", type: "Sidebar Ads", title: "Build on Supabase", link: "https://supabase.com", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop", status: "active", clicks: 88, impressions: 1850, startDate: "2026-06-15", endDate: "2026-09-15" }
];

export const fallbackWebSettings = {
  siteName: "Harendra Lamsal Portfolio & CMS Portal",
  logoUrl: harendraLogo,
  contactEmail: "harendralamsal4140@gmail.com",
  footerLine: "Software Engineer & Cloud Architect",
  siteName_en: "Harendra Lamsal Portfolio & CMS Portal",
  siteName_np: "हरेन्द्र लाम्साल पोर्टफोलियो र सीएमएस पोर्टल",
  footerCopyright_en: "© 2026 Harendra Lamsal. All Rights Reserved.",
  footerCopyright_np: "© २०२६ सर्वाधिकार सुरक्षित। हरेन्द्र लाम्साल।"
};

export const fallbackSystemLogs = [
  { id: "log-1", type: "security", text: "Successful Admin login verified via secure session handshake", ip: "192.168.1.1", user: "harendralamsal4140@gmail.com", date: "2026-07-01T05:10:22Z" },
  { id: "log-2", type: "content", text: "Published blog post: Building Enterprise Real-Time Applications with React 19", ip: "192.168.1.1", user: "Harendra Lamsal", date: "2026-06-25T11:42:15Z" },
  { id: "log-3", type: "system", text: "Daily database backup verification completed successfully", ip: "localhost", user: "system-cron", date: "2026-07-01T00:00:00Z" }
];

export const fallbackSystemBackups = [
  { id: "bak-1", name: "v1.2.0_db_production.sql", size: "2.4 MB", date: "2026-07-01T00:00:00Z", status: "success" },
  { id: "bak-2", name: "v1.1.9_assets_backup.tar.gz", size: "45.8 MB", date: "2026-06-25T00:00:00Z", status: "success" }
];

export const fallbackAdminUsers = [
  { id: "usr-1", name: "Harendra Lamsal", email: "harendralamsal4140@gmail.com", role: "Super Admin", permissions: { write: true, delete: true, users: true, settings: true, backups: true }, isVerified: true },
  { id: "usr-2", name: "Editor Hari", email: "hari@gmail.com", role: "Editor", permissions: { write: true, delete: false, users: false, settings: true, backups: false }, isVerified: true },
  { id: "usr-3", name: "Journalist Pradip", email: "pradip@journalist.np", role: "Journalist", permissions: { write: true, delete: false, users: false, settings: false, backups: false }, isVerified: false }
];
