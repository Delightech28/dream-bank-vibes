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

    const body = await req.json();
    const { nin } = body;

    if (!nin || nin.length !== 11) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid NIN. Must be 11 digits.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const email = user.email;
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: 'User email not found' }),
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

    console.log('Validating NIN with Flutterwave...');

    // Validate NIN with Flutterwave - using full absolute URL
    const validateUrl = 'https://api.flutterwave.com/v3/kyc/bvns/verification';
    const customerValidationResponse = await fetch(validateUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bvn: nin,
        email,
      }),
    });

    if (!customerValidationResponse.ok) {
      // Read as text first for non-JSON errors
      const rawText = await customerValidationResponse.text();
      console.error('Raw error response:', rawText);
      console.error('Response status:', customerValidationResponse.status);

      let errorMessage = 'Verification failed—please retry with a valid NIN.';
      
      // Try parsing as JSON if possible (Flutterwave errors are usually JSON)
      try {
        const errorData = JSON.parse(rawText);
        errorMessage = errorData.message || rawText.slice(0, 100) + '...';
      } catch (parseErr) {
        // Keep as text if not JSON (e.g., "Cannot POST...")
        errorMessage = rawText.startsWith('Cannot') 
          ? 'Endpoint error—check API URL.' 
          : `Error ${customerValidationResponse.status}: ${rawText.slice(0, 100)}`;
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: errorMessage 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Now safe to parse JSON (success case)
    const validationData = await customerValidationResponse.json();
    console.log('NIN validation response:', validationData);

    if (validationData.status === 'success' && validationData.data?.risk_action === 'allow') {
      // NIN is valid, update profile
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          nin: nin,
          is_permanent_account: true,
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update profile:', updateError);
        throw updateError;
      }

      console.log('NIN verified and profile updated successfully');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'NIN verified successfully',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      console.log('NIN validation failed:', validationData.message);
      return new Response(
        JSON.stringify({
          success: false,
          message: validationData.message || 'Invalid NIN. Please check and try again.',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: any) {
    console.error('Error in update-profile:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
