'use client';
import AttendanceTable from './components/AttendanceTable'; // Sesuaikan path-nya
import Navbar from './components/Navbar';
import ProfileHeader from './components/ProfileHeader';
import ActiveSchedule from './components/ActiveSchedule';

export default function MahasiswaDashboard() {
  return (
    <div className="min-h-screen bg-[#f4f7fa] pb-24 font-sans">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 pt-28 space-y-8">
        <ProfileHeader />
        
        <ActiveSchedule />

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
          <AttendanceTable />
        </div>
      </main>
    </div>
  );
}