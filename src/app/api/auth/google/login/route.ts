import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Tentar pegar de várias fontes possíveis
  const clientId = process.env.GOOGLE_CLIENT_ID || 
                   process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 
                   process.env.ID_DO_CLIENTE_DO_GOOGLE;
                   
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // Diagnóstico visual se falhar
  if (!clientId || clientId === 'undefined' || !clientSecret || clientSecret === 'undefined') {
    return new Response(`
      <div style="font-family: sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h1 style="color: #e11d48;">⚠️ Erro de Configuração Detectado</h1>
        <p>O servidor não conseguiu ler as credenciais do Google no ambiente de produção.</p>
        <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px; font-family: monospace;">
          GOOGLE_CLIENT_ID: <b style="color: ${!clientId || clientId === 'undefined' ? 'red' : 'green'}">${clientId || 'NÃO ENCONTRADO'}</b><br>
          GOOGLE_CLIENT_SECRET: <b style="color: ${!clientSecret || clientSecret === 'undefined' ? 'red' : 'green'}">${clientSecret ? 'PRESENTE (***)' : 'NÃO ENCONTRADO'}</b>
        </div>
        <p><b>Como resolver:</b></p>
        <ol>
          <li>Vá ao painel do Vercel em <b>Settings > Environment Variables</b>.</li>
          <li>Verifique se as variáveis <code>GOOGLE_CLIENT_ID</code> e <code>GOOGLE_CLIENT_SECRET</code> estão lá.</li>
          <li><b>Crucial:</b> Após adicionar as variáveis, você deve ir em <b>Deployments</b>, clicar nos três pontos do último deploy e selecionar <b>Redeploy</b> (com "Build with existing settings").</li>
        </ol>
        <p style="font-size: 0.8rem; color: #64748b;">Nota: Variáveis de ambiente só são lidas durante o build/runtime do novo deploy.</p>
      </div>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 500 });
  }

  const { origin, searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  // Garantir redirect_uri válido
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const cleanBaseUrl = siteUrl.replace(/\/$/, '');
  const redirectUri = `${cleanBaseUrl}/api/auth/google/callback`;

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
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
  }).toString();

  return NextResponse.redirect(authUrl);
}
