# 🏛️ SANCTUARY — Complete Product Requirements Document (PRD)
## For Devin AI Agent — Build Instructions

---

## 📌 Project Overview

**Product Name:** Sanctuary  
**Repo:** `https://github.com/ramlimicheal/sutralife`  
**Domain:** AI Character Persona Platform (like SpicyChat.ai / Character.ai)  
**Monetization:** Subscription-based (3 tiers in INR)  
**Target:** 18+ users (age-gated, NSFW content toggle)

**What Sanctuary is:** A premium web platform where users discover, chat with, and build relationships with AI-generated personas/characters. Each character has a personality, traits, lore, and memory. Users subscribe to unlock premium characters and NSFW content.

---

## 🛠️ Tech Stack

| Layer | Technology | Reason |
|:------|:-----------|:-------|
| **Framework** | Next.js 14 (App Router) | SSR, file-based routing, API routes |
| **Styling** | Tailwind CSS 3.x | Already used in reference screens |
| **Icons** | Material Symbols Outlined (Google) | Already in reference screens |
| **Fonts** | Inter (body) + Manrope (labels) | Clean SaaS aesthetic |
| **Auth** | NextAuth.js + Google OAuth + Email/Password | Simple, production-ready |
| **Database** | Supabase (PostgreSQL) | Free tier, real-time, auth integration |
| **AI Chat** | Google Gemini API (`gemini-2.0-flash`) | Fast, cheap, good at roleplay |
| **Payments** | Razorpay Subscriptions API | INR native, Indian payment methods |
| **Image Storage** | Supabase Storage (public + private buckets) | Integrated with DB |
| **Deployment** | Vercel | Free tier, perfect for Next.js |

---

## 🎨 Design System

### Color Palette (Dark Theme — MANDATORY)

```
Background:     #0e0e11   (page bg)
Sidebar:        #0A0A0D   (sidebar bg)
Surface:        #141417   (cards, chat area)
Surface High:   #1A1A1E   (raised elements, hover)
Surface Highest:#222226   (tags, input bg)
Border:         #262628   (all borders — subtle)
Border Subtle:  #1E1E22   (very subtle dividers)
Accent:         #9547f7   (primary purple)
Accent Light:   #c59aff   (text accent, brand)
Muted:          #64646E   (inactive nav items)
Text Primary:   #F0EDF1   (headings, body)
Text Secondary: #8E8E96   (descriptions)
Text Tertiary:  #5A5A62   (timestamps, labels)
Coral:          #ff8b9a   (ratings, warnings)
Success:        #34d399   (active badges)
```

### Typography
- **Body:** Inter 13px, weight 400-600
- **Labels:** Manrope 10px uppercase, tracking-widest, bold
- **Headings:** Inter 14-24px, weight 600-800
- **No decorative fonts** — keep it clean SaaS

### Component Patterns
- **Cards:** `bg-surface border border-border rounded-xl` with hover: `hover:border-accent/25 hover:shadow-lg hover:shadow-accent/5`
- **Buttons Primary:** `cta-gradient text-white font-semibold text-[13px] rounded-lg`
- **Buttons Ghost:** `bg-surface-highest border border-border text-muted hover:text-accent-light`
- **Tags/Pills:** `px-2.5 py-1 rounded-md bg-surface-highest text-[10px] font-label text-text-secondary border border-border`
- **Sidebar Nav Active:** `bg-accent/8 text-accent-light border-r-2 border-accent`
- **Sidebar Nav Inactive:** `text-muted hover:bg-surface-high hover:text-text-primary`
- **Inputs:** `bg-surface border border-border rounded-lg py-2 px-4 text-[13px] focus:ring-1 focus:ring-accent`

---

## 📄 All Screens to Build

### Screen 1: Age Gate (`/`)
**Purpose:** Legal 18+ verification before any content  
**Layout:** Full-screen overlay, dark bg with centered glass card  
**Elements:**
- Sanctuary logo + tagline
- "This platform contains AI-generated content intended for adults (18+)"
- Checkbox: "I confirm I am 18 years or older"
- "Enter Sanctuary" button (disabled until checked)
- Terms of Service link (opens modal)
- Store verification in localStorage (`sanctuary_age_verified: true`)
- If already verified, auto-redirect to `/discover`

