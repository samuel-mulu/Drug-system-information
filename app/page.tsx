import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAME } from '../lib/auth';

export default function RootPage() {
  const hasSession = cookies().get(AUTH_COOKIE_NAME)?.value;

  redirect(hasSession ? '/dashboard' : '/login');
}
