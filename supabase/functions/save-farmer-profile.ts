import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
};
/**
 * Handles CORS preflight requests
 */ function handleOptionsRequest() {
    console.log('🛑 OPTIONS request received — returning CORS headers');
    return new Response('ok', {
        status: 200,
        headers: CORS_HEADERS
    });
}
/**
 * Creates a Supabase client instance
 */ function createSupabaseClient() {
    console.log('🔧 Initializing Supabase client...');
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    console.log('✅ Supabase client initialized');
    return supabase;
}
/**
 * Extracts and validates the authorization token
 */ function extractAuthToken(req) {
    console.log('🔍 Extracting Authorization token...');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        console.error('❌ Authorization header missing');
        throw new Error('Missing Authorization header');
    }
    return authHeader.replace('Bearer ', '');
}
/**
 * Validates the user token and returns the authenticated user
 */ async function authenticateUser(supabase, token) {
    console.log('🔐 Validating user token...');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        console.error('❌ Invalid token or authentication failed:', error);
        throw new Error('Invalid token');
    }
    console.log(`👤 Authenticated user: ${user.id}`);
    return user;
}
/**
 * Parses and validates request body fields
 */ async function parseAndValidateBody(req) {
    console.log('📥 Reading request body...');
    const { region, hectares, coffee_variety } = await req.json();
    if (!region || !hectares || !coffee_variety) {
        console.error('⚠️ Missing required fields:', {
            region,
            hectares,
            coffee_variety
        });
        throw new Error('Missing required fields');
    }
    if (typeof hectares !== 'number' || hectares <= 0) {
        console.error(`⚠️ Invalid hectares value: ${hectares}`);
        throw new Error('Hectares must be a positive number');
    }
    console.log('✅ Request data validated');
    return {
        region,
        hectares,
        coffee_variety
    };
}
/**
 * Saves (upserts) the farmer profile in the database
 */ async function saveFarmerProfile(supabase, userId, profileData) {
    console.log('💾 Saving farmer profile for user:', userId);
    const payload = {
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('farmer_profiles').upsert(payload);
    if (error) {
        console.error('❌ Supabase error while saving profile:', error);
        throw new Error('Database error while saving profile');
    }
    console.log('✅ Profile saved successfully');
}
/**
 * Creates a success response
 */ function createSuccessResponse() {
    console.log('🎉 Success response returned');
    return new Response(JSON.stringify({
        success: true,
        message: 'Profile saved successfully'
    }), {
        headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json'
        },
        status: 200
    });
}
/**
 * Creates an error response
 */ function createErrorResponse(error) {
    console.error('💥 Error occurred:', error.message);
    console.error('📚 Stack trace:', error.stack);
    return new Response(JSON.stringify({
        success: false,
        error: error.message
    }), {
        headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json'
        },
        status: 400
    });
}
/**
 * Main request handler
 */ async function saveFarmerProfileHandler(req) {
    const supabase = createSupabaseClient();
    const token = extractAuthToken(req);
    const user = await authenticateUser(supabase, token);
    const profileData = await parseAndValidateBody(req);
    await saveFarmerProfile(supabase, user.id, profileData);
    return createSuccessResponse();
}
/**
 * Edge Function Entry Point
 */ Deno.serve(async (req) => {
    console.log('🚀 save-farmer-profile invoked:', req.method);
    if (req.method === 'OPTIONS') return handleOptionsRequest();
    try {
        return await saveFarmerProfileHandler(req);
    } catch (error) {
        return createErrorResponse(error);
    }
});
