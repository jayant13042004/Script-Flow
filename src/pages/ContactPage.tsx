import React, { useState } from 'react';
import { Link } from 'react-router';
import { PenLine, Mail, MessageSquare, HelpCircle, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { Button, Input, Textarea } from '../components/ui';
import { useSEO } from '../hooks/useSEO';

export default function ContactPage() {
  useSEO({
    title: 'Contact Support & Founders | ScriptFlow',
    description: 'Get in touch with the ScriptFlow creator team for support, feature requests, creator partnerships, and feedback.',
    keywords: 'contact scriptflow, scriptflow support, creator partnerships, youtube tooling support',
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      'name': 'Contact ScriptFlow',
      'description': 'Customer support and creator contact channels for ScriptFlow.'
    }
  });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsLoading(true);
    // Simulate instant sending
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 800);
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
            <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              About
            </Link>
            <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Blog
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
      <main className="flex-1 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full mb-4">
              <MessageSquare className="w-3.5 h-3.5" />
              We'd Love to Hear From You
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
              Get in touch with the ScriptFlow team
            </h1>
            <p className="text-base text-gray-500 max-w-xl mx-auto">
              Have questions, feedback, feature requests, or partnership inquiries? Send us a message below and we will get back to you shortly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Details Card */}
            <div className="md:col-span-1 space-y-6">
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Direct Support</h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  For account inquiries, bug reports, and founder questions:
                </p>
                <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs font-mono text-gray-800 break-all">
                  support@scriptflow.app
                </div>
              </div>

              <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Frequently Asked</h3>
                <div className="space-y-3 mt-3 text-xs text-gray-600">
                  <p>
                    <strong className="text-gray-900">Is ScriptFlow free?</strong><br />
                    Yes! You can start writing scripts and using core features completely free.
                  </p>
                  <p>
                    <strong className="text-gray-900">Who owns my scripts?</strong><br />
                    You own 100% of your scripts and content. We never train public AI models on private scripts.
                  </p>
                </div>
              </div>
            </div>

            {/* Message Form */}
            <div className="md:col-span-2">
              <div className="p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Message Received!</h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      Thank you for reaching out, {name}. We will review your message and respond to {email} as soon as possible.
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSubmitted(false);
                        setMessage('');
                        setSubject('');
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Send a Message</h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                        <Input
                          placeholder="Jane Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                        <Input
                          type="email"
                          placeholder="jane@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                      <Input
                        placeholder="Feature request / Feedback / Partnership"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                      <Textarea
                        rows={5}
                        placeholder="How can we help you create better content?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      isLoading={isLoading}
                      icon={<Send className="w-4 h-4" />}
                    >
                      Send Message
                    </Button>
                  </form>
                )}
              </div>
            </div>
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
