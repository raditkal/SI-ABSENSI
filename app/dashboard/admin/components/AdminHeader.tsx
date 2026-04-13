import React from 'react';
import { FaBell } from "react-icons/fa";

export default function AdminHeader({ title }: { title: string }) {
    return (
        <header className="glass rounded-[2.5rem] p-6 flex justify-between items-center sticky top-0 z-50">
            <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{title}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Online • Feb 2026</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden md:block text-right mr-4">
                    <p className="text-xs font-black text-slate-800 uppercase">Super Admin</p>
                    <p className="text-[10px] font-bold text-indigo-500">TI Administrator</p>
                </div>
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 cursor-pointer hover:text-indigo-600 transition">
                    <FaBell className="text-xl" />
                </div>
            </div>
        </header>
    );
}
