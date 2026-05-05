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
    const [rawMahasiswaStats, setRawMahasiswaStats] = useState<any[]>([]);
    const [trenData, setTrenData] = useState<{labels: string[], data: number[]}>({ labels: ['Belum ada data'], data: [0] });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMhsForSP, setSelectedMhsForSP] = useState<any>(null);
    const [selectedClass, setSelectedClass] = useState<string>('Semua');

    useEffect(() => {
        const fetchLaporanData = async () => {
            setIsLoading(true);

            // Fetch semua absensi
            const { data: absensiData } = await supabase.from('absensi').select(`
                status,
                pertemuan_ke,
                id_mahasiswa,
                id_jadwal,
                mahasiswa (nama_lengkap, nim),
                jadwal ( matakuliah(nama_mk) )
            `);

            // Fetch semua mahasiswa untuk mencari yg tidak pernah absen (Red Zone)
            const { data: allMahasiswa } = await supabase.from('mahasiswa').select('id, nama_lengkap, nim, kelas');
            const { data: allMatakuliah } = await supabase.from('matakuliah').select('id, nama_mk');

            if (absensiData && allMahasiswa && allMatakuliah) {
                // 1. Kalkulasi Zona Merah
                const hadirCountMap: Record<string, number> = {};
                const pertemuanMap: Record<number, number> = {}; // Untuk grafik tren

                absensiData.forEach(a => {
                    if (a.status.toLowerCase() === 'hadir') {
                        // Untuk zona merah
                        hadirCountMap[a.id_mahasiswa] = (hadirCountMap[a.id_mahasiswa] || 0) + 1;
                        
                        // Untuk grafik tren (dikelompokkan berdasarkan pertemuan)
                        const p = a.pertemuan_ke || 1;
                        pertemuanMap[p] = (pertemuanMap[p] || 0) + 1;
                    }
                });

                // Siapkan data grafik
                const sortedPertemuan = Object.keys(pertemuanMap).map(Number).sort((a,b) => a - b);
                const chartLabels = sortedPertemuan.length > 0 ? sortedPertemuan.map(p => `Pertemuan ${p}`) : ['Belum ada data'];
                const chartData = sortedPertemuan.length > 0 ? sortedPertemuan.map(p => pertemuanMap[p]) : [0];
                setTrenData({ labels: chartLabels, data: chartData });

                const calculatedStats = allMahasiswa.map(mhs => {
                    const totalHadir = hadirCountMap[mhs.id] || 0;
                    // Asumsikan target 16 pertemuan, kalkulasi persen:
                    const persen = Math.round((totalHadir / 16) * 100);
                    return { ...mhs, totalHadir, persen };
                });

                setRawMahasiswaStats(calculatedStats);
            }

            setIsLoading(false);
        };

        fetchLaporanData();
    }, []);

    const filteredStats = selectedClass === 'Semua' 
        ? rawMahasiswaStats 
        : rawMahasiswaStats.filter(m => m.kelas?.toUpperCase() === selectedClass);

    const redZone = filteredStats.filter(m => m.persen < 75).sort((a,b) => a.persen - b.persen);
    const greenZone = filteredStats.filter(m => m.persen >= 90).sort((a,b) => b.persen - a.persen);

    const handleExportCSV = () => {
        // Prepare CSV Data
        const header = ["NIM", "Nama Lengkap", "Kelas", "Total Hadir", "Target Pertemuan", "Persentase (%)", "Status Zona"];
        const rows = filteredStats.map(m => {
            const status = m.persen < 75 ? "MERAH" : m.persen >= 90 ? "HIJAU" : "AMAN";
            // Escape nama in case it has commas
            return `${m.nim},"${m.nama_lengkap}",${m.kelas || '-'},${m.totalHadir},16,${m.persen},${status}`;
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
            {/* CSS Khusus Print untuk menangani Modal SP */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    html, body {
                        width: 210mm;
                        height: 297mm;
                        background: white !important;
                    }
                    /* Sembunyikan semua elemen kecuali modal yang sedang aktif */
                    body * {
                        visibility: hidden;
                    }
                    .print-container, .print-container * {
                        visibility: visible;
                    }
                    .print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm !important;
                        min-height: 297mm;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        display: block !important;
                    }
                    /* Pastikan konten surat mengisi lebar kertas */
                    .print-content {
                        width: 100% !important;
                        max-width: none !important;
                        padding: 2cm !important; /* Standar margin surat */
                        box-sizing: border-box;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

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

            {/* Filter & Insight Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-8 print:hidden">
                <div className="flex items-center gap-2 mb-4 sm:mb-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Filter Kelas:</span>
                    {['Semua', 'L1', 'L2', 'L3'].map(c => (
                        <button 
                            key={c}
                            onClick={() => setSelectedClass(c)} 
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedClass === c ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <div className="flex gap-6">
                    <div className="text-center px-4 border-r border-slate-100">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Zona Hijau</p>
                        <p className="text-xl font-black text-slate-800">{greenZone.length} <span className="text-xs text-slate-400 font-bold">Mhs</span></p>
                    </div>
                    <div className="text-center px-4">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Zona Merah</p>
                        <p className="text-xl font-black text-slate-800">{redZone.length} <span className="text-xs text-slate-400 font-bold">Mhs</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white p-6 lg:p-10 rounded-3xl lg:rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between h-[450px] print:border-none print:shadow-none print:p-0">
                    <h3 className="text-lg font-black text-slate-800 uppercase italic">Tren Akumulasi Sistem</h3>
                    <div className="h-[250px] w-full mt-4">
                        <Line 
                            data={{
                                labels: trenData.labels,
                                datasets: [{ 
                                    label: 'Total Kehadiran', 
                                    data: trenData.data,
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

                {/* Zona Kolom */}
                <div className="space-y-6">
                    {/* Zona Hijau */}
                    <div className="bg-emerald-500 p-8 rounded-[2rem] text-white shadow-lg shadow-emerald-200 relative overflow-hidden print:border print:border-slate-300 print:text-black print:bg-white print:shadow-none">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none print:hidden"></div>
                        <h3 className="text-sm font-black uppercase italic mb-4 relative z-10 print:text-slate-800">⭐ Zona Hijau (&ge;90%)</h3>
                        <div className="space-y-3 relative z-10 h-[120px] overflow-y-auto custom-scroll pr-2">
                            {greenZone.length === 0 ? (
                                <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-center text-emerald-100 font-bold text-[10px] uppercase print:bg-slate-50 print:text-slate-500">
                                    Belum ada data
                                </div>
                            ) : (
                                greenZone.map((mhs, idx) => (
                                    <div key={idx} className="p-3 bg-white/10 rounded-xl border border-white/10 flex justify-between items-center print:border-slate-200 print:bg-slate-50">
                                        <div>
                                            <p className="text-[10px] font-black uppercase print:text-slate-800 truncate w-32">{mhs.nama_lengkap}</p>
                                            <p className="text-[8px] text-emerald-100 font-bold mt-1 tracking-widest print:text-slate-500">{mhs.nim}</p>
                                        </div>
                                        <div className="text-lg font-black print:text-emerald-600">{mhs.persen}%</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Zona Merah */}
                    <div className="bg-rose-500 p-8 rounded-[2rem] text-white shadow-lg shadow-rose-200 relative overflow-hidden print:border print:border-slate-300 print:text-black print:bg-white print:shadow-none">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none print:hidden"></div>
                        <h3 className="text-sm font-black uppercase italic mb-4 relative z-10 print:text-slate-800">⚠ Zona Merah (&lt;75%)</h3>
                        <div className="space-y-3 relative z-10 h-[120px] overflow-y-auto custom-scroll pr-2">
                            {redZone.length === 0 ? (
                                <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-center text-rose-100 font-bold text-[10px] uppercase print:bg-slate-50 print:text-slate-500">
                                    Aman, tidak ada mahasiswa
                                </div>
                            ) : (
                                redZone.map((mhs, idx) => (
                                    <div key={idx} className="p-3 bg-white/10 rounded-xl border border-white/10 flex justify-between items-center group/item hover:bg-white/20 transition-all cursor-pointer print:border-slate-200 print:bg-slate-50" onClick={() => setSelectedMhsForSP(mhs)}>
                                        <div>
                                            <p className="text-[10px] font-black uppercase print:text-slate-800 truncate w-32">{mhs.nama_lengkap}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[8px] text-rose-100 font-bold tracking-widest print:text-slate-500">{mhs.nim}</p>
                                                <span className="text-[7px] bg-white/20 px-2 py-0.5 rounded text-white font-bold group-hover/item:bg-white group-hover/item:text-rose-600 transition-colors">SP</span>
                                            </div>
                                        </div>
                                        <div className="text-lg font-black print:text-rose-600">{mhs.persen}%</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Surat Peringatan */}
            {selectedMhsForSP && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[600] flex items-start justify-center p-4 sm:p-8 overflow-y-auto print:bg-white print:static print:p-0 print-container">
                    <div className="bg-white w-full max-w-3xl my-auto rounded-[2rem] shadow-2xl relative animate-in zoom-in duration-300 print:shadow-none print:rounded-none print:w-full print:max-w-none print:my-0">
                        
                        {/* Control Bar (Hidden when printing) */}
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center no-print">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preview Surat Peringatan</h4>
                            <div className="flex gap-2">
                                <button onClick={() => window.print()} className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-indigo-700 transition-all flex items-center gap-2">
                                    <FaPrint /> Cetak
                                </button>
                                <button onClick={() => setSelectedMhsForSP(null)} className="px-5 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase hover:bg-slate-300 transition-all">
                                    Tutup
                                </button>
                            </div>
                        </div>

                        {/* Surat Content */}
                        <div className="p-12 font-serif text-slate-800 leading-relaxed print:p-0 print:m-0 print-content">
                            {/* Header Surat */}
                            <div className="text-center border-b-4 border-double border-slate-900 pb-6 mb-8">
                                <h1 className="text-xl font-bold uppercase tracking-tight">KEMENTERIAN PENDIDIKAN, KEBUDAYAAN,<br/>RISET, DAN TEKNOLOGI</h1>
                                <h2 className="text-lg font-bold">UNIVERSITAS SRIWIJAYA</h2>
                                <p className="text-[10px] italic">Jl. Kampus Masa Depan No. 123, Kota Palembang - Telp: (021) 123456</p>
                            </div>

                            <div className="text-right mb-8">
                                <p>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>

                            <div className="mb-8">
                                <p className="font-bold">Nomor: SP/{new Date().getFullYear()}/{selectedMhsForSP.nim.slice(-4)}</p>
                                <p className="font-bold">Lampiran: -</p>
                                <p className="font-bold">Perihal: Surat Peringatan Ketidakhadiran</p>
                            </div>

                            <div className="mb-8">
                                <p>Yth. <strong>{selectedMhsForSP.nama_lengkap}</strong></p>
                                <p>NIM: {selectedMhsForSP.nim}</p>
                                <p>Mahasiswa Universitas Presensi Indonesia</p>
                            </div>

                            <div className="space-y-4 mb-10">
                                <p>Dengan hormat,</p>
                                <p>Berdasarkan hasil monitoring data absensi digital pada sistem <strong>SI-ABSENSI</strong> untuk semester berjalan, dengan ini kami memberitahukan bahwa tingkat kehadiran Saudara/i saat ini berada pada angka:</p>
                                <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                                    <p className="text-4xl font-black text-rose-600 italic">{selectedMhsForSP.persen}%</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-2">Akumulasi Kehadiran (Hadir: {selectedMhsForSP.totalHadir}/16 Sesi)</p>
                                </div>
                                <p>Angka tersebut berada di bawah batas minimum kehadiran yang ditetapkan universitas yaitu sebesar <strong>75%</strong>. Oleh karena itu, melalui surat ini kami memberikan peringatan resmi agar Saudara/i dapat memperbaiki tingkat kehadiran pada sesi perkuliahan selanjutnya.</p>
                                <p>Ketidakpatuhan terhadap peringatan ini dapat berakibat pada pembatalan hak mengikuti Ujian Akhir Semester (UAS) sesuai dengan peraturan akademik yang berlaku.</p>
                            </div>

                            <div className="flex justify-end mt-16">
                                <div className="text-center w-64">
                                    <p className="mb-20">Kepala Bagian Akademik,</p>
                                    <p className="font-bold underline">Admin SI-ABSENSI</p>
                                    <p className="text-[10px]">NIP. 199001012023011001</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
