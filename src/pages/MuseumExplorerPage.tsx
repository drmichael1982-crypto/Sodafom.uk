import { Helmet } from '@dr.pogodin/react-helmet';
import { useEffect, useState } from 'react';
import MuseumWalkthrough from '@/components/museum/MuseumWalkthrough';
import { ttsSpeak, stopTts } from '@/lib/voice-context';
import { useNavigate } from 'react-router';

const MUSEUMS = {
  dinosaurs: { title: 'Dinosaur Museum', emoji: '🦖', colour: 'from-emerald-400 to-green-800', welcome: 'Roar! What dinosaur shall we discover first?', galleries: [['Fossil Hall', '🦴', 'Fossils are the remains or traces of living things from long ago.'], ['Dino Giants', '🦕', 'Some of the biggest dinosaurs ate plants, while other dinosaurs hunted meat.'], ['Dino Lab', '🔎', 'Palaeontologists study bones and rocks to learn about the past.']] },
  egypt: { title: 'British Museum: Ancient Egypt', emoji: '𓂀', colour: 'from-amber-300 to-orange-800', welcome: 'Welcome to Ancient Egypt. Let’s explore its amazing artefacts together.', galleries: [['Mummy Gallery', '⚱️', 'Ancient Egyptians wrapped mummies because they believed life continued after death.'], ['Pharaoh’s Hall', '👑', 'A pharaoh was the ruler of Ancient Egypt.'], ['Writing Room', '📜', 'Hieroglyphs were picture symbols used as writing in Ancient Egypt.']] },
  romans: { title: 'Roman Britain Museum', emoji: '🏺', colour: 'from-rose-400 to-red-900', welcome: 'Salve! Let’s see how Romans lived and built in Britain.', galleries: [['Roman Home', '🏛️', 'Romans built strong homes, roads and public baths.'], ['Soldier Station', '🛡️', 'Roman soldiers wore armour and marched long distances.'], ['Archaeology Table', '⛏️', 'Archaeologists find clues in the ground to tell us about Roman life.']] },
  vikings: { title: 'Viking Museum', emoji: '⛵', colour: 'from-blue-400 to-indigo-900', welcome: 'Ahoy! Let’s sail into Viking life, longships and York.', galleries: [['Longship Dock', '⛵', 'Viking longships were fast and could travel on shallow rivers.'], ['Viking Home', '🔥', 'Viking families often lived in longhouses with a fire in the middle.'], ['York Dig', '🪙', 'Archaeologists in York have found objects that teach us about Viking Britain.']] },
  space: { title: 'Space & Inventions Museum', emoji: '🚀', colour: 'from-violet-400 to-indigo-950', welcome: 'Blast off! Let’s explore space, rockets and brilliant inventions.', galleries: [['Moon Rock Lab', '🌑', 'Moon rocks help scientists compare the Moon with Earth.'], ['Rocket Hall', '🚀', 'Rockets need powerful engines to escape Earth’s gravity.'], ['Satellite Room', '🛰️', 'Satellites help with maps, weather forecasts and communication.']] },
  nature: { title: 'Natural World Museum', emoji: '🌍', colour: 'from-teal-400 to-emerald-900', welcome: 'Let’s investigate amazing animals, fossils and habitats from our natural world.', galleries: [['Dinosaur Fossils', '🦴', 'Fossils give us clues about living things from long ago.'], ['Ocean Hall', '🐋', 'Blue whales are the largest animals known to have lived.'], ['Nature Lab', '🦋', 'Butterfly wing patterns can help with camouflage and warning colours.']] },
} as const;
type MuseumId = keyof typeof MUSEUMS;

export default function MuseumExplorerPage() {
  const navigate = useNavigate();
  const [museum, setMuseum] = useState<MuseumId | null>(null);
  const [gallery, setGallery] = useState<number | null>(null);
  const [question, setQuestion] = useState('');
  const chosen = museum ? MUSEUMS[museum] : null;
  const speak = (words: string) => { stopTts(); ttsSpeak(words); };
  useEffect(() => () => stopTts(), []);
  const open = (id: MuseumId) => { setMuseum(id); setGallery(null); setQuestion(''); speak(MUSEUMS[id].welcome); };
  const findMuseum = () => open(/egypt|mumm|british|pharaoh/.test(question.toLowerCase()) ? 'egypt' : /roman/.test(question.toLowerCase()) ? 'romans' : /viking|york|longship/.test(question.toLowerCase()) ? 'vikings' : /space|moon|rocket|satellite/.test(question.toLowerCase()) ? 'space' : /nature|ocean|whale|butterfly/.test(question.toLowerCase()) ? 'nature' : 'dinosaurs');

  const galleries = Object.fromEntries(Object.entries(MUSEUMS).map(([id, item]) => [id, {
    title:item.title, icon:item.emoji, colour:'', welcome:item.welcome,
    artefacts:item.galleries.map(([name,icon,fact]) => ({ name,icon,fact,challenge:'What did you notice about this discovery?' })),
  }]));
  return <main className="min-h-screen bg-gradient-to-b from-sky-100 via-white to-violet-100 pb-8 pt-4 text-slate-900">
    <Helmet><title>Museum Explorer — Sodafom</title></Helmet>
    <div className="max-w-5xl mx-auto px-4"><button type="button" className="sf-primary" onClick={() => navigate('/')}>← Home</button></div>
    <MuseumWalkthrough galleries={galleries} selectedKey={museum} selectedExhibit={gallery}
      message={chosen ? (gallery === null ? chosen.welcome : chosen.galleries[gallery][2]) : 'What would you like to discover today?'}
      query={question} onQueryChange={setQuestion} onSearch={findMuseum}
      onEnter={id => open(id as MuseumId)} onBack={() => { setMuseum(null); setGallery(null); }} onRead={speak}
      onExhibit={index => { if (!chosen) return; setGallery(index); speak(`${chosen.galleries[index][0]}. ${chosen.galleries[index][2]}`); }} />
    <div className="max-w-5xl mx-auto px-4"><button type="button" className="sf-primary w-full" onClick={() => navigate('/games/colour-book')}>Museum colouring books</button></div>
  </main>;
}
