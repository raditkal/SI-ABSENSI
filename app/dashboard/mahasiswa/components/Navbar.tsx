import React from 'react';
import { FaFingerprint } from "react-icons/fa";
import { FaPowerOff } from "react-icons/fa6";

export default function Navbar() {
  return (
    <nav className="fixed top-4 left-4 right-4 z-[100]">
      <div className="max-w-7xl mx-auto glass rounded-[2rem] p-4 flex justify-between items-center shadow-xl shadow-indigo-100/20">
        <div className="flex items-center gap-3 ml-2">
          <div className="w-10 h-10 card-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
            <FaFingerprint className="text-xl" />
          </div>
          <h1 className="font-extrabold tracking-tighter text-slate-800 uppercase text-sm">
            Presensi<span className="text-indigo-600">Hub</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
            <FaPowerOff className="text-xl"/>
          </button>
        </div>
      </div>
    </nav>
  );
}
