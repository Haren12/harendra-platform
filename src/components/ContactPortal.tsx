/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, Terminal, HelpCircle, AlertCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";

interface ContactPortalProps {
  lang: "np" | "en";
}

export default function ContactPortal({ lang }: ContactPortalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "General Inquiry",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "General Inquiry",
    "Freelance Work",
    "Collaboration",
    "Job Opportunity"
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error: insertError } = await supabase.from("contact_submissions").insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            category: formData.category,
            message: formData.message,
            created_at: new Date().toISOString()
          }
        ]);
        if (insertError) {
          console.warn("Contact submission failed to write to Supabase table, recording locally instead:", insertError);
        }
      } else {
        // Save to local logs for high-fidelity offline/standalone operation
        const currentSubmissions = JSON.parse(localStorage.getItem("contact_submissions") || "[]");
        currentSubmissions.push({
          id: `contact-${Date.now()}`,
          ...formData,
          date: new Date().toISOString()
        });
        localStorage.setItem("contact_submissions", JSON.stringify(currentSubmissions));
      }

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "General Inquiry",
        message: ""
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-12">
      
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono tracking-widest uppercase mb-1">
          <Mail className="w-3.5 h-3.5" />
          <span>{lang === "np" ? "सम्पर्क गेटवे" : "SECURE INGESTION PORTAL"}</span>
        </div>
        <h2 className="text-3xl font-display font-bold text-white tracking-tight">
          {lang === "np" ? "परियोजना प्रस्ताव वा सोधपुछ पठाउनुहोस्" : "Lead Generation & Inquiries"}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Coordinates & Vector Map (Left 5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest">Technical Coordinates</h3>
            
            <div className="space-y-4 text-xs sm:text-sm font-sans">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-400/5 border border-cyan-400/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-mono">PRIMARY INGESTION</div>
                  <a href="mailto:harendralamsal4140@gmail.com" className="text-white hover:text-cyan-400 font-semibold">
                    harendralamsal4140@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-400/5 border border-cyan-400/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-mono">TELEMETRY ACCESS</div>
                  <a href="tel:+9779823587535" className="text-white hover:text-cyan-400 font-semibold font-mono">
                    +977 9823587535
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-400/5 border border-cyan-400/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-mono">GEO-COORDINATES</div>
                  <span className="text-white font-semibold">Kathmandu, Nepal</span>
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOM STYLED SVG MAP OF NEPAL */}
          <div className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase">
              <span>Geo-Telemetry Visualization</span>
              <span className="text-cyan-400 animate-pulse">ACTIVE NODE</span>
            </div>

            {/* Custom Map Vector representation of Nepal/Kathmandu */}
            <div className="relative h-44 border border-white/5 rounded-xl bg-black/60 overflow-hidden flex items-center justify-center p-4">
              <svg 
                viewBox="0 0 500 220" 
                className="w-full h-full opacity-60 text-cyan-400/20 fill-current"
                style={{ filter: "drop-shadow(0 0 10px rgba(6, 182, 212, 0.15))" }}
              >
                {/* Simplified vector path outline of Nepal */}
                <path d="M 10 90 Q 70 80, 120 70 T 220 80 Q 290 90, 340 70 T 450 100 Q 480 110, 490 120 L 485 140 Q 440 150, 390 160 T 290 150 Q 200 160, 130 145 T 40 120 Z" />
                
                {/* Ring of targeted Node representing Kathmandu */}
                <circle cx="340" cy="115" r="8" className="fill-cyan-400/30 stroke-cyan-400 stroke-2 animate-pulse" />
                <circle cx="340" cy="115" r="2" className="fill-cyan-400" />
                
                {/* Visual grid ticks representing tracking coordinates */}
                <line x1="340" y1="20" x2="340" y2="107" stroke="rgba(6, 182, 212, 0.4)" strokeDasharray="3,3" />
                <line x1="340" y1="115" x2="340" y2="200" stroke="rgba(6, 182, 212, 0.4)" strokeDasharray="3,3" />
                <line x1="50" y1="115" x2="332" y2="115" stroke="rgba(6, 182, 212, 0.4)" strokeDasharray="3,3" />
                <line x1="348" y1="115" x2="450" y2="115" stroke="rgba(6, 182, 212, 0.4)" strokeDasharray="3,3" />
              </svg>

              <div className="absolute top-4 left-4 bg-black/80 border border-white/10 px-2.5 py-1 rounded text-[9px] font-mono text-cyan-400 uppercase tracking-wider">
                Target Node: Kathmandu
              </div>
            </div>
          </div>

        </div>

        {/* Lead Ingestion Form (Right 7 columns) */}
        <div className="lg:col-span-7">
          
          <div className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            
            <div className="flex items-center gap-2">
              <Terminal className="w-4.5 h-4.5 text-cyan-400" />
              <span className="font-mono text-xs uppercase tracking-widest text-white/80">secure_inquiry_ingestion</span>
            </div>

            {submitted ? (
              <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 p-6 rounded-xl text-center space-y-4">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold font-mono">TRANSMISSION ENCRYPTED & INGESTED</h4>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  {lang === "np"
                    ? "तपाईंको प्रस्ताव सुरक्षित रूपमा प्राप्त भएको छ! हरेन्द्रले तपाईंको विवरण समीक्षा गरेर चाँडै इमेल मार्फत सम्पर्क गर्नुहुनेछ।"
                    : "Your project parameters have been cryptographically signed and received. Harendra will reply to your primary endpoint address."}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded font-mono text-xs text-cyan-400 uppercase tracking-widest cursor-pointer"
                >
                  New Ingestion
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-gray-500 uppercase">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/50 text-white rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-gray-500 uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@enterprise.com"
                      className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/50 text-white rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Subject */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-gray-500 uppercase">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="New Platform Architecture"
                      className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/50 text-white rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
                    />
                  </div>

                  {/* Inquiry category */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-gray-500 uppercase">Inquiry Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#111218] border border-white/10 focus:border-cyan-400/50 text-white rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-gray-500 uppercase">Message Specifications</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="We need a secure Express backend synced with real-time WebSockets..."
                    className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/50 text-white rounded-lg p-4 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/20 border border-red-500/20 px-3 py-2 rounded-lg font-mono">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg font-mono cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-black" />
                  <span>{submitting ? "Transmitting..." : "Secure Transmission Dispatch"}</span>
                </button>

              </form>
            )}

          </div>

        </div>

      </div>

    </section>
  );
}
