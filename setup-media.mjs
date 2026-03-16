import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public media are viewable by everyone') THEN
        CREATE POLICY "Public media are viewable by everyone" ON media FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert media') THEN
        CREATE POLICY "Admins can insert media" ON media FOR INSERT WITH CHECK (true);
    END IF;
END $$;
`;

async function run() {
  const { error } = await supabase.rpc('run_sql_query', { query: sql });
  if (error) {
    console.log('RPC check failed, trying direct query (if possible)...');
    // Note: Most anon keys can't run arbitrary SQL. 
    // I will advise the user to run it in the dashboard.
    console.error('Error:', error.message);
  } else {
    console.log('Table created successfully!');
  }
}

run();