---

### Screen 2: Discover Page (`/discover`)
**Reference:** `index.html` in repo  
**Layout:** Sidebar (240px) + Top bar (56px) + Hero banner + Filter sidebar + Character grid  
**Elements:**
- **Sidebar:** Logo, nav links (Discover=active, Library, Messages, Characters), Create Character CTA, social links
- **Top bar:** Search input, notification bell, settings gear, user avatar + name + tier badge
- **Hero banner:** 360px, featured character with gradient overlay, CTA buttons
- **Filter sidebar:** Category buttons (All, Cyberpunk, Historical, Fantasy, Slice of Life, Supernatural), Trait tags
- **Character grid:** 4-column responsive, each card has: image (h-56), view count badge, character name, description (2 lines), trait tags, star rating, chat button
- **Pagination:** "Load more" button or infinite scroll

**Data needed per character:**
```json
{
  "id": "uuid",
  "name": "Matthias Jeram",
  "tagline": "A brooding architect from the floating cities",
  "avatar_url": "/characters/matthias.jpg",
  "category": "cyberpunk",
  "traits": ["Romantic", "Male"],
  "rating": 4.9,
  "view_count": 24500,
  "is_premium": true,
  "is_nsfw": false,
  "creator_id": "uuid"
}
```

---

### Screen 3: Character Profile (`/character/[id]`)
**Purpose:** Full character details before starting chat  
**Layout:** Sidebar + Full-width  
**Elements:**
- Large hero image (full width, 400px, gradient overlay)
- Character name, tagline, creator name
- Trait badges, rating, interaction count, like count
- **Bio section** (long description)
- **Gallery** (grid of character images, blurred if NSFW + user hasn't enabled)
- "Start Chatting" primary CTA
- "Add to Library" secondary CTA
- Related characters grid (3-4 cards)
- If premium character + user is free tier → show upgrade prompt

---

### Screen 4: Chat Page (`/chat/[characterId]`)
**Reference:** `chat.html` in repo  
**Layout:** Sidebar + Top bar + Two-pane (Chat area + Character Profile aside)  
**Elements:**
- **Chat area (left, flex-1):**
  - Message list (scrollable): AI messages (left, gray bg), User messages (right, purple bg)
  - AI messages show character avatar, timestamp
  - Quote blocks in AI messages for dramatic text
  - Chat input bar at bottom: attach button, textarea, send button, mic button
- **Profile sidebar (right, 360px):**
  - Character portrait (400px, grayscale-to-color hover)
  - Name + "PRIMARY CONSTRUCT" label
  - Trait badges
  - Bio text
  - Stats: Interactions count, Affinity meter (progress bar)
  - Core Memory card (saved conversation highlights)
  - "Clear Memory" danger button

**AI Integration:**
- Use Gemini API with system prompt containing character personality
- System prompt template:
```
You are {character.name}. {character.bio}
Your traits are: {character.traits.join(', ')}.
You speak in a {character.speaking_style} manner.
Stay in character at all times. Never break character.
Never mention that you are an AI.
{if character.is_nsfw && user.nsfw_enabled}
You may engage in mature/adult themes when the user initiates.
{else}
Keep all responses safe for work. Avoid explicit content.
{/if}
```
- Store conversation history in database
- Load last 50 messages on page open
- Real-time message sending (optimistic UI)

---

### Screen 5: Library (`/library`)
**Purpose:** User's saved/favorited characters  
**Layout:** Sidebar + grid of saved characters  
**Elements:**
- Grid layout similar to Discover
- "Recently Chatted" section (last 5 characters)
- "Favorites" section (hearted characters)
- "Created by You" section (user-created characters)
- Empty states with CTA to discover

---

### Screen 6: Create Character (`/create`)
**Purpose:** Users can create their own AI characters  
**Layout:** Sidebar + multi-step form  
**Steps:**
1. **Basic Info:** Name, tagline, avatar upload
2. **Personality:** Bio (textarea), speaking style dropdown, traits (multi-select)
3. **Category:** Select from predefined categories
4. **Visibility:** Public / Private, NSFW toggle (with warning)
5. **Review:** Preview card + confirm

---

### Screen 7: Settings (`/settings`)
**Purpose:** User account + preferences  
**Layout:** Sidebar + tabbed settings  
**Tabs:**
- **Profile:** Name, email, avatar, bio
- **Subscription:** Current tier, upgrade/downgrade, billing history
- **Content:** NSFW toggle (master switch), blur intensity, content filters
- **Privacy:** Data export, account deletion
- **Notifications:** Email preferences

---

### Screen 8: Pricing (`/pricing`)
**Purpose:** Subscription tier comparison  
**Layout:** Full-width, 3-column pricing cards  
**Tiers:**

| | Basic | Premium | Collector |
|:--|:------|:--------|:----------|
| **Price** | ₹299/mo | ₹999/mo | ₹2,999/mo |
| **Characters** | 10 free characters | All characters | All + exclusive |
| **Messages** | 50/day | Unlimited | Unlimited |
| **NSFW** | ❌ | ✅ | ✅ |
| **Create Characters** | 2 | 10 | Unlimited |
| **Memory** | 7 days | 30 days | Forever |
| **Priority AI** | ❌ | ❌ | ✅ (Gemini Pro) |
| **Badge** | — | PRO MEMBER | COLLECTOR |

---

### Screen 9: Admin Dashboard (`/admin`)
**Reference:** `admin.html` in repo  
**Access:** Admin role only  
**Elements:**
- Stats cards (Revenue, Active Subs, Premium count, Churn)
- Subscriber table with filters (All/Active/Expired/Cancelled)
- Search, sort, pagination
- NSFW global toggle
- Character management (approve/reject user-created characters)

---

## 🔒 NSFW Content Architecture

### How it works (3-layer gate):

```
Layer 1: AGE GATE
├── User visits site → Must verify 18+ → Stored in localStorage
├── If not verified → Cannot access any content
│
Layer 2: USER SETTING
├── Default: NSFW = OFF (blur enabled)
├── User goes to Settings → Toggles NSFW ON
├── Requires Premium or Collector tier
├── Stored in user profile (database)
│
Layer 3: SERVER GATE
├── API checks: isAuthenticated + hasNSFWEnabled + hasPaidTier
├── If all true → Serve full images
├── If any false → Serve blurred/placeholder images
├── NSFW images stored in PRIVATE Supabase bucket
├── SFW images stored in PUBLIC Supabase bucket
```

### Implementation:
- **CSS blur:** `filter: blur(20px)` on NSFW images for non-enabled users
- **API middleware:** Check `user.nsfw_enabled && user.tier >= 'premium'` before serving NSFW content URLs
- **Character flag:** Each character has `is_nsfw: boolean`
- **Image flag:** Each image has `is_nsfw: boolean`
- **Settings UI:** Toggle with warning text: "Enable adult content. You must be 18+ and subscribed to Premium or higher."

---

## 🗄️ Database Schema (Supabase/PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'basic', 'premium', 'collector')),
  nsfw_enabled BOOLEAN DEFAULT false,
  age_verified BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'creator')),
  razorpay_customer_id TEXT,
  razorpay_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Characters
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  bio TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  category TEXT NOT NULL,
  traits TEXT[] DEFAULT '{}',
  speaking_style TEXT DEFAULT 'neutral',
  system_prompt TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_nsfw BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 0.0,
  view_count INTEGER DEFAULT 0,
  chat_count INTEGER DEFAULT 0,
  creator_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, character_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites
