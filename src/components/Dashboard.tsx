"use client";
import { JSX, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { TimetableCell } from "./TimetableCell";
import { AttendancePage } from "./AttendancePage";
import type { Session } from '@supabase/supabase-js';

export type Course = { course_code: string; alias: string; name: string; category: string; term: string; nature: string; slot: string; teacher: string; credits: number; };
export type TimetableEntry = { id: string; day: string; time_slot: string; course_code: string; };
export type AttendanceEntry = { id: string; user_id: string; course_code: string; date: string; status: "Present" | "Absent" | "Cancelled" | "Postponed"; };

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function Dashboard({ session }: { session: Session }): JSX.Element {
  const [courses, setCourses] = useState<Course[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [view, setView] = useState<"timetable" | "attendance">("timetable");
  const [loading, setLoading] = useState(true);
  const user = session.user;

  const fetchData = async () => {
    const { data: cData, error: cErr } = await supabase.from('courses').select('*');
    const { data: tData, error: tErr } = await supabase.from('timetable').select('*');
    const { data: aData, error: aErr } = await supabase.from('attendance').select('*').eq('user_id', user.id).order('date', { ascending: false });
    if (cErr || tErr || aErr) console.error("Error fetching data", { cErr, tErr, aErr });
    setCourses(cData || []); setTimetable(tData || []); setAttendance(aData || []); setLoading(false);
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleSignOut = async () => await supabase.auth.signOut();
  const getCourseDetails = (code: string) => courses.find(c => c.course_code === code);

  const timeSlots = [...new Set(timetable.map(e => e.time_slot))].sort((a, b) => {
    const toMins = (s: string) => { const [t] = s.split('-'); let [h, m] = t.slice(0, -2).split(':').map(Number); if (t.slice(-2) === 'pm' && h !== 12) h += 12; if (t.slice(-2) === 'am' && h === 12) h = 0; return h * 60 + (m || 0); };
    return toMins(a) - toMins(b);
  });
  
  const timetableGrid = timeSlots.reduce<Record<string, Record<string, TimetableEntry | null>>>((acc, ts) => {
    acc[ts] = daysOfWeek.reduce<Record<string, TimetableEntry | null>>((dAcc, day) => { dAcc[day] = timetable.find(t => t.time_slot === ts && t.day === day) || null; return dAcc; }, {}); return acc;
  }, {});

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-slate-50"><div className="w-12 h-12 border-4 border-t-sky-600 border-slate-200 rounded-full animate-spin"></div><p className="mt-4 text-lg font-medium text-slate-600">Loading Dashboard...</p></div>
  );

  if (view === 'attendance') return <AttendancePage courses={courses} attendance={attendance} onBack={() => setView('timetable')} />;

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-50"><header className="flex-shrink-0 bg-white border-b border-slate-200"><div className="flex items-center justify-between px-4 py-3 mx-auto max-w-screen-2xl sm:px-6 lg:px-8"><h1 className="text-xl font-bold tracking-tight text-slate-800">Attendance Tracker</h1><div className="flex items-center gap-4"><span className="hidden text-sm text-slate-500 sm:block">Welcome, {user.email?.split('@')[0]}</span><button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 transition-colors bg-slate-100 rounded-lg hover:bg-slate-200"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>Sign Out</button></div></div></header><main className="flex-1 p-4 overflow-auto sm:p-6 lg:p-8"><div className="mx-auto max-w-screen-2xl"><div className="overflow-hidden border rounded-lg shadow-sm border-slate-200"><table className="w-full text-sm text-left text-slate-500 table-fixed"><thead className="text-xs tracking-wider text-slate-700 uppercase bg-slate-50"><tr className="divide-x divide-slate-200"><th scope="col" className="sticky left-0 z-10 w-28 px-6 py-3 bg-slate-50">Time</th>{daysOfWeek.map(day => <th scope="col" className="px-6 py-3" key={day}>{day}</th>)}</tr></thead><tbody className="divide-y divide-slate-200">{timeSlots.map(timeSlot => (<tr key={timeSlot} className="divide-x divide-slate-200"><th scope="row" className="sticky left-0 z-10 w-28 px-6 py-4 font-medium text-center text-slate-900 bg-white">{timeSlot}</th>{daysOfWeek.map(day => { const entry = timetableGrid[timeSlot]?.[day]; const course = entry ? getCourseDetails(entry.course_code) : undefined; return <TimetableCell key={`${day}-${timeSlot}`} entry={entry} course={course} onAttendanceMarked={fetchData} userId={user.id} />; })}</tr>))}</tbody></table></div></div></main><footer className="flex-shrink-0 p-4 bg-white/50 backdrop-blur-sm border-t border-slate-200"><div className="flex justify-center"><button onClick={() => setView('attendance')} className="px-6 py-3 font-semibold text-white transition-transform bg-sky-600 rounded-lg shadow-md hover:bg-sky-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">View My Attendance Records</button></div></footer></div>
  );
}