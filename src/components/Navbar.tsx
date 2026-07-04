/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Home as HomeIcon, 
  Globe, 
  BookOpen, 
  Terminal, 
  Layers, 
  Briefcase, 
  Award, 
  Cpu, 
  Mail, 
  User, 
  Settings, 
  CheckCircle, 
  Bookmark, 
  ChevronDown,
  X,
  Sparkles,
  LogOut
} from "lucide-react";
import { UserSession, UserRole } from "../types.js";
import harendraLogo from "../assets/images/harendra_logo_1783010888262.jpg";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: "np" | "en";
  setLang: (lang: "np" | "en") => void;
  userSession: UserSession;
  setUserSession: React.Dispatch<React.SetStateAction<UserSession>>;
  onLogout: () => void;
}

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  lang, 
  setLang,
  userSession,
  setUserSession,
  onLogout
}: NavbarProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", icon: HomeIcon, label_np: "गृहपृष्ठ", label_en: "Home" },
    { id: "news", icon: Globe, label_np: "समाचार", label_en: "News" },
    { id: "blog", icon: BookOpen, label_np: "ब्लग", label_en: "Blog" },
    { id: "tutorials", icon: Terminal, label_np: "ट्युटोरियल", label_en: "Tutorials" },
    { id: "projects", icon: Layers, label_np: "परियोजनाहरू", label_en: "Projects" },
    { id: "portfolio", icon: Briefcase, label_np: "पोर्टफोलियो", label_en: "Portfolio" },
    { id: "certificates", icon: Award, label_np: "प्रमाणपत्र", label_en: "Certificates" },
    { id: "about", icon: Cpu, label_np: "बारेमा", label_en: "About" },
    { id: "contact", icon: Mail, label_np: "सम्पर्क", label_en: "Contact" },
  ];

  const totalBookmarks = 
    userSession.bookmarks.blogs.length + 
    userSession.bookmarks.news.length + 
    userSession.bookmarks.tutorials.length + 
    userSession.bookmarks.projects.length;

  return (
    <header className="sticky top-0 z-40 w-full bg-black/40 backdrop-blur-md border-b border-white/5 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo - Immersive HL Identity */}
        <div 
          onClick={() => {
            setCurrentTab("home");
            setMobileMenuOpen(false);
          }} 
          className="flex items-center gap-3 cursor-pointer hover:opacity-95 transition-opacity shrink-0 group"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.25)] relative transition-all duration-300 group-hover:border-cyan-400 shrink-0">
            <img 
              src={harendraLogo} 
              alt="Harendra Lamsal" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white leading-none">
              {lang === "np" ? "हरेन्द्र लाम्साल" : "HARENDRA LAMSAL"}
            </span>
            <span className="text-[9px] text-cyan-400 tracking-[0.2em] font-mono uppercase mt-1">
              {lang === "np" ? "एन्टरप्राइज मञ्च v1.1" : "Enterprise Platform v1.1"}
            </span>
          </div>
        </div>

        {/* Responsive Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  isActive
                    ? "bg-white/5 text-cyan-400 border border-white/10 shadow-sm"
                    : "text-gray-400 hover:text-cyan-400 hover:bg-white/[0.02]"
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? "text-cyan-400" : ""}`} />
                <span>{lang === "np" ? item.label_np : item.label_en}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Admin CMS indicator button for easy access */}
          {userSession.role === "admin" && (
            <button
              onClick={() => {
                setCurrentTab("cms");
                setProfileDropdownOpen(false);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-cyan-400/10 border border-cyan-400/20 hover:bg-cyan-400 text-cyan-400 hover:text-black font-mono text-[10px] uppercase rounded-lg transition-all cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>Admin CMS</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === "np" ? "en" : "np")}
            className="flex items-center gap-1 px-3.5 py-1.5 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 text-[10px] font-mono cursor-pointer transition-all"
          >
            <span className={lang === "np" ? "text-cyan-400 font-semibold" : "text-white/40"}>नेपाली</span>
            <span className="text-white/20">/</span>
            <span className={lang === "en" ? "text-cyan-400 font-semibold" : "text-white/40"}>EN</span>
          </button>

          {/* Profile Auth Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-900/30 to-black border border-white/10 rounded-full hover:border-cyan-400/30 text-xs text-white font-mono cursor-pointer transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-[10px]">
                {userSession.role[0].toUpperCase()}
              </div>
              <span className="hidden sm:inline capitalize text-[10px]">{userSession.role}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* Profile Dropdown Box */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-[#0d0e15] border border-white/10 rounded-2xl p-4 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                
                {/* User Info Header */}
                <div className="border-b border-white/5 pb-3">
                  <div className="text-[10px] text-gray-500 font-mono uppercase">Current Coordinates</div>
                  <h4 className="text-xs font-bold text-white tracking-tight truncate">{userSession.name}</h4>
                  <p className="text-[10px] text-gray-400 font-mono truncate">{userSession.email}</p>
                </div>

                {/* Terminate Session / Logout Button */}
                {userSession.role !== "guest" ? (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-500/10 rounded-lg text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Terminate Session</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setCurrentTab("cms");
                    }}
                    className="w-full py-2 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-400 hover:text-cyan-300 border border-cyan-500/10 rounded-lg text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Admin Gate Login</span>
                  </button>
                )}

                {/* Bookmarks Telemetry */}
                <div className="space-y-1.5 border-t border-white/5 pt-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                    <span>BOOKMARKED ARTIFACTS</span>
                    <span className="text-cyan-400 font-bold">{totalBookmarks}</span>
                  </div>
                  
                  <div className="text-[10px] text-gray-400 space-y-1 bg-black/40 p-2 rounded-lg border border-white/5">
                    <div className="flex justify-between">
                      <span>Blogs saved:</span>
                      <span className="text-white font-mono">{userSession.bookmarks.blogs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>News saved:</span>
                      <span className="text-white font-mono">{userSession.bookmarks.news.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tutorials saved:</span>
                      <span className="text-white font-mono">{userSession.bookmarks.tutorials.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projects saved:</span>
                      <span className="text-white font-mono">{userSession.bookmarks.projects.length}</span>
                    </div>
                  </div>
                </div>

                {/* Account Details / Settings */}
                <div className="text-[9px] text-gray-500 font-mono text-center border-t border-white/5 pt-3">
                  <span>Authorized Token Session active</span>
                </div>

              </div>
            )}
          </div>

          {/* Hamburger Menu Icon for Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex xl:hidden p-2 text-gray-400 hover:text-white cursor-pointer"
          >
            <span className="sr-only">Toggle navigation</span>
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <div className="space-y-1 w-5">
                <div className="h-0.5 bg-gray-400 rounded"></div>
                <div className="h-0.5 bg-gray-400 rounded"></div>
                <div className="h-0.5 bg-gray-400 rounded"></div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#050505] border-b border-white/10 p-4 space-y-2 animate-in slide-in-from-top duration-150">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-mono cursor-pointer transition-all ${
                  isActive
                    ? "bg-white/5 text-cyan-400 border border-white/10"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{lang === "np" ? item.label_np : item.label_en}</span>
              </button>
            );
          })}

          {userSession.role === "admin" && (
            <button
              onClick={() => {
                setCurrentTab("cms");
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-mono text-cyan-400 bg-cyan-400/5 border border-cyan-400/20 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Admin CMS Portal</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
