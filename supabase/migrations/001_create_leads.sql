CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  company_name TEXT,
  role TEXT,
  team_size INTEGER,
  audit_data JSONB NOT NULL,
  total_monthly_savings DECIMAL,
  is_high_value BOOLEAN,
  share_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_hash TEXT,
  honeypot_triggered BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS leads_share_token_idx ON leads(share_token);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at);
