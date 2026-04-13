'use client';

interface Student {
    nim: string;
    nama: string;
}

export default function LectureMatrix({ students, courseName }: { students: Student[], courseName: string }) {
    return (
        <div className="glass rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-white">
            <div className="overflow-x-auto custom-scroll">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-[0.1em]">
                        <tr>
                            <th className="p-8 sticky left-0 bg-white/95 backdrop-blur-md z-10 min-w-[250px]">Student Name</th>
                            <th className="p-8 text-center min-w-[150px]">NIM</th>
                            {[...Array(16)].map((_, i) => (
                                <th key={i} className="p-4 text-center min-w-[60px]">P{i + 1}</th>
                            ))}
                            <th className="p-8 text-center bg-indigo-50/50 text-indigo-600 sticky right-0 backdrop-blur-md">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] font-semibold">
                        {students.map((mhs, idx) => (
                            <tr key={idx} className="hover:bg-indigo-50/20 transition-colors">
                                <td className="p-8 sticky left-0 bg-white/95 backdrop-blur-md z-10 font-extrabold text-slate-700 uppercase tracking-tight">
                                    {mhs.nama}
                                </td>
                                <td className="p-8 text-center text-slate-400 font-bold">{mhs.nim}</td>
                                {[...Array(16)].map((_, i) => {
                                    const isFuture = i > 13;
                                    const isPresent = Math.random() > 0.1;
                                    return (
                                        <td key={i} className="p-4 text-center">
                                            <div className={`w-2.5 h-2.5 rounded-full mx-auto ${isFuture ? 'bg-slate-100 opacity-30' :
                                                    isPresent ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]' :
                                                        'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.3)]'
                                                }`} />
                                        </td>
                                    );
                                })}
                                <td className="p-8 text-center font-black text-indigo-600 bg-indigo-50/30 sticky right-0 backdrop-blur-md">
                                    {Math.floor(Math.random() * 20 + 80)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}