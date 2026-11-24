import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import PostDetailClient from './PostDetailClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api/v1';

type Props = {
  params: Promise<{ slug: string }>;
};

function extractShortTitle(title: string) {
  const firstSegment = title
    .split(/\p{Extended_Pictographic}/u)
    .map((part) => part.trim())
    .find(Boolean);
  return firstSegment || title.trim();
}

function formatSlugTitle(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_BASE_URL}/posts/slug/${slug}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const post = data?.data?.post;
      if (post?.title) {
        const shortTitle = extractShortTitle(post.title);
        return {
          title: `Review for ${shortTitle} | PrivateDelights`,
          description: post.description || undefined,
        };
      }
    }
  } catch {
    // Fall back to formatted slug if backend is unreachable during SSR
  }

  return {
    title: `Review for ${formatSlugTitle(slug)} | PrivateDelights`,
  };
}

async function DynamicRouteMarker() {
  await connection();
  return null;
}

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
      <DynamicRouteMarker />
      <PostDetailClient />
    </Suspense>
  );
}
