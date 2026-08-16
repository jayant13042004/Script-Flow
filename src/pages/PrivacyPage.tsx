import React from 'react';
import { Link } from 'react-router';
import { PenLine, Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <PenLine className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">ScriptFlow</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Terms of Service
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16 px-6 max-w-3xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full mb-3">
            <Shield className="w-3.5 h-3.5" />
            Privacy & Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-400">
            Last updated: August 17, 2026
          </p>
        </div>

        <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-6 text-gray-700 font-serif">
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-sans text-gray-900">1. Overview & Our Commitment</h2>
            <p>
              At ScriptFlow, we believe creators deserve uncompromising privacy. This Privacy Policy outlines how your personal information, scripts, audio recordings, and telemetry data are collected, protected, and handled when you use ScriptFlow.
            </p>
            <p>
              <strong>Core Promise:</strong> You own 100% of the scripts, voice recordings, and creative content you produce in ScriptFlow. We do not sell your personal data or your scripts to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-sans text-gray-900">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account Information:</strong> When you register via email or Google OAuth 2.0, we collect your email address, display name, and avatar profile picture provided by Google.
              </li>
              <li>
                <strong>Script & Creator Content:</strong> Scripts, folders, version history, custom hooks, and production notes stored in your account.
              </li>
              <li>
                <strong>AI Interaction Data:</strong> When you trigger an AI text improvement or generation, the selected script text and instructions are securely transmitted to the underlying LLM provider (Google Gemini API) to generate the response.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-sans text-gray-900">3. AI Data Handling & Model Training</h2>
            <p>
              We prioritize data integrity. Enterprise API integrations with Google Gemini do not use your private script prompts or video concepts to train general foundation models. Your creative ideas remain confidential.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-sans text-gray-900">4. Data Storage & Security</h2>
            <p>
              Your data is encrypted in transit (TLS 1.3) and stored in secure PostgreSQL database clusters hosted on Supabase with strict Row-Level Security (RLS) policies ensuring only authenticated user accounts can access their own private scripts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-sans text-gray-900">5. Public Sharing Links</h2>
            <p>
              If you explicitly enable "Public Share Link" on a script, anyone with the unique secret URL can read that script in a view-only mode. You can revoke access at any time with a single click.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-sans text-gray-900">6. User Rights & Account Deletion</h2>
            <p>
              You have the right to export all your scripts (via PDF, Markdown, Word, TXT) or delete your account and associated data at any time. For questions regarding your personal data, contact us at <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">support@scriptflow.app</code>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <PenLine className="w-4 h-4 text-gray-400" />
            <span>© {new Date().getFullYear()} ScriptFlow. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/about" className="hover:text-gray-900">About</Link>
            <Link to="/blog" className="hover:text-gray-900">Blog</Link>
            <Link to="/contact" className="hover:text-gray-900">Contact</Link>
            <Link to="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-900">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
