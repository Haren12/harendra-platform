/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Database, ShieldCheck, MessageSquare, Terminal, Download, 
  Trash2, Check, X, AlertTriangle, Play, HelpCircle, UserCheck, CheckSquare, Square
} from "lucide-react";

interface Comment {
  id: string;
  tutorialId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  date: string;
  approved: boolean;
  spam: boolean;
  pinned?: boolean;
  reply?: string;
}

interface Backup {
  id: string;
  date: string;
  size: string;
  elements: number;
}

interface UserAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: {
    write: boolean;
    delete: boolean;
    users: boolean;
    settings: boolean;
    backups: boolean;
  };
}

interface CMSBackupsLogsProps {
  comments: Comment[];
  onModerateComment: (id: string, action: "approve" | "reject" | "pin" | "reply" | "delete", payload?: any) => Promise<void>;
  users: UserAdmin[];
  onUpdateUserRole: (id: string, role: string, permissions: any) => Promise<void>;
  backups: Backup[];
  onGenerateBackup: () => Promise<void>;
  onRestoreBackup: (id: string) => Promise<void>;
  logs: any[];
  lang: "np" | "en";
}

export default function CMSBackupsLogs({
  comments, onModerateComment, users, onUpdateUserRole, backups, onGenerateBackup, onRestoreBackup, logs, lang
}: CMSBackupsLogsProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "users" | "backups">("comments");

  // Moderation state
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});
  const [activeCommentIdForReply, setActiveCommentIdForReply] = useState<string | null>(null);

  // User permission editing states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(users[0]?.id || null);

  const handleReplySubmit = async (commentId: string) => {
    const text = replyText[commentId];
    if (!text?.trim()) return;

    await onModerateComment(commentId, "reply", { reply: text });
    setReplyText(prev => ({ ...prev, [commentId]: "" }));
    setActiveCommentIdForReply(null);
    alert("Administrator reply posted successfully!");
  };

  const toggleUserPermission = async (userId: string, permKey: "write" | "delete" | "users" | "settings" | "backups") => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const updatedPermissions = {
      ...user.permissions,
      [permKey]: !user.permissions[permKey]
    };

    await onUpdateUserRole(userId, user.role, updatedPermissions);
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    await onUpdateUserRole(userId, newRole, user.permissions);
    alert(`Access privileges updated for ${user.name} (${newRole})`);
  };

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  return (
    <div className="space-y-6">
      {/* Subtab Select Header */}
      <div className="flex border-b border-white/5 pb-2 overflow-x-auto gap-1">
        {(["comments", "users", "backups"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-mono font-bold capitalize cursor-pointer transition-all ${
              activeTab === tab 
                ? "text-cyan-400 border-b-2 border-cyan-400" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab === "comments" && "User Comment Moderation"}
            {tab === "users" && "Access Privileges Matrix"}
            {tab === "backups" && "Diagnostic Backup & Logs"}
          </button>
        ))}
      </div>

      {activeTab === "comments" && (
        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4">
          <h4 className="text-xs uppercase text-gray-400 font-mono font-bold">
            Moderate User Submissions ({comments.length} comments)
          </h4>

          <div className="space-y-4 divide-y divide-white/5 font-mono text-xs">
            {comments.map((comment, index) => (
              <div key={comment.id} className={`${index > 0 ? "pt-4" : ""} space-y-3`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{comment.authorName}</span>
                      <span className="text-gray-500 font-normal">({comment.authorEmail})</span>
                      {comment.pinned && (
                        <span className="text-[8px] bg-cyan-400/10 text-cyan-400 px-1.5 py-0.5 rounded-full font-bold">
                          PINNED
                        </span>
                      )}
                      {comment.spam && (
                        <span className="text-[8px] bg-red-400/10 text-red-400 px-1.5 py-0.5 rounded-full font-bold">
                          SPAM
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Posted on: {comment.date} • Reference ID: {comment.tutorialId}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!comment.approved && (
                      <button
                        onClick={() => onModerateComment(comment.id, "approve")}
                        className="bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 px-2 py-1 rounded text-[10px] font-bold"
                      >
                        Approve
                      </button>
                    )}
                    {comment.approved && (
                      <span className="text-emerald-400 text-[10px] font-bold bg-emerald-400/5 px-2 py-1 rounded">
                        ✓ Approved
                      </span>
                    )}
                    <button
                      onClick={() => onModerateComment(comment.id, "pin")}
                      className="text-gray-400 hover:text-cyan-400 px-2 py-1 rounded text-[10px]"
                    >
                      {comment.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      onClick={() => onModerateComment(comment.id, "delete")}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-300 bg-black/10 p-3 rounded-lg border border-white/5 font-sans">
                  {comment.content}
                </p>

                {/* Reply display */}
                {comment.reply && (
                  <div className="ml-6 p-2.5 bg-purple-500/5 border-l-2 border-purple-500 rounded text-purple-300">
                    <span className="font-bold block text-[10px] mb-1">ADMINISTRATOR REPLY:</span>
                    <p className="font-sans">{comment.reply}</p>
                  </div>
                )}

                {/* Reply composer trigger */}
                <div className="flex gap-2">
                  {activeCommentIdForReply === comment.id ? (
                    <div className="w-full flex gap-2">
                      <input
                        type="text"
                        placeholder="Type administrator response..."
                        value={replyText[comment.id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                        className="flex-1 bg-black/40 border border-white/10 rounded px-2.5 py-1 text-white"
                      />
                      <button 
                        onClick={() => handleReplySubmit(comment.id)}
                        className="bg-purple-500 text-white px-3 py-1 rounded text-[10px] font-bold"
                      >
                        Submit
                      </button>
                      <button 
                        onClick={() => setActiveCommentIdForReply(null)}
                        className="text-gray-500 text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveCommentIdForReply(comment.id)}
                      className="text-[10px] text-purple-400 hover:underline"
                    >
                      [Post Administrator Reply]
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs text-gray-400">
          {/* List Users */}
          <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4">
            <h4 className="text-xs uppercase text-white font-bold flex items-center gap-1.5 border-b border-white/5 pb-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Admin Personnel</span>
            </h4>
            <div className="space-y-2">
              {users.map(u => (
                <div
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all ${
                    selectedUser?.id === u.id 
                      ? "border-cyan-400/40 bg-cyan-400/5 text-white" 
                      : "border-white/5 hover:border-white/15 text-gray-400"
                  }`}
                >
                  <div className="font-bold">{u.name}</div>
                  <div className="text-[9px] text-gray-500">{u.email}</div>
                  <div className="text-[10px] text-cyan-400 font-bold uppercase mt-1">Role: {u.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* User Privileges and Matrix settings */}
          {selectedUser && (
            <div className="md:col-span-2 bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-5">
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-xs uppercase text-white font-bold">
                  Access Controls: {selectedUser.name}
                </h4>
                <p className="text-[10px] text-gray-500 mt-1">
                  Adjust permissions dynamically. Super Administrators have total operational privileges.
                </p>
              </div>

              {/* Modify Role */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase block">Assign Administrative Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => changeUserRole(selectedUser.id, e.target.value)}
                  className="bg-black/40 border border-white/10 text-white rounded px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Journalist">Journalist</option>
                  <option value="Moderator">Moderator</option>
                </select>
              </div>

              {/* Permission Checkboxes */}
              <div className="space-y-3 pt-3 border-t border-white/5">
                <label className="text-[10px] uppercase block mb-2">Scope Permissions Matrix</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(["write", "delete", "users", "settings", "backups"] as const).map(key => {
                    const active = selectedUser.permissions[key];
                    return (
                      <div
                        key={key}
                        onClick={() => toggleUserPermission(selectedUser.id, key)}
                        className="p-2.5 bg-black/20 border border-white/5 rounded-lg flex items-center justify-between cursor-pointer hover:border-cyan-400/20"
                      >
                        <span className="capitalize">{key} Privileges</span>
                        {active ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "backups" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs text-gray-400">
          {/* SQL Backups Rollbacks */}
          <div className="lg:col-span-2 bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h4 className="text-xs uppercase text-white font-bold flex items-center gap-1.5">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Virtual Snapshot Backups ({backups.length})</span>
              </h4>
              <button
                onClick={onGenerateBackup}
                className="bg-cyan-400 hover:bg-cyan-500 text-black px-3 py-1.5 rounded font-bold uppercase text-[9px]"
              >
                Create Backup
              </button>
            </div>

            <div className="space-y-2.5">
              {backups.map(backup => (
                <div key={backup.id} className="p-3.5 bg-black/20 border border-white/5 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-bold text-white text-xs">{backup.id}</div>
                    <div className="text-[10px] text-gray-500">
                      Generated: {backup.date} • Snap Size: {backup.size} • Ingested items: {backup.elements}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`Warning: Restoring backup ${backup.id} will rollback all in-memory database arrays. Confirm?`)) {
                        onRestoreBackup(backup.id);
                      }
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded font-bold text-[10px] uppercase"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sitemaps XML, Robots previews */}
          <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4">
            <h4 className="text-xs uppercase text-white font-bold flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Sitemaps & SEO Index Previews</span>
            </h4>
            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] uppercase text-gray-500 block mb-1">robots.txt</span>
                <pre className="bg-black/50 p-2.5 rounded border border-white/5 text-[9px] text-gray-400 leading-relaxed overflow-x-auto">
                  User-agent: *{"\n"}
                  Allow: /{"\n"}
                  Disallow: /cms/{"\n"}
                  Sitemap: https://harendralamsal.name.np/sitemap.xml
                </pre>
              </div>

              <div>
                <span className="text-[10px] uppercase text-gray-500 block mb-1">sitemap.xml Preview</span>
                <pre className="bg-black/50 p-2.5 rounded border border-white/5 text-[9px] text-gray-400 leading-relaxed overflow-x-auto">
                  &lt;urlset xmlns="http://www.sitemaps.org"&gt;{"\n"}
                  &nbsp;&lt;url&gt;{"\n"}
                  &nbsp;&nbsp;&lt;loc&gt;https://harendralamsal.name.np/&lt;/loc&gt;{"\n"}
                  &nbsp;&nbsp;&lt;priority&gt;1.0&lt;/priority&gt;{"\n"}
                  &nbsp;&lt;/url&gt;{"\n"}
                  &lt;/urlset&gt;
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
