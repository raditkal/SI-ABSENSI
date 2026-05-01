import React, { useState } from 'react';
import { FaFingerprint, FaCog, FaSignOutAlt, FaChevronDown, FaUserCircle, FaKey } from "react-icons/fa";
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) throw new Error("User email not found");

        // 1. Verifikasi password lama dengan mencoba login ulang
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: oldPassword,
        });

        if (signInError) {
            throw new Error("Password sekarang salah!");
        }

        // 2. Jika login sukses, baru update password
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (updateError) throw updateError;

        alert("Password berhasil diubah!");
        setIsChangingPassword(false);
        setOldPassword('');
        setNewPassword('');
    } catch (err: any) {
        alert(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
    <nav className="fixed top-4 left-4 right-4 z-[100]">
      <div className="max-w-7xl mx-auto glass rounded-[2rem] p-3 lg:p-4 flex justify-between items-center shadow-xl shadow-indigo-100/20">
        <div className="flex items-center gap-3 ml-2">
          <div className="w-10 h-10 card-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
            <FaFingerprint className="text-xl" />
          </div>
          <h1 className="font-extrabold tracking-tighter text-slate-800 uppercase text-xs lg:text-sm">
            Presensi<span className="text-indigo-600">Hub</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
            {/* Desktop View */}
            <div className="hidden lg:flex items-center gap-2">
                <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all"
                >
                    <FaKey /> Ganti Password
                </button>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-500 font-bold text-xs hover:bg-rose-500 hover:text-white transition-all"
                >
                    <FaSignOutAlt /> Keluar
                </button>
            </div>

            {/* Mobile View Dropdown */}
            <div className="relative lg:hidden">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-2xl hover:bg-slate-50 transition-all border border-slate-100"
                >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <FaUserCircle className="text-lg" />
                    </div>
                    <FaChevronDown className={`text-[10px] text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => { setIsChangingPassword(true); setIsMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        >
                            <FaKey className="text-indigo-400" /> Ganti Password
                        </button>
                        <div className="h-px bg-slate-100 my-1 mx-2"></div>
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all"
                        >
                            <FaSignOutAlt /> Keluar
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </nav>

    {/* Modal Ganti Password */}
    {isChangingPassword && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <h3 className="text-xl font-black text-slate-800 uppercase italic mb-6">Ubah Password</h3>
                <form onSubmit={handleChangePassword}>
                    <div className="space-y-4 mb-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Password Sekarang</p>
                            <input 
                                type="password" 
                                required 
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 ring-indigo-500 outline-none transition-all"
                                placeholder="Masukkan password saat ini"
                            />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Password Baru</p>
                            <input 
                                type="password" 
                                required 
                                minLength={5}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 ring-indigo-500 outline-none transition-all"
                                placeholder="Minimal 5 karakter"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            disabled={isSubmitting}
                            onClick={() => { setIsChangingPassword(false); setOldPassword(''); setNewPassword(''); }}
                            className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "Memproses..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}
    </>
  );
}
