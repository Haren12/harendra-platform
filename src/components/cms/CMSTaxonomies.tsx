/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Trash2, Edit, Tag, Layers, RefreshCw, Sparkles, Sliders } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  desc?: string;
}

interface TagType {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface CMSTaxonomiesProps {
  categories: Category[];
  tags: TagType[];
  onAddCategory: (cat: any) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onAddTag: (tag: any) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
  onMergeTags: (sourceId: string, targetId: string) => Promise<void>;
  lang: "np" | "en";
}

export default function CMSTaxonomies({
  categories, tags, onAddCategory, onDeleteCategory, onAddTag, onDeleteTag, onMergeTags, lang
}: CMSTaxonomiesProps) {
  const [activeTab, setActiveTab] = useState<"categories" | "tags">("categories");

  // Category Inputs
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catParent, setCatParent] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // Tag Inputs
  const [tagName, setTagName] = useState("");
  const [tagSlug, setTagSlug] = useState("");

  // Tag Merging Inputs
  const [sourceTagId, setSourceTagId] = useState("");
  const [targetTagId, setTargetTagId] = useState("");
  const [merging, setMerging] = useState(false);

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catSlug.trim()) return;

    await onAddCategory({
      name: catName,
      slug: catSlug,
      parentId: catParent || undefined,
      desc: catDesc || undefined
    });

    // Reset Form
    setCatName("");
    setCatSlug("");
    setCatParent("");
    setCatDesc("");
  };

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim() || !tagSlug.trim()) return;

    await onAddTag({
      name: tagName,
      slug: tagSlug
    });

    setTagName("");
    setTagSlug("");
  };

  const executeTagMerge = async () => {
    if (!sourceTagId || !targetTagId) return;
    if (sourceTagId === targetTagId) {
      alert("Cannot merge a tag into itself!");
      return;
    }
    if (!window.confirm("Confirm tag merge? This will re-index all database records referencing the source tag to the target tag and sum counts.")) return;

    setMerging(true);
    try {
      await onMergeTags(sourceTagId, targetTagId);
      setSourceTagId("");
      setTargetTagId("");
    } catch (err) {
      console.error(err);
    } finally {
      setMerging(false);
    }
  };

  // Helper nested display
  const getParentName = (parentId?: string) => {
    if (!parentId) return null;
    const found = categories.find(c => c.id === parentId);
    return found ? found.name : null;
  };

  return (
    <div className="space-y-6">
      {/* Tab Select Header */}
      <div className="flex border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 text-xs font-mono font-bold capitalize cursor-pointer transition-all ${
            activeTab === "categories" 
              ? "text-cyan-400 border-b-2 border-cyan-400" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          Nested Category Slots
        </button>
        <button
          onClick={() => setActiveTab("tags")}
          className={`px-4 py-2 text-xs font-mono font-bold capitalize cursor-pointer transition-all ${
            activeTab === "tags" 
              ? "text-cyan-400 border-b-2 border-cyan-400" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          Central Tags Registry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: CRU Forms */}
        <div className="space-y-6">
          {activeTab === "categories" ? (
            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4 text-xs font-mono">
              <h4 className="text-xs uppercase text-white font-bold flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Create New Category</span>
              </h4>
              <form onSubmit={handleCatSubmit} className="space-y-3.5 text-gray-400">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase">Category Name</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => {
                      setCatName(e.target.value);
                      setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                    }}
                    placeholder="e.g. Distributed Compute Architecture"
                    className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase">Category Slug URL Identifier</label>
                  <input
                    type="text"
                    required
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase">Parent Category (For Nesting)</label>
                  <select
                    value={catParent}
                    onChange={(e) => setCatParent(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded px-2.5 py-2 focus:outline-none"
                  >
                    <option value="">[ None - Root Category ]</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase">SEO Meta Description</label>
                  <textarea
                    rows={3}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Provide a concise description for web bots..."
                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-cyan-400 hover:bg-cyan-500 text-black py-2.5 rounded font-bold uppercase"
                >
                  Register Category
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add Tag */}
              <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4 text-xs font-mono">
                <h4 className="text-xs uppercase text-white font-bold flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  <span>Register Custom Tag</span>
                </h4>
                <form onSubmit={handleTagSubmit} className="space-y-3.5 text-gray-400">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase">Tag Label Name</label>
                    <input
                      type="text"
                      required
                      value={tagName}
                      onChange={(e) => {
                        setTagName(e.target.value);
                        setTagSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                      }}
                      placeholder="e.g. NextJS-15"
                      className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase">Tag Slug</label>
                    <input
                      type="text"
                      required
                      value={tagSlug}
                      onChange={(e) => setTagSlug(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-cyan-400 hover:bg-cyan-500 text-black py-2.5 rounded font-bold uppercase"
                  >
                    Add Tag
                  </button>
                </form>
              </div>

              {/* Tag Merger Tool */}
              <div className="bg-[#0a0c10]/40 border border-purple-500/10 rounded-xl p-5 space-y-4 text-xs font-mono">
                <h4 className="text-xs uppercase text-purple-400 font-bold flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Sliders className="w-4 h-4" />
                  <span>Interactive Tag Merger</span>
                </h4>
                <div className="space-y-3.5 text-gray-400">
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Merge synonyms or redundant tags. This compiles and migrates all post metadata indexing references on the server.
                  </p>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase">Source Synonym Tag</label>
                    <select
                      value={sourceTagId}
                      onChange={(e) => setSourceTagId(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white rounded px-2.5 py-2"
                    >
                      <option value="">[ Select Synonym Tag ]</option>
                      {tags.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.count} items)</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase">Destination Master Tag</label>
                    <select
                      value={targetTagId}
                      onChange={(e) => setTargetTagId(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white rounded px-2.5 py-2"
                    >
                      <option value="">[ Select Destination Target Tag ]</option>
                      {tags.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.count} items)</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={executeTagMerge}
                    disabled={merging || !sourceTagId || !targetTagId}
                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white py-2.5 rounded font-bold uppercase transition-all"
                  >
                    {merging ? "Synthesizing Merges..." : "Execute Tag Merge"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Lists */}
        <div className="lg:col-span-2">
          {activeTab === "categories" ? (
            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4">
              <h4 className="text-xs uppercase text-gray-400 font-mono font-bold">
                Registered Nested Categories Tree
              </h4>
              <div className="divide-y divide-white/5 font-mono text-xs">
                {categories.map(c => {
                  const parentName = getParentName(c.parentId);
                  return (
                    <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{c.name}</span>
                          {parentName && (
                            <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400">
                              child of: {parentName}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Slug: /{c.slug} {c.desc && `• SEO: "${c.desc.substring(0, 40)}..."`}
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteCategory(c.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4">
              <h4 className="text-xs uppercase text-gray-400 font-mono font-bold">
                Active Tags Dictionary Reference
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tags.map(t => (
                  <div key={t.id} className="bg-black/20 p-3 rounded-lg border border-white/5 flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>#{t.name}</span>
                        <span className="text-[9px] bg-cyan-400/10 text-cyan-400 px-1.5 rounded-full font-bold">
                          {t.count} posts
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500">
                        ID: {t.id} • /{t.slug}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteTag(t.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Delete tag"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
