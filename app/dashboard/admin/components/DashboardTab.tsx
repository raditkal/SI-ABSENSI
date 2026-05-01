import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaUsers, FaArrowRight, FaUserTie, FaCalendarCheck, FaChevronRight } from "react-icons/fa";
import { supabase } from '../../../../lib/supabase';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardTabProps {
    setCurrentTab: (tab: string) => void;
}

export default function DashboardTab({ setCurrentTab }: DashboardTabProps) {
    const [totalMhs, setTotalMhs] = useState<number>(0);
    const [totalDosen, setTotalDosen] = useState<number>(0);

    useEffect(() => {
        const fetchCounts = async () => {
            // Get total mahasiswa
            const { count: mhsCount } = await supabase
                .from('mahasiswa')
                .select('*', { count: 'exact', head: true });
            
            // Get total dosen
            const { count: dosenCount } = await supabase
                .from('dosen')
                .select('*', { count: 'exact', head: true });

            if (mhsCount !== null) setTotalMhs(mhsCount);
            if (dosenCount !== null) setTotalDosen(dosenCount);
        };

        fetchCounts();
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-4 bg-white p-6 lg:p-8 rounded-3xl lg:rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center">
                    <h3 className="text-xs font-black text-slate-400 uppercase mb-8 tracking-[0.2em] self-start italic">Global Attendance</h3>
                    <div className="relative w-full flex justify-center">
                        <div className="max-w-[240px]">
                            <Doughnut
                                data={{
                                    labels: ['TI-A', 'TI-B', 'TI-C'],
                                    datasets: [{ 
                                        data: [95, 88, 92], 
                                        backgroundColor: ['#6366f1', '#f59e0b', '#10b981'], 
                                        borderWidth: 0, 
                                        hoverOffset: 15,
                                        borderRadius: 10
                                    }]
                                }}
                                options={{ cutout: '85%', plugins: { legend: { display: false } } }}
                            />
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-slate-800">91%</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Average</span>
                        </div>
                    </div>
                    <div className="w-full mt-8 grid grid-cols-3 gap-2">
                        <div className="text-center p-3 bg-indigo-50 rounded-2xl">
                            <p className="text-[9px] font-black text-indigo-400 uppercase">TI-A</p>
                            <p className="text-sm font-extrabold text-indigo-600">95%</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-2xl">
                            <p className="text-[9px] font-black text-orange-400 uppercase">TI-B</p>
                            <p className="text-sm font-extrabold text-orange-600">88%</p>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-2xl">
                            <p className="text-[9px] font-black text-emerald-400 uppercase">TI-C</p>
                            <p className="text-sm font-extrabold text-emerald-600">92%</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div onClick={() => setCurrentTab('mhs')} className="bg-indigo-600 p-6 lg:p-8 rounded-3xl lg:rounded-[3rem] text-white flex flex-col justify-between cursor-pointer relative overflow-hidden group transition-all hover:-translate-y-2 hover:shadow-2xl min-h-[200px]">
                        <FaUsers className="absolute -right-4 -bottom-4 text-9xl opacity-10 group-hover:scale-110 transition-transform" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Total Mahasiswa</p>
                            <h3 className="text-6xl font-black mt-2">{totalMhs}</h3>
                        </div>
                        <div className="relative z-10 flex items-center gap-2 mt-8 text-[10px] font-bold bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md">
                            LIHAT DATA <FaArrowRight />
                        </div>
                    </div>

                    <div onClick={() => setCurrentTab('dosen')} className="bg-white p-6 lg:p-8 rounded-3xl lg:rounded-[3rem] border border-slate-100 flex flex-col justify-between cursor-pointer group transition-all hover:-translate-y-2 hover:shadow-xl min-h-[200px]">
                        <div>
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:bg-indigo-600 transition-colors">
                                <FaUserTie className="text-xl" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dosen Pengajar</p>
                            <h3 className="text-5xl font-black text-slate-800 mt-2">{totalDosen}</h3>
                        </div>
                        <p className="text-indigo-600 text-xs font-bold mt-4 underline decoration-2 underline-offset-4">Monitor SKS & MK</p>
                    </div>

                    <div onClick={() => setCurrentTab('matakuliah')} className="md:col-span-2 bg-slate-900 p-6 lg:p-8 rounded-3xl lg:rounded-[3rem] flex items-center justify-between cursor-pointer group transition-all hover:-translate-y-2 hover:shadow-2xl">
                        <div className="flex items-center gap-8">
                            <div className="hidden sm:flex w-20 h-20 rounded-[2rem] bg-indigo-500 items-center justify-center text-white text-3xl shadow-lg shadow-indigo-500/30">
                                <FaCalendarCheck />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Monitoring Jadwal</h3>
                                <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mt-1">Live Tracking Sesi Perkuliahan</p>
                            </div>
                        </div>
                        <div className="w-14 h-14 rounded-full border border-slate-700 flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-all">
                            <FaChevronRight />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
