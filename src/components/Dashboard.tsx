// app/components/Dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { TimetableCell } from "./TimetableCell";
import { AttendancePage } from "./AttendancePage";
import type { Session } from '@supabase/supabase-js';

// --- Types are correct and do not need changes ---
type Course = {
  course_code: string;
  alias: string | null;
  name: string;
  category: string;
  term: string;
  nature: string;
  slot: string;
  teacher: string;
  credits: number;
};
type TimetableEntry = {
  id: string;
  day: string;
  time_slot: string;
  course_code: string;
};
type AttendanceEntry = {
  id: string;
  user_id: string;
  course_code: string;
  date: string;
  status: "Present" | "Absent" | "Cancelled" | "Postponed";
};

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function Dashboard({ session }: { session: Session }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [view, setView] = useState<"timetable" | "attendance">("timetable");
  const [loading, setLoading] = useState(true);

  const user = session.user;

  const fetchData = async () => {
    setLoading(true);
    const { data: courseData } = await supabase.from('courses').select('*');
    const { data: timetableData } = await supabase.from('timetable').select('*');
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    setCourses(courseData as Course[] || []);
    setTimetable(timetableData || []);
    setAttendance(attendanceData || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const getCourseDetails = (code: string) => courses.find(c => c.course_code === code);

  // --- THE DEFINITIVE FIX IS HERE ---
  // We define a fixed, hardcoded array of all possible time slots in the exact order you want.
  // This is the single source of truth for the timetable's structure.
  const timeSlots = [
    "8:00-8:50am",
    "9:00-9:50am",
    "10:00-10:50am",
    "11:00-11:50am",
    "12:00-12:50pm",
    "1:00-1:50pm", // This slot will appear as an empty row, as requested.
    "2:00-3:00pm",
    "3:00-4:00pm", // This slot will also appear, empty if no classes.
    "4:00-5:00pm",
    "5:00-5:50pm"
  ];
  // --- END OF FIX ---

  // The grid creation logic now uses the fixed `timeSlots` array.
  // It no longer depends on the unpredictable order of fetched data.
  const timetableGrid = timeSlots.reduce<Record<string, Record<string, TimetableEntry | null>>>((acc, timeSlot) => {
    acc[timeSlot] = daysOfWeek.reduce<Record<string, TimetableEntry | null>>((dayAcc, day) => {
      // For each cell in our fixed grid, we LOOK for a matching class.
      dayAcc[day] = timetable.find(t => t.time_slot === timeSlot && t.day === day) || null;
      return dayAcc;
    }, {});
    return acc;
  }, {});

  if (loading) {
    return <div>Loading...</div>;
  }

  if (view === 'attendance') {
    return <AttendancePage courses={courses} attendance={attendance} onBack={() => setView('timetable')} />;
  }

  return (
    <div className="page-container">
      <button onClick={handleSignOut} className="logout-button">
        Sign Out
      </button>

      <h1>Timetable - 3rd Sem</h1>
      <div className="timetable-wrapper">
        <table className="timetable-grid">
          <thead>
            <tr>
              <th className="sticky-col">Time</th>
              {daysOfWeek.map(day => <th key={day}>{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {/* We now map over our perfectly ordered `timeSlots` array */}
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot}>
                <td className="time-slot-label sticky-col">{timeSlot}</td>
                {daysOfWeek.map(day => {
                  const entry = timetableGrid[timeSlot]?.[day];
                  const course = entry ? getCourseDetails(entry.course_code) : undefined;
                  return (
                    <TimetableCell
                      key={`${day}-${timeSlot}`}
                      entry={entry}
                      course={course}
                      onAttendanceMarked={fetchData}
                      userId={user.id}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="actions-footer">
        <button 
          onClick={() => setView('attendance')}
          className="footer-btn"
        >
          View Attendance Records
        </button>
      </div>
    </div>
  );
}