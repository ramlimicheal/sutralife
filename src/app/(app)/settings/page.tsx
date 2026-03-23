"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/Toast";

type SettingsTab = "profile" | "subscription" | "content" | "privacy" | "notifications";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  tier: string;
  nsfw_enabled: boolean;
  subscription_status: string;
  subscription_expires_at: string | null;
}

export default function SettingsPage() {
  const { user: authUser, signOut } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [nsfwEnabled, setNsfwEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setDisplayName(data.user.name ?? "");
          setBio(data.user.bio ?? "");
          setNsfwEnabled(data.user.nsfw_enabled ?? false);
        }
      } catch {
        // Keep defaults
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName }),
      });
      if (res.ok) {
        showToast("Profile saved!", "success");
        const data = await res.json();
        setProfile(data.user);
      } else {
        showToast("Failed to save profile", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
    setSaving(false);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be under 5MB", "error");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "avatars");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        const patchRes = await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar_url: uploadData.url }),
        });
        if (patchRes.ok) {
          const data = await patchRes.json();
          setProfile(data.user);
          showToast("Avatar updated!", "success");
        }
      }
    } catch {
      showToast("Failed to upload avatar", "error");
    }
  }

  async function handleToggleNsfw() {
    const newVal = !nsfwEnabled;
    setNsfwEnabled(newVal);
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nsfw_enabled: newVal }),
      });
    } catch {
      setNsfwEnabled(!newVal);
    }
  }

  async function handleCancelSubscription() {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    try {
      const res = await fetch("/api/subscription", { method: "DELETE" });
      if (res.ok) {
        showToast("Subscription cancelled", "success");
        const profileRes = await fetch("/api/user");
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data.user);
        }
      } else {
        showToast("Failed to cancel subscription", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  }

  const tierLabel = profile?.tier ?? "basic";
  const tierPrice = tierLabel === "premium" ? "$24.99" : tierLabel === "collector" ? "$49.99" : "$9.99";

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: "profile", label: "Profile", icon: "person" },
    { key: "subscription", label: "Subscription", icon: "credit_card" },
    { key: "content", label: "Content", icon: "visibility" },
    { key: "privacy", label: "Privacy", icon: "lock" },
    { key: "notifications", label: "Notifications", icon: "notifications" },
  ];

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Settings</h2>
        <p className="text-text-secondary text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs */}
        <div className="md:w-56 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-accent/8 text-accent-light"
                    : "text-muted hover:bg-surface-high hover:text-text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {authUser && (
            <button
              onClick={signOut}
              className="mt-4 w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-coral hover:bg-coral/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {activeTab === "profile" && (
            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Profile Information</h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-accent-surface flex items-center justify-center border border-accent/20 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-accent-light text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                  )}
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-surface-highest border border-border rounded-lg text-[12px] text-text-primary font-medium hover:bg-surface-high transition-colors">
                    Change Avatar
                  </button>
                  <p className="text-text-tertiary text-[10px] mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-label font-bold text-text-tertiary uppercase tracking-wider mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-[13px] text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-label font-bold text-text-tertiary uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    value={profile?.email ?? ""}
                    disabled
                    className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-[13px] text-text-tertiary cursor-not-allowed outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-label font-bold text-text-tertiary uppercase tracking-wider mb-2">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-[13px] text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2.5 cta-gradient text-bg font-semibold text-[13px] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {activeTab === "subscription" && (
            <div className="space-y-6">
              <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Current Plan</h3>
                <div className="flex items-center justify-between p-4 bg-accent/5 rounded-xl border border-accent/15">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-accent-light font-bold text-[16px] capitalize">{tierLabel}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${profile?.subscription_status === "active" ? "cta-gradient text-bg" : "bg-coral text-white"}`}>
                        {(profile?.subscription_status ?? "inactive").toUpperCase()}
                      </span>
                    </div>
                    {profile?.subscription_expires_at && (
                      <p className="text-text-secondary text-[12px] mt-1">
                        Renews on {new Date(profile.subscription_expires_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <p className="text-accent-light font-bold text-2xl">{tierPrice}<span className="text-text-tertiary text-[12px] font-normal">/mo</span></p>
                </div>
                <div className="flex gap-3 mt-4">
                  <Link href="/pricing" className="px-4 py-2 cta-gradient text-bg font-semibold text-[12px] rounded-lg hover:opacity-90 transition-opacity">
                    Upgrade Plan
                  </Link>
                  {profile?.subscription_status === "active" && (
                    <button onClick={handleCancelSubscription} className="px-4 py-2 bg-surface-highest border border-border rounded-lg text-[12px] text-text-secondary font-medium hover:text-coral transition-colors">
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Billing History</h3>
                <div className="space-y-3">
                  {[
                    { date: "12 Mar 2026", amount: tierPrice, status: "Paid" },
                    { date: "12 Feb 2026", amount: tierPrice, status: "Paid" },
                    { date: "12 Jan 2026", amount: tierPrice, status: "Paid" },
                  ].map((bill, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="text-text-primary text-[13px] capitalize">{tierLabel} Subscription</p>
                        <p className="text-text-tertiary text-[11px]">{bill.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-text-primary text-[13px] font-medium">{bill.amount}</p>
                        <p className="text-success text-[10px] font-bold">{bill.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Content Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-high rounded-xl border border-border">
                  <div>
                    <p className="text-[13px] font-semibold text-text-primary">NSFW Content</p>
                    <p className="text-[11px] text-coral mt-0.5">Enable adult content. You must be 18+ and subscribed to Premium or higher.</p>
                  </div>
                  <button
                    onClick={handleToggleNsfw}
                    className={`relative w-11 h-6 rounded-full transition-colors ${nsfwEnabled ? "bg-accent" : "bg-surface-highest"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${nsfwEnabled ? "translate-x-5.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <div className="p-4 bg-surface-high rounded-xl border border-border">
                  <p className="text-[13px] font-semibold text-text-primary mb-3">Blur Intensity</p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
                    <span>Subtle</span>
                    <span>Heavy</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Privacy & Data</h3>
              <div className="space-y-4">
                <div className="p-4 bg-surface-high rounded-xl border border-border">
                  <h4 className="text-[13px] font-semibold text-text-primary mb-1">Export Your Data</h4>
                  <p className="text-[11px] text-text-secondary mb-3">Download all your data including conversations, favorites, and profile info.</p>
                  <button className="px-4 py-2 bg-surface-highest border border-border rounded-lg text-[12px] text-text-primary font-medium hover:bg-surface transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">download</span>Export Data
                  </button>
                </div>
                <div className="p-4 bg-surface-high rounded-xl border border-coral/20">
                  <h4 className="text-[13px] font-semibold text-coral mb-1">Delete Account</h4>
                  <p className="text-[11px] text-text-secondary mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
                  <button className="px-4 py-2 bg-coral/10 border border-coral/30 rounded-lg text-[12px] text-coral font-medium hover:bg-coral/20 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-high rounded-xl border border-border">
                  <div>
                    <p className="text-[13px] font-semibold text-text-primary">Email Notifications</p>
                    <p className="text-[11px] text-text-secondary mt-0.5">Receive updates about new characters and features</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${emailNotifications ? "bg-accent" : "bg-surface-highest"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${emailNotifications ? "translate-x-5.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-surface-high rounded-xl border border-border">
                  <div>
                    <p className="text-[13px] font-semibold text-text-primary">Chat Notifications</p>
                    <p className="text-[11px] text-text-secondary mt-0.5">Get notified when characters respond to your messages</p>
                  </div>
                  <button
                    onClick={() => setChatNotifications(!chatNotifications)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${chatNotifications ? "bg-accent" : "bg-surface-highest"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${chatNotifications ? "translate-x-5.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
