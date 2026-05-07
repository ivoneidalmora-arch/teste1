import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  
  // Prioritize environment variable for production stability
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  
  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID is missing in environment variables' }, { status: 500 });
  }

  const options = {
    redirect_uri: redirectUri,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  const authUrl = `${rootUrl}?${qs.toString()}`;

  return NextResponse.redirect(authUrl);
}
