import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  PenLine, Sparkles, Lightbulb, BarChart3, Clapperboard,
  Layout, RefreshCw, ArrowRight, Check, ChevronRight,
  FileText, Zap, Shield
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const features = [
  {
    icon: PenLine,
    title: 'Write manually',
    description: 'A premium rich-text editor built for scriptwriting. Bold, italic, headings, lists, highlights — everything you need for a distraction-free writing experience.',
  },
  {
    icon: Sparkles,
    title: 'AI assistance',
    description: 'Select any text and improve it with AI. Make it shorter, clearer, more conversational, or more engaging. Generate full scripts from a topic.',
  },
  {
    icon: Lightbulb,
    title: 'Hook library',
    description: '50+ proven hooks across 12 categories. Curiosity, contrarian, story, data-driven — find the perfect opening for your content.',
  },
  {
    icon: BarChart3,
    title: 'Script analysis',
    description: 'Get an objective score on hook strength, readability, pacing, clarity, and CTA. Transparent, rule-based analysis with actionable feedback.',
  },
  {
    icon: Clapperboard,
    title: 'Production planning',
    description: 'Plan your B-roll, on-screen text, and visual cues alongside your script. Bridge the gap between writing and production.',
  },
  {
    icon: Layout,
    title: 'Script frameworks',
    description: 'Structure your content with proven frameworks like Hook → Problem → Solution → CTA. Or create your own custom structure.',
  },
  {
    icon: RefreshCw,
    title: 'Repurposing',
    description: 'Transform your script into YouTube Shorts, X threads, LinkedIn posts, Instagram carousels, and more with one click.',
  },
];

const benefits = [
  'Rich-text editor with keyboard shortcuts',
  'Works completely without AI',
  'Autosave with version history',
  'Script analysis with actionable scores',
  '50+ built-in hooks for content creators',
  'Production planning with B-roll notes',
  'Multiple script frameworks',
  'Repurpose to any platform',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-gray-900 hover:text-gray-700 transition-colors">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <PenLine className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">ScriptFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/about"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
            >
              About
            </Link>
            <Link
              to="/blog"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
            >
              Blog
            </Link>
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Log in
                </Link>
                <button
                  onClick={handleCTA}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Start Writing
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6 text-balance">
            Write better scripts.{' '}
            <span className="text-gray-400">Create faster.</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10 text-balance">
            A professional script-writing studio where you can write completely
            on your own — or use AI whenever you need it.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleCTA}
              className="group px-7 py-3.5 text-base font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 active:scale-[0.98]"
            >
              Start Writing
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <span className="text-sm text-gray-400">Free to use · No credit card required</span>
          </div>
        </div>
      </section>

      {/* Editor Preview */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-gray-200 shadow-xl overflow-hidden bg-white">
            {/* Fake title bar */}
            <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              </div>
              <div className="flex-1 text-center text-xs text-gray-400 font-medium">ScriptFlow Editor</div>
            </div>
            {/* Fake editor content */}
            <div className="p-8 sm:p-12">
              <div className="max-w-lg mx-auto">
                <div className="mb-6">
                  <div className="text-2xl font-semibold text-gray-900 mb-1">My YouTube Script</div>
                  <div className="text-xs text-gray-400">324 words · 2m 10s speaking time</div>
                </div>
                <div className="space-y-4 font-serif text-lg leading-relaxed text-gray-700">
                  <p>
                    <span className="font-bold text-gray-900">What if everything you know about productivity is wrong?</span>
                  </p>
                  <p>
                    Most people think being productive means doing more. But the most successful creators I know
                    actually do <span className="bg-yellow-100 px-0.5 rounded">less</span>.
                  </p>
                  <p>
                    Here's the thing — your brain isn't designed for 8 hours of deep work. It's designed for
                    <em> focused bursts</em> followed by real rest...
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center gap-3">
                  <div className="flex gap-1">
                    {['B', 'I', 'U', 'H₁', 'H₂'].map((btn) => (
                      <div key={btn} className="w-7 h-7 rounded flex items-center justify-center text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200">
                        {btn}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1"></div>
                  <div className="text-xs text-gray-300">Saved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core value proposition */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
              Write your way. Improve it with AI.
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              ScriptFlow is built for creators who take their scripts seriously.
              Every feature works without AI — use it only when you want to.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-900 transition-colors duration-200">
                  <feature.icon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits list */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
              Built for serious creators
            </h2>
            <p className="text-lg text-gray-500">
              Everything you need to write, improve, and produce better content.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 p-3">
                <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
            Start writing better scripts today
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            No setup required. Open the editor and start creating.
          </p>
          <button
            onClick={handleCTA}
            className="group px-7 py-3.5 text-base font-medium text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center gap-2 mx-auto active:scale-[0.98]"
          >
            Start Writing — It's Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <PenLine className="w-4 h-4 text-white" />
              </div>
              <span>ScriptFlow</span>
            </div>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              The professional scriptwriting studio for YouTube creators, podcasters, and video storytellers. Write naturally, refine with AI, and produce faster.
            </p>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} ScriptFlow Inc. All rights reserved.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li><button onClick={handleCTA} className="hover:text-gray-900 text-left">Writing Studio</button></li>
              <li><button onClick={handleCTA} className="hover:text-gray-900 text-left">Voice Mode Dictation</button></li>
              <li><button onClick={handleCTA} className="hover:text-gray-900 text-left">Teleprompter Glass Mode</button></li>
              <li><button onClick={handleCTA} className="hover:text-gray-900 text-left">Hook Library</button></li>
              <li><button onClick={handleCTA} className="hover:text-gray-900 text-left">Script Analyzer</button></li>
            </ul>
          </div>

          {/* Resources & Content */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li><Link to="/blog" className="hover:text-gray-900">Creator Publication</Link></li>
              <li><Link to="/blog/3-second-hook-formula-youtube-shorts" className="hover:text-gray-900">3-Second Hook Guide</Link></li>
              <li><Link to="/blog/structure-10-minute-video-high-retention" className="hover:text-gray-900">Retention Frameworks</Link></li>
              <li><Link to="/blog/ai-scriptwriting-without-losing-your-voice" className="hover:text-gray-900">Human-First AI</Link></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Company & Legal</h4>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li><Link to="/about" className="hover:text-gray-900">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-gray-900">Contact & Support</Link></li>
              <li><Link to="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-gray-900">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
