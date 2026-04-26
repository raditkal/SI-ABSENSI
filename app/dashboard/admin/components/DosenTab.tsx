import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from "react-icons/fa";
import { supabase } from '../../../../lib/supabase';

interface DosenTabProps {
    setCurrentTab: (tab: string) => void;
}

interface DosenData {
    id: string;
    nip: string;
    nama_lengkap: string;
    gelar: string;
}

export default function DosenTab({ setCurrentTab }: DosenTabProps) {
    const [dosenList, setDosenList] = useState<DosenData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDosen = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('dosen')
                .select('*')
                .order('nama_lengkap', { ascending: true });
            
            if (!error && data) {
                setDosenList(data);
            }
            setIsLoading(false);
        };

        fetchDosen();
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setCurrentTab('dashboard')} className="group mb-8 flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-all">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <FaArrowLeft />
                </div> Kembali
            </button>
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                
                <h3 className="text-xl font-black text-slate-800 mb-8 uppercase italic underline decoration-indigo-500 decoration-4 relative z-10">Direktori Dosen</h3>
                
                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-left">
                            <tr>
                                <th className="p-6 rounded-l-2xl">Dosen</th>
                                <th className="p-6">NIP</th>
                                <th className="p-6 text-center rounded-r-2xl">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="p-10 text-center text-slate-400 font-bold text-sm">
                                        <i className="fas fa-circle-notch animate-spin text-2xl text-indigo-500 mb-3 block"></i>
                                        Memuat Data...
                                    </td>
                                </tr>
                            ) : dosenList.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-10 text-center text-slate-400 font-bold text-sm">
                                        Data dosen masih kosong di Supabase.
                                    </td>
                                </tr>
                            ) : (
                                dosenList.map((d) => (
                                    <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black italic shadow-md">
                                                    {d.nama_lengkap.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-black text-slate-800 uppercase text-sm italic">
                                                    {d.nama_lengkap} {d.gelar ? `, ${d.gelar}` : ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 font-bold text-slate-500 tracking-widest text-xs">
                                            {d.nip}
                                        </td>
                                        <td className="p-6 text-center">
                                            <button className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-100 transition-colors">
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
