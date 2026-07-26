import { getAllNews } from "../../lib/news";
import { getTodaysTopStories } from "../../lib/topStories";
import AutoRefresh from "../../components/AutoRefresh";
import TopStoriesList from "../../components/TopStoriesList";

export const revalidate = 300;

export const metadata = { title: "Today's Top 10 — Crossover" };

export default async function TopStoriesPage() {
  const allNews = await getAllNews();
  const fetchedAt = Date.now();
  const stories = getTodaysTopStories(allNews, { limit: 10, hours: 24 });

  return (
    <div className="top-stories-page">
      <h1 className="sport-title top-stories-title">Today&rsquo;s Top 10</h1>
      <AutoRefresh fetchedAt={fetchedAt} />
      <p className="top-stories-intro">
        Ranked by how many outlets are covering each story right now — not
        by how important any single one says it is.
      </p>
      <TopStoriesList stories={stories} />
    </div>
  );
}
