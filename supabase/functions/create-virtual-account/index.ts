import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Creating virtual account for user:', user.id);

    // Parse request body for NIN and other params
    const body = await req.json().catch(() => ({}));
    const providedNin = body.nin;
    const amount = body.amount || 100;

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('full_name, virtual_account_number, nin, is_permanent_account')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const email = user.email;
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'User email is required for account creation' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const FLUTTERWAVE_SECRET_KEY = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
    if (!FLUTTERWAVE_SECRET_KEY) {
      throw new Error('FLUTTERWAVE_SECRET_KEY not configured');
    }

    // Determine NIN to use (from request or profile)
    let nin = providedNin || profile.nin;
    let isPermanent = false;

    // If NIN provided, validate it with Flutterwave
    if (nin) {
      console.log('Validating NIN with Flutterwave...');
      
      const customerValidationResponse = await fetch(
        'https://api.flutterwave.com/v3/customers',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            nin,
          }),
        }
      );

      const validationData = await customerValidationResponse.json();
      console.log('NIN validation response:', validationData);

      if (validationData.status === 'success' && validationData.data?.risk_action === 'allow') {
        isPermanent = true;
        console.log('NIN validated successfully - creating permanent account');
        
        // Update profile with NIN
        if (providedNin) {
          await supabaseClient
            .from('profiles')
            .update({ nin: providedNin })
            .eq('user_id', user.id);
        }
      } else {
        console.log('NIN validation failed or risk action not allowed');
        nin = null; // Don't use NIN if validation failed
      }
    }

    // Check if virtual account already exists
    if (profile.virtual_account_number && !providedNin) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Virtual account already exists',
          account_number: profile.virtual_account_number,
          permanent: profile.is_permanent_account,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate unique reference
    const reference = `ref_${user.id}_${Date.now()}`;
    const tx_ref = reference;

    const fullName = profile.full_name || 'PayVance User';
    const requestBody: any = {
      reference,
      tx_ref,
      customer: {
        name: fullName,
        email,
      },
      currency: 'NGN',
      callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/flutterwave-webhook`,
    };

    // Add NIN for permanent account
    if (isPermanent && nin) {
      requestBody.is_permanent = true;
      requestBody.customer.nin = nin;
      console.log('Creating permanent virtual account with NIN');
    } else {
      requestBody.amount = amount;
      console.log(`Creating temporary virtual account with amount: ${amount}`);
    }

    console.log('Flutterwave request:', JSON.stringify(requestBody, null, 2));

    // Create virtual account with Flutterwave v3
    const flutterwaveResponse = await fetch(
      'https://api.flutterwave.com/v3/virtual-account-numbers',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    const flutterwaveData = await flutterwaveResponse.json();
    console.log('Flutterwave response:', flutterwaveData);

    if (flutterwaveData.status !== 'success') {
      const errorMessage = flutterwaveData.message || 'Failed to create virtual account';
      console.error('Flutterwave error:', errorMessage);
      return new Response(
        JSON.stringify({
          success: false,
          message: errorMessage,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const accountData = flutterwaveData.data;

    // Update profile with virtual account details
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        virtual_account_number: accountData.account_number,
        virtual_account_bank: accountData.bank_name,
        virtual_account_name: accountData.account_name || fullName,
        flutterwave_reference: tx_ref,
        is_permanent_account: isPermanent,
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      throw updateError;
    }

    console.log('Virtual account created successfully:', accountData.account_number);

    return new Response(
      JSON.stringify({
        success: true,
        account_number: accountData.account_number,
        bank: accountData.bank_name,
        permanent: isPermanent,
        message: isPermanent 
          ? 'Permanent virtual account created!' 
          : `Transfer ₦${amount} to activate your account`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error creating virtual account:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});