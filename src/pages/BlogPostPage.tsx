import React from 'react';
import { useParams, Link, Navigate } from 'react-router';
import { PenLine, ArrowLeft, Clock, Calendar, User, Tag, Sparkles, Share2 } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

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
              All Articles
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
            >
              Start Writing
            </Link>
          </div>
        </div>
      </header>

      {/* Main Article */}
      <main className="flex-1 py-12 px-6">
        <article className="max-w-3xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Publication
          </Link>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md">
                {post.category}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {post.readTime}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center justify-between pt-4 border-t border-b border-gray-100 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                  {post.author[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{post.author}</p>
                  <p className="text-xs text-gray-500">{post.authorRole} · {post.date}</p>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                title="Share article link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Article Body */}
          <div className="font-serif text-base sm:text-lg leading-relaxed text-gray-800 space-y-6 max-w-none">
            {post.content.split('\n\n').map((block, idx) => {
              const trimmed = block.trim();
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-xl sm:text-2xl font-sans font-bold text-gray-900 mt-8 mb-3">
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('#### ')) {
                return (
                  <h4 key={idx} className="text-lg font-sans font-bold text-gray-900 mt-6 mb-2">
                    {trimmed.replace('#### ', '')}
                  </h4>
                );
              }
              if (trimmed === '---') {
                return <hr key={idx} className="my-8 border-gray-200" />;
              }
              if (trimmed.startsWith('```')) {
                return (
                  <pre key={idx} className="p-4 bg-gray-900 text-gray-100 rounded-xl text-xs sm:text-sm font-mono overflow-x-auto my-6">
                    {trimmed.replace(/```/g, '')}
                  </pre>
                );
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('1. ')) {
                return (
                  <div key={idx} className="pl-4 border-l-2 border-blue-500 py-1 text-gray-700 my-4 text-sm sm:text-base">
                    {trimmed}
                  </div>
                );
              }
              return (
                <p key={idx} className="leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Call to Action Card at bottom of article */}
          <div className="mt-16 p-8 bg-gradient-to-br from-gray-900 to-slate-900 text-white rounded-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Write with ScriptFlow
            </div>
            <h3 className="text-2xl font-bold">Put these scriptwriting frameworks into action</h3>
            <p className="text-sm text-gray-300 leading-relaxed max-w-xl">
              Access the Hook Library, rule-based Script Analyzer, B-Roll Planner, and Teleprompter right inside ScriptFlow.
            </p>
            <Link
              to="/signup"
              className="inline-block px-6 py-3 bg-white text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Start Free Scriptwriting Studio →
            </Link>
          </div>
        </article>
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
