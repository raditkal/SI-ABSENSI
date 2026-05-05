import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaEdit, FaCheckCircle, FaSearch, FaPlus, FaTimes } from "react-icons/fa";
import { supabase } from '../../../../lib/supabase';

interface KoreksiTabProps {
    setCurrentTab: (tab: string) => void;
}

export default function KoreksiTab({ setCurrentTab }: KoreksiTabProps) {
    const [jadwalList, setJadwalList] = useState<any[]>([]);
    const [selectedJadwal, setSelectedJadwal] = useState<string>('');
    const [absensiList, setAbsensiList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    // Untuk tambah manual
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [allMahasiswa, setAllMahasiswa] = useState<any[]>([]);
    const [searchMhs, setSearchMhs] = useState('');
    const [selectedMhs, setSelectedMhs] = useState<string>('');
    const [manualStatus, setManualStatus] = useState('Hadir');
    const [pertemuanKe, setPertemuanKe] = useState(1);

    useEffect(() => {
        const initData = async () => {
            setIsLoading(true);
            const { data: jadwal } = await supabase.from('jadwal').select('id, hari, matakuliah(nama_mk), dosen(nama_lengkap)');
            if (jadwal) setJadwalList(jadwal);

            const { data: mhs } = await supabase.from('mahasiswa').select('id, nama_lengkap, nim');
            if (mhs) setAllMahasiswa(mhs);

            setIsLoading(false);
        };
        initData();
    }, []);

    useEffect(() => {
        if (selectedJadwal) fetchAbsensi();
    }, [selectedJadwal]);

    const fetchAbsensi = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('absensi')
            .select(`
                id, status, waktu_absen, pertemuan_ke,
                mahasiswa (id, nama_lengkap, nim, kelas)
            `)
            .eq('id_jadwal', selectedJadwal)
            .order('waktu_absen', { ascending: false });
        if (data) setAbsensiList(data);
        setIsLoading(false);
    };

    const updateStatus = async (absensiId: string, newStatus: string) => {
        setSavingId(absensiId);
        const { error } = await supabase.from('absensi').update({ status: newStatus }).eq('id', absensiId);
        setSavingId(null);
        if (!error) {
            setAbsensiList(prev => prev.map(a => a.id === absensiId ? { ...a, status: newStatus } : a));
            alert('Status presensi berhasil diperbarui!');
        } else {
            alert('Gagal update: ' + error.message);
        }
    };

    const handleAddManual = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMhs || !selectedJadwal) return alert("Pilih mahasiswa dan jadwal terlebih dahulu!");

        setIsLoading(true);
        const { error } = await supabase.from('absensi').insert([{
            id_mahasiswa: selectedMhs,
            id_jadwal: selectedJadwal,
            status: manualStatus,
            pertemuan_ke: pertemuanKe,
            waktu_absen: new Date().toISOString()
        }]);
        setIsLoading(false);

        if (error) {
            alert('Gagal menambah data: ' + error.message);
        } else {
            alert('Data presensi manual berhasil ditambahkan!');
            setIsAddModalOpen(false);
            setSearchMhs('');
            setSelectedMhs('');
            fetchAbsensi();
        }
    };

    const filteredMhs = allMahasiswa.filter(m =>
        m.nama_lengkap.toLowerCase().includes(searchMhs.toLowerCase()) ||
        m.nim.includes(searchMhs)
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setCurrentTab('dashboard')} className="group mb-8 flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-all">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <FaArrowLeft />
                </div> Kembali
            </button>

            <div className="bg-white rounded-3xl lg:rounded-[3rem] p-6 lg:p-10 shadow-sm border border-slate-100 mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase italic">Koreksi Log Presensi</h3>
                        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Pilih Jadwal Kuliah untuk melihat & mengedit kehadiran</p>
                    </div>
                    <div className="w-full lg:w-1/3">
                        <select
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700"
                            value={selectedJadwal}
                            onChange={(e) => setSelectedJadwal(e.target.value)}
                        >
                            <option value="">-- Pilih Jadwal Mata Kuliah --</option>
                            {jadwalList.map(j => (
                                <option key={j.id} value={j.id}>
                                    {j.hari} - {j.matakuliah?.nama_mk} ({j.dosen?.nama_lengkap})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedJadwal && (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-sm font-black text-slate-600 uppercase tracking-widest">Daftar Kehadiran Terekam</h4>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
                            >
                                <FaPlus /> Tambah Manual
                            </button>
                        </div>

                        {isLoading && absensiList.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 font-bold"><i className="fas fa-circle-notch animate-spin text-2xl mb-3 block"></i>Memuat data...</div>
                        ) : absensiList.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-3xl border border-slate-100 text-slate-400 font-bold text-sm">Belum ada data presensi terekam di jadwal ini.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">
                                        <tr>
                                            <th className="p-5 rounded-tl-2xl">Mahasiswa</th>
                                            <th className="p-5">Kelas</th>
                                            <th className="p-5">Waktu</th>
                                            <th className="p-5">Pertemuan Ke</th>
                                            <th className="p-5 rounded-tr-2xl">Aksi Koreksi (Ubah Status)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {absensiList.map((absensi) => (
                                            <tr key={absensi.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-5">
                                                    <div className="font-black text-slate-800 uppercase text-sm">{absensi.mahasiswa?.nama_lengkap}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">{absensi.mahasiswa?.nim}</div>
                                                </td>
                                                <td className="p-5">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                        {absensi.mahasiswa?.kelas || '-'}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-xs font-bold text-slate-500">
                                                    {new Date(absensi.waktu_absen).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                                <td className="p-5 text-sm font-black text-indigo-500">{absensi.pertemuan_ke}</td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            className={`p-2 rounded-xl text-xs font-bold border-2 transition-all outline-none ${absensi.status === 'Hadir' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                                                                    absensi.status === 'Izin' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                                                                        'border-rose-200 bg-rose-50 text-rose-700'
                                                                }`}
                                                            value={absensi.status}
                                                            onChange={(e) => updateStatus(absensi.id, e.target.value)}
                                                            disabled={savingId === absensi.id}
                                                        >
                                                            <option value="Hadir">HADIR</option>
                                                            <option value="Izin">IZIN</option>
                                                            <option value="Alpa">ALPA</option>
                                                        </select>
                                                        {savingId === absensi.id && <i className="fas fa-circle-notch animate-spin text-indigo-500"></i>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Tambah Manual */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
                    <form onSubmit={handleAddManual} className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-white relative">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full flex items-center justify-center transition-all">
                            <FaTimes />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                                <FaEdit className="text-indigo-500" /> Input Presensi Manual
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Digunakan jika sistem error / ada izin resmi</p>
                        </div>

                        <div className="space-y-6 mb-8">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Cari Mahasiswa</p>
                                <div className="relative">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchMhs}
                                        onChange={e => setSearchMhs(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none text-sm"
                                        placeholder="Ketik Nama atau NIM..."
                                    />
                                </div>

                                {searchMhs && !selectedMhs && (
                                    <div className="mt-2 max-h-40 overflow-y-auto bg-slate-50 border border-slate-100 rounded-2xl p-2 shadow-inner">
                                        {filteredMhs.slice(0, 5).map(m => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => { setSelectedMhs(m.id); setSearchMhs(m.nama_lengkap); }}
                                                className="w-full text-left px-4 py-2 hover:bg-white rounded-xl transition-all font-bold text-xs text-slate-600 uppercase flex justify-between"
                                            >
                                                <span>{m.nama_lengkap}</span>
                                                <span className="text-[9px] text-indigo-400 tracking-widest">{m.nim}</span>
                                            </button>
                                        ))}
                                        {filteredMhs.length === 0 && <div className="text-center p-4 text-xs font-bold text-slate-400">Tidak ditemukan</div>}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Status</p>
                                    <select
                                        value={manualStatus}
                                        onChange={e => setManualStatus(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none text-sm"
                                    >
                                        <option value="Hadir">Hadir</option>
                                        <option value="Izin">Izin (Surat Resmi)</option>
                                        <option value="Alpa">Alpa</option>
                                    </select>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Pertemuan Ke</p>
                                    <input
                                        type="number"
                                        min="1"
                                        value={pertemuanKe}
                                        onChange={e => setPertemuanKe(Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !selectedMhs}
                            className="w-full py-5 bg-indigo-600 text-white font-extrabold rounded-2xl uppercase text-[10px] tracking-widest hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <i className="fas fa-circle-notch animate-spin"></i> : <><FaCheckCircle /> Simpan Data</>}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
