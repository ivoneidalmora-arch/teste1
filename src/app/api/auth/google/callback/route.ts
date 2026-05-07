import { NextResponse } from 'next/server';
import { supabase } from '@/services/supabase';
import { encrypt } from '@/core/utils/encryption';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state'); // State contains our userId

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  if (!userId) {
    return NextResponse.redirect(new URL('/?error=no_user_context', request.url));
  }

  try {
    const { origin } = new URL(request.url);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.ID_DO_CLIENTE_DO_GOOGLE;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // Exchange code for tokens
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId as string,
        client_secret: clientSecret as string,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await response.json();

    if (tokens.error) {
      console.error('Google Auth Error:', tokens);
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }

    // Get user info to get the email
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();

    // Encrypt tokens
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Save to database
    const { error: dbError } = await supabase
      .from('google_calendar_connections')
      .upsert({
        user_id: userId,
        google_email: googleUser.email,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: expiresAt,
        scopes: tokens.scope?.split(' '),
        status: 'active',
        last_sync_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (dbError) {
      console.error('DB Error:', dbError);
      return NextResponse.redirect(new URL('/?error=db_failed', request.url));
    }

    return NextResponse.redirect(new URL('/?success=google_connected', request.url));
  } catch (err) {
    console.error('Callback Error:', err);
    return NextResponse.redirect(new URL('/?error=internal_error', request.url));
  }
}
