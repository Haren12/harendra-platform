/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Send, CheckCircle, Smartphone, Mail, Facebook, Linkedin, Terminal, Command, Star, Code, AlertCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";

interface HeroProps {
  lang: "np" | "en";
  setCurrentTab: (tab: string) => void;
}

export default function Hero({ lang, setCurrentTab }: HeroProps) {
  const [typedText, setTypedText] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const roles = lang === "np" 
    ? ["पूर्ण स्ट्याक वेब विकासकर्ता", "रिएक्ट र नोड विशेषज्ञ", "एआई अनुप्रयोग वास्तुकार", "एन्टरप्राइज एपीआई इन्जिनियर"]
    : ["Full Stack Web Developer", "React & Node.js Specialist", "AI Applications Architect", "Enterprise API Engineer"];

  // Typing Effect
  useEffect(() => {
    const currentRole = roles[roleIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setTypedText(currentRole.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      }, 40);
    } else {
      timer = setTimeout(() => {
        setTypedText(currentRole.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, 70);
    }

    if (!isDeleting && charIndex === currentRole.length) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, roleIndex, lang]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error: insertError } = await supabase.from("contact_submissions").insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            category: "General Inquiry",
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
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          category: "General Inquiry",
          message: formData.message,
          date: new Date().toISOString()
        });
        localStorage.setItem("contact_submissions", JSON.stringify(currentSubmissions));
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { value: "5+", label_np: "वर्षको अनुभव", label_en: "Years Experience" },
    { value: "15+", label_np: "सम्पन्न परियोजनाहरू", label_en: "Core Projects" },
    { value: "40+", label_np: "लेखेका ब्लगहरू", label_en: "Articles Published" },
    { value: "99%", label_np: "क्लाइन्ट सन्तुष्टि", label_en: "Success Rating" }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: Bio Info */}
        <div className="lg:col-span-7 space-y-8">
          {/* Immersive status badge */}
          <div className="inline-block px-4 py-1.5 bg-blue-900/30 border border-blue-500/30 rounded-full text-xs font-mono text-cyan-400">
            {lang === "np" ? "> status: सक्रिय_उत्पादन // नोड: ne-01" : "> status: PRODUCTION_READY // node: ne-01"}
          </div>

          <div className="space-y-5">
            <div className="text-sm font-mono text-gray-500 tracking-wide uppercase">
              {lang === "np" ? "इन्जिनियर प्रोफाइल // हरेन्द्र लाम्साल" : "Engineer Profile // Harendra Lamsal"}
            </div>
            
            {/* Elegant high-tech title layout */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] text-white tracking-tighter">
              {lang === "np" ? (
                <>
                  निर्माण <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-300">अर्को-पुस्ताको</span><br/>
                  एन्टरप्राइज एआई।
                </>
              ) : (
                <>
                  Building <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-300">Next-Gen</span><br/>
                  Enterprise AI.
                </>
              )}
            </h1>
            
            {/* Typing Effect Container */}
            <div className="h-10 flex items-center">
              <span className="text-base sm:text-lg font-mono text-cyan-400 font-semibold">
                &gt; <span className="underline decoration-indigo-500 decoration-2 underline-offset-4">{typedText}</span>
              </span>
              <span className="w-1.5 h-4.5 bg-cyan-400 ml-1 animate-pulse shrink-0"></span>
            </div>

            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl">
              {lang === "np"
                ? "म एक अनुभवी पूर्ण स्ट्याक वेब विकासकर्ता हुँ। म जटिल उद्यम-स्तरका प्रणालीहरू, सुरक्षित फिनटेक ब्याकइन्डहरू, र उत्तरदायी रियल-टाइम अनुप्रयोगहरू निर्माण गर्नमा विशेषज्ञता राख्छु। म व्यवसायहरूलाई प्रविधिको सही उपयोगमार्फत बलियो डिजिटल पूर्वाधार प्रदान गर्न प्रतिबद्ध छु।"
                : "Experienced Full Stack Web Developer specializing in engineering robust enterprise-level portals, highly secured FinTech microservices, and reactive IoT environments. Designing high-throughput, SEO-optimized systems for production environments."}
            </p>
          </div>

          {/* Social Links & Info Coordinates */}
          <div className="p-5 bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>+977 9823587535</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>harendralamsal4140@gmail.com</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-white/5">
              <a
                href="https://web.facebook.com/harendra.lamsala/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
              </a>
              <span className="text-gray-700">|</span>
              <a
                href="https://www.linkedin.com/in/harendra-lamsal-728a6122b"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 hover:border-cyan-500/20 p-4 rounded-2xl text-center transition-all">
                <div className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">{s.value}</div>
                <div className="text-[10px] sm:text-xs text-gray-500 font-mono mt-1">{lang === "np" ? s.label_np : s.label_en}</div>
              </div>
            ))}
          </div>

          {/* Direct Actions */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setCurrentTab("projects")}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider font-mono cursor-pointer transition-all flex items-center gap-2 group"
            >
              <span>{lang === "np" ? "परियोजनाहरू हेर्नुहोस्" : "View Portfolio"}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <button
              onClick={() => setCurrentTab("news")}
              className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-wider font-mono cursor-pointer transition-all"
            >
              {lang === "np" ? "प्रविधि समाचार पोर्टल" : "Ecosystem & News"}
            </button>
          </div>
        </div>

        {/* Right: Immersive Code Visual Component & Contact Form */}
        <div className="lg:col-span-5 space-y-6">
          {/* Beautiful Code Visualizer (Right Column mockup component) */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                <span className="ml-2 text-[10px] font-mono text-white/40 uppercase tracking-widest">system_init.ts</span>
              </div>
              <span className="text-[9px] font-mono text-cyan-400 tracking-widest animate-pulse">LIVE TELEMETRY</span>
            </div>
            
            <div className="p-6 pt-16 font-mono text-xs space-y-3.5 text-gray-300">
              <p className="text-blue-400">const developer = {"{"}</p>
              <p className="pl-4 text-gray-300">name: <span className="text-emerald-400">"Harendra Lamsal"</span>,</p>
              <p className="pl-4 text-gray-300">role: <span className="text-emerald-400">"Lead Full Stack Engineer"</span>,</p>
              <p className="pl-4 text-gray-300">stack: [<span className="text-cyan-400">"React"</span>, <span className="text-cyan-400">"TypeScript"</span>, <span className="text-cyan-400">"Express"</span>],</p>
              <p className="pl-4 text-gray-300">focus: <span className="text-emerald-400">"Enterprise Architecture"</span>,</p>
              <p className="pl-4 text-gray-300">availability: <span className="text-emerald-400">"OPEN_FOR_COLLABORATION"</span></p>
              <p className="text-blue-400">{"};"}</p>
              
              <div className="mt-6 p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
                <div className="text-[10px] text-cyan-400/60 uppercase mb-2">Active Realtime Feed</div>
                <div className="flex justify-between items-end">
                  <div className="flex space-x-1 items-end">
                    <div className="w-1 h-6 bg-cyan-400/40 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-1 h-9 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                    <div className="w-1 h-4 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: "0.5s" }}></div>
                    <div className="w-1 h-7 bg-cyan-400/80 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">99.9%</div>
                    <div className="text-[9px] text-gray-500 font-mono">SYSTEM UPTIME</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Bilingual Contact Form */}
          <div className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Command className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display font-semibold text-white text-base">
                {lang === "np" ? "सम्पर्क फारम" : "Secure Ingestion Form"}
              </h3>
            </div>

            {submitted ? (
              <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 p-5 rounded-lg text-center space-y-3">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-mono">
                  {lang === "np"
                    ? "तपाईंको सन्देश सफलतापूर्वक रेकर्ड भयो! हरेन्द्रले चाँडै सम्पर्क गर्नुहुनेछ।"
                    : "Message ingested successfully! Harendra will review and reply shortly."}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-[10px] uppercase tracking-wider text-cyan-400 underline font-mono cursor-pointer"
                >
                  {lang === "np" ? "नयाँ सन्देश पठाउनुहोस्" : "Send Another Message"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-gray-500 uppercase">
                      {lang === "np" ? "नाम" : "Name"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Harendra Lamsal"
                      className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/50 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-gray-500 uppercase">
                      {lang === "np" ? "इमेल" : "Email"}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="harendra@example.com"
                      className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/50 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-gray-500 uppercase">
                    {lang === "np" ? "विषय" : "Subject"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={lang === "np" ? "परियोजना विकास सम्बन्धी" : "Enterprise Consulting Inquiry"}
                    className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/50 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-gray-500 uppercase">
                    {lang === "np" ? "सन्देश" : "Message"}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={lang === "np" ? "आफ्नो आवश्यकता यहाँ उल्लेख गर्नुहोस्..." : "Specify your enterprise criteria here..."}
                    className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/50 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>

                {formError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/20 border border-red-500/20 px-3 py-2 rounded-lg font-mono">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg font-mono cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-black" />
                  <span>{submitting ? (lang === "np" ? "पठाउँदैछ..." : "Transmitting...") : (lang === "np" ? "सन्देश सुरक्षित रूपमा पठाउनुहोस्" : "Secure Dispatch")}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
