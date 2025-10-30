import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('PAYSTACK_SECRET_KEY not configured');
    }

    // Verify Paystack signature
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();

    if (!signature) {
      console.error('Missing Paystack signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify webhook signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(PAYSTACK_SECRET_KEY),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(body)
    );

    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (computedSignature !== signature) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event = JSON.parse(body);
    console.log('Paystack webhook event:', event.event);

    // Handle charge success event (when money is received)
    if (event.event === 'charge.success' && event.data.channel === 'dedicated_nuban') {
      const { customer, amount, reference } = event.data;
      const amountInNaira = amount / 100; // Paystack sends amount in kobo

      console.log(`Received ₦${amountInNaira} for customer: ${customer.email}`);

      // Create Supabase client with service role key
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Find user by email
      const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (userError) throw userError;

      const user = users.users.find(u => u.email === customer.email);
      
      if (!user) {
        console.error('User not found for email:', customer.email);
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get user's wallet
      const { data: wallet, error: walletError } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError || !wallet) {
        console.error('Wallet not found for user:', user.id);
        return new Response(JSON.stringify({ error: 'Wallet not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update wallet balance
      const newBalance = parseFloat(wallet.balance) + amountInNaira;
      const { error: updateError } = await supabaseAdmin
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id);

      if (updateError) {
        console.error('Failed to update wallet:', updateError);
        throw updateError;
      }

      // Create transaction record
      const { error: txnError } = await supabaseAdmin.from('transactions').insert({
        user_id: user.id,
        wallet_id: wallet.id,
        type: 'topup',
        status: 'completed',
        amount: amountInNaira,
        reference: reference,
        description: 'Bank transfer via virtual account',
        metadata: event.data,
      });

      if (txnError) {
        console.error('Failed to create transaction record:', txnError);
      }

      console.log(`Successfully credited ₦${amountInNaira} to user ${user.email}`);

      return new Response(
        JSON.stringify({ success: true, message: 'Wallet credited successfully' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Acknowledge other events
    return new Response(
      JSON.stringify({ success: true, message: 'Event received' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
