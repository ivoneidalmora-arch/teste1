import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/services/supabase-admin';
import { encrypt } from '@/core/utils/encryption';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;
const key = new TextEncoder().encode(JWT_SECRET);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  const cookieStore = await cookies();
  const savedState = cookieStore.get('google_oauth_state')?.value;
  
  // 1. Validar State
  if (!state || state !== savedState) {
    return NextResponse.redirect(`${origin}/?error=invalid_state`);
  }
  
  // Limpar cookie de state
  cookieStore.set('google_oauth_state', '', { maxAge: 0 });

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=no_code`);
  }

  // 2. Obter App User ID pela sessão
  const session = cookieStore.get('alfa_session')?.value;
  if (!session) {
    return NextResponse.redirect(`${origin}/?error=unauthorized`);
  }

  let appUserId: string;
  try {
    const { payload } = await jwtVerify(session, key);
    appUserId = (payload.user as any).id;
  } catch (err) {
    return NextResponse.redirect(`${origin}/?error=session_expired`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const cleanBaseUrl = siteUrl.replace(/\/$/, '');
  const redirectUri = `${cleanBaseUrl}/api/auth/google/callback`;

  try {
    // 3. Trocar Code por Tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();
    if (tokens.error) throw new Error(tokens.error_description || tokens.error);

    // 4. Buscar Email do Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userResponse.json();

    // 5. Persistir no Supabase
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Se já existir uma conexão e o Google não mandou refresh_token, preservamos o antigo
    let finalRefreshToken = encryptedRefreshToken;
    if (!finalRefreshToken) {
      const { data: existing } = await supabaseAdmin
        .from('google_calendar_connections')
        .select('refresh_token')
        .eq('app_user_id', appUserId)
        .maybeSingle();
      
      if (existing?.refresh_token) {
        finalRefreshToken = existing.refresh_token;
      }
    }

    const { error: upsertError } = await supabaseAdmin
      .from('google_calendar_connections')
      .upsert({
        app_user_id: appUserId,
        google_email: googleUser.email,
        access_token: encryptedAccessToken,
        refresh_token: finalRefreshToken,
        token_expires_at: expiresAt,
        scopes: tokens.scope?.split(' '),
        status: finalRefreshToken ? 'active' : 'reconnect_required',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'app_user_id' });

    if (upsertError) throw upsertError;

    return NextResponse.redirect(`${origin}/?success=google_connected`);
  } catch (error: any) {
    console.error('[OAuth Callback] Error:', error);
    return NextResponse.redirect(`${origin}/?error=oauth_failed&message=${encodeURIComponent(error.message)}`);
  }
}
