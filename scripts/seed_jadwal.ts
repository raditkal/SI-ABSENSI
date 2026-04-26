import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedData() {
  // 1. Get Logged in Dosen
  const { data: dosen } = await supabase.from('dosen').select('id, nama_lengkap').not('user_id', 'is', null).limit(1).single();
  if (!dosen) {
    console.log("No Dosen found with user_id.");
    return;
  }

  // 2. Insert new Matakuliah
  const newMk = [
    { nama_mk: 'Sistem Basis Data', sks: 3 },
    { nama_mk: 'Kecerdasan Buatan', sks: 3 },
    { nama_mk: 'Interaksi Manusia dan Komputer', sks: 2 },
  ];

  const { data: insertedMk, error: mkErr } = await supabase.from('matakuliah').insert(newMk).select();
  if (mkErr) {
    console.error("Error insert MK:", mkErr.message);
    return;
  }

  // 3. Create Jadwal for these new MKs for the Dosen
  const newJadwal = [
    { id_dosen: dosen.id, id_matakuliah: insertedMk[0].id, hari: 'Selasa', jam_mulai: '08:00', jam_selesai: '10:30', ruangan: 'Lab A' },
    { id_dosen: dosen.id, id_matakuliah: insertedMk[1].id, hari: 'Kamis', jam_mulai: '13:00', jam_selesai: '15:30', ruangan: 'Lab B' },
    { id_dosen: dosen.id, id_matakuliah: insertedMk[2].id, hari: 'Jumat', jam_mulai: '09:00', jam_selesai: '10:40', ruangan: 'Ruang 402' },
  ];

  const { error: jErr } = await supabase.from('jadwal').insert(newJadwal);
  if (jErr) {
    console.error("Error insert Jadwal:", jErr.message);
  } else {
    console.log("SUKSES: 3 Jadwal Baru berhasil ditambahkan untuk dosen", dosen.nama_lengkap);
  }
}

seedData();
