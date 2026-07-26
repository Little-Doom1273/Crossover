import ExplainerBox from "../../components/ExplainerBox";

export const metadata = { title: "101 — Crossover" };

const basketballTerms = [
  {
    term: "The Draft",
    def: "Once a year, teams take turns picking new players — mostly college and international prospects who've never played pro ball in that league. Pick order runs opposite to the standings: the worst teams from last season generally pick earliest, which is designed to help bad teams get better. The NBA and WNBA each hold their own draft.",
  },
  {
    term: "Regular Season vs. Playoffs",
    def: "Every team plays a long regular season first, purely to determine who qualifies for the playoffs and in what order. The playoffs are single-elimination-style rounds (best-of-seven series in the NBA/WNBA) that produce that year's champion. A great regular season means nothing if a team doesn't perform in the playoffs.",
  },
  {
    term: "The Play-In Tournament",
    def: "A newer NBA/WNBA wrinkle: instead of the playoffs starting right after the regular season, teams ranked roughly 7th-10th in their conference play a short mini-tournament for the last couple of playoff spots. It's added late-season drama for teams that would've otherwise been eliminated already.",
  },
  {
    term: "Free Agency",
    def: "The offseason period when players whose contracts have ended are free to sign with any team, rather than being tied to their old one. This is when most of the biggest roster shakeups happen.",
  },
  {
    term: "Conference",
    def: "Basketball leagues split their teams into two groups — Eastern and Western Conference — mostly for scheduling and playoff seeding. A team only has to beat out the other 14-15 teams in its own conference to make the playoffs, not the whole league.",
  },
  {
    term: "MVP / Rookie of the Year",
    def: "End-of-season awards voted on by media panels. MVP (Most Valuable Player) goes to the league's standout performer; Rookie of the Year goes to the best first-year player.",
  },
  {
    term: "Luxury Tax / Apron",
    def: "NBA teams that spend above a certain salary threshold pay a financial penalty (the luxury tax), and spending even further above that triggers stricter roster-building restrictions (the \"apron\"). It's the league's way of stopping the richest teams from simply outspending everyone else indefinitely.",
  },
];

const soccerTerms = [
  {
    term: "League vs. Competition",
    def: "A league (Premier League, La Liga, Serie A, MLS) is a season-long round-robin where every team plays every other team, and the table decides the champion. A competition like the Champions League works differently — it's a mix of a group-style \"league phase\" and then straight knockout rounds, pulling in top clubs from multiple countries rather than being one country's domestic season.",
  },
  {
    term: "Relegation & Promotion",
    def: "In England, Spain, and Italy's top leagues, it's not just about winning — the bottom few teams in the table each season get relegated (dropped down to a lower division) and replaced by the best teams coming up from below. Every match, even between two mid-table teams, can matter enormously if a team is fighting to avoid the drop. MLS doesn't use this system — like most American leagues, its teams are fixed each year.",
  },
  {
    term: "The Ballon d'Or",
    def: "An annual award, voted on by a panel of journalists worldwide, for the single best player in the world that year — men's and women's versions are both awarded. It's the closest thing soccer has to an MVP, but it covers everyone in the sport globally, not just one league.",
  },
  {
    term: "Transfer Window",
    def: "Clubs can only permanently buy or sell players during set windows each year (roughly summer, plus a shorter one in January). A \"transfer fee\" is the price one club pays another to release a player from contract — separate from the player's own wages.",
  },
  {
    term: "The Table",
    def: "The league standings, ranked by points (3 for a win, 1 for a draw/tie, 0 for a loss). Goal difference — goals scored minus goals conceded — is the usual tiebreaker between teams level on points.",
  },
  {
    term: "Draw",
    def: "Soccer's word for a tie. Unlike a lot of American sports, plenty of league matches end in a draw and both teams simply take one point each — no overtime.",
  },
  {
    term: "Extra Time & Penalties",
    def: "In knockout competitions (like the Champions League or a cup final), a draw at full time isn't allowed to stand — the match gets 30 extra minutes played, and if it's still level, it comes down to a penalty shootout.",
  },
  {
    term: "Derby",
    def: "A match between two rival clubs, usually from the same city or region (Arsenal vs. Tottenham, for example). Table position often matters less than pure pride in these games.",
  },
];

export default function OneOhOnePage() {
  return (
    <div className="learn-page">
      <h1 className="sport-title learn-title">101</h1>
      <p className="learn-intro">
        New to one of these sports, or just want the vocabulary down? Here's
        the essentials — how each sport is structured, and the terms you'll
        see constantly in the headlines above.
      </p>

      <ExplainerBox />

      <section className="learn-section" data-accent="orange">
        <h2>Basketball</h2>
        <p className="learn-section-intro">
          The <strong>NBA</strong> (men's) and <strong>WNBA</strong>{" "}
          (women's) are the top professional leagues in the US, each with 30
          teams (soon more for the WNBA, which is actively expanding) playing
          an 82-game regular season from fall through spring, followed by the
          playoffs. <strong>NCAA</strong> basketball is the college game —
          unpaid-in-theory amateur athletes, most famous for its March
          postseason tournament ("March Madness") — and it's the main
          pipeline of talent into the NBA and WNBA draft every year.
        </p>
        <dl className="glossary">
          {basketballTerms.map(({ term, def }) => (
            <div className="glossary-item" key={term}>
              <dt>{term}</dt>
              <dd>{def}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="learn-section" data-accent="green">
        <h2>Soccer</h2>
        <p className="learn-section-intro">
          This site follows four domestic leagues —{" "}
          <strong>Premier League</strong> (England), <strong>La Liga</strong>{" "}
          (Spain), <strong>Serie A</strong> (Italy), and{" "}
          <strong>MLS</strong> (USA/Canada) — plus the{" "}
          <strong>Champions League</strong>, Europe's top club competition
          between the best teams from several countries' leagues, not just
          one. Each domestic league runs roughly August through May; MLS runs
          on more of a spring-to-fall calendar.
        </p>
        <dl className="glossary">
          {soccerTerms.map(({ term, def }) => (
            <div className="glossary-item" key={term}>
              <dt>{term}</dt>
              <dd>{def}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
