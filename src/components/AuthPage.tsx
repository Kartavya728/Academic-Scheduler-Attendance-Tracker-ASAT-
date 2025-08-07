"use client";

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

// Assuming you have a basic AuthPage component structure.
// If your component is different, just apply the change in the catch block.
export const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', content: 'Success! Please check your email to verify your account.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Successful sign-in is handled by the onAuthStateChange listener in page.tsx
      }
    } catch (error: unknown) { // <-- THE FIX: Use 'unknown' instead of 'any'
      let errorMessage = 'An unexpected error occurred. Please try again.';
      // Type-check the error before using it
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setMessage({ type: 'error', content: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h1 className="auth-title">Attendance Tracker</h1>
        <p className="auth-subtitle">
          {isSignUp ? 'Create an account to start' : 'Sign in to your account'}
        </p>
        <form onSubmit={handleAuthAction} className="auth-form">
          <input
            className="auth-input"
            type="email"
            placeholder="your-email@address.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        {message.content && (
          <p className={`auth-message ${message.type}`}>
            {message.content}
          </p>
        )}
        <p className="auth-toggle">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button type="button" onClick={() => { setIsSignUp(!isSignUp); setMessage({ type: '', content: '' }); }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};