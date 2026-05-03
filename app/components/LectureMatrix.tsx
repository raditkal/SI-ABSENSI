'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Student {
    id: string;
    nim: string;
    nama: string;
}

export default function LectureMatrix({ students, courseName, courseId }: { students: Student[], courseName: string, courseId: string }) {
    const [absensiMap, setAbsensiMap] = useState<Record<string, Record<number, string>>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAbsensi = async () => {
            setIsLoading(true);
            if (courseId) {
                const { data } = await supabase
                    .from('absensi')
                    .select('*')
                    .eq('id_jadwal', courseId);
                
                if (data) {
                    // Map shape: { [mahasiswa_id]: { [pertemuan_ke]: "Hadir" | "Izin" | "Alpa" } }
                    const newMap: any = {};
                    data.forEach(a => {
                        if (!newMap[a.id_mahasiswa]) newMap[a.id_mahasiswa] = {};
                        newMap[a.id_mahasiswa][a.pertemuan_ke] = a.status;
                    });
                    setAbsensiMap(newMap);
                }
            }
            setIsLoading(false);
        };

        fetchAbsensi();
    }, [courseId]);

    const colors: Record<string, string> = {
        'H': 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]',
        'A': 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.3)]',
        'I': 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]',
        '-': 'bg-slate-100 opacity-30 shadow-none'
    };

    return (
        <div className="glass rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-white">
            <div className="overflow-x-auto custom-scroll">
                {isLoading ? (
                    <div className="p-20 text-center text-slate-400 flex flex-col items-center">
                        <i className="fas fa-circle-notch animate-spin text-4xl text-indigo-500 mb-4"></i>
                        <p className="font-bold uppercase tracking-widest text-[#10b981]">SINKRONISASI MATRIKS...</p>
                    </div>
                ) : (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-[0.1em]">
                        <tr>
                            <th className="p-8 sticky left-0 bg-white/95 backdrop-blur-md z-10 min-w-[250px]">Nama Mahasiswa</th>
                            <th className="p-8 text-center min-w-[150px]">NIM</th>
                            {[...Array(16)].map((_, i) => (
                                <th key={i} className="p-4 text-center min-w-[60px]">P{i + 1}</th>
                            ))}
                            <th className="p-8 text-center bg-indigo-50/50 text-indigo-600 sticky right-0 backdrop-blur-md">Skor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] font-semibold">
                        {students.map((mhs, idx) => {
                            const studentRecords = absensiMap[mhs.id] || {};
                            let hadirCount = 0;

                            return (
                                <tr key={idx} className="hover:bg-indigo-50/20 transition-colors">
                                    <td className="p-8 sticky left-0 bg-white/95 backdrop-blur-md z-10 font-extrabold text-slate-700 uppercase tracking-tight">
                                        {mhs.nama}
                                    </td>
                                    <td className="p-8 text-center text-slate-400 font-bold">{mhs.nim}</td>
                                    {[...Array(16)].map((_, i) => {
                                        const pertemuan = i + 1;
                                        const statusStr = (studentRecords[pertemuan] || '').toLowerCase();
                                        
                                        let code = '-';
                                        if (statusStr === 'hadir') code = 'H';
                                        else if (statusStr === 'izin' || statusStr === 'sakit') code = 'I';
                                        else if (statusStr === 'alpa' || statusStr === 'alfa') code = 'A';

                                        if (code === 'H') hadirCount++;

                                        return (
                                            <td key={pertemuan} className="p-4 text-center">
                                                <div className={`w-2.5 h-2.5 rounded-full mx-auto ${colors[code]}`} />
                                            </td>
                                        );
                                    })}
                                    <td className="p-8 text-center font-black text-indigo-600 bg-indigo-50/30 sticky right-0 backdrop-blur-md">
                                        {Math.round((hadirCount / 16) * 100)}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                )}
            </div>
        </div>
    );
}