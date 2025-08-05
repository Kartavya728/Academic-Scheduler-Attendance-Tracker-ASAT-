// app/components/AttendancePage.tsx
'use client';

import { useState } from 'react';

type Course = { code: string; full_name: string };
type AttendanceEntry = { id: string; course_code: string; date: string; status: 'Present' | 'Absent' | 'Cancelled' };

interface AttendancePageProps {
  courses: Course[];
  attendance: AttendanceEntry[];
  onBack: () => void;
}

export function AttendancePage({ courses, attendance, onBack }: AttendancePageProps) {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const getCourseName = (code: string) => courses.find(c => c.code === code)?.full_name || code;

  const attendanceByCourse = attendance.reduce((acc, record) => {
    (acc[record.course_code] = acc[record.course_code] || []).push(record);
    return acc;
  }, {} as Record<string, AttendanceEntry[]>);

  // Ensure records within each course are sorted by date
  for (const courseCode in attendanceByCourse) {
      attendanceByCourse[courseCode].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const toggleCourse = (code: string) => {
    setExpandedCourse(expandedCourse === code ? null : code);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Attendance Records</h1>
      <div className="attendance-list">
        {Object.keys(attendanceByCourse).map(courseCode => (
          <div key={courseCode} className="course-accordion">
            <button className="accordion-header" onClick={() => toggleCourse(courseCode)}>
              <span>{getCourseName(courseCode)} ({courseCode})</span>
              <span className={`accordion-icon ${expandedCourse === courseCode ? 'open' : ''}`}>▼</span>
            </button>
            <div className={`accordion-content ${expandedCourse === courseCode ? 'open' : ''}`}>
              <div className="accordion-inner">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceByCourse[courseCode].map(record => (
                      <tr key={record.id}>
                        <td>{record.date}</td>
                        <td>
                          <span className={`status-badge ${record.status.toLowerCase()}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="actions-footer">
        <button onClick={onBack} className="footer-btn">← Back to Timetable</button>
      </div>
    </div>
  );
}