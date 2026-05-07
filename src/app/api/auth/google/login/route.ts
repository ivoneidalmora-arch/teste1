import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  
  // Prioritize environment variable for production stability
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.ID_DO_CLIENTE_DO_GOOGLE;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ 
      error: 'Configuração Incompleta no Vercel',
      details: 'As chaves de ambiente não foram encontradas (GOOGLE_CLIENT_ID ou ID_DO_CLIENTE_DO_GOOGLE).',
      hint: 'Verifique se os nomes das variáveis no Vercel estão corretos e faça um novo Deploy.'
    }, { status: 500 });
  }

  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    state: userId || '',
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
