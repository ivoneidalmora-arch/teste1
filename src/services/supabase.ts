import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verifica se a URL é válida e não é o placeholder padrão
const isConfigured = supabaseUrl && 
                   supabaseUrl !== 'cole_sua_url_aqui' && 
                   supabaseUrl.startsWith('http');

if (!isConfigured) {
  console.error(
    '❌ ERRO DE CONFIGURAÇÃO: As variáveis do Supabase não foram encontradas ou são inválidas.\n' +
    'Certifique-se de preencher o arquivo .env.local com sua URL e CHAVE do projeto Supabase.'
  );
}

// Inicializa o cliente apenas com valores válidos (ou placeholders para evitar erro de avaliação de módulo)
export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://your-project.supabase.co',
  isConfigured ? supabaseAnonKey : 'your-anon-key'
);
