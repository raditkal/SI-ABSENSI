import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkJadwal() {
  const { data: dosen } = await supabase.from('dosen').select('id, nama_lengkap').not('user_id', 'is', null).single();
  console.log("Dosen:", dosen?.nama_lengkap);

  const { data: jadwal } = await supabase
    .from('jadwal')
    .select(`
        id,
        hari,
        jam_mulai,
        jam_selesai,
        ruangan,
        matakuliah(nama_mk, sks)
    `)
    .eq('id_dosen', dosen?.id);

  console.log("Jadwal length:", jadwal?.length);
  console.log(JSON.stringify(jadwal, null, 2));
}

checkJadwal();
