/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  TrendingUp, Users, Eye, Database, HardDrive, Bell, RefreshCw, 
  ArrowUpRight, AlertTriangle, ShieldCheck, CheckCircle, Terminal
} from "lucide-react";

interface CMSDashboardOverviewProps {
  stats: {
    totalBlogs: number;
    totalNews: number;
    totalProjects: number;
    totalCerts: number;
    totalSubs: number;
    totalUsers: number;
  };
  logs: any[];
  onTriggerBackup: () => void;
  lang: "np" | "en";
  setActiveSubTab: (tab: any) => void;
}

export default function CMSDashboardOverview({ stats, logs, onTriggerBackup, lang, setActiveSubTab }: CMSDashboardOverviewProps) {
  // Mock live active visitors tracker
  const [liveVisitors, setLiveVisitors] = React.useState(14);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveVisitors(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const next = prev + change;
        return next > 2 ? (next < 35 ? next : 30) : 5;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Real-time Telemetry Headline */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-white/5">
        <div>
          <h3 className="text-sm font-semibold font-display text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>Telemetry Stream Live</span>
          </h3>
          <p className="text-[11px] text-gray-400 font-mono mt-1">
            Handshake buffers established. Node latency: <span className="text-cyan-400">12ms</span> • Database state: <span className="text-purple-400">Synchronized</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2 text-xs font-mono">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-gray-400">Active Live:</span>
            <span className="text-white font-bold">{liveVisitors} visitors</span>
          </div>
          <button
            onClick={onTriggerBackup}
            className="px-3 py-1.5 bg-cyan-400 text-black rounded-lg font-mono text-[10px] uppercase font-bold hover:bg-cyan-500 cursor-pointer flex items-center gap-1 transition-all"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Instant Backup</span>
          </button>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-4 space-y-2 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[10px] uppercase font-mono font-bold">Total Articles</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-semibold font-display text-white">
            {stats.totalBlogs + stats.totalNews}
          </div>
          <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
            <span className="text-emerald-400 font-bold">+{stats.totalBlogs}</span> blogs • 
            <span className="text-purple-400 font-bold">+{stats.totalNews}</span> news
          </div>
        </div>

        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-4 space-y-2 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[10px] uppercase font-mono font-bold">Showcase Projects</span>
            <ArrowUpRight className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-semibold font-display text-white">
            {stats.totalProjects}
          </div>
          <div className="text-[10px] text-gray-500 font-mono">
            Active on portfolio grid
          </div>
        </div>

        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-4 space-y-2 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[10px] uppercase font-mono font-bold">Subscribers</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-semibold font-display text-white">
            {stats.totalSubs}
          </div>
          <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
            <span className="text-cyan-400 font-bold">100% Opt-In</span> via newsletter lists
          </div>
        </div>

        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-4 space-y-2 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[10px] uppercase font-mono font-bold">Auth Users</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-semibold font-display text-white">
            {stats.totalUsers}
          </div>
          <div className="text-[10px] text-gray-500 font-mono">
            Access matrix active
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Visitors Traffic Line Chart (SVG) */}
        <div className="bg-[#0a0c10]/60 border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-[10px] uppercase text-gray-400 font-mono font-bold">Weekly Traffic Pulse</span>
            <span className="text-[9px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full font-mono">Line Graph</span>
          </div>
          <div className="h-44 w-full flex items-end relative justify-center">
            {/* Inline SVG Chart */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Path line */}
              <path
                d="M 0 90 Q 20 60 40 75 T 80 30 T 100 20 L 100 100 L 0 100 Z"
                fill="url(#area-grad)"
              />
              <path
                d="M 0 90 Q 20 60 40 75 T 80 30 T 100 20"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Reference dots */}
              <circle cx="20" cy="71" r="2.5" fill="#ffffff" />
              <circle cx="58" cy="48" r="2.5" fill="#ffffff" />
              <circle cx="81" cy="30" r="2.5" fill="#ffffff" />
            </svg>
            <div className="absolute left-2 top-2 text-[9px] text-gray-500 font-mono">1.8K views</div>
            <div className="absolute left-2 bottom-2 text-[9px] text-gray-500 font-mono">0 views</div>
          </div>
          <div className="flex justify-between text-[9px] text-gray-500 font-mono px-1">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Daily Page Views Bar Chart (SVG) */}
        <div className="bg-[#0a0c10]/60 border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-[10px] uppercase text-gray-400 font-mono font-bold">Daily Ingestion views</span>
            <span className="text-[9px] text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full font-mono">Bar Graph</span>
          </div>
          <div className="h-44 w-full flex items-end justify-between px-2 pt-4 relative">
            {/* Simple CSS-based bar visualization */}
            {[50, 80, 45, 95, 60, 110, 85].map((val, i) => (
              <div key={i} className="w-[11%] flex flex-col items-center gap-1 group">
                <div className="text-[8px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {val}
                </div>
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-cyan-400 rounded-t-md group-hover:from-cyan-400 group-hover:to-purple-500 transition-all cursor-pointer"
                  style={{ height: `${(val / 120) * 120}px` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-gray-500 font-mono px-2">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>
        </div>

        {/* Media Storage Donut Chart (SVG) */}
        <div className="bg-[#0a0c10]/60 border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-[10px] uppercase text-gray-400 font-mono font-bold">Cloud Storage allocation</span>
            <span className="text-[9px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full font-mono">Radial Gauge</span>
          </div>
          <div className="h-44 w-full flex items-center justify-center relative">
            <svg className="w-32 h-32 transform -rotate-90">
              {/* Back Circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                className="stroke-white/5"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress Circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                className="stroke-cyan-400"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - 0.145)}
                strokeLinecap="round"
              />
            </svg>
            {/* Concentric Center text */}
            <div className="absolute text-center">
              <div className="text-xl font-bold text-white font-mono">14.5%</div>
              <div className="text-[8px] text-gray-500 uppercase font-mono">14.5MB / 100MB</div>
            </div>
          </div>
          <div className="flex justify-around text-[9px] text-gray-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              <span>Used: 14.5MB</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/10 inline-block" />
              <span>Free: 85.5MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Diagnostics and Active Security Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-time Diagnostics */}
        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4">
          <h4 className="text-xs uppercase text-white font-mono font-bold flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Virtual Server Status & Diagnostics</span>
          </h4>
          <div className="divide-y divide-white/5 text-xs font-mono">
            <div className="py-2.5 flex justify-between">
              <span className="text-gray-500">Platform Host</span>
              <span className="text-white">Google Cloud Run (Sandboxed VM)</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-gray-500">SSL Certificate Status</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Active Secure</span>
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-gray-500">Virtual Environment Port</span>
              <span className="text-cyan-400 font-bold">3000 Ingress Routed</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-gray-500">Seeded Assets Version</span>
              <span className="text-purple-400 font-bold">HL_RELEASE_v2.5</span>
            </div>
          </div>
        </div>

        {/* Recent logs */}
        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-xs uppercase text-white font-mono font-bold flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Security & Action Timeline</span>
            </h4>
            <button
              onClick={() => setActiveSubTab("backups-logs")}
              className="text-[9px] text-cyan-400 uppercase font-mono hover:underline"
            >
              View All Logs
            </button>
          </div>
          <div className="space-y-2.5 max-h-[175px] overflow-y-auto pr-1">
            {logs.slice(0, 5).map((log: any) => (
              <div key={log.id} className="text-[10px] font-mono leading-relaxed bg-black/20 p-2 border border-white/5 rounded">
                <div className="flex justify-between text-gray-500 text-[8px] mb-0.5">
                  <span>[{log.type.toUpperCase()}] • {log.ip}</span>
                  <span>{new Date(log.date).toLocaleTimeString()}</span>
                </div>
                <div className="text-gray-300">
                  {log.text} <span className="text-cyan-400">({log.user})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
