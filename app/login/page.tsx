'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { FaFingerprint } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";
import { FaKey } from "react-icons/fa";
import { FaUser } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('mahasiswa');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Login ke Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      alert(authError.message);
      setIsLoading(false);
      return;
    }

    // 2. Ambil Role dari tabel profiles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    // 3. Redirect berdasarkan role
    if (profileData?.role === 'admin') {
      router.push('/dashboard/admin');
    } else if (profileData?.role === 'dosen') {
      router.push('/dashboard/dosen');
    } else {
      router.push('/dashboard/mahasiswa');
    }

    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-8 font-['Plus_Jakarta_Sans']">
      <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(79,70,229,0.15)] w-full max-w-[460px] overflow-hidden border border-white/80">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] py-16 px-8 text-center text-white relative rounded-b-[3.5rem] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)] after:pointer-events-none">
          <div className="w-[70px] h-[70px] bg-white/15 backdrop-blur-md border border-white/30 rounded-[22px] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FaFingerprint className="text-3xl" />
          </div>
          <h1 className="text-3xl font-black tracking-[0.15em] mb-1 uppercase">PresensiHub</h1>
          <p className="text-[10px] font-bold tracking-[0.3em] opacity-80 uppercase">Sistem Autentikasi Terpadu</p>
        </div>

        {/* Form Container */}
        <div className="p-10 md:p-12">
          <form onSubmit={handleLogin} className="space-y-7">

            {/* Identitas Pengguna */}
            <div className="group">
              <label className="block text-[11px] font-[800] text-[#94a3b8] uppercase tracking-[0.15em] mb-3 ml-2">
                Identitas Pengguna
              </label>
              <div className="flex items-center bg-[#f8faff] border-2 border-transparent rounded-[1.5rem] p-1 transition-all duration-300 focus-within:bg-white focus-within:border-[#c7d2fe] focus-within:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.2)] focus-within:-translate-y-0.5">
                <div className="w-[45px] h-[45px] flex items-center justify-center text-[#818cf8] text-lg">
                  <MdAlternateEmail className="text-xl" />
                </div>
                <input
                  type="email"
                  placeholder="pindrasonesa1@gmail.com"
                  className="w-full bg-transparent border-none outline-none py-4 text-[0.95rem] font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Kata Sandi */}
            <div className="group">
              <label className="block text-[11px] font-[800] text-[#94a3b8] uppercase tracking-[0.15em] mb-3 ml-2">
                Kata Sandi
              </label>
              <div className="flex items-center bg-[#f8faff] border-2 border-transparent rounded-[1.5rem] p-1 transition-all duration-300 focus-within:bg-white focus-within:border-[#c7d2fe] focus-within:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.2)] focus-within:-translate-y-0.5">
                <div className="w-[45px] h-[45px] flex items-center justify-center text-[#818cf8] text-lg">
                  <FaKey className="text-l" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••••"
                  className="w-full bg-transparent border-none outline-none py-4 text-[0.95rem] font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Level Akses */}
            <div className="group">
              <label className="block text-[11px] font-[800] text-[#94a3b8] uppercase tracking-[0.15em] mb-3 ml-2">
                Level Akses
              </label>
              <div className="flex items-center bg-[#f8faff] border-2 border-transparent rounded-[1.5rem] p-1 px-3 transition-all duration-300 focus-within:bg-white focus-within:border-[#c7d2fe] focus-within:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.2)] focus-within:-translate-y-0.5">
                <div className="w-[45px] h-[45px] flex items-center justify-center text-[#818cf8] text-lg">
                  <FaUser className="text-l" />
                </div>
                <select
                  className="w-full bg-transparent border-none outline-none py-4 text-[0.95rem] font-semibold text-slate-700 appearance-none cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="mahasiswa">Mahasiswa (S1/D3)</option>
                  <option value="dosen">Tenaga Pengajar (Dosen)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-[800] uppercase tracking-[0.2em] p-5 rounded-[1.5rem] mt-4 shadow-[0_20px_40px_-10px_rgba(99,102,241,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(99,102,241,0.5)] active:scale-95 text-[0.8rem] disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-circle-notch animate-spin mr-3"></i> Memproses...
                </span>
              ) : 'Masuk Sekarang'}
            </button>
          </form>

          {/* Footer Copyright */}
          <p className="text-center text-slate-400 text-[9px] mt-10 font-bold uppercase tracking-[0.3em]">
            &copy; 2026 Universitas Indonesia • Versi 2.0.4
          </p>
        </div>
      </div>
    </main>
  );
}