/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Certificate } from "../types.js";
import { Award, ShieldCheck, ExternalLink, Calendar, ShieldAlert } from "lucide-react";

interface CertificatesProps {
  certificates: Certificate[];
  lang: "np" | "en";
}

export default function Certificates({ certificates, lang }: CertificatesProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="mb-8">
        <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono tracking-widest uppercase mb-1">
          <Award className="w-3.5 h-3.5" />
          <span>{lang === "np" ? "प्रमाणपत्रहरू" : "VERIFIED CREDENTIALS"}</span>
        </div>
        <h2 className="text-3xl font-display font-bold text-white tracking-tight">
          {lang === "np" ? "प्रमाणित व्यावसायिक प्रमाणपत्रहरू" : "Professional Certifications"}
        </h2>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center p-12 bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 rounded-2xl">
          <ShieldAlert className="w-10 h-10 text-brand-purple mx-auto mb-3" />
          <p className="text-gray-400 font-mono text-sm">
            {lang === "np" ? "कुनै प्रमाणपत्रहरू फेला परेन।" : "No verified certifications cataloged yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((c) => (
            <div
              key={c.id}
              className="bg-gradient-to-br from-[#111218] to-[#07080b] border border-white/10 hover:border-cyan-500/30 rounded-2xl p-6 flex flex-col justify-between shadow-lg transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">
                    {c.issuer}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-display font-semibold text-white tracking-tight leading-snug">
                    {lang === "np" ? c.title_np : c.title_en}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-brand-purple" />
                    <span>Issued: {c.date}</span>
                  </div>
                </div>

                {c.credentialId && (
                  <div className="bg-black/60 border border-white/5 rounded p-2.5 text-[11px] font-mono text-gray-400">
                    <span className="text-gray-500 mr-1.5">Credential ID:</span>
                    <span className="text-cyan-400 font-semibold">{c.credentialId}</span>
                  </div>
                )}
              </div>

              {c.verificationUrl && (
                <div className="pt-4 border-t border-white/5 mt-5">
                  <a
                    href={c.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:opacity-80 font-mono uppercase tracking-wider cursor-pointer"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