CREATE TABLE favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, character_id)
);

-- Character Images (gallery)
CREATE TABLE character_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_nsfw BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔌 API Routes (Next.js App Router)

```
GET    /api/characters              — List characters (with filters, pagination)
GET    /api/characters/[id]         — Get character details
POST   /api/characters              — Create character (auth required)
PUT    /api/characters/[id]         — Update character (owner/admin)
DELETE /api/characters/[id]         — Delete character (owner/admin)

GET    /api/conversations           — List user's conversations
GET    /api/conversations/[id]      — Get conversation messages
POST   /api/conversations/[id]/send — Send message + get AI response

POST   /api/auth/signup             — Email/password signup
POST   /api/auth/login              — Email/password login
GET    /api/auth/session            — Get current session

POST   /api/subscribe               — Create Razorpay subscription
POST   /api/webhook/razorpay        — Razorpay webhook handler
GET    /api/subscription/status     — Check subscription status

GET    /api/user/settings           — Get user settings
PUT    /api/user/settings           — Update settings (incl. NSFW toggle)
PUT    /api/user/profile            — Update profile

GET    /api/admin/subscribers       — List all subscribers (admin only)
GET    /api/admin/stats             — Revenue + user stats (admin only)
GET    /api/admin/characters        — Manage characters (admin only)
```

