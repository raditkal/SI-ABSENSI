'use client';
import { useState } from 'react';
import { FaInfoCircle, FaTimes } from 'react-icons/fa';
import { FaCheck } from "react-icons/fa6";

const mataKuliah = [
    "Praktikum PPL Berorientasi Objek", "PPL Berorientasi Objek",
    "Kecerdasan Buatan", "Teori Bahasa dan Otomata",
    "Pengolahan Citra", "Pemrograman Web II",
    "Rekayasa Perangkat Lunak", "Etika Profesi", "Data Warehouse"
];

export default function AttendanceTable() {
    const [selectedCell, setSelectedCell] = useState<{ mk: string, p: number, status: string } | null>(null);

    const colors: Record<string, string> = {
        'H': 'bg-emerald-500',
        'A': 'bg-rose-500',
        'I': 'bg-amber-500',
        '-': 'bg-slate-100'
    };

    return (
        <div className="space-y-4">
            <div className="glass rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto custom-scroll">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] text-slate-400 uppercase font-black tracking-tighter border-b border-slate-50">
                                <th className="p-6 sticky left-0 bg-white/90 backdrop-blur-md z-10 shadow-[10px_0_15px_-10px_rgba(0,0,0,0.05)]">Mata Kuliah</th>
                                {[...Array(16)].map((_, i) => (
                                    <th key={i} className="p-4 text-center min-w-[52px]">P{i + 1}</th>
                                ))}
                                <th className="p-6 text-center bg-indigo-50/50 text-indigo-600 font-black">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {mataKuliah.map((mk) => {
                                let hadir = 0;
                                return (
                                    <tr key={mk} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-6 font-extrabold text-slate-700 sticky left-0 bg-white/90 backdrop-blur-md z-10 shadow-[10px_0_15px_-10px_rgba(0,0,0,0.05)] min-w-[200px] uppercase text-[10px] tracking-tighter">
                                            {mk}
                                        </td>
                                        {[...Array(16)].map((_, i) => {
                                            let status = 'H';
                                            if (mk === "Data Warehouse" && [1, 4, 7, 11].includes(i)) status = 'A';
                                            if (mk === "Pengolahan Citra" && i === 3) status = 'I';
                                            if (i > 13) status = '-';
                                            if (status === 'H') hadir++;

                                            return (
                                                <td key={i} className="p-4 text-center">
                                                    <div
                                                        onClick={() => status !== '-' && setSelectedCell({ mk, p: i + 1, status })}
                                                        className={`w-3.5 h-3.5 ${colors[status]} rounded-full mx-auto cursor-pointer hover:scale-150 transition-all shadow-sm border-2 border-white`}
                                                    />
                                                </td>
                                            );
                                        })}
                                        <td className="p-6 text-center font-black bg-indigo-50/20 text-indigo-600 text-xs">
                                            {Math.round((hadir / 14) * 100)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Detail (Hanya muncul jika cell diklik) */}
            {selectedCell && (
                <div className="fixed inset-0 bg-slate-900/50 z-[150] backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-[360px] rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className={`p-10 text-white text-center ${selectedCell.status === 'H' ? 'bg-emerald-500' : selectedCell.status === 'I' ? 'bg-amber-500' : 'bg-rose-500'}`}>
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                                {selectedCell.status === 'H' ? (
                                    <FaCheck className="text-2xl" />
                                ) : selectedCell.status === 'I' ? (
                                    <FaInfoCircle className="text-2xl" />
                                ) : (
                                    <FaTimes className="text-2xl" />
                                )}
                            </div>
                            <h3 className="font-black text-2xl uppercase tracking-[0.1em]">
                                {selectedCell.status === 'H' ? 'HADIR' : selectedCell.status === 'I' ? 'IZIN' : 'ALPA'}
                            </h3>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4 text-xs">
                                <div className="flex justify-between border-b pb-4">
                                    <span className="text-slate-400 font-bold uppercase">Mata Kuliah</span>
                                    <span className="font-extrabold text-slate-800 text-right w-2/3 uppercase">{selectedCell.mk}</span>
                                </div>
                                <div className="flex justify-between border-b pb-4">
                                    <span className="text-slate-400 font-bold uppercase">Pertemuan</span>
                                    <span className="font-extrabold text-indigo-600">KE-{selectedCell.p}</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl text-slate-500 flex items-center gap-3">
                                    <i className="fas fa-map-marker-alt text-indigo-500"></i>
                                    <span>Gedung D1.1 (Ruang Kuliah)</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCell(null)} className="w-full bg-slate-900 text-white font-extrabold py-5 rounded-2xl text-[11px] uppercase tracking-widest">Tutup Detail</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}