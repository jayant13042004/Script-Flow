import React from 'react';
import { Link } from 'react-router';
import { PenLine, FileCheck, Scale, CheckCircle } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export default function TermsPage() {
  useSEO({
    title: 'Terms of Service | ScriptFlow',
    description: 'ScriptFlow terms of service. You retain 100% intellectual property ownership and copyright over your scripts and video production plans.',
    keywords: 'scriptflow terms, creator copyright, script ownership terms',
  });
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
            <Link to="/privacy" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Privacy Policy
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-3">
            <Scale className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Terms of Service
          </h1>
          <p className="text-xs text-gray-400">
            Effective date: August 17, 2026
          </p>
        </div>

        <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-6 text-gray-700 font-serif">
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-sans text-gray-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the ScriptFlow application ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-sans text-gray-900">2. Intellectual Property & Ownership</h2>
            <p>
              <strong>Your Content:</strong> You retain complete, unrestricted ownership of all scripts, production plans, transcripts, and voice notes you create within ScriptFlow. ScriptFlow claims zero copyright or proprietary rights over your intellectual property.
            </p>
            <p>
              <strong>Platform IP:</strong> ScriptFlow, including its UI, logos, proprietary rule-based analyzer algorithms, and software code, is the property of ScriptFlow.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-sans text-gray-900">3. Permitted Use & Code of Conduct</h2>
            <p>
              You agree not to use the Service for any unlawful purpose or to generate content that violates third-party rights, promotes violence, or engages in malicious automated attacks on our systems.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-sans text-gray-900">4. AI-Generated Suggestions</h2>
            <p>
              ScriptFlow provides AI-assisted suggestions (e.g. hook generation, text shortening, script structuring). AI outputs are provided "as is". You are solely responsible for reviewing, editing, and fact-checking any AI-assisted suggestions before publishing your content.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-sans text-gray-900">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, ScriptFlow shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the Service or any loss of video project files.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-sans text-gray-900">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms as our startup scales. Notice of significant changes will be communicated via the application or website.
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
