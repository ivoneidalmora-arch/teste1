import { decrypt, encrypt } from "@/core/utils/encryption";
import { supabaseAdmin } from "@/services/supabase-admin";

export class GoogleAuthService {
  static async refreshAccessToken(connectionId: string, refreshToken: string, userId: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('GOOGLE_CONFIG_MISSING');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: decrypt(refreshToken),
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('[GoogleAuthService] Refresh failed:', data.error);
      if (data.error === 'invalid_grant') {
        // Marca como necessário reconectar
        await supabaseAdmin
          .from('google_calendar_connections')
          .update({ status: 'reconnect_required', updated_at: new Date().toISOString() })
          .eq('id', connectionId);
        throw new Error('RECONNECT_REQUIRED');
      }
      throw new Error(`REFRESH_FAILED: ${data.error}`);
    }

    const encryptedAccessToken = encrypt(data.access_token);
    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

    await supabaseAdmin
      .from('google_calendar_connections')
      .update({
        access_token: encryptedAccessToken,
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId);

    return data.access_token;
  }

  /**
   * Valida se a conexão possui os escopos necessários.
   */
  static hasRequiredScopes(scopes: string[], required: string[]) {
    return required.every(s => scopes.includes(s));
  }
}
