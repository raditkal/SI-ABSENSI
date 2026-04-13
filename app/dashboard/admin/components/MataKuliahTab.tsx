import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { supabase } from '../../../../lib/supabase';

interface MataKuliahTabProps {
    setCurrentTab: (tab: string) => void;
}

interface JadwalData {
    id: string;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruangan: string;
    matakuliah: {
        nama_mk: string;
    };
    dosen: {
        nama_lengkap: string;
    };
}

export default function MataKuliahTab({ setCurrentTab }: MataKuliahTabProps) {
    const [activeHari, setActiveHari] = useState('Senin');
    const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const [jadwalList, setJadwalList] = useState<JadwalData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJadwal = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('jadwal')
                .select(`
                    id, 
                    hari, 
                    jam_mulai, 
                    jam_selesai, 
                    ruangan,
                    matakuliah(nama_mk),
                    dosen(nama_lengkap)
                `)
                .eq('hari', activeHari);
            
            if (!error && data) {
                // @ts-ignore - complex nested types with supabase joins
                setJadwalList(data as JadwalData[]);
            }
            setIsLoading(false);
        };

        fetchJadwal();
    }, [activeHari]);

    const renderJadwalGrid = () => {
        if (isLoading) {
            return (
                <div className="col-span-full flex flex-col items-center py-10 justify-center w-full">
                    <i className="fas fa-circle-notch animate-spin text-4xl text-indigo-500 mb-4"></i>
                    <p className="text-sm font-bold text-slate-500 animate-pulse">Memuat Jadwal dari Supabase...</p>
                </div>
            );
        }

        if (jadwalList.length === 0) {
            return (
                <div className="col-span-full flex flex-col items-center py-10 justify-center w-full text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-300">
                        <span className="text-2xl opacity-50">🗓️</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Belum ada jadwal di hari {activeHari}</p>
                    <p className="text-xs text-slate-400 mt-2">Pastikan jadwal dan mata kuliah sudah di-input ke Supabase.</p>
                </div>
            );
        }

        return jadwalList.map((j) => (
            <div key={j.id} className="p-6 border border-slate-100 rounded-[2.5rem] bg-slate-50 flex flex-col justify-between min-h-[260px] hover:bg-white transition-all shadow-sm hover:shadow-lg">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-white border border-slate-200 text-indigo-600 text-[9px] font-black rounded-lg uppercase tracking-widest">MK reguler</span>
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-lg uppercase tracking-tighter leading-tight">{j.matakuliah?.nama_mk || 'MK Terhapus'}</h4>
                    <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{j.dosen?.nama_lengkap || 'Dosen Tidak Ditemukan'}</p>
                </div>
                <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-500">
                        <span className="flex items-center"><FaClock className="mr-2 text-indigo-400" /> {j.jam_mulai.slice(0, 5)} - {j.jam_selesai.slice(0, 5)}</span>
                        <span className="flex items-center"><FaMapMarkerAlt className="mr-2 text-red-400" /> {j.ruangan}</span>
                    </div>
                    <button onClick={() => alert(`Notifikasi terkirim ke Dosen: ${j.dosen?.nama_lengkap}`)} className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase hover:bg-indigo-600 transition-all">
                        Panggil Dosen
                    </button>
                </div>
            </div>
        ));
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setCurrentTab('dashboard')} className="group mb-8 flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-all">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <FaArrowLeft />
                </div> Kembali
            </button>
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 relative z-10">
                    <h3 className="text-xl font-black text-slate-800 uppercase italic underline decoration-indigo-500 decoration-4">Sesi Live Terjadwal</h3>
                    <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl gap-1">
                        {hariList.map(h => (
                            <button 
                                key={h} 
                                onClick={() => setActiveHari(h)} 
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider ${activeHari === h ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
                            >
                                {h}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                    {renderJadwalGrid()}
                </div>
            </div>
        </div>
    );
}
