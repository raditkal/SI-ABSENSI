'use client';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaArrowLeft, FaWifi, FaBolt, FaQrcode, FaPowerOff } from "react-icons/fa";
import { supabase } from '../../lib/supabase';

export default function LiveSession({ course, onBack }: { course: any, onBack: () => void }) {
    const [isPresenting, setIsPresenting] = useState(false);
    const [attendanceCount, setAttendanceCount] = useState(0);
    const [totalStudents, setTotalStudents] = useState(0);
    const [recentAttendees, setRecentAttendees] = useState<any[]>([]);

    useEffect(() => {
        const fetchTotalStudents = async () => {
            const { count } = await supabase
                .from('mahasiswa')
                .select('*', { count: 'exact', head: true });
            setTotalStudents(count || 0);
        };
        fetchTotalStudents();
    }, []);

    useEffect(() => {
        if (!isPresenting || !course) return;

        const fetchAttendance = async () => {
            const { data, error } = await supabase
                .from('absensi')
                .select(`
                    waktu_absen,
                    mahasiswa (nim, nama_lengkap)
                `)
                .eq('id_jadwal', course.id)
                .order('waktu_absen', { ascending: false });

            if (!error && data) {
                setRecentAttendees(data);
                setAttendanceCount(data.length);
            }
        };

        // Tarik data saat pertama kali jalan
        fetchAttendance();
        
        // Menggunakan Supabase Realtime untuk mendapatkan update instan
        const channel = supabase
            .channel(`live-attendance-${course.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'absensi' }, // Menghapus filter yang terlalu ketat
                (payload) => {
                    // Cek apakah data yang masuk sesuai dengan jadwal yang sedang dibuka
                    if (payload.new.id_jadwal === course.id) {
                        fetchAttendance();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isPresenting, course]);

    // Efek untuk mengaktifkan status 'is_live' di database saat sesi dimulai
    useEffect(() => {
        const updateLiveStatus = async (status: boolean) => {
            if (!course?.id) return;
            await supabase
                .from('jadwal')
                .update({ is_live: status })
                .eq('id', course.id);
        };

        if (isPresenting) {
            updateLiveStatus(true);
        }

        // Cleanup: Saat komponen di-unmount atau sesi berakhir
        return () => {
            updateLiveStatus(false);
        };
    }, [isPresenting, course?.id]);

    const handleEndSession = async () => {
        if (course?.id) {
            await supabase
                .from('jadwal')
                .update({ is_live: false })
                .eq('id', course.id);
        }
        onBack();
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <button onClick={handleEndSession} className="group flex items-center gap-3 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:-translate-x-1 transition-transform">
                        <FaArrowLeft />
                    </div>
                    Kembali ke Dashboard
                </button>
                {isPresenting && (
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full font-black text-[10px] uppercase">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Sesi Aktif
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <div className="glass rounded-[3rem] p-10 shadow-xl shadow-slate-200/50">
                        {!isPresenting ? (
                            <div className="text-center py-10">
                                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl">
                                    <FaWifi />
                                </div>
                                <h4 className="text-4xl font-extrabold text-slate-800 tracking-tighter uppercase mb-2">{course.name}</h4>
                                <div className="flex justify-center gap-3 mb-10">
                                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-widest">{course.room}</span>
                                </div>
                                <button onClick={() => setIsPresenting(true)} className="bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-extrabold px-12 py-5 flex items-center justify-center mx-auto rounded-2xl uppercase tracking-[0.2em] text-xs hover:shadow-lg transition-all">
                                    <FaQrcode className="mr-3" /> Buat QR Akses Presensi
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row items-center gap-12">
                                <div className="relative p-6 bg-white rounded-[2.5rem] shadow-inner border-2 border-slate-50">
                                    <QRCodeSVG value={`SESSION-${course.id}`} size={220} />
                                </div>
                                <div className="flex-1 w-full space-y-6">
                                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                                        <p className="text-[10px] font-bold uppercase opacity-50 tracking-[0.2em] mb-4">Statistik Langsung</p>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-7xl font-extrabold italic">{attendanceCount}</span>
                                            <span className="text-xl font-medium opacity-30">/ {totalStudents}</span>
                                        </div>
                                        <div className="w-full bg-white/10 h-3 rounded-full mt-6 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                                                style={{ width: `${(Math.min(attendanceCount / (totalStudents || 1), 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <button onClick={handleEndSession} className="w-full py-5 rounded-2xl border-2 flex items-center justify-center gap-2 border-red-50 text-red-500 font-extrabold uppercase text-[10px] tracking-[0.2em] hover:bg-red-50 hover:border-red-100 transition-all">
                                        <FaPowerOff /> Akhiri Sesi Kelas
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="lg:col-span-4 glass rounded-[3rem] p-6 shadow-xl shadow-slate-200/50 flex flex-col h-[600px]">
                    <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-2 flex justify-between items-center">
                        Aktivitas Terbaru <FaBolt className="text-amber-400" />
                    </h5>
                    <div className="flex-1 overflow-y-auto custom-scroll space-y-4 px-2">
                        {recentAttendees.length === 0 ? (
                            <div className="text-center py-20 opacity-20">
                                <div className="text-4xl mb-4 animate-pulse uppercase">...</div>
                                <p className="text-[10px] font-bold uppercase tracking-widest">Menunggu data masuk...</p>
                            </div>
                        ) : (
                            recentAttendees.map((att, idx) => (
                                <div key={idx} className="animate-in slide-in-from-top-2 p-4 bg-white rounded-2xl shadow-sm border border-slate-50 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-xl flex items-center justify-center font-extrabold text-xs shadow-md shadow-indigo-100">
                                        {att.mahasiswa?.nama_lengkap?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight line-clamp-1">{att.mahasiswa?.nama_lengkap}</div>
                                        <div className="text-[9px] font-bold text-slate-400">
                                            {att.mahasiswa?.nim} • {new Date(att.waktu_absen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">TERVERIFIKASI</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}