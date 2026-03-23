"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/Toast";

const categories = ["Cyberpunk", "Historical", "Fantasy", "Slice of Life", "Supernatural"];
const speakingStyles = ["Neutral", "Poetic", "Formal", "Casual", "Mysterious", "Aggressive", "Warm", "Cold"];
const availableTraits = ["Romantic", "Mysterious", "Aggressive", "Cheerful", "Loyal", "Intelligent", "Wise", "Adventurous", "Strategic", "Supportive", "Charming", "Stoic"];

export default function CreateCharacterPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    bio: "",
    category: "",
    speaking_style: "Neutral",
    traits: [] as string[],
    is_nsfw: false,
    is_public: true,
  });

  function toggleTrait(trait: string) {
    setForm((prev) => ({
      ...prev,
      traits: prev.traits.includes(trait)
        ? prev.traits.filter((t) => t !== trait)
        : [...prev.traits, trait],
    }));
  }

  function canProceed(): boolean {
    switch (step) {
      case 1: return !!form.name.trim() && !!form.tagline.trim();
      case 2: return !!form.bio.trim() && form.traits.length > 0;
      case 3: return !!form.category;
      case 4: return true;
      default: return true;
    }
  }

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be under 5MB", "error");
      return;
    }
    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!authUser) {
      showToast("Please log in to create characters", "error");
      router.push("/auth");
      return;
    }

    setSubmitting(true);
    try {
      // Upload avatar if provided
      let avatarUrl = "";
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("bucket", "character-images");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatarUrl = uploadData.url;
        }
      }

      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          tagline: form.tagline,
          bio: form.bio,
          avatar_url: avatarUrl,
          category: form.category.toLowerCase().replace(/ /g, "-"),
          traits: form.traits,
          speaking_style: form.speaking_style.toLowerCase(),
          is_nsfw: form.is_nsfw,
          is_published: form.is_public,
        }),
      });

      if (res.ok) {
        showToast("Character created successfully!", "success");
        router.push("/library");
      } else {
        const errData = await res.json();
        showToast(errData.error ?? "Failed to create character", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 md:px-6 py-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Create Character</h2>
        <p className="text-text-secondary text-sm mt-1">Design your own AI persona</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${
              s <= step ? "cta-gradient text-bg" : "bg-surface-highest text-text-tertiary border border-border"
            }`}>
              {s < step ? (
                <span className="material-symbols-outlined text-[14px]">check</span>
              ) : s}
            </div>
            {s < 5 && <div className={`flex-1 h-0.5 rounded-full ${s < step ? "bg-accent" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-surface border border-border rounded-xl p-6 md:p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Basic Info</h3>
              <p className="text-text-secondary text-[12px]">Give your character a name and identity</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-label font-bold text-text-tertiary uppercase tracking-wider mb-2">Character Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-[13px] text-text-primary focus:ring-1 focus:ring-accent focus:border-accent placeholder:text-text-tertiary/50 outline-none"
                  placeholder="e.g., The Architect"
                />
              </div>
              <div>
                <label className="block text-[12px] font-label font-bold text-text-tertiary uppercase tracking-wider mb-2">Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-[13px] text-text-primary focus:ring-1 focus:ring-accent focus:border-accent placeholder:text-text-tertiary/50 outline-none"
                  placeholder="A short description of your character"
                />
              </div>
              <div>
                <label className="block text-[12px] font-label font-bold text-text-tertiary uppercase tracking-wider mb-2">Avatar</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 bg-bg border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 transition-colors overflow-hidden"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[32px] text-text-tertiary mb-2">cloud_upload</span>
                      <p className="text-text-tertiary text-[12px]">Click to upload or drag and drop</p>
                      <p className="text-text-tertiary/50 text-[10px] mt-1">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Personality</h3>
              <p className="text-text-secondary text-[12px]">Define how your character thinks and speaks</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-label font-bold text-text-tertiary uppercase tracking-wider mb-2">Bio / Backstory</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-[13px] text-text-primary focus:ring-1 focus:ring-accent focus:border-accent placeholder:text-text-tertiary/50 outline-none resize-none"
                  placeholder="Write a detailed backstory for your character..."
                  rows={6}
                />
              </div>
              <div>
                <label className="block text-[12px] font-label font-bold text-text-tertiary uppercase tracking-wider mb-2">Speaking Style</label>
                <select
                  value={form.speaking_style}
                  onChange={(e) => setForm({ ...form, speaking_style: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-[13px] text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                >
                  {speakingStyles.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-label font-bold text-text-tertiary uppercase tracking-wider mb-2">Traits</label>
                <div className="flex flex-wrap gap-2">
                  {availableTraits.map((trait) => (
                    <button
                      key={trait}
                      onClick={() => toggleTrait(trait)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                        form.traits.includes(trait)
                          ? "bg-accent/15 border-accent text-accent-light"
                          : "bg-surface-highest border-border text-text-secondary hover:border-accent hover:text-accent-light"
                      }`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Category</h3>
              <p className="text-text-secondary text-[12px]">Choose where your character belongs</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    form.category === cat
                      ? "bg-accent/10 border-accent text-accent-light"
                      : "bg-surface-high border-border text-text-secondary hover:border-accent/30"
                  }`}
                >
                  <p className="text-[13px] font-semibold">{cat}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Visibility</h3>
              <p className="text-text-secondary text-[12px]">Control who can see your character</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-high rounded-xl border border-border">
                <div>
                  <p className="text-[13px] font-semibold text-text-primary">Public Character</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">Anyone can discover and chat with this character</p>
                </div>
                <button
                  onClick={() => setForm({ ...form, is_public: !form.is_public })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.is_public ? "bg-accent" : "bg-surface-highest"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.is_public ? "translate-x-5.5" : "translate-x-0.5"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-high rounded-xl border border-border">
                <div>
                  <p className="text-[13px] font-semibold text-text-primary">NSFW Content</p>
                  <p className="text-[11px] text-coral mt-0.5">Enable adult content for this character. Requires Premium+</p>
                </div>
                <button
                  onClick={() => setForm({ ...form, is_nsfw: !form.is_nsfw })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.is_nsfw ? "bg-coral" : "bg-surface-highest"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.is_nsfw ? "translate-x-5.5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Review</h3>
              <p className="text-text-secondary text-[12px]">Check everything before publishing</p>
            </div>
            <div className="bg-surface-high rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-surface-highest border border-border flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] text-text-tertiary">person</span>
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-text-primary">{form.name || "Unnamed"}</h4>
                  <p className="text-[12px] text-text-secondary">{form.tagline || "No tagline"}</p>
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-2 gap-4 text-[12px]">
                <div><span className="text-text-tertiary">Category:</span> <span className="text-text-primary ml-1">{form.category || "None"}</span></div>
                <div><span className="text-text-tertiary">Style:</span> <span className="text-text-primary ml-1">{form.speaking_style}</span></div>
                <div><span className="text-text-tertiary">NSFW:</span> <span className={form.is_nsfw ? "text-coral ml-1" : "text-text-primary ml-1"}>{form.is_nsfw ? "Yes" : "No"}</span></div>
                <div><span className="text-text-tertiary">Visibility:</span> <span className="text-text-primary ml-1">{form.is_public ? "Public" : "Private"}</span></div>
              </div>
              {form.traits.length > 0 && (
                <>
                  <div className="h-px bg-border" />
                  <div className="flex flex-wrap gap-1.5">
                    {form.traits.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-md bg-accent/10 text-accent-light text-[10px] font-semibold border border-accent/15">{t}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-6 py-2.5 bg-surface-highest border border-border rounded-lg text-text-secondary text-[13px] font-medium hover:bg-surface-high transition-colors disabled:opacity-30"
        >
          Back
        </button>
        {step < 5 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="px-6 py-2.5 cta-gradient text-bg font-semibold text-[13px] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 cta-gradient text-bg font-semibold text-[13px] rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[16px]">publish</span>
            Publish Character
          </button>
        )}
      </div>
    </div>
  );
}
