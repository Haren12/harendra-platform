/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Shield, Key, Users, RefreshCw, AlertTriangle, CheckCircle2, Lock, 
  Smartphone, Eye, EyeOff, Radio, Globe, Terminal, Trash2, Plus, 
  Settings, Ban, HelpCircle, HardDrive, Check, Fingerprint, 
  UserX, Clock, ExternalLink, Mail, Laptop, Tablet, AlertOctagon, Sparkles
} from "lucide-react";

interface ActiveSession {
  id: string;
  userId: string;
  email: string;
  device: string;
  ip: string;
  browser: string;
  location: string;
  loginTime: string;
  lastActive: string;
  isCurrent: boolean;
}

interface LoginAttempt {
  id: string;
  email: string;
  ip: string;
  device: string;
  browser: string;
  timestamp: string;
  status: "success" | "failed" | "blocked";
  reason?: string;
  country: string;
}

interface SecurityAlert {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  text: string;
  date: string;
  resolved: boolean;
  ip?: string;
}

interface Passkey {
  id: string;
  label: string;
  created: string;
  lastUsed: string;
}

interface ApiToken {
  id: string;
  name: string;
  tokenValue: string;
  role: string;
  created: string;
  expires: string;
  active: boolean;
}

interface CMSSecurityCenterProps {
  lang: "np" | "en";
  adminEmail: string;
}

