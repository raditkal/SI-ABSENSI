'use client';
import { useState, useEffect } from 'react';
import AttendanceTable from './components/AttendanceTable'; // Sesuaikan path-nya
import Navbar from './components/Navbar';
import ProfileHeader from './components/ProfileHeader';
import ActiveSchedule from './components/ActiveSchedule';
import { supabase } from '../../../lib/supabase';

export default function MahasiswaDashboard() {
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [activeJadwal, setActiveJadwal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);

  useEffect(() => {
    const defaultStudentNIM = '101'; // Default student
    const fetchDashboardData = async () => {
      setIsLoading(true);

      // 1. Dapatkan Auth User saat ini
      let { data: { user }, error: userError } = await supabase.auth.getUser();
      
      // [Bypass Figma] - Matikan sementara agar plugin Figma bisa akses
      if (!user) {
        // user = { id: 'paste-user-id-disini' } as any; // Opsional: Isi ID beneran biar ada datanya
        // return; 
      }
      
      /* 
      if (userError || !user) {
        window.location.href = '/login'; // Redirect kalau belum login
        return;
      }
      */

      // 2. Fetch Mahasiswa Info berdasarkan user_id
      if (user) {
        const { data: mahasiswa } = await supabase
          .from('mahasiswa')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (mahasiswa) {
          setStudentInfo(mahasiswa);
          const studentId = mahasiswa.id;

          // 3. Fetch Matakuliah List and Associated Absensi
          const { data: mkData } = await supabase.from('matakuliah').select('*');
          const { data: absensiData } = await supabase
              .from('absensi')
              .select('pertemuan_ke, status, id_jadwal, jadwal(id_matakuliah)')
              .eq('id_mahasiswa', studentId);

          if (mkData) {
              const mappedCourses = mkData.map((mk: any) => {
                  const absensForMk = absensiData 
                      ? absensiData.filter((a: any) => a.jadwal?.id_matakuliah === mk.id)
                      : [];
                  
                  return {
                      id: mk.id,
                      nama_mk: mk.nama_mk,
                      absens: absensForMk.map((a: any) => ({
                          pertemuan_ke: a.pertemuan_ke,
                          status: a.status
                      }))
                  };
              });
              setAttendanceData(mappedCourses);
          }
        }
      }

      // 3. Cari Jadwal yang AKTIF saat ini (Berdasarkan Hari & Jam + Reschedule)
      const now = new Date();
      const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const todayName = namaHari[now.getDay()];
      const todayYMD = now.toISOString().split('T')[0];

      // Ambil semua jadwal yang mungkin relevan (hari ini asli atau hari ini reschedule)
      const { data: allPotential } = await supabase
        .from('jadwal')
        .select(`
            id,
            hari,
            jam_mulai,
            jam_selesai,
            ruangan,
            matakuliah(nama_mk),
            reschedule_date,
            reschedule_jam_mulai,
            reschedule_jam_selesai,
            is_live
        `)
        .or(`hari.eq.${todayName},reschedule_date.eq.${todayYMD}`);

      if (allPotential) {
        const filtered = allPotential.filter(j => {
            const isOriginalDay = j.hari === todayName;
            const isMovedToToday = j.reschedule_date === todayYMD;
            const isMovedToOtherDay = j.reschedule_date && j.reschedule_date !== todayYMD;

            // Tampilkan jika hari ini hari aslinya (dan tidak dipindah) ATAU memang dipindah ke hari ini
            return (isOriginalDay && !isMovedToOtherDay) || isMovedToToday;
        }).map(j => {
            // Gunakan jam reschedule jika sedang di-reschedule ke hari ini
            const isRescheduledToday = j.reschedule_date === todayYMD;
            return {
                ...j,
                jam_mulai: isRescheduledToday && j.reschedule_jam_mulai ? j.reschedule_jam_mulai : j.jam_mulai,
                jam_selesai: isRescheduledToday && j.reschedule_jam_selesai ? j.reschedule_jam_selesai : j.jam_selesai
            };
        });

        setTodaySchedules(filtered);
      }
      
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  // Interval Checker: Mengecek jadwal mana yang aktif setiap 30 detik
  useEffect(() => {
      const checkActiveSchedule = () => {
          if (todaySchedules.length === 0) {
              setActiveJadwal(null);
              return;
          }

          const now = new Date();
          const timeNow = now.getHours() * 60 + now.getMinutes();

          const active = todaySchedules.find(j => {
              const [h1, m1] = j.jam_mulai.split(':').map(Number);
              const [h2, m2] = j.jam_selesai.split(':').map(Number);
              const start = h1 * 60 + m1;
              const end = h2 * 60 + m2;
              return timeNow >= start && timeNow <= end;
          });

          setActiveJadwal(active || null);
      };

      // Cek langsung saat effect berjalan
      checkActiveSchedule();

      // Set interval 30 detik
      const intervalId = setInterval(checkActiveSchedule, 30000);

      return () => clearInterval(intervalId);
  }, [todaySchedules]);

  if (isLoading) {
      return (
          <div className="min-h-screen bg-[#f4f7fa] flex flex-col items-center justify-center">
              <i className="fas fa-circle-notch animate-spin text-4xl text-indigo-500 mb-4"></i>
              <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Memuat Dashboard Mahasiswa...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa] pb-24 font-sans">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 pt-28 space-y-8">
        <ProfileHeader studentInfo={studentInfo} />
        
        <ActiveSchedule schedule={activeJadwal} studentInfo={studentInfo} />

        {/* Matrix Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Matriks Rekapitulasi</h3>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="uppercase">Hadir</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="uppercase">Izin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="uppercase">Alpa</span>
              </div>
            </div>
          </div>
          <AttendanceTable courses={attendanceData} />
        </div>
      </main>
    </div>
  );
}