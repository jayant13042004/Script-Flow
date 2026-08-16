import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { PenLine } from 'lucide-react';
import { supabase } from '../services/supabase/client';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (supabase) {
          // Supabase automatically exchanges the auth code from the URL hash
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            throw sessionError;
          }

          if (session) {
            // Small delay to let auth state propagate to the store
            setTimeout(() => navigate('/dashboard', { replace: true }), 100);
          } else {
            // No session yet, wait for the auth state change event
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
              if (event === 'SIGNED_IN' && session) {
                subscription.unsubscribe();
                navigate('/dashboard', { replace: true });
              }
            });

            // Timeout fallback — if no sign-in event after 10s, redirect to login
            setTimeout(() => {
              subscription.unsubscribe();
              setError('Authentication timed out. Please try again.');
            }, 10000);
          }
        } else {
          // No Supabase configured, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-6">
          <PenLine className="w-6 h-6 text-white" />
        </div>
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Signing you in...</p>
      </div>
    </div>
  );
}
