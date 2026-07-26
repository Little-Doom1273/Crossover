// Generates a short narrative "what's happening today" briefing from the
// day's top-ranked stories, via the Anthropic API.
//
// This runs server-side during the homepage's cached render (revalidate:
// 300), so it regenerates at most once every 5 minutes regardless of
// traffic -- visitors always get the cached copy, never wait on a live
// AI call. Any failure returns null and the homepage simply renders
// without a briefing; this feature must never be able to take the
// homepage down.

const SYSTEM_PROMPT =
  "You write the daily briefing for Crossover, a basketball and soccer news site. " +
  "Given today's top headlines, write a single tight paragraph (3-5 sentences) telling " +
  "a reader what's happening in sports right now. Bold, confident, punchy -- like the " +
  "opening of a great sports newsletter. Weave the biggest stories together naturally; " +
  "don't just list them. Mention both sports if both are represented. No preamble, no " +
  "bullet points, no headers, no sign-off -- just the paragraph. Base it ONLY on the " +
  "headlines provided; do not add facts, scores, or context beyond them.";

export async function generateBriefing(stories) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey || !stories || stories.length === 0) return null;

  const storyLines = stories
    .slice(0, 10)
    .map(
      (s, i) =>
        `${i + 1}. [${s.sportKey}] ${s.headline}${s.summary ? ` — ${s.summary}` : ""}`
    )
    .join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 350,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Today's top stories:\n\n${storyLines}\n\nWrite today's briefing.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      console.error(`Briefing: Anthropic API returned ${res.status}: ${bodyText}`);
      return null;
    }

    const data = await res.json();
    const text = data?.content?.find((block) => block.type === "text")?.text?.trim();
    return text || null;
  } catch (err) {
    console.error("Briefing: request to Anthropic API threw:", err);
    return null;
  }
}
