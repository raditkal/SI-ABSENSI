'use client';
import { useState, useEffect } from 'react';
import LectureMatrix from '../../components/LectureMatrix';
import LiveSession from '../../components/LiveSession';
import { FaArrowLeft, FaClock, FaCalendarDay } from "react-icons/fa";
import Navbar from './components/Navbar';
import DashboardHeader from './components/DashboardHeader';
import CourseList, { Course } from './components/CourseList';
import { supabase } from '../../../lib/supabase';

export default function DosenDashboard() {
    const [view, setView] = useState<'main' | 'live' | 'history'>('main');
    const [activeCourse, setActiveCourse] = useState<Course | null>(null);
    const [activeTab, setActiveTab] = useState<'today'|'all'|'upcoming'>('today');
    const [rescheduleCourse, setRescheduleCourse] = useState<Course | null>(null);

    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDosenData = async () => {
            setIsLoading(true);
            
            // 1. Fetch Mahasiswa
            const { data: mhsData } = await supabase
                .from('mahasiswa')
                .select('nim, nama_lengkap')
                .order('nama_lengkap');
            
            if (mhsData) {
                setStudents(mhsData.map(m => ({ nim: m.nim, nama: m.nama_lengkap })));
            }

            // 2. Fetch Jadwal (Dosen login saat ini belum dibatasi per dosen, ditampilkan semua jadwal mock)
            const { data: jadwalData } = await supabase
                .from('jadwal')
                .select(`
                    id,
                    hari,
                    jam_mulai,
                    jam_selesai,
                    ruangan,
                    matakuliah(nama_mk)
                `);

            if (jadwalData) {
                // Konversi data supabase ke format Course
                const formattedCourses: Course[] = jadwalData.map(j => ({
                    id: j.id as unknown as number, // Using any here because original had number, but in DB it's UUID string
                    name: (j.matakuliah as any)?.nama_mk || 'Matkul',
                    class: 'REGULER', // Kelas belum ada di jadwal, default REGULER
                    room: j.ruangan,
                    time: `${j.jam_mulai.slice(0,5)} - ${j.jam_selesai.slice(0,5)}`,
                    day: j.hari,
                    cap: 40 // Default capacity
                }));
                setCourses(formattedCourses);
            }
            setIsLoading(false);
        };

        fetchDosenData();
    }, []);

    const handleHistoryClick = (course: Course) => {
        setActiveCourse(course);
        setView('history');
    };

    const handleLaunchClick = (course: Course) => {
        setActiveCourse(course);
        setView('live');
    };

    const filteredCourses = courses.filter(c => {
        const hariAwal = ['Senin', 'Selasa']; // Mocking today
        if (activeTab === 'today') return hariAwal.includes(c.day);
        if (activeTab === 'upcoming') return !hariAwal.includes(c.day);
        return true;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f0f4f9] flex flex-col items-center justify-center">
                <i className="fas fa-circle-notch animate-spin text-4xl text-indigo-500 mb-4"></i>
                <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Memuat Dashboard Dosen...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f4f9] pb-12 font-sans overflow-x-hidden text-slate-900 relative">
            <div className="fixed top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-600 to-purple-600 z-[200]"></div>

            <Navbar />
            
            {view === 'live' && (
                <main className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <LiveSession course={activeCourse} onBack={() => setView('main')} />
                </main>
            )}

            {view === 'history' && (
                <main className="max-w-7xl mx-auto px-4 md:px-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pt-8">
                        <div className="flex items-center gap-6">
                            <button onClick={() => setView('main')} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm cursor-pointer">
                                <FaArrowLeft />
                            </button>
                            <div>
                                <h3 className="text-3xl font-extrabold text-slate-800 tracking-tighter uppercase leading-none mb-2">{activeCourse?.name}</h3>
                                <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-md uppercase tracking-widest">{activeCourse?.class}</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-l-4 border-l-emerald-500 shadow-sm">
                                <p className="text-[9px] font-black text-slate-400 uppercase">Avg Presence</p>
                                <p className="text-xl font-extrabold text-slate-700">94.2%</p>
                            </div>
                        </div>
                    </div>

                    <LectureMatrix students={students} courseName={activeCourse?.name || ""} />
                </main>
            )}

            {view === 'main' && (
                <main className="max-w-7xl mx-auto px-4 md:px-8 space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DashboardHeader />
                    
                    <div className="flex gap-8 border-b border-slate-200 px-2 overflow-x-auto custom-scroll">
                        <button onClick={() => setActiveTab('today')} className={`relative pb-4 font-extrabold text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors ${activeTab === 'today' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                            Today
                            {activeTab === 'today' && <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-indigo-600 border-b-2 border-indigo-600 rounded-t-sm" />}
                        </button>
                        <button onClick={() => setActiveTab('all')} className={`relative pb-4 font-extrabold text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors ${activeTab === 'all' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                            All Courses
                            {activeTab === 'all' && <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-indigo-600 border-b-2 border-indigo-600 rounded-t-sm" />}
                        </button>
                        <button onClick={() => setActiveTab('upcoming')} className={`relative pb-4 font-extrabold text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors ${activeTab === 'upcoming' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                            Upcoming
                            {activeTab === 'upcoming' && <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-indigo-600 border-b-2 border-indigo-600 rounded-t-sm" />}
                        </button>
                    </div>

                    {courses.length === 0 ? (
                        <div className="bg-white rounded-[3rem] p-12 text-center shadow-sm">
                            <span className="text-4xl">📚</span>
                            <h3 className="mt-4 font-extrabold text-slate-800">BELUM ADA JADWAL</h3>
                            <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto mt-2">Dosen ini belum memiliki rincian jadwal yang terdaftar pada database Supabase.</p>
                        </div>
                    ) : (
                        <CourseList 
                            courses={filteredCourses} 
                            onHistoryClick={handleHistoryClick} 
                            onLaunchClick={handleLaunchClick} 
                            onDelayClick={(course) => setRescheduleCourse(course)}
                        />
                    )}
                </main>
            )}

            {rescheduleCourse && (
                <div className="fixed inset-0 bg-slate-900/40 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-white">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-12">
                                <FaClock className="text-3xl" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tighter">Reschedule</h3>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">{rescheduleCourse?.name}</p>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="relative">
                                <FaCalendarDay className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="date" className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none transition-all" />
                            </div>
                            <select className="w-full p-4 bg-slate-100 border-none rounded-2xl font-bold text-slate-700 text-sm focus:ring-2 ring-indigo-500 outline-none transition-all appearance-none">
                                <option>Select Reason...</option>
                                <option>Official Meeting</option>
                                <option>Health Issues</option>
                                <option>Emergencies</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setRescheduleCourse(null)} className="py-5 bg-slate-200 text-slate-600 font-extrabold rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-300 transition-colors">Cancel</button>
                            <button onClick={() => { alert('Reschedule synchronized successfully!'); setRescheduleCourse(null); }} className="py-5 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-extrabold rounded-2xl uppercase text-[10px] tracking-widest hover:shadow-lg transition-all">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}