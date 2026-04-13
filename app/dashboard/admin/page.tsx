"use client";
import { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import DashboardTab from './components/DashboardTab';
import MahasiswaTab from './components/MahasiswaTab';
import DosenTab from './components/DosenTab';
import MataKuliahTab from './components/MataKuliahTab';
import LaporanTab from './components/LaporanTab';

export default function AdminDashboard() {
    const [currentTab, setCurrentTab] = useState('dashboard');

    const getTitle = () => {
        if (currentTab === 'dashboard') return 'Dashboard Utama';
        if (currentTab === 'mhs') return 'Database Mahasiswa';
        if (currentTab === 'dosen') return 'Direktori Dosen';
        if (currentTab === 'matakuliah') return 'Monitoring Jadwal';
        if (currentTab === 'laporan') return 'Laporan & Analitik';
        return 'Dashboard Utama';
    };

    return (
        <div className="flex min-h-screen p-4 gap-4 bg-[#f8fafc] text-slate-800 font-sans">
            {/* Sidebar */}
            <AdminSidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

            <main className="flex-1 flex flex-col gap-6 w-full max-w-full overflow-hidden">
                {/* Header */}
                <AdminHeader title={getTitle()} />

                {currentTab === 'dashboard' && <DashboardTab setCurrentTab={setCurrentTab} />}
                {currentTab === 'mhs' && <MahasiswaTab setCurrentTab={setCurrentTab} />}
                {currentTab === 'dosen' && <DosenTab setCurrentTab={setCurrentTab} />}
                {currentTab === 'matakuliah' && <MataKuliahTab setCurrentTab={setCurrentTab} />}
                {currentTab === 'laporan' && <LaporanTab setCurrentTab={setCurrentTab} />}
            </main>
        </div>
    );
}