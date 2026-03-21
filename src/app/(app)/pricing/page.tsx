"use client";

import { useState } from "react";
import { pricingTiers } from "@/lib/mock-data";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="px-4 md:px-6 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-accent-light font-label font-bold text-[10px] tracking-[0.25em] uppercase">Pricing</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight mt-2">
          Choose Your <span className="text-gradient">Sanctuary</span>
        </h2>
        <p className="text-text-secondary text-sm mt-3 leading-relaxed">
          Unlock deeper conversations, premium characters, and exclusive content with our subscription plans.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={`text-[13px] font-medium ${billingCycle === "monthly" ? "text-text-primary" : "text-text-tertiary"}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className={`relative w-12 h-6 rounded-full transition-colors ${billingCycle === "yearly" ? "bg-accent" : "bg-surface-highest"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${billingCycle === "yearly" ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-[13px] font-medium ${billingCycle === "yearly" ? "text-text-primary" : "text-text-tertiary"}`}>
            Yearly <span className="text-success text-[10px] font-bold">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {pricingTiers.map((tier) => {
          const price = billingCycle === "yearly" ? Math.round(tier.price * 0.8) : tier.price;
          const isPopular = tier.name === "Premium";

          return (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-6 md:p-8 flex flex-col transition-transform hover:-translate-y-1 duration-300 ${
                isPopular
                  ? "bg-gradient-to-b from-accent/10 to-surface border-2 border-accent shadow-lg shadow-accent/10"
                  : "bg-surface border border-border"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 cta-gradient rounded-full text-[10px] font-bold text-white tracking-wider uppercase">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold tracking-tight ${isPopular ? "text-accent-light" : "text-text-primary"}`}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-3xl font-extrabold text-text-primary">{"\u20B9"}{price}</span>
                  <span className="text-text-tertiary text-[12px]">/{billingCycle === "yearly" ? "mo (billed yearly)" : "mo"}</span>
                </div>
                <p className="text-text-secondary text-[12px] mt-2">{tier.description}</p>
              </div>

              <div className="flex-1 space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-success text-[16px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-text-secondary text-[12px] leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-3 rounded-xl font-semibold text-[13px] transition-all ${
                  isPopular
                    ? "cta-gradient text-white hover:opacity-90 shadow-lg shadow-accent/15"
                    : "bg-surface-highest border border-border text-text-primary hover:bg-surface-high"
                }`}
              >
                {tier.name === "Basic" ? "Get Started" : tier.name === "Premium" ? "Subscribe Now" : "Go Collector"}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mt-16">
        <h3 className="text-xl font-bold text-text-primary tracking-tight text-center mb-8">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            { q: "Can I switch plans anytime?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle." },
            { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay." },
            { q: "Is there a free trial?", a: "We offer a limited free tier that lets you explore basic characters and features. No credit card required." },
            { q: "How do I cancel my subscription?", a: "You can cancel anytime from Settings > Subscription. You'll retain access until the end of your current billing period." },
          ].map((faq, i) => (
            <details key={i} className="bg-surface border border-border rounded-xl group">
              <summary className="px-5 py-4 text-[13px] font-semibold text-text-primary cursor-pointer list-none flex items-center justify-between hover:bg-surface-high rounded-xl transition-colors">
                {faq.q}
                <span className="material-symbols-outlined text-[18px] text-text-tertiary group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="px-5 pb-4 text-[12px] text-text-secondary leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
