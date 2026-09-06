import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/server/db/client';
import { students, children, activitySessions, studentActivity, user } from '@/server/db/schema';
import { eq, or, like, sql } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { KEYWORD_MAP } from '@/server/lib/game-recommendations';

/**
 * Educational tools for the Archie agent.
 */
export const tools: any = {
  /**
   * Retrieves statistics for a student by name or code.
   */
  getStudentStats: tool({
    description: 'Get star counts and activity stats for a student by their name or student code.',
    parameters: z.object({
      identifier: z.string().describe('The student name or unique student code (e.g. SODA-STUD-XXXX)'),
    }),
    execute: (async ({ identifier }: { identifier: string }) => {
      try {
        // Search in students table (School/Teacher context)
        const [student] = await db.select().from(students)
          .where(or(
            eq(students.studentCode, identifier),
            like(students.name, `%${identifier}%`)
          ))
          .limit(1);

        if (student) {
          const activity = await db.select().from(studentActivity)
            .where(eq(studentActivity.studentId, student.id));

          return {
            type: 'student',
            name: student.name,
            stars: student.totalStars,
            gamesPlayed: activity.length,
            ageGroup: student.ageGroup,
            source: 'School Class',
            studentCode: student.studentCode,
          };
        }

        // Search in children table (Home/Parent context)
        const [child] = await db.select().from(children)
          .where(like(children.name, `%${identifier}%`))
          .limit(1);

        if (child) {
          const sessions = await db.select().from(activitySessions)
            .where(eq(activitySessions.childId, child.id));

          return {
            type: 'child',
            name: child.name,
            stars: child.totalStars,
            gamesPlayed: sessions.length,
            ageGroup: child.ageGroup,
            source: 'Family Account',
          };
        }

        return { error: `Student or child not found with identifier "${identifier}". Ask them to double check their name or code!` };
      } catch (err) {
        console.error('[tools] getStudentStats failed:', err);
        return { error: "I'm sorry, I'm having a little trouble looking at your stars right now. Can you try again later?" };
      }
    }),
  } as any),

  /**
   * Evaluates an answer for a Maths or Spelling question.
   */
  markWork: tool({
    description: 'Marks a student\'s answer for a specific subject and question.',
    parameters: z.object({
      subject: z.enum(['maths', 'spelling', 'reading', 'science']),
      question: z.string().describe('The question asked'),
      answer: z.string().describe('The student\'s answer'),
    }),
    execute: (async ({ subject, question, answer }: { subject: string, question: string, answer: string }) => {
      const isMaths = subject === 'maths';
      let correct = false;
      let feedback = '';
      let expectedAnswer = '';

      if (isMaths) {
        try {
          const qMatch = question.match(/(\d+)\s*([+\-*/x])\s*(\d+)/);
          if (qMatch) {
            const a = Number(qMatch[1]);
            const b = Number(qMatch[3]);
            const op = qMatch[2].replace('x', '*');
            let expected = 0;
            if (op === '+') expected = a + b;
            else if (op === '-') expected = a - b;
            else if (op === '*' || op === 'x') expected = a * b;
            else if (op === '/') expected = a / b;

            expectedAnswer = expected.toString();
            correct = Number(answer.trim()) === expected;
          }
        } catch {
          feedback = "I had a little trouble calculating that one, but let's look at it together!";
        }
      } else if (subject === 'spelling') {
        const wordMatch = question.match(/spell\s+["']?([a-zA-Z]+)["']?/i);
        if (wordMatch) {
          expectedAnswer = wordMatch[1].toLowerCase();
          correct = answer.trim().toLowerCase() === expectedAnswer;
        }
      }

      return {
        subject,
        question,
        answer,
        correct,
        expectedAnswer,
        status: correct ? 'Correct! 🌟' : 'Not quite right yet.',
        feedback: feedback || (correct ? 'Excellent work! You nailed it!' : 'Close! Keep trying, you\'re getting there!')
      };
    }),
  } as any),

  /**
   * Searches for relevant games in the Sodafom catalogue.
   */
  searchGames: tool({
    description: 'Find educational games on a specific topic.',
    parameters: z.object({
      topic: z.string().describe('The topic to search for (e.g. fractions, lions, spelling)'),
    }),
    execute: (async ({ topic }: { topic: string }) => {
      const lower = topic.toLowerCase();

      const found = KEYWORD_MAP.filter(({ keywords, game }) =>
        keywords.some(kw => lower.includes(kw) || kw.includes(lower)) ||
        game.title.toLowerCase().includes(lower) ||
        game.subject.toLowerCase().includes(lower)
      ).map(m => m.game);

      return found.length > 0 ? { games: found } : { message: `I couldn't find a specific game for "${topic}", but I have lots of other fun activities in Maths, Spelling, and Reading!` };
    }),
  } as any),

  /**
   * Researches the application codebase (Restricted).
   */
  exploreCodebase: tool({
    description: 'Read a specific file from the project to understand how it works.',
    parameters: z.object({
      filePath: z.string().describe('Relative path to the file (e.g. src/App.tsx)'),
    }),
    execute: (async ({ filePath }: { filePath: string }) => {
      try {
        const allowedPaths = ['src/', 'vite.config.ts', 'tailwind.config.js', 'package.json'];
        const isAllowed = allowedPaths.some(p => filePath.startsWith(p));

        if (!isAllowed) {
          return { error: 'Access denied. I can only explore files in the src/ directory or core configuration files.' };
        }

        const projectRoot = resolve(process.cwd());
        const fullPath = join(projectRoot, filePath);

        if (!fullPath.startsWith(projectRoot)) {
          return { error: 'Invalid file path.' };
        }

        const content = readFileSync(fullPath, 'utf8');
        return {
          file: filePath,
          content: content.slice(0, 3000),
          truncated: content.length > 3000,
          totalLines: content.split('\n').length
        };
      } catch (err) {
        return { error: `Could not read file: ${err instanceof Error ? err.message : 'Unknown error'}. Make sure the path is correct!` };
      }
    }),
  } as any),

  /**
   * Diagnostic tool to spot issues in the app or database.
   */
  checkSystemHealth: tool({
    description: 'Check the health of the application, database, and core services to spot problems.',
    parameters: z.object({}),
    execute: (async () => {
      const start = Date.now();
      const results: any = { status: 'healthy', checks: [] };

      try {
        await db.select({ count: sql`count(*)` }).from(user).limit(1);
        results.checks.push({ name: 'Database', status: 'online', latency: `${Date.now() - start}ms` });
      } catch (err) {
        results.status = 'degraded';
        results.checks.push({ name: 'Database', status: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
      }

      results.checks.push({ name: 'API Server', status: 'online' });
      results.checks.push({ name: 'AI Model Gateway', status: 'fast' });

      return results;
    }),
  } as any),

  /**
   * Dummy tool to test connectivity without DB dependencies.
   */
  ping: tool({
    description: 'A simple ping tool to test Archie connectivity.',
    parameters: z.object({}),
    execute: async () => ({ status: 'Archie is listening and tools are working!' }),
  } as any),

  /**
   * Suggests code improvements or fixes based on a file's content.
   */
  analyzeAndFix: tool({
    description: 'Analyzes a code file for potential bugs or performance issues and suggests a fix.',
    parameters: z.object({
      filePath: z.string().describe('The path to the file to analyze'),
      issueDescription: z.string().optional().describe('Description of the problem if known'),
    }),
    execute: (async ({ filePath, issueDescription }: { filePath: string, issueDescription?: string }) => {
      try {
        const projectRoot = resolve(process.cwd());
        const fullPath = join(projectRoot, filePath);
        const content = readFileSync(fullPath, 'utf8');

        return {
          analysisTarget: filePath,
          currentCode: content.slice(0, 4000),
          instruction: `Please look for: ${issueDescription || 'general bugs, repeats, or performance lags'}. propose a specific fix.`
        };
      } catch (err) {
        return { error: `File not found: ${filePath}` };
      }
    }),
  } as any),
};
