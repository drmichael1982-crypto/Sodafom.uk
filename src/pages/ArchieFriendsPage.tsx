import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import FeaturePageShell from '@/components/FeaturePageShell';
import { useEffect, useRef, useState } from 'react';
import { speakCharacter } from '@/lib/voice-context';

const FRIENDS = [
  { name: 'Soda Bot', image: '/assets/cartoon/friends/soda-bot.png', helps: 'Your friendly app helper.' },
  { name: 'Captain Spark', image: '/assets/cartoon/friends/captain-spark.png', helps: 'Brave challenges and achievements.' },
  { name: 'Professor Thinkwell', image: '/assets/cartoon/friends/professor-thinkwell.png', helps: 'Science, facts and clever thinking.' },
  { name: 'Mia', image: '/assets/cartoon/friends/mia.png', helps: 'Stories and creative learning.' },
  { name: 'Toby', image: '/assets/cartoon/friends/toby.png', helps: 'Experiments and inventions.' },
  { name: 'Bella', image: '/assets/cartoon/friends/bella.png', helps: 'Words, spelling and vocabulary.' },
  { name: 'Rocky', image: '/assets/cartoon/friends/rocky.png', helps: 'Cheering on every learner.' },
  { name: 'Penny', image: '/assets/cartoon/friends/penny.png', helps: 'Patient reading practice.' },
  { name: 'Ziggy', image: '/assets/cartoon/friends/ziggy.png', helps: 'Big dinosaur challenges.' },
  { name: 'Daisy', image: '/assets/cartoon/friends/daisy.png', helps: 'Kindness and confidence.' },
  { name: 'Sunny', image: '/assets/cartoon/friends/sunny.png', helps: 'Stars, stickers and celebrations.' },
] as const;

export default function ArchieFriendsPage() {
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [voiceMessage, setVoiceMessage] = useState('');
  const stopVoice = useRef<() => void>(() => {});
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; stopVoice.current(); }, []);
  let childName = 'friend';
  try { childName = localStorage.getItem('sodafom_child_name') || 'friend'; } catch { /* SSR/private browsing. */ }
  const greet = (name: string, helps: string) => {
    generation.current++;
    const token = generation.current;
    stopVoice.current(); setSpeaking(name); setVoiceMessage('');
    const playback = speakCharacter(name, `Hello ${childName}! My name is ${name}. ${helps} Let's learn together!`);
    stopVoice.current = playback.stop;
    void playback.finished.then(result => {
      if (token !== generation.current) return;
      setSpeaking(null);
      if (result === 'unavailable' || result === 'error') setVoiceMessage('This character voice is not available on this device. Their introduction is still shown below.');
      if (result === 'muted') setVoiceMessage('This sound is switched off in Voices and sound settings.');
    });
  };
  return (
    <>
      <Helmet><title>Archie & Friends — Sodafom</title></Helmet>
      <FeaturePageShell title="Archie & Friends" subtitle="Meet the colourful friends who help you learn." emoji="🌟" accent="from-cyan-500 via-blue-700 to-purple-950" backTo="/">
        <p role="status" aria-live="polite">{voiceMessage}</p>
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {FRIENDS.map((friend, index) => (
            <motion.button type="button" onClick={() => greet(friend.name, friend.helps)} key={friend.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.35) }} className={`overflow-hidden rounded-[2rem] border-4 bg-white/95 p-3 text-center text-blue-950 shadow-2xl transition hover:-translate-y-1 active:scale-95 ${speaking === friend.name ? 'border-yellow-400 ring-4 ring-yellow-300' : 'border-white/80'}`}>
              <img src={friend.image} alt={friend.name} className="mx-auto h-36 w-full rounded-2xl object-contain" />
              <h2 className="mt-2 text-lg font-black">{friend.name}</h2>
              <p className="mt-1 text-xs font-bold text-slate-600">{friend.helps}</p>
              <p className="mt-2 rounded-xl bg-cyan-100 px-2 py-1 text-xs font-black text-cyan-900">{speaking === friend.name ? 'Playing…' : 'Tap to say hello'}</p>
            </motion.button>
          ))}
        </section>
      </FeaturePageShell>
    </>
  );
}
