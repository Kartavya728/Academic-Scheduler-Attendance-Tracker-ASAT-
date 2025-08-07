"use client";
import { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
export const Portal: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  return mounted ? createPortal(children, document.body) : null;
};