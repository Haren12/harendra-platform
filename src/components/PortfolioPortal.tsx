/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Award, Briefcase, Calendar, Star, Trophy, Quote, Target, Heart } from "lucide-react";

interface PortfolioPortalProps {
  lang: "np" | "en";
}

export default function PortfolioPortal({ lang }: PortfolioPortalProps) {
  const experiences = [
    {
      period: "2024 - Present",
      role_en: "Senior Full Stack Systems Architect",
      role_np: "वरिष्ठ पूर्ण स्ट्याक प्रणाली वास्तुकार",
      company: "Enterprise Technology Labs",
      desc_en: "Leading development of high-throughput AI platforms and cloud ledger integrations. Orchestrated sub-second telemetry dashboards using WebSockets and Node.js microservices.",
      desc_np: "उच्च-थ्रुपुट एआई मञ्चहरू र क्लाउड लेजर एकीकरणको विकासको नेतृत्व गर्दै। वेबसकेट र नोड.जेएस माइक्रोसर्भिस प्रयोग गरेर सब-सेकेन्ड टेलिमेट्री ड्यासबोर्डहरू व्यवस्थित गरियो।"
    },
    {
      period: "2022 - 2024",
      role_en: "Full Stack Engineer & Team Lead",
      role_np: "पूर्ण स्ट्याक इन्जिनियर र टिम लिड",
      company: "Fintech Systems Nepal",
      desc_en: "Engineered cryptographically sealed financial databases and transaction loggers. Optimized relational schema throughput processing up to 10,000 requests per second.",
      desc_np: "क्रिप्टोग्राफिक रूपमा सुरक्षित वित्तीय डाटाबेस र लेनदेन लगिङ प्रणाली निर्माण गरियो। प्रति सेकेन्ड १०,००० सम्म अनुरोधहरू प्रक्रिया गर्न डाटाबेस वास्तुकला अप्टिमाइज गरियो।"
    },
    {
      period: "2020 - 2022",
      role_en: "React & Node Developer",
      role_np: "रिएक्ट र नोड विकासकर्ता",
      company: "Apex IT Solutions",
      desc_en: "Crafted modular user interfaces and API micro-services. Specialized in search-engine optimized (SEO) single-page applications using React 18, Vite, and Tailwind CSS.",
      desc_np: "मोड्युलर प्रयोगकर्ता इन्टरफेस र एपीआई माइक्रोसर्भिसहरू निर्माण गरियो। रिएक्ट १८, भाइट र टेलविन्ड सीएसएस प्रयोग गरेर खोज इन्जिन अनुकूलित (SEO) एकल-पृष्ठ अनुप्रयोगहरूमा विशेषज्ञता।"
    }
  ];

  const skillCategories = [
    {
      title_en: "Backend & Systems Security",
      title_np: "ब्याकइन्ड र प्रणाली सुरक्षा",
      skills: ["Node.js", "Express", "TypeScript", "PostgreSQL", "Docker", "REST/GraphQL APIs"]
    },
    {
      title_en: "Frontend Engineering",
      title_np: "फ्रन्टएन्ड इन्जिनियरिङ",
      skills: ["React 19 / Vite", "Tailwind CSS", "Redux ToolKit", "D3.js Visualization", "HTML5 Canvas", "Next.js"]
    },
    {
      title_en: "Cloud Infrastructure & Sync",
      title_np: "क्लाउड पूर्वाधार र सिंक",
      skills: ["Supabase / Firebase", "Amazon Web Services", "WebSocket Protocol", "CI/CD Pipeline", "Linux Admin", "Nginx Proxy"]
    }
  ];

  const testimonials = [
    {
      quote_en: "Harendra delivered our bilingual AI publishing platform with absolute structural perfection. His speed, clean code, and enterprise-focused engineering is unparalleled.",
      quote_np: "हरेन्द्रले हाम्रो द्विभाषी एआई प्रकाशन प्लेटफर्म पूर्ण संरचनात्मक उत्कृष्टताका साथ प्रदान गर्नुभयो। उहाँको गति, सफा कोड र उद्यम-केन्द्रित ईन्जिनियरिङ अतुलनीय छ।",
      author: "Prakash Shrestha",
      role_en: "Director of Product, MediaTech Asia",
      role_np: "उत्पादन निर्देशक, मिडियाटेक एसिया"
    },
    {
      quote_en: "The financial ledger database designed by Harendra resolved our concurrent race conditions completely. A remarkable software architect who deeply understands database locking.",
      quote_np: "हरेन्द्रद्वारा डिजाइन गरिएको वित्तीय बहीखाता डाटाबेसले हाम्रा समवर्ती रेस अवस्थाहरूलाई पूर्ण रूपमा समाधान गर्यो। डाटाबेस लक बुझ्ने एक उल्लेखनीय सफ्टवेयर वास्तुकार।",
      author: "Dr. Anjana Devkota",
      role_en: "Chief Information Officer, Nepal FinSys",
      role_np: "मुख्य सूचना अधिकारी, नेपाल फिनसिस्को"
    }
  ];

  const achievements = [
    {
      title_en: "Elite Tech Innovator Award 2025",
      title_np: "उत्कृष्ट प्राविधिक आविष्कारक पुरस्कार २०२५",
      issuer: "Federation of Nepal IT Contractors"
    },
    {
      title_en: "First Place - National Enterprise AI Hackathon 2026",
      title_np: "प्रथम स्थान - राष्ट्रिय उद्यम एआई ह्याकाथन २०२६",
      issuer: "Nepal Academy of Tech & AI"
    }
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-16">
      
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono tracking-widest uppercase mb-1">
          <Briefcase className="w-3.5 h-3.5" />
          <span>{lang === "np" ? "व्यावसायिक इतिहास" : "PROFESSIONAL PROFILE"}</span>
        </div>
        <h2 className="text-3xl font-display font-bold text-white tracking-tight">
          {lang === "np" ? "अनुभव र प्राविधिक यात्रा" : "Career Timeline & Tech Stack"}
        </h2>
      </div>

      {/* Experience Timeline */}
      <div className="relative border-l border-white/10 pl-6 ml-4 space-y-12">
        {experiences.map((exp, idx) => (
          <div key={idx} className="relative group">
            {/* Dot indicator */}
            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-cyan-400 border-4 border-[#050505] group-hover:scale-125 transition-transform"></div>
            
            <div className="space-y-2 bg-[#0d0e15]/60 border border-white/5 p-6 rounded-2xl shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-cyan-400 font-bold">{exp.period}</span>
                <span className="text-gray-500 uppercase">{exp.company}</span>
              </div>
              <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
                {lang === "np" ? exp.role_np : exp.role_en}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
                {lang === "np" ? exp.desc_np : exp.desc_en}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Matrix Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            {lang === "np" ? "प्राविधिक वर्गीकरण" : "Detailed Skill Classification"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skillCategories.map((cat, idx) => (
            <div key={idx} className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-display font-bold text-white tracking-wide uppercase border-b border-white/5 pb-2">
                {lang === "np" ? cat.title_np : cat.title_en}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill, sIdx) => (
                  <span 
                    key={sIdx}
                    className="text-[10px] bg-white/5 border border-white/5 text-gray-300 font-mono px-2.5 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Showcase */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            {lang === "np" ? "प्रमुख उपलब्धि र सम्मान" : "Achievements & Core Laurels"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {achievements.map((ach, idx) => (
            <div key={idx} className="bg-gradient-to-r from-[#111218] to-indigo-950/20 border border-white/10 rounded-2xl p-6 flex gap-4 items-start shadow-md">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-display font-semibold text-white tracking-tight">
                  {lang === "np" ? ach.title_np : ach.title_en}
                </h4>
                <p className="text-[10px] font-mono text-gray-500 uppercase">{ach.issuer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Testimonials */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Quote className="w-5 h-5 text-cyan-400" />
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            {lang === "np" ? "क्लाइन्ट प्रशंसापत्रहरू" : "Professional Endorsements"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((test, idx) => (
            <div key={idx} className="bg-[#111218]/50 border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <p className="text-xs sm:text-sm text-gray-300 italic leading-relaxed font-sans">
                &ldquo;{lang === "np" ? test.quote_np : test.quote_en}&rdquo;
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                  {test.author[0]}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-white tracking-tight">{test.author}</h4>
                  <p className="text-[9px] font-mono text-gray-500 uppercase">{lang === "np" ? test.role_np : test.role_en}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
