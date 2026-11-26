'use client';

import React from 'react';
import SiteHeader from './components/SiteHeader';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#333333] font-sans antialiased flex flex-col">
      <SiteHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">PrivateDelights</h1>
        <p className="text-sm text-gray-500 max-w-md">
          Visit a profile URL directly in the format{' '}
          <span className="font-mono text-blue-600">/Country/State/City/username</span>.
        </p>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-500 space-y-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <a href="#" className="text-blue-600 hover:underline">Contact PrivateDelights</a>
          <a href="#" className="text-blue-600 hover:underline">Blog</a>
          <a href="#" className="text-blue-600 hover:underline">Twitter</a>
          <a href="#" className="text-blue-600 hover:underline">Locations</a>
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          <a href="#" className="text-blue-600 hover:underline">Terms</a>
        </div>
        <div>© 2026 PrivateDelights.ch</div>
      </footer>
    </div>
  );
}
