// Rule-based "today's top stories": headlines are grouped into clusters
// of "probably the same underlying story," and clusters get ranked by
// how many *different outlets* are covering them right now. More
// independent coverage of the same story = ranked higher.
//
// This is a proxy for importance, not a measurement of it. It will
// sometimes miss something genuinely big that only one outlet wrote
// about, and it can occasionally lump together two headlines that
// merely share a lot of generic wording. That tradeoff is the cost of
// "free and rule-based" instead of having something (a person, or an
// AI model) actually read and judge each story.

const STOPWORDS = new Set([
  // function words
  "a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to", "for",
  "with", "from", "by", "as", "is", "are", "was", "were", "be", "been",
  "being", "it", "its", "this", "that", "these", "those", "his", "her",
  "their", "our", "your", "my", "he", "she", "they", "we", "you", "i",
  "who", "what", "when", "where", "why", "how", "not", "no", "yes",
  "after", "before", "over", "under", "into", "out", "up", "down", "off",
  "about", "against", "between", "during", "without", "within", "vs", "v",
  "said", "says", "say", "will", "would", "could", "should", "can", "has",
  "have", "had",
  // generic sports-recap words -- common to almost every headline, so they
  // don't actually help tell two DIFFERENT stories apart from each other.
  "win", "wins", "won", "beat", "beats", "beaten", "draw", "draws", "drew",
  "lose", "loses", "lost", "loss", "victory", "defeat", "clash", "clashes",
  "match", "matches", "game", "games", "goal", "goals", "point", "points",
  "score", "scores", "scored", "late", "star", "news", "update", "past",
  "put",
]);

function significantWords(text) {
  return new Set(
    String(text)
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
  );
}

// Overlap coefficient: intersection size divided by the SMALLER of the
// two sets, rather than their union. Plain Jaccard (intersection/union)
// under-counts matches here, because two outlets' headlines about the
// same event often share only their core proper nouns (team names, a
// player) while every other word -- the verb, the flourish -- differs.
// That's a small intersection against a comparatively large union, so
// genuine matches often scored too low under Jaccard. The overlap
// coefficient instead asks "does most of the smaller headline's
// content show up in the other one too," which better fits short,
// variably-worded text like headlines.
function overlapCoefficient(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const w of setA) {
    if (setB.has(w)) intersection++;
  }
  return intersection / Math.min(setA.size, setB.size);
}

const SIMILARITY_THRESHOLD = 0.3;

export function clusterStories(items) {
  const clusters = []; // { items: [], sources: Set, signatures: Set[] }

  for (const item of items) {
    const sig = significantWords(`${item.title} ${item.summary || ""}`);
    let bestCluster = null;
    let bestScore = 0;

    for (const cluster of clusters) {
      // Single-linkage: compare against each existing member individually
      // and take the best match, rather than against one pooled/merged
      // signature. Pooling would keep growing with every new member's
      // flourish words, making the cluster progressively harder to match
      // against as it fills up -- single-linkage avoids that drift.
      for (const memberSig of cluster.signatures) {
        const score = overlapCoefficient(sig, memberSig);
        if (score > bestScore) {
          bestScore = score;
          bestCluster = cluster;
        }
      }
    }

    if (bestCluster && bestScore >= SIMILARITY_THRESHOLD) {
      bestCluster.items.push(item);
      bestCluster.sources.add(item.source);
      bestCluster.signatures.push(sig);
    } else {
      clusters.push({
        items: [item],
        sources: new Set([item.source]),
        signatures: [sig],
      });
    }
  }

  return clusters;
}

export function getTodaysTopStories(allItems, { limit = 10, hours = 24 } = {}) {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const recent = allItems.filter((item) => item.published >= cutoff);

  const clusters = clusterStories(recent);

  const ranked = clusters
    .map((cluster) => {
      const sorted = [...cluster.items].sort((a, b) => b.published - a.published);
      const top = sorted[0];
      return {
        headline: top.title,
        link: top.link,
        summary: top.summary,
        sportKey: top.sportKey,
        published: top.published,
        sourceCount: cluster.sources.size,
        sources: [...cluster.sources],
      };
    })
    .sort((a, b) => {
      if (b.sourceCount !== a.sourceCount) return b.sourceCount - a.sourceCount;
      return b.published - a.published;
    });

  return ranked.slice(0, limit);
}
