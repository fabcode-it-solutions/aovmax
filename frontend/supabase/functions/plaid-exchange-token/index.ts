import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { public_token, account_id, institution_name, account_name, account_subtype, mask } = await req.json();

    // Exchange public token for access token
    const exchangeResponse = await fetch('https://sandbox.plaid.com/item/public_token/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: Deno.env.get('PLAID_CLIENT_ID'),
        secret: Deno.env.get('PLAID_SECRET'),
        public_token,
      }),
    });

    const { access_token, item_id } = await exchangeResponse.json();

    // Store in database
    const { data, error } = await supabaseClient
      .from('plaid_accounts')
      .insert({
        user_id: user.id,
        access_token,
        item_id,
        account_id,
        institution_name,
        account_name,
        account_subtype,
        mask,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, account: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
