import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// We need the service role key to bypass RLS and create buckets, 
// but since we only have ANON key in .env.local, it might fail.
// If you don't have SERVICE_ROLE_KEY, it's better to do it manually.
// Let's try with what we have, but it's highly recommended to use the Dashboard.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  console.log("Mencoba membuat bucket 'bukti-izin'...");
  const { data, error } = await supabase.storage.createBucket('bukti-izin', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
    fileSizeLimit: 5242880, // 5MB
  });

  if (error) {
    console.error("Gagal membuat bucket:", error.message);
    console.log("Silakan buat secara manual melalui Supabase Dashboard -> Storage.");
  } else {
    console.log("SUKSES: Bucket 'bukti-izin' berhasil dibuat!");
  }
}

createBucket();
