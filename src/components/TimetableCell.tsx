// app/components/TimetableCell.tsx
'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Portal } from './Portal';

// --- UPDATED TYPES TO INCLUDE ALL COURSE DETAILS ---
type Course = {
  course_code: string;
  alias: string | null; // The short name for the timetable cell
  name: string;
  category: string;
  term: string;
  nature: string;
  slot: string;
  teacher: string;
  credits: number;
};
type TimetableEntry = {
  course_code: string;
};
// --- "Postponed" status added ---
type AttendanceStatus = 'Present' | 'Absent' | 'Cancelled' | 'Postponed';

// --- UPDATED PROPS TO ACCEPT userId ---
interface TimetableCellProps {
  entry: TimetableEntry | null;
  course: Course | undefined;
  onAttendanceMarked: () => void;
  userId: string; // <-- CRITICAL: For user-specific attendance
}

const modifyDate = (dateStr: string, days: number) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export function TimetableCell({ entry, course, onAttendanceMarked, userId }: TimetableCellProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  if (!entry || !course) {
    return <td className="timetable-cell empty"></td>;
  }
  
  const handleCellClick = () => setIsExpanded(true);
  const closeModal = () => { setIsExpanded(false); setIsMarking(false); };
  const handleShowMarking = () => setIsMarking(true);
  const handleDateChange = (days: number) => setAttendanceDate(d => modifyDate(d, days));

  // --- UPDATED to include userId and better error handling ---
  const handleMarkAttendance = async (status: AttendanceStatus) => {
    const { error } = await supabase.from('attendance').insert([
      {
        course_code: entry.course_code,
        date: attendanceDate,
        status,
        user_id: userId, // <-- FEATURE ADDED: Pass the userId to Supabase
      },
    ]);

    if (error) {
      // --- FEATURE ADDED: Specific error for duplicate entries ---
      if (error.code === '23505') {
        alert('Error: You have already marked attendance for this class on this day.');
      } else {
        alert(`Error: ${error.message}`);
      }
    } else {
      // This alert can be removed if you prefer a silent success
      alert(`Attendance marked as ${status} for ${course.name}`);
      onAttendanceMarked();
    }
    closeModal();
  };

  return (
    <>
      {/* --- UPDATED to show the short alias name --- */}
      <td className="timetable-cell" onClick={handleCellClick}>
        <div className="cell-content">
          <div className="course-code">{course.alias || course.course_code}</div>
          <div className="course-location-preview">{course.name}</div>
        </div>
      </td>

      {isExpanded && (
        <Portal>
          <div className="modal-backdrop" onClick={closeModal}></div>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {/* The header now shows the full, unambiguous course code */}
              <div className="course-code">{course.course_code}</div>
               <button className="modal-close-btn" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
                {/* --- FEATURE ADDED: All course details are now displayed --- */}
                <div className="course-full-name">{course.name}</div>
                <div className="course-details-container">
                  <div><strong>Teacher:</strong> {course.teacher}</div>
                  <div><strong>Category:</strong> {course.category}</div>
                  <div><strong>Slot:</strong> {course.slot}</div>
                  <div><strong>Credits:</strong> {course.credits.toFixed(2)}</div>
                  <div><strong>Term:</strong> {course.term}</div>
                  <div><strong>Nature:</strong> {course.nature}</div>
                </div>
                
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
                      <button onClick={() => handleDateChange(-1)}>-</button>
                      <span>{attendanceDate}</span>
                      <button onClick={() => handleDateChange(1)}>+</button>
                    </div>
                    <div className="status-buttons">
                      <button className="present" onClick={() => handleMarkAttendance('Present')}>Present</button>
                      <button className="absent" onClick={() => handleMarkAttendance('Absent')}>Absent</button>
                      <button className="cancelled" onClick={() => handleMarkAttendance('Cancelled')}>Cancelled</button>
                      {/* --- FEATURE ADDED: Postponed button --- */}
                      <button className="postponed" onClick={() => handleMarkAttendance('Postponed')}>Postponed</button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}