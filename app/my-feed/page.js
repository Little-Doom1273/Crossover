import { getAllNews } from "../../lib/news";
import MyFeedClient from "../../components/MyFeedClient";

export const revalidate = 300;

export const metadata = { title: "My Feed — Crossover" };

export default async function MyFeedPage() {
  const allNews = await getAllNews();
  return <MyFeedClient allNews={allNews} />;
}
