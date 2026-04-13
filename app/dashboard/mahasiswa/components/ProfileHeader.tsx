import React from 'react';
import { FaMedal } from "react-icons/fa";

export default function ProfileHeader() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 flex items-center gap-6 shadow-sm">
        <div className="w-20 h-20 card-gradient rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-200">
          PS
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-black tracking-tight">Pindra Sonesa</h2>
            <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">TI - A</span>
          </div>
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-1">Teknik Informatika • Semester 4</p>
        </div>
      </div>
      <div className="glass rounded-[2.5rem] p-8 flex justify-between items-center shadow-sm">
        <div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Akumulasi IPK</p>
          <p className="text-4xl font-black text-indigo-600">3.85</p>
        </div>
        <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-2xl">
          <FaMedal className="text-2xl"/>
        </div>
      </div>
    </div>
  );
}
