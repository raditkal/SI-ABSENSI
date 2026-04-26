import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugData() {
  console.log("=== Data Dosen ===");
  const { data: dosen } = await supabase.from('dosen').select('*');
  console.log(JSON.stringify(dosen, null, 2));

  console.log("=== Jadwal ===");
  const { data: jadwal } = await supabase.from('jadwal').select('id, id_dosen, hari, matakuliah(nama_mk, sks)');
  console.log(JSON.stringify(jadwal, null, 2));
}

debugData();
