import { fetchHt6Api, toLoaderResult } from '@/utils/ht6-api';
import { LoaderFunctionArgs, redirect } from 'react-router-dom';

export async function loader({ request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const code = searchParams.get('code');
  if (!code || !state) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response('Malformed redirect. Please try again later', {
      status: 400,
      statusText: 'Malformed redirect. Please try again later',
    });
  }

  const result = await fetchHt6Api<
    { token: string; refreshToken: string },
    { state: string; code: string }
  >('/auth/organizer/callback', {
    payload: { state, code },
  });

  toLoaderResult(result);
  // TODO: Add token refreshing
  // window.localStorage.setItem('HT6_refresh_token', result.message.refreshToken);
  window.localStorage.setItem('HT6_token', result.message.token);
  return redirect('/');
}

export function Component() {
  return <div />;
}