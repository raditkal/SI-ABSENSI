import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixJadwal() {
  console.log("Mencari data Dosen pertama...");
  const { data: dosen } = await supabase.from('dosen').select('id, nama_lengkap').limit(1).single();
  
  if (dosen) {
    console.log(`Ditemukan Dosen: ${dosen.nama_lengkap} (ID: ${dosen.id})`);
    console.log("Memperbarui semua jadwal agar dimiliki oleh Dosen ini...");
    
    const { error } = await supabase
      .from('jadwal')
      .update({ id_dosen: dosen.id })
      .neq('id_dosen', '00000000-0000-0000-0000-000000000000'); // Dummy condition to target all

    if (error) {
      console.error("Gagal update jadwal:", error.message);
    } else {
      console.log("Sukses! Semua jadwal sekarang masuk ke Dosen ini.");
    }
  } else {
    console.log("Tidak ada data Dosen di tabel.");
  }
}

fixJadwal();
