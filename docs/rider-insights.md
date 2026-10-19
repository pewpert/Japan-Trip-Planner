# Rider insights behind Tōge

Tōge is for people who live in Japan, ride here regularly and read English. This note records
what shaped the product, what is verified, and what is an estimate. Check the "Confidence"
column before relying on a number.

## What local riders do (and the feature it drives)

| Habit | Feature |
|---|---|
| Leave early and be off the mountain before dark | Depart time, arrival time and sunset in the ride briefing |
| Plan around the weather, especially rain and cold at altitude | Day selector, verdict, elevation-adjusted temperatures, JMA rain radar link |
| Meet and rest at Michi-no-Eki (道の駅) | Rest-stop suggestions and POI layer |
| Fill up before the mountains; stations are sparse and close early | Fuel stops planned at 80% of tank range |
| Use expressways selectively; weekend ETC motorcycle discount exists | Road-mix assumption, weekend discount toggle |
| Many riders are on 125cc or smaller bikes | Expressway ban handled in routing and tolls |
| Share plans in group chats (LINE and similar) | "Copy plan to share" plain-text summary |
| Avoid bear and ice risk in the shoulder seasons | Bear-season and near-freezing advisories |
| Check road status for seasonal closures | JARTIC link and closure-season advisory |

## Numbers used in the model

| Fact | Value | Confidence |
|---|---|---|
| Motorcycle toll class (軽自動車等) | 0.8x the standard car rate | High |
| Standard car rate | about ¥24.6/km plus ¥150 terminal charge | Medium. From memory; NEXCO's site was unreachable from the build sandbox. Treat tolls as an estimate. |
| Weekend ETC motorcycle discount | 37.5% off single runs over 80 km, advance registration required | Medium. 2026 window 4 Apr to 29 Nov (Hokkaido to 31 Oct). Re-check each year. |
| 125cc and under on expressways | Not permitted | High |
| Temperature lapse | -0.6 C per 100 m | High (standard atmosphere approximation; real passes vary) |
| Sunset | NOAA sunrise equation | High |
| Bear season | May to July and October to December; 2025 was the worst year on record for injuries, mostly in Tohoku | Medium |
| Winter closures | Roughly November to April or May on high mountain roads | Medium. Always confirm on JARTIC or the prefectural road office. |
| Fuel range planning | 80% of tank range | A deliberate safety margin, not a published figure |

## Known limitations

- Weather comes from Open-Meteo and was verified only against mocked responses in development.
- The styled map needs a Google Maps key with billing enabled.
- Costs are estimates. The toll model does not know the actual expressway sections of your route.
- The seed routes and POI list are curated by hand and need a local rider's review.
