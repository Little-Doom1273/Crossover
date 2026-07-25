import { notFound } from "next/navigation";
import SportPage from "../../../components/SportPage";
import { SPORTS } from "../../../lib/news";

export const revalidate = 300;

export function generateStaticParams() {
  return Object.keys(SPORTS.soccer.leagues)
    .filter((k) => k !== "top")
    .map((league) => ({ league }));
}

export default function SoccerLeaguePage({ params }) {
  if (!SPORTS.soccer.leagues[params.league]) notFound();
  return <SportPage sportKey="soccer" leagueKey={params.league} />;
}
