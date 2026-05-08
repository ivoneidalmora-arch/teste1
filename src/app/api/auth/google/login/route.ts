import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  // Pegar variáveis de ambiente
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.ID_DO_CLIENTE_DO_GOOGLE;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // Validação ultra-rígida contra "undefined" (string ou valor)
  const isInvalid = (val: any) => !val || val === 'undefined' || val === 'null' || val === '';

  if (isInvalid(clientId) || isInvalid(clientSecret)) {
    console.error('ERRO CRÍTICO: Variáveis de ambiente do Google não encontradas ou inválidas.', { 
      clientId: clientId ? `Exposto: ${clientId.toString().slice(0, 10)}...` : 'MISSING',
      hasSecret: !!clientSecret && clientSecret !== 'undefined'
    });

    return NextResponse.json({ 
      error: 'Erro de Configuração no Servidor',
      details: 'As credenciais do Google (Client ID/Secret) não foram carregadas corretamente no Vercel.',
      debug: {
        clientIdSet: !isInvalid(clientId),
        clientSecretSet: !isInvalid(clientSecret),
        siteUrl: siteUrl || 'using origin'
      }
    }, { status: 500 });
  }

  // Garantir redirect_uri válido
  const baseUrl = !isInvalid(siteUrl) ? siteUrl : origin;
  // Remover barra final se existir para evitar // nas URLs
  const cleanBaseUrl = baseUrl?.replace(/\/$/, '');
  const redirectUri = `${cleanBaseUrl}/api/auth/google/callback`;

  const options = {
    redirect_uri: redirectUri,
    client_id: clientId as string,
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
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${qs.toString()}`;

  console.log('Redirecionando para Google Auth com Redirect URI:', redirectUri);

  return NextResponse.redirect(authUrl);
}
