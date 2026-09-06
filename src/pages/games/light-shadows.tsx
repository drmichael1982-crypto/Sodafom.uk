import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is a shadow?', options: ['A dark area where light is blocked','A type of light','A type of reflection','A type of refraction'], answer: 'A dark area where light is blocked' },
  { question: 'What is a transparent material?', options: ['A material that lets light through','A material that blocks light','A material that reflects light','A material that absorbs light'], answer: 'A material that lets light through' },
  { question: 'What is an opaque material?', options: ['A material that blocks light','A material that lets light through','A material that reflects light','A material that absorbs light'], answer: 'A material that blocks light' },
  { question: 'What is a translucent material?', options: ['A material that lets some light through','A material that blocks all light','A material that lets all light through','A material that reflects all light'], answer: 'A material that lets some light through' },
  { question: 'Is glass transparent, translucent, or opaque?', options: ['Transparent','Translucent','Opaque','Reflective'], answer: 'Transparent' },
  { question: 'Is wood transparent, translucent, or opaque?', options: ['Opaque','Transparent','Translucent','Reflective'], answer: 'Opaque' },
  { question: 'Is frosted glass transparent, translucent, or opaque?', options: ['Translucent','Transparent','Opaque','Reflective'], answer: 'Translucent' },
  { question: 'What happens to a shadow when you move closer to a light source?', options: ['It gets bigger','It gets smaller','It stays the same','It disappears'], answer: 'It gets bigger' },
  { question: 'What happens to a shadow when you move further from a light source?', options: ['It gets smaller','It gets bigger','It stays the same','It disappears'], answer: 'It gets smaller' },
  { question: 'What is reflection?', options: ['Light bouncing off a surface','Light passing through a surface','Light being absorbed by a surface','Light bending as it passes through a surface'], answer: 'Light bouncing off a surface' },
  { question: 'What is refraction?', options: ['Light bending as it passes from one medium to another','Light bouncing off a surface','Light being absorbed by a surface','Light passing through a surface'], answer: 'Light bending as it passes from one medium to another' },
  { question: 'What is the speed of light?', options: ['300,000 km/s','30,000 km/s','3,000 km/s','300 km/s'], answer: '300,000 km/s' },
];
const L2: QuizQuestion[] = [
  { question: 'What is the law of reflection?', options: ['Angle of incidence = angle of reflection','Angle of incidence > angle of reflection','Angle of incidence < angle of reflection','Angle of incidence + angle of reflection = 90°'], answer: 'Angle of incidence = angle of reflection' },
  { question: 'What is a concave mirror?', options: ['A mirror that curves inward','A mirror that curves outward','A flat mirror','A mirror that absorbs light'], answer: 'A mirror that curves inward' },
  { question: 'What is a convex mirror?', options: ['A mirror that curves outward','A mirror that curves inward','A flat mirror','A mirror that absorbs light'], answer: 'A mirror that curves outward' },
  { question: 'What is a convex lens?', options: ['A lens that is thicker in the middle','A lens that is thinner in the middle','A flat lens','A lens that absorbs light'], answer: 'A lens that is thicker in the middle' },
  { question: 'What is a concave lens?', options: ['A lens that is thinner in the middle','A lens that is thicker in the middle','A flat lens','A lens that absorbs light'], answer: 'A lens that is thinner in the middle' },
  { question: 'What is dispersion?', options: ['White light splitting into a spectrum of colours','Light bending as it passes through a medium','Light bouncing off a surface','Light being absorbed by a surface'], answer: 'White light splitting into a spectrum of colours' },
  { question: 'What are the colours of the visible spectrum in order?', options: ['Red, orange, yellow, green, blue, indigo, violet','Red, yellow, orange, green, blue, indigo, violet','Violet, indigo, blue, green, yellow, orange, red','Orange, red, yellow, green, blue, indigo, violet'], answer: 'Red, orange, yellow, green, blue, indigo, violet' },
  { question: 'What is a prism used for?', options: ['Dispersing white light into a spectrum','Focusing light','Reflecting light','Absorbing light'], answer: 'Dispersing white light into a spectrum' },
  { question: 'What is total internal reflection?', options: ['Light being reflected back inside a medium when it hits the boundary at a large angle','Light passing through a medium','Light being absorbed by a medium','Light bending as it passes through a medium'], answer: 'Light being reflected back inside a medium when it hits the boundary at a large angle' },
  { question: 'What is the critical angle?', options: ['The angle at which total internal reflection occurs','The angle of incidence','The angle of reflection','The angle of refraction'], answer: 'The angle at which total internal reflection occurs' },
  { question: 'What is a real image?', options: ['An image formed where light rays actually meet','An image formed where light rays appear to meet','An image formed in a mirror','An image formed in a lens'], answer: 'An image formed where light rays actually meet' },
  { question: 'What is a virtual image?', options: ['An image formed where light rays appear to meet','An image formed where light rays actually meet','An image formed in a mirror','An image formed in a lens'], answer: 'An image formed where light rays appear to meet' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the refractive index?', options: ['The ratio of the speed of light in a vacuum to its speed in a medium','The angle of refraction','The angle of incidence','The wavelength of light'], answer: 'The ratio of the speed of light in a vacuum to its speed in a medium' },
  { question: 'What is Snell\'s Law?', options: ['n₁sinθ₁ = n₂sinθ₂','n₁cosθ₁ = n₂cosθ₂','n₁θ₁ = n₂θ₂','n₁/sinθ₁ = n₂/sinθ₂'], answer: 'n₁sinθ₁ = n₂sinθ₂' },
  { question: 'What is the focal length of a lens?', options: ['The distance from the lens to the focal point','The diameter of the lens','The thickness of the lens','The refractive index of the lens'], answer: 'The distance from the lens to the focal point' },
  { question: 'What is the lens formula?', options: ['1/f = 1/v + 1/u','f = v + u','1/f = v + u','f = 1/v + 1/u'], answer: '1/f = 1/v + 1/u' },
  { question: 'What is the power of a lens?', options: ['P = 1/f (measured in dioptres)','P = f (measured in metres)','P = f² (measured in dioptres)','P = 1/f² (measured in dioptres)'], answer: 'P = 1/f (measured in dioptres)' },
  { question: 'What is magnification?', options: ['Image height / object height (or image distance / object distance)','Object height / image height','Image distance / focal length','Object distance / focal length'], answer: 'Image height / object height (or image distance / object distance)' },
  { question: 'What is a penumbra?', options: ['A partial shadow at the edge of a full shadow','A full shadow','A type of reflection','A type of refraction'], answer: 'A partial shadow at the edge of a full shadow' },
  { question: 'What is an umbra?', options: ['A full shadow where no light reaches','A partial shadow','A type of reflection','A type of refraction'], answer: 'A full shadow where no light reaches' },
  { question: 'What is polarisation of light?', options: ['Restricting light waves to vibrate in one plane','Splitting light into colours','Reflecting light','Refracting light'], answer: 'Restricting light waves to vibrate in one plane' },
  { question: 'What is diffraction?', options: ['The spreading of waves as they pass through a gap or around an obstacle','The reflection of waves','The refraction of waves','The absorption of waves'], answer: 'The spreading of waves as they pass through a gap or around an obstacle' },
  { question: 'What is interference of light?', options: ['Superposition of light waves producing bright and dark fringes','Reflection of light','Refraction of light','Diffraction of light'], answer: 'Superposition of light waves producing bright and dark fringes' },
  { question: 'What is the electromagnetic spectrum?', options: ['The range of all electromagnetic radiation from radio waves to gamma rays','The range of visible light only','The range of infrared to ultraviolet','The range of X-rays to gamma rays'], answer: 'The range of all electromagnetic radiation from radio waves to gamma rays' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the wavelength of visible light?', options: ['Approximately 400–700 nm','Approximately 100–400 nm','Approximately 700–1000 nm','Approximately 1–100 nm'], answer: 'Approximately 400–700 nm' },
  { question: 'What is the photoelectric effect?', options: ['Emission of electrons from a metal surface when light shines on it','Emission of light from a metal surface','Absorption of light by a metal','Reflection of light by a metal'], answer: 'Emission of electrons from a metal surface when light shines on it' },
  { question: 'What is a photon?', options: ['A quantum of electromagnetic radiation','A type of electron','A type of atom','A type of wave'], answer: 'A quantum of electromagnetic radiation' },
  { question: 'What is the formula for photon energy?', options: ['E = hf','E = hλ','E = h/f','E = fλ'], answer: 'E = hf' },
  { question: 'What is wave-particle duality?', options: ['Light behaves as both a wave and a particle','Light behaves only as a wave','Light behaves only as a particle','Light has no wave properties'], answer: 'Light behaves as both a wave and a particle' },
  { question: 'What is the double-slit experiment evidence for?', options: ['The wave nature of light (interference pattern)','The particle nature of light','The speed of light','The colour of light'], answer: 'The wave nature of light (interference pattern)' },
  { question: 'What is fluorescence?', options: ['Absorption of UV light and emission of visible light','Absorption of visible light and emission of UV','Reflection of UV light','Refraction of UV light'], answer: 'Absorption of UV light and emission of visible light' },
  { question: 'What is the formula for the speed of light in terms of wavelength and frequency?', options: ['c = fλ','c = f/λ','c = fλ²','c = f²λ'], answer: 'c = fλ' },
  { question: 'What is chromatic aberration?', options: ['Different colours focusing at different points due to dispersion in a lens','A type of reflection error','A type of diffraction error','A type of polarisation error'], answer: 'Different colours focusing at different points due to dispersion in a lens' },
  { question: 'What is the principle of reversibility of light?', options: ['Light follows the same path in reverse','Light always travels in straight lines','Light always reflects at 90°','Light always refracts at 45°'], answer: 'Light follows the same path in reverse' },
  { question: 'What is an optical fibre?', options: ['A thin glass fibre that transmits light by total internal reflection','A type of lens','A type of mirror','A type of prism'], answer: 'A thin glass fibre that transmits light by total internal reflection' },
  { question: 'What is the critical angle for glass (refractive index ~1.5)?', options: ['Approximately 42°','Approximately 30°','Approximately 60°','Approximately 90°'], answer: 'Approximately 42°' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the Michelson-Morley experiment famous for?', options: ['Showing the speed of light is constant regardless of direction','Measuring the speed of light for the first time','Discovering the photoelectric effect','Discovering diffraction of light'], answer: 'Showing the speed of light is constant regardless of direction' },
  { question: 'What is special relativity\'s implication for light?', options: ['The speed of light is the same for all observers','The speed of light depends on the observer\'s speed','Light can travel faster than c','Light slows down in a vacuum'], answer: 'The speed of light is the same for all observers' },
  { question: 'What is the Compton effect?', options: ['Scattering of X-rays by electrons showing photons have momentum','Emission of electrons by light','Absorption of X-rays by atoms','Reflection of X-rays'], answer: 'Scattering of X-rays by electrons showing photons have momentum' },
  { question: 'What is stimulated emission?', options: ['An excited atom emitting a photon identical to an incident photon (basis of lasers)','Spontaneous emission of a photon','Absorption of a photon','Reflection of a photon'], answer: 'An excited atom emitting a photon identical to an incident photon (basis of lasers)' },
  { question: 'What does LASER stand for?', options: ['Light Amplification by Stimulated Emission of Radiation','Light Absorption by Stimulated Emission of Radiation','Light Amplification by Spontaneous Emission of Radiation','Light Absorption by Spontaneous Emission of Radiation'], answer: 'Light Amplification by Stimulated Emission of Radiation' },
  { question: 'What is the Abbe diffraction limit?', options: ['The minimum resolvable feature size in a microscope (~λ/2)','The maximum magnification of a lens','The maximum wavelength of visible light','The minimum focal length of a lens'], answer: 'The minimum resolvable feature size in a microscope (~λ/2)' },
  { question: 'What is holography?', options: ['Recording and reconstructing 3D images using laser interference patterns','A type of photography','A type of microscopy','A type of spectroscopy'], answer: 'Recording and reconstructing 3D images using laser interference patterns' },
  { question: 'What is the Rayleigh criterion?', options: ['The minimum angular separation for two point sources to be resolved','The maximum angle of refraction','The minimum angle of diffraction','The maximum angle of reflection'], answer: 'The minimum angular separation for two point sources to be resolved' },
  { question: 'What is birefringence?', options: ['A material having different refractive indices for different polarisations','A material that absorbs all light','A material that reflects all light','A material that emits light'], answer: 'A material having different refractive indices for different polarisations' },
  { question: 'What is the formula for the de Broglie wavelength?', options: ['λ = h/p','λ = hp','λ = h/E','λ = hE'], answer: 'λ = h/p' },
  { question: 'What is quantum tunnelling?', options: ['A particle passing through a barrier it classically could not overcome','A particle reflecting off a barrier','A particle absorbing a barrier','A particle diffracting around a barrier'], answer: 'A particle passing through a barrier it classically could not overcome' },
  { question: 'What is the Heisenberg uncertainty principle?', options: ['You cannot simultaneously know both position and momentum precisely','You cannot know the speed of light precisely','You cannot know the energy of a photon precisely','You cannot know the wavelength of light precisely'], answer: 'You cannot simultaneously know both position and momentum precisely' },
];

export default function LightShadowsGame() {
  return (
    <>
      <Helmet>
        <title>Light & Shadows — Sodafom</title>
        <meta name="description" content="Discover how light travels and how shadows are formed!" />
        <link rel="canonical" href="https://sodafom.uk/games/light-shadows" />
        <meta property="og:title" content="Light & Shadows — Sodafom" />
        <meta property="og:description" content="Discover how light travels and how shadows are formed!" />
        <meta property="og:url" content="https://sodafom.uk/games/light-shadows" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Light & Shadows — Science Game for Kids — Sodafom</h1>
      <GameShell title="Light & Shadows" emoji="💡" subject="science" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="light-shadows"
            title="Light & Shadows"
            emoji="💡"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
