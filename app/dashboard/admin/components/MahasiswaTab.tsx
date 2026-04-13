import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from "react-icons/fa";
import { supabase } from '../../../../lib/supabase'; // Import koneksi supabase

interface MahasiswaTabProps {
    setCurrentTab: (tab: string) => void;
}

interface MahasiswaData {
    id: string;
    nim: string;
    nama_lengkap: string;
    kelas: string;
    angkatan: number;
}

export default function MahasiswaTab({ setCurrentTab }: MahasiswaTabProps) {
    const [activeClass, setActiveClass] = useState('TI-A');
    const [mahasiswaList, setMahasiswaList] = useState<MahasiswaData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Ambil data dari tabel "mahasiswa" Supabase
    useEffect(() => {
        const fetchMahasiswa = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('mahasiswa')
                .select('*')
                .eq('kelas', activeClass);
            
            if (!error && data) {
                setMahasiswaList(data);
            }
            setIsLoading(false);
        };

        fetchMahasiswa();
    }, [activeClass]);

    const renderMhsList = () => {
        if (isLoading) {
            return (
                <div className="col-span-full flex flex-col items-center py-10 justify-center w-full">
                    <i className="fas fa-circle-notch animate-spin text-4xl text-indigo-500 mb-4"></i>
                    <p className="text-sm font-bold text-slate-500 animate-pulse">Memuat Database Supabase...</p>
                </div>
            );
        }

        if (mahasiswaList.length === 0) {
            return (
                <div className="col-span-full flex flex-col items-center py-10 justify-center w-full text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-300">
                        <span className="text-2xl opacity-50">📭</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Belum ada mahasiswa di kelas {activeClass}</p>
                    <p className="text-xs text-slate-400 mt-2">Silakan tambahkan data melalui tabel Supabase terlebih dahulu.</p>
                </div>
            );
        }

        return mahasiswaList.map((mhs, i) => (
            <div key={mhs.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col items-center group hover:bg-white hover:border-indigo-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-lg mb-4 shadow-lg shadow-indigo-200">
                    {mhs.nama_lengkap.charAt(0).toUpperCase()}
                </div>
                <p className="text-[10px] font-black text-slate-800 uppercase text-center line-clamp-2 leading-snug">{mhs.nama_lengkap}</p>
                <p className="text-[8px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded mt-2 font-bold tracking-widest">{mhs.nim}</p>
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
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 relative z-10">
                    <h3 className="text-xl font-black text-slate-800 uppercase italic">Mahasiswa Aktif</h3>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                        {['TI-A', 'TI-B', 'TI-C'].map(k => (
                            <button 
                                key={k}
                                onClick={() => setActiveClass(k)} 
                                className={`px-8 py-2 rounded-xl text-[10px] font-black transition uppercase ${activeClass === k ? 'bg-white shadow-sm text-indigo-600' : 'hover:bg-white/50 text-slate-500'}`}
                            >
                                {k}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 relative z-10">
                    {renderMhsList()}
                </div>
            </div>
        </div>
    );
}
