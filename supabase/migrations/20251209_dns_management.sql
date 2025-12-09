-- Create dns_records table
CREATE TABLE dns_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_name TEXT NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV')),
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  ttl INTEGER NOT NULL DEFAULT 3600 CHECK (ttl >= 60 AND ttl <= 86400),
  priority INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_dns_record UNIQUE(domain_name, record_type, name, value)
);

-- Create domains table (if not exists - may already exist)
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT false,
  auto_renew BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'expired', 'transfer_in_progress')),
  nameservers TEXT[] DEFAULT ARRAY['ns1.example.com', 'ns2.example.com'],
  dns_records JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT domain_not_empty CHECK (char_length(domain_name) > 0)
);

-- Create indexes for performance
CREATE INDEX idx_dns_records_domain_name ON dns_records(domain_name);
CREATE INDEX idx_dns_records_status ON dns_records(status);
CREATE INDEX idx_dns_records_record_type ON dns_records(record_type);
CREATE INDEX idx_dns_records_created_at ON dns_records(created_at DESC);
CREATE INDEX idx_domains_user_id ON domains(user_id);
CREATE INDEX idx_domains_domain_name ON domains(domain_name);
CREATE INDEX idx_domains_status ON domains(status);

-- Enable Row Level Security
ALTER TABLE dns_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Create view for user domains with DNS records
CREATE OR REPLACE VIEW user_domains_with_records AS
SELECT 
  d.id,
  d.user_id,
  d.domain_name,
  d.is_primary,
  d.auto_renew,
  d.expires_at,
  d.status,
  d.nameservers,
  json_agg(
    json_build_object(
      'id', r.id,
      'record_type', r.record_type,
      'name', r.name,
      'value', r.value,
      'ttl', r.ttl,
      'priority', r.priority,
      'status', r.status
    )
  ) FILTER (WHERE r.id IS NOT NULL) AS dns_records,
  d.created_at,
  d.updated_at
FROM domains d
LEFT JOIN dns_records r ON d.domain_name = r.domain_name
GROUP BY d.id, d.user_id, d.domain_name, d.is_primary, d.auto_renew, d.expires_at, d.status, d.nameservers, d.created_at, d.updated_at;

-- RLS Policies for domains
CREATE POLICY "Users can view their own domains"
  ON domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own domains"
  ON domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own domains"
  ON domains FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own domains"
  ON domains FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for dns_records
-- Allow viewing through domain association
CREATE POLICY "Users can view DNS records for their domains"
  ON dns_records FOR SELECT
  USING (
    domain_name IN (
      SELECT domain_name FROM domains WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert DNS records for their domains"
  ON dns_records FOR INSERT
  WITH CHECK (
    domain_name IN (
      SELECT domain_name FROM domains WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update DNS records for their domains"
  ON dns_records FOR UPDATE
  USING (
    domain_name IN (
      SELECT domain_name FROM domains WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    domain_name IN (
      SELECT domain_name FROM domains WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete DNS records for their domains"
  ON dns_records FOR DELETE
  USING (
    domain_name IN (
      SELECT domain_name FROM domains WHERE user_id = auth.uid()
    )
  );

-- Create trigger to update domains updated_at
CREATE OR REPLACE FUNCTION update_domain_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER domains_updated_at_trigger
AFTER UPDATE ON domains
FOR EACH ROW
EXECUTE FUNCTION update_domain_updated_at();

-- Create trigger to update dns_records updated_at
CREATE OR REPLACE FUNCTION update_dns_record_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dns_records_updated_at_trigger
AFTER UPDATE ON dns_records
FOR EACH ROW
EXECUTE FUNCTION update_dns_record_updated_at();
