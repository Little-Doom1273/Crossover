// Followable teams, grouped by league.
//
// Names are the short/common forms most often used in headlines (e.g.
// "Lakers" not "Los Angeles Lakers"), since that's what the matching
// logic searches for inside RSS titles and summaries.
//
// A maintenance note for future updates: club/franchise lists shift
// over time (relegation, promotion, expansion). This reflects the
// 2026-27 season as best confirmed at time of writing. La Liga and
// Serie A are each missing one or more promoted clubs that hadn't
// been finalized yet -- add them once the season locks in.

export const FOLLOWABLE_LEAGUES = {
  nba: {
    label: "NBA",
    sportKey: "basketball",
    teams: [
      "Celtics", "Nets", "Knicks", "76ers", "Raptors",
      "Bulls", "Cavaliers", "Pistons", "Pacers", "Bucks",
      "Hawks", "Hornets", "Heat", "Magic", "Wizards",
      "Nuggets", "Timberwolves", "Thunder", "Trail Blazers", "Jazz",
      "Warriors", "Clippers", "Lakers", "Suns", "Kings",
      "Mavericks", "Rockets", "Grizzlies", "Pelicans", "Spurs",
    ],
  },
  wnba: {
    label: "WNBA",
    sportKey: "basketball",
    teams: [
      "Dream", "Sky", "Sun", "Wings", "Valkyries",
      "Fever", "Aces", "Sparks", "Lynx", "Liberty",
      "Mercury", "Fire", "Storm", "Tempo", "Mystics",
    ],
  },
  premierLeague: {
    label: "Premier League",
    sportKey: "soccer",
    teams: [
      "Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton",
      "Chelsea", "Coventry City", "Crystal Palace", "Everton", "Fulham",
      "Hull City", "Ipswich Town", "Leeds United", "Liverpool",
      "Manchester City", "Manchester United", "Newcastle United",
      "Nottingham Forest", "Sunderland", "Tottenham",
    ],
  },
  laLiga: {
    label: "La Liga",
    sportKey: "soccer",
    teams: [
      "Real Madrid", "Barcelona", "Atlético Madrid", "Athletic Bilbao",
      "Villarreal", "Real Betis", "Celta Vigo", "Rayo Vallecano",
      "Osasuna", "Real Sociedad", "Valencia", "Sevilla", "Getafe",
      "Alavés", "Espanyol", "Levante", "Elche", "Racing Santander",
      "Deportivo La Coruña",
    ],
  },
  serieA: {
    label: "Serie A",
    sportKey: "soccer",
    teams: [
      "Napoli", "Inter Milan", "Atalanta", "Juventus", "Bologna",
      "Roma", "Fiorentina", "Lazio", "AC Milan", "Torino",
      "Genoa", "Como", "Cagliari", "Udinese", "Lecce",
      "Parma", "Sassuolo",
    ],
  },
  mls: {
    label: "MLS",
    sportKey: "soccer",
    teams: [
      "Atlanta United", "Austin FC", "CF Montréal", "Charlotte FC",
      "Chicago Fire", "Colorado Rapids", "Columbus Crew", "D.C. United",
      "FC Cincinnati", "FC Dallas", "Houston Dynamo", "Inter Miami",
      "LA Galaxy", "LAFC", "Minnesota United", "Nashville SC",
      "New England Revolution", "New York City FC", "New York Red Bulls",
      "Orlando City", "Philadelphia Union", "Portland Timbers",
      "Real Salt Lake", "San Diego FC", "San Jose Earthquakes",
      "Seattle Sounders", "Sporting Kansas City", "St. Louis City",
      "Toronto FC", "Vancouver Whitecaps",
    ],
  },
};

// A few clubs get shortened so often in headlines that matching only
// the full name would miss real coverage. This maps a canonical team
// name (as it appears above) to extra strings worth checking for too.
const ALIASES = {
  "Manchester United": ["man utd", "man united"],
  "Manchester City": ["man city"],
  "Tottenham": ["spurs", "tottenham hotspur"],
  "Nottingham Forest": ["forest"],
};

function normalize(text) {
  return String(text).toLowerCase();
}

// Escape characters that mean something special in a regular expression,
// so a team name like "D.C. United" is matched literally.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Whole-word matching: the followed name must appear as its own word(s)
// in the headline text, not merely as a fragment inside a longer word.
// This is what stops following "Sun" (WNBA) from matching "Sunday", or
// "Forest" from matching "reforestation". Multi-word names ("Real
// Madrid") must appear as that exact word sequence.
function buildMatcher(needle) {
  return new RegExp(`\\b${escapeRegex(needle)}\\b`, "i");
}

// True if any followed team name/alias or free-text keyword appears as
// a whole word/phrase in the item's title or summary. Still a rough
// text match at heart -- a nickname that's also an ordinary English
// word (like "forest") can over-match when used as a plain word -- but
// far less trigger-happy than raw substring matching.
export function itemMatchesFollows(item, follows) {
  const haystack = normalize(`${item.title} ${item.summary || ""}`);
  const needles = [];

  for (const team of follows.teams || []) {
    needles.push(normalize(team));
    if (ALIASES[team]) {
      for (const alias of ALIASES[team]) needles.push(normalize(alias));
    }
  }
  for (const extra of follows.extras || []) {
    needles.push(normalize(extra));
  }

  return needles.some((needle) => needle && buildMatcher(needle).test(haystack));
}

export function filterNewsByFollows(items, follows) {
  const hasAnyFollow =
    (follows.teams && follows.teams.length > 0) ||
    (follows.extras && follows.extras.length > 0);
  if (!hasAnyFollow) return [];
  return items.filter((item) => itemMatchesFollows(item, follows));
}
