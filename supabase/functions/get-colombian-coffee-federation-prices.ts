import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

// ✅ SECURITY FIX: CORS configuration based on environment
const isDev = Deno.env.get('ENVIRONMENT') !== 'production';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': isDev ? '*' : 'https://your-production-domain.com',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const COFFEE_PRICE_FILE_URL = 'https://federaciondecafeteros.org/app/uploads/2025/01/Precios-area-y-produccion-de-cafe-2025.xlsx';
const DAILY_PRICE_SHEET_NAME = 'Precio Interno Diario';
const MAX_HEADER_SEARCH_ROWS = 20;

/**
 * Parses a price value from Colombian format (e.g., "277.000") to a number
 */
function parseColombianPrice(value) {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        return parseFloat(value.replace(/\./g, '').replace(/,/g, '.'));
    }
    return 0;
}

/**
 * Converts an Excel date number to ISO date string
 */
function convertExcelDateToISO(excelDate) {
    try {
        const date = XLSX.SSF.parse_date_code(excelDate);
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    } catch (error) {
        return null;
    }
}

/**
 * Parses a date value from various formats (Date object, string, Excel number)
 */
function parseDate(rawDate) {
    if (rawDate instanceof Date) {
        return rawDate.toISOString().split('T')[0];
    }
    if (typeof rawDate === 'string') {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }
        return null;
    }
    if (typeof rawDate === 'number') {
        return convertExcelDateToISO(rawDate);
    }
    return null;
}

/**
 * Fetches the Excel file from the coffee federation website
 */
async function fetchCoffeeExcelFile() {
    const response = await fetch(COFFEE_PRICE_FILE_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    return await response.arrayBuffer();
}

/**
 * Parses the Excel workbook and returns the daily price sheet
 */
function parseCoffeeWorkbook(arrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, {
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
    });

    let sheetName = workbook.SheetNames.find((name) =>
        name.includes(DAILY_PRICE_SHEET_NAME) || name.includes('Diario')
    );

    if (!sheetName) {
        sheetName = workbook.SheetNames[1];
    }

    return workbook.Sheets[sheetName];
}

/**
 * Converts worksheet to JSON array format
 */
function convertWorksheetToJSON(worksheet) {
    return XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        dateNF: 'yyyy-mm-dd'
    });
}

/**
 * Locates the date and price columns in the worksheet
 */
function findColumnIndices(jsonData) {
    let dateColumn = -1;
    let priceColumn = -1;
    let headerRow = -1;

    for (let rowIndex = 0; rowIndex < Math.min(MAX_HEADER_SEARCH_ROWS, jsonData.length); rowIndex++) {
        const row = jsonData[rowIndex];
        if (!Array.isArray(row)) continue;

        for (let colIndex = 0; colIndex < row.length; colIndex++) {
            const cell = row[colIndex];
            if (typeof cell !== 'string') continue;

            if ((cell.includes('Fecha') || cell.toLowerCase() === 'fecha') && dateColumn === -1) {
                dateColumn = colIndex;
                headerRow = rowIndex;
            }

            if (cell.includes('Precio Interno') && !cell.includes('Promedio') && priceColumn === -1 && colIndex !== dateColumn) {
                priceColumn = colIndex;
            }
        }

        if (dateColumn !== -1 && priceColumn !== -1) break;
    }

    if (dateColumn === -1 || priceColumn === -1) {
        throw new Error(`Could not find columns. Date: ${dateColumn}, Price: ${priceColumn}`);
    }

    return { dateColumn, priceColumn, headerRow };
}

/**
 * Extracts all valid coffee price data from the worksheet
 */
function extractAllPrices(jsonData, columns) {
    const prices = [];

    for (let rowIndex = columns.headerRow + 1; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex];
        if (!Array.isArray(row)) continue;

        const rawDate = row[columns.dateColumn];
        const rawPrice = row[columns.priceColumn];

        if (!rawDate || !rawPrice) continue;

        const dateStr = parseDate(rawDate);
        const price = parseColombianPrice(rawPrice);

        if (dateStr && price > 0) {
            prices.push({ date: dateStr, price });
        }
    }

    if (prices.length === 0) {
        throw new Error('Could not find any valid data rows');
    }

    return prices;
}

/**
 * Fetches existing dates from the database to avoid unnecessary updates
 */
async function getExistingDates(supabase) {
    const { data, error } = await supabase
        .from('historical_prices')
        .select('date')
        .order('date', { ascending: true });

    if (error) {
        return new Set();
    }

    return new Set(data.map((record) => record.date));
}

/**
 * Saves all new coffee price records to Supabase (skips existing ones)
 */
async function savePricesToDatabase(pricesData) {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const existingDates = await getExistingDates(supabase);
    const newPrices = pricesData.filter((price) => !existingDates.has(price.date));

    if (newPrices.length === 0) {
        return {
            insertedCount: 0,
            skippedCount: pricesData.length
        };
    }

    const recordsToInsert = newPrices.map((price) => ({
        date: price.date,
        fnc_price: price.price
    }));

    const { error } = await supabase
        .from('historical_prices')
        .upsert(recordsToInsert, {
            onConflict: 'date',
            ignoreDuplicates: true
        });

    if (error) {
        throw error;
    }

    return {
        insertedCount: newPrices.length,
        skippedCount: pricesData.length - newPrices.length
    };
}

/**
 * Handles CORS preflight requests
 */
function handleOptionsRequest() {
    return new Response('ok', { headers: CORS_HEADERS });
}

/**
 * Creates a success response
 */
function createSuccessResponse(data, insertedCount, skippedCount) {
    return new Response(
        JSON.stringify({
            success: true,
            latestPrice: data,
            summary: {
                totalRecords: insertedCount + skippedCount,
                newRecordsInserted: insertedCount,
                existingRecordsSkipped: skippedCount
            }
        }),
        {
            headers: {
                ...CORS_HEADERS,
                'Content-Type': 'application/json'
            }
        }
    );
}

/**
 * Creates an error response
 */
function createErrorResponse(error) {
    return new Response(
        JSON.stringify({
            error: error.message,
            stack: error.stack
        }),
        {
            status: 500,
            headers: {
                ...CORS_HEADERS,
                'Content-Type': 'application/json'
            }
        }
    );
}

/**
 * Main handler for the coffee price update function
 */
async function updateCoffeePriceHandler() {
    const arrayBuffer = await fetchCoffeeExcelFile();
    const worksheet = parseCoffeeWorkbook(arrayBuffer);
    const jsonData = convertWorksheetToJSON(worksheet);
    const columnIndices = findColumnIndices(jsonData);
    const allPrices = extractAllPrices(jsonData, columnIndices);
    const { insertedCount, skippedCount } = await savePricesToDatabase(allPrices);

    const latestPrice = allPrices[allPrices.length - 1];
    return createSuccessResponse(latestPrice, insertedCount, skippedCount);
}

/**
 * Edge function entry point
 */
Deno.serve(async (req) => {
    const start = Date.now();

    if (req.method === 'OPTIONS') {
        return handleOptionsRequest();
    }

    try {
        console.log(`🚀 [${new Date().toISOString()}] ${req.method} update-coffee-prices`);
        const result = await updateCoffeePriceHandler();
        const body = await result.json();
        console.log(`✅ Success [${Date.now() - start}ms] - Inserted: ${body.summary.newRecordsInserted}, Skipped: ${body.summary.existingRecordsSkipped}`);
        return new Response(JSON.stringify(body), result);
    } catch (error) {
        console.error(`❌ Error [${Date.now() - start}ms]: ${error.message}`);
        return createErrorResponse(error);
    }
});