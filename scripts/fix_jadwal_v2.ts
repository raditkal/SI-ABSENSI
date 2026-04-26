import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixJadwal() {
  console.log("Mencari Dosen yang memiliki user_id...");
  const { data: dosen } = await supabase.from('dosen').select('*').not('user_id', 'is', null).limit(1).single();
  
  if (dosen) {
    console.log(`Ditemukan Dosen Auth: ${dosen.nama_lengkap} (ID: ${dosen.id})`);
    
    // Assign all schedules to this Dosen so they appear in their dashboard!
    const { error } = await supabase
      .from('jadwal')
      .update({ id_dosen: dosen.id })
      .neq('id_dosen', '00000000-0000-0000-0000-000000000000'); // dummy condition to target all

    if (error) {
      console.error("Gagal update jadwal:", error.message);
    } else {
      console.log("Sukses! Semua jadwal sekarang masuk ke Dosen:", dosen.nama_lengkap);
    }
  } else {
    console.log("Tidak ada Dosen dengan user_id yang login.");
  }
}

fixJadwal();
