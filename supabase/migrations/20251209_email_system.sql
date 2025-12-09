-- Create email_logs table for tracking sent emails
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0
);

-- Create indexes for email_logs
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_recipient_email ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_template_name ON email_logs(template_name);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);

-- Create email_preferences table for user communication preferences
CREATE TABLE email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  marketing_emails BOOLEAN DEFAULT true,
  transactional_emails BOOLEAN DEFAULT true,
  invoice_emails BOOLEAN DEFAULT true,
  ticket_updates BOOLEAN DEFAULT true,
  security_alerts BOOLEAN DEFAULT true,
  newsletter BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for email_preferences
CREATE INDEX idx_email_preferences_user_id ON email_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_logs
CREATE POLICY "Users can view their own email logs"
  ON email_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users cannot insert/update/delete email logs"
  ON email_logs FOR INSERT, UPDATE, DELETE
  WITH CHECK (false);

-- RLS Policies for email_preferences
CREATE POLICY "Users can view their own email preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own email preferences"
  ON email_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cannot delete their email preferences"
  ON email_preferences FOR DELETE
  WITH CHECK (false);

-- Create a function to initialize email preferences on user signup
CREATE OR REPLACE FUNCTION initialize_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email preferences initialization
CREATE TRIGGER email_preferences_init
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION initialize_email_preferences();
