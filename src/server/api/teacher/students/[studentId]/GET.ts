import type { Request, Response } from 'express';
import { resolveTeacher } from '@/server/api/teacher/me/GET';
import { loadTeacherPupil } from '@/server/api/teacher/school-records';
import { getGameRecommendations } from '@/server/lib/game-recommendations';
import { positiveId } from '@/lib/teacher-progress';

export default async function handler(req: Request, res: Response) {
  res.set('Cache-Control', 'private, no-store');
  res.set('Vary', 'Authorization');
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Please sign in as a teacher.' });
    const studentId = positiveId(req.params.studentId);
    if (!studentId) return res.status(400).json({ error: 'Invalid pupil ID.' });
    const data = await loadTeacherPupil(teacher.id, studentId);
    if (!data) return res.status(404).json({ error: 'Pupil not found in your class.' });
    const recommendationNotes = [...data.notes.map(n => n.noteText), ...data.records.filter(r => r.source === 'teacher').map(r => r.comment)].join(' ');
    const recommendations = getGameRecommendations(recommendationNotes, data.activity.map(a => a.gameId)).map(r => ({ ...r, path: r.href }));
    return res.json({ ...data, recommendations,
      subjectStats: Object.entries(data.summary.bySubject).map(([subject, s]) => ({ subject, gamesPlayed: data.activity.filter(a => a.subject === subject).length, avgScore: s.percent, totalStars: data.activity.filter(a => a.subject === subject).reduce((total, a) => total + (a.starsEarned ?? 0), 0) })),
    });
  } catch {
    return res.status(500).json({ error: 'Could not load pupil records. Please retry.' });
  }
}
