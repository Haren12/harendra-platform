/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Project } from "../types.js";
import { Layers, Github, ExternalLink, Cpu, Code2, ShieldAlert } from "lucide-react";

interface PortfolioProps {
  projects: Project[];
  lang: "np" | "en";
}

export default function Portfolio({ projects, lang }: PortfolioProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  const filteredProjects = selectedCategory === "All"
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono tracking-widest uppercase mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === "np" ? "परियोजनाहरू" : "ENTERPRISE SHOWCASE"}</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">
            {lang === "np" ? "मेरा उत्कृष्ट परियोजनाहरू" : "Elite Portfolio Projects"}
          </h2>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-white/5 text-cyan-400 border border-white/10 shadow-sm"
                  : "bg-transparent border border-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center p-12 bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-2xl">
          <ShieldAlert className="w-10 h-10 text-brand-purple mx-auto mb-3" />
          <p className="text-gray-400 font-mono text-sm">
            {lang === "np" ? "कुनै परियोजना फेला परेन।" : "No showcases registered under this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 hover:border-cyan-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all hover:scale-[1.01] hover:shadow-2xl"
            >
              <div className="space-y-4">
                {/* Header Category and ID */}
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase">
                  <span>{p.category}</span>
                  <span className="text-cyan-400/70">{p.id}</span>
                </div>

                {/* Title */}
                <h3 className="text-base font-display font-semibold text-white tracking-tight leading-snug">
                  {lang === "np" ? p.title_np : p.title_en}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-400 leading-relaxed">
                  {lang === "np" ? p.desc_np : p.desc_en}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {p.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[10px] bg-white/5 border border-white/10 text-cyan-400 font-mono px-2 py-0.5 rounded"
                    >
                      <Code2 className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{tech}</span>
                    </span>
                  ))}
                </div>

                {/* Demo Details */}
                {p.demoDetails && (
                  <div className="bg-black/60 border border-white/5 rounded p-3 text-[11px] font-mono text-gray-400 space-y-1">
                    <div className="flex items-center gap-1.5 text-brand-purple uppercase text-[9px] tracking-wider font-semibold">
                      <Cpu className="w-3 h-3" />
                      <span>{lang === "np" ? "प्रणाली परिदृश्य" : "SYSTEM LANDSCAPE"}</span>
                    </div>
                    <p>{p.demoDetails}</p>
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="flex items-center gap-3 pt-5 border-t border-white/5 mt-5">
                {p.githubUrl && (
                  <a
                    href={p.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    <Github className="w-4 h-4 text-brand-purple" />
                    <span>Repository</span>
                  </a>
                )}
                {p.liveUrl && (
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors ml-auto"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
