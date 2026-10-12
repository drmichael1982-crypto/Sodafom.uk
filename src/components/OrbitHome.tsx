import { useEffect, useState, type CSSProperties } from "react";
import { Sparkles } from "lucide-react";
import ArchieAvatar from "@/components/ArchieAvatar";
import PlanetGlobe from "./PlanetGlobe";
import ShootingStars from "./ShootingStars";
import WholeSceneJigsaw from "./WholeSceneJigsaw";
import { useArchieData } from "@/lib/archie/storage";
import "./orbit-home.css";

const PLANETS = [
  {
    name: "Mercury",
    colour: "#ada7a0",
    fact: "Mercury is the closest planet to the Sun.",
  },
  {
    name: "Venus",
    colour: "#e7c582",
    fact: "Venus has a very hot surface and a thick atmosphere.",
  },
  {
    name: "Earth",
    colour: "#50b9de",
    fact: "Earth is our home, with oceans and living things.",
  },
  {
    name: "Mars",
    colour: "#e88362",
    fact: "Mars is a rocky planet often called the Red Planet.",
  },
  {
    name: "Jupiter",
    colour: "#dcbb97",
    fact: "Jupiter is the largest planet in our Solar System.",
  },
  {
    name: "Saturn",
    colour: "#edce89",
    fact: "Saturn has bright rings made of ice and rock.",
  },
  {
    name: "Uranus",
    colour: "#92dce4",
    fact: "Uranus rotates on its side compared with most planets.",
  },
  {
    name: "Neptune",
    colour: "#537be7",
    fact: "Neptune is the farthest planet from the Sun.",
  },
];
export default function OrbitHome({
  autoStart = false,
}: {
  autoStart?: boolean;
}) {
  const { settings } = useArchieData();
  const [selected, setSelected] = useState(2);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  function scene(requestedMotion: boolean) {
    const moving = requestedMotion && !reduced;
    return (
      <div
        className={`orbit-model ${moving ? "is-moving" : "is-still"}`}
        aria-label="Explore the eight planets"
      >
        <div className="orbit-stars" aria-hidden="true" />
        <ShootingStars moving={moving} />
        <div className="orbit-sun" aria-hidden="true" />
        {PLANETS.map((planet, index) => (
          <div
            className={`home-orbit home-orbit-${index}`}
            key={planet.name}
            style={
              {
                "--orbit-size": `${28 + index * 8}%`,
                "--still-angle": `${-16 + 360 * [0, 7 / 27, 19 / 34, 11 / 41, 28 / 48, 9 / 55, 40 / 62, 20 / 69][index]}deg`,
                "--orbit-time": `${20 + index * 7}s`,
                "--planet-colour": planet.colour,
              } as CSSProperties
            }
          >
            <div className="home-orbit-track" aria-hidden="true" />
            <span
              className={`home-planet home-planet-${index}`}
              aria-hidden="true"
            >
              <PlanetGlobe index={index} moving={moving} />
              {index === 2 && (
                <span className="home-moon-orbit">
                  <span className="home-moon" />
                </span>
              )}
            </span>
          </div>
        ))}
        <ArchieAvatar year={settings.year} className="orbit-archie" />
      </div>
    );
  }
  return (
    <section
      className="orbit-home planet-picture-game"
      aria-labelledby="orbit-heading"
      data-home-preview={autoStart}
    >
      <div className="orbit-home-copy">
        <span className="orbit-eyebrow">
          <Sparkles size={16} /> Archie’s space adventure
        </span>
        <h1 id="orbit-heading">Build a whole universe</h1>
        <p>Join every part of the picture, then watch it come to life.</p>
      </div>
      <WholeSceneJigsaw
        reducedMotion={reduced}
        renderScene={scene}
        renderFacts={() => (
          <>
            <label>
              Explore a planet{" "}
              <select
                aria-label="Explore a planet"
                value={selected}
                onChange={(event) => setSelected(Number(event.target.value))}
              >
                {PLANETS.map((planet, index) => (
                  <option key={planet.name} value={index}>
                    {planet.name}
                  </option>
                ))}
              </select>
            </label>
            <p>{PLANETS[selected].fact}</p>
            <p>The Moon orbits Earth while Earth orbits the Sun.</p>
            <small>
              A playful model: sizes, distances and speeds are not to scale.
            </small>
          </>
        )}
      />
    </section>
  );
}
