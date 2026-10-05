import { getArchieStage } from "@/lib/archie/age-style";
export default function ArchieAvatar({
  year,
  className = "",
}: {
  year: number;
  className?: string;
}) {
  const stage = getArchieStage(year);
  return (
    <span
      className={"archie-avatar " + className + " archie-age-" + stage}
      role="img"
      aria-label={"Archie, your friendly " + stage + " learning companion"}
    />
  );
}
