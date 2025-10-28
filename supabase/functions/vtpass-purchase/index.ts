import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurchaseRequest {
  serviceID: string; // e.g., 'mtn', 'glo', 'airtel', '9mobile'
  amount: number;
  phone: string;
  billersCode?: string; // For electricity, cable, etc.
  variationCode?: string; // For data plans
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { serviceID, amount, phone, billersCode, variationCode }: PurchaseRequest = await req.json();

    console.log('Processing purchase:', { serviceID, amount, phone, user: user.id });

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      console.error('Wallet error:', walletError);
      return new Response(JSON.stringify({ error: 'Wallet not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has sufficient balance
    if (parseFloat(wallet.balance) < amount) {
      return new Response(JSON.stringify({ error: 'Insufficient balance' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate unique reference
    const reference = `TXN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Prepare VTPass request
    const vtpassUrl = 'https://api-service.vtpass.com/api/pay';
    const vtpassAuth = btoa(`${Deno.env.get('VTPASS_PUBLIC_KEY')}:${Deno.env.get('VTPASS_API_KEY')}`);

    const vtpassPayload: any = {
      request_id: reference,
      serviceID: serviceID,
      amount: amount,
      phone: phone,
    };

    if (billersCode) vtpassPayload.billersCode = billersCode;
    if (variationCode) vtpassPayload.variation_code = variationCode;

    console.log('Sending request to VTPass:', vtpassPayload);

    // Call VTPass API
    const vtpassResponse = await fetch(vtpassUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${vtpassAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vtpassPayload),
    });

    const vtpassData = await vtpassResponse.json();
    console.log('VTPass response:', vtpassData);

    // Determine transaction type
    let transactionType: string;
    if (['mtn', 'glo', 'airtel', '9mobile'].includes(serviceID)) {
      transactionType = 'airtime';
    } else if (serviceID.includes('data')) {
      transactionType = 'data';
    } else if (serviceID.includes('electric')) {
      transactionType = 'electricity';
    } else if (serviceID.includes('dstv') || serviceID.includes('gotv') || serviceID.includes('startimes')) {
      transactionType = 'cable';
    } else {
      transactionType = 'water';
    }

    // Check if transaction was successful
    const isSuccess = vtpassData.code === '000' || vtpassData.response_description?.toLowerCase().includes('successful');
    const status = isSuccess ? 'completed' : 'failed';

    // Create transaction record
    const { error: txnError } = await supabaseClient.from('transactions').insert({
      user_id: user.id,
      wallet_id: wallet.id,
      type: transactionType,
      status: status,
      amount: amount,
      provider: serviceID,
      phone_number: phone,
      reference: reference,
      vtpass_request_id: vtpassData.requestId,
      vtpass_transaction_id: vtpassData.transactionId,
      description: `${serviceID.toUpperCase()} ${transactionType} purchase`,
      metadata: vtpassData,
    });

    if (txnError) {
      console.error('Transaction record error:', txnError);
    }

    // Deduct from wallet if successful
    if (isSuccess) {
      const newBalance = parseFloat(wallet.balance) - amount;
      const { error: updateError } = await supabaseClient
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id);

      if (updateError) {
        console.error('Wallet update error:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: isSuccess,
        message: vtpassData.response_description || vtpassData.content?.transactions?.status || 'Transaction processed',
        transaction: {
          reference,
          amount,
          status,
          provider: serviceID,
        },
        vtpass_response: vtpassData,
      }),
      {
        status: isSuccess ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in vtpass-purchase function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
