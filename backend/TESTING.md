# AOVMAX Backend - Payment Testing Guide

## 🚀 Quick Start Testing

### Prerequisites
1. Backend running: `npm run dev`
2. Supabase database tables created
3. Service role key configured (for real transfers)

---

## 📝 Step-by-Step Testing

### **STEP 1: Setup Database**

Ask your team to run this SQL in Supabase SQL Editor:

```sql
-- Copy from: migrations/002_create_payments_table.sql
-- Or run this:

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE,
  plaid_payment_id TEXT NOT NULL,
  authorization_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
```

---

### **STEP 2: Get Authentication Token**

You need a Supabase JWT token. Get it from your frontend login or:

```javascript
// In your frontend or Supabase console
const { data } = await supabase.auth.signInWithPassword({
  email: 'your-email@example.com',
  password: 'your-password'
});

console.log('Token:', data.session.access_token);
```

Save this token as `YOUR_JWT_TOKEN`

---

### **STEP 3: Link a Bank Account (First Time Only)**

#### A. Create Link Token
```bash
curl -X POST http://localhost:3001/api/plaid/create-link-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "link_token": "link-sandbox-xxxxx"
}
```

#### B. Open Plaid Link (Frontend)
Use the link_token in your frontend with Plaid Link:
- Username: `user_good`
- Password: `pass_good`
- Select any bank (e.g., Chase)
- Select any account

#### C. Exchange Public Token
```bash
curl -X POST http://localhost:3001/api/plaid/exchange-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "public_token": "public-sandbox-xxxxx",
    "account_id": "account-xxxxx",
    "institution_name": "Chase",
    "account_name": "Checking",
    "account_subtype": "checking",
    "mask": "0000"
  }'
```

**Response:**
```json
{
  "success": true,
  "payment_method": {
    "id": "uuid-save-this",
    "bank_name": "Chase",
    "last_four": "0000",
    "account_type": "checking",
    "is_default": true
  }
}
```

**SAVE THE `payment_method.id` - You'll need it!**

---

### **STEP 4: Create a Payment**

#### Option A: Test Payment (No Plaid API call)
```bash
curl -X POST http://localhost:3001/api/payment/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method_id": "uuid-from-step-3",
    "amount": 25.00,
    "description": "Test payment"
  }'
```

#### Option B: Real Transfer (Calls Plaid - Requires Service Role Key)
```bash
curl -X POST http://localhost:3001/api/payment/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method_id": "uuid-from-step-3",
    "amount": 25.00,
    "description": "Real ACH transfer"
  }'
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "payment-uuid-save-this",
    "amount": 25.00,
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### **STEP 5: Check Payment Status**

```bash
curl -X GET http://localhost:3001/api/payment/payment-uuid-from-step-4 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "payment": {
    "id": "payment-uuid",
    "amount": 25.00,
    "status": "pending",
    "description": "Test payment",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 🧪 Using Postman/Thunder Client

### 1. Create Link Token
```
POST http://localhost:3001/api/plaid/create-link-token
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
```

### 2. Exchange Token
```
POST http://localhost:3001/api/plaid/exchange-token
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "public_token": "public-sandbox-xxxxx",
  "account_id": "account-xxxxx",
  "institution_name": "Chase",
  "account_name": "Checking",
  "account_subtype": "checking",
  "mask": "0000"
}
```

### 3. Create Test Payment
```
POST http://localhost:3001/api/payment/test
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "payment_method_id": "uuid-here",
  "amount": 25.00,
  "description": "Test payment"
}
```

### 4. Get Payment Status
```
GET http://localhost:3001/api/payment/{payment-id}
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔍 Troubleshooting

### "Payment method not found"
- Make sure you're using the correct `payment_method_id` from Step 3
- Verify the payment method belongs to your user

### "Plaid access token not found"
- You need service role key configured
- Use `/api/payment/test` endpoint instead (bypasses Plaid)

### "Missing or malformed authorization header"
- Check your JWT token is valid
- Format: `Authorization: Bearer YOUR_TOKEN`

### "new row violates row-level security policy"
- Need service role key OR
- Ask team to add RLS policies for payments table

---

## 📊 All Available Endpoints

```
GET  /health                          - Health check (no auth)
POST /api/plaid/create-link-token     - Get Plaid link token
POST /api/plaid/exchange-token        - Link bank account
GET  /api/profile                     - Get user profile
POST /api/payment/test                - Create test payment (no Plaid)
POST /api/payment/create              - Create real ACH transfer
GET  /api/payment/:id                 - Get payment status
```

---

## 🎯 Quick Test Script

Save as `test-payment.sh`:

```bash
#!/bin/bash

# Set your token
TOKEN="your-jwt-token-here"
BASE_URL="http://localhost:3001"

# 1. Create link token
echo "Creating link token..."
curl -X POST $BASE_URL/api/plaid/create-link-token \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# 2. After linking bank, exchange token (replace values)
echo "\nExchanging token..."
curl -X POST $BASE_URL/api/plaid/exchange-token \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "public_token": "public-sandbox-xxxxx",
    "account_id": "account-xxxxx",
    "institution_name": "Chase",
    "account_name": "Checking",
    "account_subtype": "checking",
    "mask": "0000"
  }'

# 3. Create test payment (replace payment_method_id)
echo "\nCreating test payment..."
curl -X POST $BASE_URL/api/payment/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method_id": "uuid-here",
    "amount": 10.00,
    "description": "Test payment"
  }'
```

Run: `bash test-payment.sh`

---

## ✅ Success Checklist

- [ ] Backend running on port 3001
- [ ] Database tables created
- [ ] JWT token obtained
- [ ] Bank account linked
- [ ] Test payment created
- [ ] Payment status retrieved

**You're all set!** 🎉
