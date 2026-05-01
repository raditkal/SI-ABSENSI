import React, { useState } from 'react';
import { FaFingerprint, FaSignOutAlt, FaChevronDown, FaKey, FaUserCircle } from "react-icons/fa";
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  dosenName?: string;
}

export default function Navbar({ dosenName = 'Dosen' }: NavbarProps) {
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

        // 1. Verifikasi password lama
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: oldPassword,
        });

        if (signInError) {
            throw new Error("Password sekarang salah!");
        }

        // 2. Update password
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
    <nav className="sticky top-0 z-[100] glass px-4 lg:px-6 py-3 lg:py-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2 lg:gap-3 group cursor-pointer" onClick={() => location.reload()}>
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white rotate-3 group-hover:rotate-0 transition-transform shadow-lg">
                    <FaFingerprint className="text-lg lg:text-xl" />
                </div>
                <div>
                    <h1 className="font-extrabold tracking-tight text-sm lg:text-lg uppercase italic leading-none">Presensi Hub</h1>
                    <span className="hidden sm:block text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Lecturer Edition</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-3">
                {/* Desktop View */}
                <div className="hidden lg:flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-indigo-500 uppercase leading-none">Welcome back,</p>
                        <p className="text-xs font-extrabold text-slate-700">{dosenName}</p>
                    </div>
                    <button 
                        onClick={() => setIsChangingPassword(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-[10px] uppercase hover:bg-indigo-600 hover:text-white transition-all"
                    >
                        <FaKey /> Settings
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-500 font-bold text-[10px] uppercase hover:bg-rose-500 hover:text-white transition-all"
                    >
                        <FaSignOutAlt /> Keluar
                    </button>
                </div>
                
                {/* Mobile View Dropdown */}
                <div className="relative lg:hidden">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl hover:bg-slate-50 transition-all border border-slate-100"
                    >
                        <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
                            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-bold text-indigo-600 text-[10px]">{dosenName.charAt(0).toUpperCase()}</div>
                        </div>
                        <FaChevronDown className={`text-[10px] text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-4 py-2 border-b border-slate-100 mb-1">
                                <p className="text-[10px] font-black text-indigo-500 uppercase">Login as</p>
                                <p className="text-xs font-bold text-slate-700 truncate">{dosenName}</p>
                            </div>
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
