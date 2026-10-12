import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is sound?', options: ['Vibrations that travel through a medium','A type of light','A type of heat','A type of electricity'], answer: 'Vibrations that travel through a medium' },
  { question: 'Can sound travel through a vacuum?', options: ['No','Yes'], answer: 'No' },
  { question: 'What is the unit of loudness?', options: ['Decibel (dB)','Hertz (Hz)','Newton (N)','Joule (J)'], answer: 'Decibel (dB)' },
  { question: 'What is the unit of frequency?', options: ['Hertz (Hz)','Decibel (dB)','Newton (N)','Joule (J)'], answer: 'Hertz (Hz)' },
  { question: 'What is pitch?', options: ['How high or low a sound is','How loud a sound is','How fast a sound travels','How far a sound travels'], answer: 'How high or low a sound is' },
  { question: 'What is amplitude?', options: ['The size of a vibration (related to loudness)','The frequency of a vibration','The speed of a vibration','The pitch of a vibration'], answer: 'The size of a vibration (related to loudness)' },
  { question: 'Does sound travel faster in air or water?', options: ['Water','Air'], answer: 'Water' },
  { question: 'Does sound travel faster in solids or gases?', options: ['Solids','Gases'], answer: 'Solids' },
  { question: 'What is an echo?', options: ['A reflected sound','A type of vibration','A type of frequency','A type of amplitude'], answer: 'A reflected sound' },
  { question: 'What is ultrasound?', options: ['Sound above 20,000 Hz (too high for humans to hear)','Sound below 20 Hz','Sound at exactly 20,000 Hz','Sound that travels very fast'], answer: 'Sound above 20,000 Hz (too high for humans to hear)' },
  { question: 'What is infrasound?', options: ['Sound below 20 Hz (too low for humans to hear)','Sound above 20,000 Hz','Sound at exactly 20 Hz','Sound that travels very slowly'], answer: 'Sound below 20 Hz (too low for humans to hear)' },
  { question: 'What is the approximate speed of sound in air?', options: ['340 m/s','3,400 m/s','34 m/s','3,000,000 m/s'], answer: '340 m/s' },
];
const L2: QuizQuestion[] = [
  { question: 'What is the Doppler effect?', options: ['The change in frequency of a wave as the source moves','The change in amplitude of a wave','The change in speed of a wave','The change in wavelength of a wave'], answer: 'The change in frequency of a wave as the source moves' },
  { question: 'What is resonance?', options: ['When an object vibrates at its natural frequency','When sound is reflected','When sound is absorbed','When sound is refracted'], answer: 'When an object vibrates at its natural frequency' },
  { question: 'What is the relationship between frequency and pitch?', options: ['Higher frequency = higher pitch','Higher frequency = lower pitch','Frequency does not affect pitch','Higher frequency = louder sound'], answer: 'Higher frequency = higher pitch' },
  { question: 'What is the relationship between amplitude and loudness?', options: ['Higher amplitude = louder sound','Higher amplitude = quieter sound','Amplitude does not affect loudness','Higher amplitude = higher pitch'], answer: 'Higher amplitude = louder sound' },
  { question: 'What is the wavelength of a sound wave?', options: ['The distance between two consecutive compressions','The height of a sound wave','The frequency of a sound wave','The speed of a sound wave'], answer: 'The distance between two consecutive compressions' },
  { question: 'What is the formula relating wave speed, frequency and wavelength?', options: ['v = fλ','v = f/λ','v = f+λ','v = f-λ'], answer: 'v = fλ' },
  { question: 'If frequency = 500 Hz and wavelength = 0.68 m, what is the wave speed?', options: ['340 m/s','500 m/s','0.68 m/s','1000 m/s'], answer: '340 m/s' },
  { question: 'What is a longitudinal wave?', options: ['A wave where particles vibrate parallel to the direction of travel','A wave where particles vibrate perpendicular to the direction of travel','A wave that travels in a vacuum','A wave that cannot be reflected'], answer: 'A wave where particles vibrate parallel to the direction of travel' },
  { question: 'Is sound a longitudinal or transverse wave?', options: ['Longitudinal','Transverse','Both','Neither'], answer: 'Longitudinal' },
  { question: 'What is a compression in a sound wave?', options: ['A region of high pressure','A region of low pressure','A region of zero pressure','A region of constant pressure'], answer: 'A region of high pressure' },
  { question: 'What is a rarefaction in a sound wave?', options: ['A region of low pressure','A region of high pressure','A region of zero pressure','A region of constant pressure'], answer: 'A region of low pressure' },
  { question: 'What is the range of human hearing?', options: ['20 Hz to 20,000 Hz','20 Hz to 2,000 Hz','200 Hz to 20,000 Hz','2 Hz to 200,000 Hz'], answer: '20 Hz to 20,000 Hz' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the speed of sound in water (approximately)?', options: ['1,500 m/s','340 m/s','5,000 m/s','100 m/s'], answer: '1,500 m/s' },
  { question: 'What is the speed of sound in steel (approximately)?', options: ['5,000 m/s','340 m/s','1,500 m/s','100 m/s'], answer: '5,000 m/s' },
  { question: 'What is the formula for the period of a wave?', options: ['T = 1/f','T = f','T = fλ','T = λ/f'], answer: 'T = 1/f' },
  { question: 'If frequency = 200 Hz, what is the period?', options: ['0.005 s','200 s','0.5 s','5 s'], answer: '0.005 s' },
  { question: 'What is a standing wave?', options: ['A wave that appears stationary due to interference of two waves','A wave that travels in one direction','A wave that is reflected','A wave that is absorbed'], answer: 'A wave that appears stationary due to interference of two waves' },
  { question: 'What is a node in a standing wave?', options: ['A point of zero amplitude','A point of maximum amplitude','A point of maximum frequency','A point of maximum speed'], answer: 'A point of zero amplitude' },
  { question: 'What is an antinode in a standing wave?', options: ['A point of maximum amplitude','A point of zero amplitude','A point of maximum frequency','A point of maximum speed'], answer: 'A point of maximum amplitude' },
  { question: 'What is the fundamental frequency?', options: ['The lowest frequency at which a standing wave can form','The highest frequency','The average frequency','The frequency of the first harmonic only'], answer: 'The lowest frequency at which a standing wave can form' },
  { question: 'What is a harmonic?', options: ['A frequency that is a whole number multiple of the fundamental','A frequency that is half the fundamental','A frequency that is unrelated to the fundamental','A frequency that is the same as the fundamental'], answer: 'A frequency that is a whole number multiple of the fundamental' },
  { question: 'What is the formula for the fundamental frequency of a string?', options: ['f = v/2L','f = v/L','f = 2v/L','f = vL/2'], answer: 'f = v/2L' },
  { question: 'What is acoustic impedance?', options: ['The resistance of a medium to the passage of sound waves','The speed of sound in a medium','The frequency of sound in a medium','The amplitude of sound in a medium'], answer: 'The resistance of a medium to the passage of sound waves' },
  { question: 'What is the inverse square law for sound intensity?', options: ['Intensity decreases with the square of distance from the source','Intensity decreases linearly with distance','Intensity is constant with distance','Intensity increases with distance'], answer: 'Intensity decreases with the square of distance from the source' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the formula for sound intensity level in decibels?', options: ['L = 10 log(I/I₀)','L = log(I/I₀)','L = 10 log(I × I₀)','L = 20 log(I/I₀)'], answer: 'L = 10 log(I/I₀)' },
  { question: 'What is the threshold of hearing?', options: ['10⁻¹² W/m² (the quietest sound a human can hear)','10⁻⁶ W/m²','1 W/m²','10⁻³ W/m²'], answer: '10⁻¹² W/m² (the quietest sound a human can hear)' },
  { question: 'What is the threshold of pain?', options: ['About 120 dB','About 60 dB','About 0 dB','About 200 dB'], answer: 'About 120 dB' },
  { question: 'What is the Doppler formula for a moving source?', options: ['f\' = f(v/(v ± vs))','f\' = f(v ± vs)/v','f\' = f × vs/v','f\' = f + vs'], answer: 'f\' = f(v/(v ± vs))' },
  { question: 'What is a sonic boom?', options: ['The shock wave produced when an object travels faster than sound','A very loud sound','A type of echo','A type of resonance'], answer: 'The shock wave produced when an object travels faster than sound' },
  { question: 'What is the Mach number?', options: ['The ratio of an object\'s speed to the speed of sound','The ratio of sound speed to light speed','The frequency of a sonic boom','The amplitude of a sonic boom'], answer: 'The ratio of an object\'s speed to the speed of sound' },
  { question: 'What is acoustic resonance?', options: ['When a sound wave drives an object to vibrate at its natural frequency','When sound is reflected','When sound is absorbed','When sound is refracted'], answer: 'When a sound wave drives an object to vibrate at its natural frequency' },
  { question: 'What is the cochlea?', options: ['The spiral-shaped part of the inner ear that converts sound to nerve signals','The outer ear','The eardrum','The middle ear bones'], answer: 'The spiral-shaped part of the inner ear that converts sound to nerve signals' },
  { question: 'What is the role of the ossicles?', options: ['Three small bones in the middle ear that amplify sound vibrations','The outer ear','The cochlea','The auditory nerve'], answer: 'Three small bones in the middle ear that amplify sound vibrations' },
  { question: 'What is the concept of beats?', options: ['Periodic variations in loudness when two slightly different frequencies interfere','A type of echo','A type of resonance','A type of standing wave'], answer: 'Periodic variations in loudness when two slightly different frequencies interfere' },
  { question: 'What is the beat frequency?', options: ['The difference between two interfering frequencies','The sum of two interfering frequencies','The average of two interfering frequencies','The product of two interfering frequencies'], answer: 'The difference between two interfering frequencies' },
  { question: 'What is the concept of timbre (tone quality)?', options: ['The characteristic sound quality determined by the mix of harmonics','The loudness of a sound','The pitch of a sound','The speed of a sound'], answer: 'The characteristic sound quality determined by the mix of harmonics' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the concept of phonons?', options: ['Quantised vibrations of atoms in a crystal lattice that carry sound','Quantised light particles','Quantised magnetic fields','Quantised electric fields'], answer: 'Quantised vibrations of atoms in a crystal lattice that carry sound' },
  { question: 'What is the concept of acoustic metamaterials?', options: ['Engineered materials that can control, direct and manipulate sound in unusual ways','Natural materials that absorb sound','Natural materials that reflect sound','Materials that amplify sound'], answer: 'Engineered materials that can control, direct and manipulate sound in unusual ways' },
  { question: 'What is the concept of acoustic cloaking?', options: ['Using metamaterials to make an object acoustically invisible','Using materials to absorb all sound','Using materials to reflect all sound','Using materials to amplify sound'], answer: 'Using metamaterials to make an object acoustically invisible' },
  { question: 'What is the concept of nonlinear acoustics?', options: ['Sound behaviour at high amplitudes where superposition no longer holds','Sound behaviour at low amplitudes','Sound behaviour in a vacuum','Sound behaviour at high frequencies'], answer: 'Sound behaviour at high amplitudes where superposition no longer holds' },
  { question: 'What is acoustic levitation?', options: ['Using standing sound waves to suspend small objects in mid-air','Using sound to move objects horizontally','Using sound to heat objects','Using sound to cool objects'], answer: 'Using standing sound waves to suspend small objects in mid-air' },
  { question: 'What is the concept of phononic crystals?', options: ['Periodic structures that control the propagation of sound waves','Natural crystals that produce sound','Materials that absorb all sound','Materials that reflect all sound'], answer: 'Periodic structures that control the propagation of sound waves' },
  { question: 'What is the concept of acoustic emission?', options: ['Sound waves produced by rapid stress changes in materials (used in non-destructive testing)','Sound waves produced by vibrating strings','Sound waves produced by loudspeakers','Sound waves produced by musical instruments'], answer: 'Sound waves produced by rapid stress changes in materials (used in non-destructive testing)' },
  { question: 'What is the concept of binaural hearing?', options: ['Using two ears to localise the direction of a sound source','Hearing with one ear only','Hearing at very high frequencies','Hearing at very low frequencies'], answer: 'Using two ears to localise the direction of a sound source' },
  { question: 'What is the concept of the precedence effect?', options: ['The first-arriving sound determines the perceived direction, even if a later echo is louder','The loudest sound determines the perceived direction','The highest-pitched sound determines the perceived direction','The lowest-pitched sound determines the perceived direction'], answer: 'The first-arriving sound determines the perceived direction, even if a later echo is louder' },
  { question: 'What is the concept of room acoustics?', options: ['The study of how sound behaves in enclosed spaces (reflection, absorption, diffusion)','The study of outdoor sound propagation','The study of sound in water','The study of sound in space'], answer: 'The study of how sound behaves in enclosed spaces (reflection, absorption, diffusion)' },
  { question: 'What is the reverberation time (RT60)?', options: ['The time for sound to decay by 60 dB after the source stops','The time for sound to travel 60 metres','The time for sound to double in intensity','The time for sound to halve in intensity'], answer: 'The time for sound to decay by 60 dB after the source stops' },
  { question: 'What is the concept of psychoacoustics?', options: ['The study of the psychological and physiological responses to sound','The study of sound physics','The study of sound production','The study of sound recording'], answer: 'The study of the psychological and physiological responses to sound' },
];

export default function SoundScienceGame() {
  return (
    <>
      <Helmet>
        <title>Sound Science — Sodafom</title>
        <meta name="description" content="Discover how sound travels and how we hear!" />
        <link rel="canonical" href="https://sodafom.uk/games/sound-science" />
        <meta property="og:title" content="Sound Science — Sodafom" />
        <meta property="og:description" content="Discover how sound travels and how we hear!" />
        <meta property="og:url" content="https://sodafom.uk/games/sound-science" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Sound Science — Science Game for Kids — Sodafom</h1>
      <GameShell title="Sound Science" emoji="🔊" subject="science" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="sound-science"
            title="Sound Science"
            emoji="🔊"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
