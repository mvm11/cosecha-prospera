import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const COFFEE_PRICE_FILE_URL = 'https://federaciondecafeteros.org/app/uploads/2025/01/Precios-area-y-produccion-de-cafe-2025.xlsx';
const DAILY_PRICE_SHEET_NAME = 'Precio Interno Diario';
const MAX_HEADER_SEARCH_ROWS = 20;
/**
 * Parses a price value from Colombian format (e.g., "277.000") to a number
 */ function parseColombianPrice(value) {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        // Remove thousand separators (dots) and replace decimal comma with period
        return parseFloat(value.replace(/\./g, '').replace(/,/g, '.'));
    }
    return 0;
}
/**
 * Converts an Excel date number to ISO date string
 */ function convertExcelDateToISO(excelDate) {
    try {
        const date = XLSX.SSF.parse_date_code(excelDate);
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    } catch (error) {
        console.error('⚠️ Failed to convert Excel date:', excelDate, error);
        return null;
    }
}
/**
 * Parses a date value from various formats (Date object, string, Excel number)
 */ function parseDate(rawDate) {
    if (rawDate instanceof Date) {
        const dateStr = rawDate.toISOString().split('T')[0];
        return dateStr;
    }
    if (typeof rawDate === 'string') {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
            const dateStr = parsed.toISOString().split('T')[0];
            return dateStr;
        }
        return null;
    }
    if (typeof rawDate === 'number') {
        const dateStr = convertExcelDateToISO(rawDate);
        return dateStr;
    }
    return null;
}
/**
 * Fetches the Excel file from the coffee federation website
 */ async function fetchCoffeeExcelFile() {
    console.log('📥 Fetching file from:', COFFEE_PRICE_FILE_URL);
    const response = await fetch(COFFEE_PRICE_FILE_URL);
    if (!response.ok) {
        console.error('❌ Failed to fetch file:', response.statusText);
        throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    console.log('✅ File fetched successfully');
    return await response.arrayBuffer();
}
/**
 * Parses the Excel workbook and returns the daily price sheet
 */ function parseCoffeeWorkbook(arrayBuffer) {
    console.log('📦 File size:', arrayBuffer.byteLength, 'bytes');
    console.log('📊 Parsing Excel file with SheetJS...');
    const workbook = XLSX.read(arrayBuffer, {
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
    });
    console.log('✅ Workbook loaded, sheets:', workbook.SheetNames);
    let sheetName = workbook.SheetNames.find((name) => name.includes(DAILY_PRICE_SHEET_NAME) || name.includes('Diario'));
    if (!sheetName) {
        console.log('⚠️ Daily price sheet not found, using sheet at index 1');
        sheetName = workbook.SheetNames[1];
    }
    console.log('📄 Using sheet:', sheetName);
    return workbook.Sheets[sheetName];
}
/**
 * Converts worksheet to JSON array format
 */ function convertWorksheetToJSON(worksheet) {
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        dateNF: 'yyyy-mm-dd'
    });
    console.log('📋 Total rows:', jsonData.length);
    return jsonData;
}
/**
 * Locates the date and price columns in the worksheet
 */ function findColumnIndices(jsonData) {
    console.log('🔍 Searching for Date and Price columns...');
    let dateColumn = -1;
    let priceColumn = -1;
    let headerRow = -1;
    for (let rowIndex = 0; rowIndex < Math.min(MAX_HEADER_SEARCH_ROWS, jsonData.length); rowIndex++) {
        const row = jsonData[rowIndex];
        if (!Array.isArray(row)) continue;
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
            const cell = row[colIndex];
            if (typeof cell !== 'string') continue;
            // Search for date column
            if ((cell.includes('Fecha') || cell.toLowerCase() === 'fecha') && dateColumn === -1) {
                dateColumn = colIndex;
                headerRow = rowIndex;
                console.log('📅 Found Date column at index:', colIndex, 'row:', rowIndex, '- value:', cell);
            }
            // Search for price column (must be different from date column)
            if (cell.includes('Precio Interno') && !cell.includes('Promedio') && priceColumn === -1 && colIndex !== dateColumn) {
                priceColumn = colIndex;
                console.log('💰 Found Price column at index:', colIndex, '- value:', cell);
            }
        }
        if (dateColumn !== -1 && priceColumn !== -1) break;
    }
    if (dateColumn === -1 || priceColumn === -1) {
        console.error('❌ Missing columns. Date index:', dateColumn, 'Price index:', priceColumn);
        throw new Error(`Could not find columns. Date: ${dateColumn}, Price: ${priceColumn}`);
    }
    console.log('✅ Columns found - Date index:', dateColumn, 'Price index:', priceColumn);
    return {
        dateColumn,
        priceColumn,
        headerRow
    };
}
/**
 * Extracts all valid coffee price data from the worksheet
 */ function extractAllPrices(jsonData, columns) {
    console.log('🔍 Extracting all valid price records...');
    const prices = [];
    // Iterate through all rows after the header
    for (let rowIndex = columns.headerRow + 1; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex];
        if (!Array.isArray(row)) continue;
        const rawDate = row[columns.dateColumn];
        const rawPrice = row[columns.priceColumn];
        if (!rawDate || !rawPrice) continue;
        const dateStr = parseDate(rawDate);
        const price = parseColombianPrice(rawPrice);
        if (dateStr && price > 0) {
            prices.push({
                date: dateStr,
                price
            });
        }
    }
    console.log(`✅ Extracted ${prices.length} valid price records`);
    if (prices.length === 0) {
        console.error('❌ Could not find any valid data rows');
        throw new Error('Could not find any valid data rows');
    }
    return prices;
}
/**
 * Fetches existing dates from the database to avoid unnecessary updates
 */ async function getExistingDates(supabase) {
    console.log('🔍 Fetching existing dates from database...');
    // First, get the count
    const { count, error: countError } = await supabase.from('historical_prices').select('*', {
        count: 'exact',
        head: true
    });
    if (countError) {
        console.error('⚠️ Error counting records:', countError);
    } else {
        console.log(`📊 Total records in database: ${count}`);
    }
    // Fetch all dates without pagination limit
    const { data, error } = await supabase.from('historical_prices').select('date').order('date', {
        ascending: true
    });
    if (error) {
        console.error('⚠️ Error fetching existing dates:', error);
        return new Set();
    }
    const existingDates = new Set(data.map((record) => record.date));
    console.log(`📊 Fetched ${existingDates.size} unique dates from database`);
    // Debug: show first and last dates
    if (existingDates.size > 0) {
        const datesArray = Array.from(existingDates).sort();
        console.log(`📅 Date range in DB: ${datesArray[0]} to ${datesArray[datesArray.length - 1]}`);
    }
    return existingDates;
}
/**
 * Saves all new coffee price records to Supabase (skips existing ones)
 */ async function savePricesToDatabase(pricesData) {
    console.log('💾 Saving prices to Supabase...');
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Get existing dates to avoid updating historical records
    const existingDates = await getExistingDates(supabase);
    // Filter out records that already exist
    const newPrices = pricesData.filter((price) => !existingDates.has(price.date));
    if (newPrices.length === 0) {
        console.log('✅ All records already exist in database. No new records to insert.');
        return {
            insertedCount: 0,
            skippedCount: pricesData.length
        };
    }
    console.log(`📝 Inserting ${newPrices.length} new records (skipping ${pricesData.length - newPrices.length} existing)`);
    // Insert new records using upsert with ignoreDuplicates
    const recordsToInsert = newPrices.map((price) => ({
        date: price.date,
        fnc_price: price.price
    }));
    const { error } = await supabase.from('historical_prices').upsert(recordsToInsert, {
        onConflict: 'date',
        ignoreDuplicates: true
    });
    if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
    }
    console.log(`✅ Successfully inserted ${newPrices.length} new records to Supabase`);
    return {
        insertedCount: newPrices.length,
        skippedCount: pricesData.length - newPrices.length
    };
}
/**
 * Handles CORS preflight requests
 */ function handleOptionsRequest() {
    console.log('✅ OPTIONS request - returning CORS headers');
    return new Response('ok', {
        headers: CORS_HEADERS
    });
}
/**
 * Creates a success response
 */ function createSuccessResponse(data, insertedCount, skippedCount) {
    console.log('🎉 Function completed successfully');
    return new Response(JSON.stringify({
        success: true,
        latestPrice: data,
        summary: {
            totalRecords: insertedCount + skippedCount,
            newRecordsInserted: insertedCount,
            existingRecordsSkipped: skippedCount
        }
    }), {
        headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json'
        }
    });
}
/**
 * Creates an error response
 */ function createErrorResponse(error) {
    console.error('💥 Error occurred:', error.message);
    console.error('📚 Stack trace:', error.stack);
    return new Response(JSON.stringify({
        error: error.message,
        stack: error.stack
    }), {
        status: 500,
        headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json'
        }
    });
}
/**
 * Main handler for the coffee price update function
 */ async function updateCoffeePriceHandler() {
    const arrayBuffer = await fetchCoffeeExcelFile();
    const worksheet = parseCoffeeWorkbook(arrayBuffer);
    const jsonData = convertWorksheetToJSON(worksheet);
    const columnIndices = findColumnIndices(jsonData);
    const allPrices = extractAllPrices(jsonData, columnIndices);
    const { insertedCount, skippedCount } = await savePricesToDatabase(allPrices);
    // Return the most recent price for the response
    const latestPrice = allPrices[allPrices.length - 1];
    return createSuccessResponse(latestPrice, insertedCount, skippedCount);
}
/**
 * Edge function entry point
 */ Deno.serve(async (req) => {
    console.log('🚀 Function invoked');
    if (req.method === 'OPTIONS') {
        return handleOptionsRequest();
    }
    try {
        return await updateCoffeePriceHandler();
    } catch (error) {
        return createErrorResponse(error);
    }
});
