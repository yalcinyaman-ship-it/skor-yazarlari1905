import React, { useState } from "react";
import { flagUrlForEmoji } from "../flags";

interface UserFlagProps {
  flagEmoji: string | undefined | null;
  className?: string;
}

const UserFlag: React.FC<UserFlagProps> = ({ flagEmoji, className = "h-8 w-8" }) => {
  const [failed, setFailed] = useState(false);
  const flagUrl = flagUrlForEmoji(flagEmoji, 80);

  if (flagUrl && !failed) {
    return (
      <img
        src={flagUrl}
        alt=""
        className={`${className} shrink-0 rounded-full object-cover ring-1 ring-white/10`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className={`${className} inline-flex shrink-0 items-center justify-center leading-none`}>
      {flagEmoji || "⚽"}
    </span>
  );
};

export default UserFlag;
