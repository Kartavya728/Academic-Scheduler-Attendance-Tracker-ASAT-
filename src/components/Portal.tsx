// app/components/Portal.tsx
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
}

export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Return a cleanup function
    return () => setMounted(false);
  }, []);

  // Don't render anything on the server, or until the client has mounted.
  if (!mounted) {
    return null;
  }

  // On the client, find the 'modal-root' div and render children into it.
  const portalRoot = document.getElementById('modal-root');
  return portalRoot ? createPortal(children, portalRoot) : null;
}