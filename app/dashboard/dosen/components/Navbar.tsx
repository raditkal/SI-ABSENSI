import React from 'react';
import { FaFingerprint } from "react-icons/fa";
import { FaPowerOff } from "react-icons/fa6";
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-[100] glass px-6 py-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => location.reload()}>
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white rotate-3 group-hover:rotate-0 transition-transform shadow-lg">
                    <FaFingerprint className="text-xl" />
                </div>
                <div>
                    <h1 className="font-extrabold tracking-tight text-lg uppercase italic leading-none">Presensi Hub</h1>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Lecturer Edition</span>
                </div>
            </div>
            <div className="flex items-center gap-5">
                <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-black text-indigo-500 uppercase leading-none">Welcome back,</p>
                    <p className="text-xs font-extrabold text-slate-700">Dosen</p>
                </div>
                <div className="relative group">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] cursor-pointer">
                        <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-bold text-indigo-600">D</div>
                    </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all ml-2">
                  <FaPowerOff className="text-xl"/>
                </button>
            </div>
        </div>
    </nav>
  );
}
