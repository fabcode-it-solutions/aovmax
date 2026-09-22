# Plaid Integration Setup Guide

## ✅ Files Created

1. **Supabase Edge Functions:**
   - `supabase/functions/plaid-create-link-token/index.ts`
   - `supabase/functions/plaid-exchange-token/index.ts`

2. **Database Migration:**
   - `supabase/migrations/20260224030000_create_plaid_accounts.sql`

3. **React Components:**
   - `src/hooks/usePlaid.ts`
   - `src/components/PlaidConnectButton.tsx`

## 📦 Installation Steps

### 1. Install Plaid React SDK
```bash
npm install react-plaid-link
```

### 2. Add Environment Variables

Add to `.env`:
```env
# Plaid Configuration (Get from https://dashboard.plaid.com)
VITE_PLAID_ENV=sandbox
```

### 3. Configure Supabase Secrets

Run these commands in your terminal:
```bash
# Set Plaid credentials in Supabase
supabase secrets set PLAID_CLIENT_ID=your_plaid_client_id
supabase secrets set PLAID_SECRET=your_plaid_secret_sandbox
```

Or set them in Supabase Dashboard:
- Go to: https://supabase.com/dashboard/project/gryzchccjpzawikwrnov/settings/functions
- Add secrets:
  - `PLAID_CLIENT_ID`
  - `PLAID_SECRET`

### 4. Run Database Migration

```bash
supabase db push
```

Or apply manually in Supabase SQL Editor:
- Copy content from `supabase/migrations/20260224030000_create_plaid_accounts.sql`
- Run in SQL Editor

### 5. Deploy Edge Functions

```bash
# Deploy both functions
supabase functions deploy plaid-create-link-token
supabase functions deploy plaid-exchange-token
```

## 🎯 Usage in Your App

### Example: Add to Billing Page

```tsx
import { PlaidConnectButton } from '@/components/PlaidConnectButton';

export default function Billing() {
  return (
    <div>
      <h1>Payment Methods</h1>
      <PlaidConnectButton />
    </div>
  );
}
```

## 🧪 Testing

### Get Plaid Sandbox Credentials
1. Sign up at: https://dashboard.plaid.com/signup
2. Get your `client_id` and `secret` (sandbox)
3. Add to Supabase secrets

### Test with Sandbox
- Use test credentials: `user_good` / `pass_good`
- Test institution: Any bank in sandbox
- Test account: Will auto-populate

## 📡 API Endpoints

### Create Link Token
```
POST https://gryzchccjpzawikwrnov.supabase.co/functions/v1/plaid-create-link-token
Headers:
  Authorization: Bearer <SUPABASE_JWT_TOKEN>
  Content-Type: application/json

Response:
{
  "link_token": "link-sandbox-xxxxx",
  "expiration": "2024-01-01T00:00:00Z"
}
```

### Exchange Token
```
POST https://gryzchccjpzawikwrnov.supabase.co/functions/v1/plaid-exchange-token
Headers:
  Authorization: Bearer <SUPABASE_JWT_TOKEN>
  Content-Type: application/json

Body:
{
  "public_token": "public-sandbox-xxxxx",
  "account_id": "account-xxxxx",
  "institution_name": "Chase",
  "account_name": "Checking",
  "account_subtype": "checking",
  "mask": "1234"
}

Response:
{
  "success": true,
  "account": {
    "id": "uuid",
    "user_id": "uuid",
    "institution_name": "Chase",
    "account_name": "Checking",
    "mask": "1234"
  }
}
```

## 🔒 Security Notes

- ✅ Access tokens are stored securely in Supabase
- ✅ RLS policies ensure users only see their own accounts
- ✅ Plaid secrets never exposed to frontend
- ✅ JWT authentication required for all endpoints

## 🚀 Next Steps

1. **Install package**: `npm install react-plaid-link`
2. **Get Plaid credentials**: https://dashboard.plaid.com
3. **Set Supabase secrets**: Use commands above
4. **Deploy functions**: `supabase functions deploy`
5. **Test integration**: Add `<PlaidConnectButton />` to any page

## 📚 Resources

- Plaid Docs: https://plaid.com/docs/
- Supabase Functions: https://supabase.com/docs/guides/functions
- React Plaid Link: https://github.com/plaid/react-plaid-link
