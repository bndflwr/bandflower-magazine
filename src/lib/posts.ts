// 文章集合的共用取用層：排序與「有效描述」收斂成單一來源，
// 避免 getCollection('blog')+sort 與 description fallback 在各頁各寫一份。
import { getCollection, type CollectionEntry } from "astro:content";
import { descriptionFromBody } from "./description";

// 發布日新→舊的比較器。整集合走 getSortedPosts；過濾後的子集（如某 tag 的文章）
// 直接 .sort(byPubDateDesc) 共用同一條規則。
export const byPubDateDesc = (
  a: CollectionEntry<"blog">,
  b: CollectionEntry<"blog">,
) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

// 全站文章的單一取用入口：抓 blog collection 並依發布日新→舊排序。
export async function getSortedPosts(): Promise<CollectionEntry<"blog">[]> {
  return (await getCollection("blog")).sort(byPubDateDesc);
}

// 文章的有效描述：優先 frontmatter description，缺則用內文摘要 fallback。
// 頁面 meta、卡片、RSS、llms 共用，確保各處一致。
export function postDescription(post: CollectionEntry<"blog">): string {
  return post.data.description ?? descriptionFromBody(post.body ?? "");
}
