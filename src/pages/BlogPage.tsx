import React, { useState } from 'react';
import { Link } from 'react-router';
import { PenLine, Sparkles, BookOpen, Clock, Tag, ArrowRight } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import { useSEO } from '../hooks/useSEO';

export default function BlogPage() {
  useSEO({
    title: 'Creator Publication & Scriptwriting Guides | ScriptFlow',
    description: 'Tactical guides, hook formulas, YouTube retention masterclasses, and AI workflow blueprints for serious content creators.',
    keywords: 'youtube scriptwriting guide, viral hook formulas, video retention framework, shorts scriptwriting, creator publication',
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      'name': 'The ScriptFlow Publication',
      'description': 'Tactical guides on high-retention scriptwriting, hook psychology, and creator workflows.',
      'url': 'https://scriptflow.app/blog',
      'publisher': {
        '@type': 'Organization',
        'name': 'ScriptFlow',
        'url': 'https://scriptflow.app'
      }
    }
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'YouTube Strategy', 'Retention & Growth', 'AI & Workflow'];

  const filteredPosts = selectedCategory === 'All'
    ? blogPosts
    : blogPosts.filter(p => p.category === selectedCategory);

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
            <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              About
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

      {/* Main Blog Header */}
      <main className="flex-1 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Creator Guides & Insights
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              The ScriptFlow Publication
            </h1>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
              Tactical guides on high-retention scriptwriting, hook psychology, pacing frameworks, and creator workflows.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group flex flex-col bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg rounded-2xl p-6 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-md">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-6 flex-1">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-400">
                  <span className="font-medium text-gray-700">{post.author}</span>
                  <span className="flex items-center gap-1 text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                    Read guide <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
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
