# 🗺️ ScriptFlow — Product Roadmap & Feature Master Tracker

Legend:
- `[x]` **Completed & Live in Codebase**
- `[ ]` **Planned / In Backlog**

---

## 1. 🏗️ Foundation & Infrastructure
- [x] Scaffold Vite + React 19 + TypeScript + Tailwind CSS v4 environment
- [x] Configure Google Fonts (Inter + Lora) & typography tokens
- [x] Set up Zustand state stores (`authStore`, `scriptStore`, `editorStore`, `hookStore`, `uiStore`)
- [x] Configure environment variables (`.env`, `.env.example`)
- [x] Initialize Git repository & push to GitHub (`https://github.com/jayant13042004/Script-Flow.git`)

---

## 2. ✍️ Core Writing Studio & TipTap Editor
- [x] TipTap rich-text editor integration
- [x] Custom formatting toolbar (Bold, Italic, Underline, Headings H1-H3, Lists, Highlight, Align)
- [x] Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+S, Ctrl+F, Escape)
- [x] Real-time creator metrics (Word count, character count, estimated speaking duration @ 150 WPM)
- [x] Find & Replace search bar with live match highlighting
- [x] Auto-save engine with debounce
- [x] Version history snapshots (auto-saved every 5 updates)
- [x] Fullscreen distraction-free writing mode

---

## 3. 🔐 Authentication & Security
- [x] Supabase Auth SDK integration
- [x] Email & Password sign-up and login flow
- [x] Google OAuth 2.0 ("Sign in with Google") integration
- [x] OAuth redirect callback page (`AuthCallbackPage.tsx`)
- [x] User display name & Google profile picture avatar sync in UI
- [x] Protected routes (`ProtectedRoute`, `AuthRedirect`)
- [x] Instant sign-up mode (email confirmation optional)

---

## 4. ☁️ Database & Cloud Storage
- [x] Supabase PostgreSQL schema (`supabase/schema.sql`)
- [x] Row Level Security (RLS) policies for user data isolation
- [x] Cloud storage service (`SupabaseStorageService`)
- [x] Sync scripts, folders, version history, custom hooks, and favorites to cloud
- [x] Automatic zero-config LocalStorage fallback for offline mode

---

## 5. 🤖 Gemini AI Suite
- [x] Integration of Google Gemini API (`gemini-3.6-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-pro`)
- [x] Bulletproof `safeParseJSON` utility for markdown stripping & quote escaping
- [x] Non-destructive right-side AI assistant panel (`AiPanel.tsx`)
- [x] 15+ Inline text improvers (Shorten, Clarify, Make Conversational, Hook Boost, Add CTA, Change Tone, Fix Grammar)
- [x] AI Script Generator modal (`AiGenerateForm.tsx`)
- [x] Dynamic AI provider factory (Gemini / Mock fallback)

---

## 6. 🧰 Creator Toolkit & Productivity
- [x] 60+ Viral hook library across 12 categories (`HookLibrary.tsx`)
- [x] Custom hook creator modal
- [x] Hook favoriting & category filter system
- [x] Transparent rule-based 100-point Script Analyzer (`ScriptAnalyzer.tsx`)
- [x] Drag-and-drop B-Roll & Production Planner (`ProductionPlanner.tsx`)
- [x] Script Structure Frameworks (Hook → Problem → Solution → CTA, AIDA, PAS) (`ScriptStructure.tsx`)
- [x] Multi-platform 1-click repurposer (Shorts, Reels, TikTok, X Threads, LinkedIn, Newsletter) (`RepurposePanel.tsx`)
- [x] Landing page with hero, features grid, benefits list, and editor preview (`LandingPage.tsx`)
- [x] Dashboard with script search, folder management, grid cards, duplicate & delete (`DashboardPage.tsx`)

---

## 7. 📄 Export & Import Capabilities (Pending)
- [ ] Export script to PDF format
- [ ] Export script to Markdown (`.md`) format
- [ ] Export script to Microsoft Word (`.docx`) format
- [ ] Export script to Plain Text (`.txt`) format
- [ ] Export script to Final Draft format (`.fdx`)
- [ ] Import `.docx` or `.txt` files directly into editor

---

## 8. 📺 Presentation & Performance Tools (Pending)
- [ ] Fullscreen scrolling Teleprompter Mode
- [ ] Adjustable teleprompter scrolling speed (WPM control)
- [ ] Text size & text mirroring controls (for physical teleprompter glass)
- [ ] In-browser audio voice recorder for line readings
- [ ] Audio playback & waveform preview

---

## 9. 💳 Monetization & Business Engine (Pending)
- [ ] Connect Stripe / Razorpay billing engine
- [ ] Free Tier limits (e.g. 3 scripts, 10 AI generations/month)
- [ ] Pro Tier subscription ($12–$19/month) with unlimited AI & cloud sync
- [ ] Usage quota tracking modal & upgrade banner

---

## 10. 👥 Teamwork & Collaboration (Pending)
- [ ] Generate secret public read-only share link for clients/editors
- [ ] Commenting & feedback threads on script lines
- [ ] Shared team workspace folders

---

## 11. 📊 Creator Analytics (Pending)
- [ ] Writing habit heatmaps & weekly word count graphs
- [ ] Script library status tags (Draft, In Production, Filmed, Published)

---

## 12. 📱 Mobile & Tablet Optimization (Pending)
- [ ] Progressive Web App (PWA) manifest for home screen install
- [ ] Tablet touch controls optimization for iPad script writing
