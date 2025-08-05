// pages/attendance-log.tsx
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { supabase } from '../lib/supabase';
import { AttendanceRecord } from '../types';

interface LogPageProps {
  attendanceLog: AttendanceRecord[];
}

const AttendanceLogPage = ({ attendanceLog }: LogPageProps) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Head>
        <title>Full Attendance Log</title>
      </Head>

      <main className="container mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Full Attendance Log</h1>
          <Link href="/">
            <a className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors">
              ← Back to Timetable
            </a>
          </Link>
        </header>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceLog.length > 0 ? (
                attendanceLog.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{record.courses.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{record.courses.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  // Fetch all attendance records and join with the courses table to get course details
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      id,
      date,
      status,
      courses (code, full_name)
    `)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching attendance log:', error);
    return { props: { attendanceLog: [] } };
  }

  return {
    props: {
      attendanceLog: data,
    },
  };
};

export default AttendanceLogPage;