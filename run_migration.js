const { Client } = require('pg');
const fs = require('fs');

async function runMigration() {
    // Try to construct connection string or fallback
    // Ref: twjamqzehtterpgiqhus
    // Pass: 6c4b0b29cd0e4fb692e679fe054d2be0 (Attempt 1)

    const connectionString = 'postgres://postgres.twjamqzehtterpgiqhus:6c4b0b29cd0e4fb692e679fe054d2be0@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

    console.log('Attempting to connect to DB via pooling...');
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to Database!');

        const sql = fs.readFileSync('supabase_nuclear_migration.sql', 'utf8');
        console.log('Executing Migration SQL...');

        await client.query(sql);
        console.log('✅ Migration Executed Successfully!');

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration Failed:', err.message);
        if (err.message.includes('password')) {
            console.log('⚠️ Password rejected. Cannot auto-migrate via SQL script without correct DB pass.');
        }
        process.exit(1);
    }
}

runMigration();
