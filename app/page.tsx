'use client';

import { useEffect, useRef } from 'react';

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the legacy homepage
    window.location.replace('/index.html');
  }, []);

  return (
    <div ref={containerRef} style={{ background: '#071222', width: '100vw', height: '100vh' }} />
  );
}
