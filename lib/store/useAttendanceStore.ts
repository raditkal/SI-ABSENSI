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
    // Menambahkan attendee baru ke daftar tanpa fetch ulang (optimistic/instant)
    set((state) => ({
      recentAttendees: [newAttendee, ...state.recentAttendees],
      attendanceCount: state.attendanceCount + 1
    }));
  },

  reset: () => {
    set({ recentAttendees: [], attendanceCount: 0 });
  }
}));
