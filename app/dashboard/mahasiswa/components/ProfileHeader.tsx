import React from 'react';
import { FaMedal } from "react-icons/fa";

interface ProfileHeaderProps {
  studentInfo?: {
    nama_lengkap: string;
    kelas: string;
    angkatan: number;
    nim: string;
  };
}

export default function ProfileHeader({ studentInfo }: ProfileHeaderProps) {
  const name = studentInfo?.nama_lengkap || "Nama Mahasiswa";
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const kelas = studentInfo?.kelas || "L-X";
  const nim = studentInfo?.nim || "000000000";
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 flex items-center gap-6 shadow-sm">
        <div className="w-20 h-20 card-gradient rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-200">
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-black tracking-tight">{name}</h2>
            <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">{kelas}</span>
          </div>
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-1">NIM • {nim}</p>
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
