import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What instrument measures temperature?', options: ['Barometer','Anemometer','Thermometer','Rain gauge'], answer: 'Thermometer' },
  { question: 'What instrument measures wind speed?', options: ['Barometer','Anemometer','Thermometer','Rain gauge'], answer: 'Anemometer' },
  { question: 'What instrument measures air pressure?', options: ['Barometer','Anemometer','Thermometer','Rain gauge'], answer: 'Barometer' },
  { question: 'What instrument measures rainfall?', options: ['Barometer','Anemometer','Thermometer','Rain gauge'], answer: 'Rain gauge' },
  { question: 'What is a weather vane used for?', options: ['Measuring temperature','Measuring rainfall','Showing wind direction','Measuring air pressure'], answer: 'Showing wind direction' },
  { question: 'What is a sunny day?', options: ['A day with lots of clouds','A day with bright sunshine','A day with rain','A day with snow'], answer: 'A day with bright sunshine' },
  { question: 'What is a rainy day?', options: ['A day with sunshine','A day with snow','A day with water falling from clouds','A day with wind'], answer: 'A day with water falling from clouds' },
  { question: 'What is a cloudy day?', options: ['A day with sunshine','A day with lots of clouds in the sky','A day with rain','A day with snow'], answer: 'A day with lots of clouds in the sky' },
  { question: 'What is a windy day?', options: ['A day with sunshine','A day with rain','A day with strong air movement','A day with snow'], answer: 'A day with strong air movement' },
  { question: 'What is a snowy day?', options: ['A day with sunshine','A day with rain','A day with frozen water falling from clouds','A day with wind'], answer: 'A day with frozen water falling from clouds' },
  { question: 'What is fog?', options: ['A type of cloud high in the sky','A cloud at ground level that reduces visibility','A type of rain','A type of wind'], answer: 'A cloud at ground level that reduces visibility' },
  { question: 'What is frost?', options: ['A type of rain','A type of snow','Ice crystals that form on surfaces when temperature drops below 0°C','A type of fog'], answer: 'Ice crystals that form on surfaces when temperature drops below 0°C' },
];
const L2: QuizQuestion[] = [
  { question: 'What causes rain?', options: ['Water evaporates, rises, cools and condenses into clouds, then falls as rain','Wind blowing water from the sea','The Sun melting ice','Cold air rising'], answer: 'Water evaporates, rises, cools and condenses into clouds, then falls as rain' },
  { question: 'What is the water cycle?', options: ['Water flowing in rivers','The continuous movement of water through evaporation, condensation and precipitation','Water being filtered','Water being stored in lakes'], answer: 'The continuous movement of water through evaporation, condensation and precipitation' },
  { question: 'What is precipitation?', options: ['Water evaporating','Water condensing into clouds','Water falling from clouds as rain, snow, sleet or hail','Water flowing in rivers'], answer: 'Water falling from clouds as rain, snow, sleet or hail' },
  { question: 'What causes wind?', options: ['The Moon pulling air','Differences in air pressure','The Sun heating water','Clouds moving'], answer: 'Differences in air pressure' },
  { question: 'What is a cumulus cloud?', options: ['A thin, wispy high cloud','A flat, grey layer cloud','A fluffy, white heap cloud','A dark storm cloud'], answer: 'A fluffy, white heap cloud' },
  { question: 'What is climate?', options: ['The weather today','The average weather conditions over a long period','A type of storm','A weather instrument'], answer: 'The average weather conditions over a long period' },
  { question: 'What is the greenhouse effect?', options: ['Growing plants in a greenhouse','The trapping of heat in Earth\'s atmosphere by gases','A type of weather','A type of cloud'], answer: 'The trapping of heat in Earth\'s atmosphere by gases' },
  { question: 'What is a stratus cloud?', options: ['A fluffy, white heap cloud','A thin, wispy high cloud','A flat, grey layer cloud','A dark storm cloud'], answer: 'A flat, grey layer cloud' },
  { question: 'What is a cirrus cloud?', options: ['A fluffy, white heap cloud','A thin, wispy high cloud','A flat, grey layer cloud','A dark storm cloud'], answer: 'A thin, wispy high cloud' },
  { question: 'What is a cumulonimbus cloud?', options: ['A fluffy, white heap cloud','A thin, wispy high cloud','A flat, grey layer cloud','A large, dark storm cloud'], answer: 'A large, dark storm cloud' },
  { question: 'What is climate change?', options: ['The weather changing from day to day','Long-term shifts in global temperatures and weather patterns','A type of storm','A type of cloud'], answer: 'Long-term shifts in global temperatures and weather patterns' },
  { question: 'What is the Beaufort scale?', options: ['A scale for measuring temperature','A scale for measuring wind speed','A scale for measuring rainfall','A scale for measuring air pressure'], answer: 'A scale for measuring wind speed' },
];
const L3: QuizQuestion[] = [
  { question: 'What is a depression (low pressure system)?', options: ['An area of low atmospheric pressure bringing cloud and rain','An area of high atmospheric pressure','A type of cloud','A type of wind'], answer: 'An area of low atmospheric pressure bringing cloud and rain' },
  { question: 'What is an anticyclone (high pressure system)?', options: ['An area of high atmospheric pressure bringing clear, settled weather','An area of low atmospheric pressure','A type of cloud','A type of wind'], answer: 'An area of high atmospheric pressure bringing clear, settled weather' },
  { question: 'What is a warm front?', options: ['Where warm air rises over cold air, bringing cloud and rain','Where cold air undercuts warm air','A boundary between two air masses of the same temperature','A type of anticyclone'], answer: 'Where warm air rises over cold air, bringing cloud and rain' },
  { question: 'What is a cold front?', options: ['Where cold air undercuts warm air, bringing heavy rain and thunderstorms','Where warm air rises over cold air','A boundary between two air masses of the same temperature','A type of anticyclone'], answer: 'Where cold air undercuts warm air, bringing heavy rain and thunderstorms' },
  { question: 'What is an occluded front?', options: ['Where a cold front catches up with a warm front','Where two warm fronts meet','Where two cold fronts meet','A type of anticyclone'], answer: 'Where a cold front catches up with a warm front' },
  { question: 'What is the Coriolis effect?', options: ['The deflection of winds due to Earth\'s rotation','The effect of the Sun on wind speed','The effect of mountains on wind direction','The effect of the sea on wind speed'], answer: 'The deflection of winds due to Earth\'s rotation' },
  { question: 'What is the trade wind?', options: ['Steady winds blowing towards the equator from the subtropics','Winds blowing away from the equator','Winds blowing from west to east','Winds blowing from east to west at high latitudes'], answer: 'Steady winds blowing towards the equator from the subtropics' },
  { question: 'What is the jet stream?', options: ['A fast-moving band of air in the upper atmosphere','A type of storm','A type of cloud','A type of precipitation'], answer: 'A fast-moving band of air in the upper atmosphere' },
  { question: 'What is a monsoon?', options: ['A seasonal reversal of wind direction bringing heavy rainfall','A type of storm','A type of cloud','A type of anticyclone'], answer: 'A seasonal reversal of wind direction bringing heavy rainfall' },
  { question: 'What is a hurricane (tropical cyclone)?', options: ['A large rotating storm system forming over warm tropical oceans','A type of cold front','A type of anticyclone','A type of jet stream'], answer: 'A large rotating storm system forming over warm tropical oceans' },
  { question: 'What is the Saffir-Simpson scale?', options: ['A scale measuring hurricane intensity','A scale measuring tornado intensity','A scale measuring earthquake magnitude','A scale measuring wind speed'], answer: 'A scale measuring hurricane intensity' },
  { question: 'What is a tornado?', options: ['A violently rotating column of air extending from a thunderstorm to the ground','A type of hurricane','A type of cold front','A type of anticyclone'], answer: 'A violently rotating column of air extending from a thunderstorm to the ground' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the general circulation of the atmosphere?', options: ['The global pattern of winds driven by differential heating and Earth\'s rotation','The local wind patterns','The jet stream only','The trade winds only'], answer: 'The global pattern of winds driven by differential heating and Earth\'s rotation' },
  { question: 'What is a Hadley cell?', options: ['A large atmospheric circulation cell between the equator and ~30° latitude','A circulation cell between 30° and 60° latitude','A circulation cell between 60° and 90° latitude','A type of jet stream'], answer: 'A large atmospheric circulation cell between the equator and ~30° latitude' },
  { question: 'What is a Ferrel cell?', options: ['A mid-latitude atmospheric circulation cell between ~30° and 60° latitude','A circulation cell between the equator and 30° latitude','A circulation cell between 60° and 90° latitude','A type of jet stream'], answer: 'A mid-latitude atmospheric circulation cell between ~30° and 60° latitude' },
  { question: 'What is a Polar cell?', options: ['An atmospheric circulation cell between ~60° and 90° latitude','A circulation cell between the equator and 30° latitude','A circulation cell between 30° and 60° latitude','A type of jet stream'], answer: 'An atmospheric circulation cell between ~60° and 90° latitude' },
  { question: 'What is the ITCZ (Intertropical Convergence Zone)?', options: ['A band of low pressure near the equator where trade winds converge','A band of high pressure near the equator','A type of jet stream','A type of monsoon'], answer: 'A band of low pressure near the equator where trade winds converge' },
  { question: 'What is the concept of teleconnections in weather?', options: ['Climate patterns in one region affecting weather in distant regions','Direct connections between weather systems','Underground connections between weather systems','Connections between weather and ocean currents'], answer: 'Climate patterns in one region affecting weather in distant regions' },
  { question: 'What is the North Atlantic Oscillation (NAO)?', options: ['A pattern of pressure differences between Iceland and the Azores affecting European weather','A type of hurricane','A type of jet stream','A type of monsoon'], answer: 'A pattern of pressure differences between Iceland and the Azores affecting European weather' },
  { question: 'What is the concept of numerical weather prediction?', options: ['Using mathematical models of the atmosphere to forecast weather','Using historical data to forecast weather','Using satellite images to forecast weather','Using weather stations to forecast weather'], answer: 'Using mathematical models of the atmosphere to forecast weather' },
  { question: 'What is the concept of ensemble forecasting?', options: ['Running multiple weather models with slightly different initial conditions to estimate forecast uncertainty','Running a single weather model multiple times','Using multiple weather stations','Using multiple satellites'], answer: 'Running multiple weather models with slightly different initial conditions to estimate forecast uncertainty' },
  { question: 'What is the concept of chaos theory in weather forecasting?', options: ['Small changes in initial conditions can lead to very different outcomes (butterfly effect)','Weather is completely predictable','Weather follows simple patterns','Weather is random'], answer: 'Small changes in initial conditions can lead to very different outcomes (butterfly effect)' },
  { question: 'What is the concept of atmospheric rivers?', options: ['Narrow bands of concentrated moisture in the atmosphere that can cause extreme rainfall','Rivers of air in the upper atmosphere','A type of jet stream','A type of monsoon'], answer: 'Narrow bands of concentrated moisture in the atmosphere that can cause extreme rainfall' },
  { question: 'What is the concept of heat islands?', options: ['Urban areas that are significantly warmer than surrounding rural areas','Islands in tropical oceans','Areas of high pressure','Areas of low pressure'], answer: 'Urban areas that are significantly warmer than surrounding rural areas' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the concept of the quasi-biennial oscillation (QBO)?', options: ['A periodic reversal of equatorial stratospheric winds every ~28 months','A periodic reversal of surface winds','A periodic reversal of ocean currents','A periodic reversal of the jet stream'], answer: 'A periodic reversal of equatorial stratospheric winds every ~28 months' },
  { question: 'What is the concept of the Madden-Julian Oscillation (MJO)?', options: ['A 30–60 day cycle of enhanced and suppressed tropical rainfall moving eastward','A cycle of El Niño and La Niña','A cycle of monsoon rainfall','A cycle of hurricane activity'], answer: 'A 30–60 day cycle of enhanced and suppressed tropical rainfall moving eastward' },
  { question: 'What is the concept of potential vorticity?', options: ['A conserved quantity in atmospheric dynamics that helps explain jet stream behaviour','The rotation of a tornado','The rotation of a hurricane','The rotation of the Earth'], answer: 'A conserved quantity in atmospheric dynamics that helps explain jet stream behaviour' },
  { question: 'What is the concept of the omega block?', options: ['A persistent high-pressure system that blocks the normal westerly flow','A type of low-pressure system','A type of cold front','A type of warm front'], answer: 'A persistent high-pressure system that blocks the normal westerly flow' },
  { question: 'What is the concept of convective available potential energy (CAPE)?', options: ['A measure of the energy available for thunderstorm development','A measure of wind speed','A measure of rainfall intensity','A measure of air pressure'], answer: 'A measure of the energy available for thunderstorm development' },
  { question: 'What is the concept of wind shear?', options: ['The change in wind speed or direction with height, important for tornado and hurricane formation','The speed of the wind','The direction of the wind','The temperature of the wind'], answer: 'The change in wind speed or direction with height, important for tornado and hurricane formation' },
  { question: 'What is the concept of the tropopause?', options: ['The boundary between the troposphere and stratosphere where temperature stops decreasing with height','The boundary between the stratosphere and mesosphere','The top of the atmosphere','The boundary between the mesosphere and thermosphere'], answer: 'The boundary between the troposphere and stratosphere where temperature stops decreasing with height' },
  { question: 'What is the concept of radiative forcing?', options: ['The change in energy flux in the atmosphere due to natural or anthropogenic factors','The force of solar radiation on the atmosphere','The force of wind on the atmosphere','The force of gravity on the atmosphere'], answer: 'The change in energy flux in the atmosphere due to natural or anthropogenic factors' },
  { question: 'What is the concept of climate sensitivity?', options: ['The equilibrium temperature rise for a doubling of CO₂ concentration','The rate of temperature change per year','The maximum temperature the Earth can reach','The minimum temperature the Earth can reach'], answer: 'The equilibrium temperature rise for a doubling of CO₂ concentration' },
  { question: 'What is the concept of tipping points in the climate system?', options: ['Thresholds beyond which a component of the climate system undergoes irreversible change','Points where climate change stops','Points where climate change accelerates linearly','Points where climate change reverses'], answer: 'Thresholds beyond which a component of the climate system undergoes irreversible change' },
  { question: 'What is the concept of the global energy balance?', options: ['The balance between incoming solar radiation and outgoing terrestrial radiation','The balance between wind energy and solar energy','The balance between ocean heat and atmospheric heat','The balance between ice and water'], answer: 'The balance between incoming solar radiation and outgoing terrestrial radiation' },
  { question: 'What is the concept of the albedo feedback?', options: ['Melting ice reduces albedo, causing more warming, which melts more ice','Melting ice increases albedo, causing cooling','Albedo has no effect on temperature','Albedo only affects ocean temperature'], answer: 'Melting ice reduces albedo, causing more warming, which melts more ice' },
];

export default function WeatherWatchGame() {
  return (
    <>
      <Helmet>
        <title>Weather Watch — Sodafom</title>
        <meta name="description" content="Learn about weather patterns, clouds, and climate!" />
        <link rel="canonical" href="https://sodafom.uk/games/weather-watch" />
        <meta property="og:title" content="Weather Watch — Sodafom" />
        <meta property="og:description" content="Learn about weather patterns, clouds, and climate!" />
        <meta property="og:url" content="https://sodafom.uk/games/weather-watch" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Weather Watch — Science Game for Kids — Sodafom</h1>
      <GameShell title="Weather Watch" emoji="⛅" subject="science" ageGroups={['5–7', '7–9']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="weather-watch"
            title="Weather Watch"
            emoji="⛅"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
