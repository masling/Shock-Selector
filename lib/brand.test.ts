import assert from "node:assert/strict";
import test from "node:test";
import { brand } from "@/lib/brand";
import { locales } from "@/lib/i18n/config";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { calculationArticles } from "@/lib/knowledge-center/content";
import { buildKnowledgeArticleJsonLd } from "@/lib/knowledge-center/structured-data";
import { getLocalizedHref } from "@/lib/i18n/routing";

test("website identity uses EKD and the confirmed company display name", () => {
  assert.equal(brand.name, "EKD");
  assert.equal(brand.company, "力科丹普");
  assert.equal(brand.website, "https://www.vibroabsorber.com");
  assert.equal(brand.whatsapp.href, "https://wa.me/8618069449700");
  assert.equal(brand.whatsapp.displayNumber.replace(/\D/g, ""), "8618069449700");
});

for (const locale of locales) {
  test(`${locale} company copy and article publisher use the same identity`, () => {
    const copy = getSiteCopy(locale);
    const whatsapp = copy.contact.socialChannels.filter((channel) => channel.label === "WhatsApp");
    assert.deepEqual(whatsapp, [{ label: "WhatsApp", value: brand.whatsapp.displayNumber, href: brand.whatsapp.href }]);
    const footerWhatsapp = copy.footer.groups.flatMap((group) => group.links).find((link) => link.label === "WhatsApp");
    assert.equal(footerWhatsapp?.href, brand.whatsapp.href);
    assert.equal(getLocalizedHref(locale, brand.whatsapp.href), brand.whatsapp.href);
    const paragraphs = copy.about.paragraphs.join(" ");
    assert.ok(paragraphs.includes(brand.company));
    assert.ok(paragraphs.includes(brand.name));
    assert.doesNotMatch(JSON.stringify(copy), /OVICTOR|奥维达|亿凯达|Jiangsu EKD/i);
    assert.doesNotMatch(JSON.stringify([copy.about, copy.home.trustSection]), /30\+|15\+|ISO9001|ROHS|\bCE\b/);

    const jsonLd = buildKnowledgeArticleJsonLd(calculationArticles[0], locale);
    const article = jsonLd["@graph"].find((entity) => entity["@type"] === "Article");
    assert.ok(article);
    const publisher = article.publisher as Record<string, unknown>;
    assert.equal(publisher.name, brand.company);
    assert.deepEqual(publisher.brand, { "@type": "Brand", name: brand.name });
    assert.equal(publisher.legalName, undefined);
  });
}
