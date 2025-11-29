import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ✅ SECURITY FIX: CORS configuration based on environment
const isDev = Deno.env.get('ENVIRONMENT') !== 'production';

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": isDev ? "*" : "https://your-production-domain.com",
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
    // ✅ SECURITY FIX: Check request size limit (1MB max)
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1048576) {
        throw new Error('Request body too large (max 1MB)');
    }

    const body = await req.json();
    const { region, hectares, coffee_variety } = body;

    // ✅ SECURITY FIX: Validate field existence
    if (!region || !hectares || !coffee_variety) {
        throw new Error('Missing required fields');
    }

    // ✅ SECURITY FIX: Validate types to prevent object injection
    if (typeof region !== 'string' || typeof coffee_variety !== 'string') {
        throw new Error('Invalid field types - strings expected');
    }

    // ✅ SECURITY FIX: Validate string lengths to prevent DoS
    if (region.length > 100 || coffee_variety.length > 100) {
        throw new Error('Field too long (max 100 characters)');
    }

    // ✅ SECURITY FIX: Validate hectares range
    if (typeof hectares !== 'number' || hectares <= 0 || hectares > 10000) {
        throw new Error('Hectares must be a positive number between 0 and 10000');
    }

    // ✅ SECURITY FIX: Sanitize strings (trim and limit)
    const cleanRegion = region.trim().substring(0, 100);
    const cleanVariety = coffee_variety.trim().substring(0, 100);

    return {
        region: cleanRegion,
        hectares,
        coffee_variety: cleanVariety
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