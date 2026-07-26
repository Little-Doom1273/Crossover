import Link from "next/link";
import { getAllNews, backfillMissingImages } from "../lib/news";
import { getTodaysTopStories } from "../lib/topStories";
import { generateBriefing } from "../lib/briefing";
import AutoRefresh from "../components/AutoRefresh";
import TopStoriesList from "../components/TopStoriesList";

export const revalidate = 300;

export default async function HomePage() {
  const allNews = await getAllNews();
  const fetchedAt = Date.now();
  const ranked = getTodaysTopStories(allNews, { limit: 10, hours: 24 });
  const stories = await backfillMissingImages(ranked);
  const briefing = await generateBriefing(stories);

  return (
    <>
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

      {briefing && (
        <section className="daily-briefing">
          <span className="explainer-badge">AI-powered</span>
          <h2>Today&rsquo;s Briefing</h2>
          <p>{briefing}</p>
        </section>
      )}

      <section className="home-top-stories">
        <div className="home-top-stories-header">
          <h2>Today&rsquo;s Top 10</h2>
          <Link href="/top-stories" className="home-top-stories-link">
            Full page →
          </Link>
        </div>
        <AutoRefresh fetchedAt={fetchedAt} />
        <TopStoriesList stories={stories} />
      </section>
    </>
  );
}
