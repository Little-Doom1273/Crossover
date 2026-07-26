import { getAllNews } from "../../lib/news";
import { getTodaysTopStories } from "../../lib/topStories";
import AutoRefresh from "../../components/AutoRefresh";

export const revalidate = 300;

export const metadata = { title: "Today's Top 10 — Crossover" };

function timeLabel(ts) {
  if (!ts) return "";
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

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

      {stories.length === 0 ? (
        <div className="empty-state">
          No stories loaded from the last 24 hours yet. Check back soon.
        </div>
      ) : (
        <div className="top-stories-list">
          {stories.map((story, index) => (
            <a
              key={story.link}
              href={story.link}
              target="_blank"
              rel="noopener noreferrer"
              className="top-story"
            >
              <span className="top-story-rank">{index + 1}</span>
              <div className="top-story-body">
                <div className="top-story-meta" data-sport={story.sportKey}>
                  <span className="sport-dot" aria-hidden="true" />
                  <span className="coverage-badge">
                    {story.sourceCount > 1
                      ? `${story.sourceCount} outlets covering`
                      : story.sources[0]}
                  </span>
                  <time>{timeLabel(story.published)}</time>
                </div>
                <h3>{story.headline}</h3>
                {story.summary && <p>{story.summary}</p>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
