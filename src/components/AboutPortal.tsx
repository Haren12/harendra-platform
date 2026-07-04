/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User, Terminal, Milestone, Target, Compass, Sparkles } from "lucide-react";

interface AboutPortalProps {
  lang: "np" | "en";
}

export default function AboutPortal({ lang }: AboutPortalProps) {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-12">
      
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono tracking-widest uppercase mb-1">
          <User className="w-3.5 h-3.5" />
          <span>{lang === "np" ? "मेरो बारेमा" : "ABOUT THE ARCHITECT"}</span>
        </div>
        <h2 className="text-3xl font-display font-bold text-white tracking-tight">
          {lang === "np" ? "हरेन्द्र लाम्साललाई चिन्नुहोस्" : "Engineering Digital Legacies"}
        </h2>
      </div>

      {/* Main Bio Card */}
      <div className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 text-cyan-400">
          <Terminal className="w-4.5 h-4.5" />
          <span className="font-mono text-xs uppercase tracking-widest">system_identity.log</span>
        </div>

        <div className="space-y-4 text-gray-300 text-sm leading-relaxed font-sans">
          <p>
            {lang === "np"
              ? "म हरेन्द्र लाम्साल, नेपालका एक कुशल सफ्टवेयर इन्जिनियर र पूर्ण स्ट्याक विकासकर्ता हुँ। म विगत केही वर्षदेखि प्रतिक्रियात्मक वेब प्रविधिहरू, एआई एप्लिकेसनहरू, र सुरक्षित ब्याकइन्ड माइक्रोसर्भिस वास्तुकलाहरू निर्माण गर्दै आएको छु।"
              : "I am Harendra Lamsal, a dedicated software architect and full stack engineer based in Nepal. I specialize in designing and engineering high-throughput React applications, custom server-side Gemini AI models, and secure, fault-tolerant financial ledgers."}
          </p>
          <p>
            {lang === "np"
              ? "मेरो मुख्य लक्ष्य उद्यम-स्तरको सफ्टवेयर विकासमा देखा पर्ने जटिल वास्तुकला सम्बन्धी अवरोधहरूलाई सहज, गतिशील र गति-अनुकूलित डिजिटल सोलुसन मार्फत हल गर्नु हो।"
              : "My methodology converges clean visual design with performant software architectures. I prioritize writing atomic, testable, and deeply documented TypeScript code, ensuring production stability under volatile user traffic loads."}
          </p>
        </div>
      </div>

      {/* Mission & Vision Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mission */}
        <div className="bg-[#0d0e15]/60 border border-white/5 rounded-2xl p-6 space-y-4 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-cyan-400/5 border border-cyan-400/10 flex items-center justify-center text-cyan-400 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-display font-bold text-white tracking-tight">
            {lang === "np" ? "मेरो लक्ष्य (Mission)" : "Engineering Mission"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            {lang === "np"
              ? "सफा, मापनयोग्य र मर्मत गर्न सजिलो कोड लेख्दै जटिल उद्यम-स्तरका प्रणालीहरूलाई सरल बनाउने र व्यवसायहरूलाई बलियो प्रविधि प्रदान गर्ने।"
              : "To democratize complex technical paradigms by crafting modular, scalable, and secure cloud infrastructure architectures backed by meticulous software methodologies."}
          </p>
        </div>

        {/* Vision */}
        <div className="bg-[#0d0e15]/60 border border-white/5 rounded-2xl p-6 space-y-4 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-indigo-400/5 border border-indigo-400/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-display font-bold text-white tracking-tight">
            {lang === "np" ? "मेरो दृष्टिकोण (Vision)" : "Technological Vision"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            {lang === "np"
              ? "द्विभाषी एआई र प्रविधिको सही एकीकरण मार्फत नेपाल र विश्वभरका डिजिटल प्लेटफर्महरूमा नयाँ आयाम थप्दै सुरक्षित फिनटेक क्रान्ति ल्याउने।"
              : "To serve as a cornerstone in the localization of intelligent AI ecosystems in Nepal, raising production quality standards of regional enterprise portals globally."}
          </p>
        </div>
      </div>

      {/* Personal Journey */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Milestone className="w-5 h-5 text-cyan-400" />
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            {lang === "np" ? "मेरो व्यक्तिगत कथा" : "The Core Story"}
          </h2>
        </div>

        <div className="bg-[#0d0e15]/40 border border-white/5 p-6 rounded-2xl space-y-4 text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
          <p>
            {lang === "np"
              ? "मैले कम्प्युटर विज्ञानको क्षेत्रमा आफ्नो पहिलो पाइला सानै उमेरमा चालेको थिएँ। हार्डवेयर भित्र कमाण्ड लाइनमा खेल्दै गर्दा, कोडिङमार्फत डिजिटल संसार निर्माण गर्ने मेरो रुचि बढ्यो। बिस्तारै, मैले साधारण स्क्रिप्टिङबाट नोड.जेएस, रियाक्ट र अत्याधुनिक जेमिनी एआई मोडेलहरू मार्फत पूर्ण प्रणाली निर्माण गर्न थाले।"
              : "My passion for systems engineering ignited during my early days exploring terminal terminals and hardware components. Realizing that software has the power to bridge financial and social structures led me to pursue programming. Since then, I've committed to engineering high-performance software, combining full-stack development with telemetry insights."}
          </p>
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs pt-2">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>{lang === "np" ? "अझ राम्रो कोड, अझ राम्रो भविष्य।" : "Atomic commit protocols maintain operational consistency."}</span>
          </div>
        </div>
      </div>

    </section>
  );
}
