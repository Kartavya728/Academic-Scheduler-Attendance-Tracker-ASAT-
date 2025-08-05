// types.ts
export interface Course {
  id: string;
  code: string;
  full_name: string;
  location: string;
}

export interface TimetableEntry {
  day_of_week: number;
  time_slot: number;
  courses: Course | null; // Supabase returns relation as an object or null
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent';
  courses: Pick<Course, 'code' | 'full_name'>; // Joined data
}

export interface CourseWithAttendance extends Course {
    attendance: {
        id: string;
        date: string;
        status: string;
    }[];
}