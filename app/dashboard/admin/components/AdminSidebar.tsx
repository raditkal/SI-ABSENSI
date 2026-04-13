import React from 'react';
import { FaThLarge, FaUsers, FaUserTie, FaCalendarDay, FaChartPie, FaSignOutAlt, FaFingerprint } from "react-icons/fa";

interface AdminSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function AdminSidebar({ currentTab, setCurrentTab }: AdminSidebarProps) {
  return (
    <aside 
        className="w-72 rounded-[2.5rem] text-white hidden lg:flex flex-col p-6 shadow-2xl sticky top-4 h-[calc(100vh-2rem)]"
        style={{
            backgroundColor: '#0f172a',
            backgroundImage: 'radial-gradient(at 0% 0%, hsla(253,16%,15%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,25%,1) 0, transparent 50%)'
        }}
    >
        <div className="py-8 px-4 flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                <FaFingerprint className="text-indigo-400 text-xl" />
            </div>
            <div>
                <span className="text-2xl font-extrabold tracking-tighter block uppercase">Admin<span className="text-indigo-400">Hub</span></span>
                <span className="text-[9px] font-bold text-slate-500 tracking-[0.3em] uppercase">Tech Edition v2</span>
            </div>
        </div>

        <nav className="flex-1 space-y-3 px-2">
            <button onClick={() => setCurrentTab('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${currentTab === 'dashboard' ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg text-white' : 'text-slate-400 hover:bg-white/5 hover:translate-x-1'}`}>
                <FaThLarge className="text-lg" /> Dashboard
            </button>
            <button onClick={() => setCurrentTab('mhs')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${currentTab === 'mhs' ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg text-white' : 'text-slate-400 hover:bg-white/5 hover:translate-x-1'}`}>
                <FaUsers className="text-lg" /> Mahasiswa
            </button>
            <button onClick={() => setCurrentTab('dosen')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${currentTab === 'dosen' ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg text-white' : 'text-slate-400 hover:bg-white/5 hover:translate-x-1'}`}>
                <FaUserTie className="text-lg" /> Data Dosen
            </button>
            <button onClick={() => setCurrentTab('matakuliah')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${currentTab === 'matakuliah' ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg text-white' : 'text-slate-400 hover:bg-white/5 hover:translate-x-1'}`}>
                <FaCalendarDay className="text-lg" /> Mata Kuliah
            </button>
            <button onClick={() => setCurrentTab('laporan')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${currentTab === 'laporan' ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg text-white' : 'text-slate-400 hover:bg-white/5 hover:translate-x-1'}`}>
                <FaChartPie className="text-lg" /> Laporan
            </button>
        </nav>

        <div className="mt-auto p-4 bg-white/5 rounded-[2rem] border border-white/5">
            <button className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest">
                Keluar <FaSignOutAlt />
            </button>
        </div>
    </aside>
  );
}
