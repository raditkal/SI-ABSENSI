import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaChalkboardTeacher, FaEdit, FaTrash } from "react-icons/fa";
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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDosen, setEditingDosen] = useState<DosenData | null>(null);

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

    useEffect(() => {
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
            fetchDosen();

            alert(`Sukses! Akun Dosen berhasil dibuat.\nEmail Login: ${autoEmail}`);
        } catch (err: any) {
            alert('Gagal menambahkan dosen: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateDosen = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDosen) return;
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('dosen')
                .update({
                    nip: editingDosen.nip,
                    nama_lengkap: editingDosen.nama_lengkap,
                    gelar: editingDosen.gelar
                })
                .eq('id', editingDosen.id);

            if (error) throw error;

            setIsEditModalOpen(false);
            setEditingDosen(null);
            fetchDosen();
            alert('Data Dosen berhasil diperbarui!');
        } catch (err: any) {
            alert('Gagal update data: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDosen = async (id: string, nama: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus dosen "${nama}"?\nSeluruh jadwal mengajar dosen ini juga akan terhapus.`)) return;

        try {
            const { error } = await supabase
                .from('dosen')
                .delete()
                .eq('id', id);

            if (error) throw error;

            fetchDosen();
            alert('Dosen berhasil dihapus dari database.');
        } catch (err: any) {
            alert('Gagal menghapus data: ' + err.message);
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

                <h3 className="text-xl font-black text-slate-800 mb-8 uppercase italic relative z-10">Daftar Dosen</h3>

                <div className="relative z-10">
                    {isLoading ? (
                        <div className="flex flex-col items-center py-20 justify-center w-full">
                            <i className="fas fa-circle-notch animate-spin text-4xl text-indigo-500 mb-4"></i>
                            <p className="text-sm font-bold text-slate-500 animate-pulse">Memuat Data Dosen...</p>
                        </div>
                    ) : dosenList.length === 0 ? (
                        <div className="flex flex-col items-center py-20 justify-center w-full text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-300 text-2xl opacity-50">
                                👨‍🏫
                            </div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Belum ada data dosen</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {dosenList.map((d) => (
                                <div key={d.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col items-center group hover:bg-white hover:border-indigo-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 relative">
                                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <button 
                                            onClick={() => { setEditingDosen(d); setIsEditModalOpen(true); }}
                                            className="w-8 h-8 bg-white text-amber-500 rounded-full shadow-md flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all"
                                            title="Edit Data"
                                        >
                                        <FaEdit className="text-[10px]" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteDosen(d.id, d.nama_lengkap)}
                                            className="w-8 h-8 bg-white text-rose-500 rounded-full shadow-md flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                            title="Hapus Dosen"
                                        >
                                            <FaTrash className="text-[10px]" />
                                        </button>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black text-lg mb-4 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                                        {d.nama_lengkap.charAt(0).toUpperCase()}
                                    </div>
                                    <p className="text-[9px] font-black text-slate-800 uppercase text-center line-clamp-2 leading-tight h-8 flex items-center justify-center px-1">
                                        {d.nama_lengkap}{d.gelar ? `, ${d.gelar}` : ''}
                                    </p>
                                    <p className="text-[8px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded mt-3 font-bold tracking-widest">{d.nip}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
                    <form onSubmit={handleAddDosen} className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-white max-h-[90vh] overflow-y-auto custom-scroll">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                                <FaChalkboardTeacher className="text-2xl" />
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
                                        <input required type="text" value={newDosen.nip} onChange={e => setNewDosen({ ...newDosen, nip: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none transition-all text-sm" placeholder="Nomor Induk Pegawai" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Nama Lengkap</p>
                                        <input required type="text" value={newDosen.nama_lengkap} onChange={e => setNewDosen({ ...newDosen, nama_lengkap: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none transition-all text-sm" placeholder="Nama Dosen (Tanpa Gelar)" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Gelar</p>
                                        <input type="text" value={newDosen.gelar} onChange={e => setNewDosen({ ...newDosen, gelar: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none transition-all text-sm" placeholder="Contoh: S.Kom., M.Kom." />
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
                                        <input required type="text" value={newDosen.password} onChange={e => setNewDosen({ ...newDosen, password: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none transition-all text-sm" placeholder="Misal: Dosen12345!" />
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

            {/* Edit Modal */}
            {isEditModalOpen && editingDosen && (
                <div className="fixed inset-0 bg-slate-900/40 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
                    <form onSubmit={handleUpdateDosen} className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-white">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                                <FaEdit className="text-2xl" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tighter">Edit Data Dosen</h3>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Perbarui informasi dosen</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">NIP (Tidak dapat diubah)</p>
                                <input readOnly type="text" value={editingDosen.nip} className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 outline-none text-sm cursor-not-allowed" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Nama Lengkap</p>
                                <input required type="text" value={editingDosen.nama_lengkap} onChange={e => setEditingDosen({ ...editingDosen, nama_lengkap: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none text-sm" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Gelar</p>
                                <input type="text" value={editingDosen.gelar || ''} onChange={e => setEditingDosen({ ...editingDosen, gelar: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none text-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="py-5 bg-slate-200 text-slate-600 font-extrabold rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-300">Batal</button>
                            <button type="submit" disabled={isSubmitting} className="py-5 bg-indigo-600 text-white font-extrabold rounded-2xl uppercase text-[10px] tracking-widest hover:shadow-lg">
                                {isSubmitting ? <i className="fas fa-circle-notch animate-spin"></i> : "Simpan"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
