export interface WeatherPoint {
  coordinates: { lat: number; lng: number };
  locationName: string;
  current: WeatherCondition;
  forecast: WeatherCondition[]; // next 7 days
}

export interface WeatherCondition {
  date: string; // ISO date string
  tempMin: number; // Celsius
  tempMax: number; // Celsius
  precipitationMm: number;
  windSpeedKmh: number;
  weatherCode: number; // WMO weather code
  description: string;
  icon: string; // emoji or icon name
  isRideSafe: boolean; // derived: false if heavy rain/snow/storm
}
