'use client';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FaTimes, FaCamera } from 'react-icons/fa';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const qrRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let html5QrCode: Html5Qrcode;
    let isScanning = false;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("qr-reader-element");
        qrRef.current = html5QrCode;
        
        // Cek permission kamera
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          setHasPermission(true);
          
          await html5QrCode.start(
            { facingMode: "environment" }, // Pakai kamera belakang jika di HP
            {
              fps: 10,
              qrbox: { width: 200, height: 200 },
            },
            (decodedText) => {
              // Jika berhasil scan
              if (isScanning) return; // Prevent multiple scans
              isScanning = true;
              
              // Kasih suara "beep" (opsional, browser sering memblokir audio tanpa interaksi user)
              try {
                const audio = new Audio('/beep.mp3'); // Pastikan file beep ada kalau mau pakai
                audio.play().catch(() => {});
              } catch (e) {}

              html5QrCode.stop().then(() => {
                onScan(decodedText);
              }).catch(err => console.error(err));
            },
            (errorMessage) => {
              // Abaikan error saat proses scan berjalan (misal QR tidak fokus)
            }
          );
        } else {
          setError("Kamera tidak ditemukan di perangkat ini.");
        }
      } catch (err) {
        console.error("Error starting scanner:", err);
        setError("Gagal mengakses kamera. Pastikan izin kamera sudah diberikan (Allow).");
      }
    };

    startScanner();

    // Cleanup saat modal ditutup
    return () => {
      if (qrRef.current && qrRef.current.isScanning) {
        qrRef.current.stop().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[500] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex justify-between items-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <FaCamera className="text-sm" />
            </div>
            <h3 className="font-extrabold uppercase tracking-widest text-xs">Scan Presensi</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors relative z-10">
            <FaTimes />
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-6 bg-slate-50 relative flex flex-col items-center">
          
          {error ? (
            <div className="text-center py-10 w-full">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <p className="text-xs font-bold text-slate-600 px-4">{error}</p>
              <button 
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-slate-200 text-slate-600 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-slate-300"
              >
                Tutup
              </button>
            </div>
          ) : (
            <>
              {/* Kotak Scanner */}
              <div className="relative w-full max-w-[250px] mx-auto aspect-square rounded-[2rem] overflow-hidden shadow-inner border-4 border-slate-200 bg-black">
                <div id="qr-reader-element" className="w-full h-full object-cover [&>video]:object-cover [&>video]:w-full [&>video]:h-full"></div>
                
                {/* Efek Garis Scan */}
                {!hasPermission ? (
                  <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center text-white/50 z-20">
                    <i className="fas fa-circle-notch animate-spin text-2xl mb-2"></i>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Memuat Kamera...</p>
                  </div>
                ) : (
                  <>
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] animate-[scan_2s_ease-in-out_infinite] z-20"></div>
                    {/* Bounding box UI */}
                    <div className="absolute inset-0 border-[40px] border-black/40 z-10 pointer-events-none rounded-xl"></div>
                  </>
                )}
              </div>

              <div className="mt-8 text-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100 w-full">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                  <i className="fas fa-info-circle"></i> Instruksi
                </p>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  Arahkan kotak kamera ke <strong className="text-indigo-600">layar dosen</strong>. Sistem akan otomatis mendeteksi QR Code jadwal.
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
