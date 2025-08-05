// pages/attendance.tsx
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { supabase } from '../lib/supabase';
import { CourseWithAttendance } from '../types';
import AddAttendanceForm from '../components/AddAttendanceForm';
import { useState } from 'react';

interface AttendancePageProps { fhjhjjggff  kbiyhfvytrdcyf               ,m,m,.,.,.lkmolkujvbjhbnlmlkjbyuhg kljkl




    lujyhlghjvjhvgouh
  coursesWithAttendance: CourseWithAttendance[];
}

const CourseAttendanceCard: React.FC<{ course: CourseWithAttendance }> = ({ course }) => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold text-blue-700">{course.code}</h2>
      <p className="text-lg text-gray-600 mb-4">{course.full_name}</p>
      
      <AddAttendanceForm courseId={course.id} />

      <div className="mt-4">
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-blue-500 hover:underline"
        >
          {showHistory ? 'Hide' : 'Show'} Recent History ({course.attendance.length})
        </button>

        {showHistory && (
          <div className="mt-2 border-t pt-2">
            {course.attendance.length > 0 ? (
              <ul className="space-y-1">
                {course.attendance.map(att => (
                  <li key={att.id} className="flex justify-between items-center text-sm p-1 rounded-md bg-gray-50">
                    <span>{new Date(att.date).toLocaleDateString()}</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${att.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {att.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No records yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function AttendancePage({ coursesWithAttendance }: AttendancePageProps) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Head>
        <title>Mark Attendance</title>
      </Head>

      <main className="container mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Course Attendance</h1>
          <Link href="/">
            <a className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors">
              ← Back to Timetable
            </a>
          </Link>
        </header>
        
        <div>
          {coursesWithAttendance.map(course => (
            <CourseAttendanceCard key={course.id} course={course} />
          ))}
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // Fetch all courses and their related attendance records
  // Order attendance by date to show the most recent first
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      attendance (id, date, status)
    `)
    .order('date', { foreignTable: 'attendance', ascending: false });

  if (error) {
    console.error('Error fetching courses with attendance:', error);
    return { props: { coursesWithAttendance: [] } };
  }

  return {
    props: {
      coursesWithAttendance: data as CourseWithAttendance[],
    },
  };
};