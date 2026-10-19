import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

const CHECKS = [
  { item: "Brakes", detail: "lever feel, pad wear, fluid level" },
  { item: "Tyres", detail: "pressure, tread depth, cracks" },
  { item: "Lights", detail: "headlight, brake light, indicators" },
  { item: "Fuel & oil", detail: "and know where the next station is" },
];

/** 日常点検 — the walk-around before every ride. */
export function PreRideCheck() {
  return (
    <Card className="flex flex-col gap-4">
      <SectionHeading>Before you roll · 日常点検</SectionHeading>
      <ul className="flex flex-col gap-3">
        {CHECKS.map(({ item, detail }) => (
          <li key={item} className="flex items-baseline gap-3 text-[13px] leading-relaxed">
            <span className="w-20 shrink-0 font-medium text-ink">{item}</span>
            <span className="text-ink-2">{detail}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs leading-relaxed text-ink-3">
        Kyoto Prefectural Police figures put 57% of single-bike crashes on tours at serious injury
        or worse. A two-minute walk-around is the cheapest insurance you have.
      </p>
    </Card>
  );
}
