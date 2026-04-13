import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ofolatolyxwxzujoblie.supabase.co";
const supabaseKey = "sb_publishable_Sv4Sm3Pk79ExQxjt47eFjQ_G68G6y-j";
const supabase = createClient(supabaseUrl, supabaseKey);

async function listCategories() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('name, slug');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Current Categories in DB:', categories.map(c => c.name));
}

listCategories();
