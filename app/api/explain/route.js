// Server-only route: this file never ships to the browser, so it's safe to
// read the API key here. The client (components/ExplainerBox.js) only ever
// talks to this same-origin route, never to Anthropic directly.

const SYSTEM_PROMPT =
  "You are the 101 explainer for Crossover, a basketball and soccer news site. " +
  "Answer questions about basketball and soccer rules, terminology, leagues, positions, " +
  "and how the sports work. Keep answers short -- 2 to 4 sentences, punchy and confident, " +
  "no hedging or filler. If a question is about live news, current scores, standings, " +
  "specific real people, or anything outside general rules and concepts, say that's outside " +
  "what you cover here and point them to the site's news pages instead. Stay strictly on " +
  "basketball and soccer rules/structure -- do not answer questions unrelated to those two sports.";

export async function POST(request) {
  let question = "";
  try {
    const body = await request.json();
    question = typeof body?.question === "string" ? body.question.trim() : "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!question) {
    return Response.json({ error: "Ask a question first." }, { status: 400 });
  }
  if (question.length > 300) {
    return Response.json({ error: "Keep it under 300 characters." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "The AI explainer isn't set up yet -- missing API key." },
      { status: 500 }
    );
  }

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
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!res.ok) {
      // Log the real reason server-side (visible in Vercel's Runtime Logs),
      // since the visitor-facing message stays generic on purpose.
      const bodyText = await res.text().catch(() => "");
      console.error(`Anthropic API returned ${res.status}: ${bodyText}`);
      return Response.json(
        { error: `The AI explainer got an error response (status ${res.status}). Try again.` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const answer = data?.content?.find((block) => block.type === "text")?.text?.trim();

    if (!answer) {
      console.error("Anthropic API responded but no text block was found:", JSON.stringify(data));
      return Response.json(
        { error: "Didn't get a usable answer. Try rephrasing." },
        { status: 502 }
      );
    }

    return Response.json({ answer });
  } catch (err) {
    console.error("Request to Anthropic API threw an exception:", err);
    return Response.json(
      { error: "Couldn't reach Claude's API right now -- try again in a moment." },
      { status: 502 }
    );
  }
}
