import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Inicialização segura para evitar crash se as variáveis estiverem ausentes
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
