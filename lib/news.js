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
          // The Guardian blocks datacenter RSS fetches, so their content
          // comes through their official Content API instead (requires
          // GUARDIAN_API_KEY; silently skipped if absent).
          { name: "The Guardian", guardianSection: "football" },
          // Transfer stories are tagged "transfer-window" at the Guardian,
          // usually NOT with a league tag -- without this feed, the single
          // biggest category of offseason news never reaches the site.
          { name: "The Guardian", guardianSection: "football/transfer-window" },
        ],
      },
      transfers: {
        label: "Transfers",
        feeds: [
          { name: "The Guardian", guardianSection: "football/transfer-window" },
        ],
      },
      "premier-league": {
        label: "Premier League",
        feeds: [
          // Verified live and current as of adding it.
          { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/football/premier-league/rss.xml" },
          { name: "The Guardian", guardianSection: "football/premierleague" },
        ],
      },
      "la-liga": {
        label: "La Liga",
        feeds: [
          // Best-guess BBC slug: if it 404s, it contributes nothing and
          // the Guardian feed still carries the tab (harmless either way).
          { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/football/spanish-la-liga/rss.xml" },
          { name: "The Guardian", guardianSection: "football/laligafootball" },
        ],
      },
      "champions-league": {
        label: "Champions League",
        feeds: [
          { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/football/champions-league/rss.xml" },
          { name: "The Guardian", guardianSection: "football/championsleague" },
        ],
      },
      "serie-a": {
        label: "Serie A",
        feeds: [
          { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/football/italian-serie-a/rss.xml" },
          { name: "The Guardian", guardianSection: "football/serieafootball" },
        ],
      },
      mls: {
        label: "MLS",
        feeds: [{ name: "The Guardian", guardianSection: "football/mls" }],
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

// RSS outlets attach images in different (non-standard) ways. This checks
// the common ones in order and returns the first URL it finds, or null if
// the feed simply doesn't include one for this item -- which, notably, ESPN's
// feeds never do. There's no title/description fallback: ESPN's descriptions
// are plain text with no embedded <img> to fall back to.
function extractImage(item) {
  const thumb = item["media:thumbnail"];
  if (thumb) {
    const entry = Array.isArray(thumb) ? thumb[0] : thumb;
    if (entry?.["@_url"]) return entry["@_url"];
  }

  const content = item["media:content"];
  if (content) {
    const list = Array.isArray(content) ? content : [content];
    const found = list.find((m) => m?.["@_url"]);
    if (found) return found["@_url"];
  }

  const enclosure = item.enclosure;
  if (enclosure) {
    const entry = Array.isArray(enclosure) ? enclosure[0] : enclosure;
    const type = entry?.["@_type"] || "";
    if (entry?.["@_url"] && type.startsWith("image")) return entry["@_url"];
  }

  return null;
}

// Some feeds (ESPN notably) bulk re-stamp many items with the feed's own
// rebuild time instead of each article's real publish time -- we've seen
// nine different articles carrying an identical to-the-second pubDate.
// Genuinely distinct articles virtually never share an exact timestamp,
// so 3+ items with the same raw pubDate string in one feed means those
// stamps are rebuild times, not publish times. Those items get
// timeReliable: false; the UI hides their time label (no time is better
// than a wrong one) and the Top 10 skips their freshness bonus.
export function markUnreliableTimestamps(items) {
  const counts = new Map();
  for (const item of items) {
    if (!item.rawPubDate) continue;
    counts.set(item.rawPubDate, (counts.get(item.rawPubDate) || 0) + 1);
  }
  return items.map(({ rawPubDate, ...rest }) => ({
    ...rest,
    timeReliable: rawPubDate ? (counts.get(rawPubDate) || 0) < 3 : false,
  }));
}

// ESPN and BBC accept a transparent bot identity (and ESPN actively
// rejects browser-UA requests from datacenters as spoofing), so all
// RSS fetches use the honest one.
const BOT_HEADERS = {
  "User-Agent": "CrossoverSportsNews/1.0",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
};

// ---- The Guardian (official Content API) ----------------------------------
// Their servers block datacenter RSS fetches, so Guardian content comes
// through their free developer API. Response shape:
// { response: { results: [{ webTitle, webUrl, webPublicationDate,
//   fields: { trailText, thumbnail } }] } }
// webPublicationDate is a genuine per-article time, so these items are
// always timeReliable.

export function mapGuardianResults(data, name = "The Guardian") {
  const results = data?.response?.results ?? [];
  return results
    .map((r) => ({
      title: stripHtml(r.webTitle ?? ""),
      link: r.webUrl ?? "",
      summary: truncate(stripHtml(r.fields?.trailText ?? "")),
      image: r.fields?.thumbnail || null,
      source: name,
      published: r.webPublicationDate ? new Date(r.webPublicationDate).getTime() : 0,
      timeReliable: Boolean(r.webPublicationDate),
    }))
    .filter((item) => item.title && item.link);
}

async function fetchGuardianFeed({ name, guardianSection }) {
  const apiKey = process.env.GUARDIAN_API_KEY?.trim();
  if (!apiKey) return []; // Not configured yet -- skip quietly.
  try {
    const url =
      `https://content.guardianapis.com/${guardianSection}` +
      `?api-key=${apiKey}&show-fields=trailText,thumbnail&page-size=20&order-by=newest`;
    const res = await fetch(url, {
      // 20 minutes, not 5: the free developer key has a daily request
      // allowance, and six Guardian sections refreshing every 5 minutes
      // could exceed it on a busy day. Slightly staler Guardian items is
      // the safe trade.
      next: { revalidate: 1200 },
    });
    if (!res.ok) {
      console.error(`Guardian API returned ${res.status} for ${guardianSection}`);
      return [];
    }
    const data = await res.json();
    return mapGuardianResults(data, name);
  } catch (err) {
    console.error("Guardian API request threw:", err);
    return [];
  }
}

async function fetchFeed(feed) {
  if (feed.guardianSection) return fetchGuardianFeed(feed);
  const { name, url, linkMustInclude } = feed;
  try {
    const res = await fetch(url, {
      // Server-side cache: re-fetch at most every 5 minutes.
      next: { revalidate: 300 },
      headers: BOT_HEADERS,
    });
    if (!res.ok) {
      console.error(`[feed] ${name} (${url}) returned HTTP ${res.status}`);
      return [];
    }
    const xml = await res.text();
    const data = parser.parse(xml);
    const items = data?.rss?.channel?.item ?? [];
    const list = Array.isArray(items) ? items : [items];
    const mapped = list
      .map((item) => ({
        title: stripHtml(item.title ?? ""),
        link: typeof item.link === "string" ? item.link : item.link?.["#text"] ?? "",
        summary: truncate(stripHtml(item.description ?? "")),
        image: extractImage(item),
        source: name,
        published: item.pubDate ? new Date(item.pubDate).getTime() : 0,
        rawPubDate: item.pubDate ? String(item.pubDate) : null,
      }))
      .filter((item) => !linkMustInclude || item.link.includes(linkMustInclude));
    if (mapped.length === 0) {
      // Fetch "succeeded" but produced nothing usable -- log enough of the
      // raw response to tell whether it's empty, malformed, or filtered out.
      console.error(
        `[feed] ${name} (${url}) HTTP ${res.status} but 0 usable items. ` +
          `Raw items in XML: ${list.length}. First 300 chars: ${xml.slice(0, 300)}`
      );
    } else {
      console.log(`[feed] ${name}: ${mapped.length} items OK`);
    }
    return markUnreliableTimestamps(mapped);
  } catch (err) {
    console.error(`[feed] ${name} (${url}) threw:`, err);
    // A single dead feed should never take the page down.
    return [];
  }
}

// No single outlet may take more than this many of a page's display
// slots. Without this, ESPN's bulk re-stamped "just now" timestamps
// sort their entire feed above everyone else's honestly-dated stories,
// and Guardian/BBC content gets pushed below the cutoff -- transfer
// news was effectively invisible because of exactly this.
const MAX_ITEMS_PER_SOURCE = 12;

export function capPerSource(items, max = MAX_ITEMS_PER_SOURCE) {
  const counts = new Map();
  return items.filter((item) => {
    const n = counts.get(item.source) || 0;
    if (n >= max) return false;
    counts.set(item.source, n + 1);
    return true;
  });
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
  // Only apply the source cap when a page actually mixes sources -- a
  // single-source tab (like Transfers) should show everything it has.
  const sources = new Set(deduped.map((i) => i.source));
  const capped = sources.size > 1 ? capPerSource(deduped) : deduped;
  return { items: capped.slice(0, 40), fetchedAt: Date.now() };
}

// ---- All-sports pool (for My Feed) -----------------------------------------
// My Feed needs to search across every league in both sports -- not just
// the "top" hub -- so that following e.g. a Serie A club catches stories
// that only ever show up on the Serie A page's own feed. This fetches
// every league, tags each item with which sport it came from, then
// merges and dedupes across all of them.

export async function getAllNews() {
  const jobs = [];
  for (const [sportKey, sport] of Object.entries(SPORTS)) {
    for (const leagueKey of Object.keys(sport.leagues)) {
      jobs.push(
        getNews(sportKey, leagueKey).then(({ items }) =>
          items.map((item) => ({ ...item, sportKey }))
        )
      );
    }
  }

  const results = await Promise.all(jobs);
  const merged = results.flat();

  const seen = new Set();
  const deduped = merged.filter((item) => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => b.published - a.published);
  return deduped;
}

// ---- Backfilling images for ESPN-sourced items (Top 10 only) --------------
// ESPN's RSS feeds never include an image (confirmed directly against their
// live feeds). Their article PAGES do carry one, in the "og:image" tag meant
// for social-media link previews -- so for a small, bounded list like the
// Top 10 (never more than a handful of items), it's worth the extra page
// fetch per missing image. This is intentionally NOT used on the full
// Basketball/Soccer list pages or My Feed, which can have far more items:
// scraping dozens of article pages per request is slower and a bigger risk
// if a source is slow or blocks the request. A failure here just means that
// one story keeps its placeholder icon -- it never breaks the page.
async function fetchOgImage(url) {
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: BOT_HEADERS,
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m1 = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (m1) return m1[1];
    const m2 = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (m2) return m2[1];
    return null;
  } catch {
    return null;
  }
}

export async function backfillMissingImages(stories) {
  return Promise.all(
    stories.map(async (story) => {
      if (story.image) return story;
      const image = await fetchOgImage(story.link);
      return { ...story, image };
    })
  );
}
