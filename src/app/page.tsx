"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AgeGate() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const verified = localStorage.getItem("sanctuary_age_verified");
      if (verified === "true") {
        router.replace("/discover");
      }
    }
  }, [router]);

  function handleEnter() {
    if (confirmed) {
      localStorage.setItem("sanctuary_age_verified", "true");
      router.push("/discover");
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl shadow-accent/5">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl cta-gradient flex items-center justify-center shadow-lg shadow-accent/20 mb-4">
              <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            </div>
            <h1 className="text-2xl font-extrabold text-accent-light tracking-tight">Sanctuary</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-label mt-1">Digital Persona Platform</p>
          </div>

          <div className="bg-surface-high border border-border rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-coral text-[20px] mt-0.5">warning</span>
              <div>
                <p className="text-text-primary text-[13px] font-semibold mb-1">Age Verification Required</p>
                <p className="text-text-secondary text-[12px] leading-relaxed">
                  This platform contains AI-generated content intended for adults (18+). By proceeding, you confirm that you meet the minimum age requirement for your jurisdiction.
                </p>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 mb-6 cursor-pointer group">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border bg-bg text-accent focus:ring-accent focus:ring-1 cursor-pointer"
            />
            <span className="text-text-secondary text-[13px] leading-relaxed group-hover:text-text-primary transition-colors">
              I confirm I am 18 years of age or older and agree to the platform&apos;s terms of service.
            </span>
          </label>

          <button
            onClick={handleEnter}
            disabled={!confirmed}
            className="w-full py-3 rounded-xl cta-gradient text-white font-bold text-[14px] shadow-lg shadow-accent/15 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            Enter Sanctuary
          </button>

          <button
            onClick={() => setShowTerms(true)}
            className="w-full mt-4 text-text-tertiary text-[11px] hover:text-accent-light transition-colors"
          >
            Terms of Service &amp; Privacy Policy
          </button>
        </div>
      </div>

      {showTerms && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowTerms(false)}>
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">Terms of Service</h3>
              <button onClick={() => setShowTerms(false)} className="text-muted hover:text-text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="text-text-secondary text-[12px] leading-relaxed space-y-3">
              <p>By using Sanctuary, you agree to the following terms:</p>
              <p><strong className="text-text-primary">1. Age Requirement:</strong> You must be 18 years or older to use this platform.</p>
              <p><strong className="text-text-primary">2. AI-Generated Content:</strong> All characters and conversations are AI-generated and do not represent real people.</p>
              <p><strong className="text-text-primary">3. Content Policy:</strong> NSFW content is available only to Premium and Collector tier subscribers who have explicitly enabled it.</p>
              <p><strong className="text-text-primary">4. Subscriptions:</strong> Subscription fees are billed monthly in INR. Cancellation takes effect at the end of the billing period.</p>
              <p><strong className="text-text-primary">5. Data Privacy:</strong> Conversation data is stored securely and can be deleted at your request.</p>
            </div>
            <button
              onClick={() => setShowTerms(false)}
              className="w-full mt-6 py-2.5 rounded-lg bg-surface-highest border border-border text-text-primary font-semibold text-[13px] hover:bg-surface-high transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
