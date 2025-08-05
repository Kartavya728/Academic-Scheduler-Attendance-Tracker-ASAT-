// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { TimetableCell } from '../components/TimetableCell';
import { AttendancePage } from '../components/AttendancePage';

// --- Define Types ---
type Course = { code: string; full_name: string; location: string };
type TimetableEntry = { id: string; day: string; time_slot: string; course_code: string };
type AttendanceEntry = { id: string; course_code: string; date: string; status: 'Present' | 'Absent' | 'Cancelled' };

// Define the order of days for the timetable grid
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [view, setView] = useState<'timetable' | 'attendance'>('timetable');
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch all necessary data
  const fetchData = async () => {
    setIsLoading(true);
    const [courseRes, timetableRes, attendanceRes] = await Promise.all([
      supabase.from('courses').select('*'),
      supabase.from('timetable').select('*'),
      supabase.from('attendance').select('*'),
    ]);
    
    setCourses(courseRes.data || []);
    setTimetable(timetableRes.data || []);
    setAttendance(attendanceRes.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCourseDetails = (code: string) => courses.find(c => c.code === code);

  // --- Data Transformation for the Grid ---
  // Get a sorted, unique list of time slots
  const timeSlots = [...new Set(timetable.map(entry => entry.time_slot))].sort((a,b) => parseInt(a) - parseInt(b));

  const timetableGrid = timeSlots.reduce((acc, timeSlot) => {
    acc[timeSlot] = daysOfWeek.reduce((dayAcc, day) => {
      dayAcc[day] = timetable.find(t => t.time_slot === timeSlot && t.day === day) || null;
      return dayAcc;
    }, {} as Record<string, TimetableEntry | null>);
    return acc;
  }, {} as Record<string, Record<string, TimetableEntry | null>>);


  if (isLoading) {
    return <div className="loading-screen">Loading Timetable...</div>;
  }
  
  // Render the Attendance Page component when view is 'attendance'
  if (view === 'attendance') {
    return <AttendancePage courses={courses} attendance={attendance} onBack={() => setView('timetable')} />;
  }

  // Render the Timetable
  return (
    <div className="page-container">
      <h1 className="page-title">Timetable - 3rd Sem</h1>
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
                      onAttendanceMarked={fetchData} // Pass the refresh function
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="actions-footer">
        <button onClick={() => setView('attendance')} className="footer-btn">
          View Attendance Records
        </button>
      </div>
    </div>
  );
}