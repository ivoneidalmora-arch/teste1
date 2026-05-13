-- FINAL CALENDAR & GOOGLE INTEGRATION MIGRATION
-- Author: Senior Dev
-- Timestamp: 2026-05-08
-- [ROLLBACK] Este script é incremental. Para reverter, as tabelas devem ser removidas manualmente se necessário.

-- 0. Limpeza controlada (COMENTADA PARA SEGURANÇA EM PRODUÇÃO)
-- DROP TABLE IF EXISTS google_calendar_connections CASCADE;
-- DROP TABLE IF EXISTS calendar_events CASCADE;
-- DROP TABLE IF EXISTS approved_duplicates CASCADE;

-- 1. Google Calendar Connections
-- Armazena tokens e status da conexão OAuth do Google
CREATE TABLE IF NOT EXISTS google_calendar_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    google_email TEXT NOT NULL,
    access_token TEXT NOT NULL, -- Criptografado no backend
    refresh_token TEXT,          -- Criptografado no backend
    token_expires_at TIMESTAMPTZ NOT NULL,
    scopes TEXT[],
    status TEXT NOT NULL DEFAULT 'active', -- active, reconnect_required, disconnected
    sync_enabled BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(app_user_id)
);

-- 2. Calendar Events
-- Armazena feriados sincronizados e eventos locais
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT, -- YYYY-MM-DD para eventos all-day
    start_at TIMESTAMPTZ, -- Para eventos com horário
    end_at TIMESTAMPTZ,   -- Para eventos com horário
    all_day BOOLEAN NOT NULL DEFAULT false,
    source TEXT NOT NULL DEFAULT 'site', -- site, google, local
    category TEXT,
    event_type TEXT, -- national, state, municipal, optional, google
    holiday_key TEXT, -- Chave única para evitar duplicidade de feriados (ex: 2026-04-03-paixao-de-cristo)
    google_event_id TEXT,
    google_calendar_id TEXT DEFAULT 'primary',
    sync_status TEXT NOT NULL DEFAULT 'pending', -- pending, synced, error
    last_synced_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    -- Garantir que um usuário não tenha o mesmo feriado duplicado localmente
    UNIQUE(app_user_id, holiday_key)
);

-- 3. Approved Duplicates (Para validação de vistorias)
CREATE TABLE IF NOT EXISTS approved_duplicates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    vehicle_plate TEXT NOT NULL,
    service_name TEXT NOT NULL,
    transaction_ids JSONB NOT NULL DEFAULT '[]',
    approved_by TEXT,
    approved_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(app_user_id, vehicle_plate, service_name)
);

-- 4. Índices para Performance
CREATE INDEX idx_google_conn_user ON google_calendar_connections(app_user_id);
CREATE INDEX idx_cal_events_user_date ON calendar_events(app_user_id, date) WHERE date IS NOT NULL;
CREATE INDEX idx_cal_events_user_start ON calendar_events(app_user_id, start_at) WHERE start_at IS NOT NULL;
CREATE INDEX idx_cal_events_google_id ON calendar_events(google_event_id);
CREATE INDEX idx_cal_events_holiday_key ON calendar_events(holiday_key);

-- 5. Ativar Row Level Security (RLS)
ALTER TABLE google_calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_duplicates ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de RLS
-- google_calendar_connections: Restrito ao backend (service role) e leitura mínima pelo dono se necessário.
-- O prompt diz: "Não criar policy pública para google_calendar_connections. Garantir que dados sensíveis não sejam acessíveis pelo client."
-- Como usamos supabaseAdmin no backend, não precisamos de policies para o backend funcionar.
-- Para o usuário ver apenas que está conectado (sem ver tokens), poderíamos criar uma view ou policy restritiva.
-- Por agora, mantemos fechado para o client conforme instrução de segurança.

CREATE POLICY "Users can view their own calendar events" ON calendar_events
    FOR SELECT USING (auth.uid() = app_user_id);

CREATE POLICY "Users can manage their own calendar events" ON calendar_events
    FOR ALL USING (auth.uid() = app_user_id);

CREATE POLICY "Users can manage their own approved duplicates" ON approved_duplicates
    FOR ALL USING (auth.uid() = app_user_id);

-- 7. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_google_calendar_connections_updated_at
    BEFORE UPDATE ON google_calendar_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
