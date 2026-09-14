import { useNavigate } from 'react-router';
import CartoonEpisodePlayer from '@/components/cartoons/CartoonEpisodePlayer';
import { DINOSAUR_ADVENTURE } from '@/lib/cartoons/dinosaur-adventure';

export default function ArchiesDinosaurAdventurePage() {
  const navigate = useNavigate();
  return <CartoonEpisodePlayer episode={DINOSAUR_ADVENTURE} onExit={() => navigate('/cartoons')} />;
}
