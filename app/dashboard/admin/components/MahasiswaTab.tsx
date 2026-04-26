import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from "react-icons/fa";
import { supabase } from '../../../../lib/supabase'; // Import koneksi supabase

interface MahasiswaTabProps {
    setCurrentTab: (tab: string) => void;
}

interface MahasiswaData {
    id: string;
    nim: string;
    nama_lengkap: string;
    kelas: string;
    angkatan: number;
}

export default function MahasiswaTab({ setCurrentTab }: MahasiswaTabProps) {
    const [activeClass, setActiveClass] = useState('TI-A');
    const [mahasiswaList, setMahasiswaList] = useState<MahasiswaData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Ambil data dari tabel "mahasiswa" Supabase
    useEffect(() => {
        const fetchMahasiswa = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('mahasiswa')
                .select('*')
                .eq('kelas', activeClass);
            
            if (!error && data) {
                setMahasiswaList(data);
            }
            setIsLoading(false);
        };

        fetchMahasiswa();
    }, [activeClass]);

    const renderMhsList = () => {
        if (isLoading) {
            return (
                <div className="col-span-full flex flex-col items-center py-10 justify-center w-full">
                    <i className="fas fa-circle-notch animate-spin text-4xl text-indigo-500 mb-4"></i>
                    <p className="text-sm font-bold text-slate-500 animate-pulse">Memuat Database Supabase...</p>
                </div>
            );
        }

        if (mahasiswaList.length === 0) {
            return (
                <div className="col-span-full flex flex-col items-center py-10 justify-center w-full text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-300">
                        <span className="text-2xl opacity-50">📭</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Belum ada mahasiswa di kelas {activeClass}</p>
                    <p className="text-xs text-slate-400 mt-2">Silakan tambahkan data melalui tabel Supabase terlebih dahulu.</p>
                </div>
            );
        }

        return mahasiswaList.map((mhs, i) => (
            <div key={mhs.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col items-center group hover:bg-white hover:border-indigo-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-lg mb-4 shadow-lg shadow-indigo-200">
                    {mhs.nama_lengkap.charAt(0).toUpperCase()}
                </div>
                <p className="text-[10px] font-black text-slate-800 uppercase text-center line-clamp-2 leading-snug">{mhs.nama_lengkap}</p>
                <p className="text-[8px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded mt-2 font-bold tracking-widest">{mhs.nim}</p>
            </div>
        ));
    };

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMhs, setNewMhs] = useState({ 
        password: '', 
        nim: '', nama_lengkap: '', kelas: 'TI-A', angkatan: new Date().getFullYear() 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const autoEmail = `${newMhs.nim}@unsri.ac.id`;
            const res = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: autoEmail,
                    password: newMhs.password,
                    role: 'mahasiswa',
                    profileData: {
                        nim: newMhs.nim,
                        nama_lengkap: newMhs.nama_lengkap,
                        kelas: newMhs.kelas,
                        angkatan: newMhs.angkatan
                    }
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Terjadi kesalahan');
            }

            setIsAddModalOpen(false);
            setNewMhs({ password: '', nim: '', nama_lengkap: '', kelas: activeClass, angkatan: new Date().getFullYear() });
            
            // Trigger re-fetch
            const { data: mhsData } = await supabase.from('mahasiswa').select('*').eq('kelas', activeClass);
            if (mhsData) setMahasiswaList(mhsData);
            
            alert(`Sukses! Akun Mahasiswa berhasil dibuat.\nEmail Login: ${autoEmail}`);
        } catch (err: any) {
            alert('Gagal menambahkan mahasiswa: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => setCurrentTab('dashboard')} className="group flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-all">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <FaArrowLeft />
                    </div> Kembali
                </button>
                <button 
                    onClick={() => { setNewMhs({...newMhs, kelas: activeClass}); setIsAddModalOpen(true); }}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 hover:shadow-lg transition-all flex items-center gap-2"
                >
                    <i className="fas fa-plus"></i> Tambah Mahasiswa
                </button>
            </div>

            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 relative z-10">
                    <h3 className="text-xl font-black text-slate-800 uppercase italic">Mahasiswa Aktif</h3>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                        {['TI-A', 'TI-B', 'TI-C'].map(k => (
                            <button 
                                key={k}
                                onClick={() => setActiveClass(k)} 
                                className={`px-8 py-2 rounded-xl text-[10px] font-black transition uppercase ${activeClass === k ? 'bg-white shadow-sm text-indigo-600' : 'hover:bg-white/50 text-slate-500'}`}
                            >
                                {k}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 relative z-10">
                    {renderMhsList()}
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
                    <form onSubmit={handleAddStudent} className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-white max-h-[90vh] overflow-y-auto custom-scroll">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-user-plus text-2xl"></i>
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tighter">Data Baru</h3>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Registrasi Akun Mahasiswa</p>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs font-black text-indigo-600 mb-4 uppercase tracking-widest"><i className="fas fa-id-card mr-2"></i>Data Profil</p>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">NIM</p>
                                        <input required type="text" value={newMhs.nim} onChange={e => setNewMhs({...newMhs, nim: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none transition-all text-sm" placeholder="Misal: 09021182126001" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Nama Lengkap</p>
                                        <input required type="text" value={newMhs.nama_lengkap} onChange={e => setNewMhs({...newMhs, nama_lengkap: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none transition-all text-sm" placeholder="Nama Mahasiswa" />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Kelas</p>
                                            <select value={newMhs.kelas} onChange={e => setNewMhs({...newMhs, kelas: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none transition-all appearance-none text-sm">
                                                <option value="TI-A">TI-A</option>
                                                <option value="TI-B">TI-B</option>
                                                <option value="TI-C">TI-C</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Angkatan</p>
                                            <input required type="number" value={newMhs.angkatan} onChange={e => setNewMhs({...newMhs, angkatan: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none transition-all text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                                <p className="text-xs font-black text-indigo-600 mb-4 uppercase tracking-widest"><i className="fas fa-key mr-2"></i>Kredensial Login</p>
                                <div className="space-y-3">
                                    <div className="bg-indigo-50 p-3 rounded-xl mb-3 border border-indigo-100">
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Email (Otomatis)</p>
                                        <p className="text-sm font-black text-indigo-800">{newMhs.nim ? `${newMhs.nim}@unsri.ac.id` : '[NIM]@unsri.ac.id'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Password Awal</p>
                                        <input required type="text" value={newMhs.password} onChange={e => setNewMhs({...newMhs, password: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none transition-all text-sm" placeholder="Misal: Unsri123!" />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting} className="py-5 bg-slate-200 text-slate-600 font-extrabold rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-300 transition-colors">Batal</button>
                            <button type="submit" disabled={isSubmitting} className="py-5 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-extrabold rounded-2xl uppercase text-[10px] tracking-widest hover:shadow-lg transition-all flex items-center justify-center">
                                {isSubmitting ? <i className="fas fa-circle-notch animate-spin"></i> : "Buat Akun"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
