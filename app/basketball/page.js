import SportPage from "../../components/SportPage";

export const revalidate = 300;

export const metadata = { title: "Basketball — Crossover" };

export default function BasketballPage() {
  return <SportPage sportKey="basketball" />;
}
