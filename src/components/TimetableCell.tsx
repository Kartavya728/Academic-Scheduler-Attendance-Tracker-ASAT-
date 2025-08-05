// app/components/TimetableCell.tsx
'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Make sure this path is correct

// Types (can be moved to a types.ts file for larger projects)
type Course = { code: string; full_name: string; location: string };
type TimetableEntry = { course_code: string };
type AttendanceStatus = 'Present' | 'Absent' | 'Cancelled';

interface TimetableCellProps {
  entry: TimetableEntry | null;
  course: Course | undefined;
  onAttendanceMarked: () => void; // Callback to refresh data
}

// Helper to add/subtract days from a YYYY-MM-DD string
const modifyDate = (dateStr: string, days: number) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export function TimetableCell({ entry, course, onAttendanceMarked }: TimetableCellProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  if (!entry || !course) {
    return <td className="timetable-cell empty"></td>;
  }

  const handleCellClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    } else {
      // Only close if we are not in the middle of marking attendance
      setIsExpanded(false);
      setIsMarking(false);
    }
  };

  const handleShowMarking = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the cell from closing
    setIsMarking(true);
  };
  
  const handleMarkAttendance = async (e: React.MouseEvent, status: AttendanceStatus) => {
    e.stopPropagation(); // Prevent click from bubbling up
    const { error } = await supabase.from('attendance').insert([
      { course_code: entry.course_code, date: attendanceDate, status },
    ]);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert(`Attendance marked as ${status} for ${course.code}`);
      // Reset state and notify parent
      setIsExpanded(false);
      setIsMarking(false);
      onAttendanceMarked();
    }
  };
  
  // Stop propagation on date controls to prevent cell from closing
  const handleDateChange = (e: React.MouseEvent, days: number) => {
      e.stopPropagation();
      setAttendanceDate(d => modifyDate(d, days));
  };

  return (
    <td className="timetable-cell" onClick={handleCellClick}>
      <div className="cell-content">
        <div className="course-code">{course.code}</div>

        <div className={`details-panel ${isExpanded ? 'expanded' : ''}`}>
          <div className="details-inner">
            <div className="course-full-name">{course.full_name}</div>
            <div className="course-location">📍 {course.location}</div>
            
            {!isMarking && (
              <div className="mark-attendance-button-wrapper">
                <button className="mark-attendance-btn" onClick={handleShowMarking}>
                  Mark Attendance
                </button>
              </div>
            )}

            {isMarking && (
              <div className="attendance-marker">
                <div className="date-control">
                  <button onClick={(e) => handleDateChange(e, -1)}>-</button>
                  <span>{attendanceDate}</span>
                  <button onClick={(e) => handleDateChange(e, 1)}>+</button>
                </div>
                <div className="status-buttons">
                  <button className="present" onClick={(e) => handleMarkAttendance(e, 'Present')}>Present</button>
                  <button className="absent" onClick={(e) => handleMarkAttendance(e, 'Absent')}>Absent</button>
                  <button className="cancelled" onClick={(e) => handleMarkAttendance(e, 'Cancelled')}>Cancelled</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </td>
  );
}