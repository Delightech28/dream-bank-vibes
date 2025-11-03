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

    console.log('Validating NIN with VTPass...');

    const VTPASS_API_KEY = Deno.env.get('VTPASS_API_KEY');
    const VTPASS_PUBLIC_KEY = Deno.env.get('VTPASS_PUBLIC_KEY');
    
    if (!VTPASS_API_KEY || !VTPASS_PUBLIC_KEY) {
      throw new Error('VTPass API keys not configured');
    }

    // Validate NIN with VTPass Identity Verification
    const validateUrl = 'https://api-service.vtpass.com/api/validations';
    const customerValidationResponse = await fetch(validateUrl, {
      method: 'POST',
      headers: {
        'api-key': VTPASS_API_KEY,
        'public-key': VTPASS_PUBLIC_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceID: 'nin-verification',
        billersCode: nin,
      }),
    });

    if (!customerValidationResponse.ok) {
      const rawText = await customerValidationResponse.text();
      console.error('Raw error:', rawText, 'Status:', customerValidationResponse.status);

      let errorMessage = 'NIN verification failed—retry.';
      try {
        const errorData = JSON.parse(rawText);
        errorMessage = errorData.message || rawText.slice(0, 100);
      } catch {
        errorMessage = `Error ${customerValidationResponse.status}: ${rawText}`;
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

    const validateData = await customerValidationResponse.json();
    console.log('NIN validation response:', validateData);

    // VTPass returns response_description: "000" for successful verification
    if (validateData.code !== '000' && validateData.response_description !== '000') {
      return new Response(
        JSON.stringify({
          success: false,
          message: validateData.content?.error || 'NIN not verified—use valid one.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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
