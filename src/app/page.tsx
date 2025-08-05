'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

type Course = {
  code: string
  full_name: string
  location: string
}

type TimetableEntry = {
  id: string
  day: string
  time_slot: string
  course_code: string
}

type AttendanceEntry = {
  id: string
  course_code: string
  date: string
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([])

  // Load all data on mount
  useEffect(() => {
    const fetchData = async () => {
      const { data: courseData } = await supabase.from('courses').select('*')
      const { data: timetableData } = await supabase.from('timetable').select('*')
      const { data: attendanceData } = await supabase.from('attendance').select('*')

      setCourses(courseData || [])
      setTimetable(timetableData || [])
      setAttendance(attendanceData || [])
    }

    fetchData()
  }, [])

  const markAttendance = async (course_code: string) => {
    const date = new Date().toISOString().split('T')[0] // current date (YYYY-MM-DD)
    const { error } = await supabase.from('attendance').insert([
      { course_code, date }
    ])
    if (!error) {
      alert(`Attendance marked for ${course_code}`)
      setAttendance([...attendance, { id: '', course_code, date }])
    } else {
      alert('Error marking attendance')
    }
  }

  const getCourseDetails = (code: string) => {
    const course = courses.find(c => c.code === code)
    return course
      ? `${course.full_name} (${course.location})`
      : code
  }

  const groupByDay = timetable.reduce<Record<string, TimetableEntry[]>>((acc, entry) => {
    acc[entry.day] = acc[entry.day] || []
    acc[entry.day].push(entry)
    return acc
  }, {})

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📅 Weekly Timetable</h1>

      {Object.keys(groupByDay).map((day) => (
        <div key={day} style={{ marginBottom: '2rem' }}>
          <h2>{day}</h2>
          <table border={1} cellPadding={10} style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Time Slot</th>
                <th>Course</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupByDay[day].map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.time_slot}</td>
                  <td>{getCourseDetails(entry.course_code)}</td>
                  <td>
                    <button onClick={() => markAttendance(entry.course_code)}>Mark Attendance</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <h2>📝 Attendance Records</h2>
      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Course</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((a, i) => (
            <tr key={i}>
              <td>{a.course_code}</td>
              <td>{a.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
