import { Helmet } from '@dr.pogodin/react-helmet';
import { useNavigate } from 'react-router';
import WordAdventurePlayer from '@/components/cartoons/WordAdventurePlayer';

export default function WordAdventurePage() {
  const navigate = useNavigate();
  return <><Helmet><title>Archie’s Word Adventure — Sodafom</title><meta name="description" content="A 5 minute 36 second interactive English cartoon with Archie, Bella and Soda Bot." /></Helmet><WordAdventurePlayer onExit={() => navigate('/cartoons')} /></>;
}
