"use client";

import { useState } from "react";
import { mockAdminStats, mockAdminSubscribers } from "@/lib/mock-data";
import { getTierBadgeColor, getStatusBadge } from "@/lib/utils";

type AdminTab = "subscriptions" | "characters" | "analytics";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("subscriptions");
  const [searchQuery, setSearchQuery] = useState("");
  const stats = mockAdminStats;
  const subscribers = mockAdminSubscribers;

  const filteredSubscribers = subscribers.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs: { key: AdminTab; label: string; icon: string }[] = [
    { key: "subscriptions", label: "Subscriptions", icon: "credit_card" },
    { key: "characters", label: "Characters", icon: "person" },
    { key: "analytics", label: "Analytics", icon: "analytics" },
  ];

  return (
    <div className="px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Admin Dashboard</h2>
          <p className="text-text-secondary text-sm mt-1">Manage your platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-surface-highest border border-border rounded-lg text-[12px] text-text-secondary font-medium hover:text-text-primary transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">download</span>Export CSV
          </button>
          <button className="px-4 py-2 cta-gradient text-white font-semibold text-[12px] rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">add</span>Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-accent text-[16px]">payments</span>
            </div>
            <span className="font-label text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Total Revenue</span>
          </div>
          <p className="text-2xl font-extrabold text-text-primary">{"\u20B9"}{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-success text-[11px] font-semibold mt-1 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">trending_up</span>+12.5% this month
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-success text-[16px]">group</span>
            </div>
            <span className="font-label text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Active Subs</span>
          </div>
          <p className="text-2xl font-extrabold text-text-primary">{stats.activeSubscribers.toLocaleString()}</p>
          <p className="text-success text-[11px] font-semibold mt-1 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">trending_up</span>+8.2% this month
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent-light/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-accent-light text-[16px]">workspace_premium</span>
            </div>
            <span className="font-label text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Premium Tier</span>
          </div>
          <p className="text-2xl font-extrabold text-text-primary">{stats.premiumCount.toLocaleString()}</p>
          <p className="text-text-tertiary text-[11px] mt-1">{Math.round((stats.premiumCount / stats.activeSubscribers) * 100)}% of total</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-coral text-[16px]">trending_down</span>
            </div>
            <span className="font-label text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Churn Rate</span>
          </div>
          <p className="text-2xl font-extrabold text-text-primary">{stats.churnRate}%</p>
          <p className="text-coral text-[11px] font-semibold mt-1 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">trending_up</span>+0.3% this month
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface rounded-lg border border-border mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-surface-highest text-text-primary shadow-sm"
                : "text-muted hover:text-text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-border flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-text-tertiary">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subscribers..."
                className="w-full bg-bg border border-border rounded-lg py-2 pl-9 pr-4 text-[13px] text-text-primary focus:ring-1 focus:ring-accent focus:border-accent placeholder:text-text-tertiary outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select className="bg-bg border border-border rounded-lg py-2 px-3 text-[12px] text-text-secondary outline-none focus:ring-1 focus:ring-accent">
                <option>All Tiers</option>
                <option>Basic</option>
                <option>Premium</option>
                <option>Collector</option>
              </select>
              <select className="bg-bg border border-border rounded-lg py-2 px-3 text-[12px] text-text-secondary outline-none focus:ring-1 focus:ring-accent">
                <option>All Status</option>
                <option>Active</option>
                <option>Cancelled</option>
                <option>Past Due</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-[10px] font-label font-bold text-text-tertiary uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 text-[10px] font-label font-bold text-text-tertiary uppercase tracking-wider">Tier</th>
                  <th className="px-5 py-3 text-[10px] font-label font-bold text-text-tertiary uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[10px] font-label font-bold text-text-tertiary uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-[10px] font-label font-bold text-text-tertiary uppercase tracking-wider">Next Billing</th>
                  <th className="px-5 py-3 text-[10px] font-label font-bold text-text-tertiary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-surface-high/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent-surface flex items-center justify-center text-accent-light font-bold text-[11px]">
                          {sub.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-[13px] text-text-primary font-medium">{sub.name}</p>
                          <p className="text-[11px] text-text-tertiary">{sub.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${getTierBadgeColor(sub.tier)}`}>
                        {sub.tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${getStatusBadge(sub.status)}`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-text-primary font-medium">
                      {"\u20B9"}{sub.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-text-secondary">
                      {sub.nextBilling}
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="p-1.5 rounded-md hover:bg-surface-highest text-text-tertiary hover:text-text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubscribers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined text-[36px] text-text-tertiary mb-3">search_off</span>
              <p className="text-text-secondary text-[13px]">No subscribers found</p>
            </div>
          )}

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            <p className="text-[11px] text-text-tertiary">
              Showing {filteredSubscribers.length} of {subscribers.length} subscribers
            </p>
            <div className="flex items-center gap-1.5">
              <button className="px-3 py-1.5 bg-surface-highest border border-border rounded-md text-[11px] text-text-tertiary hover:text-text-primary transition-colors">
                Prev
              </button>
              <button className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-md text-[11px] text-accent-light font-bold">1</button>
              <button className="px-3 py-1.5 bg-surface-highest border border-border rounded-md text-[11px] text-text-tertiary hover:text-text-primary transition-colors">2</button>
              <button className="px-3 py-1.5 bg-surface-highest border border-border rounded-md text-[11px] text-text-tertiary hover:text-text-primary transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Characters Tab */}
      {activeTab === "characters" && (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-[48px] text-text-tertiary mb-4">person</span>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Character Management</h3>
          <p className="text-text-secondary text-[13px]">Manage, moderate, and review all characters on the platform.</p>
          <p className="text-text-tertiary text-[11px] mt-2">Coming soon with Supabase integration</p>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-[14px] font-semibold text-text-primary mb-4">Revenue Over Time</h3>
            <div className="h-48 flex items-end gap-2">
              {[40, 55, 45, 65, 50, 72, 68, 80, 75, 85, 90, 95].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-accent/60 hover:bg-accent transition-colors"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[8px] text-text-tertiary">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-[14px] font-semibold text-text-primary mb-4">Tier Distribution</h3>
            <div className="space-y-4">
              {[
                { tier: "Basic", count: 1240, color: "bg-text-secondary", pct: 45 },
                { tier: "Premium", count: 890, color: "bg-accent", pct: 32 },
                { tier: "Collector", count: 620, color: "bg-coral", pct: 23 },
              ].map((item) => (
                <div key={item.tier} className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-text-primary font-medium">{item.tier}</span>
                    <span className="text-text-tertiary">{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="h-2 bg-surface-highest rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 lg:col-span-2">
            <h3 className="text-[14px] font-semibold text-text-primary mb-4">Key Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Avg. Session Time", value: "14m 32s", icon: "timer", change: "+2.1%" },
                { label: "Messages/Day", value: "48.2K", icon: "chat", change: "+15.3%" },
                { label: "New Users (7d)", value: "1,847", icon: "person_add", change: "+9.8%" },
                { label: "Retention Rate", value: "87.3%", icon: "loyalty", change: "+1.2%" },
              ].map((m) => (
                <div key={m.label} className="bg-surface-high rounded-xl border border-border p-4">
                  <span className="material-symbols-outlined text-accent text-[18px] mb-2">{m.icon}</span>
                  <p className="text-[10px] font-label font-bold text-text-tertiary uppercase tracking-wider">{m.label}</p>
                  <p className="text-xl font-bold text-text-primary mt-1">{m.value}</p>
                  <p className="text-success text-[10px] font-semibold mt-1">{m.change}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
