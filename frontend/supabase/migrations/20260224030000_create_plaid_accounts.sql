-- Create plaid_accounts table
CREATE TABLE IF NOT EXISTS plaid_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  item_id TEXT NOT NULL,
  account_id TEXT,
  institution_name TEXT,
  account_name TEXT,
  account_subtype TEXT,
  mask TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE plaid_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own accounts
CREATE POLICY "Users can view own plaid accounts"
  ON plaid_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own accounts
CREATE POLICY "Users can insert own plaid accounts"
  ON plaid_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own accounts
CREATE POLICY "Users can update own plaid accounts"
  ON plaid_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own accounts
CREATE POLICY "Users can delete own plaid accounts"
  ON plaid_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_plaid_accounts_user_id ON plaid_accounts(user_id);
CREATE INDEX idx_plaid_accounts_item_id ON plaid_accounts(item_id);
