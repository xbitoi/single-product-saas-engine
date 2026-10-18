import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { chromium } from "playwright";

export interface ScrapedProduct {
  title: string;
  description: string;
  price: number | null;
  compareAtPrice: number | null;
  currency: string;
  images: string[];
  features: string[];
  sourceUrl: string;
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function absolute(url: string, base: string): string {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

function parsePrice(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.,]/g, "").replace(/,/g, "");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) && value > 0 ? value : null;
}

async function fetchHtmlWithFetch(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
      redirect: "follow",
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchHtmlWithBrowser(url: string): Promise<string | null> {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ userAgent: UA });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1200);
    return await page.content();
  } catch {
    return null;
  } finally {
    if (browser) await browser.close().catch(() => undefined);
  }
}

function extractJsonLd($: cheerio.CheerioAPI): Partial<ScrapedProduct> {
  const out: Partial<ScrapedProduct> = {};
  const scripts = $('script[type="application/ld+json"]');
  scripts.each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }
    const nodes = Array.isArray(data) ? data : [data];
    for (const node of nodes) {
      if (!node || typeof node !== "object") continue;
      const obj = node as Record<string, unknown>;
      const type = obj["@type"];
      const isProduct =
        type === "Product" ||
        (Array.isArray(type) && type.includes("Product"));
      if (!isProduct) continue;

      if (typeof obj.name === "string") out.title = obj.name;
      if (typeof obj.description === "string") out.description = obj.description;

      const image = obj.image;
      if (typeof image === "string") out.images = [image];
      else if (Array.isArray(image)) {
        out.images = image.filter((i): i is string => typeof i === "string");
      }

      const offers = obj.offers as
        | Record<string, unknown>
        | Array<Record<string, unknown>>
        | undefined;
      const firstOffer = Array.isArray(offers) ? offers[0] : offers;
      if (firstOffer) {
        out.price = parsePrice(
          String(firstOffer.price ?? firstOffer.lowPrice ?? ""),
        );
        if (typeof firstOffer.priceCurrency === "string") {
          out.currency = firstOffer.priceCurrency;
        }
      }
    }
  });
  return out;
}

const BAD_IMG =
  /logo|icon|sprite|avatar|badge|banner|placeholder|payment|flag|social|star|rating|loading|spinner|pixel|1x1|spacer|skeleton|sale-badge|swatch|logo-mark/i;
const DESC_HINT =
  /description|product-detail|productdetail|detail-content|product-image|productimage|gallery|swiper|carousel|product-media|media-gallery/i;
const PRODUCT_HINT = /product|gallery|main|detail|media|image|thumb/i;

function imgUrl($: cheerio.CheerioAPI, el: AnyNode): string | null {
  const $el = $(el);
  const raw =
    $el.attr("src") ||
    $el.attr("data-src") ||
    $el.attr("data-lazy-src") ||
    $el.attr("data-original") ||
    $el.attr("data-zoom-image") ||
    $el.attr("data-large") ||
    $el.attr("data-image") ||
    $el.attr("srcset")?.split(",")[0]?.trim().split(/\s+/)[0] ||
    null;
  return raw || null;
}

/**
 * Scores an image so that images living inside the product description /
 * gallery area win over header, footer and logo images.
 */
function classifyImage(
  $: cheerio.CheerioAPI,
  el: AnyNode,
): { url: string; score: number } | null {
  const $el = $(el);
  const url = imgUrl($, el);
  if (!url) return null;

  const w = Number($el.attr("width") ?? 0);
  const h = Number($el.attr("height") ?? 0);
  const own = `${$el.attr("class") ?? ""} ${$el.attr("id") ?? ""} ${
    $el.attr("alt") ?? ""
  } ${url}`;
  if (BAD_IMG.test(own)) return null;
  if ((w && w < 100) || (h && h < 100)) return null;

  const ancestors = $el
    .parents()
    .slice(0, 5)
    .map((_, a) => `${$(a).attr("class") ?? ""} ${$(a).attr("id") ?? ""}`)
    .get()
    .join(" ");

  let score = 0;
  if (DESC_HINT.test(ancestors)) score += 3;
  if (PRODUCT_HINT.test(ancestors)) score += 1;
  return { url, score };
}

/**
 * Best-effort generic product scraper. Tries a plain fetch first, then a
 * headless browser for JS-rendered stores. Extracts via JSON-LD, OpenGraph and
 * DOM heuristics. Never throws for a parse miss - callers get partial data
 * and the dashboard lets the owner fill the gaps.
 */
export async function scrapeProduct(url: string): Promise<ScrapedProduct> {
  const html = (await fetchHtmlWithFetch(url)) ?? (await fetchHtmlWithBrowser(url));

  if (!html) {
    throw new Error(
      "Could not load the page (network blocked or store requires login).",
    );
  }

  const $ = cheerio.load(html);
  const ld = extractJsonLd($);

  const ogTitle = $('meta[property="og:title"]').attr("content");
  const ogDesc = $('meta[property="og:description"]').attr("content");
  const ogImage = $('meta[property="og:image"]').attr("content");
  const metaPrice = $('meta[property="product:price:amount"]').attr("content");
  const metaCurrency = $('meta[property="product:price:currency"]').attr("content");

  const title =
    ld.title ??
    (ogTitle || $("title").first().text().trim()) ??
    "";

  const description =
    ld.description ??
    ogDesc ??
    $('meta[name="description"]').attr("content") ??
    "";

  // Images: take only the product's own pictures (description / gallery area),
  // never the whole site (no logos, banners, icons). Ship 5-7 for the preview.
  const candidates: { url: string; score: number }[] = [];
  $("img, source").each((_, el) => {
    const found = classifyImage($, el);
    if (found) candidates.push(found);
  });
  // Stable sort: description-section images first, then the rest in DOM order.
  candidates.sort((a, b) => b.score - a.score);

  const ordered: string[] = [];
  const seen = new Set<string>();
  const add = (rawUrl: string) => {
    const abs = absolute(rawUrl, url);
    if (!seen.has(abs)) {
      seen.add(abs);
      ordered.push(abs);
    }
  };
  candidates.forEach((c) => add(c.url));
  (ld.images ?? []).forEach(add);
  if (ogImage) add(ogImage);

  const images = ordered.slice(0, 7);

  const price = ld.price ?? parsePrice(metaPrice);
  const currency = ld.currency ?? metaCurrency ?? "USD";

  // features: list items that look like selling points
  const features: string[] = [];
  $("main li, .features li, [class*='feature'] li, ul li").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text.length >= 4 && text.length <= 140 && !features.includes(text)) {
      features.push(text);
    }
  });

  return {
    title: title.trim(),
    description: (ld.description ?? description).trim(),
    price,
    compareAtPrice: null,
    currency,
    images,
    features: features.slice(0, 12),
    sourceUrl: url,
  };
}

export function isScraperAvailable(): boolean {
  return true;
}
