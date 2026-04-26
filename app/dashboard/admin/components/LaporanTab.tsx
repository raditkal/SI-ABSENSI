import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaFileDownload, FaPrint } from "react-icons/fa";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { supabase } from '../../../../lib/supabase';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface LaporanTabProps {
    setCurrentTab: (tab: string) => void;
}

export default function LaporanTab({ setCurrentTab }: LaporanTabProps) {
    const [redZone, setRedZone] = useState<any[]>([]);
    const [matriksMK, setMatriksMK] = useState<any[]>([]);
    const [mahasiswaStats, setMahasiswaStats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLaporanData = async () => {
            setIsLoading(true);

            // Fetch semua absensi
            const { data: absensiData } = await supabase.from('absensi').select(`
                status,
                id_mahasiswa,
                id_jadwal,
                mahasiswa (nama_lengkap, nim),
                jadwal ( matakuliah(nama_mk) )
            `);

            // Fetch semua mahasiswa untuk mencari yg tidak pernah absen (Red Zone)
            const { data: allMahasiswa } = await supabase.from('mahasiswa').select('id, nama_lengkap, nim');
            const { data: allMatakuliah } = await supabase.from('matakuliah').select('id, nama_mk');

            if (absensiData && allMahasiswa && allMatakuliah) {
                // 1. Kalkulasi Zona Merah
                const hadirCountMap: Record<string, number> = {};
                absensiData.forEach(a => {
                    if (a.status.toLowerCase() === 'hadir') {
                        hadirCountMap[a.id_mahasiswa] = (hadirCountMap[a.id_mahasiswa] || 0) + 1;
                    }
                });

                const calculatedStats = allMahasiswa.map(mhs => {
                    const totalHadir = hadirCountMap[mhs.id] || 0;
                    // Asumsikan target 16 pertemuan, kalkulasi persen:
                    const persen = Math.round((totalHadir / 16) * 100);
                    return { ...mhs, totalHadir, persen };
                });

                setMahasiswaStats(calculatedStats);
                
                const calculatedRedZone = calculatedStats
                  .filter(mhs => mhs.persen < 75) // Jika dibawah 75%, masuk zona merah
                  .sort((a, b) => a.persen - b.persen)
                  .slice(0, 5); // Ambil 5 terparah

                setRedZone(calculatedRedZone);

                // 2. Kalkulasi Matriks Kehadiran per Mata Kuliah
                const mkStats: Record<string, { hadir: number, totalRecord: number }> = {};
                allMatakuliah.forEach(mk => mkStats[mk.nama_mk] = { hadir: 0, totalRecord: 0 });

                absensiData.forEach(a => {
                    const mkName = (a.jadwal as any)?.matakuliah?.nama_mk;
                    if (mkName && mkStats[mkName]) {
                        mkStats[mkName].totalRecord += 1;
                        if (a.status.toLowerCase() === 'hadir') {
                            mkStats[mkName].hadir += 1;
                        }
                    }
                });

                const matrix = Object.keys(mkStats).map(mkName => {
                    const stat = mkStats[mkName];
                    const persen = stat.totalRecord > 0 ? Math.round((stat.hadir / stat.totalRecord) * 100) : 0;
                    return { nama: mkName, persen, total_hadir: stat.hadir, total_record: stat.totalRecord };
                });

                setMatriksMK(matrix);
            }

            setIsLoading(false);
        };

        fetchLaporanData();
    }, []);

    const handleExportCSV = () => {
        // Prepare CSV Data
        const header = ["NIM", "Nama Lengkap", "Total Hadir", "Target Pertemuan", "Persentase (%)", "Status Zona"];
        const rows = mahasiswaStats.map(m => {
            const status = m.persen < 75 ? "MERAH" : "AMAN";
            // Escape nama in case it has commas
            return `${m.nim},"${m.nama_lengkap}",${m.totalHadir},16,${m.persen},${status}`;
        });
        
        const csvContent = [header.join(','), ...rows].join('\n');
        
        // Trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Rekap_Kehadiran_Global_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintPDF = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <i className="fas fa-circle-notch animate-spin text-4xl text-indigo-500 mb-4"></i>
                <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Menghitung Data Analitik...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 print:bg-white print:p-0">
            <div className="flex justify-between items-center mb-8 print:hidden">
                <button onClick={() => setCurrentTab('dashboard')} className="group flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-all">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <FaArrowLeft />
                    </div> Kembali
                </button>
                <div className="flex gap-3">
                    <button onClick={handleExportCSV} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:shadow-lg transition-all flex items-center gap-2">
                        <FaFileDownload className="text-sm" /> Export CSV
                    </button>
                    <button onClick={handlePrintPDF} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 hover:shadow-lg transition-all flex items-center gap-2">
                        <FaPrint className="text-sm" /> Cetak PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between h-[400px] print:border-none print:shadow-none print:p-0">
                    <h3 className="text-lg font-black text-slate-800 uppercase italic">Tren Akumulasi Sistem</h3>
                    <div className="h-[250px] w-full mt-4">
                        <Line 
                            data={{
                                labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4 (Live)'],
                                datasets: [{ 
                                    label: 'Kehadiran Aktif', 
                                    data: [12, 19, 15, matriksMK.reduce((acc, curr) => acc + curr.total_hadir, 0)], // Menggunakan data live di titik terakhir
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
                <div className="bg-rose-600 p-10 rounded-[3rem] text-white shadow-xl shadow-rose-200 object-cover relative overflow-hidden print:border print:border-slate-300 print:text-black print:bg-white print:shadow-none print:p-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none print:hidden"></div>
                    <h3 className="text-lg font-black uppercase italic mb-6 relative z-10 print:text-slate-800">⚠ Zona Merah (&lt;75%)</h3>
                    <div className="space-y-4 relative z-10 h-[200px] overflow-y-auto custom-scroll pr-2">
                        {redZone.length === 0 ? (
                            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-center text-rose-100 font-bold text-xs uppercase print:bg-slate-50 print:text-slate-500">
                                Aman, tidak ada mahasiswa
                            </div>
                        ) : (
                            redZone.map((mhs, idx) => (
                                <div key={idx} className="p-4 bg-white/10 rounded-2xl border border-white/10 flex justify-between items-center print:border-slate-200 print:bg-slate-50">
                                    <div>
                                        <p className="text-xs font-black uppercase print:text-slate-800">{mhs.nama_lengkap}</p>
                                        <p className="text-[9px] text-rose-200 font-bold mt-1 tracking-widest print:text-slate-500">{mhs.nim}</p>
                                    </div>
                                    <div className="text-xl font-black print:text-rose-600">{mhs.persen}%</div>
                                </div>
                            ))
                        )}
                    </div>
                    <button className="w-full mt-6 py-4 bg-white text-rose-600 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-100 transition-colors shadow-lg relative z-10 print:hidden">
                        Buat Surat Peringatan
                    </button>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden print:p-0 print:border-none print:shadow-none mt-8">
                <h3 className="text-xl font-black text-slate-800 uppercase italic mb-8 underline decoration-indigo-500 decoration-4">Rasio Kehadiran Mata Kuliah</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left border-b-2 border-slate-50 print:border-slate-300">
                                <th className="pb-6 w-1/2">Mata Kuliah / Sesi</th>
                                <th className="pb-6 text-center">Total Check-In (Live)</th>
                                <th className="pb-6 text-center">Total Entry Target</th>
                                <th className="pb-6 text-center">Tingkat Kehadiran (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                            {matriksMK.length === 0 ? (
                                <tr><td colSpan={4} className="py-8 text-center text-slate-400 font-bold">Belum ada data matakuliah</td></tr>
                            ) : (
                                matriksMK.map((mk, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-6 text-sm font-black text-slate-700 uppercase italic">{mk.nama}</td>
                                        <td className="py-6 text-center font-bold text-slate-500">{mk.total_hadir} Kehadiran</td>
                                        <td className="py-6 text-center font-bold text-slate-400">{mk.total_record} Target</td>
                                        <td className="py-6 text-center">
                                            <span className={`px-4 py-2 ${mk.persen >= 75 ? 'bg-emerald-50 text-emerald-600' : mk.persen > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'} rounded-xl font-black text-xs print:bg-transparent print:p-0`}>
                                                {mk.persen}%
                                            </span>
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
