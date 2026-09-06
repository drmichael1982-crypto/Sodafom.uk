import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Sparkles, Check, Heart, Shield, Volume2, Eye } from 'lucide-react';
import { loadTutorMemory, saveTutorMemory, ChildTutorProfile } from '@/lib/tutor/memory';

interface ChildProfileManagerProps {
  onComplete: (profile: ChildTutorProfile) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function ChildProfileManager({ onComplete, onCancel, isEditing = false }: ChildProfileManagerProps) {
  const [profile, setProfile] = useState<ChildTutorProfile>(() => loadTutorMemory());
  const [name, setName] = useState(profile.childName ?? '');
  const [ageGroup, setAgeGroup] = useState<'5-7' | '8-10' | '11-13'>(profile.ageGroup ?? '8-10');
  const [schoolYear, setSchoolYear] = useState<string>(profile.schoolYear ?? 'Year 4');
  const [tutor, setTutor] = useState<'archie' | 'soda' | 'bella' | 'rocky'>(profile.preferredTutor ?? 'archie');
  const [readAloud, setReadAloud] = useState<boolean>(profile.readAloudPreference ?? true);
  const [parentPin, setParentPin] = useState<string>(profile.parentPin ?? '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: ChildTutorProfile = {
      ...profile,
      childName: name.trim(),
      ageGroup,
      schoolYear,
      preferredTutor: tutor,
      readAloudPreference: readAloud,
      parentPin: parentPin.trim() ? parentPin.trim() : undefined,
    };

    saveTutorMemory(updated);
    onComplete(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto bg-white border-4 border-yellow-300 rounded-3xl p-6 shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-yellow-100 pb-4">
        <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-white shadow-md">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 leading-tight">
            {isEditing ? 'Edit Child Profile' : 'Welcome to 1-to-1 Tutor!'}
          </h2>
          <p className="text-xs font-bold text-amber-700">
            {isEditing ? 'Update learning preferences' : "Let's set up your personalized tutor"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Child Name */}
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
            Child's First Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sophie"
              className="w-full pl-11 pr-4 py-3 bg-amber-50 border-2 border-amber-200 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Age Group */}
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
            Age & Level Group
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['5-7', '8-10', '11-13'] as const).map((ag) => (
              <button
                key={ag}
                type="button"
                onClick={() => {
                  setAgeGroup(ag);
                  if (ag === '5-7') setSchoolYear('Year 1-2');
                  if (ag === '8-10') setSchoolYear('Year 4');
                  if (ag === '11-13') setSchoolYear('Year 7');
                }}
                className={`py-2.5 px-2 rounded-2xl text-xs font-black border-2 transition-all ${
                  ageGroup === ag
                    ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-md'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-amber-50'
                }`}
              >
                Ages {ag}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Tutor Character */}
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
            Choose Your Favorite Tutor
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'archie', label: 'Archie (Maths)', emoji: '⭐' },
              { id: 'soda', label: 'Soda (Science)', emoji: '🤖' },
              { id: 'bella', label: 'Bella (English)', emoji: '📖' },
              { id: 'rocky', label: 'Rocky (Geography)', emoji: '🌍' },
            ].map((char) => (
              <button
                key={char.id}
                type="button"
                onClick={() => setTutor(char.id as any)}
                className={`p-3 rounded-2xl border-2 flex items-center gap-2 text-left transition-all ${
                  tutor === char.id
                    ? 'bg-green-100 border-green-500 text-green-900 font-black shadow-md'
                    : 'bg-gray-50 border-gray-200 text-gray-700 font-bold hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{char.emoji}</span>
                <span className="text-xs">{char.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Audio / Read Aloud Toggle */}
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <Volume2 size={18} className="text-amber-700" />
            <span className="text-xs font-bold text-amber-900">Auto Read Lessons Aloud</span>
          </div>
          <input
            type="checkbox"
            checked={readAloud}
            onChange={(e) => setReadAloud(e.target.checked)}
            className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-black text-xs rounded-2xl border border-gray-300 hover:bg-gray-200"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex-1 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-amber-950 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 border-2 border-yellow-500 active:scale-95 transition-all"
          >
            <Check size={16} /> Save & Start Lesson
          </button>
        </div>
      </form>
    </motion.div>
  );
}
