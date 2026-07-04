/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Upload, Trash2, Edit2, Search, Filter, FileText, Image, Video, 
  Archive, FileCode, CheckCircle, ExternalLink, X, HelpCircle
} from "lucide-react";

interface MediaFile {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  url: string;
}

interface CMSMediaLibraryProps {
  mediaFiles: MediaFile[];
  onUpload: (payload: any) => Promise<void>;
  onRename: (id: string, newName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  lang: "np" | "en";
}

export default function CMSMediaLibrary({ mediaFiles, onUpload, onRename, onDelete, lang }: CMSMediaLibraryProps) {
  const [filterType, setFilterType] = useState<"all" | "image" | "video" | "document" | "archive">("all");
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");

  const [mockFileName, setMockFileName] = useState("");
  const [mockFileType, setMockFileType] = useState("image/png");
  const [mockFileSize, setMockFileSize] = useState("180 KB");

  const filtered = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === "all") return true;
    return file.type.includes(filterType);
  });

  const handleSimulatedUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockFileName.trim()) return;

    const extension = mockFileType.split("/")[1] || "png";
    const fullName = mockFileName.toLowerCase().endsWith(`.${extension}`)
      ? mockFileName
      : `${mockFileName}.${extension}`;

    const payload = {
      name: fullName,
      type: mockFileType,
      size: mockFileSize,
      url: mockFileType.startsWith("image") 
        ? "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop" 
        : "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screencast-43187-large.mp4"
    };

    await onUpload(payload);
    // Reset form
    setMockFileName("");
    setMockFileSize("180 KB");
  };

  const triggerRenameAction = async (id: string) => {
    if (!tempName.trim()) return;
    await onRename(id, tempName);
    setRenamingId(null);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image")) return <Image className="w-8 h-8 text-cyan-400" />;
    if (type.startsWith("video")) return <Video className="w-8 h-8 text-purple-400" />;
    if (type.startsWith("document") || type.includes("pdf")) return <FileText className="w-8 h-8 text-amber-400" />;
    if (type.includes("zip") || type.includes("archive")) return <Archive className="w-8 h-8 text-emerald-400" />;
    return <FileCode className="w-8 h-8 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* File type filter & search bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media assets..."
            className="w-full bg-[#0a0c10]/40 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400/30 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
          {(["all", "image", "video", "document", "archive"] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold capitalize transition-all cursor-pointer ${
                filterType === type 
                  ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30" 
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {type}s
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Media Grids list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.map(file => (
              <div 
                key={file.id} 
                className={`bg-[#0a0c10]/40 border rounded-xl p-3.5 space-y-3 cursor-pointer hover:border-cyan-400/30 transition-all text-xs font-mono relative flex flex-col justify-between ${
                  selectedFile?.id === file.id ? "border-cyan-400/40 bg-cyan-400/5" : "border-white/5"
                }`}
                onClick={() => setSelectedFile(file)}
              >
                {/* Visual Thumbnail or Icon */}
                <div className="h-28 w-full bg-black/40 border border-white/5 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {file.type.startsWith("image") ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    getFileIcon(file.type)
                  )}
                  <span className="absolute bottom-1 right-1 text-[8px] bg-black/70 px-1.5 py-0.5 rounded text-gray-400">
                    {file.size}
                  </span>
                </div>

                {/* Info & action bar */}
                <div className="space-y-1">
                  {renamingId === file.id ? (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="w-full bg-black border border-white/20 text-[10px] px-1 py-0.5 text-white"
                        onKeyDown={e => e.key === "Enter" && triggerRenameAction(file.id)}
                      />
                      <button 
                        onClick={() => triggerRenameAction(file.id)}
                        className="text-cyan-400 text-[10px] uppercase font-bold"
                      >
                        [Ok]
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-white truncate max-w-[80%]" title={file.name}>
                        {file.name}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingId(file.id);
                          setTempName(file.name);
                        }}
                        className="text-gray-500 hover:text-cyan-400"
                        title="Rename file"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="text-[9px] text-gray-500 flex justify-between items-center">
                    <span>{file.date}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Confirm delete ${file.name}?`)) {
                          onDelete(file.id);
                          if (selectedFile?.id === file.id) setSelectedFile(null);
                        }
                      }}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload simulator & side preview drawer */}
        <div className="space-y-6">
          {/* Upload simulation card */}
          <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4">
            <h4 className="text-xs uppercase text-white font-mono font-bold flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Simulated Ingestion Portal</span>
            </h4>
            <form onSubmit={handleSimulatedUpload} className="space-y-3.5 text-xs font-mono text-gray-400">
              <div className="space-y-1">
                <label className="text-[9px] uppercase block">Asset File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. system_audit_report"
                  value={mockFileName}
                  onChange={(e) => setMockFileName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase block">Asset Type</label>
                  <select
                    value={mockFileType}
                    onChange={(e) => setMockFileType(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-2.5 py-2"
                  >
                    <option value="image/png">PNG Image</option>
                    <option value="video/mp4">MP4 Video</option>
                    <option value="document/pdf">PDF Document</option>
                    <option value="archive/zip">ZIP Archive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase block">File Size</label>
                  <input
                    type="text"
                    required
                    value={mockFileSize}
                    onChange={(e) => setMockFileSize(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-2.5 py-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-400 hover:bg-cyan-500 text-black py-2.5 rounded font-bold uppercase"
              >
                Ingest Mock Asset
              </button>
            </form>
          </div>

          {/* Side preview details */}
          {selectedFile && (
            <div className="bg-[#0a0c10]/60 border border-cyan-500/20 rounded-xl p-5 space-y-4 text-xs font-mono relative">
              <button 
                onClick={() => setSelectedFile(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="text-xs uppercase text-cyan-400 font-bold border-b border-white/5 pb-2">
                File Details Preview
              </h4>
              <div className="h-44 w-full bg-black/50 border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                {selectedFile.type.startsWith("image") ? (
                  <img src={selectedFile.url} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  getFileIcon(selectedFile.type)
                )}
              </div>
              <div className="space-y-2 text-[11px]">
                <div><span className="text-gray-500">File Name:</span> <span className="text-white">{selectedFile.name}</span></div>
                <div><span className="text-gray-500">Mime Type:</span> <span className="text-purple-400">{selectedFile.type}</span></div>
                <div><span className="text-gray-500">File Size:</span> <span className="text-cyan-400">{selectedFile.size}</span></div>
                <div><span className="text-gray-500">Upload Date:</span> <span className="text-amber-400">{selectedFile.date}</span></div>
                <div><span className="text-gray-500">Resolved Path:</span> <span className="text-gray-400 text-[10px] break-all">{selectedFile.id}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
