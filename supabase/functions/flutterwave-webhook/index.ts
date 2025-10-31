import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, verif-hash',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const signature = req.headers.get('verif-hash');

    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Verify webhook signature
    const secretKey = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
    if (!secretKey) {
      console.error('FLUTTERWAVE_SECRET_KEY not configured');
      return new Response(JSON.stringify({ error: 'Configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Flutterwave sends the secret hash in verif-hash header for verification
    if (!signature || signature !== secretKey) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle successful charge event
    if (body.event === 'charge.completed' && body.data) {
      const { data } = body;
      const txRef = data.tx_ref;
      const amount = parseFloat(data.amount);
      const status = data.status;

      console.log(`Processing payment: ${txRef}, amount: ${amount}, status: ${status}`);

      if (status !== 'successful') {
        console.log('Payment not successful, skipping');
        return new Response(JSON.stringify({ message: 'Payment not successful' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Initialize Supabase with service role key to bypass RLS
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Parse tx_ref to get user_id (format: PVANCE_userid_timestamp)
      const parts = txRef.split('_');
      if (parts.length < 2) {
        console.error('Invalid tx_ref format:', txRef);
        return new Response(JSON.stringify({ error: 'Invalid reference format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const userId = parts[1];
      console.log(`Crediting user ${userId} with ₦${amount}`);

      // Get current wallet balance
      const { data: wallet, error: fetchError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (fetchError || !wallet) {
        console.error('Wallet fetch error:', fetchError);
        return new Response(JSON.stringify({ error: 'Wallet not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update wallet balance
      const newBalance = parseFloat(wallet.balance) + amount;
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Wallet update error:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update wallet' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create transaction record
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: userId,
        wallet_id: (await supabase.from('wallets').select('id').eq('user_id', userId).single()).data?.id,
        type: 'topup',
        amount: amount,
        status: 'completed',
        description: 'Wallet funding via Flutterwave',
        reference: txRef,
        provider: 'flutterwave',
      });

      if (txError) {
        console.error('Transaction record error:', txError);
      }

      console.log(`Successfully credited ₦${amount} to user ${userId}. New balance: ₦${newBalance}`);

      return new Response(
        JSON.stringify({ message: 'Wallet updated successfully', balance: newBalance }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Other events - just acknowledge
    console.log(`Event ${body.event} received but not processed`);
    return new Response(JSON.stringify({ message: 'Event acknowledged' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
