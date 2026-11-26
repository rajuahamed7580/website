'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProfileDetailView from '../../../../components/ProfileDetailView';

export default function CustomProfileClient() {
  const params = useParams();
  const country = params?.country as string;
  const state = params?.state as string;
  const city = params?.city as string;
  const username = params?.username as string;

  return (
    <ProfileDetailView
      customPath={{
        country,
        state,
        city,
        username
      }}
    />
  );
}
