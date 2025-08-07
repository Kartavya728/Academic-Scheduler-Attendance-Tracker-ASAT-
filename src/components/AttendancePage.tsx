// app/components/AttendancePage.tsx
'use client';

import { useState, useMemo } from 'react';

// --- UPDATED TYPES TO MATCH THE FULL APPLICATION DATA ---
type Course = {
  course_code: string;
  name: string;
  // Other course fields are available but not needed by this component
};
type AttendanceEntry = {
  id: string;
  course_code: string;
  date: string;
  // --- "Postponed" status added to handle all possible data ---
  status: 'Present' | 'Absent' | 'Cancelled' | 'Postponed';
};

interface AttendancePageProps {
  courses: Course[];
  attendance: AttendanceEntry[];
  onBack: () => void;
}

export function AttendancePage({ courses, attendance, onBack }: AttendancePageProps) {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  // --- FEATURE ADDED: Calculate Attendance Statistics ---
  // useMemo ensures this complex calculation only runs when attendance data changes.
  const attendanceStats = useMemo(() => {
    const stats: Record<string, { percentage: number }> = {};

    // Group attendance by course code first
    const attendanceByCourse = attendance.reduce((acc, record) => {
      (acc[record.course_code] = acc[record.course_code] || []).push(record);
      return acc;
    }, {} as Record<string, AttendanceEntry[]>);

    // Calculate stats for each course
    Object.keys(attendanceByCourse).forEach(courseCode => {
      const records = attendanceByCourse[courseCode];
      const presentCount = records.filter(r => r.status === 'Present').length;
      const absentCount = records.filter(r => r.status === 'Absent').length;
      const totalClasses = presentCount + absentCount;

      // Calculate percentage, defaulting to 100 if no classes were held
      const percentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 100;
      stats[courseCode] = { percentage };
    });

    return stats;
  }, [attendance]);

  // Helper function to get the correct CSS class for the percentage color
  const getPercentageColorClass = (percentage: number | undefined) => {
    if (percentage === undefined) return 'percentage-default';
    if (percentage < 80) return 'percentage-red';
    if (percentage <= 90) return 'percentage-yellow'; // Covers 80-90 range
    return 'percentage-green';
  };

  const getCourseName = (code: string) => courses.find(c => c.course_code === code)?.name || code;

  const attendanceByCourse = attendance.reduce((acc, record) => {
    (acc[record.course_code] = acc[record.course_code] || []).push(record);
    return acc;
  }, {} as Record<string, AttendanceEntry[]>);

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
              {/* --- FEATURE ADDED: Container for percentage and icon --- */}
              <div className="accordion-header-right">
                <span className={`percentage-display ${getPercentageColorClass(attendanceStats[courseCode]?.percentage)}`}>
                  {attendanceStats[courseCode]?.percentage.toFixed(1) ?? 'N/A'}%
                </span>
                <span className={`accordion-icon ${expandedCourse === courseCode ? 'open' : ''}`}>▼</span>
              </div>
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