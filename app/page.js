import Link from "next/link";

export default function HomePage() {
  return (
    <div className="home-hero">
      <h1>
        Every headline.
        <br />
        Both games.
      </h1>
      <p className="tagline">
        Basketball and soccer news pulled live from major outlets around the
        world — refreshed automatically every five minutes.
      </p>
      <div className="sport-doors">
        <Link href="/basketball" className="sport-door door-basketball">
          <span className="door-bar" aria-hidden="true" />
          <h2>Basketball</h2>
          <p>NBA · WNBA · NCAA</p>
        </Link>
        <Link href="/soccer" className="sport-door door-soccer">
          <span className="door-bar" aria-hidden="true" />
          <h2>Soccer</h2>
          <p>Premier League · La Liga · Champions League · Serie A · MLS</p>
        </Link>
      </div>
    </div>
  );
}
