'use client';
import { useState, useEffect } from 'react';
import { IoCheckmarkCircle, IoCloseCircle, IoTimeOutline, IoEyeOutline, IoImageOutline } from 'react-icons/io5';
import { supabase } from '../../../../lib/supabase';

interface IzinRequest {
  id: string;
  created_at: string;
  kategori: string;
  alasan: string;
  bukti_url: string;
  status: 'pending' | 'approved' | 'rejected';
  mahasiswa: {
    nama_lengkap: string;
    nim: string;
  };
  jadwal: {
    matakuliah: {
      nama_mk: string;
    };
  };
}

export default function IzinTab({ dosenId }: { dosenId: string }) {
  const [requests, setRequests] = useState<IzinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [dosenId]);

  const fetchRequests = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('permohonan_izin')
      .select(`
        *,
        mahasiswa(nama_lengkap, nim),
        jadwal!inner(
          id_dosen,
          matakuliah(nama_mk)
        )
      `)
      .eq('jadwal.id_dosen', dosenId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetch permohonan izin:', error);
    } else {
      setRequests(data as any);
    }
    setIsLoading(false);
  };

  const handleResponse = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('permohonan_izin')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
      
      // Jika Approved, Anda bisa menambahkan logika otomatis mengisi tabel 'absensi' di sini.
      // Namun untuk sementara kita fokus pada status permohonannya.

    } catch (error) {
      console.error('Error update status izin:', error);
      alert('Gagal memperbarui status.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <i className="fas fa-circle-notch animate-spin text-indigo-500 text-2xl"></i>
        <p className="text-slate-400 text-xs font-bold mt-4 uppercase tracking-widest">Memuat Permohonan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoTimeOutline size={32} />
            </div>
            <h3 className="font-bold text-slate-800">BELUM ADA PERMOHONAN</h3>
            <p className="text-xs text-slate-400 mt-1">Semua permohonan izin mahasiswa akan muncul di sini.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  req.kategori === 'Sakit' ? 'bg-rose-50 text-rose-500' : 
                  req.kategori === 'Tugas' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'
                }`}>
                  <IoImageOutline size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-800">{req.mahasiswa.nama_lengkap}</h4>
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">{req.mahasiswa.nim}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mb-2">
                    {req.jadwal.matakuliah.nama_mk} • <span className="font-bold text-indigo-600">{req.kategori}</span>
                  </p>
                  <p className="text-sm text-slate-700 italic">"{req.alasan}"</p>
                  <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Diajukan: {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* View Proof Button */}
                <button 
                  onClick={() => setSelectedImage(req.bukti_url)}
                  className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all flex items-center gap-2 text-xs font-bold"
                  title="Lihat Bukti"
                >
                  <IoEyeOutline size={18} />
                  BUKTI
                </button>

                {req.status === 'pending' ? (
                  <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
                    <button 
                      onClick={() => handleResponse(req.id, 'rejected')}
                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                      title="Tolak"
                    >
                      <IoCloseCircle size={24} />
                    </button>
                    <button 
                      onClick={() => handleResponse(req.id, 'approved')}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100"
                    >
                      SETUJUI
                    </button>
                  </div>
                ) : (
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {req.status === 'approved' ? 'DISETUJUI' : 'DITOLAK'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-8 bg-slate-900/80 backdrop-blur-md" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full max-h-full flex items-center justify-center">
            <img src={selectedImage} alt="Bukti Izin" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in duration-300" />
            <button className="absolute -top-12 right-0 text-white hover:text-rose-400 transition-colors">
              <IoCloseCircle size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
