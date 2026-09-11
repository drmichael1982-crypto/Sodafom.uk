import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import FeaturePageShell from '@/components/FeaturePageShell';

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
  return (
    <>
      <Helmet><title>Archie & Friends — Sodafom</title></Helmet>
      <FeaturePageShell title="Archie & Friends" subtitle="Meet the colourful friends who help you learn." emoji="🌟" accent="from-cyan-500 via-blue-700 to-purple-950" backTo="/">
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {FRIENDS.map((friend, index) => (
            <motion.article key={friend.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.35) }} className="overflow-hidden rounded-[2rem] border-4 border-white/80 bg-white/95 p-3 text-center text-blue-950 shadow-2xl">
              <img src={friend.image} alt={friend.name} className="mx-auto h-36 w-full rounded-2xl object-contain" />
              <h2 className="mt-2 text-lg font-black">{friend.name}</h2>
              <p className="mt-1 text-xs font-bold text-slate-600">{friend.helps}</p>
            </motion.article>
          ))}
        </section>
      </FeaturePageShell>
    </>
  );
}
