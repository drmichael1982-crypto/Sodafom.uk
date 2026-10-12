import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is the skeleton?', options: ['The framework of bones in the body','The muscles in the body','The organs in the body','The skin of the body'], answer: 'The framework of bones in the body' },
  { question: 'What does the skeleton do?', options: ['Supports, protects and allows movement','Only supports the body','Only protects organs','Only allows movement'], answer: 'Supports, protects and allows movement' },
  { question: 'What is the skull?', options: ['The bone that protects the brain','The bone that protects the heart','The bone that protects the lungs','The bone that protects the stomach'], answer: 'The bone that protects the brain' },
  { question: 'What is the ribcage?', options: ['The bones that protect the heart and lungs','The bones that protect the brain','The bones that protect the stomach','The bones that protect the kidneys'], answer: 'The bones that protect the heart and lungs' },
  { question: 'What is the spine?', options: ['The backbone that supports the body','The bone that protects the brain','The bones that protect the heart','The bones that allow arm movement'], answer: 'The backbone that supports the body' },
  { question: 'What is a joint?', options: ['Where two bones meet','A type of bone','A type of muscle','A type of organ'], answer: 'Where two bones meet' },
  { question: 'What is a hinge joint?', options: ['A joint that moves in one direction like a door hinge','A joint that moves in all directions','A joint that does not move','A joint that rotates'], answer: 'A joint that moves in one direction like a door hinge' },
  { question: 'What is a ball and socket joint?', options: ['A joint that moves in all directions','A joint that moves in one direction','A joint that does not move','A joint that slides'], answer: 'A joint that moves in all directions' },
  { question: 'Where is a hinge joint found?', options: ['The knee and elbow','The shoulder and hip','The skull','The spine'], answer: 'The knee and elbow' },
  { question: 'Where is a ball and socket joint found?', options: ['The shoulder and hip','The knee and elbow','The skull','The spine'], answer: 'The shoulder and hip' },
  { question: 'What is cartilage?', options: ['Smooth tissue that cushions joints','A type of bone','A type of muscle','A type of tendon'], answer: 'Smooth tissue that cushions joints' },
  { question: 'What is a ligament?', options: ['Tissue that connects bones at a joint','Tissue that connects muscle to bone','A type of bone','A type of cartilage'], answer: 'Tissue that connects bones at a joint' },
];
const L2: QuizQuestion[] = [
  { question: 'How many bones are in the adult human body?', options: ['206','106','306','406'], answer: '206' },
  { question: 'What is the femur?', options: ['The thigh bone','The shin bone','The arm bone','The hip bone'], answer: 'The thigh bone' },
  { question: 'What is the tibia?', options: ['The shin bone','The thigh bone','The arm bone','The hip bone'], answer: 'The shin bone' },
  { question: 'What is the humerus?', options: ['The upper arm bone','The lower arm bone','The thigh bone','The shin bone'], answer: 'The upper arm bone' },
  { question: 'What is the radius?', options: ['One of the lower arm bones','The upper arm bone','The thigh bone','The shin bone'], answer: 'One of the lower arm bones' },
  { question: 'What is the ulna?', options: ['One of the lower arm bones','The upper arm bone','The thigh bone','The shin bone'], answer: 'One of the lower arm bones' },
  { question: 'What is the sternum?', options: ['The breastbone','The backbone','The collarbone','The shoulder blade'], answer: 'The breastbone' },
  { question: 'What is the clavicle?', options: ['The collarbone','The breastbone','The backbone','The shoulder blade'], answer: 'The collarbone' },
  { question: 'What is the scapula?', options: ['The shoulder blade','The collarbone','The breastbone','The backbone'], answer: 'The shoulder blade' },
  { question: 'What is the pelvis?', options: ['The hip bone','The shoulder bone','The knee bone','The ankle bone'], answer: 'The hip bone' },
  { question: 'What is the patella?', options: ['The kneecap','The ankle bone','The heel bone','The toe bone'], answer: 'The kneecap' },
  { question: 'What is the fibula?', options: ['The smaller lower leg bone','The larger lower leg bone','The thigh bone','The ankle bone'], answer: 'The smaller lower leg bone' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the carpals?', options: ['The wrist bones','The ankle bones','The finger bones','The toe bones'], answer: 'The wrist bones' },
  { question: 'What is the tarsals?', options: ['The ankle bones','The wrist bones','The finger bones','The toe bones'], answer: 'The ankle bones' },
  { question: 'What is the metacarpals?', options: ['The bones of the palm of the hand','The wrist bones','The finger bones','The toe bones'], answer: 'The bones of the palm of the hand' },
  { question: 'What is the metatarsals?', options: ['The bones of the foot between ankle and toes','The ankle bones','The toe bones','The wrist bones'], answer: 'The bones of the foot between ankle and toes' },
  { question: 'What is the phalanges?', options: ['The finger and toe bones','The wrist bones','The ankle bones','The palm bones'], answer: 'The finger and toe bones' },
  { question: 'What is the sacrum?', options: ['The triangular bone at the base of the spine','The tailbone','The breastbone','The collarbone'], answer: 'The triangular bone at the base of the spine' },
  { question: 'What is the coccyx?', options: ['The tailbone at the base of the spine','The triangular bone at the base of the spine','The breastbone','The collarbone'], answer: 'The tailbone at the base of the spine' },
  { question: 'What is the mandible?', options: ['The lower jaw bone','The upper jaw bone','The cheekbone','The forehead bone'], answer: 'The lower jaw bone' },
  { question: 'What is the maxilla?', options: ['The upper jaw bone','The lower jaw bone','The cheekbone','The forehead bone'], answer: 'The upper jaw bone' },
  { question: 'What is the zygomatic bone?', options: ['The cheekbone','The lower jaw bone','The upper jaw bone','The forehead bone'], answer: 'The cheekbone' },
  { question: 'What is the frontal bone?', options: ['The forehead bone','The cheekbone','The lower jaw bone','The upper jaw bone'], answer: 'The forehead bone' },
  { question: 'What is the occipital bone?', options: ['The bone at the back of the skull','The forehead bone','The cheekbone','The lower jaw bone'], answer: 'The bone at the back of the skull' },
];
const L4: QuizQuestion[] = [
  { question: 'What is compact bone?', options: ['Dense, hard outer layer of bone','Spongy inner layer of bone','The bone marrow','The periosteum'], answer: 'Dense, hard outer layer of bone' },
  { question: 'What is spongy (cancellous) bone?', options: ['The porous inner layer of bone containing bone marrow','The dense outer layer of bone','The periosteum','The articular cartilage'], answer: 'The porous inner layer of bone containing bone marrow' },
  { question: 'What is the periosteum?', options: ['The tough outer membrane covering bone','The inner layer of bone','The bone marrow','The articular cartilage'], answer: 'The tough outer membrane covering bone' },
  { question: 'What is bone marrow?', options: ['The soft tissue inside bones that produces blood cells','The outer layer of bone','The membrane covering bone','The cartilage at joints'], answer: 'The soft tissue inside bones that produces blood cells' },
  { question: 'What is ossification?', options: ['The process of bone formation','The process of bone resorption','The process of cartilage formation','The process of joint formation'], answer: 'The process of bone formation' },
  { question: 'What is a tendon?', options: ['Tissue that connects muscle to bone','Tissue that connects bone to bone','Tissue that cushions joints','Tissue that covers bone'], answer: 'Tissue that connects muscle to bone' },
  { question: 'What is a synovial joint?', options: ['A freely movable joint with synovial fluid','A fixed joint','A slightly movable joint','A joint with no cartilage'], answer: 'A freely movable joint with synovial fluid' },
  { question: 'What is the role of synovial fluid?', options: ['Lubricates the joint and reduces friction','Provides nutrients to bone','Connects bones','Cushions the joint'], answer: 'Lubricates the joint and reduces friction' },
  { question: 'What is a pivot joint?', options: ['A joint that allows rotation (e.g. neck)','A joint that allows movement in one direction','A joint that allows movement in all directions','A fixed joint'], answer: 'A joint that allows rotation (e.g. neck)' },
  { question: 'What is a gliding joint?', options: ['A joint that allows sliding movement (e.g. wrist)','A joint that allows rotation','A joint that allows movement in one direction','A fixed joint'], answer: 'A joint that allows sliding movement (e.g. wrist)' },
  { question: 'What is osteoporosis?', options: ['A condition where bones become weak and brittle due to loss of density','A condition where bones become too dense','A condition where joints become inflamed','A condition where muscles weaken'], answer: 'A condition where bones become weak and brittle due to loss of density' },
  { question: 'What is arthritis?', options: ['Inflammation of joints causing pain and stiffness','Inflammation of muscles','Weakening of bones','Weakening of tendons'], answer: 'Inflammation of joints causing pain and stiffness' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the concept of bone remodelling?', options: ['The continuous process of bone resorption and formation throughout life','The process of bone growth in childhood only','The process of bone repair after fracture only','The process of bone formation in the embryo'], answer: 'The continuous process of bone resorption and formation throughout life' },
  { question: 'What is the role of osteoblasts?', options: ['Cells that form new bone','Cells that break down bone','Cells that maintain bone','Cells that produce cartilage'], answer: 'Cells that form new bone' },
  { question: 'What is the role of osteoclasts?', options: ['Cells that break down bone','Cells that form new bone','Cells that maintain bone','Cells that produce cartilage'], answer: 'Cells that break down bone' },
  { question: 'What is the role of osteocytes?', options: ['Mature bone cells that maintain bone tissue','Cells that form new bone','Cells that break down bone','Cells that produce cartilage'], answer: 'Mature bone cells that maintain bone tissue' },
  { question: 'What is the role of calcium in bone?', options: ['Provides hardness and strength to bone','Provides flexibility to bone','Provides the organic matrix of bone','Provides the blood supply to bone'], answer: 'Provides hardness and strength to bone' },
  { question: 'What is the role of collagen in bone?', options: ['Provides the flexible organic matrix of bone','Provides hardness to bone','Provides the blood supply to bone','Provides the nerve supply to bone'], answer: 'Provides the flexible organic matrix of bone' },
  { question: 'What is the concept of Wolff\'s law?', options: ['Bone adapts its structure in response to mechanical loading','Bone always grows at a constant rate','Bone density is determined only by genetics','Bone remodelling only occurs in childhood'], answer: 'Bone adapts its structure in response to mechanical loading' },
  { question: 'What is the growth plate (epiphyseal plate)?', options: ['A region of cartilage near the ends of long bones where growth occurs','The outer membrane of bone','The inner layer of bone','The joint surface'], answer: 'A region of cartilage near the ends of long bones where growth occurs' },
  { question: 'What is the role of parathyroid hormone (PTH) in bone?', options: ['Increases blood calcium by stimulating bone resorption','Decreases blood calcium by stimulating bone formation','Has no effect on bone','Stimulates bone growth'], answer: 'Increases blood calcium by stimulating bone resorption' },
  { question: 'What is the role of calcitonin in bone?', options: ['Decreases blood calcium by inhibiting bone resorption','Increases blood calcium','Stimulates bone resorption','Has no effect on bone'], answer: 'Decreases blood calcium by inhibiting bone resorption' },
  { question: 'What is the concept of bone mineral density (BMD)?', options: ['A measure of the amount of mineral in bone, used to diagnose osteoporosis','A measure of bone length','A measure of bone flexibility','A measure of bone colour'], answer: 'A measure of the amount of mineral in bone, used to diagnose osteoporosis' },
  { question: 'What is the concept of fracture healing?', options: ['A four-stage process: haematoma, soft callus, hard callus, remodelling','A two-stage process: break and repair','A single-stage process: remodelling','A three-stage process: break, callus, remodelling'], answer: 'A four-stage process: haematoma, soft callus, hard callus, remodelling' },
];

export default function SkeletonBuilderGame() {
  return (
    <>
      <Helmet>
        <title>Skeleton Builder — Sodafom</title>
        <meta name="description" content="Learn about the human skeleton and its bones!" />
        <link rel="canonical" href="https://sodafom.uk/games/skeleton-builder" />
        <meta property="og:title" content="Skeleton Builder — Sodafom" />
        <meta property="og:description" content="Learn about the human skeleton and its bones!" />
        <meta property="og:url" content="https://sodafom.uk/games/skeleton-builder" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Skeleton Builder — Science Game for Kids — Sodafom</h1>
      <GameShell title="Skeleton Builder" emoji="💀" subject="science" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="skeleton-builder"
            title="Skeleton Builder"
            emoji="💀"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
