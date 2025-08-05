// components/CourseCard.tsx
import { useState } from 'react';
import { Course } from '../types'; // We will create this type file next

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!course) {
    return <div className="h-full border border-gray-200 bg-gray-50 rounded-lg"></div>;
  }

  return (
    <div className="border border-gray-300 rounded-lg p-2 bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between">
      <div 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <p className="font-bold text-blue-600">{course.code}</p>
        <p className="text-xs text-gray-500">{course.full_name}</p>
        
        {isExpanded && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-sm">
              <span className="font-semibold">Location:</span> {course.location}
            </p>
          </div>
        )}
      </div>
       <div className="text-right text-xs text-gray-400 mt-1">
        {isExpanded ? 'Click to collapse' : 'Click to expand'}
      </div>
    </div>
  );
};

export default CourseCard;