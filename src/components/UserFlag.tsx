import React, { useState } from "react";
import { flagUrlForEmoji } from "../flags";

interface UserFlagProps {
  flagEmoji: string | undefined | null;
  className?: string;
}

const UserFlag: React.FC<UserFlagProps> = ({ flagEmoji, className = "h-8 w-8" }) => {
  const [failed, setFailed] = React.useState(false);
  const flagUrl = flagUrlForEmoji(flagEmoji, 80);

  React.useEffect(() => {
    setFailed(false);
  }, [flagEmoji]);

  if (flagUrl && !failed) {
    const isSoccerTeam =
      flagEmoji &&
      typeof flagEmoji === "string" &&
      ["GS", "FB", "BJK", "TS", "BŞK", "ADS", "GÖZ", "KSK", "ESES", "BURSA", "SAMSUN"].includes(flagEmoji.trim().toUpperCase());

    return (
      <img
        src={flagUrl}
        alt=""
        referrerPolicy="no-referrer"
        className={`${className} shrink-0 rounded-full ${
          isSoccerTeam
            ? "object-contain bg-white p-0.5 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
            : "object-cover ring-1 ring-white/10"
        }`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  const isLongText = flagEmoji && flagEmoji.length > 2 && !flagEmoji.match(/\p{Emoji}/u);

  return (
    <span
      className={`${className} inline-flex shrink-0 items-center justify-center leading-none text-center ${
        isLongText ? "text-[8px] font-black uppercase tracking-tighter truncate px-1 max-w-full" : ""
      }`}
    >
      {flagEmoji || "⚽"}
    </span>
  );
};

export default UserFlag;
