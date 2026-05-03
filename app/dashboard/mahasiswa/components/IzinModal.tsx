'use client';
import { useState, useRef } from 'react';
import { IoClose, IoCloudUploadOutline, IoCheckmarkCircle, IoAlertCircle } from 'react-icons/io5';
import { supabase } from '../../../../lib/supabase';
import { compressImage } from '../../../../lib/image-utils';

interface IzinModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: any[];
  studentId: string;
}

export default function IzinModal({ isOpen, onClose, schedules, studentId }: IzinModalProps) {
  const [selectedJadwal, setSelectedJadwal] = useState('');
  const [kategori, setKategori] = useState('Izin');
  const [alasan, setAlasan] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJadwal || !alasan || !file) {
      setErrorMessage('Harap isi semua field dan unggah bukti.');
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      // 1. Kompres Gambar
      const compressedBlob = await compressImage(file, 1080, 0.6);
      
      // 2. Upload ke Supabase Storage
      const fileName = `${studentId}_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bukti-izin')
        .upload(fileName, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. Dapatkan Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('bukti-izin')
        .getPublicUrl(fileName);

      // 4. Simpan ke Tabel permohonan_izin
      const { error: dbError } = await supabase
        .from('permohonan_izin')
        .insert({
          id_mahasiswa: studentId,
          id_jadwal: selectedJadwal,
          kategori,
          alasan,
          bukti_url: publicUrl,
          status: 'pending'
        });

      if (dbError) throw dbError;

      setStatus('success');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting izin:', error);
      setErrorMessage(error.message || 'Terjadi kesalahan saat mengirim permohonan.');
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedJadwal('');
    setKategori('Izin');
    setAlasan('');
    setFile(null);
    setPreview(null);
    setStatus('idle');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Ajukan Perizinan</h2>
            <p className="text-indigo-100 text-xs mt-1">Lengkapi form di bawah untuk permohonan izin/sakit</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {status === 'success' ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                <IoCheckmarkCircle size={48} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Berhasil Terkirim!</h3>
                <p className="text-slate-500 text-sm">Permohonan Anda sedang menunggu verifikasi dosen.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Mata Kuliah */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Mata Kuliah</label>
                <select
                  value={selectedJadwal}
                  onChange={(e) => setSelectedJadwal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  required
                >
                  <option value="">Pilih Jadwal Kuliah</option>
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.matakuliah?.nama_mk} ({s.jam_mulai} - {s.jam_selesai})
                    </option>
                  ))}
                </select>
              </div>

              {/* Kategori */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Kategori</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Sakit', 'Izin'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setKategori(item)}
                      className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        kategori === item 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alasan */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Alasan</label>
                <textarea
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  placeholder="Berikan alasan singkat (Contoh: Sedang demam tinggi)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px] text-slate-700 placeholder:text-slate-500"
                  required
                />
              </div>

              {/* Upload Bukti */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Unggah Bukti (Foto/Scan)</label>
                {!preview ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors mb-3">
                      <IoCloudUploadOutline size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-600">Klik untuk upload</p>
                    <p className="text-[10px] text-slate-400 mt-1">Format JPG/PNG (Maks 5MB)</p>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => { setFile(null); setPreview(null); }}
                        className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold transition-all"
                      >
                        Ganti Foto
                      </button>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 animate-shake">
                  <IoAlertCircle size={20} />
                  <p className="text-xs font-bold">{errorMessage}</p>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-circle-notch animate-spin"></i>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Permohonan</span>
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
