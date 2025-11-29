import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
};

const MASTER_PROMPT = `Eres un asesor experto en mercado de café colombiano.
Tu única meta es proveer una recomendación de venta **EXTREMADAMENTE CONCISA, CLARA y DIRECTA**.

CONTEXTO CLAVE:
{datos_historicos}
{perfil_usuario}
{historial_ventas}
Precio actual: {precio_actual}

INSTRUCCIONES CLAVE (La respuesta debe seguir este orden estricto):
1. **Longitud Máxima:** La respuesta TOTAL no puede exceder las **150 palabras**. Ve al grano.
2. **Análisis Breve:** Resume la tendencia de precios y el contexto internacional en **una sola oración** por punto.
3. **Foco en el Productor:** Integra el perfil del productor y su historial de ventas en el análisis.
4. **Recomendación ESPECÍFICA:** El punto más importante. Debe ser una acción directa (Vender X%, Retener, Esperar, etc.).
5. **Formato Estricto:** La respuesta debe usar ÚNICAMENTE los siguientes 4 encabezados en negrita, sin texto introductorio, y debe ser lo más escueta posible.

FORMATO DE RESPUESTA (Obligatorio, máximo 4 puntos):
**Análisis Rápido**
**Contexto General**
**Recomendación Personalizada** ✅/⚠️/💰
**Fundamento (Razón)**
`;

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
function extractAuthToken(req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        throw new Error('Missing Authorization header');
    }
    return authHeader.replace('Bearer ', '');
}

/**
 * Validates the user token and returns the authenticated user
 */
async function authenticateUser(supabase: any, token: string) {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        throw new Error('Invalid token');
    }

    return user;
}

/**
 * Fetches the farmer's profile
 */
async function fetchFarmerProfile(supabase: any, userId: string) {
    const { data, error } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        return null;
    }

    return data;
}

/**
 * Fetches the farmer's recent sales history
 */
async function fetchSalesHistory(supabase: any, userId: string) {
    const { data, error } = await supabase
        .from('sales_notes')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5);

    if (error) {
        return [];
    }

    return data;
}

/**
 * Fetches historical prices for trend analysis (last 30 days)
 */
async function fetchHistoricalPrices(supabase: any) {
    const { data, error } = await supabase
        .from('historical_prices')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

    if (error) {
        throw new Error('Could not fetch market data');
    }

    return data;
}

/**
* Calls Google Gemini API to generate the recommendation
*/
async function callGemini(prompt: string) {
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
        throw new Error('Server configuration error: Missing AI key');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`AI Service Error: ${data.error?.message || 'Unknown error'}`);
    }

    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (text) {
        return text;
    }

    if (candidate?.finishReason === 'SAFETY') {
        throw new Error('AI content was blocked by safety filters. Try adjusting the prompt.');
    }

    throw new Error('Invalid or empty response format from Gemini');
}

/**
 * Main request handler
 */
async function analyzeMarketHandler(req: Request) {
    const supabase = createSupabaseClient();
    const token = extractAuthToken(req);
    const user = await authenticateUser(supabase, token);

    // 1. Fetch Context Data in Parallel
    const [profile, sales, prices] = await Promise.all([
        fetchFarmerProfile(supabase, user.id),
        fetchSalesHistory(supabase, user.id),
        fetchHistoricalPrices(supabase),
    ]);

    if (!prices || prices.length === 0) {
        throw new Error('No market data available to analyze');
    }

    const currentPrice = prices[0];

    // 2. Format Context for Prompt
    const historicalDataStr = prices
        .map((p: any) => `- ${p.date}: $${p.fnc_price.toLocaleString('es-CO')}`)
        .join('\n');

    const profileStr = profile
        ? `Región: ${profile.region}, Hectáreas: ${profile.hectares}, Variedad: ${profile.coffee_variety}`
        : 'Perfil no configurado (Usuario nuevo)';

    const salesStr = sales.length > 0
        ? sales.map((s: any) => `- ${s.date}: ${s.kilograms_sold}kg a $${s.total_amount.toLocaleString('es-CO')}`).join('\n')
        : 'Sin ventas recientes';

    const currentPriceStr = `$${currentPrice.fnc_price.toLocaleString('es-CO')} (${currentPrice.date})`;

    // 3. Inject Context into Master Prompt
    const finalPrompt = MASTER_PROMPT
        .replace('{datos_historicos}', historicalDataStr)
        .replace('{perfil_usuario}', profileStr)
        .replace('{historial_ventas}', salesStr)
        .replace('{precio_actual}', currentPriceStr);

    // 4. Call AI
    const recommendation = await callGemini(finalPrompt);

    return new Response(
        JSON.stringify({
            success: true,
            recommendation,
            context: {
                price: currentPrice.fnc_price,
                date: currentPrice.date
            }
        }),
        {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            status: 200,
        }
    );
}

/**
 * Creates an error response
 */
function createErrorResponse(error: any) {
    return new Response(
        JSON.stringify({
            success: false,
            error: error.message
        }),
        {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            status: 400,
        }
    );
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
        console.log(`🚀 [${new Date().toISOString()}] ${req.method} analyze-coffee-market`);
        const result = await analyzeMarketHandler(req);
        console.log(`✅ Success [${Date.now() - start}ms]`);
        return result;
    } catch (error) {
        console.error(`❌ Error [${Date.now() - start}ms]: ${error.message}`);
        return createErrorResponse(error);
    }
});