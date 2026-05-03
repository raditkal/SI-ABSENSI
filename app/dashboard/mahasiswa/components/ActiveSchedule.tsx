'use client';
import React, { useState } from 'react';
import { FaQrcode, FaCheckCircle } from "react-icons/fa";
import { supabase } from '../../../../lib/supabase';

interface ActiveScheduleProps {
  schedule?: {
    id: string;
    matakuliah: { nama_mk: string } | null;
    jam_mulai: string;
    jam_selesai: string;
    ruangan: string;
    is_live: boolean;
    pertemuan_sekarang?: number;
  };
  studentInfo?: {
    id: string;
    nama_lengkap: string;
  };
}

export default function ActiveSchedule({ schedule: initialSchedule, studentInfo }: ActiveScheduleProps) {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [isScanning, setIsScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Update local state if prop changes
  React.useEffect(() => {
    setSchedule(initialSchedule);
  }, [initialSchedule]);

  // POLLING: Cek status is_live setiap 3 detik
  React.useEffect(() => {
      if (!initialSchedule?.id) return;

      const checkLiveStatus = async () => {
          const { data, error } = await supabase
              .from('jadwal')
              .select('is_live, pertemuan_sekarang')
              .eq('id', initialSchedule.id)
              .single();

          if (!error && data) {
              setSchedule(prev => {
                  if (prev && (prev.is_live !== data.is_live || prev.pertemuan_sekarang !== data.pertemuan_sekarang)) {
                      return { ...prev, is_live: data.is_live, pertemuan_sekarang: data.pertemuan_sekarang };
                  }
                  return prev;
              });
          }
      };

      // Cek pertama kali
      checkLiveStatus();

      // Mulai interval
      const intervalId = setInterval(() => {
          checkLiveStatus();
      }, 3000); // Cek setiap 3 detik

      return () => {
          clearInterval(intervalId);
      };
  }, [initialSchedule?.id]);

  const handleScan = async () => {
      if (!schedule || !studentInfo) return;
      if (!schedule.is_live) {
          setErrorMsg("Sesi belum dibuka oleh dosen.");
          return;
      }
      setIsScanning(true);
      setErrorMsg('');

      try {
          // 1. Fetch Setting Radius & Koordinat Kampus dari Supabase
          const { data: config } = await supabase.from('settings').select('*').eq('id', 1).single();
          const kampusLat = parseFloat(config?.kampus_lat || '-3.218552693892837');
          const kampusLng = parseFloat(config?.kampus_lng || '104.65087595204481');
          const maxRadius = config?.radius_meter || 500;

          // 2. Fase Verifikasi Lokasi (DINONAKTIFKAN UNTUK TESTING)
          const distanceCheck = { valid: true, message: "Bypass GPS aktif (Testing Mode)" };

          if (!distanceCheck.valid) {
              throw new Error(distanceCheck.message);
          }

          // 2. Fase Validasi & Insert Data ke Supabase
          const { error } = await supabase.from('absensi').insert({
              id_jadwal: schedule.id,
              id_mahasiswa: studentInfo.id,
              pertemuan_ke: schedule.pertemuan_sekarang || 1, // Menggunakan data dinamis dari dosen
              status: 'Hadir',
              waktu_absen: new Date().toISOString()
          });

          if (error) {
              if (error.code === '23505') {
                  setSuccess(true);
              } else {
                  throw new Error(error.message);
              }
          } else {
              setSuccess(true);
          }
      } catch (err: any) {
          setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
      } finally {
          setIsScanning(false);
      }
  };

  if (!schedule) {
      return (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span> Jadwal Aktif
            </h3>
            <div className="card-gradient rounded-[3rem] p-1 shadow-2xl shadow-indigo-100">
              <div className="bg-white/10 backdrop-blur-md rounded-[2.8rem] p-8 text-white text-center">
                  <h4 className="text-xl font-black uppercase tracking-tight">Tidak ada jadwal aktif saat ini</h4>
              </div>
            </div>
          </div>
      );
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span> Jadwal Aktif
      </h3>
      <div className="card-gradient rounded-[3rem] p-1 shadow-2xl shadow-indigo-100 relative overflow-hidden">
        <div className="bg-white/10 backdrop-blur-md rounded-[2.8rem] p-8 text-white relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">Sesi Sedang Berjalan</span>
              <h4 className="text-3xl font-black mt-3 uppercase tracking-tight">{schedule.matakuliah?.nama_mk || 'Mata Kuliah'}</h4>
              <p className="text-indigo-100 font-medium mt-1">{schedule.jam_mulai?.slice(0, 5)} - {schedule.jam_selesai?.slice(0, 5)} • {schedule.ruangan}</p>
              {errorMsg && <p className="text-red-200 mt-2 text-xs font-bold">{errorMsg}</p>}
            </div>
            
            {success ? (
                <div className="bg-emerald-50 text-emerald-600 px-10 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center gap-3 animate-in zoom-in duration-300">
                    <FaCheckCircle className="text-lg" /> Berhasil Absen
                </div>
            ) : !schedule?.is_live ? (
                <div className="bg-white/20 text-white/60 px-10 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] border-2 border-white/10 flex items-center gap-3 cursor-not-allowed">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse"></div> Menunggu Sesi Dibuka
                </div>
            ) : (
                <button 
                    onClick={handleScan}
                    disabled={isScanning}
                    className="bg-white text-indigo-600 px-10 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-80 disabled:hover:scale-100"
                >
                    {isScanning ? (
                        <><i className="fas fa-circle-notch animate-spin text-lg"></i> Memindai...</>
                    ) : (
                        <><FaQrcode className="text-lg" /> Scan Sekarang</>
                    )}
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
