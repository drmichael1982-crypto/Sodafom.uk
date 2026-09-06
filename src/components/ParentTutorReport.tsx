import React from 'react';
import { motion } from 'motion/react';
import { Award, CheckCircle, AlertTriangle, TrendingUp, BookOpen, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { loadTutorMemory, getWeakAndStrongTopics, ChildTutorProfile } from '@/lib/tutor/memory';

export function ParentTutorReport() {
  const profile: ChildTutorProfile = loadTutorMemory();
  const { weak, strong } = getWeakAndStrongTopics();

  const totalTopics = Object.keys(profile.topics).length;
  const greenCount = Object.values(profile.topics).filter(t => t.status === 'GREEN').length;
  const amberCount = Object.values(profile.topics).filter(t => t.status === 'AMBER').length;
  const redCount = Object.values(profile.topics).filter(t => t.status === 'RED').length;

  return (
    <div className="bg-white border-2 border-yellow-200 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            Child Tutor Progress Report <Award className="text-yellow-500" size={20} />
          </h2>
          <p className="text-xs font-bold text-gray-500">
            {profile.childName ? `Report for ${profile.childName}` : 'Guest Child Profile'} • Level {profile.ageGroup ?? '8-10'}
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-300">
          OFFLINE / LOCAL TUTOR
        </span>
      </div>

      {/* RED / AMBER / GREEN Mastery Gauges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
          <span className="block text-2xl font-black text-emerald-700">{greenCount}</span>
          <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wide">Green (Confident)</span>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
          <span className="block text-2xl font-black text-amber-700">{amberCount}</span>
          <span className="text-[11px] font-black uppercase text-amber-800 tracking-wide">Amber (Improving)</span>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
          <span className="block text-2xl font-black text-red-700">{redCount}</span>
          <span className="text-[11px] font-black uppercase text-red-800 tracking-wide">Red (Needs Help)</span>
        </div>
      </div>

      {/* What is Going Well & What to Improve Next */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WHAT IS GOING WELL */}
        <div className="bg-green-50/60 border border-green-200 rounded-2xl p-4 space-y-2">
          <h3 className="text-sm font-extrabold text-green-900 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={16} />
            WHAT IS GOING WELL
          </h3>
          {strong.length > 0 ? (
            <ul className="space-y-1">
              {strong.map((t) => (
                <li key={t} className="text-xs font-bold text-green-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {t.charAt(0).toUpperCase() + t.slice(1)} - Great accuracy and confidence!
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs font-bold text-green-800">
              Complete more practice questions to build GREEN mastery topics!
            </p>
          )}
        </div>

        {/* WHAT TO IMPROVE NEXT */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
          <h3 className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
            <AlertTriangle className="text-amber-600" size={16} />
            WHAT TO IMPROVE NEXT
          </h3>
          {weak.length > 0 ? (
            <ul className="space-y-1">
              {weak.map((t) => (
                <li key={t} className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {t.charAt(0).toUpperCase() + t.slice(1)} - Scheduled for simpler examples & extra practice.
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs font-bold text-amber-800">
              No weak topics identified yet. Keep practicing new lessons!
            </p>
          )}
        </div>
      </div>

      {/* Safety Banner */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs font-extrabold text-gray-600">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-green-600" />
          <span>Device-Only Local Memory • COPPA Safe</span>
        </div>
        <span>Total Topics Attempted: {totalTopics}</span>
      </div>
    </div>
  );
}
