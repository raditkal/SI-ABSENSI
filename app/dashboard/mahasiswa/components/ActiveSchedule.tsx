import React from 'react';
import { FaQrcode } from "react-icons/fa6";

export default function ActiveSchedule() {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span> Jadwal Aktif
      </h3>
      <div className="card-gradient rounded-[3rem] p-1 shadow-2xl shadow-indigo-100">
        <div className="bg-white/10 backdrop-blur-md rounded-[2.8rem] p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">Sesi Sedang Berjalan</span>
              <h4 className="text-3xl font-black mt-3 uppercase tracking-tight">Pemrograman Web II</h4>
              <p className="text-indigo-100 font-medium mt-1">10:30 - 13:00 • Lab Pemrograman Dasar</p>
            </div>
            <button className="bg-white text-indigo-600 px-10 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center gap-3">
              <FaQrcode className="text-lg" /> Scan Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
