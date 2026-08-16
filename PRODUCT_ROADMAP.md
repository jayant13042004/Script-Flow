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

## 3. 🎙️ Voice Mode Dictation & AI Structuring
- [x] Real-time speech-to-text dictation via Web Speech API
- [x] Live visual recording button & transcript view
- [x] 1-Click AI Structuring engine converting raw rambling speech into clean, formatted video scripts (Hook, Core Points, Visual Notes, CTA)
- [x] Direct insertion into TipTap editor

---

## 4. 📺 Creator Teleprompter Studio
- [x] Fullscreen dark mode teleprompter interface (`TeleprompterModal.tsx`)
- [x] Smooth auto-scroll engine (`requestAnimationFrame`) synced to WPM delivery (60–300 WPM)
- [x] Keyboard shortcuts (Spacebar play/pause, Up/Down arrow speed adjust, Esc exit)
- [x] Horizontal (`scaleX(-1)`) & Vertical (`scaleY(-1)`) mirror flipping for physical teleprompter glass rigs
- [x] Center reading focus guide line highlight
- [x] Font size slider (24px to 72px) & Font family toggle (Sans / Serif / Mono)

---

## 5. 🎙️ In-Browser Audio Reader & Voice Recorder
- [x] MediaRecorder API microphone voice recorder (`AudioRecorder.tsx`)
- [x] Live recording timer and pulse animation
- [x] Audio playback player & `.webm` clip downloading for line readings

---

## 6. 📄 Export & Import Suite
- [x] Export to PDF format (`exportToPdf`)
- [x] Export to Markdown (`.md`) format (`exportToMarkdown`)
- [x] Export to Microsoft Word (`.doc`) format (`exportToWordHtml`)
- [x] Export to Plain Text (`.txt`) format (`exportToTxt`)
- [x] Export to Teleprompter Text format (`exportToTeleprompterTxt`)
- [x] Import drag-and-drop file reader (`ImportModal.tsx`) for `.txt`, `.md`, `.doc` text extraction

---

## 7. 🔗 Public Share Links & View Mode
- [x] Share token generator modal (`ShareModal.tsx`)
- [x] Public read-only route (`/share/:token`)
- [x] Shared Script viewer with creator metrics, copy button, PDF/TXT export, and branding banner (`SharedScriptPage.tsx`)

---

## 8. 🏷️ Script Status Workflow & Creator Analytics
- [x] Script production status tags (📝 Draft, 🎬 In Production, 🎥 Filmed, 🚀 Published) (`ScriptStatusBadge.tsx`)
- [x] Status tag selector dropdown in Editor header
- [x] Creator Analytics Widget (`AnalyticsWidget.tsx`) in Dashboard: Total Scripts, Total Words, Total Video Production Hours, Completed Count, Platform Breakdown, Writing Habit Streaks

---

## 9. 📱 Mobile & PWA Optimization
- [x] Web App Manifest (`public/manifest.json`) for "Add to Home Screen" on iPad, Mac, Windows, Android, and iOS
- [x] PWA theme meta tags & mobile status bar configuration (`index.html`)

---

## 10. 🔐 Authentication & Security
- [x] Supabase Auth SDK integration
- [x] Email & Password sign-up and login flow
- [x] Google OAuth 2.0 ("Sign in with Google") integration
- [x] OAuth redirect callback page (`AuthCallbackPage.tsx`)
- [x] User display name & Google profile picture avatar sync in UI
- [x] Protected routes (`ProtectedRoute`, `AuthRedirect`)

---

## 11. ☁️ Database & Cloud Storage
- [x] Supabase PostgreSQL schema (`supabase/schema.sql`)
- [x] Row Level Security (RLS) policies for user data isolation
- [x] Cloud storage service (`SupabaseStorageService`)
- [x] Sync scripts, folders, version history, custom hooks, and favorites to cloud
- [x] Automatic zero-config LocalStorage fallback for offline mode

---

## 12. 🤖 Gemini AI Suite
- [x] Integration of Google Gemini API (`gemini-3.6-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-pro`)
- [x] Bulletproof `safeParseJSON` utility for markdown stripping & quote escaping
- [x] Non-destructive right-side AI assistant panel (`AiPanel.tsx`)
- [x] 15+ Inline text improvers (Shorten, Clarify, Make Conversational, Hook Boost, Add CTA, Change Tone, Fix Grammar)
- [x] AI Script Generator modal (`AiGenerateForm.tsx`)
- [x] Dynamic AI provider factory (Gemini / Mock fallback)

---

## 13. 💳 Monetization & Business Engine (Pending)
- [ ] Connect Stripe / Razorpay billing engine
- [ ] Free Tier limits (e.g. 3 scripts, 10 AI generations/month)
- [ ] Pro Tier subscription ($12–$19/month) with unlimited AI & cloud sync
- [ ] Usage quota tracking modal & upgrade banner

---

## 14. 👥 Teamwork & Collaboration (Pending)
- [ ] Commenting & feedback threads on script lines
- [ ] Shared team workspace folders
