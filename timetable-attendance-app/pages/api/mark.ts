// pages/api/mark.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { course_id, date, status } = req.body;

  if (!course_id || !date || !status) {
    return res.status(400).json({ message: 'Missing required fields: course_id, date, status' });
  }

  // Upsert allows creating a new record or updating an existing one
  // if a record for the same course_id and date already exists.
  const { data, error } = await supabase
    .from('attendance')
    .upsert(
      { course_id, date, status },
      { onConflict: 'course_id,date' }
    );

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ message: 'Failed to save attendance', data: error.message });
  }

  res.status(201).json({ message: 'Attendance marked successfully', data });
}