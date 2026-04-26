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

  useEffect(() => {
    const defaultStudentNIM = '101'; // Default student
    const fetchDashboardData = async () => {
      setIsLoading(true);

      // 1. Dapatkan Auth User saat ini
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        window.location.href = '/login'; // Redirect kalau belum login
        return;
      }

      // 2. Fetch Mahasiswa Info berdasarkan user_id
      const { data: mahasiswa } = await supabase
        .from('mahasiswa')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (mahasiswa) {
        setStudentInfo(mahasiswa);
        const studentId = mahasiswa.id;

        // 3. Fetch Matakuliah List and Associated Absensi
        // First get all Matakuliah to display the rows
        const { data: mkData } = await supabase.from('matakuliah').select('*');
        // Then get all Absensi records for this student
        const { data: absensiData } = await supabase
            .from('absensi')
            .select('pertemuan_ke, status, id_jadwal, jadwal(id_matakuliah)')
            .eq('id_mahasiswa', studentId);

        if (mkData) {
            // Map absensi into the matakuliah array
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

      // 3. Fetch Jadwal for Active Schedule
      const { data: jadwalData } = await supabase
          .from('jadwal')
          .select(`
            id,
            hari,
            jam_mulai,
            jam_selesai,
            ruangan,
            matakuliah(nama_mk)
        `).limit(1);

      if (jadwalData && jadwalData.length > 0) {
        setActiveJadwal(jadwalData[0]);
      }
      
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

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