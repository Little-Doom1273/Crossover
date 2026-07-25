import { XMLParser } from "fast-xml-parser";

// ---- Feed sources ----------------------------------------------------------
// Each league maps to one or more public RSS feeds from reputable outlets.
// "top" is the sport's hub page: a merge of the sport-wide feeds.

export const SPORTS = {
  basketball: {
    label: "Basketball",
    accent: "orange",
    leagues: {
      top: {
        label: "Top Stories",
        feeds: [
          { name: "ESPN", url: "https://www.espn.com/espn/rss/nba/news" },
          { name: "ESPN", url: "https://www.espn.com/espn/rss/wnba/news" },
          { name: "ESPN", url: "https://www.espn.com/espn/rss/ncb/news" },
        ],
      },
      nba: {
        label: "NBA",
        feeds: [{ name: "ESPN", url: "https://www.espn.com/espn/rss/nba/news" }],
      },
      wnba: {
        label: "WNBA",
        feeds: [{ name: "ESPN", url: "https://www.espn.com/espn/rss/wnba/news" }],
      },
      ncaa: {
        label: "NCAA",
        feeds: [{ name: "ESPN", url: "https://www.espn.com/espn/rss/ncb/news" }],
      },
    },
  },
  soccer: {
    label: "Soccer",
    accent: "green",
    leagues: {
      top: {
        label: "Top Stories",
        feeds: [
          { name: "ESPN", url: "https://www.espn.com/espn/rss/soccer/news" },
          { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" },
          { name: "The Guardian", url: "https://www.theguardian.com/football/rss" },
        ],
      },
      "premier-league": {
        label: "Premier League",
        feeds: [
          { name: "The Guardian", url: "https://www.theguardian.com/football/premierleague/rss" },
        ],
      },
      "la-liga": {
        label: "La Liga",
        feeds: [
          { name: "The Guardian", url: "https://www.theguardian.com/football/laligafootball/rss" },
        ],
      },
      "champions-league": {
        label: "Champions League",
        feeds: [
          { name: "The Guardian", url: "https://www.theguardian.com/football/championsleague/rss" },
        ],
      },
      "serie-a": {
        label: "Serie A",
        feeds: [
          { name: "The Guardian", url: "https://www.theguardian.com/football/serieafootball/rss" },
        ],
      },
      mls: {
        label: "MLS",
        feeds: [{ name: "The Guardian", url: "https://www.theguardian.com/football/mls/rss" }],
      },
    },
  },
};

// ---- Fetch + parse ---------------------------------------------------------

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text, max = 220) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

async function fetchFeed({ name, url }) {
  try {
    const res = await fetch(url, {
      // Server-side cache: re-fetch at most every 5 minutes.
      next: { revalidate: 300 },
      headers: { "User-Agent": "CrossoverSportsNews/1.0" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const data = parser.parse(xml);
    const items = data?.rss?.channel?.item ?? [];
    const list = Array.isArray(items) ? items : [items];
    return list.map((item) => ({
      title: stripHtml(item.title ?? ""),
      link: typeof item.link === "string" ? item.link : item.link?.["#text"] ?? "",
      summary: truncate(stripHtml(item.description ?? "")),
      source: name,
      published: item.pubDate ? new Date(item.pubDate).getTime() : 0,
    }));
  } catch {
    // A single dead feed should never take the page down.
    return [];
  }
}

export async function getNews(sportKey, leagueKey = "top") {
  const sport = SPORTS[sportKey];
  const league = sport?.leagues?.[leagueKey];
  if (!league) return { items: [], fetchedAt: Date.now() };

  const results = await Promise.all(league.feeds.map(fetchFeed));
  const merged = results.flat().filter((i) => i.title && i.link);

  // Dedupe by normalized title (same story often appears in multiple feeds).
  const seen = new Set();
  const deduped = merged.filter((item) => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => b.published - a.published);
  return { items: deduped.slice(0, 40), fetchedAt: Date.now() };
}
