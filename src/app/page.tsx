
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LandingPage } from './landing-page';

export default function Page() {
  const cookieStore = cookies();
  const loggedInUser = cookieStore.get('loggedInUser');

  if (loggedInUser) {
    redirect('/dashboard');
  }

  return <LandingPage />;
}
