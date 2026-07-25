import SportPage from "../../components/SportPage";

export const revalidate = 300;

export const metadata = { title: "Soccer — Crossover" };

export default function SoccerPage() {
  return <SportPage sportKey="soccer" />;
}
