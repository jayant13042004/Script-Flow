import React from 'react';
import { Link } from 'react-router';
import { PenLine, Sparkles, Target, Users, Zap, Heart, ArrowRight } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export default function AboutPage() {
  useSEO({
    title: 'About ScriptFlow — The Studio for Content Creators',
    description: 'Learn why we built ScriptFlow. Our mission is to empower YouTube creators and storytellers with human-first scriptwriting and surgical AI assistance.',
    keywords: 'about scriptflow, script writing software, creator tools startup, youtube video script software',
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      'name': 'About ScriptFlow',
      'description': 'ScriptFlow mission and company background for creator tooling.',
      'publisher': {
        '@type': 'Organization',
        'name': 'ScriptFlow',
        'url': 'https://scriptflow.app'
      }
    }
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
            <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Blog
            </Link>
            <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Contact
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

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Our Mission & Story
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
            We are building the studio we wished existed for video scriptwriting.
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            ScriptFlow was created to eliminate the friction between having a great idea and delivering an unforgettable, high-retention video.
          </p>
        </section>

        {/* Why We Built ScriptFlow */}
        <section className="py-16 px-6 bg-gray-50 border-y border-gray-100">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Human-First Writing</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Generic AI text generators make content sound soulless. ScriptFlow is built around your authentic voice, giving you tools to craft real stories first.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Surgical AI Precision</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Use AI when and where you need it: punchier hooks, filler word removal, pacing analysis, and instant repurposing into 5 social formats.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Built for Creators</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                From built-in teleprompter glass mirroring to B-roll planning and voice recording, every tool is designed specifically for video producers.
              </p>
            </div>
          </div>
        </section>

        {/* Founder Story Section */}
        <section className="py-20 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            The Philosophy: Less Noise, More Substance
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed font-serif text-base sm:text-lg">
            <p>
              Most writing tools are designed either for novelists or for corporate teams writing memos. When creators sit down to script a YouTube video or TikTok, they end up juggling messy Google Docs, separate teleprompter apps, timer calculators, and AI windows.
            </p>
            <p>
              We built ScriptFlow to bring the entire creative workflow into one focused, distraction-free environment.
            </p>
            <p>
              Whether you are a solo creator filming in your bedroom or a full-scale media team producing weekly episodes, ScriptFlow is designed to scale with your ambition.
            </p>
          </div>

          <div className="mt-12 p-6 bg-gray-900 text-white rounded-2xl flex items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold">Ready to write your next video?</h3>
              <p className="text-sm text-gray-400">Join creators producing with ScriptFlow today.</p>
            </div>
            <Link
              to="/signup"
              className="px-5 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              Start Free
            </Link>
          </div>
        </section>
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
