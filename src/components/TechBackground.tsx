/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";

export default function TechBackground() {
  const [binaryStrings, setBinaryStrings] = useState<{ id: number; text: string; x: number; y: number; delay: number; duration: number }[]>([]);
  const [codeLines, setCodeLines] = useState<{ id: number; text: string; x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate random falling binary code
    const binaryList = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      text: Math.random() > 0.5 ? "101101" : "010011",
      x: Math.random() * 95,
      y: Math.random() * 80,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 15,
    }));
    setBinaryStrings(binaryList);

    // Generate tech code symbols
    const snippets = [
      "const app = express();",
      "import { GoogleGenAI } from '@google/genai';",
      "const [state, setState] = useState(true);",
      "npm run build && node server.cjs",
      "SELECT * FROM postgresql_ledger;",
      "await ai.models.generateContent()",
      "const socket = new WebSocket();"
    ];

    const linesList = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      text: snippets[i % snippets.length],
      x: Math.random() * 80,
      y: Math.random() * 90,
      delay: Math.random() * 8,
    }));
    setCodeLines(linesList);
  }, []);

  return (
    <div className="fixed inset-0 -z-50 bg-dark-bg overflow-hidden pointer-events-none select-none">
      {/* Immersive Digital Dot Pattern Grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
      
      {/* Linear digital grid overlay */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>

      {/* Immersive Theme Radial Ambient Glow Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]"></div>

      {/* Floating Binary Rain elements */}
      {binaryStrings.map((b) => (
        <div
          key={b.id}
          className="absolute font-mono text-[10px] text-brand-cyan/20 select-none animate-pulse"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        >
          {b.text}
        </div>
      ))}

      {/* Floating programming source code fragments */}
      {codeLines.map((line) => (
        <div
          key={line.id}
          className="absolute font-mono text-[9px] text-brand-purple/15 select-none"
          style={{
            left: `${line.x}%`,
            top: `${line.y}%`,
            animationDelay: `${line.delay}s`,
            transition: "all 10s ease-in-out",
          }}
        >
          {line.text}
        </div>
      ))}

      {/* Digital tech pulse animation nodes */}
      <div className="absolute top-[15%] right-[25%] w-1.5 h-1.5 rounded-full bg-brand-cyan/40 box-glow-cyan animate-ping"></div>
      <div className="absolute bottom-[30%] left-[20%] w-1.5 h-1.5 rounded-full bg-brand-purple/40 box-glow-purple animate-ping" style={{ animationDelay: "2s" }}></div>
    </div>
  );
}
