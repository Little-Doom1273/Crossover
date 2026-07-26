function timeLabel(ts) {
  if (!ts) return "";
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TopStoriesList({ stories }) {
  if (stories.length === 0) {
    return (
      <div className="empty-state">
        No stories loaded from the last 24 hours yet. Check back soon.
      </div>
    );
  }

  return (
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
  );
}
