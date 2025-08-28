
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/data';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser(true);
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p>Loading...</p>
    </div>
  );
}
