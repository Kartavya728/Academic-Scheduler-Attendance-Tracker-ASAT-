// components/Timetable.tsx
import React from 'react';
import { Course } from '../types';
import CourseCard from './CourseCard';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../lib/constants';

type ProcessedTimetable = {
  [day: string]: (Course | null)[];
};

interface TimetableProps {
  processedTimetable: ProcessedTimetable;
}

const Timetable: React.FC<TimetableProps> = ({ processedTimetable }) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="grid grid-cols-6 gap-1 text-center font-bold">
        <div className="p-2">Time</div>
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="p-2 border-b-2 border-gray-300">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-1">
        {TIME_SLOTS.map((slot, timeIndex) => (
          <React.Fragment key={slot}>
            <div className="p-2 font-semibold text-sm text-center self-center">{slot}</div>
            {DAYS_OF_WEEK.map((day, dayIndex) => (
              <div key={`${day}-${slot}`} className="h-32">
                <CourseCard course={processedTimetable[day][timeIndex]} />
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Timetable;