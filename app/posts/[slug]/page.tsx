'use client';

import React, { Suspense } from 'react';
import PostDetailClient from './PostDetailClient';

export default function SinglePostDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white text-gray-700 flex flex-col justify-center items-center font-sans">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-semibold text-gray-500">Loading profile...</p>
        </div>
      }
    >
      <PostDetailClient />
    </Suspense>
  );
}
