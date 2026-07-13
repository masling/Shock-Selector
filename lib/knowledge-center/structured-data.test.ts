import assert from "node:assert/strict";
import test from "node:test";
import { calculationArticles } from "@/lib/knowledge-center/content";
import { buildKnowledgeArticleJsonLd } from "@/lib/knowledge-center/structured-data";

test("builds connected article, page, breadcrumb, FAQ and HowTo entities", () => {
  const article = calculationArticles[0];
  const jsonLd = buildKnowledgeArticleJsonLd(article, "en");
  const graph = jsonLd["@graph"];

  assert.equal(graph.length, 5);
  assert.equal(graph[0]["@type"], "BreadcrumbList");
  assert.equal(graph[1]["@type"], "WebPage");
  assert.equal(graph[2]["@type"], "Article");
  assert.equal(graph[3]["@type"], "FAQPage");
  assert.equal(graph[4]["@type"], "HowTo");
  const page = graph[1] as { mainEntity: { "@id": string } };
  const faq = graph[3] as { mainEntity: unknown[] };

  assert.equal(page.mainEntity["@id"], graph[2]["@id"]);
  assert.equal(faq.mainEntity.length, article.questions.length);
});

test("does not emit HowTo markup for non-calculation guidance", async () => {
  const { selectionGuideArticles } = await import("@/lib/knowledge-center/content");
  const jsonLd = buildKnowledgeArticleJsonLd(selectionGuideArticles[0], "en");

  assert.equal(jsonLd["@graph"].some((entity) => entity["@type"] === "HowTo"), false);
});
