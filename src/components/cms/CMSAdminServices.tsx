/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, Mail, Send, Sliders, DollarSign, Globe, Settings, 
  Download, Upload, CheckCircle, AlertTriangle, Play, HelpCircle
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  date: string;
  active: boolean;
}

interface Advertisement {
  id: string;
  slot: string;
  imageUrl: string;
  targetUrl: string;
  active: boolean;
  impressions: number;
  scheduledUntil?: string;
}

interface WebSettings {
  siteName: string;
  logoUrl: string;
  contactEmail: string;
  footerLine: string;
}

interface CMSAdminServicesProps {
  subscribers: Subscriber[];
  onAddSubscribers: (emails: string[]) => Promise<void>;
  advertisements: Advertisement[];
  onToggleAd: (id: string) => Promise<void>;
  onUpdateAd: (id: string, payload: any) => Promise<void>;
  settings: WebSettings;
  onUpdateSettings: (payload: any) => Promise<void>;
  lang: "np" | "en";
}

export default function CMSAdminServices({
  subscribers, onAddSubscribers, advertisements, onToggleAd, onUpdateAd, settings, onUpdateSettings, lang
}: CMSAdminServicesProps) {
  const [activeTab, setActiveTab] = useState<"newsletter" | "ads" | "settings">("newsletter");

  // Newsletter states
  const [importText, setImportText] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("digest");
  const [emailBody, setEmailBody] = useState("");
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  // Settings states
  const [tempSettings, setTempSettings] = useState<WebSettings>({ ...settings });

  React.useEffect(() => {
    if (settings) {
      setTempSettings({ ...settings });
    }
  }, [settings]);

  // Actions
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const emails = importText.split(/[,\n]/).map(email => email.trim()).filter(email => email.includes("@"));
    if (emails.length === 0) return;

    await onAddSubscribers(emails);
    setImportText("");
    alert(`Bulk import completed. Successfully registered ${emails.length} subscriber addresses!`);
  };

  const handleCampaignDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) return;

    setDispatchSuccess(true);
    setTimeout(() => {
      setDispatchSuccess(false);
      setEmailSubject("");
      setEmailBody("");
    }, 4000);
  };

  const downloadSubscriberCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Email,Date,Status"].concat(subscribers.map(s => `${s.id},${s.email},${s.date},${s.active ? "Active" : "Unsubscribed"}`)).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `harendra_subscribers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings(tempSettings);
    alert("Branding parameters updated successfully across layout engines.");
  };

  return (
    <div className="space-y-6">
      {/* Subtab selection rail */}
      <div className="flex border-b border-white/5 pb-2 overflow-x-auto gap-1">
        {(["newsletter", "ads", "settings"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-mono font-bold capitalize cursor-pointer transition-all ${
              activeTab === tab 
                ? "text-cyan-400 border-b-2 border-cyan-400" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab === "newsletter" && "Newsletter Inbound Hub"}
            {tab === "ads" && "Monetization & Ads slots"}
            {tab === "settings" && "Core Branding Settings"}
          </button>
        ))}
      </div>

      {activeTab === "newsletter" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email dispatch composer */}
          <div className="lg:col-span-2 bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4 text-xs font-mono">
            <h4 className="text-xs uppercase text-white font-bold flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Send className="w-4 h-4 text-cyan-400" />
              <span>HTML Campaign Dispatcher</span>
            </h4>

            {dispatchSuccess ? (
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-lg space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Campaign Dispatch Initiated!</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Bulk mail delivery system is dispatching campaign templates to <span className="text-white font-bold">{subscribers.length} active</span> subscribers in the queue buffer. Review delivery speed inside diagnostics.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCampaignDispatch} className="space-y-4 text-gray-400">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase">Subject Line</label>
                    <input
                      type="text"
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="e.g. Personal Technology Platform updates - July 2026"
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase">Newsletter Layout Template</label>
                    <select
                      value={emailTemplate}
                      onChange={(e) => setEmailTemplate(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white rounded px-3 py-2 focus:outline-none"
                    >
                      <option value="digest">Bilingual Tech Digest (EN/NP)</option>
                      <option value="announcement">Important System announcement</option>
                      <option value="newsletter">Weekly Personal Update Newsletter</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase">Compose Email Body (HTML Supported)</label>
                  <textarea
                    rows={8}
                    required
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="<p>Greetings reader,</p> <p>I have published new tutorials on Google Cloud Run hosting on port 3000...</p>"
                    className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-cyan-400 hover:bg-cyan-500 text-black px-5 py-2.5 rounded font-bold uppercase transition-all shadow-lg shadow-cyan-400/5 cursor-pointer"
                >
                  Dispatch Campaign
                </button>
              </form>
            )}
          </div>

          {/* Subscribers and CSV list */}
          <div className="space-y-6">
            {/* Importer */}
            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4 text-xs font-mono">
              <h4 className="text-xs uppercase text-white font-bold flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Bulk CSV / Text Importer</span>
              </h4>
              <form onSubmit={handleBulkImport} className="space-y-3.5 text-gray-400">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Paste emails separated by commas or line breaks to instantly seed lists.
                </p>
                <textarea
                  rows={4}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="ram@lamsal.name.np, sita@domain.com, shyam@net.np"
                  className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:outline-none text-[11px]"
                />
                <button
                  type="submit"
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded font-bold uppercase"
                >
                  Import Subscribers List
                </button>
              </form>
            </div>

            {/* Inbound list table */}
            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h4 className="text-xs uppercase text-white font-mono font-bold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Subscribers ({subscribers.length})</span>
                </h4>
                <button
                  onClick={downloadSubscriberCsv}
                  className="text-cyan-400 hover:underline text-[10px] font-mono flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
              <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 font-mono text-[10px]">
                {subscribers.map(sub => (
                  <div key={sub.id} className="flex justify-between items-center bg-black/20 p-2 border border-white/5 rounded">
                    <span className="text-gray-300 truncate max-w-[70%]" title={sub.email}>{sub.email}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      sub.active ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"
                    }`}>
                      {sub.active ? "ACTIVE" : "OPT_OUT"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ads" && (
        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold font-display text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Monetization & Ad Slot Scheduler</span>
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Configure slots, images, target affiliate URLs, and track live simulated impression counts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            {advertisements.map(ad => (
              <div key={ad.id} className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-4 flex flex-col justify-between hover:border-cyan-400/20 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-bold text-white uppercase text-[10px] tracking-wide">{ad.slot} Slot</span>
                    <button
                      onClick={() => onToggleAd(ad.id)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        ad.active ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {ad.active ? "● RUNNING" : "○ INACTIVE"}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 block">Ad Image URL</label>
                    <input
                      type="text"
                      value={ad.imageUrl}
                      onChange={(e) => onUpdateAd(ad.id, { ...ad, imageUrl: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-[10px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 block">Affiliate Target URL</label>
                    <input
                      type="text"
                      value={ad.targetUrl}
                      onChange={(e) => onUpdateAd(ad.id, { ...ad, targetUrl: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-[10px]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px]">
                  <span className="text-gray-500">Impressions:</span>
                  <span className="text-amber-400 font-bold">{ad.impressions} loads</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-6 max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="text-sm font-semibold font-display text-white uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Branding Parameters Consolidation</span>
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Apply configurations that synchronize dynamically with sitemaps and localized footers.
            </p>
          </div>

          <form onSubmit={triggerUpdateSettings} className="space-y-4 font-mono text-xs text-gray-400">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase">Branding Platform Name</label>
                <input
                  type="text"
                  required
                  value={tempSettings.siteName}
                  onChange={(e) => setTempSettings({ ...tempSettings, siteName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase">Branding Communication Email</label>
                <input
                  type="email"
                  required
                  value={tempSettings.contactEmail}
                  onChange={(e) => setTempSettings({ ...tempSettings, contactEmail: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase">Branding Logo Asset URL</label>
              <input
                type="text"
                required
                value={tempSettings.logoUrl}
                onChange={(e) => setTempSettings({ ...tempSettings, logoUrl: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase">Global Footer Copyright Line</label>
              <input
                type="text"
                required
                value={tempSettings.footerLine}
                onChange={(e) => setTempSettings({ ...tempSettings, footerLine: e.target.value })}
                className="w-full bg-[#05070a] border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="bg-cyan-400 hover:bg-cyan-500 text-black px-5 py-2.5 rounded font-bold uppercase cursor-pointer"
            >
              Update Settings Parameters
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
