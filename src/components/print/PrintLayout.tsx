"use client";

/**
 * PrintLayout — Full-page print document for motorcycle trip export.
 *
 * Designed as a real road document a rider can carry:
 *   Page 1:  Cover — trip overview, stats, cost summary
 *   Page 2+: One day per section (break-inside-avoid), schedule, stops, accommodation
 *   Last:    Practical tips + emergency info
 *
 * Rendered outside the sidebar so overflow-hidden never clips content.
 */

import { formatDuration, formatJPY, calculateTripCostRange } from "@/lib/costCalc";
import type { ItineraryDay, TripSettings, CostBreakdown } from "@/types/trip";
import type { SuggestedBreak } from "@/types/route";

export interface PrintData {
  itinerary: ItineraryDay[];
  origin: string;
  destination: string;
  waypoints: string[];
  settings: TripSettings;
  costBreakdown: CostBreakdown | null;
  suggestedBreaks: SuggestedBreak[];
  generatedAt: string; // ISO string
}

const ACCOMMODATION_EMOJI: Record<string, string> = {
  hotel: "🏨",
  ryokan: "🎎",
  guesthouse: "🏠",
  camping: "⛺",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  budget: "Budget",
  mid: "Mid-range",
  luxury: "Luxury",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Cover page ──────────────────────────────────────────────────────────────

function CoverPage({ data }: { data: PrintData }) {
  const { itinerary, origin, destination, settings, costBreakdown, suggestedBreaks } = data;

  const totalDays = itinerary.length;
  const totalDistanceKm = itinerary.reduce((s, d) => s + d.distanceKm, 0);
  const totalRidingMinutes = itinerary.reduce((s, d) => s + d.ridingTimeMinutes, 0);

  const range =
    costBreakdown
      ? calculateTripCostRange(costBreakdown.distanceKm, costBreakdown.durationMinutes, settings)
      : null;

  const totalTripLow = range ? range.low.total * totalDays : null;
  const totalTripHigh = range ? range.high.total * totalDays : null;

  return (
    <section className="print-page cover-page">
      {/* Header band */}
      <div className="cover-header">
        <div className="cover-logo">🏍️</div>
        <div>
          <h1 className="cover-title">Japan バイク Trip Planner</h1>
          <p className="cover-subtitle">Motorcycle Road Trip Document</p>
        </div>
        <div className="cover-date">
          Generated {formatDate(data.generatedAt)}
        </div>
      </div>

      {/* Route headline */}
      <div className="cover-route-bar">
        <span className="cover-route-origin">{origin}</span>
        <span className="cover-route-arrow">→</span>
        <span className="cover-route-dest">{destination}</span>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalDays}</div>
          <div className="stat-label">Days</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalDistanceKm.toLocaleString()}</div>
          <div className="stat-label">Total km</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatDuration(totalRidingMinutes)}</div>
          <div className="stat-label">Riding time</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{suggestedBreaks.length || "—"}</div>
          <div className="stat-label">Rest stops</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{settings.bikeEngineCC}cc</div>
          <div className="stat-label">Engine</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{DIFFICULTY_LABEL[settings.budget]}</div>
          <div className="stat-label">Budget tier</div>
        </div>
      </div>

      {/* Cost summary */}
      {range && totalTripLow !== null && totalTripHigh !== null && (
        <div className="cost-section">
          <h2 className="section-heading">Estimated Cost (per day × {totalDays} days)</h2>
          <table className="cost-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Low estimate / day</th>
                <th>High estimate / day</th>
                <th>Trip total (low)</th>
                <th>Trip total (high)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>⛽ Fuel</td>
                <td>{formatJPY(range.low.fuel)}</td>
                <td>{formatJPY(range.high.fuel)}</td>
                <td>{formatJPY(range.low.fuel * totalDays)}</td>
                <td>{formatJPY(range.high.fuel * totalDays)}</td>
              </tr>
              <tr>
                <td>🛣️ Tolls</td>
                <td>{formatJPY(range.low.tolls)}</td>
                <td>{formatJPY(range.high.tolls)}</td>
                <td>{formatJPY(range.low.tolls * totalDays)}</td>
                <td>{formatJPY(range.high.tolls * totalDays)}</td>
              </tr>
              <tr>
                <td>🏨 Accommodation</td>
                <td>{formatJPY(range.low.accommodation)}</td>
                <td>{formatJPY(range.high.accommodation)}</td>
                <td>{formatJPY(range.low.accommodation * totalDays)}</td>
                <td>{formatJPY(range.high.accommodation * totalDays)}</td>
              </tr>
              <tr className="cost-total-row">
                <td>Total</td>
                <td>{formatJPY(range.low.total)}</td>
                <td>{formatJPY(range.high.total)}</td>
                <td>{formatJPY(totalTripLow)}</td>
                <td>{formatJPY(totalTripHigh)}</td>
              </tr>
            </tbody>
          </table>
          <p className="cost-note">
            * Fuel assumes {settings.fuelEfficiency} km/L at ¥{settings.fuelPricePerLiter}/L.
            Tolls estimate ~40% expressway usage at {settings.bikeEngineCC >= 125 ? "¥27" : "¥15"}/km.
            Costs in JPY.
          </p>
        </div>
      )}

      {/* Waypoints / overview route */}
      {data.waypoints.length > 0 && (
        <div className="waypoints-section">
          <h2 className="section-heading">Route Overview</h2>
          <div className="waypoint-chain">
            <span className="waypoint-dot start">●</span>
            <span className="waypoint-name">{origin}</span>
            {data.waypoints.map((wp, i) => (
              <>
                <span key={`arrow-${i}`} className="waypoint-arrow">↓</span>
                <span key={`dot-${i}`} className="waypoint-dot mid">○</span>
                <span key={`name-${i}`} className="waypoint-name">{wp}</span>
              </>
            ))}
            <span className="waypoint-arrow">↓</span>
            <span className="waypoint-dot end">●</span>
            <span className="waypoint-name">{destination}</span>
          </div>
        </div>
      )}

      {/* Quick-glance day table */}
      <div className="day-overview-section">
        <h2 className="section-heading">Day-by-Day at a Glance</h2>
        <table className="day-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Title</th>
              <th>Route</th>
              <th>km</th>
              <th>Riding</th>
              <th>Stay</th>
            </tr>
          </thead>
          <tbody>
            {itinerary.map((day) => (
              <tr key={day.day}>
                <td className="day-num">Day {day.day}</td>
                <td>{day.title}</td>
                <td className="route-cell">{day.startLocation} → {day.endLocation}</td>
                <td className="num-cell">{day.distanceKm}</td>
                <td className="num-cell">{formatDuration(day.ridingTimeMinutes)}</td>
                <td>
                  {ACCOMMODATION_EMOJI[day.accommodation.type] ?? "🏨"}{" "}
                  {day.accommodation.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── Day card ─────────────────────────────────────────────────────────────────

function DayCard({ day, totalDays }: { day: ItineraryDay; totalDays: number }) {
  return (
    <section className="print-page day-page">
      {/* Day header band */}
      <div className="day-header">
        <div className="day-badge">Day {day.day} of {totalDays}</div>
        <h2 className="day-title">{day.title}</h2>
      </div>

      {/* Route strip */}
      <div className="route-strip">
        <div className="route-strip-item">
          <span className="route-strip-label">FROM</span>
          <span className="route-strip-value">{day.startLocation}</span>
        </div>
        <div className="route-strip-arrow">→</div>
        <div className="route-strip-item">
          <span className="route-strip-label">TO</span>
          <span className="route-strip-value">{day.endLocation}</span>
        </div>
        <div className="route-strip-divider" />
        <div className="route-strip-item">
          <span className="route-strip-label">DISTANCE</span>
          <span className="route-strip-value">{day.distanceKm} km</span>
        </div>
        <div className="route-strip-item">
          <span className="route-strip-label">RIDING TIME</span>
          <span className="route-strip-value">{formatDuration(day.ridingTimeMinutes)}</span>
        </div>
      </div>

      {/* Seasonal warning — prominent if present */}
      {day.seasonalWarning && (
        <div className="seasonal-warning">
          <span className="warning-icon">⚠️</span>
          <p>{day.seasonalWarning}</p>
        </div>
      )}

      <div className="day-body">
        {/* Key stops */}
        {day.keyStops.length > 0 && (
          <div className="day-section">
            <h3 className="day-section-heading">📍 Key Stops</h3>
            <ul className="stops-list">
              {day.keyStops.map((stop, i) => (
                <li key={i}>
                  <span className="stop-num">{i + 1}</span>
                  {stop}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Schedule */}
        {day.schedule && day.schedule.length > 0 && (
          <div className="day-section">
            <h3 className="day-section-heading">🕐 Day Schedule</h3>
            <table className="schedule-table">
              <tbody>
                {day.schedule.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? "schedule-even" : ""}>
                    <td className="schedule-time">{item.time}</td>
                    <td className="schedule-activity">{item.activity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* POIs / highlights */}
        {day.pois && day.pois.length > 0 && (
          <div className="day-section">
            <h3 className="day-section-heading">🎯 Highlights & POIs</h3>
            <div className="pois-grid">
              {day.pois.map((poi, i) => (
                <div key={i} className="poi-chip">{poi}</div>
              ))}
            </div>
          </div>
        )}

        {/* Accommodation */}
        <div className="day-section accommodation-section">
          <h3 className="day-section-heading">
            {ACCOMMODATION_EMOJI[day.accommodation.type] ?? "🏨"} Tonight&apos;s Stay
          </h3>
          <div className="accommodation-card">
            <div className="accommodation-name">{day.accommodation.name}</div>
            <div className="accommodation-type">
              {day.accommodation.type.charAt(0).toUpperCase() + day.accommodation.type.slice(1)}
              {day.accommodation.hasMotorcycleParking && (
                <span className="parking-badge">🏍️ Motorcycle parking</span>
              )}
            </div>
            {day.accommodation.parkingNote && (
              <div className="parking-note">🅿️ {day.accommodation.parkingNote}</div>
            )}
          </div>
        </div>
      </div>

      {/* Day footer with page indicator */}
      <div className="day-footer">
        Japan バイク Trip Planner · Day {day.day} of {totalDays}
      </div>
    </section>
  );
}

// ─── Practical tips page ──────────────────────────────────────────────────────

function TipsPage({ data }: { data: PrintData }) {
  const { suggestedBreaks, settings } = data;

  return (
    <section className="print-page tips-page">
      <div className="tips-header">
        <h2>🗾 Japan Riding — Practical Notes</h2>
      </div>

      <div className="tips-body">
        {/* Suggested breaks */}
        {suggestedBreaks.length > 0 && (
          <div className="tips-section">
            <h3>☕ Suggested Rest Stops</h3>
            <table className="breaks-table">
              <thead>
                <tr>
                  <th>Stop</th>
                  <th>After</th>
                  <th>Distance in</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {suggestedBreaks.map((brk, i) => (
                  <tr key={brk.id}>
                    <td>Break {i + 1}</td>
                    <td>{formatDuration(brk.timeIntoRideMinutes)}</td>
                    <td>{brk.distanceIntoRouteKm} km</td>
                    <td>{brk.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legal / safety */}
        <div className="tips-section">
          <h3>⚖️ Legal Requirements</h3>
          <ul className="tips-list">
            <li><strong>International Driving Permit (IDP)</strong> — Required for foreign visitors. Must carry alongside your home licence. Geneva Convention IDP accepted; JAF issues IDPs in Japan.</li>
            <li><strong>Helmets are mandatory</strong> — Required by law for all riders and pillion passengers. Full-face or open-face with visor recommended.</li>
            <li><strong>Vehicle Registration</strong> — Carry the shakken (車検) certificate if riding a rental; rental shop usually provides it.</li>
            <li><strong>Insurance</strong> — Confirm your rental includes third-party liability (jibaiseki hoken). Travel insurance rarely covers motorcycle accidents — get a specific rider.</li>
          </ul>
        </div>

        {/* Fuel & costs */}
        <div className="tips-section">
          <h3>⛽ Fuel & Costs</h3>
          <ul className="tips-list">
            <li><strong>Fuel type:</strong> Use レギュラー (Regular 90 octane) for most bikes under 400cc. ハイオク (Premium) for larger litre-class bikes — check your rental paperwork.</li>
            <li><strong>Your bike ({settings.bikeEngineCC}cc):</strong> Estimated {settings.fuelEfficiency} km/L at ¥{settings.fuelPricePerLiter}/L (regular). Fill up at Eneos, Idemitsu, or Shell stations.</li>
            <li><strong>Expressway (高速道路):</strong> Bikes {settings.bikeEngineCC >= 125 ? "125cc+" : "under 125cc"} pay {settings.bikeEngineCC >= 125 ? "standard car rates (~¥27/km)" : "reduced rates (~¥15/km)"}. ETC card is optional but convenient — get a reader from the rental shop.</li>
            <li><strong>Michi-no-Eki (道の駅):</strong> Roadside rest stations with free parking, toilets, local food, and often free Wi-Fi. Bikers&apos; favourite rest spots throughout Japan.</li>
          </ul>
        </div>

        {/* Emergency contacts */}
        <div className="tips-section">
          <h3>🆘 Emergency Numbers</h3>
          <table className="emergency-table">
            <tbody>
              <tr>
                <td><strong>Police</strong></td>
                <td>110</td>
                <td>Traffic accidents, crime</td>
              </tr>
              <tr>
                <td><strong>Ambulance / Fire</strong></td>
                <td>119</td>
                <td>Medical emergency</td>
              </tr>
              <tr>
                <td><strong>Japan Helpline</strong></td>
                <td>0570-000-911</td>
                <td>24h English assistance for foreigners</td>
              </tr>
              <tr>
                <td><strong>JAF Roadside</strong></td>
                <td>0570-00-8139</td>
                <td>Motorcycle breakdown assistance</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Seasonal notes */}
        <div className="tips-section">
          <h3>🌸 Seasonal Notes</h3>
          <ul className="tips-list">
            <li><strong>Spring (Mar–May):</strong> Cherry blossom season — beautiful but busy. Book accommodation 2–3 months ahead near popular spots.</li>
            <li><strong>Summer (Jun–Aug):</strong> Rainy season June–mid-July. Hot and humid; hydrate frequently. Mountain roads offer cooler relief.</li>
            <li><strong>Autumn (Sep–Nov):</strong> Best riding season. Clear skies, cool temperatures, autumn foliage (koyo) peaks Oct–Nov.</li>
            <li><strong>Winter (Dec–Feb):</strong> Many mountain passes and toll roads close due to snow. Check JARTIC (jartic.or.jp) for road closures before riding.</li>
          </ul>
        </div>

        {/* Useful apps */}
        <div className="tips-section">
          <h3>📱 Useful Apps & Resources</h3>
          <ul className="tips-list">
            <li><strong>Google Maps</strong> — Works well in Japan; offline maps available for tunnels.</li>
            <li><strong>JARTIC (jartic.or.jp)</strong> — Real-time expressway traffic and road closure info in Japanese.</li>
            <li><strong>Yahoo! カーナビ</strong> — Japan&apos;s best motorcycle-friendly navigation app with road closures.</li>
            <li><strong>PayPay / IC Card</strong> — Contactless payment at most convenience stores, fuel stations, and toll booths.</li>
            <li><strong>Google Translate (camera)</strong> — Point at Japanese signs, menus, road markings for instant translation.</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="tips-footer">
        Generated by Japan バイク Trip Planner · {formatDate(data.generatedAt)}
      </div>
    </section>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PrintLayout({ data }: { data: PrintData }) {
  return (
    <>
      {/* Screen-only toolbar (hidden during print) */}
      <div className="screen-toolbar">
        <div className="toolbar-inner">
          <span className="toolbar-title">🏍️ Japan バイク Trip Planner — Print Preview</span>
          <div className="toolbar-actions">
            <button className="toolbar-btn-print" onClick={() => window.print()}>
              🖨️ Print / Save PDF
            </button>
            <button className="toolbar-btn-close" onClick={() => window.close()}>
              ✕ Close
            </button>
          </div>
        </div>
      </div>

      {/* Print document */}
      <div className="print-document">
        <CoverPage data={data} />
        {data.itinerary.map((day) => (
          <DayCard key={day.day} day={day} totalDays={data.itinerary.length} />
        ))}
        <TipsPage data={data} />
      </div>

      {/* Styles — inline so the /print page is self-contained */}
      <style>{`
        /* ── Reset & base ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 11pt;
          color: #1a1a1a;
          background: #f0f0f0;
        }

        /* ── Screen toolbar ── */
        .screen-toolbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          background: #1a1a1a;
          color: white;
          z-index: 100;
          padding: 10px 20px;
        }
        .toolbar-inner {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .toolbar-title { font-size: 13px; font-family: sans-serif; }
        .toolbar-actions { display: flex; gap: 10px; }
        .toolbar-btn-print {
          background: #dc2626;
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-family: sans-serif;
        }
        .toolbar-btn-print:hover { background: #b91c1c; }
        .toolbar-btn-close {
          background: transparent;
          color: #aaa;
          border: 1px solid #444;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-family: sans-serif;
        }
        .toolbar-btn-close:hover { color: white; border-color: #888; }

        /* ── Document wrapper ── */
        .print-document {
          max-width: 900px;
          margin: 60px auto 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 0 20px;
        }

        /* ── Page ── */
        .print-page {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12);
          overflow: hidden;
        }

        /* ── Section heading ── */
        .section-heading {
          font-size: 10pt;
          font-family: sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #555;
          margin-bottom: 10px;
          padding-bottom: 4px;
          border-bottom: 1px solid #e5e7eb;
        }

        /* ═══════════════════════════════════════════
           COVER PAGE
        ═══════════════════════════════════════════ */
        .cover-header {
          background: #1a1a1a;
          color: white;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .cover-logo { font-size: 36px; }
        .cover-title {
          font-size: 20pt;
          font-family: sans-serif;
          font-weight: 700;
          color: white;
        }
        .cover-subtitle {
          font-size: 10pt;
          font-family: sans-serif;
          color: #aaa;
          margin-top: 2px;
        }
        .cover-date {
          margin-left: auto;
          font-size: 9pt;
          font-family: sans-serif;
          color: #888;
          white-space: nowrap;
        }

        .cover-route-bar {
          background: #dc2626;
          color: white;
          padding: 14px 32px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: sans-serif;
          font-size: 13pt;
          font-weight: 600;
        }
        .cover-route-arrow { color: rgba(255,255,255,0.6); font-size: 16pt; }
        .cover-route-origin, .cover-route-dest { flex: 1; }

        .cover-page > div:not(.cover-header):not(.cover-route-bar),
        .cover-page > .stats-grid,
        .cover-page > .cost-section,
        .cover-page > .waypoints-section,
        .cover-page > .day-overview-section {
          padding: 24px 32px;
          border-bottom: 1px solid #f3f4f6;
        }

        /* Stats grid */
        .stats-grid {
          padding: 24px 32px;
          border-bottom: 1px solid #f3f4f6;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }
        .stat-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px 8px;
          text-align: center;
        }
        .stat-value {
          font-size: 16pt;
          font-family: sans-serif;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.2;
        }
        .stat-label {
          font-size: 8pt;
          font-family: sans-serif;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 4px;
        }

        /* Cost table */
        .cost-section { padding: 24px 32px; border-bottom: 1px solid #f3f4f6; }
        .cost-table {
          width: 100%;
          border-collapse: collapse;
          font-family: sans-serif;
          font-size: 10pt;
        }
        .cost-table th {
          background: #f3f4f6;
          padding: 8px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 9pt;
          color: #555;
          border-bottom: 2px solid #e5e7eb;
        }
        .cost-table td {
          padding: 8px 10px;
          border-bottom: 1px solid #f3f4f6;
        }
        .cost-total-row td {
          font-weight: 700;
          background: #fef2f2;
          color: #dc2626;
          border-top: 2px solid #fee2e2;
        }
        .cost-note {
          font-size: 8.5pt;
          font-family: sans-serif;
          color: #999;
          margin-top: 8px;
          font-style: italic;
        }

        /* Waypoints */
        .waypoints-section { padding: 20px 32px; border-bottom: 1px solid #f3f4f6; }
        .waypoint-chain {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-family: sans-serif;
          font-size: 10pt;
        }
        .waypoint-dot { color: #dc2626; font-size: 8pt; margin-left: 4px; }
        .waypoint-dot.start, .waypoint-dot.end { color: #1a1a1a; font-size: 10pt; }
        .waypoint-name { margin-left: 8px; color: #1a1a1a; }
        .waypoint-arrow { color: #aaa; margin-left: 8px; font-size: 9pt; }

        /* Day overview table */
        .day-overview-section { padding: 20px 32px; }
        .day-table {
          width: 100%;
          border-collapse: collapse;
          font-family: sans-serif;
          font-size: 9.5pt;
        }
        .day-table th {
          background: #f3f4f6;
          padding: 7px 10px;
          text-align: left;
          font-size: 8.5pt;
          color: #666;
          border-bottom: 2px solid #e5e7eb;
        }
        .day-table td {
          padding: 8px 10px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: top;
        }
        .day-table tr:last-child td { border-bottom: none; }
        .day-num { font-weight: 700; color: #dc2626; white-space: nowrap; }
        .route-cell { color: #555; font-size: 9pt; }
        .num-cell { white-space: nowrap; font-variant-numeric: tabular-nums; }

        /* ═══════════════════════════════════════════
           DAY PAGE
        ═══════════════════════════════════════════ */
        .day-header {
          background: #1a1a1a;
          padding: 20px 28px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .day-badge {
          background: #dc2626;
          color: white;
          font-family: sans-serif;
          font-size: 9pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 4px 12px;
          border-radius: 99px;
          white-space: nowrap;
        }
        .day-title {
          color: white;
          font-family: sans-serif;
          font-size: 15pt;
          font-weight: 700;
        }

        .route-strip {
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          padding: 14px 28px;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .route-strip-item { display: flex; flex-direction: column; gap: 2px; }
        .route-strip-label {
          font-family: sans-serif;
          font-size: 7.5pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #999;
        }
        .route-strip-value {
          font-family: sans-serif;
          font-size: 11pt;
          font-weight: 600;
          color: #1a1a1a;
        }
        .route-strip-arrow { font-size: 16pt; color: #dc2626; font-weight: 300; }
        .route-strip-divider { width: 1px; height: 36px; background: #e5e7eb; margin: 0 8px; }

        .seasonal-warning {
          background: #fff7ed;
          border-left: 4px solid #f97316;
          padding: 10px 28px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-family: sans-serif;
          font-size: 10pt;
          color: #9a3412;
        }
        .warning-icon { font-size: 14pt; flex-shrink: 0; }

        .day-body { padding: 20px 28px; display: flex; flex-direction: column; gap: 20px; }

        .day-section {}
        .day-section-heading {
          font-family: sans-serif;
          font-size: 10pt;
          font-weight: 700;
          color: #374151;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #f3f4f6;
        }

        /* Stops list */
        .stops-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .stops-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-family: sans-serif;
          font-size: 10pt;
          color: #374151;
        }
        .stop-num {
          background: #dc2626;
          color: white;
          font-size: 8pt;
          font-weight: 700;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* Schedule table */
        .schedule-table { width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 10pt; }
        .schedule-table td { padding: 6px 10px; }
        .schedule-even { background: #f9fafb; }
        .schedule-time { font-weight: 700; color: #dc2626; white-space: nowrap; width: 70px; }
        .schedule-activity { color: #374151; }

        /* POIs grid */
        .pois-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .poi-chip {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 99px;
          padding: 4px 12px;
          font-family: sans-serif;
          font-size: 9pt;
          color: #374151;
        }

        /* Accommodation */
        .accommodation-section {}
        .accommodation-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .accommodation-name { font-family: sans-serif; font-size: 12pt; font-weight: 700; color: #1a1a1a; }
        .accommodation-type { font-family: sans-serif; font-size: 9.5pt; color: #666; display: flex; align-items: center; gap: 10px; }
        .parking-badge {
          background: #dcfce7;
          color: #15803d;
          padding: 2px 8px;
          border-radius: 99px;
          font-size: 8.5pt;
          font-weight: 600;
        }
        .parking-note { font-family: sans-serif; font-size: 9.5pt; color: #555; margin-top: 4px; }

        .day-footer {
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          padding: 8px 28px;
          font-family: sans-serif;
          font-size: 8pt;
          color: #aaa;
          text-align: right;
        }

        /* ═══════════════════════════════════════════
           TIPS PAGE
        ═══════════════════════════════════════════ */
        .tips-header {
          background: #1a1a1a;
          padding: 20px 32px;
          color: white;
        }
        .tips-header h2 { font-family: sans-serif; font-size: 15pt; font-weight: 700; }

        .tips-body { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }
        .tips-section {}
        .tips-section h3 {
          font-family: sans-serif;
          font-size: 10pt;
          font-weight: 700;
          color: #374151;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #f3f4f6;
        }
        .tips-list { list-style: none; display: flex; flex-direction: column; gap: 6px; padding-left: 2px; }
        .tips-list li {
          font-family: sans-serif;
          font-size: 9.5pt;
          color: #374151;
          padding-left: 14px;
          position: relative;
          line-height: 1.5;
        }
        .tips-list li::before { content: '·'; position: absolute; left: 2px; color: #dc2626; font-weight: 700; }

        .breaks-table, .emergency-table {
          width: 100%;
          border-collapse: collapse;
          font-family: sans-serif;
          font-size: 9.5pt;
        }
        .breaks-table th {
          background: #f3f4f6;
          padding: 7px 10px;
          text-align: left;
          font-size: 8.5pt;
          color: #666;
          border-bottom: 2px solid #e5e7eb;
        }
        .breaks-table td, .emergency-table td {
          padding: 7px 10px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: top;
        }
        .emergency-table td:nth-child(2) { font-weight: 700; color: #dc2626; white-space: nowrap; }

        .tips-footer {
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          padding: 10px 32px;
          font-family: sans-serif;
          font-size: 8pt;
          color: #aaa;
          text-align: center;
        }

        /* ═══════════════════════════════════════════
           PRINT MEDIA OVERRIDES
        ═══════════════════════════════════════════ */
        @media print {
          @page {
            size: A4;
            margin: 15mm 15mm 15mm 15mm;
          }

          body { background: white; }

          .screen-toolbar { display: none !important; }

          .print-document {
            max-width: none;
            margin: 0;
            padding: 0;
            gap: 0;
          }

          .print-page {
            border-radius: 0;
            box-shadow: none;
            page-break-after: always;
            break-after: page;
          }

          .print-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          /* Prevent breaks inside key elements */
          .day-section,
          .accommodation-card,
          .stops-list li,
          .schedule-table tr,
          .breaks-table tr,
          .day-table tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* Ensure headers stay with their content */
          .day-header,
          .tips-header,
          .cover-header {
            page-break-after: avoid;
            break-after: avoid;
          }

          /* Force colours to print */
          .cover-header, .day-header, .tips-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .cover-route-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .day-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .stop-num { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .cost-total-row td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .stat-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .parking-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .seasonal-warning { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .schedule-even { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </>
  );
}
