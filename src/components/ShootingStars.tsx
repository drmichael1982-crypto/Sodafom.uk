import "./shooting-stars.css";

/** Decorative trails share the scene's pause and reduced-motion controls. */
export default function ShootingStars({ moving = true }: { moving?: boolean }) {
  return (
    <div
      className={`shooting-stars ${moving ? "stars-moving" : ""}`}
      aria-hidden="true"
    >
      {[0, 1, 2].map((index) => (
        <span key={index} className={`shooting-star shooting-star-${index}`} />
      ))}
    </div>
  );
}
