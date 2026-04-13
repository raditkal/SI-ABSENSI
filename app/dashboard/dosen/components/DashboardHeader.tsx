import React from 'react';
import { FaCalendarCheck } from "react-icons/fa";

export default function DashboardHeader() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass rounded-[2.5rem] p-8 flex items-center justify-between overflow-hidden relative">
            <div className="z-10">
                <h2 className="text-3xl font-extrabold tracking-tighter text-slate-800 mb-2">
                    Jadwal Perkuliahan <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Hari Ini</span>
                </h2>
                <p className="text-sm font-medium text-slate-500">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} • Semester Genap
                </p>
            </div>
            <FaCalendarCheck className="text-9xl absolute -right-4 -bottom-4 opacity-5 text-indigo-600" />
        </div>
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-center shadow-2xl shadow-indigo-200">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Total SKS Hari Ini</p>
            <p className="text-4xl font-extrabold">06 <span className="text-lg font-light opacity-50">SKS</span></p>
        </div>
    </section>
  );
}
