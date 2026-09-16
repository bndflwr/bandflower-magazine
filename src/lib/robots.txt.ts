import type { APIRoute } from "astro";
// Dynamically generate robots.txt:sitemap URLs taken directly from astro.config.mjs's `site`,
// Don't write a dead domain, don't change this place when changing.
//
// Full station open crawl: Tags tab although "not indexed", but that is the noindex, follow with each page meta
// Control; here deliberately does not Disallow, otherwise the crawler even in the follow article link is blocked.
//
// Content Signals Default: Block training, retention search--
// search=yes can be indexed and provided
// ai-input=yes can be retrieved in real time to feed AI (RAG/grounding) so that your article can be referenced by the attached link
// ai-train=no is not available for training/fine-tuning models
// This is a Disallow (list will expire) that prefers a declaration rather than a technology blockade and deliberately does not list an AI bot.
// The three flags are replaced by docs/zh-Hant/seo-and-crawlers.md.
const robotsTxt = (sitemapURL: URL) => `\
User-agent: *
Content-Signal: search=yes, ai-input=no, ai-train=no
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(robotsTxt(sitemapURL), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
