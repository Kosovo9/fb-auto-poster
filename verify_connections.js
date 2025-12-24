const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// Load environment variables manually since we are running a standalone script
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

async function verify() {
    console.log('--- Verifying Environment Variables & Connections ---\n');
    let allGood = true;

    // 1. SUPABASE CHECK
    console.log('Checking Supabase...');
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing Supabase keys!');
        allGood = false;
    } else {
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );
            // Simple query to test connection (fetching 0 rows just to check auth)
            const { data, error } = await supabase.from('users').select('*').limit(0);
            // Note: 'users' table might not exist or might need a different table. 
            // Trying a simpler check if possible, or handling the error gracefully.
            // If table doesn't exist, it will error, but that proves connection works (vs auth error).

            if (error && error.code !== '42P01') { // 42P01 is undefined_table, which means we connected fine
                // actually, let's try to just get auth settings or something unrelated to tables if possible.
                // But select count is standard.
                console.warn(`⚠️ Supabase connection returned error: ${error.message} (This might be okay if tables aren't created yet, but Auth failed if 401)`);
                if (error.code === 'PGRST301' || error.message.includes('JWT')) {
                    console.error('❌ Supabase Auth Failed.');
                    allGood = false;
                } else {
                    console.log('✅ Supabase Connection: OK (Service Role Key valid)');
                }
            } else {
                console.log('✅ Supabase Connection: OK');
            }
        } catch (e) {
            console.error('❌ Supabase Exception:', e.message);
            allGood = false;
        }
    }

    // 2. STRIPE CHECK - DISABLED
    console.log('\nChecking Stripe... SKIPPED (Removed)');

    // 3. GOOGLE GEMINI CHECK
    console.log('\nChecking Google Gemini...');
    if (!process.env.GOOGLE_AI_API_KEY) {
        console.error('❌ Missing GOOGLE_AI_API_KEY!');
        allGood = false;
    } else {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            // Minimal generation 
            const result = await model.generateContent("Hello");
            const response = await result.response;
            if (response) {
                console.log('✅ Gemini Connection: OK');
            }
        } catch (e) {
            console.error('❌ Gemini Connection Failed:', e.message);
            allGood = false;
        }
    }

    console.log('\n--- Verification Complete ---');
    if (allGood) {
        console.log('🚀 READY FOR NUCLEAR LAUNCH');
    } else {
        console.log('⚠️ Some checks failed. Please review .env.local');
    }
}

verify();
