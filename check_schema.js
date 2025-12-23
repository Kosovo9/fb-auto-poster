const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) process.env[k] = envConfig[k];

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    console.log('Checking Database Schema...');

    // Check if 'users' table exists 
    // We try to select from expected tables: profiles, subscriptions, groups
    const tables = ['profiles', 'subscriptions', 'scheduled_posts'];

    for (const table of tables) {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error) {
            console.error(`❌ Table '${table}' check failed:`, error.message);
            // If error is related to relation does not exist, we need migration
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
                console.log(`⚠️ Table '${table}' missing. Migration needed.`);
                return false;
            }
        } else {
            console.log(`✅ Table '${table}' exists.`);
        }
    }
    return true;
}

async function run() {
    const isSchemaOk = await checkSchema();
    if (!isSchemaOk) {
        console.log('>>> ATTEMPTING MIGRATION <<<');
        // We cannot run SQL easily via JS client without an SQL function or direct connection string.
        // But we can warn the user.
        // OR if we have the 'postgres' connection string we could... but we typically only have HTTP API.
        // Supabase JS client doesn't support raw SQL execution unless a stored procedure exists.
        console.warn('Please run the file "supabase_nuclear_migration.sql" in your Supabase SQL Editor to fix the schema.');
    } else {
        console.log('🚀 Database Schema looks ready.');
    }
}

run();
