import React from 'react';
import { FaArrowLeft } from "react-icons/fa";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface LaporanTabProps {
    setCurrentTab: (tab: string) => void;
}

export default function LaporanTab({ setCurrentTab }: LaporanTabProps) {
    const daftarMK = ["Basis Data", "Web II", "AI", "Jaringan"];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setCurrentTab('dashboard')} className="group mb-8 flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-all">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <FaArrowLeft />
                </div> Kembali
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between h-[400px]">
                    <h3 className="text-lg font-black text-slate-800 uppercase italic">Tren Kehadiran Bulanan</h3>
                    <div className="h-[250px] w-full">
                        <Line 
                            data={{
                                labels: ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4'],
                                datasets: [{ 
                                    label: 'Kehadiran', 
                                    data: [92, 88, 95, 91], 
                                    borderColor: '#6366f1', 
                                    backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                                    fill: true, 
                                    tension: 0.4, 
                                    borderWidth: 4, 
                                    pointRadius: 6, 
                                    pointBackgroundColor: '#fff', 
                                    pointBorderWidth: 3, 
                                    pointBorderColor: '#6366f1' 
                                }]
                            }}
                            options={{ 
                                responsive: true, 
                                maintainAspectRatio: false, 
                                plugins: { legend: { display: false } }, 
                                scales: { y: { display: false }, x: { grid: { display: false } } } 
                            }}
                        />
                    </div>
                </div>
                <div className="bg-indigo-600 p-10 rounded-[3rem] text-white">
                    <h3 className="text-lg font-black uppercase italic mb-6">Zone Merah</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                            <p className="text-xs font-black uppercase">Dedi Kurniawan</p>
                            <p className="text-[10px] text-indigo-200 font-bold mt-1">Kehadiran: 65% (TI-A)</p>
                        </div>
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                            <p className="text-xs font-black uppercase">Siska Rahayu</p>
                            <p className="text-[10px] text-indigo-200 font-bold mt-1">Kehadiran: 70% (TI-B)</p>
                        </div>
                    </div>
                    <button className="w-full mt-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-100 transition-colors">
                        Cetak Semua SP
                    </button>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <h3 className="text-xl font-black text-slate-800 uppercase italic mb-8 underline decoration-indigo-500 decoration-4">Matriks Kehadiran</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                                <th className="pb-6">Mata Kuliah</th>
                                <th className="pb-6 text-center">TI-A</th>
                                <th className="pb-6 text-center">TI-B</th>
                                <th className="pb-6 text-center">TI-C</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {daftarMK.map((mk, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-6 text-sm font-black text-slate-700 uppercase italic">{mk}</td>
                                    <td className="py-6 text-center"><span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-black text-xs">92%</span></td>
                                    <td className="py-6 text-center"><span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-black text-xs">88%</span></td>
                                    <td className="py-6 text-center"><span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg font-black text-xs">74%</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
