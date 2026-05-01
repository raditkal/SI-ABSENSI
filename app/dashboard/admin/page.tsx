"use client";
import { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import DashboardTab from './components/DashboardTab';
import MahasiswaTab from './components/MahasiswaTab';
import DosenTab from './components/DosenTab';
import MataKuliahTab from './components/MataKuliahTab';
import LaporanTab from './components/LaporanTab';
import KoreksiTab from './components/KoreksiTab';

export default function AdminDashboard() {
    const [currentTab, setCurrentTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const getTitle = () => {
        if (currentTab === 'dashboard') return 'Dashboard Utama';
        if (currentTab === 'mhs') return 'Database Mahasiswa';
        if (currentTab === 'dosen') return 'Direktori Dosen';
        if (currentTab === 'matakuliah') return 'Monitoring Jadwal';
        if (currentTab === 'laporan') return 'Laporan & Analitik';
        if (currentTab === 'koreksi') return 'Koreksi Log Presensi';
        return 'Dashboard Utama';
    };

    return (
        <div className="flex min-h-screen p-0 lg:p-4 gap-4 bg-[#f8fafc] text-slate-800 font-sans relative">
            {/* Sidebar */}
            <AdminSidebar 
                currentTab={currentTab} 
                setCurrentTab={(tab) => { setCurrentTab(tab); setIsSidebarOpen(false); }} 
                isOpen={isSidebarOpen} 
                setIsOpen={setIsSidebarOpen}
            />

            <main className="flex-1 flex flex-col gap-6 w-full max-w-full overflow-hidden p-4 lg:p-0">
                {/* Header */}
                <AdminHeader title={getTitle()} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

                {currentTab === 'dashboard' && <DashboardTab setCurrentTab={setCurrentTab} />}
                {currentTab === 'mhs' && <MahasiswaTab setCurrentTab={setCurrentTab} />}
                {currentTab === 'dosen' && <DosenTab setCurrentTab={setCurrentTab} />}
                {currentTab === 'matakuliah' && <MataKuliahTab setCurrentTab={setCurrentTab} />}
                {currentTab === 'laporan' && <LaporanTab setCurrentTab={setCurrentTab} />}
                {currentTab === 'koreksi' && <KoreksiTab setCurrentTab={setCurrentTab} />}
            </main>
        </div>
    );
}