'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LiveSession from '../../../../components/LiveSession';
import { supabase } from '../../../../../lib/supabase';
import { FaArrowLeft } from "react-icons/fa";

export default function SesiPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [course, setCourse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            const { data, error } = await supabase
                .from('jadwal')
                .select('*, matakuliah(nama_mk, sks)')
                .eq('id', id)
                .single();

            if (!error && data) {
                setCourse({
                    id: data.id,
                    name: data.matakuliah?.nama_mk,
                    room: data.ruangan,
                    time: `${data.jam_mulai} - ${data.jam_selesai}`,
                    day: data.hari,
                });
            }
            setIsLoading(false);
        };

        if (id) fetchCourse();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Memuat Data Sesi...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-slate-800">Sesi tidak ditemukan</h1>
                    <button 
                        onClick={() => router.push('/dashboard/dosen')}
                        className="mt-4 text-indigo-600 font-bold"
                    >
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <LiveSession 
                    course={course} 
                    onBack={() => router.push('/dashboard/dosen')} 
                    initialIsPresenting={true}
                />
            </div>
        </div>
    );
}
