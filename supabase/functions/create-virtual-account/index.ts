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
    console.log('User email:', user.email);

    // Validate email exists
    if (!user.email) {
      console.error('User email is missing');
      return new Response(
        JSON.stringify({ error: 'User email is required for account creation' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('full_name, virtual_account_number, bvn')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if virtual account already exists
    if (profile.virtual_account_number) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Virtual account already exists',
          account: {
            account_number: profile.virtual_account_number,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const FLUTTERWAVE_SECRET_KEY = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
    if (!FLUTTERWAVE_SECRET_KEY) {
      throw new Error('FLUTTERWAVE_SECRET_KEY not configured');
    }

    // Generate unique reference for Flutterwave
    const tx_ref = `PVANCE_${user.id.slice(0, 8)}_${Date.now()}`;

    const requestBody: any = {
      email: user.email,
      tx_ref: tx_ref,
      amount: 100, // Minimum amount required by Flutterwave (in NGN)
      // Optional fields for better account management
      firstname: profile.full_name?.split(' ')[0] || 'PayVance',
      lastname: profile.full_name?.split(' ').slice(1).join(' ') || 'User',
    };

    // Only create permanent account if BVN is provided
    if (profile.bvn) {
      requestBody.is_permanent = true;
      requestBody.bvn = profile.bvn;
      console.log('Creating permanent virtual account with BVN');
    } else {
      // Create temporary/dynamic account without BVN requirement
      console.log('Creating temporary virtual account (no BVN provided)');
    }

    console.log('Flutterwave request body:', JSON.stringify(requestBody, null, 2));

    // Create virtual account with Flutterwave
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
      // Handle specific errors
      if (flutterwaveResponse.status === 401) {
        console.log('Flutterwave authentication failed - invalid API key');
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Virtual account setup failed. Please contact support.',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      throw new Error(flutterwaveData.message || 'Failed to create virtual account');
    }

    const accountData = flutterwaveData.data;

    // Update profile with virtual account details
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        virtual_account_number: accountData.account_number,
        virtual_account_bank: accountData.bank_name,
        virtual_account_name: accountData.note || `${profile.full_name} - PayVance`,
        flutterwave_reference: tx_ref,
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
        message: 'Your bank account is ready!',
        account: {
          account_number: accountData.account_number,
          bank_name: accountData.bank_name,
          account_name: accountData.note || `${profile.full_name} - PayVance`,
          flw_ref: accountData.flw_ref,
        },
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
