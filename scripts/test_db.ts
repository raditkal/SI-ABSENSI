import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: cols } = await supabase.from('mahasiswa').select('*').limit(1);
  console.log("Mahasiswa columns:", cols);
  
  const { data: jadwal } = await supabase.from('jadwal').select('*').limit(1);
  console.log("Jadwal columns:", jadwal);

  const { data: sesi } = await supabase.from('sesi_perkuliahan').select('*').limit(1);
  console.log("Sesi columns:", sesi);
}

check();
