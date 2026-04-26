import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from "react-icons/fa";
import { supabase } from '../../../../lib/supabase';

interface DosenTabProps {
    setCurrentTab: (tab: string) => void;
}

interface DosenData {
    id: string;
    nip: string;
    nama_lengkap: string;
    gelar: string;
}

export default function DosenTab({ setCurrentTab }: DosenTabProps) {
    const [dosenList, setDosenList] = useState<DosenData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDosen = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('dosen')
                .select('*')
                .order('nama_lengkap', { ascending: true });
            
            if (!error && data) {
                setDosenList(data);
            }
            setIsLoading(false);
        };

        fetchDosen();
    }, []);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newDosen, setNewDosen] = useState({ 
        password: '', 
        nip: '', nama_lengkap: '', gelar: '' 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddDosen = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const autoEmail = `${newDosen.nip}@unsri.ac.id`;
            const res = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: autoEmail,
                    password: newDosen.password,
                    role: 'dosen',
                    profileData: {
                        nip: newDosen.nip,
                        nama_lengkap: newDosen.nama_lengkap,
                        gelar: newDosen.gelar
                    }
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Terjadi kesalahan');
            }

            setIsAddModalOpen(false);
            setNewDosen({ password: '', nip: '', nama_lengkap: '', gelar: '' });
            
            // Trigger re-fetch
            const { data: dData } = await supabase.from('dosen').select('*').order('nama_lengkap', { ascending: true });
            if (dData) setDosenList(dData);
            
            alert(`Sukses! Akun Dosen berhasil dibuat.\nEmail Login: ${autoEmail}`);
        } catch (err: any) {
            alert('Gagal menambahkan dosen: ' + err.message);
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
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 hover:shadow-lg transition-all flex items-center gap-2"
                >
                    <i className="fas fa-plus"></i> Tambah Dosen
                </button>
            </div>

            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                
                <h3 className="text-xl font-black text-slate-800 mb-8 uppercase italic underline decoration-indigo-500 decoration-4 relative z-10">Direktori Dosen</h3>
                
                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-left">
                            <tr>
                                <th className="p-6 rounded-l-2xl">Dosen</th>
                                <th className="p-6 rounded-r-2xl">NIP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={2} className="p-10 text-center text-slate-400 font-bold text-sm">
                                        <i className="fas fa-circle-notch animate-spin text-2xl text-indigo-500 mb-3 block"></i>
                                        Memuat Data...
                                    </td>
                                </tr>
                            ) : dosenList.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="p-10 text-center text-slate-400 font-bold text-sm">
                                        Data dosen masih kosong di Supabase.
                                    </td>
                                </tr>
                            ) : (
                                dosenList.map((d) => (
                                    <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black italic shadow-md">
                                                    {d.nama_lengkap.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-black text-slate-800 uppercase text-sm italic">
                                                    {d.nama_lengkap} {d.gelar ? `, ${d.gelar}` : ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 font-bold text-slate-500 tracking-widest text-xs">
                                            {d.nip}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
                    <form onSubmit={handleAddDosen} className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-white max-h-[90vh] overflow-y-auto custom-scroll">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-chalkboard-teacher text-2xl"></i>
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tighter">Data Baru</h3>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Registrasi Akun Dosen</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs font-black text-indigo-600 mb-4 uppercase tracking-widest"><i className="fas fa-id-card mr-2"></i>Data Profil</p>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">NIP</p>
                                        <input required type="text" value={newDosen.nip} onChange={e => setNewDosen({...newDosen, nip: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none transition-all text-sm" placeholder="Nomor Induk Pegawai" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Nama Lengkap</p>
                                        <input required type="text" value={newDosen.nama_lengkap} onChange={e => setNewDosen({...newDosen, nama_lengkap: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none transition-all text-sm" placeholder="Nama Dosen (Tanpa Gelar)" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Gelar</p>
                                        <input type="text" value={newDosen.gelar} onChange={e => setNewDosen({...newDosen, gelar: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none transition-all text-sm" placeholder="Contoh: S.Kom., M.Kom." />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                                <p className="text-xs font-black text-indigo-600 mb-4 uppercase tracking-widest"><i className="fas fa-key mr-2"></i>Kredensial Login</p>
                                <div className="space-y-3">
                                    <div className="bg-indigo-50 p-3 rounded-xl mb-3 border border-indigo-100">
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Email (Otomatis)</p>
                                        <p className="text-sm font-black text-indigo-800">{newDosen.nip ? `${newDosen.nip}@unsri.ac.id` : '[NIP]@unsri.ac.id'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Password Awal</p>
                                        <input required type="text" value={newDosen.password} onChange={e => setNewDosen({...newDosen, password: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none transition-all text-sm" placeholder="Misal: Dosen12345!" />
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
