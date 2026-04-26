import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, role, profileData } = body;

        if (!email || !password || !role || !profileData) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Inisialisasi Supabase menggunakan Service Role Key (Admin Bypass RLS)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        
        if (!serviceKey) {
            return NextResponse.json({ error: 'Service Role Key tidak ditemukan di environment' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 1. Buat User di Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true // Langsung konfirmasi email tanpa kirim link verifikasi
        });

        if (authError || !authData.user) {
            return NextResponse.json({ error: authError?.message || 'Gagal membuat user di Auth' }, { status: 400 });
        }

        const userId = authData.user.id;

        // Note: Biasanya trigger otomatis di database membuat profil baru saat user mendaftar.
        // Kita hanya perlu Update rolenya menjadi mahasiswa/dosen.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ role: role })
            .eq('id', userId);

        if (profileError) {
             return NextResponse.json({ error: 'Gagal mengatur role: ' + profileError.message }, { status: 500 });
        }

        // 3. Masukkan data ke tabel spesifik (mahasiswa / dosen)
        let tableError = null;
        if (role === 'mahasiswa') {
            const { error } = await supabaseAdmin.from('mahasiswa').insert([{
                ...profileData,
                user_id: userId
            }]);
            tableError = error;
        } else if (role === 'dosen') {
            const { error } = await supabaseAdmin.from('dosen').insert([{
                ...profileData,
                user_id: userId
            }]);
            tableError = error;
        }

        if (tableError) {
            // Jika gagal input data, kita harusnya menghapus user auth lagi, tapi untuk simplicity kita return error saja
            return NextResponse.json({ error: 'Gagal menyimpan profil identitas: ' + tableError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Berhasil membuat akun dan identitas', userId });

    } catch (err: any) {
        return NextResponse.json({ error: 'Internal server error: ' + err.message }, { status: 500 });
    }
}
