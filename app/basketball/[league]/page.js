import { notFound } from "next/navigation";
import SportPage from "../../../components/SportPage";
import { SPORTS } from "../../../lib/news";

export const revalidate = 300;

export function generateStaticParams() {
  return Object.keys(SPORTS.basketball.leagues)
    .filter((k) => k !== "top")
    .map((league) => ({ league }));
}

export default function BasketballLeaguePage({ params }) {
  if (!SPORTS.basketball.leagues[params.league]) notFound();
  return <SportPage sportKey="basketball" leagueKey={params.league} />;
}
