import React from 'react';
import { FaBars, FaTimes } from "react-icons/fa";

export default function AdminHeader({ title, onMenuClick }: { title: string, onMenuClick: () => void }) {
    return (
        <header className="glass rounded-3xl lg:rounded-[2.5rem] p-4 lg:p-6 flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onMenuClick}
                    className="lg:hidden w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200"
                >
                    <FaBars />
                </button>
                <div>
                    <h2 className="text-xl lg:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">{title}</h2>
                    <div className="hidden sm:flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Online</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                    <p className="text-xs font-black text-slate-800 uppercase">Super Admin</p>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">TI Administrator</p>
                </div>
                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl lg:rounded-2xl shadow-lg flex items-center justify-center text-white font-black text-lg">
                    A
                </div>
            </div>
        </header>
    );
}
