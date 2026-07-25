"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const REFRESH_MS = 5 * 60 * 1000; // 5 minutes

export default function AutoRefresh({ fetchedAt }) {
  const router = useRouter();
  const [minutesAgo, setMinutesAgo] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => {
      setMinutesAgo(Math.floor((Date.now() - fetchedAt) / 60000));
    }, 30000);
    const refresh = setInterval(() => router.refresh(), REFRESH_MS);
    return () => {
      clearInterval(tick);
      clearInterval(refresh);
    };
  }, [fetchedAt, router]);

  return (
    <div className="live-bar">
      <span className="live-dot" aria-hidden="true" />
      <span>
        Live feed · updated {minutesAgo < 1 ? "just now" : `${minutesAgo}m ago`}
      </span>
    </div>
  );
}
