"use client";

import { useState } from "react";
import Link from "next/link";

type SettingsTab = "profile" | "subscription" | "content" | "privacy" | "notifications";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [nsfwEnabled, setNsfwEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);

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
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {activeTab === "profile" && (
            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Profile Information</h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-accent-surface flex items-center justify-center border border-accent/20">
                  <span className="material-symbols-outlined text-accent-light text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <div>
                  <button className="px-4 py-2 bg-surface-highest border border-border rounded-lg text-[12px] text-text-primary font-medium hover:bg-surface-high transition-colors">
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
                    defaultValue="Alex Mercer"
                    className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-[13px] text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-label font-bold text-text-tertiary uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="alex@example.com"
                    className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-[13px] text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-label font-bold text-text-tertiary uppercase tracking-wider mb-2">Bio</label>
                  <textarea
                    defaultValue="Digital explorer and architecture enthusiast."
                    className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-[13px] text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <button className="px-6 py-2.5 cta-gradient text-white font-semibold text-[13px] rounded-lg hover:opacity-90 transition-opacity">
                Save Changes
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
                      <span className="text-accent-light font-bold text-[16px]">Premium</span>
                      <span className="px-2 py-0.5 rounded-md cta-gradient text-[10px] font-bold text-white">ACTIVE</span>
                    </div>
                    <p className="text-text-secondary text-[12px] mt-1">Renews on April 12, 2026</p>
                  </div>
                  <p className="text-accent-light font-bold text-2xl">{"\u20B9"}999<span className="text-text-tertiary text-[12px] font-normal">/mo</span></p>
                </div>
                <div className="flex gap-3 mt-4">
                  <Link href="/pricing" className="px-4 py-2 cta-gradient text-white font-semibold text-[12px] rounded-lg hover:opacity-90 transition-opacity">
                    Upgrade Plan
                  </Link>
                  <button className="px-4 py-2 bg-surface-highest border border-border rounded-lg text-[12px] text-text-secondary font-medium hover:text-coral transition-colors">
                    Cancel Subscription
                  </button>
                </div>
              </div>
              <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Billing History</h3>
                <div className="space-y-3">
                  {[
                    { date: "12 Mar 2026", amount: "\u20B9999", status: "Paid" },
                    { date: "12 Feb 2026", amount: "\u20B9999", status: "Paid" },
                    { date: "12 Jan 2026", amount: "\u20B9999", status: "Paid" },
                  ].map((bill, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="text-text-primary text-[13px]">Premium Subscription</p>
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
                    onClick={() => setNsfwEnabled(!nsfwEnabled)}
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
