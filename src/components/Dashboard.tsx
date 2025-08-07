"use client";

import { useEffect, useState, useCallback } from "react"; // <-- useCallback is included
import { supabase } from "../../lib/supabaseClient";
import { TimetableCell } from "./TimetableCell";
import { AttendancePage } from "./AttendancePage";
import type { Session } from '@supabase/supabase-js';

// --- Type Definitions ---
// These match your database schema and are used throughout the component.
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
  // --- State Management ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [view, setView] = useState<"timetable" | "attendance">("timetable");
  const [loading, setLoading] = useState(true);

  const user = session.user;

  // --- Data Fetching Logic (Corrected with useCallback) ---
  const fetchData = useCallback(async () => {
    const { data: courseData } = await supabase.from('courses').select('*');
    const { data: timetableData } = await supabase.from('timetable').select('*');
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user.id) // Fetches only the current user's attendance
      .order('date', { ascending: false });

    setCourses(courseData as Course[] || []);
    setTimetable(timetableData || []);
    setAttendance(attendanceData || []);
    setLoading(false);
  }, [user.id]); // Dependency array for useCallback

  // --- useEffect Hook (Corrected with fetchData dependency) ---
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchData();
    }
  }, [user, fetchData]);

  // --- Helper Functions ---
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  const getCourseDetails = (code: string) => courses.find(c => c.course_code === code);

  // --- THE DEFINITIVE FIX for Time Slot Order and Empty Rows ---
  // This hardcoded array is the single source of truth for the timetable's structure.
  const timeSlots = [
    "8:00-8:50am",
    "9:00-9:50am",
    "10:00-10:50am",
    "11:00-11:50am",
    "12:00-12:50pm",
    "1:00-1:50pm",   // This will correctly render as an empty row
    "2:00-3:00pm",
    "3:00-4:00pm",   // This will correctly render as an empty row
    "4:00-5:00pm",
    "5:00-5:50pm"
  ];

  // --- Data Transformation Logic ---
  // This maps the fetched data onto our fixed timetable structure.
  const timetableGrid = timeSlots.reduce<Record<string, Record<string, TimetableEntry | null>>>((acc, timeSlot) => {
    acc[timeSlot] = daysOfWeek.reduce<Record<string, TimetableEntry | null>>((dayAcc, day) => {
      dayAcc[day] = timetable.find(t => t.time_slot === timeSlot && t.day === day) || null;
      return dayAcc;
    }, {});
    return acc;
  }, {});

  // --- Conditional Rendering ---
  if (loading) {
    return <div>Loading...</div>;
  }

  if (view === 'attendance') {
    return <AttendancePage courses={courses} attendance={attendance} onBack={() => setView('timetable')} />;
  }

  // --- Main Component Render ---
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
            {/* We map over our perfectly ordered `timeSlots` array */}
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
                      userId={user.id} // Pass the user ID down
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