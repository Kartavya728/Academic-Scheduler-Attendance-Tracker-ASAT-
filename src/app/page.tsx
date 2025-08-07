"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { AuthPage } from '../components/AuthPage';
import { Dashboard } from '../components/Dashboard';
import type { Session } from '@supabase/supabase-js';

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Immediately check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Set up a listener for auth state changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup the listener when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-fullscreen">Loading...</div>;
  }

  return (
    <>
      {!session ? (
        <AuthPage />
      ) : (
        // Using a key ensures the Dashboard component re-mounts if the user changes,
        // which is good practice for clearing old state.
        <Dashboard key={session.user.id} session={session}/>
      )}
    </>
  );
}