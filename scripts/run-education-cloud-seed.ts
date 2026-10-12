import { runEducationCloudSeed } from '../src/server/db/migrations/education-cloud-seed';

console.log('[EducationCloud] starting seed...');
await runEducationCloudSeed();
console.log('[EducationCloud] seed command finished.');
