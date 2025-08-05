// app/components/TimetableCell.tsx
'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Portal } from './Portal'; // <-- IMPORT THE PORTAL

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
  
  // This function now just toggles the state. The rendering is handled elsewhere.
  const handleCellClick = () => {
    setIsExpanded(true);
  };
  
  const closeModal = () => {
      setIsExpanded(false);
      setIsMarking(false); // Also reset marking state when closing
  };

  const handleShowMarking = () => {
    setIsMarking(true);
  };

  const handleMarkAttendance = async (status: AttendanceStatus) => {
    const { error } = await supabase.from('attendance').insert([
      { course_code: entry.course_code, date: attendanceDate, status },
    ]);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert(`Attendance marked as ${status} for ${course.code}`);
      onAttendanceMarked();
    }
    // Close modal after marking
    closeModal();
  };

  const handleDateChange = (days: number) => {
    setAttendanceDate(d => modifyDate(d, days));
  };

  // The main cell just shows the course code and triggers the modal
  return (
    <>
      <td className="timetable-cell" onClick={handleCellClick}>
        <div className="cell-content">
          <div className="course-code">{course.code}</div>
          <div className="course-location-preview">{course.location}</div>
        </div>
      </td>

      {/* MODAL RENDERED VIA PORTAL */}
      {isExpanded && (
        <Portal>
          {/* Backdrop to close the modal */}
          <div className="modal-backdrop" onClick={closeModal}></div>
          
          {/* Modal content itself, stopPropagation prevents backdrop click */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="course-code">{course.code}</div>
               <button className="modal-close-btn" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
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
                      <button onClick={() => handleDateChange(-1)}>-</button>
                      <span>{attendanceDate}</span>
                      <button onClick={() => handleDateChange(1)}>+</button>
                    </div>
                    <div className="status-buttons">
                      <button className="present" onClick={() => handleMarkAttendance('Present')}>Present</button>
                      <button className="absent" onClick={() => handleMarkAttendance('Absent')}>Absent</button>
                      <button className="cancelled" onClick={() => handleMarkAttendance('Cancelled')}>Cancelled</button>
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