import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaClock, FaMapMarkerAlt, FaPlus, FaBook, FaEdit, FaTrash } from "react-icons/fa";
import { supabase } from '../../../../lib/supabase';

interface MataKuliahTabProps {
    setCurrentTab: (tab: string) => void;
}

interface JadwalData {
    id: string;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruangan: string;
    id_matakuliah: string;
    id_dosen: string;
    matakuliah: {
        nama_mk: string;
    };
    dosen: {
        nama_lengkap: string;
    };
}

export default function MataKuliahTab({ setCurrentTab }: MataKuliahTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<'jadwal' | 'matakuliah'>('jadwal');
    const [activeHari, setActiveHari] = useState('Senin');
    const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    
    const [jadwalList, setJadwalList] = useState<JadwalData[]>([]);
    const [mkList, setMkList] = useState<any[]>([]);
    const [dosenList, setDosenList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [isAddMkModalOpen, setIsAddMkModalOpen] = useState(false);
    const [newMk, setNewMk] = useState({ kode_mk: '', nama_mk: '', sks: 3 });

    const suggestNextKodeMk = () => {
        if (mkList.length === 0) return 'MK001';
        
        // Cari kode yang berformat MKxxx dan ambil angka terbesarnya
        const numericCodes = mkList
            .map(mk => {
                const match = mk.kode_mk?.match(/^MK(\d+)$/);
                return match ? parseInt(match[1]) : 0;
            })
            .filter(n => n > 0);
        
        const nextNum = numericCodes.length > 0 ? Math.max(...numericCodes) + 1 : mkList.length + 1;
        return `MK${nextNum.toString().padStart(3, '0')}`;
    };

    const handleOpenAddMk = () => {
        setNewMk({ ...newMk, kode_mk: suggestNextKodeMk() });
        setIsAddMkModalOpen(true);
    };

    const [isAddJadwalModalOpen, setIsAddJadwalModalOpen] = useState(false);
    const [editingJadwal, setEditingJadwal] = useState<any>(null);
    const [newJadwal, setNewJadwal] = useState({ id_matakuliah: '', id_dosen: '', hari: 'Senin', jam_mulai: '08:00', jam_selesai: '10:30', ruangan: '' });

    const fetchJadwal = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('jadwal')
            .select(`
                id, hari, jam_mulai, jam_selesai, ruangan, id_matakuliah, id_dosen,
                matakuliah(nama_mk), dosen(nama_lengkap)
            `)
            .eq('hari', activeHari);
        if (!error && data) setJadwalList(data as unknown as JadwalData[]);
        setIsLoading(false);
    };

    const fetchMk = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('matakuliah').select('*').order('nama_mk');
        if (!error && data) setMkList(data);
        setIsLoading(false);
    };

    const fetchDosen = async () => {
        const { data } = await supabase.from('dosen').select('id, nama_lengkap').order('nama_lengkap');
        if (data) setDosenList(data);
    };

    useEffect(() => {
        if (activeSubTab === 'jadwal') fetchJadwal();
        if (activeSubTab === 'matakuliah') fetchMk();
        fetchDosen(); // Always need dosen for jadwal form anyway
    }, [activeHari, activeSubTab]);

    const handleAddMk = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const { error } = await supabase.from('matakuliah').insert([newMk]);
        setIsSubmitting(false);
        if (error) alert('Gagal menambah MK: ' + error.message);
        else {
            alert('Mata Kuliah berhasil ditambahkan!');
            setIsAddMkModalOpen(false);
            setNewMk({ kode_mk: '', nama_mk: '', sks: 3 });
            fetchMk();
        }
    };

    const handleOpenEditJadwal = (j: JadwalData) => {
        setEditingJadwal(j);
        setNewJadwal({
            id_matakuliah: j.id_matakuliah,
            id_dosen: j.id_dosen,
            hari: j.hari,
            jam_mulai: j.jam_mulai.slice(0, 5),
            jam_selesai: j.jam_selesai.slice(0, 5),
            ruangan: j.ruangan
        });
        fetchMk();
        setIsAddJadwalModalOpen(true);
    };

    const handleDeleteJadwal = async (id: string) => {
        if (!confirm("Yakin ingin menghapus jadwal ini? Data presensi yang terhubung mungkin akan ikut terhapus.")) return;
        const { error } = await supabase.from('jadwal').delete().eq('id', id);
        if (!error) fetchJadwal();
        else alert('Gagal menghapus jadwal: ' + error.message);
    };

    const handleSaveJadwal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newJadwal.id_matakuliah || !newJadwal.id_dosen) {
            alert("Pilih Mata Kuliah dan Dosen terlebih dahulu!");
            return;
        }
        setIsSubmitting(true);
        
        let error;
        if (editingJadwal) {
            const { error: err } = await supabase.from('jadwal').update(newJadwal).eq('id', editingJadwal.id);
            error = err;
        } else {
            const { error: err } = await supabase.from('jadwal').insert([newJadwal]);
            error = err;
        }

        setIsSubmitting(false);
        if (error) alert('Gagal menyimpan Jadwal: ' + error.message);
        else {
            alert(editingJadwal ? 'Jadwal berhasil diupdate!' : 'Jadwal berhasil ditambahkan!');
            setIsAddJadwalModalOpen(false);
            setEditingJadwal(null);
            setNewJadwal({ id_matakuliah: '', id_dosen: '', hari: 'Senin', jam_mulai: '08:00', jam_selesai: '10:30', ruangan: '' });
            fetchJadwal();
        }
    };

    const renderJadwalGrid = () => {
        if (isLoading) return <div className="col-span-full py-10 text-center text-slate-400 font-bold"><i className="fas fa-circle-notch animate-spin text-2xl mb-3 block"></i>Memuat...</div>;
        if (jadwalList.length === 0) return <div className="col-span-full py-10 text-center text-slate-400 font-bold">Belum ada jadwal di hari {activeHari}</div>;
        
        return jadwalList.map((j) => (
            <div key={j.id} className="p-6 border border-slate-100 rounded-[2.5rem] bg-slate-50 flex flex-col justify-between hover:bg-white transition-all shadow-sm hover:shadow-lg">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-white border border-slate-200 text-indigo-600 text-[9px] font-black rounded-lg uppercase tracking-widest">Jadwal</span>
                        <div className="flex gap-2">
                            <button onClick={() => handleOpenEditJadwal(j)} className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all"><FaEdit /></button>
                            <button onClick={() => handleDeleteJadwal(j.id)} className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all"><FaTrash /></button>
                        </div>
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-lg uppercase tracking-tighter leading-tight">{j.matakuliah?.nama_mk || 'MK Terhapus'}</h4>
                    <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{j.dosen?.nama_lengkap || 'Dosen Tidak Ditemukan'}</p>
                </div>
                <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-500">
                        <span className="flex items-center"><FaClock className="mr-2 text-indigo-400" /> {j.jam_mulai.slice(0, 5)} - {j.jam_selesai.slice(0, 5)}</span>
                        <span className="flex items-center"><FaMapMarkerAlt className="mr-2 text-red-400" /> {j.ruangan}</span>
                    </div>
                </div>
            </div>
        ));
    };

    const handleDeleteMk = async (id: string) => {
        if (!confirm("Yakin ingin menghapus mata kuliah ini? Jadwal yang terhubung juga mungkin akan error.")) return;
        const { error } = await supabase.from('matakuliah').delete().eq('id', id);
        if (!error) fetchMk();
        else alert('Gagal menghapus MK: ' + error.message);
    };

    const renderMkList = () => {
        if (isLoading) return <div className="col-span-full py-10 text-center text-slate-400 font-bold"><i className="fas fa-circle-notch animate-spin text-2xl mb-3 block"></i>Memuat...</div>;
        if (mkList.length === 0) return <div className="col-span-full py-10 text-center text-slate-400 font-bold">Belum ada Mata Kuliah</div>;

        return (
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                        <tr>
                            <th className="p-6 rounded-l-2xl">Mata Kuliah</th>
                            <th className="p-6">SKS</th>
                            <th className="p-6 text-center rounded-r-2xl">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mkList.map((m) => (
                            <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                                <td className="p-6">
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-800 uppercase text-sm italic">{m.nama_mk}</span>
                                        <span className="text-[9px] font-bold text-indigo-500 tracking-widest uppercase mt-1">{m.kode_mk}</span>
                                    </div>
                                </td>
                                <td className="p-6 font-bold text-slate-500">{m.sks} SKS</td>
                                <td className="p-6 text-center">
                                    <button onClick={() => handleDeleteMk(m.id)} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-100">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => setCurrentTab('dashboard')} className="group flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-all">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <FaArrowLeft />
                    </div> Kembali
                </button>
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    <button onClick={() => setActiveSubTab('jadwal')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider ${activeSubTab === 'jadwal' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Manajemen Jadwal</button>
                    <button onClick={() => setActiveSubTab('matakuliah')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider ${activeSubTab === 'matakuliah' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Daftar Mata Kuliah</button>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>

                {activeSubTab === 'jadwal' && (
                    <>
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 relative z-10">
                            <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl gap-1">
                                {hariList.map(h => (
                                    <button key={h} onClick={() => setActiveHari(h)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider ${activeHari === h ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>{h}</button>
                                ))}
                            </div>
                            <button onClick={() => {
                                fetchMk(); // Ensure mk list is loaded for dropdown
                                setIsAddJadwalModalOpen(true);
                            }} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 hover:shadow-lg transition-all flex items-center gap-2">
                                <FaPlus /> Tambah Jadwal
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                            {renderJadwalGrid()}
                        </div>
                    </>
                )}

                {activeSubTab === 'matakuliah' && (
                    <>
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <h3 className="text-xl font-black text-slate-800 uppercase italic underline decoration-indigo-500 decoration-4">Direktori Mata Kuliah</h3>
                            <button onClick={handleOpenAddMk} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 hover:shadow-lg transition-all flex items-center gap-2">
                                <FaPlus /> Tambah Mata Kuliah
                            </button>
                        </div>
                        <div className="relative z-10">
                            {renderMkList()}
                        </div>
                    </>
                )}
            </div>

            {/* Modal Tambah MK */}
            {isAddMkModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
                    <form onSubmit={handleAddMk} className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-white">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                                <FaBook className="text-2xl" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tighter">Mata Kuliah Baru</h3>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div>
                                <div className="flex justify-between items-center mb-1 ml-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kode MK</p>
                                    <button type="button" onClick={() => setNewMk({...newMk, kode_mk: suggestNextKodeMk()})} className="text-[9px] font-black text-indigo-500 uppercase hover:underline">Auto-Fill</button>
                                </div>
                                <input required type="text" value={newMk.kode_mk} onChange={e => setNewMk({...newMk, kode_mk: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none text-sm uppercase" placeholder="Misal: MK001" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Nama Mata Kuliah</p>
                                <input required type="text" value={newMk.nama_mk} onChange={e => setNewMk({...newMk, nama_mk: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none text-sm" placeholder="Contoh: Pemrograman Web" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Jumlah SKS</p>
                                <input required type="number" value={newMk.sks} onChange={e => setNewMk({...newMk, sks: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none text-sm" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => setIsAddMkModalOpen(false)} disabled={isSubmitting} className="py-5 bg-slate-200 text-slate-600 font-extrabold rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-300 transition-colors">Batal</button>
                            <button type="submit" disabled={isSubmitting} className="py-5 bg-indigo-600 text-white font-extrabold rounded-2xl uppercase text-[10px] tracking-widest hover:shadow-lg transition-all">Simpan</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Tambah/Edit Jadwal */}
            {isAddJadwalModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
                    <form onSubmit={handleSaveJadwal} className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-white max-h-[90vh] overflow-y-auto custom-scroll">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                                <FaClock className="text-2xl" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tighter">
                                {editingJadwal ? 'Edit Jadwal' : 'Jadwal Baru'}
                            </h3>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Mata Kuliah</p>
                                <select required value={newJadwal.id_matakuliah} onChange={e => setNewJadwal({...newJadwal, id_matakuliah: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-sm">
                                    <option value="">-- Pilih Mata Kuliah --</option>
                                    {mkList.map(mk => <option key={mk.id} value={mk.id}>{mk.nama_mk}</option>)}
                                </select>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Dosen Pengampu</p>
                                <select required value={newJadwal.id_dosen} onChange={e => setNewJadwal({...newJadwal, id_dosen: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-sm">
                                    <option value="">-- Pilih Dosen --</option>
                                    {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama_lengkap}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Hari</p>
                                    <select value={newJadwal.hari} onChange={e => setNewJadwal({...newJadwal, hari: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-sm">
                                        {hariList.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Jam Mulai</p>
                                    <input required type="time" value={newJadwal.jam_mulai} onChange={e => setNewJadwal({...newJadwal, jam_mulai: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-sm" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Jam Selesai</p>
                                    <input required type="time" value={newJadwal.jam_selesai} onChange={e => setNewJadwal({...newJadwal, jam_selesai: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-sm" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Ruangan</p>
                                <input required type="text" value={newJadwal.ruangan} onChange={e => setNewJadwal({...newJadwal, ruangan: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-sm" placeholder="Contoh: D301" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => { setIsAddJadwalModalOpen(false); setEditingJadwal(null); setNewJadwal({ id_matakuliah: '', id_dosen: '', hari: 'Senin', jam_mulai: '08:00', jam_selesai: '10:30', ruangan: '' }); }} disabled={isSubmitting} className="py-5 bg-slate-200 text-slate-600 font-extrabold rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-300">Batal</button>
                            <button type="submit" disabled={isSubmitting} className="py-5 bg-indigo-600 text-white font-extrabold rounded-2xl uppercase text-[10px] tracking-widest hover:shadow-lg">Simpan</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
