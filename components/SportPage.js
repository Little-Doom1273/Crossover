import Link from "next/link";
import { SPORTS, getNews } from "../lib/news";
import AutoRefresh from "./AutoRefresh";

function timeLabel(ts) {
  if (!ts) return "";
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function SportPage({ sportKey, leagueKey = "top" }) {
  const sport = SPORTS[sportKey];
  const { items, fetchedAt } = await getNews(sportKey, leagueKey);
  const leagueEntries = Object.entries(sport.leagues);
  const [first, ...rest] = sport.label;

  return (
    <div className="sport-page" data-accent={sport.accent}>
      <h1 className="sport-title">
        <span>{first}</span>
        {rest.join("")}
      </h1>
      <AutoRefresh fetchedAt={fetchedAt} />

      <nav className="league-tabs" aria-label={`${sport.label} leagues`}>
        {leagueEntries.map(([key, league]) => (
          <Link
            key={key}
            href={key === "top" ? `/${sportKey}` : `/${sportKey}/${key}`}
            className="league-tab"
            data-active={key === leagueKey ? "true" : "false"}
          >
            {league.label}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <div className="empty-state">
          No stories loaded right now. The feed refreshes automatically —
          check back in a few minutes.
        </div>
      ) : (
        <div className="news-list">
          {items.map((item) => (
            <a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="news-item"
            >
              <div className="news-meta">
                <span>{item.source}</span>
                <time>{timeLabel(item.published)}</time>
              </div>
              <h3>{item.title}</h3>
              {item.summary && <p>{item.summary}</p>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
