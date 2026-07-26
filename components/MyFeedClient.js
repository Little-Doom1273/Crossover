"use client";

import { useEffect, useMemo, useState } from "react";
import { FOLLOWABLE_LEAGUES, filterNewsByFollows } from "../lib/teams";

const STORAGE_KEY = "crossover:myfeed";

function timeLabel(ts) {
  if (!ts) return "";
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MyFeedClient({ allNews }) {
  const [teams, setTeams] = useState([]);
  const [extras, setExtras] = useState([]);
  const [extraInput, setExtraInput] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Load saved follows from this browser's localStorage once, on first render.
  // (localStorage only exists in the browser, so this can't run during
  // server rendering -- it has to happen in an effect.)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setTeams(Array.isArray(saved.teams) ? saved.teams : []);
        setExtras(Array.isArray(saved.extras) ? saved.extras : []);
      }
    } catch {
      // Corrupt or blocked storage -- start empty rather than crash the page.
    }
    setLoaded(true);
  }, []);

  // Save to localStorage whenever follows change, after the initial load.
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ teams, extras }));
    } catch {
      // Storage full or unavailable -- fails quietly; in-memory state still
      // works for the rest of this visit.
    }
  }, [teams, extras, loaded]);

  function toggleTeam(name) {
    setTeams((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  }

  function addExtra() {
    const value = extraInput.trim();
    if (!value) return;
    setExtras((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setExtraInput("");
  }

  function removeExtra(value) {
    setExtras((prev) => prev.filter((e) => e !== value));
  }

  const follows = useMemo(() => ({ teams, extras }), [teams, extras]);
  const matches = useMemo(
    () => filterNewsByFollows(allNews, follows),
    [allNews, follows]
  );
  const hasAnyFollow = teams.length > 0 || extras.length > 0;

  return (
    <div className="my-feed-page">
      <h1 className="sport-title my-feed-title">My Feed</h1>
      <p className="my-feed-intro">
        Pick teams to follow, or add anything else — a player, a college
        team, a club that's not listed. Saved in this browser only.
      </p>

      <div className="follow-picker">
        {Object.entries(FOLLOWABLE_LEAGUES).map(([key, league]) => (
          <div className="follow-group" key={key}>
            <h2 className="follow-group-label">{league.label}</h2>
            <div className="follow-chips">
              {league.teams.map((team) => (
                <button
                  key={team}
                  type="button"
                  className="follow-chip"
                  data-active={teams.includes(team) ? "true" : "false"}
                  onClick={() => toggleTeam(team)}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="follow-group">
          <h2 className="follow-group-label">Anything else</h2>
          <p className="follow-group-hint">
            Players, NCAA teams, Champions League clubs — type a name and
            add it. It'll be matched against headline text.
          </p>
          <div className="follow-add-row">
            <input
              type="text"
              value={extraInput}
              onChange={(e) => setExtraInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addExtra();
              }}
              placeholder="e.g. Duke, Caitlin Clark, PSG"
              className="follow-add-input"
            />
            <button type="button" className="follow-add-btn" onClick={addExtra}>
              Add
            </button>
          </div>
          {extras.length > 0 && (
            <div className="follow-chips">
              {extras.map((extra) => (
                <button
                  key={extra}
                  type="button"
                  className="follow-chip"
                  data-active="true"
                  onClick={() => removeExtra(extra)}
                  title="Remove"
                >
                  {extra} ✕
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="my-feed-results">
        {!loaded ? null : !hasAnyFollow ? (
          <div className="empty-state">
            Pick a team or two above to start seeing stories here.
          </div>
        ) : matches.length === 0 ? (
          <div className="empty-state">
            No stories about your follows right now. The feed refreshes
            automatically — check back soon.
          </div>
        ) : (
          <div className="news-list">
            {matches.map((item) => (
              <a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-item"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className="news-thumb"
                  />
                ) : (
                  <div className="news-thumb news-thumb-placeholder" data-sport={item.sportKey}>
                    {item.sportKey === "basketball" ? "🏀" : "⚽"}
                  </div>
                )}
                <div className="news-item-body">
                  <div className="news-meta" data-sport={item.sportKey}>
                    <span className="sport-dot" aria-hidden="true" />
                    <span>{item.source}</span>
                    <time>{timeLabel(item.published)}</time>
                  </div>
                  <h3>{item.title}</h3>
                  {item.summary && <p>{item.summary}</p>}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
