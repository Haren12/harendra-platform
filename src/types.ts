/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Comment {
  id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  date: string;
}

export interface BlogPost {
  id: string;
  title_np: string;
  title_en: string;
  content_np: string;
  content_en: string;
  category: string;
  tags: string[];
  date: string;
  views: number;
  readTime: string;
  author: string;
  comments?: Comment[];
}

export interface NewsArticle {
  id: string;
  title_np: string;
  title_en: string;
  summary_np: string;
  summary_en: string;
  content_np: string;
  content_en: string;
  source: string;
  date: string;
  category: string;
  comments?: Comment[];
}

export interface Project {
  id: string;
  title_np: string;
  title_en: string;
  desc_np: string;
  desc_en: string;
  techStack: string[];
  category: string;
  githubUrl?: string;
  liveUrl?: string;
  demoDetails?: string; // Information on how to run or demo it
  features_en?: string[];
  features_np?: string[];
  caseStudy_en?: string;
  caseStudy_np?: string;
  challenges_en?: string;
  challenges_np?: string;
  solutions_en?: string;
  solutions_np?: string;
}

export interface Certificate {
  id: string;
  title_np: string;
  title_en: string;
  issuer: string;
  date: string;
  credentialId?: string;
  verificationUrl?: string;
  image?: string;
  platform: string; // Udemy, Coursera, etc.
  category: string; // Cloud, Web Development, etc.
  year: string; // e.g. 2025, 2026
}

export interface CodeSnippet {
  id: string;
  title_np: string;
  title_en: string;
  code: string;
  language: string;
  category: string;
}

export interface Tutorial {
  id: string;
  title_np: string;
  title_en: string;
  category: string; // Frontend Development, Backend Development, React Tutorials, Supabase Tutorials, API Development, Deployment Guides
  steps: {
    title_np: string;
    title_en: string;
    content_np: string;
    content_en: string;
    codeSnippet?: string;
    language?: string;
  }[];
  tags: string[];
  date: string;
  views: number;
  readTime: string;
  author: string;
  liveUrl?: string;
  downloadUrl?: string;
  comments?: Comment[];
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  category?: string; // Freelance Work, Collaboration, Job Opportunity, General Inquiry
}

export type UserRole = "guest" | "registered" | "admin";

export interface Bookmarks {
  blogs: string[];
  news: string[];
  tutorials: string[];
  projects: string[];
}

export interface UserSession {
  role: UserRole;
  name: string;
  email: string;
  bookmarks: Bookmarks;
  subscribed: boolean;
}

export interface APIGetResponse {
  blogs: BlogPost[];
  news: NewsArticle[];
  projects: Project[];
  certificates: Certificate[];
  snippets: CodeSnippet[];
  tutorials: Tutorial[];
}
