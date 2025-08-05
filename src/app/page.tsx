// HomePage.tsx (Updated)
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { TimetableCell } from "../components/TimetableCell"; // Import the new component
import { AttendancePage } from "../components/AttendancePage"; // We will create this next

// --- Updated Types ---
type Course = { code: string; full_name: string; location: string; };
type TimetableEntry = { id: string; day: string; time_slot: string; course_code: string; };
type AttendanceEntry = { id: string; course_code: string; date: string; status: "Present" | "Absent" | "Cancelled"; };

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [view, setView] = useState<"timetable" | "attendance">("timetable");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: courseData } = await supabase.from('courses').select('*');
    const { data: timetableData } = await supabase.from('timetable').select('*');
    const { data: attendanceData } = await supabase.from('attendance').select('*').order('date', { ascending: false });

    setCourses(courseData || []);
    setTimetable(timetableData || []);
    setAttendance(attendanceData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCourseDetails = (code: string) => courses.find(c => c.code === code);

  // --- Data transformation for the grid ---
  const timeSlots = [...new Set(timetable.map(entry => entry.time_slot))].sort();
  const timetableGrid = timeSlots.reduce<Record<string, Record<string, TimetableEntry | null>>>((acc, timeSlot) => {
    acc[timeSlot] = daysOfWeek.reduce<Record<string, TimetableEntry | null>>((dayAcc, day) => {
      dayAcc[day] = timetable.find(t => t.time_slot === timeSlot && t.day === day) || null;
      return dayAcc;
    }, {});
    return acc;
  }, {});

  if (loading) {
    return <div>Loading...</div>;
  }

  // --- Render Attendance Page ---
  if (view === 'attendance') {
    return <AttendancePage courses={courses} attendance={attendance} onBack={() => setView('timetable')} />;
  }

  // --- Render Timetable Page ---
  return (
    <div className="page-container">
      <h1>Timetable - 3rd Sem</h1>
      <div className="timetable-wrapper">
        <table className="timetable-grid">
          <thead>
            <tr>
              <th>Time</th>
              {daysOfWeek.map(day => <th key={day}>{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot}>
                <td className="time-slot-label">{timeSlot}</td>
                {daysOfWeek.map(day => {
                  const entry = timetableGrid[timeSlot]?.[day];
                  const course = entry ? getCourseDetails(entry.course_code) : undefined;
                  return (
                    <TimetableCell
                      key={`${day}-${timeSlot}`}
                      entry={entry}
                      course={course}
                      onAttendanceMarked={fetchData} // Refresh all data on update
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="actions-footer">
        <button onClick={() => setView('attendance')}>View Attendance Records</button>
      </div>
    </div>
  );
}