import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ''; // we use anon key to test if it can update

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUpdate() {
  // Try to update a dummy row using the anon key
  const { data, error } = await supabase
    .from('jadwal')
    .update({ hari: 'Senin' })
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select(); // Ask Supabase to return the updated rows

  console.log("Error:", error);
  console.log("Updated Data:", data);
}

checkUpdate();