---

## 🤖 Devin Execution Instructions

### Step 1: Project Setup
```bash
npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs next-auth @google/generative-ai razorpay
```

### Step 2: Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<will-be-provided>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<will-be-provided>
SUPABASE_SERVICE_ROLE_KEY=<will-be-provided>
GOOGLE_GEMINI_API_KEY=<will-be-provided>
RAZORPAY_KEY_ID=<will-be-provided>
RAZORPAY_KEY_SECRET=<will-be-provided>
RAZORPAY_WEBHOOK_SECRET=<will-be-provided>
NEXTAUTH_SECRET=<generate-random>
NEXTAUTH_URL=http://localhost:3000
```

### Step 3: Build Order
1. Set up Tailwind config with the design system colors above
2. Create layout.tsx with sidebar + top bar (shared across all pages)
3. Build the age gate (root page `/`)
4. Build Discover page `/discover` with static data first
5. Build Chat page `/chat/[id]` with static data first
6. Build Character Profile `/character/[id]`
7. Build Library `/library`
8. Build Settings `/settings`
9. Build Pricing `/pricing`
10. Build Create Character `/create`
11. Build Admin `/admin`
12. Wire up Supabase (auth + database)
13. Wire up Gemini API for chat
14. Wire up Razorpay for subscriptions
15. Add NSFW gating middleware
16. Deploy to Vercel

### Step 4: Key Rules for Devin
- **DARK THEME ONLY** — No light mode. No toggle. Dark is the brand.
- **Use the exact color palette** from the design system above. Do NOT use default Tailwind colors.
- **Inter font only** for body/headings, Manrope for labels.
- **13px base font size** for body text. Keep everything tight and clean.
- **Reference the 3 HTML files** in the repo (index.html, chat.html, admin.html) for exact visual style.
- **Mobile responsive** — sidebar collapses to bottom nav on mobile.
- **All images use `next/image`** with proper alt text.
- **Loading states** — skeleton loaders for all data-fetching pages.
- **Error states** — graceful error handling with retry buttons.
- **TypeScript strict mode** — no `any` types.
- **Server components by default** — only use `"use client"` when needed.

---

## 📋 Devin Prompt (Copy-Paste This)

```
Build the Sanctuary platform — an AI character persona web app (like SpicyChat.ai).

REPO: https://github.com/ramlimicheal/sutralife
READ THE PRD.md FILE IN THE REPO FOR COMPLETE SPECIFICATIONS.

The repo contains:
1. PRD.md — Full product requirements (screens, API, database, design system)
2. index.html — Reference UI for the Discover page
3. chat.html — Reference UI for the Chat page
4. admin.html — Reference UI for the Admin dashboard

TECH STACK: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase + Gemini AI + Razorpay

BUILD ORDER:
1. Initialize Next.js project with Tailwind
2. Configure design system (dark theme colors from PRD.md)
3. Build shared layout (sidebar + top bar)
4. Build all 9 screens as specified in PRD.md
5. Wire up Supabase for auth + database
6. Wire up Gemini API for AI chat
7. Wire up Razorpay for subscriptions
8. Implement NSFW content gating (3-layer system in PRD.md)
9. Deploy to Vercel

CRITICAL RULES:
- DARK THEME ONLY (colors specified in PRD.md)
- Match the visual style of the 3 reference HTML files exactly
- Inter font for body, Manrope for labels
- 13px body text, clean SaaS aesthetic
- TypeScript strict, no "any" types
- Mobile responsive (sidebar → bottom nav)
- Server components by default

Leave .env.local values as placeholders — I will fill them in.
```

---

*Built by ANTIGRAVITY for THE LEGEND. Sanctuary v1.0. March 2026.*
