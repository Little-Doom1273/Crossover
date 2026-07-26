"use client";

import { useState } from "react";

export default function ExplainerBox() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(e) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setAnswer(data.answer);
      }
    } catch {
      setError("Couldn't reach the AI explainer right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="explainer-box">
      <span className="explainer-badge">AI-powered</span>
      <h2 className="explainer-label">Ask Crossover</h2>
      <p className="explainer-hint">
        Type any basketball or soccer rules question — "what's a screen?",
        "why is there no relegation in MLS?", anything.
      </p>
      <form onSubmit={ask} className="explainer-form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a rules question…"
          maxLength={300}
          className="explainer-input"
        />
        <button type="submit" className="explainer-submit" disabled={loading}>
          {loading ? "Asking…" : "Ask"}
        </button>
      </form>
      {error && <p className="explainer-error">{error}</p>}
      {answer && <p className="explainer-answer">{answer}</p>}
    </div>
  );
}
