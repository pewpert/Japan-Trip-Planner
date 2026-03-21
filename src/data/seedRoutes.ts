export interface SeedRoute {
  id: string;
  name: string;
  durationDays: number;
  distanceKm: number;
  tagline: string;
  tooltipDescription: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  region: "kanto" | "chubu" | "kyushu";
  origin: string;
  destination: string;
  waypoints: string[];
}

export const SEED_ROUTES: SeedRoute[] = [
  {
    id: "nikko-oku-nikko",
    name: "Nikko & Oku-Nikko Ridge",
    durationDays: 3,
    distanceKm: 490,
    difficulty: "intermediate",
    region: "kanto",
    tagline: "World Heritage shrines, 48 switchbacks & volcanic lakes",
    tooltipDescription:
      "A loop from Tokyo into Tochigi Prefecture. Famous for the 48-bend Irohazaka switchback climb, Lake Chuzenji, Kegon Falls, and the Nikko Tosho-gu World Heritage Shrine. Overnight at Kinugawa Onsen. Intermediate rider recommended for the mountain sections.",
    origin: "Ikebukuro, Tokyo",
    destination: "Ikebukuro, Tokyo",
    waypoints: ["Nikko, Tochigi", "Chuzenji, Tochigi", "Kinugawa Onsen, Tochigi"],
  },
  {
    id: "izu-peninsula",
    name: "Izu Peninsula Loop",
    durationDays: 3,
    distanceKm: 380,
    difficulty: "beginner",
    region: "kanto",
    tagline: "Coastal curves, volcanic scenery & fresh seafood",
    tooltipDescription:
      "A beginner-friendly loop south-west of Tokyo along the Izu coastline. Highlights include Atami, Ito, the rugged west coast road to Shimoda, and volcanic interior scenery. Good roads, great seafood, and manageable daily distances — perfect for a first Japan ride.",
    origin: "Mishima, Shizuoka",
    destination: "Mishima, Shizuoka",
    waypoints: ["Atami, Shizuoka", "Shimoda, Shizuoka", "Dogashima, Shizuoka"],
  },
  {
    id: "japanese-alps",
    name: "Japanese Alps Crossing",
    durationDays: 5,
    distanceKm: 750,
    difficulty: "advanced",
    region: "chubu",
    tagline: "Mountain pass riding from the Alps to the Sea of Japan",
    tooltipDescription:
      "A point-to-point crossing of central Honshu from Matsumoto to Kanazawa. Traverses the Hida Mountains via Norikura, through UNESCO-listed Shirakawa-go village, and into Takayama old town. Some passes are exposed at altitude and require advanced skill. Partially closes in deep winter.",
    origin: "Matsumoto, Nagano",
    destination: "Kanazawa, Ishikawa",
    waypoints: ["Takayama, Gifu", "Shirakawa-go, Gifu", "Gero Onsen, Gifu"],
  },
  {
    id: "kyushu-aso",
    name: "Kyushu Aso Caldera Loop",
    durationDays: 4,
    distanceKm: 600,
    difficulty: "intermediate",
    region: "kyushu",
    tagline: "Ride across an active volcano, hot springs & rural Kyushu",
    tooltipDescription:
      "Based out of Fukuoka, this loop heads south to the world's largest volcanic caldera at Mt. Aso. Circuits the caldera rim road, drops through rural Kumamoto, and finishes through Beppu and Yufuin's famous onsen steam vents. Always check volcano activity alerts before riding the Aso Panorama Line.",
    origin: "Fukuoka, Fukuoka",
    destination: "Fukuoka, Fukuoka",
    waypoints: ["Mount Aso, Kumamoto", "Beppu, Oita", "Yufuin, Oita"],
  },
];
