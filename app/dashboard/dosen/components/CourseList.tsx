import React from 'react';
import { FaLayerGroup, FaHistory, FaClock, FaMapMarkerAlt, FaCalendarDay } from "react-icons/fa";

export interface Course {
  id: number;
  name: string;
  class: string;
  sks: number;
  room: string;
  time: string;
  day: string;
  cap: number;
  isToday?: boolean;
}

interface CourseListProps {
  courses: Course[];
  onHistoryClick: (course: Course) => void;
  onLaunchClick: (course: Course) => void;
  onDelayClick: (course: Course) => void;
}

export default function CourseList({ courses, onHistoryClick, onLaunchClick, onDelayClick }: CourseListProps) {
  return (
    <div className="grid grid-cols-1 gap-5">
        {courses.map(course => (
            <div key={course.id} className="glass rounded-[2.5rem] p-8 flex flex-wrap justify-between items-center group hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-500 border-l-8 border-l-transparent hover:border-l-indigo-500">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 text-xl font-black group-hover:scale-110 transition-transform">
                        <FaLayerGroup />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-extrabold text-slate-800 uppercase text-lg tracking-tighter">{course.name}</h4>
                            <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded tracking-widest uppercase">{course.sks} SKS</span>
                        </div>
                        <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><FaCalendarDay className="text-indigo-400" /> {course.day}</span>
                            <span className="flex items-center gap-1"><FaClock className="text-indigo-400" /> {course.time}</span>
                            <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-indigo-400" /> {course.room}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <button onClick={() => onHistoryClick(course)} className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-500 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm" title="History">
                        <FaHistory className="text-sm" />
                    </button>
                    <button onClick={() => onDelayClick(course)} className="px-6 py-3 bg-amber-50 text-amber-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-colors">
                        Tunda
                    </button>
                    {course.isToday && (
                        <button onClick={() => onLaunchClick(course)} className="px-8 py-3 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:-translate-y-0.5 hover:shadow-lg transition-transform">
                            Buka Sesi
                        </button>
                    )}
                </div>
            </div>
        ))}
    </div>
  );
}
