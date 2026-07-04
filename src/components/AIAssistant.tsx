/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Terminal, RefreshCw, User, HelpCircle } from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
}

interface AIAssistantProps {
  lang: "np" | "en";
}

export default function AIAssistant({ lang }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content:
        lang === "np"
          ? "नमस्ते! म हरेन्द्र लाम्सालको एआई सहायक हुँ। उहाँको सीप, परियोजना, र प्रमाणपत्रहरूको बारेमा कुनै पनि जानकारी लिन मलाई सोध्नुहोस्।"
          : "Hello! I am Harendra Lamsal's AI assistant. Ask me anything about his full-stack development experience, projects, or certifications.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggestion chips
  const suggestions = lang === "np" 
    ? [
        "आफ्नो प्राविधिक सीपहरूको बारेमा भन्नुहोस्",
        "तपाईंका मुख्य परियोजनाहरू के के हुन्?",
        "म कसरी सम्पर्क गर्न सक्छु?",
        "प्रमाणपत्रहरूको बारेमा भन्नुहोस्"
      ]
    : [
        "What are your core technical skills?",
        "Tell me about your featured projects",
        "How can I hire Harendra?",
        "Show me your certifications"
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Adjust greeting message when language changes if chat is empty or just has greeting
  useEffect(() => {
    if (messages.length === 1) {
      setMessages([
        {
          role: "model",
          content:
            lang === "np"
              ? "नमस्ते! म हरेन्द्र लाम्सालको एआई सहायक हुँ। उहाँको सीप, परियोजना, र प्रमाणपत्रहरूको बारेमा कुनै पनि जानकारी लिन मलाई सोध्नुहोस्।"
              : "Hello! I am Harendra Lamsal's AI assistant. Ask me anything about his full-stack development experience, projects, or certifications.",
        },
      ]);
    }
  }, [lang]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error(
          lang === "np"
            ? "सर्भर जडानमा समस्या भयो। कृपया आफ्नो सेक्रेट्समा GEMINI_API_KEY सेट गर्नुभएको निश्चित गर्नुहोस्।"
            : "Server request failed. Please ensure GEMINI_API_KEY is configured in Settings > Secrets."
        );
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "model", content: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred.");
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            lang === "np"
              ? "माफ गर्नुहोस्, मेरो सर्भरमा जडान गर्दा समस्या आइपर्‍यो। कृपया सुनिश्चित गर्नुहोस् कि सेक्रेट्स प्यानलमा GEMINI_API_KEY उपलब्ध छ।"
              : "Apologies, I encountered an issue connecting to the AI brain. Please ensure the GEMINI_API_KEY secret is defined.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="ai-assistant-toggle"
          className="flex items-center gap-2.5 bg-gradient-to-r from-brand-cyan to-brand-purple hover:opacity-90 text-black font-semibold px-4.5 py-3.5 rounded-full shadow-lg shadow-brand-cyan/20 cursor-pointer transition-all hover:scale-105 active:scale-95"
        >
          <Bot className="w-5 h-5 animate-pulse" />
          <span className="text-sm font-display tracking-wide uppercase">
            {lang === "np" ? "हरेन्द्र एआई" : "Harendra AI"}
          </span>
        </button>
      )}

      {/* Expanded Terminal Chatbox */}
      {isOpen && (
        <div
          id="ai-assistant-chatbox"
          className="w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-dark-card border border-brand-cyan/30 rounded-2xl flex flex-col shadow-2xl shadow-black overflow-hidden box-glow-cyan"
        >
          {/* Header */}
          <div className="bg-dark-surface px-4 py-3 border-b border-brand-cyan/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <Terminal className="w-4 h-4 text-brand-cyan" />
              <span className="font-mono text-xs text-brand-cyan uppercase tracking-wider">
                {lang === "np" ? "हरेन्द्र.एआई-कोर-भर्चुअल" : "harendra.ai-core-vm"}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Panel Description */}
          <div className="bg-brand-cyan/[0.03] px-4 py-2 border-b border-brand-cyan/10 flex items-center gap-2 text-[11px] text-gray-400">
            <Bot className="w-3.5 h-3.5 text-brand-cyan" />
            <span>
              {lang === "np"
                ? "हरेन्द्रको व्यावसायिक अवतारसँग सम्वाद गर्नुहोस्"
                : "Talk with Harendra's automated developer mind"}
            </span>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    m.role === "user"
                      ? "bg-brand-purple/20 border border-brand-purple/40 text-brand-purple"
                      : "bg-brand-cyan/10 border border-brand-cyan/40 text-brand-cyan"
                  }`}
                >
                  {m.role === "user" ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-xl border text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-brand-purple/10 border-brand-purple/30 text-white rounded-tr-none"
                      : "bg-dark-surface border-brand-cyan/10 text-gray-300 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-lg bg-brand-cyan/10 border border-brand-cyan/40 text-brand-cyan flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="bg-dark-surface border border-brand-cyan/10 text-gray-400 px-3.5 py-2 rounded-xl rounded-tl-none text-[13px] flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-cyan" />
                  <span className="font-mono text-xs">
                    {lang === "np" ? "प्रक्रिया चल्दैछ..." : "processing query..."}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-2.5 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-mono">
                [ERROR]: {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-dark-surface/50 border-t border-brand-cyan/10 space-y-1.5">
              <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-brand-cyan/60">
                <HelpCircle className="w-3 h-3" />
                <span>{lang === "np" ? "सुझावहरू" : "Quick Topics"}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(s)}
                    className="text-[11px] bg-dark-surface hover:bg-brand-cyan/10 text-gray-400 hover:text-brand-cyan border border-brand-cyan/10 hover:border-brand-cyan/40 px-2 py-1 rounded-md transition-all cursor-pointer text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-3 bg-dark-surface border-t border-brand-cyan/20 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                lang === "np"
                  ? "प्रश्न सोध्नुहोस्..."
                  : "Ask Harendra AI..."
              }
              className="flex-1 bg-dark-bg border border-brand-cyan/10 focus:border-brand-cyan/50 text-white rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-brand-cyan hover:opacity-90 disabled:opacity-40 text-black p-2 rounded-lg cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
