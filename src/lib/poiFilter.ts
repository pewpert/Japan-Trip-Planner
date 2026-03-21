import { BIKER_POIS } from "@/data/bikerPOIs";
import type { BikerPOI } from "@/types/route";

const TYPE_PRIORITY: Record<BikerPOI["type"], number> = {
  "famous-road": 1,
  "michi-no-eki": 2,
  "biker-cafe": 3,
  "scenic": 4,
  "accommodation": 5,
  "bike-rental": 6,
};

const REGION_KEYWORDS: Record<BikerPOI["region"], string[]> = {
  kanto: ["kanto", "tokyo", "nikko", "tochigi", "kanagawa", "saitama", "izu", "shizuoka", "chiba", "gunma", "ibaraki", "yamanashi"],
  chubu: ["chubu", "nagano", "gifu", "alps", "takayama", "shirakawa", "matsumoto", "kanazawa", "ishikawa", "toyama", "niigata"],
  kyushu: ["kyushu", "fukuoka", "kumamoto", "aso", "oita", "beppu", "yufuin", "kagoshima", "miyazaki", "nagasaki", "saga"],
  tohoku: ["tohoku", "iwate", "miyagi", "akita", "yamagata", "fukushima", "aomori"],
  hokkaido: ["hokkaido", "sapporo", "biei", "asahikawa", "kushiro", "hakodate", "wakkanai"],
  kansai: ["kansai", "osaka", "kyoto", "nara", "kobe", "wakayama", "mie", "hyogo"],
  shikoku: ["shikoku", "kochi", "ehime", "kagawa", "tokushima"],
};

export function getRelevantPOIs(
  regionsToInclude: string | undefined,
  season: string,
  interests: string[],
  limit = 20
): BikerPOI[] {
  let pois = [...BIKER_POIS];

  // Filter by region if specified
  if (regionsToInclude?.trim()) {
    const searchText = regionsToInclude.toLowerCase();
    const matchedRegions = (Object.entries(REGION_KEYWORDS) as [BikerPOI["region"], string[]][])
      .filter(([, keywords]) => keywords.some((kw) => searchText.includes(kw)))
      .map(([region]) => region);

    if (matchedRegions.length > 0) {
      pois = pois.filter((p) => matchedRegions.includes(p.region));
    }
  }

  // Exclude seasonal mountain passes in winter
  if (season === "winter") {
    pois = pois.filter((p) => !p.tags.includes("mountain-pass-seasonal"));
  }

  // Sort: boost onsen-tagged POIs if user selected onsen interest
  const wantsOnsen = interests.includes("onsen");

  pois.sort((a, b) => {
    // Onsen boost
    const aOnsen = wantsOnsen && a.tags.includes("onsen") ? -1 : 0;
    const bOnsen = wantsOnsen && b.tags.includes("onsen") ? -1 : 0;
    if (aOnsen !== bOnsen) return aOnsen - bOnsen;

    // Type priority
    return (TYPE_PRIORITY[a.type] ?? 99) - (TYPE_PRIORITY[b.type] ?? 99);
  });

  return pois.slice(0, limit);
}
