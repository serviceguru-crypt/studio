
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  // Render a loading state or nothing while redirecting
  return null;
}
