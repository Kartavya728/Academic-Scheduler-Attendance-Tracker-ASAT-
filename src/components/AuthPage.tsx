// app/components/AuthPage.tsx
"use client";

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

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
      let data, error;

      // ================== THE FIX ==================
      // Instead of assigning the function to a variable, we use an if/else
      // block to call the function directly on `supabase.auth`.
      // This preserves the correct 'this' context.
      if (isSignUp) {
        // For sign-up, you might want to show a confirmation message
        const response = await supabase.auth.signUp({ email, password });
        data = response.data;
        error = response.error;
        if (!error && data.user) {
          setMessage({ type: 'success', content: 'Success! Please check your email to verify your account.' });
        }
      } else {
        // For sign-in
        const response = await supabase.auth.signInWithPassword({ email, password });
        data = response.data;
        error = response.error;
        if (!error && data.user) {
          setMessage({ type: 'success', content: 'Sign in successful! Redirecting...' });
          // Here you would typically redirect the user, e.g., window.location.href = '/dashboard';
        }
      }
      // ===============================================

      if (error) {
        console.error('Supabase returned an error:', error);
        setMessage({ type: 'error', content: error.message });
      }

    } catch (err: any) {
      console.error("A critical error occurred:", err);
      setMessage({ type: 'error', content: err.message || 'An unexpected error occurred. Please try again.' });
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