import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twjamqzehtterpgiqhus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3amFtcXplaHR0ZXJwZ2lxaHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NDE2MTgsImV4cCI6MjA4MjAxNzYxOH0.npkBGzilSCp2GWaVUZvVthmklwgba61D-nvYuVhFcK8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('--- TESTING SUPABASE ---');
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
        console.error('❌ Supabase Connection Failed:', error.message);
    } else {
        console.log('✅ Supabase Connection OK');
    }
}

testConnection();
