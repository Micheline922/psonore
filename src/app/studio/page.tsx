
"use client"
import React, { Suspense } from 'react';
import StudioPageContent from '@/components/studio-page-content';
import Logo from '@/components/logo';

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Logo className="h-24 w-24 text-primary animate-pulse" /></div>}>
      <StudioPageContent />
    </Suspense>
  );
}