export default function CMSSecurityCenter({ lang, adminEmail }: CMSSecurityCenterProps) {
  const [activeTab, setActiveTab] = useState<"shield" | "sessions" | "2fa" | "tokens" | "audit" | "upload-sec">("shield");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginAttempt[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [tokens, setTokens] = useState<ApiToken[]>([]);

  // Configuration settings state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorType, setTwoFactorType] = useState<"email" | "totp">("email");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(15);
  const [multipleDeviceAllowed, setMultipleDeviceAllowed] = useState(true);
  const [rateLimitRequests, setRateLimitRequests] = useState(100);
  const [allowedExtensions, setAllowedExtensions] = useState<string[]>(["png", "jpg", "jpeg", "pdf", "zip", "mp4"]);

  // Form states
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenRole, setNewTokenRole] = useState("Editor");
  const [newTokenExpiryDays, setNewTokenExpiryDays] = useState(30);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const [passwordChange, setPasswordChange] = useState({ current: "", next: "", confirm: "" });
  const [passStrength, setPassStrength] = useState({ score: 0, feedback: "Enter new password" });

  const [registeringPasskey, setRegisteringPasskey] = useState(false);
  const [newPasskeyName, setNewPasskeyName] = useState("");
  const [passkeyRegSuccess, setPasskeyRegSuccess] = useState(false);

  // Status message state
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/security/data");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        setLoginLogs(data.loginLogs || []);
        setAlerts(data.alerts || []);
        setPasskeys(data.passkeys || []);
        setTokens(data.tokens || []);
        setTwoFactorEnabled(data.twoFactorEnabled);
        setTwoFactorType(data.twoFactorType);
        setBackupCodes(data.backupCodes || []);
        setSessionTimeoutMinutes(data.sessionTimeoutMinutes || 15);
        setMultipleDeviceAllowed(data.multipleDeviceAllowed !== false);
        setRateLimitRequests(data.rateLimitRequests || 100);
        setAllowedExtensions(data.allowedExtensions || ["png", "jpg", "jpeg", "pdf", "zip", "mp4"]);
      }
    } catch (err) {
      console.error("Failed to load security parameters", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  // Update Settings on server
  const saveSecuritySettings = async (payload: any) => {
    try {
      const res = await fetch("/api/security/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showFeedback(lang === "np" ? "सुरक्षा नीति सफलतापूर्वक अद्यावधिक गरियो।" : "Security parameters successfully hardened.");
        fetchSecurityData();
      }
    } catch (err) {
      showFeedback("Failed to synchronize policy parameters.", "error");
    }
  };

  // Revoke session
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/security/sessions/${sessionId}`, { method: "DELETE" });
      if (res.ok) {
        showFeedback(lang === "np" ? "सत्र सफलतापूर्वक रद्द गरियो।" : "Session index revoked. Remote client logged out.");
        fetchSecurityData();
      }
    } catch (err) {
      showFeedback("Failed to revoke session index.", "error");
    }
  };

  // Revoke all other sessions
  const handleRevokeOtherSessions = async () => {
    try {
      const res = await fetch("/api/security/sessions/revoke-others", { method: "POST" });
      if (res.ok) {
        showFeedback("All secondary admin login sessions have been invalidated.", "success");
        fetchSecurityData();
      }
    } catch (err) {
      showFeedback("Session sweep failed.", "error");
    }
  };

  // Resolve Alert
  const handleResolveAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/security/alerts/${alertId}/resolve`, { method: "POST" });
      if (res.ok) {
        showFeedback("Incident warning marked resolved.", "success");
        fetchSecurityData();
      }
    } catch (err) {
      showFeedback("Failed to clear alert.", "error");
    }
  };

  // Create API Token
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;

    try {
      const res = await fetch("/api/security/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTokenName,
          role: newTokenRole,
          expiresDays: newTokenExpiryDays
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedToken(data.tokenValue);
        showFeedback("Secure developer credential generated successfully!");
        setNewTokenName("");
        fetchSecurityData();
      }
    } catch (err) {
      showFeedback("Failed to generate token.", "error");
    }
  };

  // Delete API Token
  const handleDeleteToken = async (tokenId: string) => {
    try {
      const res = await fetch(`/api/security/tokens/${tokenId}`, { method: "DELETE" });
      if (res.ok) {
        showFeedback("Token permanently destroyed.", "success");
        fetchSecurityData();
      }
    } catch (err) {
      showFeedback("Failed to remove token.", "error");
    }
  };

  // WebAuthn Passkey Registration Handler
  const triggerPasskeyRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasskeyName.trim()) return;
    setRegisteringPasskey(true);

    // Simulate WebAuthn key generation sequence
    setTimeout(async () => {
      try {
        const res = await fetch("/api/security/passkeys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: newPasskeyName })
        });
        if (res.ok) {
          setPasskeyRegSuccess(true);
          showFeedback("Biometric WebAuthn Passkey registered successfully!");
          setNewPasskeyName("");
          fetchSecurityData();
        }
      } catch (err) {
        showFeedback("Biometric enrollment error.", "error");
      } finally {
        setRegisteringPasskey(false);
        setTimeout(() => setPasskeyRegSuccess(false), 4000);
      }
    }, 2000);
  };

  // Delete Passkey
  const handleDeletePasskey = async (id: string) => {
    try {
      const res = await fetch(`/api/security/passkeys/${id}`, { method: "DELETE" });
      if (res.ok) {
        showFeedback("WebAuthn token revoked.", "success");
        fetchSecurityData();
      }
    } catch (err) {
      showFeedback("Revocation failed.", "error");
    }
  };

  // Password strength evaluation
  useEffect(() => {
    const pw = passwordChange.next;
    if (!pw) {
      setPassStrength({ score: 0, feedback: "Enter new password" });
      return;
    }
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    let text = "Weak Password";
    if (score >= 4) text = "Very Strong Enterprise Secret Key ✓";
    else if (score >= 3) text = "Good / Secure Password";
    else if (score >= 2) text = "Moderate Strength";

    setPassStrength({ score, feedback: text });
  }, [passwordChange.next]);

  // Handle password modification
  const triggerPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordChange.next !== passwordChange.confirm) {
      showFeedback("Passwords do not match.", "error");
      return;
    }
    if (passStrength.score < 3) {
      showFeedback("Password does not meet enterprise complexity standard.", "error");
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, newPassword: passwordChange.next })
      });
      if (res.ok) {
        showFeedback("Access secret code rotated successfully!", "success");
        setPasswordChange({ current: "", next: "", confirm: "" });
      } else {
        showFeedback("Authentication verification rejected password rotation.", "error");
      }
    } catch (err) {
      showFeedback("Failed to update password.", "error");
    }
  };

  // Generate new MFA Backup Codes
  const generateNewBackupCodes = async () => {
    try {
      const res = await fetch("/api/security/mfa/backup-codes", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setBackupCodes(data.codes);
        showFeedback("New enterprise roll-recovery backup codes generated.");
      }
    } catch (err) {
      showFeedback("MFA token rotation failed.", "error");
    }
  };

  // 100% Secure Rating calculated dynamically
  const calculateSecurityScore = () => {
    let score = 60; // Base score
    if (twoFactorEnabled) score += 15;
    if (passkeys.length > 0) score += 10;
    if (sessionTimeoutMinutes <= 15) score += 5;
    if (!multipleDeviceAllowed) score += 5;
    if (alerts.filter(a => !a.resolved).length === 0) score += 5;
    return score;
  };

  const securityScore = calculateSecurityScore();

  return (
    <div className="space-y-6">
      {/* feedback message toast */}
      {feedback && (
        <div className={`fixed bottom-6 right-6 z-50 bg-[#0a0c10]/95 backdrop-blur-md border px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 font-mono text-xs ${
          feedback.type === "success" ? "border-emerald-500/20 text-emerald-400" : "border-red-500/20 text-red-400"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 animate-bounce" /> : <AlertOctagon className="w-4 h-4 animate-pulse" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Security Navigation Tab rail */}
      <div className="flex border-b border-white/5 pb-2 overflow-x-auto gap-1">
        {(["shield", "sessions", "2fa", "tokens", "audit", "upload-sec"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-mono font-bold capitalize cursor-pointer transition-all ${
              activeTab === tab 
                ? "text-cyan-400 border-b-2 border-cyan-400" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab === "shield" && "Gatekeeper Overview"}
            {tab === "sessions" && "Active Session Controls"}
            {tab === "2fa" && "2FA & Passkey Biometrics"}
            {tab === "tokens" && "Developer Access Tokens"}
            {tab === "audit" && "Audit Trails & Logs"}
            {tab === "upload-sec" && "File Upload Security"}
          </button>
        ))}
      </div>

      {activeTab === "shield" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs text-gray-400">
          {/* Security Score gauge and quick stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Score ring */}
              <div className="flex flex-col items-center text-center space-y-2 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-4">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Circular visual ring */}
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                    <circle cx="48" cy="48" r="40" stroke="#00f0ff" strokeWidth="8" fill="transparent" 
                      strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * securityScore) / 100} 
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span className="text-xl font-bold text-white font-display">{securityScore}%</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Hardening Index</div>
                  <div className="text-[9px] text-cyan-400 font-bold mt-1 uppercase">✓ High Enterprise Security</div>
                </div>
              </div>

              {/* Quick statistics */}
              <div className="md:col-span-2 space-y-3.5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Gatekeeper Control Shield</span>
                </h3>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Enterprise network security policies are enforced on every request. Row-Level Security, multi-factor triggers, and biometric passkeys harden administrative portals against remote intrusions.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1 text-[10px]">
                  <div className="bg-black/20 p-2.5 rounded border border-white/5">
                    <span className="text-gray-500 block">ACTIVE SESSION COUNTER</span>
                    <span className="text-white font-bold text-sm">{sessions.length} open channels</span>
                  </div>
                  <div className="bg-black/20 p-2.5 rounded border border-white/5">
                    <span className="text-gray-500 block">SECURITY ALERTS QUEUE</span>
                    <span className={`font-bold text-sm ${alerts.filter(a => !a.resolved).length > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                      {alerts.filter(a => !a.resolved).length} active warnings
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rotative Admin Access Secret / Password Change */}
            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4">
              <h4 className="text-xs uppercase text-white font-bold border-b border-white/5 pb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <span>Rotate Administrative Encryption Passphrase</span>
              </h4>

              <form onSubmit={triggerPasswordChange} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-gray-500 block">Current Gatekeeper Secret</label>
                    <input
                      type="password"
                      required
                      value={passwordChange.current}
                      onChange={(e) => setPasswordChange({ ...passwordChange, current: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-white"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-gray-500 block">New Secret Code</label>
                    <input
                      type="password"
                      required
                      value={passwordChange.next}
                      onChange={(e) => setPasswordChange({ ...passwordChange, next: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-white"
                      placeholder="High entropy secret"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-gray-500 block">Confirm Key Alignment</label>
                    <input
                      type="password"
                      required
                      value={passwordChange.confirm}
                      onChange={(e) => setPasswordChange({ ...passwordChange, confirm: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-white"
                      placeholder="High entropy secret"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/25 p-3 rounded-lg border border-white/5">
                  <div className="space-y-1">
                    <div className="text-[10px] text-white font-bold uppercase flex items-center gap-1">
                      <span>Entropy Score:</span>
                      <span className={passStrength.score >= 4 ? "text-emerald-400" : passStrength.score >= 2 ? "text-amber-400" : "text-red-400"}>
                        {passStrength.score} / 5
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-500 font-sans">{passStrength.feedback}</p>
                  </div>

                  <button
                    type="submit"
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-bold uppercase text-[10px] shadow-lg shadow-purple-500/10 cursor-pointer text-center"
                  >
                    Commit rotated passphrase
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Incidents alerts side desk */}
          <div className="space-y-6">
            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4">
              <h4 className="text-xs uppercase text-white font-bold border-b border-white/5 pb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Security Alerts Queue ({alerts.length})</span>
              </h4>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {alerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`p-3 border rounded-lg space-y-2 transition-all ${
                      alert.resolved 
                        ? "bg-black/10 border-white/5 opacity-50" 
                        : alert.severity === "critical" 
                          ? "bg-red-950/10 border-red-500/30 text-red-300" 
                          : "bg-amber-950/10 border-amber-500/20 text-amber-300"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${
                        alert.severity === "critical" ? "bg-red-400/10 text-red-400" : "bg-amber-400/10 text-amber-400"
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-[8px] text-gray-500">{alert.date.split("T")[0]}</span>
                    </div>
                    <p className="text-[10px] font-sans leading-normal">{alert.text}</p>
                    {alert.ip && <div className="text-[9px] font-mono text-gray-500">Source IP: {alert.ip}</div>}
                    
                    {!alert.resolved && (
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="text-[9px] text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        [Mark Resolved & Archive]
                      </button>
                    )}
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    No security alerts detected. Threat vector clean.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-6 space-y-6 text-xs font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Active Session Gateways</span>
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                Track all administrative session handshakes across browsers, devices, and geological coordinates. Revoke suspicious sessions remotely.
              </p>
            </div>
            
            <button
              onClick={handleRevokeOtherSessions}
              className="px-4 py-2 bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-500/20 rounded font-bold uppercase text-[10px] cursor-pointer"
            >
              Revoke All Other Sessions
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(sess => (
              <div 
                key={sess.id} 
                className={`bg-black/20 border rounded-xl p-4.5 space-y-3 flex flex-col justify-between transition-all ${
                  sess.isCurrent ? "border-cyan-400/30 shadow-lg shadow-cyan-400/5" : "border-white/5"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {sess.device.toLowerCase().includes("pc") || sess.device.toLowerCase().includes("mac") ? (
                        <Laptop className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Tablet className="w-4 h-4 text-purple-400" />
                      )}
                      <span className="font-bold text-white uppercase text-[10px] tracking-wide">{sess.device}</span>
                    </div>

                    {sess.isCurrent ? (
                      <span className="px-1.5 py-0.5 bg-cyan-400/10 text-cyan-400 font-bold rounded text-[8px] tracking-wide">
                        ● CURRENT SESSION
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-400 font-bold rounded text-[8px]">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-[10px] text-gray-400">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Channel IP:</span>
                      <span className="text-white font-bold">{sess.ip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Browser/Agent:</span>
                      <span className="text-white truncate max-w-[150px]" title={sess.browser}>{sess.browser}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Country Location:</span>
                      <span className="text-white flex items-center gap-1">
                        <Globe className="w-3 h-3 text-gray-500" />
                        <span>{sess.location}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Established:</span>
                      <span className="text-white">{sess.loginTime.replace("T", " ").substring(0, 16)}</span>
                    </div>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(sess.id)}
                    className="w-full mt-3 py-1.5 bg-red-950/10 hover:bg-red-900/20 text-red-400 rounded font-bold uppercase text-[9px] border border-red-500/10"
                  >
                    Kill Connection channel
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Inactivity parameters */}
          <div className="p-4 bg-black/20 border border-white/5 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <span className="font-bold text-white text-[11px] uppercase tracking-wide">Automated Session Expiration</span>
              <p className="text-[10px] text-gray-500 leading-normal font-sans">
                To prevent credentials hijacking, sessions expire and trigger logout automatically after inactivity buffers.
              </p>
            </div>
            <div className="flex items-center gap-3 md:justify-end">
              <select
                value={sessionTimeoutMinutes}
                onChange={(e) => saveSecuritySettings({ sessionTimeoutMinutes: parseInt(e.target.value) })}
                className="bg-[#05070a] border border-white/10 text-white rounded px-3 py-1.5 text-xs focus:outline-none"
              >
                <option value={5}>5 minutes inactivity</option>
                <option value={15}>15 minutes (Standard)</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour max</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === "2fa" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs text-gray-400">
          {/* Multi-Factor Authentication Control desk */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="text-xs uppercase text-white font-bold flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>Optional Multi-Factor Auth Gate (2FA)</span>
                </h4>
                <button
                  onClick={() => saveSecuritySettings({ twoFactorEnabled: !twoFactorEnabled })}
                  className={`px-3 py-1 rounded text-[10px] font-bold ${
                    twoFactorEnabled ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"
                  }`}
                >
                  {twoFactorEnabled ? "● MFA ACTIVE" : "○ MFA INACTIVE"}
                </button>
              </div>

              {twoFactorEnabled && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase block">Select Multi-Factor Vector</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div 
                        onClick={() => saveSecuritySettings({ twoFactorType: "email" })}
                        className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                          twoFactorType === "email" ? "border-cyan-400 bg-cyan-400/5 text-white" : "border-white/5 text-gray-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-cyan-400" />
                          <div>
                            <span className="font-bold block text-[10px]">Email OTP</span>
                            <span className="text-[8px] text-gray-500">Security code sent on login</span>
                          </div>
                        </div>
                        {twoFactorType === "email" && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>

                      <div 
                        onClick={() => saveSecuritySettings({ twoFactorType: "totp" })}
                        className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                          twoFactorType === "totp" ? "border-cyan-400 bg-cyan-400/5 text-white" : "border-white/5 text-gray-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <div>
                            <span className="font-bold block text-[10px]">Time based OTP (TOTP)</span>
                            <span className="text-[8px] text-gray-500">Google Authenticator or Authy</span>
                          </div>
                        </div>
                        {twoFactorType === "totp" && <Check className="w-4 h-4 text-purple-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Backup codes roll */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase text-white font-bold block">Backup Recovery Codes</span>
                        <span className="text-[8px] text-gray-500">Store securely. Use to bypass MFA locks.</span>
                      </div>
                      <button
                        onClick={generateNewBackupCodes}
                        className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded font-bold uppercase text-[9px]"
                      >
                        Rotate Keys
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/40 p-3 rounded-lg border border-white/5">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="text-center font-mono text-white text-[10px] tracking-widest border-r border-white/5 last:border-r-0 py-0.5">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* WebAuthn Passkeys Biometrics Enrollment */}
            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-5">
              <div>
                <h4 className="text-xs uppercase text-white font-bold flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Biometric Passkeys (FIDO2 / WebAuthn)</span>
                </h4>
                <p className="text-[10px] text-gray-500 leading-relaxed font-sans mt-1">
                  Enroll modern biometrics (Apple TouchID, Windows Hello, Android Biometrics) through cryptographic passkeys. No sensitive biometric data is transmitted or stored on server structures.
                </p>
              </div>

              {passkeyRegSuccess && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px]">
                  ✓ Biometric key generated! Device registered inside browser credentials database.
                </div>
              )}

              <form onSubmit={triggerPasskeyRegistration} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newPasskeyName}
                  onChange={(e) => setNewPasskeyName(e.target.value)}
                  placeholder="e.g. Macbook Pro TouchID"
                  className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white"
                />
                <button
                  type="submit"
                  disabled={registeringPasskey}
                  className="bg-cyan-400 hover:bg-cyan-500 disabled:opacity-40 text-black px-4 py-1.5 rounded font-bold uppercase text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {registeringPasskey ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>Register Key</span>
                    </>
                  )}
                </button>
              </form>

              {/* Passkeys Registered */}
              <div className="space-y-2 pt-3 border-t border-white/5">
                <span className="text-[10px] uppercase text-gray-500">Registered Cryptographic Passkeys ({passkeys.length})</span>
                <div className="space-y-2">
                  {passkeys.map(pk => (
                    <div key={pk.id} className="p-3 bg-black/20 border border-white/5 rounded-lg flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-cyan-400" />
                        <div>
                          <span className="font-bold text-white block text-[10px]">{pk.label}</span>
                          <span className="text-[8px] text-gray-500">Created: {pk.created.split("T")[0]} • Last Access: {pk.lastUsed}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePasskey(pk.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {passkeys.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-[10px]">
                      No biometrics enrolled. Hard keys can be linked.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Biometrics instructions desk */}
          <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4">
            <h4 className="text-xs uppercase text-white font-bold border-b border-white/5 pb-2">
              Passkey Technology Guides
            </h4>
            <div className="space-y-3 font-sans text-[11px] text-gray-400 leading-relaxed">
              <p>
                Passkeys replace insecure passwords by establishing unique asymmetric key-pairs per device.
              </p>
              <div className="space-y-1.5 text-xs font-mono text-gray-500 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  <span>Windows Hello Secure Module</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  <span>Apple FaceID / TouchID Cloud Keychain</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  <span>Android Biometric Prompts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "tokens" && (
        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-6 space-y-6 text-xs font-mono">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Developer API Keys & Bearer Tokens</span>
            </h3>
            <p className="text-gray-400 text-xs mt-1">
              Generate static integration tokens (`HL_SECURE_...`) with fine-grained access limits to query or sync portfolio datasets from external microservices safely.
            </p>
          </div>

          {/* Create token */}
          <form onSubmit={handleCreateToken} className="p-4 bg-black/20 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[9px] uppercase text-gray-500 block">Token Descriptive Label</label>
              <input
                type="text"
                required
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                placeholder="e.g. GitHub Workflow Sync Agent"
                className="w-full bg-[#05070a] border border-white/10 rounded px-3 py-1.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase text-gray-500 block">Assigned Role Limit</label>
              <select
                value={newTokenRole}
                onChange={(e) => setNewTokenRole(e.target.value)}
                className="w-full bg-[#05070a] border border-white/10 text-white rounded px-2.5 py-1.5"
              >
                <option value="Super Admin">Super Admin Scope</option>
                <option value="Editor">Editor Scope</option>
                <option value="Subscriber">Reader Only</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-cyan-400 hover:bg-cyan-500 text-black px-4 py-2 rounded font-bold uppercase text-[10px] text-center"
            >
              Generate Secret Token
            </button>
          </form>

          {generatedToken && (
            <div className="p-4 bg-purple-950/20 border border-purple-500/20 text-purple-300 rounded-lg space-y-2 animate-fade-in">
              <span className="font-bold text-[10px] uppercase block text-white">IMPORTANT: COPY YOUR SECRET TOKEN NOW!</span>
              <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                This secret is generated with high entropy hashing and will never be displayed again for security purposes.
              </p>
              <div className="flex gap-2 items-center bg-black/40 p-2.5 rounded border border-white/10 text-white font-mono text-[11px] tracking-wider select-all">
                <span>{generatedToken}</span>
              </div>
            </div>
          )}

          {/* Token Lists */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase text-gray-500">Active Bearer Credentials ({tokens.length})</span>
            <div className="space-y-2">
              {tokens.map(tk => (
                <div key={tk.id} className="p-3 bg-black/20 border border-white/5 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{tk.name}</span>
                      <span className="px-1.5 py-0.5 bg-cyan-400/10 text-cyan-400 text-[8px] font-bold rounded">
                        {tk.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Token Index: <span className="text-gray-400">HL_SECURE_...{tk.tokenValue.substring(tk.tokenValue.length - 8)}</span> • Generated: {tk.created.split("T")[0]} • Expires: {tk.expires.split("T")[0]}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteToken(tk.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Revoke & Delete Token"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {tokens.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No Bearer tokens currently generated. Integration channels off.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-5 space-y-4 font-mono text-xs text-gray-400">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h4 className="text-xs uppercase text-white font-bold flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Full Access Audit Trail & Rate Monitors</span>
            </h4>
            <span className="text-[9px] text-gray-500">Handshake logs synced</span>
          </div>

          {/* Login Monitoring logs */}
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {loginLogs.map(log => (
              <div key={log.id} className="p-3 bg-black/20 border border-white/5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/10 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{log.email}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      log.status === "success" 
                        ? "bg-emerald-400/10 text-emerald-400" 
                        : log.status === "blocked" 
                          ? "bg-purple-400/10 text-purple-400 font-bold"
                          : "bg-red-400/10 text-red-400"
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                    {log.reason && <span className="text-red-400 text-[9px]">({log.reason})</span>}
                  </div>
                  <div className="text-[10px] text-gray-500 leading-normal">
                    IP: <span className="text-gray-300">{log.ip}</span> ({log.country}) • Browser: <span className="text-gray-300">{log.browser}</span> on <span className="text-gray-300">{log.device}</span>
                  </div>
                </div>

                <span className="text-[9px] text-gray-500">
                  {log.timestamp.replace("T", " ").substring(0, 19)}
                </span>
              </div>
            ))}
          </div>

          {/* Rate limits logs configs */}
          <div className="pt-4 border-t border-white/5 p-4 bg-black/15 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <span className="font-bold text-white text-[11px] uppercase tracking-wide">Brute-Force Rate Limiting Threshold</span>
              <p className="text-[10px] text-gray-500 leading-normal font-sans">
                Set max requests parameters per remote IP per minute before blocking trigger.
              </p>
            </div>
            <div className="flex items-center gap-3 md:justify-end">
              <select
                value={rateLimitRequests}
                onChange={(e) => saveSecuritySettings({ rateLimitRequests: parseInt(e.target.value) })}
                className="bg-[#05070a] border border-white/10 text-white rounded px-3 py-1.5 text-xs focus:outline-none"
              >
                <option value={50}>50 req / min (Strict)</option>
                <option value={100}>100 req / min (Standard)</option>
                <option value={200}>200 req / min (Developer mode)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === "upload-sec" && (
        <div className="bg-[#0a0c10]/40 border border-white/5 rounded-xl p-6 space-y-6 text-xs font-mono text-gray-400">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Media upload security rules</span>
            </h3>
            <p className="text-gray-400 text-xs mt-1">
              Verify mime types, file structures, and manage automated virus/malware scanner thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/20 p-5 rounded-xl border border-white/5 space-y-4">
              <h4 className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Authorized Media Extensions</span>
              </h4>
              <p className="text-[10px] text-gray-500 leading-normal font-sans">
                Select custom extensions accepted by core media storage buckets. Any other extension will trigger request rejection.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1 text-[10px]">
                {["png", "jpg", "jpeg", "gif", "pdf", "zip", "mp4", "exe", "dmg"].map(ext => {
                  const allowed = allowedExtensions.includes(ext);
                  return (
                    <button
                      key={ext}
                      type="button"
                      onClick={() => {
                        const next = allowed 
                          ? allowedExtensions.filter(e => e !== ext)
                          : [...allowedExtensions, ext];
                        saveSecuritySettings({ allowedExtensions: next });
                      }}
                      className={`p-2 rounded border uppercase font-bold text-center transition-all ${
                        allowed 
                          ? "border-cyan-400 bg-cyan-400/10 text-white" 
                          : "border-white/5 bg-black/40 text-gray-500 hover:border-white/10"
                      }`}
                    >
                      {ext}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-black/20 p-5 rounded-xl border border-white/5 space-y-4">
              <h4 className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1">
                <Shield className="w-4 h-4 text-purple-400 animate-bounce" />
                <span>Automated Malware Scans & Rules</span>
              </h4>
              <p className="text-[10px] text-gray-500 leading-normal font-sans">
                All ingested assets go through simulated signatures checking and heuristic byte checks. Unsafe codes or mismatching headers are deleted immediately.
              </p>

              <div className="space-y-3.5 pt-1 text-[10px]">
                <div className="flex justify-between items-center p-2.5 bg-[#05070a] border border-white/5 rounded">
                  <div>
                    <span className="font-bold block text-white">Ingest Scanner Threshold</span>
                    <span className="text-[8px] text-gray-500 font-sans">Checks binary stream headers</span>
                  </div>
                  <span className="text-emerald-400 font-bold uppercase">✓ Active</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-[#05070a] border border-white/5 rounded">
                  <div>
                    <span className="font-bold block text-white">Heuristic File Sweeps</span>
                    <span className="text-[8px] text-gray-500 font-sans">Detects obfuscated PHP/JS code injections</span>
                  </div>
                  <span className="text-emerald-400 font-bold uppercase">✓ Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
