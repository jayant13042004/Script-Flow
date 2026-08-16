# 📜 ScriptFlow — Founder's Build Log & Journey

> **Product Vision**: *Write your way. Improve it with AI. Create faster.*  
> ScriptFlow is a professional script-writing studio designed for content creators. It provides an elite writing workspace that is 100% valuable on its own, enhanced with non-destructive AI capabilities.

---

## 📅 Milestone History

### Milestone 1: Project Initialization & Architectural Design
- **Core Stack Selected**: React 19, Vite, TypeScript, Tailwind CSS v4, Zustand for state management, TipTap for rich-text editing, Supabase for authentication & database, and Google Gemini API for AI.
- **Design Tokens**: Established modern, minimal, light-theme design system using Inter + Lora Google Fonts, CSS variables, and fluid typography.
- **Repository Setup**: Initialized Git repository and configured `.gitignore` for security.

### Milestone 2: Core Writing Studio (TipTap Engine)
- **Rich-Text Editor**: Implemented TipTap editor supporting Headings (H1–H3), Bold, Italic, Underline, Highlight, Lists, and Text Alignment.
- **Formatting Toolbar**: Created sticky formatting bar with active state indicators and keyboard shortcuts.
- **Real-Time Creator Metrics**: Live word count, character count, and estimated speaking duration based on 150 WPM average delivery.
- **Find & Replace**: Built-in search and replacement panel with real-time highlight matching.
- **Auto-Save & Version Control**: Auto-saving engine with snapshot version history created every 5 saves.

### Milestone 3: Creator Productivity Modules
- **Hook Library**: Created 60+ viral script hooks across 12 categories (Curiosity, Contrarian, Story, Data, Fear, Authority, Question, Myth-Busting, Challenge, Surprise, Emotional, Custom). Added custom hook builder and favoriting system.
- **Rule-Based Script Analyzer**: Built a transparent 100-point script scoring engine evaluating Hook Strength, Readability, Pacing, Clarity (filler word detection), Repetition, Structure, CTA Strength, and Audience Engagement.
- **Production & B-Roll Planner**: Drag-and-drop shot builder pairing voiceover audio with visual cues, on-screen text overlays, and shot timers.
- **Script Frameworks**: Pre-built script structure templates (e.g. *Hook → Problem → Solution → CTA*, *AIDA*, *PAS*) with custom drag-and-drop section builder.
- **Multi-Platform Repurposing**: 1-click converter transforming 1 master script into YouTube Shorts, Instagram Reels, TikToks, X Threads, LinkedIn Posts, and Newsletters.

### Milestone 4: Gemini AI Integration (Integration Guide Standard)
- **Model Hierarchy**: Configured production Gemini model fallback chain: `gemini-3.6-flash` (Primary), `gemini-3.5-flash-lite`, `gemini-3.1-pro`.
- **Bulletproof JSON Parsing**: Implemented `safeParseJSON` utility to strip markdown fences, isolate JSON boundaries, and handle quote escaping fallbacks.
- **Inline AI Actions**: 15+ non-destructive text improvement options (Shorten, Clarify, Make Conversational, Enhance Hook, Add CTA, Change Tone, Fix Grammar).
- **AI Generator Modal**: Context-aware script creation modal taking topic, tone, platform, and language inputs.

### Milestone 5: Authentication & User System
- **Supabase Auth Integration**: Rewrote authentication flow to handle both **Email / Password** and **Google OAuth 2.0 ("Sign in with Google")**.
- **OAuth Callback & Routing**: Built `AuthCallbackPage` handling OAuth redirect tokens, session management, and route protection.
- **Profile Metadata & Avatar**: Automatic syncing of user display name and Google profile picture into UI header and dashboard.

### Milestone 6: Cloud Data Architecture & Postgres Migration
- **Supabase Database Schema**: Designed complete PostgreSQL schema in `supabase/schema.sql` with Row-Level Security (RLS) policies for `profiles`, `folders`, `scripts`, `script_versions`, `custom_hooks`, and `hook_favorites`.
- **SupabaseStorageService**: Implemented `SupabaseStorageService` mapping DB tables to TypeScript domains.
- **Async Store Layer**: Updated `scriptStore` and `hookStore` to handle async cloud operations with automatic zero-config LocalStorage fallback.

---

## 🛠️ Tech Stack & Key Files Reference

| Subsystem | Technologies / Key Files |
|---|---|
| **Frontend Framework** | React 19, Vite, TypeScript |
| **Styling** | Tailwind CSS v4, Inter & Lora Google Fonts (`src/index.css`) |
| **Rich Text Editor** | `@tiptap/react`, `@tiptap/starter-kit` (`src/components/editor/ScriptEditor.tsx`) |
| **State Management** | Zustand (`src/stores/authStore.ts`, `scriptStore.ts`, `editorStore.ts`, `hookStore.ts`, `uiStore.ts`) |
| **Authentication** | Supabase Auth, Google OAuth 2.0 (`src/services/supabase/auth.ts`, `src/pages/AuthCallbackPage.tsx`) |
| **Database & Cloud Storage** | Supabase Postgres, RLS (`supabase/schema.sql`, `src/services/supabase/storageService.ts`) |
| **AI Provider** | Google Gemini API (`src/services/ai/geminiAiService.ts`) |
| **GitHub Repo** | `https://github.com/jayant13042004/Script-Flow.git` |
