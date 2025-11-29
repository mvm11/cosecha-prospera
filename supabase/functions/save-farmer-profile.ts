import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
};

/**
 * Handles CORS preflight requests
 */
function handleOptionsRequest() {
    return new Response('ok', {
        status: 200,
        headers: CORS_HEADERS
    });
}

/**
 * Creates a Supabase client instance
 */
function createSupabaseClient() {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    return supabase;
}

/**
 * Extracts and validates the authorization token
 */
function extractAuthToken(req) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        throw new Error('Missing Authorization header');
    }
    return authHeader.replace('Bearer ', '');
}

/**
 * Validates the user token and returns the authenticated user
 */
async function authenticateUser(supabase, token) {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        throw new Error('Invalid token');
    }

    return user;
}

/**
 * Parses and validates request body fields
 */
async function parseAndValidateBody(req) {
    const { region, hectares, coffee_variety } = await req.json();

    if (!region || !hectares || !coffee_variety) {
        throw new Error('Missing required fields');
    }

    if (typeof hectares !== 'number' || hectares <= 0) {
        throw new Error('Hectares must be a positive number');
    }

    return {
        region,
        hectares,
        coffee_variety
    };
}

/**
 * Saves (upserts) the farmer profile in the database
 */
async function saveFarmerProfile(supabase, userId, profileData) {
    const payload = {
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('farmer_profiles')
        .upsert(payload);

    if (error) {
        throw new Error('Database error while saving profile');
    }
}

/**
 * Creates a success response
 */
function createSuccessResponse() {
    return new Response(
        JSON.stringify({
            success: true,
            message: 'Profile saved successfully'
        }),
        {
            headers: {
                ...CORS_HEADERS,
                'Content-Type': 'application/json'
            },
            status: 200
        }
    );
}

/**
 * Creates an error response
 */
function createErrorResponse(error) {
    return new Response(
        JSON.stringify({
            success: false,
            error: error.message
        }),
        {
            headers: {
                ...CORS_HEADERS,
                'Content-Type': 'application/json'
            },
            status: 400
        }
    );
}

/**
 * Main request handler
 */
async function saveFarmerProfileHandler(req) {
    const supabase = createSupabaseClient();
    const token = extractAuthToken(req);
    const user = await authenticateUser(supabase, token);
    const profileData = await parseAndValidateBody(req);

    await saveFarmerProfile(supabase, user.id, profileData);

    return createSuccessResponse();
}

/**
 * Edge Function Entry Point
 */
Deno.serve(async (req) => {
    const start = Date.now();

    if (req.method === 'OPTIONS') {
        return handleOptionsRequest();
    }

    try {
        console.log(`🚀 [${new Date().toISOString()}] ${req.method} save-farmer-profile`);
        const result = await saveFarmerProfileHandler(req);
        console.log(`✅ Success [${Date.now() - start}ms]`);
        return result;
    } catch (error) {
        console.error(`❌ Error [${Date.now() - start}ms]: ${error.message}`);
        return createErrorResponse(error);
    }
});