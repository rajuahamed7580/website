import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import CustomProfileClient from './CustomProfileClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api/v1';

type Props = {
  params: Promise<{
    country: string;
    state: string;
    city: string;
    username: string;
  }>;
};

function extractShortTitle(title: string) {
  const firstSegment = title
    .split(/\p{Extended_Pictographic}/u)
    .map((part) => part.trim())
    .find(Boolean);
  return firstSegment || title.trim();
}

function formatSegmentTitle(segment: string) {
  return decodeURIComponent(segment)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, state, city, username } = await params;

  try {
    const res = await fetch(
      `${API_BASE_URL}/custom-urls/resolve/${encodeURIComponent(country)}/${encodeURIComponent(state)}/${encodeURIComponent(city)}/${encodeURIComponent(username)}`,
      { cache: 'no-store' }
    );

    if (res.ok) {
      const data = await res.json();
      const post = data?.data?.post;
      const customUrl = data?.data?.customUrl;
      const preferredTitle =
        customUrl?.shortTitle?.trim() ||
        (post?.title ? extractShortTitle(post.title) : '');

      if (preferredTitle) {
        return {
          title: `Review for ${preferredTitle} | PrivateDelights`,
          description: post?.description || undefined
        };
      }
    }
  } catch {
    // Fall back to formatted username if backend is unreachable during SSR
  }

  return {
    title: `Review for ${formatSegmentTitle(username)} | PrivateDelights`
  };
}

async function DynamicRouteMarker() {
  await connection();
  return null;
}

export default function CustomProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex justify-center items-center">
          <div
            role="status"
            aria-label="Loading"
            className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
          />
        </div>
      }
    >
      <DynamicRouteMarker />
      <CustomProfileClient />
    </Suspense>
  );
}
