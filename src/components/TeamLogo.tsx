import React, { useMemo, useState } from "react";
import { flagUrlForTeam } from "../flags";

interface TeamLogoProps {
  teamName: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClassMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12"
};

const getInitials = (teamName: string) => {
  const cleanName = teamName.trim();

  if (!cleanName) return "?";

  const words = cleanName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words.map((word) => word[0]).join("").toUpperCase();
};

const TeamLogo: React.FC<TeamLogoProps> = ({
  teamName,
  className,
  size = "md"
}) => {
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => getInitials(teamName), [teamName]);
  const flagUrl = useMemo(() => flagUrlForTeam(teamName, 80), [teamName]);

  const resolvedClassName = className || sizeClassMap[size];

  if (flagUrl && !failed) {
    return (
      <img
        src={flagUrl}
        alt={teamName}
        title={teamName}
        className={`${resolvedClassName} shrink-0 rounded-full object-cover ring-1 ring-white/10`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${resolvedClassName} flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] shadow-sm ring-1 ring-white/5`}
      title={teamName}
    >
      <span className="text-[10px] font-black text-slate-300">
        {initials}
      </span>
    </div>
  );
};

export default TeamLogo;
