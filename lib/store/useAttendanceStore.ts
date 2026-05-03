import { create } from 'zustand';
import { supabase } from '../supabase';

interface AttendanceState {
  recentAttendees: any[];
  attendanceCount: number;
  totalStudents: number;
  isLoading: boolean;
  
  // Actions
  fetchTotalStudents: () => Promise<void>;
  fetchAttendance: (courseId: string) => Promise<void>;
  subscribeToAttendance: (courseId: string) => () => void;
  addAttendee: (newAttendee: any) => void;
  reset: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  recentAttendees: [],
  attendanceCount: 0,
  totalStudents: 0,
  isLoading: false,

  fetchTotalStudents: async () => {
    const { count } = await supabase
      .from('mahasiswa')
      .select('*', { count: 'exact', head: true });
    set({ totalStudents: count || 0 });
  },

  fetchAttendance: async (courseId: string) => {
    if (!courseId) return;
    set({ isLoading: true });
    
    const { data, error } = await supabase
      .from('absensi')
      .select(`
        waktu_absen,
        mahasiswa (nim, nama_lengkap)
      `)
      .eq('id_jadwal', courseId)
      .order('waktu_absen', { ascending: false });

    if (!error && data) {
      set({ 
        recentAttendees: data, 
        attendanceCount: data.length,
        isLoading: false 
      });
    } else {
      set({ isLoading: false });
    }
  },

  addAttendee: (newAttendee: any) => {
    set((state) => ({
      recentAttendees: [newAttendee, ...state.recentAttendees],
      attendanceCount: state.attendanceCount + 1
    }));
  },

  subscribeToAttendance: (courseId: string) => {
    if (!courseId) return () => {};

    console.log(`[Store] Memulai Subscription untuk Jadwal: ${courseId}`);
    
    const channel = supabase
      .channel(`live-attendance-${courseId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'absensi' },
        async (payload: any) => {
          console.log("[Store] Event INSERT Terdeteksi:", payload.new);
          
          if (String(payload.new.id_jadwal) === String(courseId)) {
            // Beri jeda sedikit agar database selesai memproses JOIN dengan benar
            setTimeout(() => {
              console.log("[Store] Menarik ulang data absensi...");
              get().fetchAttendance(courseId);
            }, 500);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Store] Status Realtime (${courseId}):`, status);
      });

    return () => {
      console.log(`[Store] Menutup Subscription: ${courseId}`);
      supabase.removeChannel(channel);
    };
  },

  reset: () => {
    set({ recentAttendees: [], attendanceCount: 0 });
  }
}));
